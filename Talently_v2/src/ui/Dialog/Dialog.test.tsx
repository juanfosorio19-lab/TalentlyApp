import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Dialog } from './Dialog';

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

describe('Dialog cargando', () => {
    it('no confirma dos veces ni se cierra a medio camino', () => {
        const onConfirm = vi.fn();
        const onClose = vi.fn();
        render(
            <Dialog open onClose={onClose} title="¿Eliminar la publicación?" confirmLabel="Eliminar" onConfirm={onConfirm} destructive loading>
                No se puede deshacer.
            </Dialog>,
        );
        const confirm = document.querySelector<HTMLButtonElement>('.tl-dialog .tl-btn--danger')!;
        expect(confirm.getAttribute('aria-busy')).toBe('true');
        confirm.focus();
        act(() => {
            confirm.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        });
        act(() => confirm.click());
        act(() => document.querySelector<HTMLElement>('.tl-scrim')!.click());
        act(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        });
        expect(onConfirm).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });
});

describe('Dialog al cerrar', () => {
    it('sale de la pila y se desmonta (sin transición en bundle.css, antes de pintar)', () => {
        const Harness = ({ open }: { open: boolean }) => (
            <Dialog open={open} onClose={() => {}} title="¿Descartar cambios?" confirmLabel="Descartar" onConfirm={() => {}}>
                Si sales ahora, no se guarda lo que cambiaste en este paso.
            </Dialog>
        );
        render(<Harness open />);
        expect(document.querySelector('.tl-dialog')).not.toBeNull();
        act(() => root!.render(<Harness open={false} />));
        expect(document.querySelector('.tl-dialog, .tl-scrim')).toBeNull();
    });
});
