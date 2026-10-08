import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { List, ListItem } from './ListItem';

// React 19: act() necesita esta bandera fuera de un runner de React.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLDivElement | null = null;
function render(node: ReactNode) {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    act(() => root!.render(<List>{node}</List>));
}
afterEach(() => {
    act(() => root?.unmount());
    host?.remove();
    root = null;
    host = null;
});

const row = () => document.querySelector<HTMLElement>('.tl-listitem')!;

describe('ListItem: la fila es un elemento tocable real', () => {
    it('con href es un enlace con chevron', () => {
        render(<ListItem title="Notificaciones" href="/configuracion/notificaciones" />);
        expect(row().tagName).toBe('A');
        expect(row().querySelector('.tl-listitem__end .tl-icon')).not.toBeNull();
    });

    it('con onClick es un botón; informativa es un div', () => {
        render(<ListItem title="Cerrar sesión" onClick={() => {}} />);
        expect(row().tagName).toBe('BUTTON');
        act(() => root!.render(<List><ListItem title="Versión" value="Talently 3.0.0" /></List>));
        expect(row().tagName).toBe('DIV');
    });

    it('con controles adentro (quitar) es un div, aunque reciba href: nunca un botón dentro de otro', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        render(<ListItem title="Certificado.pdf" href="/x" onRemove={() => {}} />);
        expect(row().tagName).toBe('DIV');
        expect(row().querySelector('button')!.getAttribute('aria-label')).toBe('Quitar Certificado.pdf');
        // Sin chevron: el div no navega, así que no promete hacerlo. Y avisa en desarrollo.
        expect(row().querySelector('.tl-listitem__end > .tl-icon')).toBeNull();
        expect(error).toHaveBeenCalledWith(expect.stringContaining('ListItem: una fila con controles adentro no navega'));
        error.mockRestore();
    });

    it('persona: siempre un div, aunque reciba onClick y un Button al final', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        const onClick = vi.fn();
        render(<ListItem variant="person" title="Martín Silva" onClick={onClick} end={<button type="button">Confirmar</button>} />);
        expect(row().tagName).toBe('DIV');
        expect(row().querySelector('button button')).toBeNull();
        expect(row().querySelector('.tl-listitem__end > .tl-icon')).toBeNull();
        expect(error).not.toHaveBeenCalledWith(expect.stringContaining('cannot be a descendant'));
        error.mockRestore();
    });

    it('con Switch: tocar la fila no repite onClick y cambia el Switch una vez', () => {
        const onChange = vi.fn();
        render(<ListItem title="Avisarme de turnos nuevos" toggle={{ defaultChecked: true, onChange }} />);
        act(() => row().querySelector<HTMLElement>('.tl-listitem__title')!.click());
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(row().querySelector<HTMLInputElement>('input[role="switch"]')!.checked).toBe(false);
    });

    it('dos canales cargando: ningún Switch cambia mientras se guarda', () => {
        const onChange = vi.fn();
        render(
            <ListItem
                title="Mensajes"
                loading
                channels={[
                    { label: 'Mensajes en el teléfono', defaultChecked: true, onChange },
                    { label: 'Mensajes por correo', onChange },
                ]}
            />,
        );
        const inputs = row().querySelectorAll<HTMLInputElement>('input[role="switch"]');
        act(() => inputs.forEach((input) => input.click()));
        expect(onChange).not.toHaveBeenCalled();
        expect(inputs[0]!.checked).toBe(true);
        expect(inputs[1]!.checked).toBe(false);
        expect(inputs[1]!.getAttribute('aria-busy')).toBe('true');
    });

    it('con Switch es un label y el Switch se llama como la fila', () => {
        render(<ListItem title="Avisarme de turnos nuevos" toggle={{ defaultChecked: true }} />);
        expect(row().tagName).toBe('LABEL');
        expect(row().querySelector('input[role="switch"]')).not.toBeNull();
    });

    it('cargando: no repite la acción y lo anuncia', () => {
        const onClick = vi.fn();
        render(<ListItem title="Descargar mis datos" loading loadingLabel="Preparando el archivo…" onClick={onClick} />);
        act(() => row().click());
        expect(onClick).not.toHaveBeenCalled();
        expect(row().getAttribute('aria-busy')).toBe('true');
        expect(row().querySelector('.tl-listitem__sub')!.textContent).toBe('Preparando el archivo…');
    });

    it('desplegable: abre la respuesta en el lugar', () => {
        render(<ListItem title="¿Tengo que pagar para postular?" panel="No. Postular siempre es gratis." />);
        expect(row().getAttribute('aria-expanded')).toBe('false');
        expect(document.querySelector('.tl-listitem__panel')).toBeNull();
        act(() => row().click());
        expect(row().getAttribute('aria-expanded')).toBe('true');
        const panel = document.getElementById(row().getAttribute('aria-controls')!)!;
        expect(panel.textContent).toBe('No. Postular siempre es gratis.');
    });

    it('conversación: el número real de no leídos, con su texto oculto', () => {
        render(<ListItem variant="chat" title="Seguridad Andes Ltda." time="hace 10 min" unreadCount={2} href="/mensajes/1" />);
        expect(row().classList.contains('is-unread')).toBe(true);
        expect(row().querySelector('.tl-badge')!.textContent).toBe('2');
        expect(row().querySelector('.tl-vh')!.textContent).toBe('2 mensajes sin leer');
        // Sin chevron: toda la fila abre la conversación.
        expect(row().querySelector('.tl-listitem__end > .tl-icon')).toBeNull();
    });
});
