// Ayudas de navegación y de scroll del detalle.
import { useCallback, useContext, useSyncExternalStore } from 'react';
import { UNSAFE_DataRouterContext, matchRoutes, useNavigate } from 'react-router-dom';
import { useSnackbar } from '../../../ui/Snackbar';
import { copy } from '../copy';

/**
 * Abre una ruta de paths.ts solo si su pantalla ya está en el router; si
 * todavía no (PRF-11, GES-01, PRC-01 mientras se construyen), muestra el
 * Snackbar honesto «Disponible pronto» en vez de llevar a SYS-404. Cuando la
 * pantalla exista, el mismo botón navega sin tocar este feature.
 */
export function useOpenPath() {
    const navigate = useNavigate();
    const snackbar = useSnackbar();
    const dataRouter = useContext(UNSAFE_DataRouterContext);

    const canOpen = useCallback(
        (to: string) => {
            const routes = dataRouter?.router.routes;
            if (!routes) return true;
            const matches = matchRoutes(routes, to.split('?')[0] ?? to);
            const last = matches?.[matches.length - 1];
            return Boolean(last && last.route.path !== '*');
        },
        [dataRouter],
    );

    const open = useCallback(
        (to: string) => {
            if (canOpen(to)) navigate(to);
            else snackbar.show({ message: copy.soon });
        },
        [canOpen, navigate, snackbar],
    );

    return { open, canOpen };
}

function subscribeToLayout(onChange: () => void): () => void {
    window.addEventListener('scroll', onChange, { passive: true });
    window.addEventListener('resize', onChange);
    // El contenido cambia de alto sin scroll (carga, Snackbar en el CTA): también cuenta.
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(onChange) : null;
    observer?.observe(document.body);
    return () => {
        window.removeEventListener('scroll', onChange);
        window.removeEventListener('resize', onChange);
        observer?.disconnect();
    };
}

/**
 * `true` mientras quede contenido por debajo del CTA fijo: el CtaBar gana
 * `color-surface` y `elev-2` (`is-scrolled`), como en el prototipo.
 */
export function useMoreBelow(threshold = 4): boolean {
    const getSnapshot = useCallback(() => {
        const doc = document.documentElement;
        return doc.scrollHeight - window.innerHeight - window.scrollY > threshold;
    }, [threshold]);
    return useSyncExternalStore(subscribeToLayout, getSnapshot, () => false);
}
