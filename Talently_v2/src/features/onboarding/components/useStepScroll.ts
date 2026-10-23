// El scroll de cada paso, por entrada del historial (en memoria). El cuerpo de
// StepLayout tiene scroll propio y ScrollRestoration solo restaura la ventana:
// volver a un paso con el atrás (del navegador, de Android o el BackButton)
// lo deja donde se dejó («Atrás vuelve a la pantalla de origen con su
// scroll»). Abrirlo hacia adelante sigue partiendo arriba, con el foco en el
// H1 (StepLayout).
import { useEffect, useRef, useState, type RefObject } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/** scrollTop del cuerpo de cada paso, por `location.key` de su entrada. */
const saved = new Map<string, number>();

/** El `ref` para StepLayout (su raíz `tl-steplayout`). */
export function useStepScroll(): RefObject<HTMLDivElement | null> {
    const ref = useRef<HTMLDivElement>(null);
    const { key } = useLocation();
    const navigationType = useNavigationType();
    // La entrada donde se montó el paso: abrir y cerrar sus hojas (`?sheet=`) no la cambia.
    const [entry] = useState(() => ({ key, back: navigationType === 'POP' }));

    // Corre después del de StepLayout (que deja el cuerpo arriba): el padre va después que sus hijos.
    useEffect(() => {
        const body = ref.current?.querySelector<HTMLElement>('.tl-steplayout__body');
        if (!body) return;
        const top = entry.back ? saved.get(entry.key) : undefined;
        if (top !== undefined) body.scrollTop = top;
        const remember = () => saved.set(entry.key, body.scrollTop);
        body.addEventListener('scroll', remember, { passive: true });
        return () => body.removeEventListener('scroll', remember);
    }, [entry]);

    return ref;
}
