// Identidad durante la sesión de demostración, con la MISMA forma pedida para
// demo/sessionStore («requests»): `identityPendingAtStart(actorId)` (como
// `phonePendingAtStart`), `submitIdentity(personId)` y
// `useIdentityStatus(personId, inData)` → 'pending' | 'review' | 'verified'.
// Cuando llegue a demo/sessionStore, VER-01 y VER-02 cambian solo el import y
// este archivo se borra; PUBL-04 (needsIdentity), PUBL-07 y el Perfil leerán
// de ahí lo mismo que aquí. Vive en memoria; las fotos nunca se guardan: solo
// el envío.
import { useSyncExternalStore } from 'react';
import type { DemoActorId } from '../demo/session';
import { identityStatusOf, type IdentityStatus } from './model';

/**
 * Flujo 5: Carolina verifica su identidad en VER-02 antes de publicar su aviso
 * (PUBL-04-identidad: «Falta verificar tu identidad»). Los datos traen el
 * «después» (Identidad verificada); como `phonePendingAtStart`, parte sin
 * verificar.
 */
const IDENTITY_PENDING_AT_START: readonly DemoActorId[] = ['carolina'];

export function identityPendingAtStart(actorId: DemoActorId): boolean {
    return IDENTITY_PENDING_AT_START.includes(actorId);
}

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

/** Estado de la identidad sin React (como `isPhoneVerified`). `inData`: «Identidad verificada» en los datos. */
export function getIdentityStatus(personId: DemoActorId, inData: boolean): IdentityStatus {
    return identityStatusOf({ inData, pendingAtStart: identityPendingAtStart(personId), submitted: submitted.has(personId) });
}

/** Estado de la identidad de la persona al día con lo enviado en la sesión. */
export function useIdentityStatus(personId: DemoActorId, inData: boolean): IdentityStatus {
    const current = useSyncExternalStore(subscribe, snapshot, snapshot);
    return identityStatusOf({ inData, pendingAtStart: identityPendingAtStart(personId), submitted: current.has(personId) });
}

/** Solo para pruebas. */
export function resetVerificationStore(): void {
    submitted = new Map();
    listeners.forEach((l) => l());
}
