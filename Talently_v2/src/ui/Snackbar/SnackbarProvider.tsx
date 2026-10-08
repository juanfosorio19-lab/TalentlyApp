import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Snackbar, type SnackbarAction, type SnackbarPlacement, type SnackbarTone } from './Snackbar';

/** Sin acción (Toast) se va a los 4 s; con acción, a los 8 s o al tocarla. */
export const SNACKBAR_DURATION = { toast: 4000, action: 8000 } as const;

// Una región viva que se monta ya con su texto no siempre se anuncia: las
// regiones están montadas desde antes y el texto llega un momento después.
const ANNOUNCE_DELAY_MS = 100;

export interface ShowSnackbarOptions {
    message: ReactNode;
    tone?: SnackbarTone;
    /** «Deshacer» o «Reintentar». Tocarla también cierra el Snackbar. */
    action?: Pick<SnackbarAction, 'label' | 'onAction'>;
    /**
     * Para este aviso, en vez del lugar que fija el provider. Con un
     * `SnackbarOutlet` montado (CTA fijo u hoja con pie) va siempre estático
     * en él, justo encima del botón.
     */
    placement?: Exclude<SnackbarPlacement, 'static'>;
}

export interface SnackbarApi {
    /** Muestra un aviso; si había otro, lo reemplaza (de a uno). */
    show: (options: ShowSnackbarOptions) => void;
    /** Cierra el aviso visible. */
    hide: () => void;
}

const SnackbarContext = createContext<SnackbarApi | null>(null);

interface OutletSlot {
    register: (id: string) => () => void;
    /** El outlet que muestra el aviso: el último montado. */
    activeId: string | null;
    /** El aviso actual en su versión estática (`tl-snackbar--static`). */
    node: ReactNode;
}

const SnackbarOutletContext = createContext<OutletSlot | null>(null);

export interface SnackbarProviderProps {
    children: ReactNode;
    /**
     * Lugar por defecto: `tabbar` en las pestañas; `no-tabbar` en pantallas
     * apiladas sin TabBar ni CTA fijo; `web` en el backoffice. Con un CTA
     * fijo o una hoja con pie, el aviso va en su `SnackbarOutlet`.
     */
    placement?: Exclude<SnackbarPlacement, 'static'>;
    /** `false`: se dibuja en su lugar (catálogo, marcos de 390) en vez de en `document.body`. */
    portal?: boolean;
    /**
     * Dónde se dibuja con `portal` (por defecto `document.body`). El WebShell
     * pasa su `.tl-web`: así `tl-snackbar--web` se alinea con el contenido y
     * nunca queda sobre la SideNav.
     */
    container?: HTMLElement | null;
}

type Current = ShowSnackbarOptions & { id: number };

/**
 * Da `useSnackbar()` a la app y dibuja el único Snackbar visible: en el
 * `SnackbarOutlet` montado más reciente o, si no hay, flotando según
 * `placement`. Lo anuncia desde dos regiones vivas siempre montadas.
 */
export function SnackbarProvider({ children, placement = 'tabbar', portal = true, container }: SnackbarProviderProps) {
    const [current, setCurrent] = useState<Current | null>(null);
    // Con el foco en su acción (teclado o lector de pantalla), el tiempo se detiene.
    const [pausedId, setPausedId] = useState<number | null>(null);
    const [announcedId, setAnnouncedId] = useState<number | null>(null);
    const [outlets, setOutlets] = useState<string[]>([]);
    const nextId = useRef(1);
    const snackRef = useRef<HTMLDivElement>(null);
    // Dónde estaba el foco antes de entrar al aviso, para devolverlo cuando se va.
    const returnFocusRef = useRef<HTMLElement | null>(null);

    // Si el foco está en el aviso que se va, vuelve a donde estaba (si no, caería en <body>).
    const releaseFocus = useCallback(() => {
        const el = snackRef.current;
        const focused = document.activeElement;
        if (!el || !(focused instanceof Node) || !el.contains(focused)) return;
        const back = returnFocusRef.current;
        returnFocusRef.current = null;
        if (back?.isConnected) back.focus({ preventScroll: true });
    }, []);

    const hide = useCallback(() => {
        releaseFocus();
        setCurrent(null);
    }, [releaseFocus]);
    const show = useCallback(
        (options: ShowSnackbarOptions) => {
            releaseFocus();
            setCurrent({ ...options, id: nextId.current++ });
        },
        [releaseFocus],
    );
    const api = useMemo<SnackbarApi>(() => ({ show, hide }), [show, hide]);

    useEffect(() => {
        if (!current || pausedId === current.id) return;
        const { id } = current;
        const timer = window.setTimeout(
            () => {
                releaseFocus();
                setCurrent((c) => (c?.id === id ? null : c));
            },
            current.action ? SNACKBAR_DURATION.action : SNACKBAR_DURATION.toast,
        );
        return () => window.clearTimeout(timer);
    }, [current, pausedId, releaseFocus]);

    useEffect(() => {
        if (!current) return;
        const { id } = current;
        const timer = window.setTimeout(() => setAnnouncedId(id), ANNOUNCE_DELAY_MS);
        return () => window.clearTimeout(timer);
    }, [current]);
    // Vacío al cambiar de aviso: el mismo texto dos veces seguidas también se anuncia.
    const announced = current && announcedId === current.id ? current : null;

    const register = useCallback((id: string) => {
        setOutlets((list) => [...list, id]);
        return () => setOutlets((list) => list.filter((x) => x !== id));
    }, []);
    const activeOutlet = outlets[outlets.length - 1] ?? null;

    const render = (where: SnackbarPlacement) => {
        if (!current) return null;
        const { id, message, tone, action } = current;
        return (
            <Snackbar
                key={id}
                ref={snackRef}
                message={message}
                tone={tone}
                placement={where}
                announce={false}
                action={
                    action && {
                        label: action.label,
                        onAction: () => {
                            releaseFocus();
                            setCurrent(null);
                            action.onAction();
                        },
                    }
                }
                onFocus={(e) => {
                    setPausedId(id);
                    const from = e.relatedTarget;
                    if (from instanceof HTMLElement && !e.currentTarget.contains(from)) returnFocusRef.current = from;
                }}
                onBlur={(e) => {
                    const next = e.relatedTarget;
                    if (!(next instanceof Node && e.currentTarget.contains(next))) setPausedId(null);
                }}
            />
        );
    };

    const slot: OutletSlot = { register, activeId: activeOutlet, node: activeOutlet ? render('static') : null };
    const floating = activeOutlet ? null : render(current?.placement ?? placement);

    return (
        <SnackbarContext.Provider value={api}>
            <SnackbarOutletContext.Provider value={slot}>
                {children}
                {floating && (portal ? createPortal(floating, container ?? document.body) : floating)}
                <div className="tl-vh" role="status" aria-live="polite" aria-atomic="true">
                    {announced && announced.tone !== 'error' ? announced.message : null}
                </div>
                <div className="tl-vh" role="alert" aria-atomic="true">
                    {announced?.tone === 'error' ? announced.message : null}
                </div>
            </SnackbarOutletContext.Provider>
        </SnackbarContext.Provider>
    );
}

/**
 * Lugar del Snackbar estático (`tl-snackbar--static`) justo encima de un CTA
 * fijo: va como primer hijo de `CtaBar` en StepLayout y ResultScreen
 * (`<CtaBar><SnackbarOutlet /><Button …/></CtaBar>`). BottomSheet con pie ya
 * trae el suyo. Mientras esté montado, el aviso de `useSnackbar()` se dibuja
 * aquí en vez de flotar (el último montado gana), así nunca tapa el CTA y
 * queda dentro de la trampa de foco de la hoja. Sin provider no dibuja nada.
 */
export function SnackbarOutlet() {
    const slot = useContext(SnackbarOutletContext);
    const id = useId();
    const register = slot?.register;
    // Antes de pintar: el aviso no alcanza a aparecer flotando.
    useLayoutEffect(() => register?.(id), [register, id]);
    return slot && slot.activeId === id ? slot.node : null;
}

/** `const { show } = useSnackbar(); show({ message: 'Publicación pausada', tone: 'success', action: { label: 'Deshacer', onAction } })`. */
export function useSnackbar(): SnackbarApi {
    const api = useContext(SnackbarContext);
    if (!api) throw new Error('useSnackbar necesita un <SnackbarProvider> más arriba.');
    return api;
}
