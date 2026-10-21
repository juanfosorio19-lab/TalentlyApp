// Estado local de las conversaciones mientras Supabase está pausado: lo que
// la persona hace en esta sesión sobre los datos de demostración (mensajes
// enviados, leídos, borrador, certificado compartido, bloqueo). Vive en
// memoria: al recargar vuelve a los datos de features/demo. Cuando vuelva la
// base de datos, cada acción pasa a ser su RPC y este módulo se borra.
import { useSyncExternalStore } from 'react';
import { SEND_DELAY_MS } from './mock';

/** Estado real de un mensaje propio enviado en esta sesión (MessageBubble). */
export type LocalStatus = 'sending' | 'sent' | 'queued';

export type LocalEntry =
    | { kind: 'texto'; id: string; texto: string; hora: string; status: LocalStatus }
    /** Flujo 10: compartió su certificado de antecedentes. `off` = «Dejar de compartir». */
    | { kind: 'certificado'; id: string; off: boolean; hora?: string };

export interface ConversationState {
    /** Lo nuevo, en orden, después de los mensajes de la demo. */
    entries: readonly LocalEntry[];
    /** La abrió: sus no leídos pasan a 0. */
    read: boolean;
    /** Lo escrito y no enviado: vuelve al abrir otra vez la conversación. */
    draft: string;
    blocked: boolean;
    /** Orden en la bandeja: la última con actividad va arriba (0 = sin actividad nueva). */
    touched: number;
}

export const EMPTY_STATE: ConversationState = { entries: [], read: false, draft: '', blocked: false, touched: 0 };

let snapshot: ReadonlyMap<string, ConversationState> = new Map();
const listeners = new Set<() => void>();
let nextId = 1;
let clock = 1;

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function update(id: string, change: (s: ConversationState) => ConversationState): void {
    const current = snapshot.get(id) ?? EMPTY_STATE;
    const next = change(current);
    if (next === current) return;
    const map = new Map(snapshot);
    map.set(id, next);
    snapshot = map;
    listeners.forEach((l) => l());
}

const getSnapshot = () => snapshot;

/** Todas las conversaciones con estado local (MSG-01). */
export function useConversationStates(): ReadonlyMap<string, ConversationState> {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Una conversación (MSG-02). */
export function useConversationState(id: string): ConversationState {
    const all = useConversationStates();
    return all.get(id) ?? EMPTY_STATE;
}

export function markRead(id: string): void {
    update(id, (s) => (s.read ? s : { ...s, read: true }));
}

export function setDraft(id: string, draft: string): void {
    update(id, (s) => (s.draft === draft ? s : { ...s, draft }));
}

function setStatus(id: string, entryId: string, status: LocalStatus): void {
    update(id, (s) => ({
        ...s,
        entries: s.entries.map((e) => (e.kind === 'texto' && e.id === entryId ? { ...e, status } : e)),
    }));
}

function deliver(id: string, entryId: string): void {
    window.setTimeout(() => setStatus(id, entryId, 'sent'), SEND_DELAY_MS);
}

/**
 * Envía un mensaje propio: «Enviando…» y luego «Enviado» (nunca «Leído»: en la
 * demo la otra parte no lo abre). Sin conexión queda en cola y sale solo al
 * volver la conexión.
 */
export function sendMessage(id: string, texto: string, hora: string): void {
    const entryId = `local-${nextId++}`;
    const status: LocalStatus = navigator.onLine ? 'sending' : 'queued';
    update(id, (s) => ({
        ...s,
        draft: '',
        touched: clock++,
        entries: [...s.entries, { kind: 'texto', id: entryId, texto, hora, status }],
    }));
    if (status === 'sending') deliver(id, entryId);
}

/** Flujo 10: comparte el certificado (la tarjeta de sistema entra a la conversación). */
export function shareCertificate(id: string): void {
    const entryId = `cert-${nextId++}`;
    update(id, (s) => ({ ...s, touched: clock++, entries: [...s.entries, { kind: 'certificado', id: entryId, off: false }] }));
}

/** «Dejar de compartir»: la tarjeta pasa a «Ya no está disponible». */
export function stopSharing(id: string, entryId: string): void {
    update(id, (s) => ({
        ...s,
        entries: s.entries.map((e) => (e.kind === 'certificado' && e.id === entryId ? { ...e, off: true } : e)),
    }));
}

export function setBlocked(id: string, blocked: boolean): void {
    update(id, (s) => (s.blocked === blocked ? s : { ...s, blocked }));
}

// Al volver la conexión, lo que quedó en cola sale solo.
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        for (const [id, s] of snapshot) {
            for (const e of s.entries) {
                if (e.kind === 'texto' && e.status === 'queued') {
                    setStatus(id, e.id, 'sending');
                    deliver(id, e.id);
                }
            }
        }
    });
}

function subscribeOnline(listener: () => void): () => void {
    window.addEventListener('online', listener);
    window.addEventListener('offline', listener);
    return () => {
        window.removeEventListener('online', listener);
        window.removeEventListener('offline', listener);
    };
}

/** `false` sin conexión: Banner «Sin conexión…» y los mensajes nuevos quedan en cola. */
export function useOnline(): boolean {
    return useSyncExternalStore(
        subscribeOnline,
        () => navigator.onLine,
        () => true,
    );
}
