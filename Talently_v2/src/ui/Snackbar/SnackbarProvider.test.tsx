import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useEffect, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { BottomSheet } from '../BottomSheet';
import { SnackbarProvider, useSnackbar, type SnackbarApi } from './SnackbarProvider';

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
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
    act(() => root?.unmount());
    host?.remove();
    root = null;
    host = null;
    vi.useRealTimers();
});

let api: SnackbarApi | null = null;
function Grab() {
    const snackbar = useSnackbar();
    useEffect(() => {
        api = snackbar;
    }, [snackbar]);
    return null;
}

const show = (message: string, tone?: 'error') => act(() => api!.show({ message, tone }));

describe('SnackbarProvider', () => {
    it('sin outlet flota en document.body con el lugar del provider', () => {
        render(
            <SnackbarProvider placement="no-tabbar">
                <Grab />
            </SnackbarProvider>,
        );
        show('Marcaste todas como leídas');
        const snack = document.body.querySelector(':scope > .tl-snackbar');
        expect(snack?.className).toContain('tl-snackbar--no-tabbar');
    });

    it('con `container` se dibuja dentro de él (WebShell: hijo directo de .tl-web)', () => {
        const web = document.createElement('div');
        web.className = 'tl-web';
        document.body.appendChild(web);
        render(
            <SnackbarProvider placement="web" container={web}>
                <Grab />
            </SnackbarProvider>,
        );
        show('Aprobaste la credencial SPD de Andrés Carrasco');
        expect(web.querySelector(':scope > .tl-snackbar--web')).not.toBeNull();
        web.remove();
    });

    it('una hoja con pie lo recibe estático justo encima del pie', () => {
        render(
            <SnackbarProvider>
                <Grab />
                <BottomSheet open onClose={() => {}} title="Reportar" footer={<button type="button">Enviar reporte</button>}>
                    <p>Motivos</p>
                </BottomSheet>
            </SnackbarProvider>,
        );
        show('No pudimos enviar el reporte.', 'error');
        const snack = document.querySelector('.tl-sheet > .tl-snackbar');
        expect(snack?.className).toContain('tl-snackbar--static');
        expect(snack?.nextElementSibling?.className).toBe('tl-sheet__foot');
        expect(document.body.querySelector(':scope > .tl-snackbar')).toBeNull();
    });

    it('anuncia desde regiones ya montadas, un momento después, y el aviso visible no repite', () => {
        render(
            <SnackbarProvider portal={false}>
                <Grab />
            </SnackbarProvider>,
        );
        const status = host!.querySelector('.tl-vh[role="status"]')!;
        const alert = host!.querySelector('.tl-vh[role="alert"]')!;
        show('Guardamos tus cambios');
        expect(status.textContent).toBe('');
        act(() => vi.advanceTimersByTime(100));
        expect(status.textContent).toBe('Guardamos tus cambios');
        expect(host!.querySelector('.tl-snackbar')?.getAttribute('role')).toBeNull();
        show('No pudimos guardar. Revisa tu conexión e intenta de nuevo.', 'error');
        expect(status.textContent).toBe('');
        act(() => vi.advanceTimersByTime(100));
        expect(alert.textContent).toBe('No pudimos guardar. Revisa tu conexión e intenta de nuevo.');
        act(() => api!.hide());
        expect(alert.textContent).toBe('');
    });
});
