// Navegar a una pantalla solo si existe (cero botones fantasma, cero SYS-404
// desde la propia app). Lo usan todos los features en vez de navigate() o de
// armar <a href> a mano.
import { useCallback, type MouseEvent } from 'react';
import { useHref, useNavigate, type NavigateOptions } from 'react-router-dom';
import { useSnackbar } from '../../ui/Snackbar';
import { canOpen } from './routeRegistry';

export const SOON_MESSAGE = 'Disponible pronto';

export interface LinkTargetProps {
    href?: string;
    onClick: (event: MouseEvent<HTMLElement>) => void;
}

export interface OpenPath {
    canOpen: (path: string) => boolean;
    /** Navega si la pantalla existe; si no, Snackbar «Disponible pronto». */
    open: (path: string, options?: NavigateOptions) => void;
    /**
     * Props para un enlace (a, ListItem, Card, PublicationCard): `href` real
     * para abrir en otra pestaña y onClick que navega con el router. Si la
     * pantalla no existe, sin href y con el Snackbar.
     */
    linkProps: (path: string, options?: NavigateOptions) => LinkTargetProps;
    soon: () => void;
}

export function useOpenPath(): OpenPath {
    const navigate = useNavigate();
    const snackbar = useSnackbar();
    // '#/' con HashRouter, '/' con BrowserRouter: base para armar cualquier href.
    const base = useHref('/').replace(/\/$/, '');

    const soon = useCallback(() => snackbar.show({ message: SOON_MESSAGE }), [snackbar]);

    const open = useCallback(
        (path: string, options?: NavigateOptions) => {
            if (canOpen(path)) navigate(path, options);
            else soon();
        },
        [navigate, soon],
    );

    const linkProps = useCallback(
        (path: string, options?: NavigateOptions): LinkTargetProps => {
            if (!canOpen(path)) return { onClick: (e) => { e.preventDefault(); soon(); } };
            return {
                href: base + path,
                onClick: (e) => {
                    // Con Ctrl/⌘ o botón del medio, que el navegador abra otra pestaña.
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
                    e.preventDefault();
                    navigate(path, options);
                },
            };
        },
        [base, navigate, soon],
    );

    return { canOpen, open, linkProps, soon };
}
