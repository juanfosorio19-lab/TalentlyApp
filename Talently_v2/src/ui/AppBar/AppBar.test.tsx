import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { AppBar, useScrolled } from './AppBar';

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

function scrollTo(y: number) {
    act(() => {
        Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
        window.dispatchEvent(new Event('scroll'));
    });
}

function ScrolledBar() {
    const scrolled = useScrolled();
    return <AppBar title="Explorar" scrolled={scrolled} />;
}

describe('useScrolled', () => {
    it('marca el AppBar al bajar más de 4 px y lo desmarca al volver arriba', () => {
        scrollTo(0);
        render(<ScrolledBar />);
        const header = () => document.querySelector('.tl-appbar')!;
        expect(header().classList.contains('is-scrolled')).toBe(false);
        scrollTo(4);
        expect(header().classList.contains('is-scrolled')).toBe(false);
        scrollTo(5);
        expect(header().classList.contains('is-scrolled')).toBe(true);
        scrollTo(0);
        expect(header().classList.contains('is-scrolled')).toBe(false);
    });

    it('escucha con un listener pasivo y lo suelta al desmontar', () => {
        const add = vi.spyOn(window, 'addEventListener');
        const remove = vi.spyOn(window, 'removeEventListener');
        render(<ScrolledBar />);
        const call = add.mock.calls.find(([type]) => type === 'scroll');
        expect(call?.[2]).toEqual({ passive: true });
        act(() => root?.unmount());
        root = null;
        expect(remove.mock.calls.some(([type, fn]) => type === 'scroll' && fn === call?.[1])).toBe(true);
        add.mockRestore();
        remove.mockRestore();
    });
});

describe('AppBar', () => {
    it('standard: BackButton, título centrado y acciones en sus 3 columnas; sin status bar con hora', () => {
        const onBack = vi.fn();
        render(<AppBar variant="standard" title="Detalle del turno" onBack={onBack} />);
        const row = document.querySelector('.tl-appbar__row')!;
        expect([...row.children].map((c) => c.tagName)).toEqual(['DIV', 'H1', 'DIV']);
        expect(document.querySelector('.tl-statusbar')!.textContent).toBe('');
        act(() => document.querySelector<HTMLButtonElement>('.tl-backbtn')!.click());
        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('chat: el nombre es un enlace al perfil público', () => {
        render(
            <AppBar
                variant="chat"
                peer={{ name: 'Seguridad Andes Ltda.', meta: 'Organización verificada', kind: 'org', verified: true, href: '/perfil/sa' }}
                onBack={() => {}}
                onMore={() => {}}
            />,
        );
        const who = document.querySelector('a.tl-appbar__who')!;
        expect(who.getAttribute('href')).toBe('/perfil/sa');
        expect(who.getAttribute('aria-label')).toBe('Ver perfil de Seguridad Andes Ltda.');
    });
});
