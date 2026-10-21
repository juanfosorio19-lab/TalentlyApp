// Memoria de Explorar mientras la app está abierta (como tabMemory): los
// filtros, los chips de oficio y lo decidido en el deck sobreviven al cambio
// de pestaña y a ir al detalle y volver. Vive en memoria, por actor; al
// reabrir la app parte de cero. Cuando vuelva Supabase, lo decidido en el
// deck se guarda en la base y aquí quedan solo los filtros.
import { useCallback, useEffect, useState, type SetStateAction } from 'react';

const memory = new Map<string, unknown>();

const recall = <T>(key: string, initial: () => T): T => (memory.has(key) ? (memory.get(key) as T) : initial());

/** useState que recuerda su valor bajo `key` mientras la app siga abierta. Si `key` cambia, lee lo de esa clave. */
export function useRemembered<T>(key: string, initial: () => T): [T, (next: SetStateAction<T>) => void] {
    const [state, setState] = useState(() => ({ key, value: recall(key, initial) }));
    let current = state;
    if (state.key !== key) {
        // Estado derivado durante el render: otra clave, otro valor recordado.
        current = { key, value: recall(key, initial) };
        setState(current);
    }
    useEffect(() => {
        memory.set(state.key, state.value);
    }, [state]);
    const set = useCallback(
        (next: SetStateAction<T>) =>
            setState((prev) => ({
                key: prev.key,
                value: typeof next === 'function' ? (next as (p: T) => T)(prev.value) : next,
            })),
        [],
    );
    return [current.value, set];
}
