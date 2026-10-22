// Navegación del registro: avanzar (push), volver al paso anterior con el
// atrás de Android y el BackButton (useWizardBack) y salir del recorrido sin
// dejar sus pasos en el historial (al terminar, al entrar con una persona de
// la demostración o con «Guardar y salir»).
import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWizardBack } from '../../app/navigation/backHandlers';
import { useOpenPath } from '../../app/navigation/useOpenPath';
import { markFlowEntry, takeFlowDepth } from './store';

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
    /** Sale del recorrido: vuelve a la entrada donde empezó y la reemplaza por `dest`. */
    leave: (dest: string) => void;
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
            const depth = takeFlowDepth();
            if (depth === 0) {
                navigate(dest, { replace: true });
                return;
            }
            // Primero vuelve a donde empezó el recorrido; al llegar, lo reemplaza por el destino.
            const arrived = () => {
                window.removeEventListener('popstate', arrived);
                navigate(dest, { replace: true });
            };
            window.addEventListener('popstate', arrived);
            navigate(-depth);
        },
        [navigate],
    );

    return { forward, backTo, leave };
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
