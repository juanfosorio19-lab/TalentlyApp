// Pila de capas abiertas (BottomSheet, SheetPicker, Dialog, MatchModal).
// El botón atrás de Android y el BackButton cierran primero la capa de más
// arriba; solo si no hay ninguna abierta navegan. Ver src/app/BackButtonManager.
import { useEffect, useRef } from 'react';

type Entry = { id: number; close: () => void };

const stack: Entry[] = [];
let nextId = 1;

// Un solo listener de Escape para toda la pila: cierra solo la capa de arriba.
function onEscape(e: KeyboardEvent) {
    if (e.key === 'Escape' && closeTopOverlay()) e.stopPropagation();
}

/** Registra una capa abierta; devuelve la función que la saca de la pila. */
export function pushOverlay(close: () => void): () => void {
    const entry: Entry = { id: nextId++, close };
    if (stack.length === 0) document.addEventListener('keydown', onEscape);
    stack.push(entry);
    return () => {
        const i = stack.findIndex((e) => e.id === entry.id);
        if (i !== -1) stack.splice(i, 1);
        if (stack.length === 0) document.removeEventListener('keydown', onEscape);
    };
}

/** Cierra la capa de más arriba. Devuelve `true` si había una. */
export function closeTopOverlay(): boolean {
    const top = stack[stack.length - 1];
    if (!top) return false;
    top.close();
    return true;
}

export function hasOpenOverlay(): boolean {
    return stack.length > 0;
}

/**
 * Mientras `open` sea true, la capa queda en la pila: atrás de Android y
 * Escape la cierran con `onClose`. Mantiene siempre el último `onClose`.
 */
export function useOverlay(open: boolean, onClose: () => void): void {
    const closeRef = useRef(onClose);
    useEffect(() => {
        closeRef.current = onClose;
    });
    useEffect(() => {
        if (!open) return;
        return pushOverlay(() => closeRef.current());
    }, [open]);
}
