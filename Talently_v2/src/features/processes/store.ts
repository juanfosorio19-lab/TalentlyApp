// Lo que solo PRC-01-hogar cambia durante la sesión de demostración: el
// checklist legal del hogar marcado. Las postulaciones retiradas (PRC-01) y
// las evaluaciones enviadas (REV-01) viven en demo/sessionStore
// (withdrawApplication/useWithdrawn y sendReview/useReview), porque ACT-02,
// Inicio, DET-01 y TUR-01 también las ven. Vive en memoria mientras la app
// está abierta.
import { useCallback, useSyncExternalStore } from 'react';
import type { DemoActorId } from '../demo/session';

interface ProcessesState {
    /** `${actorId}:${processId}` → pasos del checklist legal marcados (por índice). */
    checklist: ReadonlyMap<string, readonly boolean[]>;
}

const INITIAL: ProcessesState = {
    checklist: new Map(),
};

let state: ProcessesState = INITIAL;
const listeners = new Set<() => void>();

function set(next: Partial<ProcessesState>): void {
    state = { ...state, ...next };
    listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

const snapshot = () => state;

const keyOf = (actorId: DemoActorId, id: string) => `${actorId}:${id}`;

/** Solo para pruebas: vuelve al estado inicial. */
export function resetProcesses(): void {
    set(INITIAL);
}

function useProcessesState(): ProcessesState {
    return useSyncExternalStore(subscribe, snapshot, snapshot);
}

// ─── Checklist legal del hogar (PRC-01-hogar) ───────────────────────────────

/**
 * Los pasos marcados del checklist: los de la sesión o, si la persona aún no
 * toca ninguno, los que traen los datos (`hecho`).
 */
export function useChecklist(
    actorId: DemoActorId,
    processId: string,
    initial: readonly boolean[],
): [readonly boolean[], (index: number, done: boolean) => void] {
    const saved = useProcessesState().checklist.get(keyOf(actorId, processId));
    const current = saved ?? initial;
    const toggle = useCallback(
        (index: number, done: boolean) => {
            const key = keyOf(actorId, processId);
            const base = state.checklist.get(key) ?? initial;
            const next = base.map((v, i) => (i === index ? done : v));
            const checklist = new Map(state.checklist);
            checklist.set(key, next);
            set({ checklist });
        },
        [actorId, processId, initial],
    );
    return [current, toggle];
}
