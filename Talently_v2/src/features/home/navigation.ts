// Navegación de «Inicio y notificaciones» sobre la base compartida: toda ruta
// sale de paths.ts o de demo/targets y se abre con useOpenPath (si la
// pantalla aún no existe, «Disponible pronto» en vez de SYS-404).
import { useCallback, useEffect, useRef } from 'react';
import { useLocation, type NavigateOptions } from 'react-router-dom';
import { useOpenPath, type LinkTargetProps } from '../../app/navigation/useOpenPath';
import { isTabRoot } from '../../app/paths';
import { useDemoSession } from '../demo/session';
import { targetPath } from '../demo/targets';
import type { DemoTarget } from '../demo/types';

/** Ir a la raíz de otra pestaña hace replace (spec §5.3 regla 1); una pantalla apilada, push (regla 2). */
export function tabAware(path: string, options?: NavigateOptions): NavigateOptions {
    return { replace: isTabRoot(path.split(/[?#]/)[0] ?? path), ...options };
}

export function useHomeNavigation() {
    const { actor } = useDemoSession();
    const { open, linkProps, soon, canOpen } = useOpenPath();

    const go = useCallback((path: string, options?: NavigateOptions) => open(path, tabAware(path, options)), [open]);
    const link = useCallback((path: string): LinkTargetProps => linkProps(path, tabAware(path)), [linkProps]);

    /** Un destino de los datos (DemoTarget) como enlace: `href` real o, si no tiene pantalla, «Disponible pronto». */
    const targetLink = useCallback(
        (target: DemoTarget | undefined): LinkTargetProps => (target ? link(targetPath(target, actor.id)) : { onClick: soon }),
        [actor.id, link, soon],
    );

    const openTarget = useCallback(
        (target: DemoTarget | undefined) => (target ? go(targetPath(target, actor.id)) : soon()),
        [actor.id, go, soon],
    );

    return { go, link, targetLink, openTarget, soon, canOpen };
}

/**
 * La página de abajo no se mueve al abrir una hoja. RootLayout guarda el scroll
 * de una raíz de pestaña por ruta Y búsqueda, así que `/inicio?sheet=…` tiene
 * el suyo y, al reabrir la misma hoja, ScrollRestoration (efecto de layout)
 * llevaría la página a donde estaba la vez anterior. Envuelve el `show` de
 * useSheet: guarda el scroll al abrir y lo repone después de esa restauración.
 * Pedido en «requests» que la clave de scroll ignore `?sheet=`; entonces sobra.
 */
export function useKeepScroll() {
    const { key } = useLocation();
    const at = useRef<number | null>(null);
    useEffect(() => {
        if (at.current === null) return;
        if (window.scrollY !== at.current) window.scrollTo(0, at.current);
        at.current = null;
    }, [key]);
    return useCallback(<A extends unknown[]>(open: (...args: A) => void) => (...args: A) => {
        at.current = window.scrollY;
        open(...args);
    }, []);
}
