// Navegación del feature: enlaces reales (href del HashRouter + navigate) y
// destinos de los datos de demostración. Toda ruta sale de paths.ts.
import { useCallback, useContext, type MouseEvent } from 'react';
import { UNSAFE_DataRouterContext, matchRoutes, useHref, useNavigate, type NavigateOptions } from 'react-router-dom';
import { isTabRoot } from '../../app/paths';
import { useDemoSession, type DemoActorId } from '../demo/session';
import type { DemoTarget } from '../demo/types';
import { useSnackbar } from '../../ui/Snackbar';
import { copy } from './copy';
import { targetPath } from './mock';

export interface LinkProps {
    href: string;
    onClick: (event: MouseEvent<HTMLElement>) => void;
}

/** Abrir en otra pestaña (Ctrl, Cmd, rueda) sigue siendo del navegador. */
export const isPlainClick = (e: MouseEvent<HTMLElement>) =>
    !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

/**
 * ¿La ruta de paths.ts ya tiene pantalla en el router? paths.ts trae las rutas
 * de toda la spec (GES-01, GES-02, GES-04, PRC-01, VER-01…), pero solo algunas
 * están construidas: las demás caerían en SYS-404 (`*`). Igual que useOpenPath
 * de publications (pedido moverlo a src/app/navigation para compartirlo): el
 * día que la pantalla exista, el mismo enlace navega sin tocar este feature.
 */
export function useCanOpen(): (to: string) => boolean {
    const dataRouter = useContext(UNSAFE_DataRouterContext);
    return useCallback(
        (to: string) => {
            const routes = dataRouter?.router.routes;
            if (!routes) return true;
            const matches = matchRoutes(routes, to.split('?')[0] ?? to);
            const last = matches?.[matches.length - 1];
            return Boolean(last && last.route.path !== '*');
        },
        [dataRouter],
    );
}

export function useAppLinks() {
    const navigate = useNavigate();
    const root = useHref('/');
    const base = root.endsWith('/') ? root.slice(0, -1) : root;

    const hrefOf = useCallback((to: string) => `${base}${to}`, [base]);

    /**
     * La raíz de una pestaña reemplaza (spec §5.3 regla 1: cambiar de pestaña
     * hace replace); una pantalla apilada se abre con push (regla 2).
     */
    const go = useCallback(
        (to: string, options?: NavigateOptions) => {
            const pathname = to.split('?')[0] ?? to;
            navigate(to, { replace: isTabRoot(pathname), ...options });
        },
        [navigate],
    );

    const linkProps = useCallback(
        (to: string): LinkProps => ({
            href: hrefOf(to),
            onClick: (e) => {
                if (!isPlainClick(e)) return;
                e.preventDefault();
                go(to);
            },
        }),
        [hrefOf, go],
    );

    return { hrefOf, go, linkProps };
}

/**
 * La ruta de un destino de los datos (`DemoTarget`) para el actor, solo si su
 * pantalla ya está en el router; `null` si es de una fase futura o todavía no
 * se construye (quien llama dice «Disponible pronto»).
 */
export function useTargetPath(): (target: DemoTarget | undefined, actorId?: DemoActorId) => string | null {
    const { actor } = useDemoSession();
    const canOpen = useCanOpen();
    return useCallback(
        (target, actorId = actor.id) => {
            const path = target ? targetPath(target, actorId) : null;
            return path && canOpen(path) ? path : null;
        },
        [actor.id, canOpen],
    );
}

/**
 * Un destino de los datos (`DemoTarget`): enlace real si la pantalla tiene
 * ruta; si no (una fase futura), un botón que dice «Disponible pronto».
 */
export function useTargetLinks() {
    const resolve = useTargetPath();
    const { linkProps, go } = useAppLinks();
    const snackbar = useSnackbar();
    const soon = useCallback(() => snackbar.show({ message: copy.soon }), [snackbar]);

    const targetLink = useCallback(
        (target: DemoTarget | undefined): Partial<LinkProps> & { onClick: LinkProps['onClick'] } => {
            const path = resolve(target);
            return path ? linkProps(path) : { onClick: soon };
        },
        [resolve, linkProps, soon],
    );

    const openTarget = useCallback(
        (target: DemoTarget | undefined) => {
            const path = resolve(target);
            if (path) go(path);
            else soon();
        },
        [resolve, go, soon],
    );

    return { targetLink, openTarget };
}
