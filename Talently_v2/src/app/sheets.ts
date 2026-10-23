// Hojas y diálogos en la URL (spec §5.3 regla 3 y §5.4: ?sheet=postular,
// ?sheet=actor, ?sheet=filtros…). Abrir hace push de `?sheet=<nombre>`;
// cerrar vuelve atrás si la abrió la app, o quita el parámetro con replace
// si se llegó por un enlace. El botón atrás de Android la cierra porque la
// hoja está en la pila de capas (useOverlay) y su onClose llama a hide().
//
// Los parámetros propios de una hoja (`s` en ?sheet=editar&s=sobre-mi, `tipo`
// en ?sheet=publicar&tipo=turno) son parte de ella: al cerrarla se van con
// `sheet`, y no cuentan para el scroll ni para la memoria de cada pestaña
// (RootLayout usa `withoutSheet`).
import { useCallback, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

/** Lo que useSheet deja en `location.state` cuando la app abrió la hoja (push). */
type SheetState = { sheet?: string; sheetParams?: string[] } | null;

/** Parámetros propios de cada hoja, declarados por quien la usa (para las que llegan por un enlace). */
const declared = new Map<string, readonly string[]>();

function asSheetState(state: unknown): SheetState {
    return typeof state === 'object' && state !== null ? (state as SheetState) : null;
}

/** ¿La entrada actual es la hoja `name` que abrió la app (push)? Cerrarla es volver una entrada. */
export function isSheetEntry(state: unknown, name: string): boolean {
    return asSheetState(state)?.sheet === name;
}

/** Los parámetros de la hoja abierta en `search` (incluido `sheet`). */
function sheetKeys(params: URLSearchParams, state: unknown, own?: readonly string[]): string[] {
    const name = params.get('sheet');
    if (!name) return [];
    const s = asSheetState(state);
    const fromState = s?.sheet === name ? (s.sheetParams ?? []) : [];
    return ['sheet', ...(own ?? declared.get(name) ?? []), ...fromState];
}

/**
 * `search` sin la hoja abierta ni sus parámetros («?sheet=publicar&tipo=turno»
 * → «»). `own`: los parámetros que declara la hoja; si no se pasan, los que
 * declaró la última pantalla que la usó.
 */
export function withoutSheet(search: string, state: unknown, own?: readonly string[]): string {
    const params = new URLSearchParams(search);
    const keys = sheetKeys(params, state, own);
    if (!keys.length) return search;
    for (const k of keys) params.delete(k);
    return params.size ? `?${params}` : '';
}

export interface UrlSheet {
    open: boolean;
    /** Abre la hoja; `params` agrega datos a la URL (?sheet=editar&s=sobre-mi). */
    show: (params?: Record<string, string>) => void;
    hide: () => void;
    /** Lee un parámetro de la hoja abierta (`s` en ?sheet=editar&s=…). */
    param: (key: string) => string | null;
}

/**
 * `params`: los parámetros propios de la hoja (los de `show(params)`). Así,
 * si se llegó con la hoja abierta por un enlace, cerrarla también los quita.
 */
export function useSheet(name: string, params: readonly string[] = []): UrlSheet {
    if (params.length) declared.set(name, params);
    // Como texto: un arreglo escrito en la llamada cambia en cada pintada y hide() también cambiaría.
    const ownKey = params.join(',');
    const [search] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const open = search.get('sheet') === name;

    const show = useCallback(
        (extra?: Record<string, string>) => {
            const next = new URLSearchParams(location.search);
            next.set('sheet', name);
            for (const [k, v] of Object.entries(extra ?? {})) next.set(k, v);
            navigate(
                { pathname: location.pathname, search: `?${next}` },
                // El scroll de la pantalla de abajo no se mueve al abrir la hoja.
                {
                    state: { sheet: name, sheetParams: Object.keys(extra ?? {}) } satisfies SheetState,
                    preventScrollReset: true,
                },
            );
        },
        [location.pathname, location.search, name, navigate],
    );

    const hide = useCallback(() => {
        if (!open) return;
        if (isSheetEntry(location.state, name)) {
            navigate(-1);
            return;
        }
        // Se llegó con la hoja abierta (enlace o notificación): se quita, con sus parámetros, sin dejar historial.
        navigate(
            { pathname: location.pathname, search: withoutSheet(location.search, location.state, ownKey ? ownKey.split(',') : []) },
            { replace: true, preventScrollReset: true },
        );
    }, [location.pathname, location.search, location.state, name, navigate, open, ownKey]);

    const param = useCallback((key: string) => (open ? search.get(key) : null), [open, search]);

    return { open, show, hide, param };
}

/**
 * Cambia la hoja abierta por otra (AUTH-08 → DET-02) o la quita (`null`), sin
 * dejar historial: el atrás sigue cerrándola como a la de antes. Si la abrió
 * la app, quitarla es volver; si se llegó por un enlace, se quita con replace.
 * Una vez por entrada del historial (los efectos de StrictMode corren dos veces).
 */
export function useSwapSheet(): (to: string | null) => void {
    const navigate = useNavigate();
    const location = useLocation();
    const swappedFrom = useRef<string | null>(null);
    return useCallback(
        (to: string | null) => {
            if (swappedFrom.current === location.key) return;
            swappedFrom.current = location.key;
            const openedByApp = Boolean(asSheetState(location.state)?.sheet);
            if (!to && openedByApp) {
                navigate(-1);
                return;
            }
            const base = new URLSearchParams(withoutSheet(location.search, location.state));
            if (to) base.set('sheet', to);
            navigate(
                { pathname: location.pathname, search: base.size ? `?${base}` : '' },
                {
                    replace: true,
                    preventScrollReset: true,
                    state: to && openedByApp ? ({ sheet: to, sheetParams: [] } satisfies SheetState) : null,
                },
            );
        },
        [location.key, location.pathname, location.search, location.state, navigate],
    );
}
