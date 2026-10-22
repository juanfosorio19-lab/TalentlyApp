// La plantilla StepLayout para los dos pasos que no caben en ella (brecha
// pedida en «requests»): AUTH-03 no tiene CTA (el código se verifica solo al
// completarse) y ONB-99 no tiene AppBar (no hay paso anterior). Mismo marcado
// `tl-steplayout` que StepLayout: cuerpo con scroll propio, H1 que recibe el
// foco al entrar y CTA fijo que gana sombra cuando hay contenido debajo.
import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { CtaBar } from '../../../ui/CtaBar';

export interface StepFrameProps {
    /** El AppBar standard del paso; sin él, solo el espacio del safe area. */
    appBar?: ReactNode;
    title: ReactNode;
    subtitle?: ReactNode;
    children?: ReactNode;
    /** Los botones del CTA fijo; sin ellos no hay barra. */
    cta?: ReactNode;
    /** El H1, para devolverle el foco cuando desaparece lo que se tocó. */
    titleRef?: RefObject<HTMLHeadingElement | null>;
    /** Al entrar, el foco va al H1 (por defecto). AUTH-03 lo deja en el código. */
    focusTitle?: boolean;
}

export function StepFrame({ appBar, title, subtitle, children, cta, titleRef, focusTitle = true }: StepFrameProps) {
    const ownTitle = useRef<HTMLHeadingElement>(null);
    const heading = titleRef ?? ownTitle;
    const bodyRef = useRef<HTMLElement>(null);
    const [more, setMore] = useState(false);

    const measure = useCallback(() => {
        const el = bodyRef.current;
        if (el) setMore(el.scrollHeight - el.scrollTop - el.clientHeight > 4);
    }, []);

    useEffect(() => {
        if (focusTitle) heading.current?.focus({ preventScroll: true });
    }, [focusTitle, heading]);

    useEffect(() => {
        const el = bodyRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        for (const child of Array.from(el.children)) observer.observe(child);
        return () => observer.disconnect();
    }, [measure]);

    return (
        <div className="tl-steplayout">
            {appBar ?? <div className="tl-statusbar" aria-hidden="true" />}
            <main ref={bodyRef} className="tl-steplayout__body" onScroll={measure}>
                <h1 ref={heading} className="tl-steplayout__title h1" tabIndex={-1}>
                    {title}
                </h1>
                {subtitle && <p className="tl-steplayout__sub">{subtitle}</p>}
                {children}
            </main>
            {cta && <CtaBar scrolled={more}>{cta}</CtaBar>}
        </div>
    );
}
