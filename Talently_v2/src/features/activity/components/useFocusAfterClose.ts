// Una hoja o un Dialog que llegó abierto desde un enlace o una notificación
// (?sheet=verificacion, ?sheet=cancelar, ?sheet=publicar) no tiene un botón
// que lo haya abierto: al cerrarlo, useModalFocus devuelve el foco al body.
// Este hook lo lleva a algo que sigue en pantalla (el título de TUR-01, el
// botón «Publicar» de ACT-03). Si la hoja se abrió desde la pantalla, el foco
// ya volvió a ese botón y no se toca. Pedido en requests que useModalFocus
// (src/ui/overlay) lo haga para todas las capas; entonces este hook se borra.
import { useEffect, useRef, type RefObject } from 'react';

/** El foco quedó fuera de la pantalla: en el body o en una capa que se está yendo (inert). */
function focusLost(): boolean {
    const el = document.activeElement;
    return !el || el === document.body || !el.isConnected || el.closest('[inert]') !== null;
}

/**
 * Al pasar `open` de true a false, si el foco quedó perdido, lo lleva a
 * `target`. Corre después de que la capa suelte el foco (sus efectos se
 * limpian antes que los de la pantalla en el mismo commit).
 */
export function useFocusAfterClose(open: boolean, target: RefObject<HTMLElement | null>): void {
    const wasOpen = useRef(open);
    useEffect(() => {
        const closed = wasOpen.current && !open;
        wasOpen.current = open;
        if (closed && focusLost()) target.current?.focus({ preventScroll: true });
    }, [open, target]);
}
