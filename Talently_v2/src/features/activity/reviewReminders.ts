// Las evaluaciones que la persona ya fue a hacer desde TUR-01 («Dejar reseña»
// de «Evalúa tu turno del …»). Así TUR-01 deja de pedirla al volver de REV-01:
// la evaluación enviada vive en features/processes (REV-01), que Actividad no
// puede leer. Pedido en requests: `markReviewed`/`useReviewed` en
// demo/sessionStore, que REV-01 llame al enviar; cuando esté, TUR-01 excluye
// lo ya evaluado con eso y este archivo se borra.
//
// Vive en memoria mientras la app está abierta, como demo/sessionStore.
import { useSyncExternalStore } from 'react';
import type { DemoActorId } from '../demo/session';

const EMPTY: ReadonlySet<string> = new Set();

let started: ReadonlyMap<DemoActorId, ReadonlySet<string>> = new Map();
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

const snapshot = () => started;

/** La persona tocó «Dejar reseña» del turno de `publicationId`. */
export function markReviewStarted(actorId: DemoActorId, publicationId: string): void {
    const before = started.get(actorId) ?? EMPTY;
    if (before.has(publicationId)) return;
    const next = new Map(started);
    next.set(actorId, new Set([...before, publicationId]));
    started = next;
    listeners.forEach((l) => l());
}

/** Publicaciones cuya evaluación el actor ya fue a hacer en esta sesión. */
export function useReviewsStarted(actorId: DemoActorId): ReadonlySet<string> {
    return useSyncExternalStore(subscribe, snapshot, snapshot).get(actorId) ?? EMPTY;
}

/** Solo para pruebas: vuelve al estado inicial. */
export function resetReviewReminders(): void {
    started = new Map();
    listeners.forEach((l) => l());
}

export function getReviewsStarted(actorId: DemoActorId): ReadonlySet<string> {
    return started.get(actorId) ?? EMPTY;
}
