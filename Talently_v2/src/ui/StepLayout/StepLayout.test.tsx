import { afterEach, describe, expect, it } from 'vitest';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { StepLayout } from './StepLayout';

// React 19: act() necesita esta bandera fuera de un runner de React.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLDivElement | null = null;
function render(node: ReactNode) {
    if (!host) {
        host = document.createElement('div');
        document.body.appendChild(host);
        root = createRoot(host);
    }
    act(() => root!.render(node));
}
afterEach(() => {
    act(() => root?.unmount());
    host?.remove();
    root = null;
    host = null;
});

const noop = () => {};

describe('StepLayout', () => {
    it('ONB-01: sin BackButton ni barra, con el menú ⋯', () => {
        render(<StepLayout title="¿Qué quieres hacer en Talently?" onMenu={noop} onContinue={noop} />);
        expect(document.querySelector('.tl-backbtn')).toBeNull();
        expect(document.querySelector('.tl-progress')).toBeNull();
        expect(document.querySelector('.tl-appbar__actions [aria-label="Más opciones"]')).not.toBeNull();
    });

    it('acceso: solo el BackButton, sin barra ni menú', () => {
        render(<StepLayout title="Crea tu cuenta" onBack={noop} onContinue={noop} />);
        expect(document.querySelector('.tl-backbtn')).not.toBeNull();
        expect(document.querySelector('.tl-progress')).toBeNull();
        expect(document.querySelector('.tl-appbar__actions')!.childElementCount).toBe(0);
    });

    it('al cambiar de paso, el cuerpo vuelve arriba y el foco va al H1', () => {
        const step = (n: number) => (
            <StepLayout progress={{ step: n, total: 5 }} title={`Paso ${n}`} onBack={noop} onMenu={noop} onContinue={noop} />
        );
        render(step(2));
        const body = document.querySelector<HTMLElement>('.tl-steplayout__body')!;
        // jsdom no hace layout: scrollTop como propiedad simple, para ver que el paso la reinicia.
        Object.defineProperty(body, 'scrollTop', { value: 320, writable: true });
        render(step(3));
        expect(body.scrollTop).toBe(0);
        expect(document.activeElement).toBe(document.querySelector('.tl-steplayout__title'));
    });
});
