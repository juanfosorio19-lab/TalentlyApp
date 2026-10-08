// Memoria de Explorar mientras la app está abierta (como tabMemory): los
// filtros, los chips de oficio y lo decidido en el deck sobreviven al cambio
// de pestaña y a ir al detalle y volver. Vive en memoria, por actor; al
// reabrir la app parte de cero. Cuando vuelva Supabase, lo decidido en el
// deck se guarda en la base y aquí quedan solo los filtros.
import { useCallback, useEffect, useState, type SetStateAction } from 'react';

const memory = new Map<string, unknown>();

/** useState que recuerda su valor bajo `key` mientras la app siga abierta. */
export function useRemembered<T>(key: string, initial: () => T): [T, (next: SetStateAction<T>) => void] {
    const [value, setValue] = useState<T>(() => (memory.has(key) ? (memory.get(key) as T) : initial()));
    useEffect(() => {
        memory.set(key, value);
    }, [key, value]);
    const set = useCallback((next: SetStateAction<T>) => setValue(next), []);
    return [value, set];
}
