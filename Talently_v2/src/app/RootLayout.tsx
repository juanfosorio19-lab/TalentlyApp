// Capa raíz de toda pantalla v3: avisos (Snackbar), botón atrás de Android
// con sus dos preguntas («¿Descartar cambios?» y «Presiona atrás otra vez
// para salir»), restauración del scroll y rescate del foco al cambiar de pantalla.
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Outlet, ScrollRestoration, useLocation, useNavigationType, type Location } from 'react-router-dom';
import { Dialog } from '../ui/Dialog';
import { SnackbarProvider, useSnackbar } from '../ui/Snackbar';
import { MatchHost } from '../features/publications/MatchHost';
import { BackButtonManager, type BackPrompts } from './BackButtonManager';
import { useFocusRescue } from './navigation/focus';
import { historyIndex } from './navigation/history';
import { noteEntry, noteFirstEntry, rememberTab } from './navigation/tabMemory';
import { isTabRoot, tabOf } from './paths';
import { withoutSheet } from './sheets';

/**
 * Raíces de pestaña: el scroll se guarda por ruta (vuelve donde quedó al cambiar
 * de pestaña), sin la hoja abierta ni sus parámetros: abrir o reabrir una hoja
 * no mueve la página de abajo. Pantallas apiladas: por entrada del historial
 * (atrás vuelve al mismo scroll; una pantalla nueva parte arriba).
 */
const scrollKey = (location: Location) =>
    isTabRoot(location.pathname) ? location.pathname + withoutSheet(location.search, location.state) : location.key;

function Prompts({ children }: { children: (prompts: BackPrompts) => ReactNode }) {
    const snackbar = useSnackbar();
    // Mientras «¿Descartar cambios?» está abierto, aquí espera la respuesta.
    const [pending, setPending] = useState<{ resolve: (discard: boolean) => void } | null>(null);

    const answer = useCallback(
        (discard: boolean) => {
            pending?.resolve(discard);
            setPending(null);
        },
        [pending],
    );

    const prompts = useMemo<BackPrompts>(
        () => ({
            confirmDiscard: () => new Promise<boolean>((resolve) => setPending({ resolve })),
            showExitHint: () => snackbar.show({ message: 'Presiona atrás otra vez para salir' }),
        }),
        [snackbar],
    );

    return (
        <>
            {children(prompts)}
            <Dialog
                open={pending !== null}
                onClose={() => answer(false)}
                title="¿Descartar cambios?"
                cancelLabel="Seguir editando"
                confirmLabel="Descartar"
                destructive
                onConfirm={() => answer(true)}
            >
                Si sales ahora, se pierde lo que cambiaste.
            </Dialog>
        </>
    );
}

/**
 * Guarda la última subruta de cada pestaña (spec §5.3 regla 1), sin la hoja
 * abierta: volver a la pestaña no la reabre (/inicio?sheet=publicar → /inicio).
 */
function TabMemory() {
    const location = useLocation();
    useEffect(() => {
        const index = historyIndex();
        noteFirstEntry(index, location.pathname);
        noteEntry(index, location.pathname);
        const tab = tabOf(location.pathname);
        if (tab && isTabRoot(location.pathname)) rememberTab(tab, location.pathname + withoutSheet(location.search, location.state));
    }, [location]);
    return null;
}

/**
 * El foco al cambiar de pantalla (navigation/focus): si el control tocado ya
 * no está y el foco cayó al body, al volver va al control de antes y, si no,
 * al título de la pantalla nueva. Una sola vez para todas las pantallas.
 */
function FocusRescue() {
    const { key } = useLocation();
    const pop = useNavigationType() === 'POP';
    useFocusRescue(key, pop);
    return null;
}

export function RootLayout() {
    const { pathname, key } = useLocation();
    return (
        // `entryKey`: un aviso sin acción no sigue a la persona a la pantalla siguiente ni de vuelta a la anterior.
        <SnackbarProvider placement={isTabRoot(pathname) ? 'tabbar' : 'no-tabbar'} entryKey={key}>
            <Prompts>
                {(prompts) => (
                    <BackButtonManager prompts={prompts}>
                        <TabMemory />
                        <FocusRescue />
                        <Outlet />
                        <MatchHost />
                        <ScrollRestoration getKey={scrollKey} />
                    </BackButtonManager>
                )}
            </Prompts>
        </SnackbarProvider>
    );
}
