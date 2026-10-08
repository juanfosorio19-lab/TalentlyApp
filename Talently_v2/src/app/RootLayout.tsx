// Capa raíz de toda pantalla v3: avisos (Snackbar), botón atrás de Android
// con sus dos preguntas («¿Descartar cambios?» y «Presiona atrás otra vez
// para salir») y restauración del scroll al volver.
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Outlet, ScrollRestoration, useLocation, type Location } from 'react-router-dom';
import { Dialog } from '../ui/Dialog';
import { SnackbarProvider, useSnackbar } from '../ui/Snackbar';
import { BackButtonManager, type BackPrompts } from './BackButtonManager';
import { rememberTab } from './navigation/tabMemory';
import { isTabRoot, tabOf } from './paths';

/**
 * Raíces de pestaña: el scroll se guarda por ruta (vuelve donde quedó al cambiar
 * de pestaña). Pantallas apiladas: por entrada del historial (atrás vuelve al
 * mismo scroll; una pantalla nueva parte arriba).
 */
const scrollKey = (location: Location) =>
    isTabRoot(location.pathname) ? location.pathname + location.search : location.key;

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

/** Guarda la última subruta de cada pestaña (spec §5.3 regla 1). */
function TabMemory() {
    const location = useLocation();
    useEffect(() => {
        const tab = tabOf(location.pathname);
        if (tab && isTabRoot(location.pathname)) rememberTab(tab, location.pathname + location.search);
    }, [location]);
    return null;
}

export function RootLayout() {
    const { pathname } = useLocation();
    return (
        <SnackbarProvider placement={isTabRoot(pathname) ? 'tabbar' : 'no-tabbar'}>
            <Prompts>
                {(prompts) => (
                    <BackButtonManager prompts={prompts}>
                        <TabMemory />
                        <Outlet />
                        <ScrollRestoration getKey={scrollKey} />
                    </BackButtonManager>
                )}
            </Prompts>
        </SnackbarProvider>
    );
}
