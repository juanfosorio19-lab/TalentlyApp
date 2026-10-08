import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SheetPicker } from './SheetPicker';

// React 19: act() necesita esta bandera fuera de un runner de React.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLDivElement | null = null;
function render(node: ReactNode) {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    act(() => root!.render(node));
}
afterEach(() => {
    act(() => root?.unmount());
    host?.remove();
    root = null;
    host = null;
});

const COMUNAS = [
    { value: 'alhue', label: 'Alhué' },
    { value: 'buin', label: 'Buin' },
    { value: 'calera', label: 'Calera de Tango' },
];

const radio = (value: string) => document.querySelector<HTMLInputElement>(`.tl-sheet input[type=radio][value="${value}"]`)!;
const key = (el: Element, type: 'keydown' | 'keyup', k: string) =>
    act(() => {
        el.dispatchEvent(new KeyboardEvent(type, { key: k, bubbles: true }));
    });

/**
 * jsdom no recorre radios con flechas: se reproduce lo que hace el navegador
 * (keydown de la flecha; el radio siguiente se marca con su click y change; keyup).
 */
function arrowTo(from: string, to: string) {
    key(radio(from), 'keydown', 'ArrowDown');
    act(() => radio(to).click());
    key(radio(to), 'keyup', 'ArrowDown');
}

describe('SheetPicker de elección única', () => {
    it('las flechas solo recorren: no cambian el valor ni cierran, y Escape lo deja como estaba', () => {
        const onChange = vi.fn();
        const onClose = vi.fn();
        render(
            <SheetPicker open onClose={onClose} title="Comuna" options={COMUNAS} value={null} onChange={onChange} portal={false} />,
        );
        arrowTo('alhue', 'buin');
        arrowTo('buin', 'calera');
        // Controlado: el radio vuelve a la opción elegida (ninguna).
        expect(radio('calera').checked).toBe(false);
        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        });
        expect(onChange).not.toHaveBeenCalled();
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('tocar una fila (o Espacio, que la marca con un click) elige y cierra', () => {
        const onChange = vi.fn();
        const onClose = vi.fn();
        render(<SheetPicker open onClose={onClose} title="Comuna" options={COMUNAS} value="alhue" onChange={onChange} portal={false} />);
        // Después de recorrer con flechas, el toque vuelve a elegir.
        arrowTo('alhue', 'buin');
        key(radio('buin'), 'keydown', ' ');
        act(() => radio('buin').click());
        key(radio('buin'), 'keyup', ' ');
        expect(onChange).toHaveBeenCalledExactlyOnceWith('buin');
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('Enter elige la fila con foco y cierra', () => {
        const onChange = vi.fn();
        const onClose = vi.fn();
        render(<SheetPicker open onClose={onClose} title="Comuna" options={COMUNAS} value="alhue" onChange={onChange} portal={false} />);
        arrowTo('alhue', 'calera');
        key(radio('calera'), 'keydown', 'Enter');
        expect(onChange).toHaveBeenCalledExactlyOnceWith('calera');
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('anuncia los resultados y el «sin resultados» en una región viva', () => {
        render(
            <SheetPicker
                open
                onClose={() => {}}
                title="Comuna"
                options={COMUNAS}
                value={null}
                onChange={() => {}}
                defaultQuery="santiago centro"
                portal={false}
            />,
        );
        const live = document.querySelector('.tl-sheet [aria-live="polite"]');
        expect(live?.textContent).toBe('Sin resultados para «santiago centro»');
        expect(document.querySelector('.tl-sheet .tl-empty__icon')).toBeNull();
        expect(document.querySelector('.tl-sheet .tl-empty .tl-btn--ghost.tl-btn--sm')?.textContent).toBe('Borrar búsqueda');
    });
});
