// Hojas de Inicio en la URL (spec §5.3 regla 3 y §5.4): SHT-ACTOR es
// `/inicio?sheet=actor` y PUBL-01 `/inicio?sheet=publicar&tipo=hogar`. Abrir
// una hoja hace push, así el atrás del navegador (o el de Android) la cierra
// en vez de salir de Inicio; cerrarla vuelve con navigate(-1). Si se llegó con
// la hoja ya en la URL (un enlace abierto en otra pestaña), cerrarla quita el
// `?sheet=` con replace. Es la base del useSheet pedido para src/app.
import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { paths } from '../../app/paths';

export type HomeSheet = 'actor' | 'publicar';

/** Parámetros propios de cada hoja: se van con ella al cerrarla. */
const SHEET_PARAMS: Record<HomeSheet, readonly string[]> = {
    actor: [],
    publicar: ['tipo'],
};

type SheetParams = Record<string, string | undefined>;

interface SheetEntryState {
    /** Esta entrada del historial la abrió la app (push): cerrar es volver. */
    sheetPushed?: HomeSheet;
}

/**
 * Enlace de una hoja de Inicio (`/inicio?sheet=publicar&tipo=hogar`), para el
 * `href` de lo que la abre: también sirve abierto en otra pestaña. Pedido como
 * `paths.inicio({ sheet, tipo })` en src/app/paths.ts.
 */
export function homeSheetPath(sheet: HomeSheet, params: SheetParams = {}): string {
    const search = new URLSearchParams({ sheet });
    for (const [k, v] of Object.entries(params)) if (v) search.set(k, v);
    return `${paths.inicio()}?${search.toString()}`;
}

export function useHomeSheet(sheet: HomeSheet) {
    const [params, setParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const open = params.get('sheet') === sheet;
    // Velo, Escape y atrás pueden pedir cerrar dos veces antes de que la URL cambie: se vuelve una sola vez.
    const closing = useRef(false);
    useEffect(() => {
        closing.current = false;
    }, [location.key]);

    // La página de abajo no se mueve al abrir la hoja. RootLayout guarda el scroll de una
    // raíz de pestaña por ruta y búsqueda, así que `/inicio?sheet=publicar` tiene el suyo y,
    // al reabrirla, ScrollRestoration (efecto de layout) llevaría la página a donde estaba la
    // vez anterior: este efecto, que corre después, la deja donde se abrió. Pedido en
    // «requests» que la clave de scroll ignore `?sheet=`; entonces esto sobra.
    const openedAt = useRef<number | null>(null);
    useEffect(() => {
        if (!open || openedAt.current === null) return;
        if (window.scrollY !== openedAt.current) window.scrollTo(0, openedAt.current);
        openedAt.current = null;
    }, [open, location.key]);

    const show = useCallback(
        (extra: SheetParams = {}) => {
            openedAt.current = window.scrollY;
            setParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    next.set('sheet', sheet);
                    for (const k of SHEET_PARAMS[sheet]) {
                        const v = extra[k];
                        if (v) next.set(k, v);
                        else next.delete(k);
                    }
                    return next;
                },
                { state: { sheetPushed: sheet } satisfies SheetEntryState, preventScrollReset: true },
            );
        },
        [setParams, sheet],
    );

    const close = useCallback(() => {
        if (closing.current) return;
        closing.current = true;
        if ((location.state as SheetEntryState | null)?.sheetPushed === sheet) {
            navigate(-1);
            return;
        }
        setParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.delete('sheet');
                SHEET_PARAMS[sheet].forEach((k) => next.delete(k));
                return next;
            },
            { replace: true, preventScrollReset: true },
        );
    }, [location.state, navigate, setParams, sheet]);

    return { open, show, close, params };
}
