// Único listener del botón atrás de Android (spec §5.3 regla 4 y
// 02-arquitectura §4.7). Resuelve, en orden:
//   1. cierra la capa abierta (hoja, diálogo, modal)
//   2. formulario con cambios → «¿Descartar cambios?»
//   3. paso N > 1 de un asistente → paso anterior
//   4. historial interno → navigate(-1)
//   5. pestaña distinta de Inicio → Inicio (replace); Bienvenida cuenta como Inicio
//   6. Inicio → toast «Presiona atrás otra vez para salir»; 2.º toque en < 2 s → salir
//      (en la raíz de Inicio el paso 4 no se usa: aunque quede algo debajo, atrás avisa y sale)
// El BackButton del AppBar usa los pasos 1 a 4 con useGoBack(); si no hay
// historial (se llegó por un enlace), vuelve con replace a la ruta que diga la
// pantalla (useGoBack(fallback): /buscar → la última de Explorar) o, si no
// dice, a la raíz de su pestaña o a Inicio.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { closeTopOverlay } from '../ui/overlay';
import { hasDirtyForm, hasInternalHistory, runWizardBack } from './navigation/backHandlers';
import { isTabRoot, paths, tabOf } from './paths';

const EXIT_WINDOW_MS = 2000;

export interface BackPrompts {
    /** Muestra «¿Descartar cambios?» y resuelve true si la persona descarta. */
    confirmDiscard: () => Promise<boolean>;
    /** Toast «Presiona atrás otra vez para salir». */
    showExitHint: () => void;
}

type GoBack = () => void;
type GoBackTo = (fallback?: string) => void;
const GoBackContext = createContext<GoBackTo | null>(null);

export function BackButtonManager({ prompts, children }: { prompts: BackPrompts; children: ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const lastExitHint = useRef(0);
    const busy = useRef(false);
    const promptsRef = useRef(prompts);
    const locationRef = useRef(location);
    useEffect(() => {
        promptsRef.current = prompts;
        locationRef.current = location;
    });

    /** Pasos 1 a 4 (sin `history`, 1 a 3). Devuelve true si resolvió algo. */
    const stepBack = useCallback(async (history = true): Promise<boolean> => {
        if (closeTopOverlay()) return true;
        if (hasDirtyForm()) {
            const discard = await promptsRef.current.confirmDiscard();
            if (!discard) return true;
            // Descartó: sigue hacia atrás sin volver a preguntar.
        }
        if (runWizardBack()) return true;
        if (history && hasInternalHistory()) {
            navigate(-1);
            return true;
        }
        return false;
    }, [navigate]);

    const onHardwareBack = useCallback(async () => {
        // Con «¿Descartar cambios?» abierto, atrás lo cierra (= «Seguir editando»).
        if (busy.current) {
            closeTopOverlay();
            return;
        }
        busy.current = true;
        try {
            // En la raíz de Inicio, atrás no vuelve a lo que haya quedado debajo: avisa y sale (regla 6).
            const atInicio = (pathname: string) => isTabRoot(pathname) && tabOf(pathname) === 'inicio';
            if (await stepBack(!atInicio(locationRef.current.pathname))) return;
            const { pathname } = locationRef.current;
            // Bienvenida (fuera de la sesión) se trata como Inicio: atrás no entra a la
            // sesión que se acaba de cerrar; avisa y el segundo toque sale de la app.
            const outsideSession = pathname === paths.bienvenida();
            if (tabOf(pathname) !== 'inicio' && !outsideSession) {
                navigate(paths.inicio(), { replace: true });
                return;
            }
            const now = Date.now();
            if (now - lastExitHint.current < EXIT_WINDOW_MS) {
                const { App } = await import('@capacitor/app');
                await App.exitApp();
                return;
            }
            lastExitHint.current = now;
            promptsRef.current.showExitHint();
        } finally {
            busy.current = false;
        }
    }, [navigate, stepBack]);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;
        let remove: (() => void) | undefined;
        let cancelled = false;
        import('@capacitor/app').then(({ App }) =>
            App.addListener('backButton', () => void onHardwareBack()).then((h) => {
                if (cancelled) void h.remove();
                else remove = () => void h.remove();
            }),
        );
        return () => {
            cancelled = true;
            remove?.();
        };
    }, [onHardwareBack]);

    const goBack = useCallback<GoBackTo>(
        (fallback) => {
            void stepBack(true).then((done) => {
                if (done) return;
                const tab = tabOf(locationRef.current.pathname);
                void navigate(fallback ?? (tab ? paths[tab]() : paths.inicio()), { replace: true });
            });
        },
        [navigate, stepBack],
    );

    const value = useMemo(() => goBack, [goBack]);
    return <GoBackContext.Provider value={value}>{children}</GoBackContext.Provider>;
}

/**
 * Para el BackButton del AppBar standard: mismo comportamiento que el atrás de
 * Android. `fallback`: a dónde ir (con replace) si no hay historial interno.
 */
export function useGoBack(fallback?: string): GoBack {
    const ctx = useContext(GoBackContext);
    if (!ctx) throw new Error('useGoBack debe usarse dentro de <BackButtonManager>');
    return useCallback(() => ctx(fallback), [ctx, fallback]);
}
