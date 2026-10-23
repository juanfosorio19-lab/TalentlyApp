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

describe('SnackbarProvider · al cambiar de pantalla (entryKey)', () => {
    const snack = () => document.body.querySelector('.tl-snackbar')?.textContent ?? null;
    function Screen({ entry }: { entry: string }) {
        return (
            <SnackbarProvider entryKey={entry}>
                <Grab />
            </SnackbarProvider>
        );
    }

    it('un aviso sin acción de la pantalla anterior se cierra', () => {
        render(<Screen entry="det-01" />);
        show('Postulaste al turno');
        act(() => vi.advanceTimersByTime(1000));
        act(() => root!.render(<Screen entry="act-02" />));
        expect(snack()).toBeNull();
    });

    it('uno mostrado en el mismo toque que navegó llega al destino, y se va si se vuelve', () => {
        render(<Screen entry="not-01" />);
        show('Cambiaste a Banquetería Rosa SpA');
        act(() => root!.render(<Screen entry="ini-02" />));
        expect(snack()).toContain('Cambiaste a Banquetería Rosa SpA');
        act(() => vi.advanceTimersByTime(1000));
        act(() => root!.render(<Screen entry="not-01" />));
        expect(snack()).toBeNull();
    });

    it('con acción («Deshacer») o keepOnNavigate, sigue', () => {
        render(<Screen entry="exp-01" />);
        act(() => api!.show({ message: 'No te interesa', action: { label: 'Deshacer', onAction: () => {} } }));
        act(() => vi.advanceTimersByTime(1000));
        act(() => root!.render(<Screen entry="det-01" />));
        expect(snack()).toContain('No te interesa');
        act(() => api!.show({ message: 'Guardado', keepOnNavigate: true }));
        act(() => vi.advanceTimersByTime(1000));
        act(() => root!.render(<Screen entry="exp-01" />));
        expect(snack()).toContain('Guardado');
    });
});
