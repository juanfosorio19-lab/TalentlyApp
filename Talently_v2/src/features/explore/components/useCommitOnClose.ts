// Lo elegido en una hoja de la URL (useSheet) se aplica DESPUÉS de cerrarla.
// Abrir la hoja apiló `?sheet=…`; cerrarla vuelve atrás (navigate(-1)) a la
// entrada de antes. Si el filtro se escribiera en la URL antes de cerrar,
// quedaría en la entrada de la hoja y volver atrás lo borraría: por eso se
// guarda aquí y se escribe (con replace) cuando la hoja ya no está abierta.
import { useCallback, useEffect, useRef } from 'react';

export function useCommitOnClose<T>(open: boolean, commit: (value: T) => void): (value: T) => void {
    const pending = useRef<{ value: T } | null>(null);
    useEffect(() => {
        if (open || pending.current === null) return;
        const { value } = pending.current;
        pending.current = null;
        commit(value);
    }, [open, commit]);
    return useCallback((value: T) => {
        pending.current = { value };
    }, []);
}
