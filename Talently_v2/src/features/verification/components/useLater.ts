// Esperas simuladas de la demostración (enviar el código, enviar las fotos):
// se cancelan solas si la pantalla o la hoja se desmontan antes.
import { useCallback, useEffect, useRef } from 'react';

/** Lo que tarda la demostración en «enviar» algo (Supabase está pausado). */
export const DEMO_LATENCY_MS = 600;

export function useLater(): (fn: () => void, ms?: number) => void {
    const timers = useRef(new Set<number>());
    useEffect(() => {
        const pending = timers.current;
        return () => {
            pending.forEach((t) => window.clearTimeout(t));
            pending.clear();
        };
    }, []);
    return useCallback((fn: () => void, ms: number = DEMO_LATENCY_MS) => {
        const t = window.setTimeout(() => {
            timers.current.delete(t);
            fn();
        }, ms);
        timers.current.add(t);
    }, []);
}
