// El historial de las pestañas en el router real (HashRouter, como v3.html):
// - volver a Inicio por la TabBar vuelve a la primera entrada aunque haya
//   otras en medio (paso 6 del atrás: «Presiona atrás otra vez para salir»);
// - «Ver mis postulaciones» en un DET-01 abierto desde ACT-02 no deja dos
//   entradas de Actividad seguidas.
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DemoSessionProvider } from '../../features/demo/session';
import { resetSession } from '../../features/demo/sessionStore';
import { createAppRouter } from '../router';
import { historyIndex } from './history';
import { resetEntriesForTests } from './tabMemory';

// React 19: act() necesita esta bandera fuera de un runner de React.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLElement | null = null;
let router: ReturnType<typeof createAppRouter> | null = null;

beforeEach(() => {
    // jsdom no implementa el scroll de la ventana (ScrollRestoration lo usa).
    window.scrollTo = () => {};
    resetEntriesForTests();
    window.history.replaceState(null, '', '/v3.html?demo=matias#/inicio');
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    router = createAppRouter();
    act(() =>
        root!.render(
            <DemoSessionProvider>
                <RouterProvider router={router!} />
            </DemoSessionProvider>,
        ),
    );
});

afterEach(() => {
    act(() => root?.unmount());
    host?.remove();
    root = null;
    host = null;
    router = null;
    resetSession();
});

/** Espera (dejando correr popstate y los efectos) hasta que se cumpla `ok`. */
async function until(ok: () => boolean, what: string): Promise<void> {
    for (let i = 0; i < 100; i++) {
        if (ok()) return;
        await act(() => new Promise<void>((r) => setTimeout(r, 10)));
    }
    throw new Error(`No pasó: ${what} (URL ${window.location.hash}, idx ${historyIndex()})`);
}

const h1 = () => Array.from(document.querySelectorAll('h1')).map((h) => h.textContent ?? '').join(' | ');

function tab(name: string): HTMLAnchorElement | undefined {
    return Array.from(document.querySelectorAll<HTMLAnchorElement>('.tl-tabbar a')).find((a) => a.textContent?.trim() === name);
}

async function clickTab(name: string): Promise<void> {
    await until(() => tab(name) !== undefined, `pestaña «${name}»`);
    act(() => tab(name)!.click());
}

function button(name: string): HTMLButtonElement | undefined {
    return Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent?.trim() === name);
}

describe('Inicio por la TabBar', () => {
    it('vuelve de un salto a la primera entrada aunque Explorar haya quedado debajo', async () => {
        await until(() => h1().includes('Hola, Matías'), 'INI-01');
        await clickTab('Explorar');
        await until(() => window.location.hash.startsWith('#/explorar') && historyIndex() === 1, 'Explorar (1)');
        await act(() => router!.navigate('/p/turno-garzones-cena-fin-de-ano'));
        await until(() => historyIndex() === 2, 'DET-01 (2)');
        // «Ver mis postulaciones» con Explorar debajo: reemplaza DET-01.
        await act(() => router!.navigate('/actividad?seg=postulaciones', { replace: true }));
        await until(() => window.location.hash.startsWith('#/actividad') && historyIndex() === 2, 'ACT-02 (2)');
        await clickTab('Inicio');
        await until(() => window.location.hash === '#/inicio' && historyIndex() === 0, 'Inicio en la primera entrada');
        expect(h1()).toContain('Hola, Matías');
    });
});

describe('«Ver mis postulaciones» desde un DET-01 abierto en ACT-02', () => {
    it('vuelve a la entrada de Actividad y la reemplaza: atrás va a Inicio', async () => {
        await until(() => h1().includes('Hola, Matías'), 'INI-01');
        await clickTab('Actividad');
        await until(() => window.location.hash.startsWith('#/actividad') && historyIndex() === 1, 'ACT-02 (1)');
        await act(() => router!.navigate('/p/turno-garzones-cena-fin-de-ano'));
        await until(() => historyIndex() === 2 && button('Ver mis postulaciones') !== undefined, 'DET-01 (2)');
        act(() => button('Ver mis postulaciones')!.click());
        await until(
            () => window.location.hash === '#/actividad?seg=postulaciones' && historyIndex() === 1,
            'ACT-02 en la entrada 1',
        );
        act(() => window.history.back());
        await until(() => window.location.hash === '#/inicio' && historyIndex() === 0, 'atrás → Inicio');
    });
});
