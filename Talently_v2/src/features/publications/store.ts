// Lo que pasa en el detalle durante la sesión de demostración: postulaciones
// enviadas, el celular verificado en AUTH-08 y los match ya vistos. Vive en
// memoria mientras la app está abierta (como la memoria de pestañas): al
// volver a la publicación, el estado sigue ahí. Cuando vuelva Supabase, cada
// acción es una RPC y este módulo se borra.
import { useSyncExternalStore } from 'react';
import type { BadgeStatus } from '../../ui/Badge/badgeTones';
import type { DemoActorId } from '../demo/session';

export interface SessionApplication {
    /** «Postulado» o «En lista de espera». */
    estado: BadgeStatus;
    /** Cuándo postuló (ms): el match llega un rato después. */
    at: number;
}

interface Snapshot {
    applications: ReadonlyMap<string, SessionApplication>;
    phoneVerified: ReadonlySet<DemoActorId>;
    matchesSeen: ReadonlySet<string>;
}

let state: Snapshot = { applications: new Map(), phoneVerified: new Set(), matchesSeen: new Set() };
const listeners = new Set<() => void>();

const keyOf = (actorId: DemoActorId, publicationId: string) => `${actorId}:${publicationId}`;

function set(next: Partial<Snapshot>): void {
    state = { ...state, ...next };
    listeners.forEach((l) => l());
}

export function applyTo(actorId: DemoActorId, publicationId: string, estado: BadgeStatus): void {
    const applications = new Map(state.applications);
    applications.set(keyOf(actorId, publicationId), { estado, at: Date.now() });
    set({ applications });
}

export function verifyPhone(actorId: DemoActorId): void {
    if (state.phoneVerified.has(actorId)) return;
    set({ phoneVerified: new Set([...state.phoneVerified, actorId]) });
}

export function markMatchSeen(actorId: DemoActorId, publicationId: string): void {
    const key = keyOf(actorId, publicationId);
    if (state.matchesSeen.has(key)) return;
    set({ matchesSeen: new Set([...state.matchesSeen, key]) });
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

const snapshot = () => state;

export interface PublicationSession {
    /** Postulación enviada en esta sesión. */
    application?: SessionApplication;
    /** Verificó su celular en esta sesión (AUTH-08). */
    phoneVerified: boolean;
    /** Ya vio el «¡Hicieron match!» de esta publicación. */
    matchSeen: boolean;
}

/** Lo que esta sesión sabe del actor y la publicación. */
export function usePublicationSession(actorId: DemoActorId, publicationId: string): PublicationSession {
    const s = useSyncExternalStore(subscribe, snapshot, snapshot);
    const key = keyOf(actorId, publicationId);
    return {
        application: s.applications.get(key),
        phoneVerified: s.phoneVerified.has(actorId),
        matchSeen: s.matchesSeen.has(key),
    };
}
