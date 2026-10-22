// Ayudas de Procesos y reseñas: scroll bajo el CTA fijo y acciones que salen
// de una hoja en la URL (?sheet=).
import { useCallback, useSyncExternalStore } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOpenPath } from '../../app/navigation/useOpenPath';

function subscribeToLayout(onChange: () => void): () => void {
    window.addEventListener('scroll', onChange, { passive: true });
    window.addEventListener('resize', onChange);
    // El contenido cambia de alto sin scroll (error bajo las estrellas, Snackbar en el CTA).
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(onChange) : null;
    observer?.observe(document.body);
    return () => {
        window.removeEventListener('scroll', onChange);
        window.removeEventListener('resize', onChange);
        observer?.disconnect();
    };
}

/** `true` mientras quede contenido por debajo del CTA fijo (`is-scrolled` del CtaBar). */
export function useMoreBelow(threshold = 4): boolean {
    const getSnapshot = useCallback(() => {
        const doc = document.documentElement;
        return doc.scrollHeight - window.innerHeight - window.scrollY > threshold;
    }, [threshold]);
    return useSyncExternalStore(subscribeToLayout, getSnapshot, () => false);
}

/**
 * Abrir otra pantalla desde una hoja de la URL (`?sheet=opciones`): la
 * entrada de la hoja se reemplaza por el destino, así atrás vuelve a la
 * pantalla sin la hoja abierta. Si se llegó con la hoja ya abierta (enlace),
 * primero se quita el parámetro y después se abre el destino. Si la pantalla
 * aún no existe, «Disponible pronto» (useOpenPath) y la hoja sigue abierta.
 */
export function useOpenFromSheet(name: string): (path: string) => void {
    const navigate = useNavigate();
    const location = useLocation();
    const { canOpen, soon } = useOpenPath();
    return useCallback(
        (path: string) => {
            if (!canOpen(path)) {
                soon();
                return;
            }
            const openedByApp = (location.state as { sheet?: string } | null)?.sheet === name;
            if (openedByApp) {
                navigate(path, { replace: true });
                return;
            }
            const params = new URLSearchParams(location.search);
            params.delete('sheet');
            navigate({ pathname: location.pathname, search: params.size ? `?${params}` : '' }, { replace: true });
            navigate(path);
        },
        [canOpen, location.pathname, location.search, location.state, name, navigate, soon],
    );
}
