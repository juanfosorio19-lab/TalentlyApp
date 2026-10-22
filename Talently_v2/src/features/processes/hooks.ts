// Ayudas de Procesos y reseñas: scroll bajo el CTA fijo, hojas de la URL
// (?sheet=) que la pantalla no siempre puede mostrar y acciones que salen de
// una hoja.
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOpenPath } from '../../app/navigation/useOpenPath';
import { useSheet, type UrlSheet } from '../../app/sheets';

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

/**
 * Una hoja de la URL (useSheet) que la pantalla solo muestra a veces:
 * «Retirar postulación» con la postulación en pie, «Opciones» para quien
 * contrata. Si llega `?sheet=` cuando no se puede mostrar (enlace, adelante
 * del navegador, una postulación ya retirada), el parámetro se quita en vez
 * de quedar en la URL sin nada en pantalla. Cada entrada del historial se
 * cierra una sola vez: si la pantalla cierra la hoja y en el mismo cambio
 * deja de poder mostrarla (confirmar «Retirar»), no vuelve atrás dos veces.
 */
export function useAvailableSheet(name: string, available: boolean): UrlSheet {
    const sheet = useSheet(name);
    const { key } = useLocation();
    const { open, hide: hideSheet } = sheet;
    const closedAt = useRef<string | null>(null);

    // Otra entrada del historial (atrás, adelante): se puede volver a cerrar.
    useEffect(() => {
        if (closedAt.current !== key) closedAt.current = null;
    }, [key]);

    const hide = useCallback(() => {
        if (closedAt.current === key) return;
        closedAt.current = key;
        hideSheet();
    }, [hideSheet, key]);

    useEffect(() => {
        if (open && !available) hide();
    }, [available, hide, open]);

    return { ...sheet, open: open && available, hide };
}
