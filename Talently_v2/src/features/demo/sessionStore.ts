// Lo que pasa durante la sesión de demostración, en UN solo lugar para todas
// las pestañas: notificaciones leídas, postulaciones enviadas, turnos
// cancelados, celular verificado, match por llegar y lo decidido en el deck.
// Vive en memoria mientras la app está abierta (al recargar vuelve a los
// datos de features/demo). Cuando vuelva Supabase, cada acción es una RPC y
// este módulo se reemplaza por las consultas de cada feature.
//
// Regla: ninguna pantalla guarda estado de sesión «propio» que otra pestaña
// deba ver (la campana, ACT-02, Inicio y el deck leen de aquí).
import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { BadgeStatus } from '../../ui/Badge/badgeTones';
import { getApplications, getNotifications, getPublication } from './data';
import type { DemoActorId } from './session';
import type { DemoApplication, DemoNotification, DemoViewerId } from './types';

// ─── Estado ─────────────────────────────────────────────────────────────────

export interface SessionApplication {
    /** «Postulado» o «En lista de espera». */
    estado: BadgeStatus;
    /** Cuándo postuló (ms). */
    at: number;
}

export interface PendingMatch {
    actorId: DemoActorId;
    publicationId: string;
    /** Cuándo aparece «¡Hicieron match!» (ms). */
    dueAt: number;
}

export type DeckDecision = 'si' | 'no';

interface SessionState {
    readNotifications: ReadonlySet<string>;
    /** `${actorId}:${publicationId}` → postulación de esta sesión. */
    applications: ReadonlyMap<string, SessionApplication>;
    /** Ids de DemoApplication con el turno cancelado en TUR-01. */
    cancelledShifts: ReadonlySet<string>;
    phoneVerified: ReadonlySet<DemoActorId>;
    /** `${actorId}:${publicationId}` → match por llegar. */
    pendingMatches: ReadonlyMap<string, PendingMatch>;
    matchesSeen: ReadonlySet<string>;
    /** `${actorId}:${publicationId}` → «Me interesa» / «No me interesa» en el deck o el detalle. */
    decisions: ReadonlyMap<string, DeckDecision>;
}

const INITIAL: SessionState = {
    readNotifications: new Set(),
    applications: new Map(),
    cancelledShifts: new Set(),
    phoneVerified: new Set(),
    pendingMatches: new Map(),
    matchesSeen: new Set(),
    decisions: new Map(),
};

let state: SessionState = INITIAL;
const listeners = new Set<() => void>();

function set(next: Partial<SessionState>): void {
    state = { ...state, ...next };
    listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

const snapshot = () => state;

export const keyOf = (actorId: DemoActorId, publicationId: string) => `${actorId}:${publicationId}`;

/** Todo el estado de la sesión (para selectores propios con useMemo). */
export function useSessionState(): SessionState {
    return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** Solo para pruebas: vuelve al estado inicial. */
export function resetSession(): void {
    set(INITIAL);
}

// ─── Inicio de los flujos del prototipo ─────────────────────────────────────

/**
 * Publicaciones que el prototipo muestra ANTES de postular: los datos traen el
 * «después» (ACT-02 ya dice «Postulado», PRC-01 ya está en entrevista). Para
 * recorrer los flujos 2 y 3, en estas el actor parte sin postulación hasta
 * que postula en la sesión (y ACT-02, la Agenda e Inicio tampoco la muestran).
 */
const FLOW_START: Partial<Record<DemoActorId, readonly string[]>> = {
    matias: ['turno-garzones-matrimonio'], // flujo 2 · DET-01-turno
    pedro: ['empleo-mecanico-automotriz'], // flujo 3 · DET-01-empleo-pedro
    jorge: ['empleo-guardia-4x4'], // apoyo · DET-01-empleo, DET-02, DET-03
};

export function startsWithoutApplication(actorId: DemoActorId, publicationId: string): boolean {
    return FLOW_START[actorId]?.includes(publicationId) ?? false;
}

/** Matías verifica su celular en AUTH-08 (flujo 2): al empezar la sesión todavía no lo tiene. */
const PHONE_PENDING_AT_START: readonly DemoActorId[] = ['matias'];

export function phonePendingAtStart(actorId: DemoActorId): boolean {
    return PHONE_PENDING_AT_START.includes(actorId);
}

// ─── Notificaciones (NOT-01 y todas las campanas) ───────────────────────────

export function markNotificationsRead(ids: readonly string[]): void {
    const pending = ids.filter((id) => !state.readNotifications.has(id));
    if (!pending.length) return;
    set({ readNotifications: new Set([...state.readNotifications, ...pending]) });
}

export interface Inbox {
    /** Notificaciones con lo leído al día (una organización ve la bandeja de quien la administra). */
    items: DemoNotification[];
    /** Contador real de la campana (spec §5.1: solo no leídos reales). */
    unread: number;
    markRead: (id: string) => void;
    markAllRead: () => void;
}

/**
 * La bandeja del actor. `recienRegistrado` (INI-01-jorge-nuevo) todavía no
 * tiene notificaciones. TODAS las campanas usan este hook.
 */
export function useInbox(viewerId: DemoViewerId, recienRegistrado = false): Inbox {
    const { readNotifications } = useSessionState();
    const items = useMemo(() => {
        if (recienRegistrado) return [];
        return getNotifications(viewerId).map((n) => (n.sinLeer && readNotifications.has(n.id) ? { ...n, sinLeer: false } : n));
    }, [viewerId, recienRegistrado, readNotifications]);
    const unread = items.filter((n) => n.sinLeer).length;
    const markRead = useCallback((id: string) => markNotificationsRead([id]), []);
    const markAllRead = useCallback(() => markNotificationsRead(items.filter((n) => n.sinLeer).map((n) => n.id)), [items]);
    return { items, unread, markRead, markAllRead };
}

// ─── Postulaciones (DET-01/DET-02 escriben; ACT-02, Agenda, Inicio y el deck leen) ──

export function applyTo(actorId: DemoActorId, publicationId: string, estado: BadgeStatus): void {
    const applications = new Map(state.applications);
    applications.set(keyOf(actorId, publicationId), { estado, at: Date.now() });
    set({ applications });
}

export function cancelShift(applicationId: string): void {
    if (state.cancelledShifts.has(applicationId)) return;
    set({ cancelledShifts: new Set([...state.cancelledShifts, applicationId]) });
}

/** Postulación de esta sesión para una publicación, si la hay. */
export function useSessionApplication(actorId: DemoActorId, publicationId: string): SessionApplication | undefined {
    return useSessionState().applications.get(keyOf(actorId, publicationId));
}

/** «Garzón · Banquetería Rosa SpA · sáb 12 dic · 18:00–00:00» para una postulación nueva. */
function detalleOf(publicationId: string): string {
    const p = getPublication(publicationId);
    if (!p) return '';
    if (p.tipo === 'turno') {
        const b = p.bloques[0];
        return [p.autor.nombre, b && `${b.weekday} ${b.day} ${b.month} · ${b.time}`].filter(Boolean).join(' · ');
    }
    return [p.autor.nombre, p.lugar.split(' · ').pop()].filter(Boolean).join(' · ');
}

/**
 * Las postulaciones del actor tal como las ve en esta sesión: las de los
 * datos (sin las que el prototipo muestra antes de postular, salvo que ya
 * postuló) más las enviadas ahora, con el turno cancelado al día. ACT-02, la
 * Agenda, Inicio y el deck usan SOLO esto.
 */
export function useApplications(actorId: DemoActorId, recienRegistrado = false): DemoApplication[] {
    const { applications, cancelledShifts } = useSessionState();
    return useMemo(() => {
        if (recienRegistrado) return [];
        const fromData = getApplications(actorId).filter(
            (a) => !startsWithoutApplication(actorId, a.publicationId) || applications.has(keyOf(actorId, a.publicationId)),
        );
        const known = new Set(fromData.map((a) => a.publicationId));
        const fromSession: DemoApplication[] = [];
        for (const [key, s] of applications) {
            const [who, publicationId = ''] = key.split(':');
            if (who !== actorId || known.has(publicationId)) continue;
            const p = getPublication(publicationId);
            if (!p || (p.tipo !== 'empleo' && p.tipo !== 'turno')) continue;
            fromSession.push({
                id: `sesion-${publicationId}`,
                actorId,
                publicationId,
                tipo: p.tipo,
                titulo: p.titulo,
                autor: p.autor,
                detalle: detalleOf(publicationId),
                estado: s.estado,
            });
        }
        const merged = [...fromSession, ...fromData];
        return merged.map((a) => (cancelledShifts.has(a.id) ? { ...a, estado: 'Cancelaste' as BadgeStatus } : a));
    }, [actorId, recienRegistrado, applications, cancelledShifts]);
}

// ─── Celular verificado (AUTH-08) ───────────────────────────────────────────

export function verifyPhone(actorId: DemoActorId): void {
    if (state.phoneVerified.has(actorId)) return;
    set({ phoneVerified: new Set([...state.phoneVerified, actorId]) });
}

// ─── Match (DET-03): llega un rato después de postular, en cualquier pantalla ──

/** El match llega un rato después de postular (el «salto de tiempo» del prototipo). */
export const MATCH_DELAY_MS = 3000;

export function scheduleMatch(actorId: DemoActorId, publicationId: string, delayMs = MATCH_DELAY_MS): void {
    const key = keyOf(actorId, publicationId);
    if (state.matchesSeen.has(key) || state.pendingMatches.has(key)) return;
    const pendingMatches = new Map(state.pendingMatches);
    pendingMatches.set(key, { actorId, publicationId, dueAt: Date.now() + delayMs });
    set({ pendingMatches });
}

export function markMatchSeen(actorId: DemoActorId, publicationId: string): void {
    const key = keyOf(actorId, publicationId);
    const pendingMatches = new Map(state.pendingMatches);
    pendingMatches.delete(key);
    set({ pendingMatches, matchesSeen: new Set([...state.matchesSeen, key]) });
}

// ─── Deck y «No me interesa» del detalle ────────────────────────────────────

export function decide(actorId: DemoActorId, publicationId: string, decision: DeckDecision): void {
    const decisions = new Map(state.decisions);
    decisions.set(keyOf(actorId, publicationId), decision);
    set({ decisions });
}

/** «Deshacer» del Snackbar. */
export function undoDecision(actorId: DemoActorId, publicationId: string): void {
    const key = keyOf(actorId, publicationId);
    if (!state.decisions.has(key)) return;
    const decisions = new Map(state.decisions);
    decisions.delete(key);
    set({ decisions });
}

/** Lo ya decidido por el actor: ya postuló (en datos o en la sesión) o marcó «No me interesa». */
export function useDecided(actorId: DemoActorId): (publicationId: string) => DeckDecision | 'postulado' | undefined {
    const s = useSessionState();
    return useCallback(
        (publicationId: string) => {
            const key = keyOf(actorId, publicationId);
            if (s.applications.has(key)) return 'postulado';
            if (
                !startsWithoutApplication(actorId, publicationId) &&
                getApplications(actorId).some((a) => a.publicationId === publicationId)
            )
                return 'postulado';
            return s.decisions.get(key);
        },
        [actorId, s],
    );
}

// ─── Lecturas sin React (para MatchHost y pruebas) ──────────────────────────

export function getSessionState(): SessionState {
    return state;
}

export function subscribeSession(listener: () => void): () => void {
    return subscribe(listener);
}

export function isPhoneVerified(actorId: DemoActorId, inData: boolean): boolean {
    return state.phoneVerified.has(actorId) || (inData && !phonePendingAtStart(actorId));
}
