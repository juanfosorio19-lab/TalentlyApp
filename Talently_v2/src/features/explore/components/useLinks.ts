// Enlaces de la app para las tarjetas: el href real (con el prefijo del router,
// «#/p/…» en v3.html) y la navegación con push al tocarlas.
import { useMemo, type MouseEvent } from 'react';
import { useHref, useNavigate } from 'react-router-dom';

export interface Links {
    /** Ruta de paths.ts → href del documento. */
    href: (path: string) => string;
    /** onClick de un enlace: `preventDefault()` y push de la ruta. */
    open: (path: string) => (event: MouseEvent<HTMLElement>) => void;
    /** Push de la ruta. */
    go: (path: string) => void;
}

export function useLinks(): Links {
    const navigate = useNavigate();
    const root = useHref('/');
    return useMemo(() => {
        const prefix = root.endsWith('/') ? root.slice(0, -1) : root;
        return {
            href: (path) => `${prefix}${path}`,
            open: (path) => (event) => {
                event.preventDefault();
                navigate(path);
            },
            go: (path) => navigate(path),
        };
    }, [navigate, root]);
}
