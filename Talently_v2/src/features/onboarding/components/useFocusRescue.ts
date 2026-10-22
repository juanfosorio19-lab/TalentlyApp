// Cuando lo que tenía el foco desaparece (el botón que se tocó, una hoja que
// se cierra y no puede devolverlo), el foco caería a <body>: se lleva a algo
// que sigue en pantalla (el H1 del paso o el bloque que cambió).
import { useEffect, useRef, type DependencyList, type RefObject } from 'react';

function focusLost(): boolean {
    const el = document.activeElement;
    return !el || el === document.body || !el.isConnected || el.closest('[inert]') !== null;
}

export function useFocusRescue(target: RefObject<HTMLElement | null>, deps: DependencyList): void {
    const first = useRef(true);
    useEffect(() => {
        // Al entrar, el foco lo pone StepLayout en el H1.
        if (first.current) {
            first.current = false;
            return;
        }
        const rescue = () => {
            if (focusLost()) target.current?.focus({ preventScroll: true });
        };
        rescue();
        // La hoja que se cierra queda `inert` un instante después: se revisa otra vez.
        const frame = requestAnimationFrame(rescue);
        return () => cancelAnimationFrame(frame);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
