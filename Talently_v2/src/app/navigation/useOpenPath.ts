// Navegar a una pantalla solo si existe (cero botones fantasma, cero SYS-404
// desde la propia app). Lo usan todos los features en vez de navigate() o de
// armar <a href> a mano. Ir a la raíz de una pestaña hace replace (spec §5.3
// regla 1: cambiar de pestaña no apila); una pantalla apilada, push (regla 2).
// Quien necesite otra cosa lo dice con `replace` explícito.
import { useCallback, type MouseEvent } from 'react';
import { useHref, useLocation, useNavigate, type NavigateOptions } from 'react-router-dom';
import { useSnackbar } from '../../ui/Snackbar';
import { isTabRoot, tabOf } from '../paths';
import { historyIndex } from './history';
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

const pathOnly = (path: string) => path.split(/[?#]/)[0] ?? path;

/**
 * Raíz de pestaña → replace, salvo que quien navega diga otra cosa. Desde
 * Inicio en la primera entrada se apila: Inicio queda debajo y el atrás de la
 * web vuelve a él (paso 5, como la TabBar en AppShell).
 */
export function tabAwareOptions(path: string, from: string, options?: NavigateOptions): NavigateOptions | undefined {
    if (options?.replace !== undefined) return options;
    const dest = pathOnly(path);
    if (!isTabRoot(dest)) return options;
    const leavingFirstInicio = historyIndex() === 0 && isTabRoot(from) && tabOf(from) === 'inicio' && tabOf(dest) !== 'inicio';
    return { ...options, replace: !leavingFirstInicio };
}

export function useOpenPath(): OpenPath {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const snackbar = useSnackbar();
    // '#/' con HashRouter, '/' con BrowserRouter: base para armar cualquier href.
    const base = useHref('/').replace(/\/$/, '');

    const soon = useCallback(() => snackbar.show({ message: SOON_MESSAGE }), [snackbar]);

    const open = useCallback(
        (path: string, options?: NavigateOptions) => {
            if (canOpen(path)) void navigate(path, tabAwareOptions(path, pathname, options));
            else soon();
        },
        [navigate, pathname, soon],
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
                    void navigate(path, tabAwareOptions(path, pathname, options));
                },
            };
        },
        [base, navigate, pathname, soon],
    );

    return { canOpen, open, linkProps, soon };
}
