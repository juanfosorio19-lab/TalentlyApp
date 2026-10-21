// Hojas y diálogos en la URL (spec §5.3 regla 3 y §5.4: ?sheet=postular,
// ?sheet=actor, ?sheet=filtros…). Abrir hace push de `?sheet=<nombre>`;
// cerrar vuelve atrás si la abrió la app, o quita el parámetro con replace
// si se llegó por un enlace. El botón atrás de Android la cierra porque la
// hoja está en la pila de capas (useOverlay) y su onClose llama a hide().
import { useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

type SheetState = { sheet?: string } | null;

export interface UrlSheet {
    open: boolean;
    /** Abre la hoja; `params` agrega datos a la URL (?sheet=editar&s=sobre-mi). */
    show: (params?: Record<string, string>) => void;
    hide: () => void;
    /** Lee un parámetro de la hoja abierta (`s` en ?sheet=editar&s=…). */
    param: (key: string) => string | null;
}

export function useSheet(name: string): UrlSheet {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const open = params.get('sheet') === name;

    const show = useCallback(
        (extra?: Record<string, string>) => {
            const next = new URLSearchParams(location.search);
            next.set('sheet', name);
            for (const [k, v] of Object.entries(extra ?? {})) next.set(k, v);
            navigate(
                { pathname: location.pathname, search: `?${next}` },
                // El scroll de la pantalla de abajo no se mueve al abrir la hoja.
                { state: { sheet: name } satisfies SheetState, preventScrollReset: true },
            );
        },
        [location.pathname, location.search, name, navigate],
    );

    const hide = useCallback(() => {
        if (!open) return;
        if ((location.state as SheetState)?.sheet === name) {
            navigate(-1);
            return;
        }
        // Se llegó con la hoja abierta (enlace o notificación): se quita sin dejar historial.
        const next = new URLSearchParams(location.search);
        next.delete('sheet');
        navigate({ pathname: location.pathname, search: next.size ? `?${next}` : '' }, { replace: true, preventScrollReset: true });
    }, [location.pathname, location.search, location.state, name, navigate, open]);

    const param = useCallback((key: string) => (open ? params.get(key) : null), [open, params]);

    return { open, show, hide, param };
}
