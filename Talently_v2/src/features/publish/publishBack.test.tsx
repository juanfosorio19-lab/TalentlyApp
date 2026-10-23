// Flujo 4 de punta a punta en el router real (HashRouter, como v3.html): Rosa
// abre PUBL-01 desde Inicio, publica el turno de su plantilla y vuelve atrás
// desde PUBL-07. Atrás no reabre la hoja «¿Qué quieres publicar?» ni el
// asistente (spec §5.3 regla 6): queda en /inicio, sin ?sheet.
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createAppRouter } from '../../app/router';
import { DemoSessionProvider } from '../demo/session';
import { resetPublishStore } from './store';

// React 19: act() necesita esta bandera fuera de un runner de React.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLElement | null = null;

beforeEach(() => {
    // jsdom no implementa el scroll de la ventana (ScrollRestoration lo usa).
    window.scrollTo = () => {};
    window.history.replaceState(null, '', '/v3.html?demo=banqueteria#/inicio');
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    const router = createAppRouter();
    act(() =>
        root!.render(
            <DemoSessionProvider>
                <RouterProvider router={router} />
            </DemoSessionProvider>,
        ),
    );
});

afterEach(() => {
    act(() => root?.unmount());
    host?.remove();
    root = null;
    host = null;
    resetPublishStore();
});

/** Espera (dejando correr popstate y los efectos) hasta que se cumpla `ok`. */
async function until(ok: () => boolean, what: string): Promise<void> {
    for (let i = 0; i < 100; i++) {
        if (ok()) return;
        await act(() => new Promise<void>((r) => setTimeout(r, 10)));
    }
    throw new Error(`No pasó: ${what} (URL ${window.location.hash})`);
}

/** El botón visible con ese nombre (también los de las hojas, que van en un portal). */
function button(name: string): HTMLButtonElement | undefined {
    return Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(
        (b) => b.textContent?.trim() === name || b.getAttribute('aria-label') === name,
    );
}

async function click(name: string): Promise<void> {
    await until(() => button(name) !== undefined, `botón «${name}»`);
    act(() => button(name)!.click());
}

const h1 = () => document.querySelector('h1')?.textContent ?? '';
const dialogs = () => Array.from(document.querySelectorAll('[role=dialog]')).map((d) => d.textContent ?? '');

describe('Flujo 4 · atrás desde PUBL-07', () => {
    it('vuelve a Inicio sin la hoja PUBL-01 ni el asistente', async () => {
        await until(() => h1().includes('Hola, Rosa'), 'INI-02');
        await click('Publicar');
        await until(() => window.location.hash.includes('sheet=publicar'), 'PUBL-01 abierta');
        await click('Continuar');
        await until(() => window.location.hash === '#/publicar/turno/1', 'paso 1');
        for (let step = 2; step <= 5; step++) {
            await click('Continuar');
            await until(() => window.location.hash === `#/publicar/turno/${step}`, `paso ${step}`);
        }
        await click('Publicar');
        await until(() => window.location.hash === '#/publicar/turno/listo' && h1() === 'Publicada', 'PUBL-07');

        act(() => window.history.back());
        await until(() => window.location.hash === '#/inicio' && h1().includes('Hola, Rosa'), 'Inicio sin la hoja');
        // Que no siga retrocediendo ni reabra nada: la URL se queda en Inicio, sin ?sheet.
        await act(() => new Promise<void>((r) => setTimeout(r, 100)));
        expect(window.location.hash).toBe('#/inicio');
        expect(dialogs().some((d) => d.includes('¿Qué quieres publicar?'))).toBe(false);
    });
});
