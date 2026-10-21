// Enlaces de la app para las tarjetas: el href real (con el prefijo del router,
// «#/p/…» en v3.html) y la navegación al tocarlas. Una pantalla apilada se abre
// con push (spec §5.3 regla 2); la raíz de una pestaña, con replace (regla 1).
import { useMemo, type MouseEvent } from 'react';
import { useHref, useNavigate } from 'react-router-dom';
import { isTabRoot } from '../../../app/paths';
import { useSnackbar } from '../../../ui/Snackbar';
import { copy } from '../copy';
import { isPendingRoute } from '../explorePaths';

export interface Links {
    /** Ruta de paths.ts → href del documento. */
    href: (path: string) => string;
    /** onClick de un enlace: `preventDefault()` y la navegación de `go`. Ctrl, Cmd o la rueda siguen siendo del navegador. */
    open: (path: string) => (event: MouseEvent<HTMLElement>) => void;
    /** Navega: push a una apilada, replace a la raíz de una pestaña. Si la ruta aún no existe, «Disponible pronto». */
    go: (path: string) => void;
}

const isPlainClick = (e: MouseEvent<HTMLElement>) =>
    !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

export function useLinks(): Links {
    const navigate = useNavigate();
    const root = useHref('/');
    const { show } = useSnackbar();
    return useMemo(() => {
        const prefix = root.endsWith('/') ? root.slice(0, -1) : root;
        const go = (path: string) => {
            if (isPendingRoute(path)) {
                show({ message: copy.pronto });
                return;
            }
            navigate(path, { replace: isTabRoot(path.split('?')[0] ?? path) });
        };
        return {
            href: (path) => `${prefix}${path}`,
            open: (path) => (event) => {
                if (!isPlainClick(event)) return;
                event.preventDefault();
                go(path);
            },
            go,
        };
    }, [navigate, root, show]);
}
