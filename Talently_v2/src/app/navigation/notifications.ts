// La entrada a NOT-01 (spec §5.4): todas las campanas la abren igual y le
// dicen desde dónde se abrió. Así, si una notificación lleva a esa misma
// pantalla, NOT-01 vuelve atrás en vez de apilar otra copia de ella.
import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { paths } from '../paths';
import { withoutSheet } from '../sheets';
import { useOpenPath } from './useOpenPath';

/** Estado de la entrada de NOT-01: la pantalla (ruta y búsqueda, sin hoja) desde la que se abrió. */
export interface NotificationsEntryState {
    from: string;
}

export function notificationsFrom(state: unknown): string | null {
    if (typeof state !== 'object' || state === null || !('from' in state)) return null;
    return typeof state.from === 'string' ? state.from : null;
}

/** La campana de cualquier AppBar: abre NOT-01 (push) diciendo desde dónde. */
export function useOpenNotifications(): () => void {
    const { open } = useOpenPath();
    const location = useLocation();
    return useCallback(() => {
        const state: NotificationsEntryState = { from: location.pathname + withoutSheet(location.search, location.state) };
        open(paths.notificaciones(), { state });
    }, [location.pathname, location.search, location.state, open]);
}
