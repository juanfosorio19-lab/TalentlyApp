// Lo que la persona envía en VER-02 durante la sesión de demostración: su
// identidad queda «En revisión». Vive en memoria mientras la app está abierta.
// Pedido para demo/sessionStore (submitIdentity / useIdentityStatus) para que
// PUBL-04 y PUBL-07 (flujo 5) y el Perfil lo vean; cuando llegue, este
// archivo se borra. Las fotos nunca se guardan aquí: solo el envío.
import { useSyncExternalStore } from 'react';
import type { DemoActorId } from '../demo/session';

let submitted: ReadonlyMap<DemoActorId, number> = new Map();
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

const snapshot = () => submitted;

/** VER-02 · «Enviar»: la identidad de la persona queda en revisión. */
export function submitIdentity(personId: DemoActorId, at: number = Date.now()): void {
    if (submitted.has(personId)) return;
    const next = new Map(submitted);
    next.set(personId, at);
    submitted = next;
    listeners.forEach((l) => l());
}

/** ¿La persona envió su identidad en esta sesión? */
export function hasSubmittedIdentity(personId: DemoActorId): boolean {
    return submitted.has(personId);
}

/** Envíos de identidad de esta sesión (persona → cuándo). */
export function useIdentitySubmissions(): ReadonlyMap<DemoActorId, number> {
    return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** Solo para pruebas. */
export function resetVerificationStore(): void {
    submitted = new Map();
    listeners.forEach((l) => l());
}
