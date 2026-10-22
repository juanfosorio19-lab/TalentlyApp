// Lo que Procesos y reseñas cambia durante la sesión de demostración:
// postulaciones retiradas (PRC-01), el checklist legal del hogar marcado
// (PRC-01-hogar) y las evaluaciones enviadas (REV-01). Vive en memoria
// mientras la app está abierta, como demo/sessionStore.
//
// Pedido en «requests»: subir `withdrawn` y `reviews` a demo/sessionStore
// para que ACT-02, Inicio, Mensajes y DET-01 vean la postulación retirada y
// el turno ya evaluado. Cuando esté allá, este archivo solo guarda el
// checklist (o se borra) sin tocar las pantallas.
import { useCallback, useSyncExternalStore } from 'react';
import type { DemoActorId } from '../demo/session';

/** Una evaluación enviada desde REV-01. */
export interface SentReview {
    /** Nota de 1 a 5. */
    rating: number;
    /** Etiquetas elegidas («Pago a tiempo»). */
    tags: string[];
    comment: string;
    /** Cuándo se envió (ms). */
    at: number;
}

interface ProcessesState {
    /** `${actorId}:${processId}` de las postulaciones retiradas. */
    withdrawn: ReadonlySet<string>;
    /** `${actorId}:${processId}` → pasos del checklist legal marcados (por índice). */
    checklist: ReadonlyMap<string, readonly boolean[]>;
    /** `${actorId}:${publicationId}` → evaluación enviada. */
    reviews: ReadonlyMap<string, SentReview>;
}

const INITIAL: ProcessesState = {
    withdrawn: new Set(),
    checklist: new Map(),
    reviews: new Map(),
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

// ─── Retirar postulación (PRC-01) ───────────────────────────────────────────

export function withdraw(actorId: DemoActorId, processId: string): void {
    const key = keyOf(actorId, processId);
    if (state.withdrawn.has(key)) return;
    set({ withdrawn: new Set([...state.withdrawn, key]) });
}

export function isWithdrawn(actorId: DemoActorId, processId: string): boolean {
    return state.withdrawn.has(keyOf(actorId, processId));
}

export function useWithdrawn(actorId: DemoActorId, processId: string): boolean {
    return useProcessesState().withdrawn.has(keyOf(actorId, processId));
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

// ─── Evaluaciones (REV-01) ──────────────────────────────────────────────────

export function sendReview(actorId: DemoActorId, publicationId: string, review: Omit<SentReview, 'at'>): void {
    const reviews = new Map(state.reviews);
    reviews.set(keyOf(actorId, publicationId), { ...review, at: Date.now() });
    set({ reviews });
}

export function getReview(actorId: DemoActorId, publicationId: string): SentReview | undefined {
    return state.reviews.get(keyOf(actorId, publicationId));
}

export function useReview(actorId: DemoActorId, publicationId: string): SentReview | undefined {
    return useProcessesState().reviews.get(keyOf(actorId, publicationId));
}
