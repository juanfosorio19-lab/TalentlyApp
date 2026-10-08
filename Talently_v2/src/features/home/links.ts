// Navegación del feature: enlaces reales (href del HashRouter + navigate) y
// destinos de los datos de demostración. Toda ruta sale de paths.ts.
import { useCallback, type MouseEvent } from 'react';
import { useHref, useNavigate, type NavigateOptions } from 'react-router-dom';
import { isTabRoot } from '../../app/paths';
import { useDemoSession } from '../demo/session';
import type { DemoTarget } from '../demo/types';
import { useSnackbar } from '../../ui/Snackbar';
import { copy } from './copy';
import { targetPath } from './mock';

export interface LinkProps {
    href: string;
    onClick: (event: MouseEvent<HTMLElement>) => void;
}

/** Abrir en otra pestaña (Ctrl, Cmd, rueda) sigue siendo del navegador. */
const isPlainClick = (e: MouseEvent<HTMLElement>) =>
    !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

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
 * Un destino de los datos (`DemoTarget`): enlace real si la pantalla tiene
 * ruta; si no (una fase futura), un botón que dice «Disponible pronto».
 */
export function useTargetLinks() {
    const { actor } = useDemoSession();
    const { linkProps, go } = useAppLinks();
    const snackbar = useSnackbar();
    const soon = useCallback(() => snackbar.show({ message: copy.soon }), [snackbar]);

    const targetLink = useCallback(
        (target: DemoTarget | undefined): Partial<LinkProps> & { onClick: LinkProps['onClick'] } => {
            const path = target ? targetPath(target, actor.id) : null;
            return path ? linkProps(path) : { onClick: soon };
        },
        [actor.id, linkProps, soon],
    );

    const openTarget = useCallback(
        (target: DemoTarget | undefined) => {
            const path = target ? targetPath(target, actor.id) : null;
            if (path) go(path);
            else soon();
        },
        [actor.id, go, soon],
    );

    return { targetLink, openTarget };
}
