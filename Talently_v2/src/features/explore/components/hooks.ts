// Ayudas de Explorar sobre la base compartida: la URL como estado de la
// pestaña, navegar con useOpenPath y lo decidido en el deck (demo/sessionStore).
import { useCallback, useEffect, useRef, type MouseEvent } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { isTabRoot } from '../../../app/paths';
import type { DemoActorId } from '../../demo/session';
import { keyOf, useDecided, useSessionState } from '../../demo/sessionStore';
import { withParams } from '../filters';
import type { CardHandlers, Decided } from '../model';

/**
 * Los parámetros de /explorar y cómo cambiarlos: con replace (no apila
 * historial) y sin mover el scroll. Así los filtros, los chips y la vista
 * sobreviven a ir al detalle y volver, y la memoria de pestañas los guarda.
 */
export function useExploreParams(): [URLSearchParams, (edit: (next: URLSearchParams) => void) => void] {
    const [params, setParams] = useSearchParams();
    const update = useCallback(
        (edit: (next: URLSearchParams) => void) =>
            setParams((prev) => withParams(prev, edit), { replace: true, preventScrollReset: true }),
        [setParams],
    );
    return [params, update];
}

/**
 * Abrir una hoja de la URL (`?sheet=…`) no mueve la página de abajo.
 * RootLayout guarda el scroll de una raíz de pestaña por ruta y búsqueda, así
 * que `/explorar?tipo=turno&sheet=filtros` tiene el suyo y, al reabrir la
 * hoja, ScrollRestoration llevaría la página a donde estaba la vez anterior.
 * Esto la deja donde se abrió. Pedido en «requests» que la clave de scroll
 * ignore `?sheet=`; entonces esto sobra.
 */
export function useSheetKeepsScroll(): void {
    const location = useLocation();
    const sheetOpen = new URLSearchParams(location.search).has('sheet');
    const lastY = useRef(0);
    useEffect(() => {
        if (sheetOpen) return;
        const remember = () => {
            lastY.current = window.scrollY;
        };
        remember();
        window.addEventListener('scroll', remember, { passive: true });
        return () => window.removeEventListener('scroll', remember);
    }, [sheetOpen]);
    useEffect(() => {
        if (sheetOpen && window.scrollY !== lastY.current) window.scrollTo(0, lastY.current);
    }, [sheetOpen, location.key]);
}

/** ¿La ruta es la raíz de una pestaña? (se abre con replace, spec §5.3 regla 1). */
const toTabRoot = (path: string) => isTabRoot(path.split('?')[0] ?? path);

/**
 * Navegar desde Explorar: una pantalla apilada con push (spec §5.3 regla 2);
 * la raíz de otra pestaña con replace (regla 1). Si la pantalla todavía no
 * existe, useOpenPath muestra «Disponible pronto».
 */
export function useGo() {
    const { open, linkProps } = useOpenPath();
    const go = useCallback((path: string) => open(path, { replace: toTabRoot(path) }), [open]);
    /** href y onClick de una tarjeta (el enlace del título que se estira sobre toda la tarjeta). */
    const cardLink = useCallback(
        (path: string): Pick<CardHandlers, 'href' | 'onOpen'> => {
            const link = linkProps(path, { replace: toTabRoot(path) });
            return {
                // Sin pantalla todavía (perfil público): sin destino real; el toque muestra «Disponible pronto».
                href: link.href ?? '#',
                onOpen: (e: MouseEvent<HTMLAnchorElement>) => link.onClick(e),
            };
        },
        [linkProps],
    );
    return { go, cardLink };
}

/**
 * Lo ya decidido por el actor (demo/sessionStore): postuló, «Me interesa» o
 * «No me interesa» en el deck o en el detalle. Jorge recién registrado
 * (INI-01-jorge-nuevo) no trae las postulaciones de los datos: solo cuenta
 * lo que hizo en esta sesión.
 */
export function useDecisions(actorId: DemoActorId, recienRegistrado: boolean): (publicationId: string) => Decided {
    const decided = useDecided(actorId);
    const { applications, decisions } = useSessionState();
    return useCallback(
        (publicationId: string) => {
            if (!recienRegistrado) return decided(publicationId);
            const key = keyOf(actorId, publicationId);
            return applications.has(key) ? 'postulado' : decisions.get(key);
        },
        [actorId, recienRegistrado, decided, applications, decisions],
    );
}

/** Ejecuta algo un rato después (la latencia de la demo); se cancela si la pantalla se desmonta. */
export function useLater(): (fn: () => void, ms: number) => void {
    const timers = useRef(new Set<number>());
    useEffect(() => {
        const pending = timers.current;
        return () => {
            pending.forEach((id) => window.clearTimeout(id));
            pending.clear();
        };
    }, []);
    return useCallback((fn: () => void, ms: number) => {
        const id = window.setTimeout(() => {
            timers.current.delete(id);
            fn();
        }, ms);
        timers.current.add(id);
    }, []);
}
