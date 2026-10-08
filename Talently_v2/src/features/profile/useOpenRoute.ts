import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../../ui/Snackbar';
import { COPY } from './copy';
import { isPendingRoute } from './paths';

/**
 * Abre una pantalla apilada (push). Si su ruta aún no existe en el router
 * (PENDING_ROUTES), no deja un botón fantasma: avisa «Disponible pronto».
 */
export function useOpenRoute(): (path: string) => void {
    const navigate = useNavigate();
    const { show } = useSnackbar();
    return useCallback(
        (path: string) => {
            if (isPendingRoute(path)) show({ message: COPY.pronto });
            else navigate(path);
        },
        [navigate, show],
    );
}

/** Snackbar honesto para lo que la demostración todavía no tiene. */
export function useSoon(): (message?: string) => void {
    const { show } = useSnackbar();
    return useCallback((message: string = COPY.pronto) => show({ message }), [show]);
}
