// Las conversaciones durante la sesión de demostración, en UN solo lugar para
// Mensajes (MSG-01, MSG-02), el badge de la pestaña Mensajes (AppShell) y el
// KPI «Conversaciones sin responder» de INI-02: lo que la persona hace sobre
// los datos (mensajes enviados, leídos, borrador, certificado compartido,
// bloqueo) y qué conversaciones existen ya en la sesión (las de una
// postulación que el actor todavía no envía, no: conversationInSession).
// Vive en memoria: al recargar vuelve a los datos de features/demo. Cuando
// vuelva la base de datos, cada acción pasa a ser su RPC.
import { useMemo, useSyncExternalStore } from 'react';
import { getConversations } from './data';
import {
    afterReachedInSession,
    getSessionState,
    noteConversationRead,
    startsWithoutApplication,
    useSessionState,
    type PendingMatch,
    type SessionApplication,
} from './sessionStore';
import type { DemoConversation, DemoViewerId } from './types';

/** Lo que tarda el envío simulado («Enviando…» → «Enviado»). */
export const SEND_DELAY_MS = 700;

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

/** La abrió: sus no leídos pasan a 0 y su «te escribió» de la campana queda leído (useInbox). */
export function markRead(id: string): void {
    update(id, (s) => (s.read ? s : { ...s, read: true }));
    noteConversationRead(id);
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

/** Flujo 10: comparte el certificado (la tarjeta de sistema entra a la conversación a esta hora). */
export function shareCertificate(id: string, hora: string): void {
    const entryId = `cert-${nextId++}`;
    update(id, (s) => ({ ...s, touched: clock++, entries: [...s.entries, { kind: 'certificado', id: entryId, off: false, hora }] }));
}

/** «Dejar de compartir»: la tarjeta pasa a «Ya no está disponible». */
export function stopSharing(id: string, entryId: string): void {
    update(id, (s) => ({
        ...s,
        entries: s.entries.map((e) => (e.kind === 'certificado' && e.id === entryId ? { ...e, off: true } : e)),
    }));
}

/**
 * Bloquear cierra la conversación y revoca de inmediato el certificado que
 * quien mira haya compartido (spec §10.1.1: «al cerrar la conversación por
 * bloqueo, el acceso compartido se revoca»). Desbloquear no lo vuelve a
 * compartir: hay que hacerlo otra vez desde Adjuntar.
 */
export function setBlocked(id: string, blocked: boolean): void {
    update(id, (s) => {
        if (s.blocked === blocked) return s;
        if (!blocked) return { ...s, blocked };
        return {
            ...s,
            blocked,
            entries: s.entries.map((e) => (e.kind === 'certificado' && !e.off ? { ...e, off: true } : e)),
        };
    });
}

/** Lectura sin React (pruebas). */
export function getConversationState(id: string): ConversationState {
    return snapshot.get(id) ?? EMPTY_STATE;
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

/** Solo para pruebas: vuelve al estado inicial. */
export function resetConversations(): void {
    snapshot = new Map();
    listeners.forEach((l) => l());
}

// ─── Qué conversaciones existen en la sesión ────────────────────────────────

/**
 * ¿La conversación ya existe en esta sesión? Los datos traen el «después» del
 * flujo 3: «Taller Los Aromos» (Pedro) conversa sobre una postulación que, en
 * una sesión nueva, el actor todavía no envía (startsWithoutApplication).
 * Aparece cuando llega el match (DET-03), igual que sus notificaciones
 * (useInbox) y su proceso (PRC-01): mientras el match viene en camino
 * (`pendingMatches`), todavía no existe.
 */
export function conversationInSession(
    conv: DemoConversation,
    applications: ReadonlyMap<string, SessionApplication>,
    pendingMatches: ReadonlyMap<string, PendingMatch> = getSessionState().pendingMatches,
): boolean {
    const publicationId = conv.contexto.publicationId;
    if (!publicationId || !startsWithoutApplication(conv.viewerId, publicationId)) return true;
    return afterReachedInSession(applications, pendingMatches, conv.viewerId, publicationId);
}

/** Las conversaciones de quien mira, las que existen en la sesión (recién registrado: ninguna). */
export function conversationsOf(
    viewerId: DemoViewerId,
    recienRegistrado: boolean,
    applications: ReadonlyMap<string, SessionApplication>,
    pendingMatches: ReadonlyMap<string, PendingMatch> = getSessionState().pendingMatches,
): DemoConversation[] {
    if (recienRegistrado) return [];
    return getConversations(viewerId).filter((c) => conversationInSession(c, applications, pendingMatches));
}

/** MSG-01: las conversaciones de quien mira, al día con la sesión. */
export function useConversations(viewerId: DemoViewerId, recienRegistrado = false): DemoConversation[] {
    const { applications, pendingMatches } = useSessionState();
    return useMemo(
        () => conversationsOf(viewerId, recienRegistrado, applications, pendingMatches),
        [viewerId, recienRegistrado, applications, pendingMatches],
    );
}

/** No leídos reales: los de los datos, salvo las conversaciones que ya abrió. */
export function unreadOf(conversations: readonly DemoConversation[], states: ReadonlyMap<string, ConversationState>): number {
    return conversations.reduce((total, c) => total + (states.get(c.id)?.read ? 0 : c.sinLeer), 0);
}

/** El badge de la pestaña Mensajes: lo mismo que cuenta MSG-01. */
export function useUnreadMessages(viewerId: DemoViewerId, recienRegistrado = false): number {
    const conversations = useConversations(viewerId, recienRegistrado);
    return unreadOf(conversations, useConversationStates());
}

/**
 * ¿Falta responder? El último mensaje de texto es de la otra parte y quien
 * mira no escribió nada en esta sesión. Un match sin mensajes no cuenta.
 */
export function isUnanswered(conv: DemoConversation, state: ConversationState): boolean {
    if (state.blocked) return false;
    if (state.entries.some((e) => e.kind === 'texto')) return false;
    const last = conv.mensajes.filter((m) => m.tipo === 'texto').at(-1);
    return last?.tipo === 'texto' && last.de === 'otro';
}

/** «Conversaciones sin responder» (KPI de INI-02). */
export function unansweredOf(conversations: readonly DemoConversation[], states: ReadonlyMap<string, ConversationState>): number {
    return conversations.filter((c) => isUnanswered(c, states.get(c.id) ?? EMPTY_STATE)).length;
}

export function useUnansweredConversations(viewerId: DemoViewerId, recienRegistrado = false): number {
    const conversations = useConversations(viewerId, recienRegistrado);
    return unansweredOf(conversations, useConversationStates());
}
