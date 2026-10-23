// Navegación del registro: avanzar (push), volver al paso anterior con el
// atrás de Android y el BackButton (useWizardBack) y salir del recorrido sin
// dejar sus pasos en el historial, ni atrás ni adelante (spec §5.3 regla 6:
// al terminar, al entrar con una persona de la demostración o con «Guardar y
// salir»).
import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWizardBack } from '../../app/navigation/backHandlers';
import { historyIndex, returnToEntry } from '../../app/navigation/history';
import { useOpenPath } from '../../app/navigation/useOpenPath';
import { onbPaths } from './paths';
import { flowEntry, markFlowEntry, takeFlowEntry } from './store';

/** Marca de las entradas que abrió el propio recorrido: volver es `navigate(-1)`. */
const FORWARD = { onb: 'fwd' } as const;

function cameForward(state: unknown): boolean {
    return typeof state === 'object' && state !== null && (state as { onb?: unknown }).onb === 'fwd';
}

export interface Flow {
    /** Abre el paso siguiente (push). Si la pantalla no existe todavía, «Disponible pronto». */
    forward: (path: string, options?: { replace?: boolean }) => boolean;
    /** Vuelve al paso anterior: atrás en el historial si se llegó desde él; si no, lo abre con replace. */
    backTo: (path: string) => void;
    /**
     * Sale del recorrido: vuelve a la entrada donde empezó, la reemplaza por
     * `dest` y descarta las de adelante (el adelante del navegador no reabre los pasos).
     */
    leave: (dest: string) => void;
    /**
     * Con la cuenta ya creada (AUTH-03 verificado): vuelve a Bienvenida, donde
     * empezó el recorrido, y abre `path` encima. Atrás desde ahí ya no pasa por
     * «Crea tu cuenta» ni por el código, y adelante tampoco los reabre.
     */
    openOverWelcome: (path: string) => void;
}

export function useFlow(): Flow {
    const navigate = useNavigate();
    const location = useLocation();
    const { canOpen, soon } = useOpenPath();

    const forward = useCallback(
        (path: string, options?: { replace?: boolean }) => {
            if (!canOpen(path)) {
                soon();
                return false;
            }
            navigate(path, { replace: options?.replace, state: FORWARD });
            return true;
        },
        [canOpen, navigate, soon],
    );

    const backTo = useCallback(
        (path: string) => {
            if (cameForward(location.state)) navigate(-1);
            else navigate(path, { replace: true });
        },
        [location.state, navigate],
    );

    const leave = useCallback(
        (dest: string) => {
            // Como useLeaveSession (CFG-01): al llegar, reemplaza la entrada y un push y un atrás
            // descartan las de adelante.
            returnToEntry(takeFlowEntry(), (d) => void navigate(d), () => {
                void (async () => {
                    await navigate(dest, { replace: true });
                    await navigate(dest);
                    await navigate(-1);
                })();
            });
        },
        [navigate],
    );

    const openOverWelcome = useCallback(
        (path: string) => {
            if (!canOpen(path)) {
                soon();
                return;
            }
            const entry = flowEntry();
            // Sin la entrada de Bienvenida debajo (se recargó en este paso): solo reemplaza este.
            if (entry === null || entry >= historyIndex()) {
                navigate(path, { replace: true, state: FORWARD });
                return;
            }
            returnToEntry(entry, (d) => void navigate(d), () => {
                void (async () => {
                    // Si el recorrido empezó en «Crea tu cuenta» (un enlace directo), queda Bienvenida.
                    await navigate(onbPaths.bienvenida(), { replace: true });
                    await navigate(path, { state: FORWARD });
                })();
            });
        },
        [canOpen, navigate, soon],
    );

    return { forward, backTo, leave, openOverWelcome };
}

/**
 * Registra el paso en el recorrido (para `leave`). Bienvenida pasa `start`:
 * siempre es el comienzo.
 */
export function useFlowEntry(start = false): void {
    useEffect(() => {
        markFlowEntry(start);
    }, [start]);
}

/** El atrás del paso (Android y BackButton): `back` decide qué hacer y siempre lo resuelve. */
export function useStepBack(back: () => void): void {
    useWizardBack(() => {
        back();
        return true;
    });
}
