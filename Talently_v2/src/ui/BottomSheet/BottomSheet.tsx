import {
    useEffect,
    useId,
    useRef,
    useState,
    type CSSProperties,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
    type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../cx';
import { IconClose } from '../icons';
import { IconButton } from '../IconButton/IconButton';
import { useOverlay } from '../overlay';
import { useLayerExit, useLayerPresence } from '../overlay/useLayerPresence';
import { useModalFocus } from '../overlay/useModalFocus';
import { SnackbarOutlet } from '../Snackbar/SnackbarProvider';

export interface BottomSheetProps {
    open: boolean;
    /** Cerrar, velo, asa, Escape y atrás de Android. Cerrar no aplica nada: eso lo hace el botón del pie. */
    onClose: () => void;
    /** Título H2 («Filtros», «Usar Talently como», «Reportar»). */
    title: ReactNode;
    /** Cuerpo con scroll: secciones `SheetSection`, una `ul.tl-list`, un grupo de Radio… */
    children: ReactNode;
    /**
     * Pie con hasta 2 acciones de igual ancho: secundaria ghost («Limpiar») y
     * primaria con resultado concreto («Ver 12 turnos»). Con pie, el Snackbar
     * de `useSnackbar()` va estático justo encima de él (nunca tapa el botón).
     */
    footer?: ReactNode;
    /** Buscador fijo bajo el título (SheetPicker). */
    search?: ReactNode;
    /** Etiqueta del botón Cerrar. */
    closeLabel?: string;
    /**
     * Dónde cae el foco al abrir. Por defecto, el título (sistema de diseño:
     * «Al abrir, el foco pasa al título»). SheetPicker pasa su buscador.
     */
    initialFocusRef?: RefObject<HTMLElement | null>;
    /** `false`: se dibuja en su lugar (catálogo, marcos de 390) en vez de en `document.body`. */
    portal?: boolean;
    /**
     * `false`: solo para mostrarla abierta en el catálogo; no toma ni atrapa el
     * foco y no entra en la pila de capas (atrás y Escape no la cierran).
     */
    modal?: boolean;
    className?: string;
}

/**
 * El único BottomSheet de la app: filtros, elecciones y acciones contextuales
 * sobre el velo. SheetPicker es esta misma hoja con buscador y lista.
 */
export function BottomSheet({ open, ...props }: BottomSheetProps) {
    // La hoja se monta al abrir (arrastre y foco empiezan de cero cada vez) y,
    // al cerrar, sigue montada mientras dura su salida (`duration-slow`).
    const { mounted, exited } = useLayerPresence(open);
    return mounted ? <SheetLayer {...props} closing={!open} onExited={exited} /> : null;
}

/** Arrastre del asa: hacia abajo cierra; hacia arriba expande hasta debajo del AppBar. */
type Drag = { pointerId: number; startY: number; startHeight: number; maxHeight: number; dy: number; lastY: number; lastT: number; velocity: number };

const EXPAND_PX = 48;
const FLICK_PX_PER_MS = 0.6;

function SheetLayer({
    onClose,
    title,
    children,
    footer,
    search,
    closeLabel = 'Cerrar',
    initialFocusRef,
    portal = true,
    modal = true,
    className,
    closing,
    onExited,
}: Omit<BottomSheetProps, 'open'> & { closing: boolean; onExited: () => void }) {
    const titleId = useId();
    const sheetRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const headRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<Drag | null>(null);
    const [offset, setOffset] = useState(0);
    const [dragHeight, setDragHeight] = useState<number | null>(null);
    const [expandedHeight, setExpandedHeight] = useState<number | null>(null);

    // Al empezar a cerrar sale de la pila de capas y devuelve el foco; ya no se toca (`inert`).
    const active = modal && !closing;
    useOverlay(active, onClose);
    useModalFocus(active, sheetRef, initialFocusRef ?? titleRef);
    useLayerExit(closing, sheetRef, onExited);

    // En Android el arrastre vertical haría scroll de la página y cancelaría el
    // puntero: mientras se arrastra, el touchmove no se deja pasar.
    useEffect(() => {
        const zones = [handleRef.current, headRef.current].filter((el): el is HTMLDivElement => el !== null);
        const block = (e: TouchEvent) => {
            if (dragRef.current) e.preventDefault();
        };
        zones.forEach((el) => el.addEventListener('touchmove', block, { passive: false }));
        return () => zones.forEach((el) => el.removeEventListener('touchmove', block));
    }, []);

    const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
        const sheet = sheetRef.current;
        if (!sheet || e.button !== 0) return;
        // Cerrar y demás controles de la cabecera se tocan normal.
        if (e.target instanceof Element && e.target.closest('button, a, input, select, textarea, label')) return;
        const startHeight = sheet.getBoundingClientRect().height;
        // max-height es calc(100% - AppBar) y getComputedStyle no lo resuelve:
        // se mide pidiendo un alto enorme que el max-height recorta.
        const previous = sheet.style.height;
        sheet.style.height = '100000px';
        const maxHeight = sheet.getBoundingClientRect().height;
        sheet.style.height = previous;
        dragRef.current = { pointerId: e.pointerId, startY: e.clientY, startHeight, maxHeight, dy: 0, lastY: e.clientY, lastT: e.timeStamp, velocity: 0 };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
        const d = dragRef.current;
        if (!d || d.pointerId !== e.pointerId) return;
        const dt = e.timeStamp - d.lastT;
        if (dt > 0) d.velocity = (e.clientY - d.lastY) / dt;
        d.lastY = e.clientY;
        d.lastT = e.timeStamp;
        d.dy = e.clientY - d.startY;
        if (d.dy >= 0) {
            setOffset(d.dy);
            setDragHeight(null);
        } else {
            setOffset(0);
            setDragHeight(Math.min(d.startHeight - d.dy, d.maxHeight));
        }
    };

    const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
        const d = dragRef.current;
        if (!d || d.pointerId !== e.pointerId) return;
        dragRef.current = null;
        setOffset(0);
        setDragHeight(null);
        if (e.type === 'pointercancel') return;
        const closeAt = Math.min(96, d.startHeight / 4);
        if (d.dy > closeAt || (d.dy > 16 && d.velocity > FLICK_PX_PER_MS)) onClose();
        else if (d.dy < -EXPAND_PX) setExpandedHeight(d.maxHeight);
        else if (d.dy > EXPAND_PX && expandedHeight !== null) setExpandedHeight(null);
    };

    const dragHandlers = {
        onPointerDown,
        onPointerMove,
        onPointerUp: onPointerEnd,
        onPointerCancel: onPointerEnd,
    };

    const height = dragHeight ?? expandedHeight;
    const style: CSSProperties | undefined =
        offset || height !== null
            ? { transform: offset ? `translateY(${offset}px)` : undefined, height: height ?? undefined }
            : undefined;

    const layer = (
        <>
            <div className={cx('tl-scrim', closing && 'is-closing')} aria-hidden="true" inert={closing} onClick={onClose} />
            <div
                ref={sheetRef}
                className={cx('tl-sheet', closing && 'is-closing', className)}
                role="dialog"
                aria-modal={modal || undefined}
                aria-labelledby={titleId}
                inert={closing}
                style={style}
            >
                <div ref={handleRef} className="tl-sheet__handle" aria-hidden="true" {...dragHandlers} />
                <div ref={headRef} className="tl-sheet__head" {...dragHandlers}>
                    <h2 ref={titleRef} className="h2 tl-focus" id={titleId} tabIndex={-1}>
                        {title}
                    </h2>
                    <IconButton icon={IconClose} label={closeLabel} onClick={onClose} />
                </div>
                {search && <div className="tl-sheet__search">{search}</div>}
                <div className="tl-sheet__body">{children}</div>
                {footer && active && <SnackbarOutlet />}
                {footer && <div className="tl-sheet__foot">{footer}</div>}
            </div>
        </>
    );

    return portal ? createPortal(layer, document.body) : layer;
}

export interface SheetSectionProps {
    /** Etiqueta de la sección, en Label («Fecha», «Oficio», «Distancia»). */
    label: ReactNode;
    children: ReactNode;
    className?: string;
}

/** Sección del cuerpo de una hoja: etiqueta arriba y sus controles debajo (un grupo de Chips). */
export function SheetSection({ label, children, className }: SheetSectionProps) {
    const labelId = useId();
    return (
        <div className={cx('tl-sheet__section', className)} role="group" aria-labelledby={labelId}>
            <span className="tl-field__label" id={labelId}>
                {label}
            </span>
            {children}
        </div>
    );
}
