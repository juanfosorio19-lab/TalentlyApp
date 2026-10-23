import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { BackButtonManager, type BackPrompts } from './BackButtonManager';
import { hasInteracted, setInteractedForTests } from './navigation/focus';

// El atrás de Android (Capacitor `backButton`) simulado: la app corre como nativa y el listener queda aquí.
const listeners: (() => void)[] = [];
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => true } }));
vi.mock('@capacitor/app', () => ({
    App: {
        addListener: (_event: string, cb: () => void) => {
            listeners.push(cb);
            return Promise.resolve({ remove: () => Promise.resolve() });
        },
        exitApp: () => Promise.resolve(),
    },
}));

// React 19: act() necesita esta bandera fuera de un runner de React.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
afterEach(() => {
    act(() => root?.unmount());
    root = null;
    listeners.length = 0;
});

const prompts: BackPrompts = { confirmDiscard: () => Promise.resolve(true), showExitHint: () => undefined };

describe('BackButtonManager · atrás de Android', () => {
    it('cuenta como interacción: FocusRescue lleva el foco al título de la pantalla a la que vuelve', async () => {
        setInteractedForTests(false);
        const router = createMemoryRouter(
            [{ path: '*', element: <BackButtonManager prompts={prompts}>{null}</BackButtonManager> }],
            { initialEntries: ['/mensajes'] },
        );
        root = createRoot(document.createElement('div'));
        await act(async () => root!.render(<RouterProvider router={router} />));
        expect(listeners).toHaveLength(1);
        expect(hasInteracted()).toBe(false);
        await act(async () => listeners[0]?.());
        expect(hasInteracted()).toBe(true);
        // Paso 5: desde otra pestaña sin historial, a Inicio.
        expect(router.state.location.pathname).toBe('/inicio');
    });
});
