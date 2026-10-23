// PUBL-07 en el router real y en StrictMode (como main.tsx): «Ver publicación»
// solo abre la publicación de los datos si lo publicado es su borrador sin
// cambios, y al volver de VER-02 se publica el aviso que quedó guardado
// aunque el efecto corra dos veces.
import { StrictMode, act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { createAppRouter } from '../../app/router';
import { resetManage } from '../demo/manageState';
import { DEMO_ACTORS, DemoSessionProvider } from '../demo/session';
import { initialHogar } from './model/hogar';
import { summaryOf } from './model/summary';
import { initialTurno } from './model/turno';
import { awaitIdentity, getPublished, hogarDrafts, markPublished, resetPublishStore } from './store';

// React 19: act() necesita esta bandera fuera de un runner de React.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLElement | null = null;

function mount(url: string): void {
    // jsdom no implementa el scroll de la ventana (ScrollRestoration lo usa).
    window.scrollTo = () => {};
    window.history.replaceState(null, '', url);
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
    const router = createAppRouter();
    act(() =>
        root!.render(
            <StrictMode>
                <DemoSessionProvider>
                    <RouterProvider router={router} />
                </DemoSessionProvider>
            </StrictMode>,
        ),
    );
}

afterEach(() => {
    act(() => root?.unmount());
    host?.remove();
    root = null;
    host = null;
    resetPublishStore();
    resetManage();
});

async function until(ok: () => boolean, what: string): Promise<void> {
    // La primera pantalla de un feature llega con su chunk (carga diferida): hasta 5 s.
    for (let i = 0; i < 500; i++) {
        if (ok()) return;
        await act(() => new Promise<void>((r) => setTimeout(r, 10)));
    }
    throw new Error(`No pasó: ${what} (URL ${window.location.hash}, h1 «${h1()}»)`);
}

const h1 = () => document.querySelector('h1')?.textContent ?? '';
const buttons = () => Array.from(document.querySelectorAll('button')).map((b) => b.textContent?.trim() ?? '');
const body = () => document.body.textContent ?? '';

describe('PUBL-07 · «Ver publicación»', () => {
    it('flujo 4: la plantilla sin cambios abre «Garzones fin de semana»', async () => {
        markPublished('banqueteria', summaryOf(DEMO_ACTORS.banqueteria, initialTurno('banqueteria')));
        mount('/v3.html?demo=banqueteria#/publicar/turno/listo');
        await until(() => h1() === 'Publicada', 'PUBL-07');
        expect(buttons()).toEqual(expect.arrayContaining(['Ver publicación', 'Ir a Inicio']));
        expect(body()).toContain('«Garzones fin de semana» ya aparece en Explorar · Turnos');
    });

    it('otro turno no abre «Garzones fin de semana» ni dice que ya aparece en Explorar', async () => {
        const otro = { ...initialTurno('banqueteria'), titulo: 'Garzones para cóctel' };
        markPublished('banqueteria', summaryOf(DEMO_ACTORS.banqueteria, otro));
        mount('/v3.html?demo=banqueteria#/publicar/turno/listo');
        await until(() => h1() === 'Publicada', 'PUBL-07');
        expect(buttons()).toContain('Ir a Inicio');
        expect(buttons()).not.toContain('Ver publicación');
        expect(body()).toContain('Publicamos «Garzones para cóctel»');
        expect(body()).not.toContain('ya aparece en Explorar');
    });

    it('flujo 5: al volver de VER-02 publica el aviso guardado, también con el efecto doble de StrictMode', async () => {
        const adentro = { ...initialHogar('carolina'), modalidad: 'adentro' as const };
        hogarDrafts.replace('carolina', adentro);
        hogarDrafts.save('carolina', initialHogar('carolina'), 5);
        awaitIdentity('carolina', 'hogar');
        mount('/v3.html?demo=carolina#/publicar/hogar/listo');
        await until(() => h1() === 'En revisión' && getPublished('carolina', 'hogar') !== undefined, 'PUBL-07 en revisión');
        expect(getPublished('carolina', 'hogar')).toMatchObject({ titulo: 'Asesor/a del hogar puertas adentro', publicationId: null });
        expect(buttons()).toContain('Ir a Inicio');
        expect(buttons()).not.toContain('Ver publicación');
    });
});
