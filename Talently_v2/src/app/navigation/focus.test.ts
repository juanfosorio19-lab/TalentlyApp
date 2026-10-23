import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { focusScreenTitle, rememberFocus, rescueFocus, resetFocusMarks, setInteractedForTests } from './focus';

// jsdom no calcula cajas: todo elemento conectado se trata como visible.
const realRects = HTMLElement.prototype.getClientRects;
beforeEach(() => {
    HTMLElement.prototype.getClientRects = function rects(this: HTMLElement) {
        const list = [new DOMRect(0, 0, 10, 10)];
        return Object.assign(list, { item: (i: number) => list[i] ?? null }) as unknown as DOMRectList;
    };
    setInteractedForTests(true);
});
afterEach(() => {
    HTMLElement.prototype.getClientRects = realRects;
    document.body.innerHTML = '';
    resetFocusMarks();
    setInteractedForTests(false);
});

describe('focusScreenTitle', () => {
    it('prefiere el h1 enfocable del contenido (DET-01, GES-04) y le pone el anillo', () => {
        document.body.innerHTML = `
            <div class="tl-app-screen">
                <header class="tl-appbar"><h1 class="tl-appbar__title" style="visibility:hidden">Detalle</h1></header>
                <main><h1 tabindex="-1" id="t">Garzones para cena</h1></main>
            </div>`;
        expect(focusScreenTitle()).toBe(true);
        expect(document.activeElement?.id).toBe('t');
        expect(document.activeElement?.classList.contains('tl-focus')).toBe(true);
    });

    it('sin uno enfocable, el h1 del AppBar con tabindex -1', () => {
        document.body.innerHTML = `
            <div class="tl-app-screen">
                <header class="tl-appbar"><h1 class="tl-appbar__title" id="t">Configuración</h1></header>
                <main><p>…</p></main>
            </div>`;
        expect(focusScreenTitle()).toBe(true);
        const title = document.getElementById('t');
        expect(document.activeElement).toBe(title);
        expect(title?.getAttribute('tabindex')).toBe('-1');
    });

    it('salta un h1 oculto con visibility (el AppBar transparente de DET-01 antes del scroll)', () => {
        document.body.innerHTML = `
            <div class="tl-app-screen">
                <header class="tl-appbar"><h1 class="tl-appbar__title" style="visibility:hidden">Detalle</h1></header>
                <main><h1 id="t">Garzones</h1></main>
            </div>`;
        focusScreenTitle();
        expect(document.activeElement?.id).toBe('t');
    });
});

describe('rescueFocus', () => {
    it('no mueve el foco si no se perdió', () => {
        document.body.innerHTML = `<div class="tl-app-screen"><h1 class="tl-appbar__title">Perfil</h1><button id="b">Ajustes</button></div>`;
        document.getElementById('b')?.focus();
        rescueFocus('k1', false);
        expect(document.activeElement?.id).toBe('b');
    });

    it('antes de que la persona interactúe, no hace nada', () => {
        setInteractedForTests(false);
        document.body.innerHTML = `<div class="tl-app-screen"><h1 class="tl-appbar__title">Perfil</h1></div>`;
        rescueFocus('k1', false);
        expect(document.activeElement).toBe(document.body);
    });

    it('al llegar a una pantalla con el foco en el body, va al título', () => {
        document.body.innerHTML = `<div class="tl-app-screen"><h1 class="tl-appbar__title" id="t">Configuración</h1></div>`;
        rescueFocus('k2', false);
        expect(document.activeElement?.id).toBe('t');
    });

    it('al volver (POP), devuelve el foco a la tarjeta que abrió el detalle', () => {
        const screen = `
            <div class="tl-app-screen">
                <h1 class="tl-appbar__title">Explorar</h1>
                <main>
                    <a href="#/p/uno" id="uno">Garzones</a>
                    <a href="#/p/dos" id="dos">Cocinero</a>
                </main>
            </div>`;
        document.body.innerHTML = screen;
        rememberFocus('explorar', document.getElementById('dos'));
        // Se fue a DET-01 y volvió: la pantalla se montó de nuevo.
        document.body.innerHTML = '<div class="tl-app-screen"><main><h1>Detalle</h1></main></div>';
        document.body.innerHTML = screen;
        rescueFocus('explorar', true);
        expect(document.activeElement?.id).toBe('dos');
    });

    it('si el control de antes ya no está, va al título', () => {
        document.body.innerHTML = `<div class="tl-app-screen"><h1 class="tl-appbar__title" id="t">Actividad</h1><button>Cancelar turno</button></div>`;
        rememberFocus('act', document.querySelector('button'));
        document.body.innerHTML = `<div class="tl-app-screen"><h1 class="tl-appbar__title" id="t">Actividad</h1></div>`;
        rescueFocus('act', true);
        expect(document.activeElement?.id).toBe('t');
    });

    it('MSG-02: el h1 oculto del AppBar chat', () => {
        document.body.innerHTML = `
            <div class="tl-app-screen">
                <header class="tl-appbar tl-appbar--chat"><div class="tl-appbar__row">
                    <h1 class="tl-vh" tabindex="-1" id="t">Conversación con Taller Los Aromos</h1>
                    <button>Volver</button>
                </div></header>
                <main></main>
            </div>`;
        rescueFocus('chat', false);
        expect(document.activeElement?.id).toBe('t');
    });
});
