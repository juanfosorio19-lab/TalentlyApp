// Único listener del botón atrás de Android (spec §5.3 regla 4 y
// 02-arquitectura §4.7). Resuelve, en orden:
//   1. cierra la capa abierta (hoja, diálogo, modal)
//   2. formulario con cambios → «¿Descartar cambios?»
//   3. paso N > 1 de un asistente → paso anterior
//   4. historial interno → navigate(-1)
//   5. pestaña distinta de Inicio → Inicio (replace)
//   6. Inicio → toast «Presiona atrás otra vez para salir»; 2.º toque en < 2 s → salir
// El BackButton del AppBar usa los pasos 1 a 4 con useGoBack(); si no hay
// historial (se llegó por un enlace), vuelve a la raíz de su pestaña o a Inicio.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { closeTopOverlay } from '../ui/overlay';
import { hasDirtyForm, hasInternalHistory, runWizardBack } from './navigation/backHandlers';
import { paths, tabOf } from './paths';

const EXIT_WINDOW_MS = 2000;

export interface BackPrompts {
    /** Muestra «¿Descartar cambios?» y resuelve true si la persona descarta. */
    confirmDiscard: () => Promise<boolean>;
    /** Toast «Presiona atrás otra vez para salir». */
    showExitHint: () => void;
}

type GoBack = () => void;
const GoBackContext = createContext<GoBack | null>(null);

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

    /** Pasos 1 a 4. Devuelve true si resolvió algo. */
    const stepBack = useCallback(async (): Promise<boolean> => {
        if (closeTopOverlay()) return true;
        if (hasDirtyForm()) {
            const discard = await promptsRef.current.confirmDiscard();
            if (!discard) return true;
            // Descartó: sigue hacia atrás sin volver a preguntar.
        }
        if (runWizardBack()) return true;
        if (hasInternalHistory()) {
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
            if (await stepBack()) return;
            const tab = tabOf(locationRef.current.pathname);
            if (tab !== 'inicio') {
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

    const goBack = useCallback<GoBack>(() => {
        void stepBack().then((done) => {
            if (done) return;
            const tab = tabOf(locationRef.current.pathname);
            navigate(tab ? paths[tab]() : paths.inicio(), { replace: true });
        });
    }, [navigate, stepBack]);

    const value = useMemo(() => goBack, [goBack]);
    return <GoBackContext.Provider value={value}>{children}</GoBackContext.Provider>;
}

/** Para el BackButton del AppBar standard: mismo comportamiento que el atrás de Android. */
export function useGoBack(): GoBack {
    const ctx = useContext(GoBackContext);
    if (!ctx) throw new Error('useGoBack debe usarse dentro de <BackButtonManager>');
    return ctx;
}
