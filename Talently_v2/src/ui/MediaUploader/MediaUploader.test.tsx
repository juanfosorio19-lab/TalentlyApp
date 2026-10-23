import { afterEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MediaUploader } from './MediaUploader';

// React 19: act() necesita esta bandera fuera de un runner de React.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLDivElement | null = null;
afterEach(() => {
    act(() => root?.unmount());
    host?.remove();
    root = null;
    host = null;
});

function renderDocument(accept?: string) {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    act(() => root!.render(<MediaUploader variant="document" title="Tu CV" state="empty" accept={accept} onSelect={() => {}} />));
    const buttons = Array.from(host.querySelectorAll('button')).map((b) => b.textContent?.trim());
    const inputs = Array.from(host.querySelectorAll('input[type=file]')).map((i) => i.getAttribute('accept'));
    return { buttons, inputs };
}

describe('MediaUploader · documento', () => {
    it('foto o PDF: «Tomar foto» y «Elegir archivo»', () => {
        const { buttons, inputs } = renderDocument();
        expect(buttons).toEqual(['Tomar foto', 'Elegir archivo']);
        expect(inputs).toEqual(['image/*', 'image/*,application/pdf']);
    });

    it('solo PDF (el CV de DET-02): sin «Tomar foto», que nunca podría servir', () => {
        const { buttons, inputs } = renderDocument('application/pdf');
        expect(buttons).toEqual(['Elegir archivo']);
        expect(inputs).toEqual(['application/pdf']);
    });
});
