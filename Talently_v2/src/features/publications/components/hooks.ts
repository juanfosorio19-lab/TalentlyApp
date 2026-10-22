// Ayudas del detalle: el CTA fijo con sombra mientras queda contenido abajo,
// las hojas que parten de cero cada vez que se abren y el celular verificado.
import { useCallback, useState, useSyncExternalStore } from 'react';
import type { DemoActorId } from '../../demo/session';
import { isPhoneVerified, useSessionState } from '../../demo/sessionStore';
import { phoneVerifiedInData } from '../mock';

function subscribeToLayout(onChange: () => void): () => void {
    window.addEventListener('scroll', onChange, { passive: true });
    window.addEventListener('resize', onChange);
    // El contenido cambia de alto sin scroll (carga, Snackbar en el CTA): también cuenta.
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(onChange) : null;
    observer?.observe(document.body);
    return () => {
        window.removeEventListener('scroll', onChange);
        window.removeEventListener('resize', onChange);
        observer?.disconnect();
    };
}

/**
 * `true` mientras quede contenido por debajo del CTA fijo: el CtaBar gana
 * `color-surface` y `elev-2` (`is-scrolled`), como en el prototipo.
 */
export function useMoreBelow(threshold = 4): boolean {
    const getSnapshot = useCallback(() => {
        const doc = document.documentElement;
        return doc.scrollHeight - window.innerHeight - window.scrollY > threshold;
    }, [threshold]);
    return useSyncExternalStore(subscribeToLayout, getSnapshot, () => false);
}

/**
 * Cuántas veces se abrió una hoja. Como `key`, la hoja parte de cero cada vez
 * que se ABRE (no al cerrar: se cierra también con el atrás del navegador, y
 * mientras sale conserva lo que mostraba).
 */
export function useOpenCount(open: boolean): number {
    const [state, setState] = useState({ open, count: open ? 1 : 0 });
    if (state.open !== open) {
        const next = { open, count: open ? state.count + 1 : state.count };
        setState(next);
        return next.count;
    }
    return state.count;
}

/**
 * ¿Tiene el celular verificado? Lo de los datos (salvo Jorge recién
 * registrado y quien lo verifica en su flujo) o lo verificado en esta sesión.
 */
export function usePhoneVerified(actorId: DemoActorId, recienRegistrado: boolean): boolean {
    // Se vuelve a pintar cuando cambia la sesión (verifyPhone).
    useSessionState();
    return isPhoneVerified(actorId, !recienRegistrado && phoneVerifiedInData(actorId));
}
