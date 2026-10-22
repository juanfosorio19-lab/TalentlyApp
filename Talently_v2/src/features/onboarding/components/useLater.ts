// Esperas simuladas de la demostración (crear la cuenta, verificar el código):
// se cancelan solas si la pantalla se desmonta antes (atrás a mitad de camino).
import { useCallback, useEffect, useRef } from 'react';

export function useLater(): (fn: () => void, ms: number) => void {
    const timers = useRef(new Set<number>());
    useEffect(() => {
        const pending = timers.current;
        return () => {
            pending.forEach((t) => window.clearTimeout(t));
            pending.clear();
        };
    }, []);
    return useCallback((fn: () => void, ms: number) => {
        const t = window.setTimeout(() => {
            timers.current.delete(t);
            fn();
        }, ms);
        timers.current.add(t);
    }, []);
}
