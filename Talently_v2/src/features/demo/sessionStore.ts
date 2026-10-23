// Lo que pasa durante la sesión de demostración, en UN solo lugar para todas
// las pestañas: notificaciones leídas, postulaciones enviadas y retiradas,
// turnos cancelados, celular verificado, match por llegar, lo decidido en el
// deck y las evaluaciones enviadas en REV-01. Lo que hace quien publica
// (GES-01, GES-02, GES-04) vive al lado, en ./manageState.
// Vive en memoria mientras la app está abierta (al recargar vuelve a los
// datos de features/demo). Cuando vuelva Supabase, cada acción es una RPC y
// este módulo se reemplaza por las consultas de cada feature.
//
// Regla: ninguna pantalla guarda estado de sesión «propio» que otra pestaña
// deba ver (la campana, ACT-02, Inicio y el deck leen de aquí).
import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { BadgeStatus } from '../../ui/Badge/badgeTones';
import { getApplications, getConversation, getNotifications, getProcess, getPublication } from './data';
import type { DemoActorId } from './session';
import type { DemoApplication, DemoNotification, DemoViewerId } from './types';
import { identityInData, identityPendingAtStart, identityStatusOf, phoneInData, type IdentityStatus } from './verifications';

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

interface SessionState {
    readNotifications: ReadonlySet<string>;
    /** `${actorId}:${publicationId}` → postulación de esta sesión. */
    applications: ReadonlyMap<string, SessionApplication>;
    /** Ids de DemoApplication con el turno cancelado en TUR-01. */
    cancelledShifts: ReadonlySet<string>;
    phoneVerified: ReadonlySet<DemoActorId>;
    /** Persona → cuándo envió su identidad en VER-02 (ms). Las fotos nunca se guardan: solo el envío. */
    identitySubmitted: ReadonlyMap<DemoActorId, number>;
    /** `${actorId}:${publicationId}` → match por llegar. */
    pendingMatches: ReadonlyMap<string, PendingMatch>;
    matchesSeen: ReadonlySet<string>;
    /** `${actorId}:${publicationId}` → «Me interesa» / «No me interesa» en el deck o el detalle. */
    decisions: ReadonlyMap<string, DeckDecision>;
    /** `${actorId}:${processId}` → cuándo retiró su postulación en PRC-01 (ms). */
    withdrawn: ReadonlyMap<string, number>;
    /** `${actorId}:${publicationId}` → evaluación enviada en REV-01. */
    reviews: ReadonlyMap<string, SentReview>;
}

const INITIAL: SessionState = {
    readNotifications: new Set(),
    applications: new Map(),
    cancelledShifts: new Set(),
    phoneVerified: new Set(),
    identitySubmitted: new Map(),
    pendingMatches: new Map(),
    matchesSeen: new Set(),
    decisions: new Map(),
    withdrawn: new Map(),
    reviews: new Map(),
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

/** La publicación de la que habla una notificación, según su destino (PRC-01, MSG-02, DET-01, GES-…). */
export function notificationPublicationId(n: DemoNotification): string | undefined {
    const d = n.destino;
    switch (d?.pantalla) {
        case 'proceso':
            return getProcess(d.processId)?.publicationId;
        case 'conversacion':
            return getConversation(d.conversationId)?.contexto.publicationId;
        case 'publicacion':
        case 'gestion':
        case 'postulantes':
        case 'cupos':
        case 'evaluar':
            return d.publicationId;
        default:
            return undefined;
    }
}

/**
 * ¿La sesión ya tiene lo que cuenta la notificación? Los datos traen el
 * «después» de los flujos 2 y 3: «Tienes entrevista…», «Hicieron match…» o
 * «Taller Los Aromos te escribió» hablan de una postulación que, en una
 * sesión nueva, el actor todavía no envía (startsWithoutApplication). Esas
 * notificaciones aparecen recién cuando postula.
 */
export function notificationInSession(
    n: DemoNotification,
    applications: ReadonlyMap<string, SessionApplication>,
): boolean {
    const publicationId = notificationPublicationId(n);
    if (!publicationId) return true;
    return !startsWithoutApplication(n.actorId, publicationId) || applications.has(keyOf(n.actorId, publicationId));
}

/**
 * La bandeja del actor. `recienRegistrado` (INI-01-jorge-nuevo) todavía no
 * tiene notificaciones. Sin las que hablan de una postulación que la sesión
 * todavía no tiene (notificationInSession). TODAS las campanas, el contador
 * y «Marcar todo como leído» usan esta lista.
 */
export function useInbox(viewerId: DemoViewerId, recienRegistrado = false): Inbox {
    const { readNotifications, applications } = useSessionState();
    const items = useMemo(() => inboxItems(viewerId, recienRegistrado, readNotifications, applications), [
        viewerId,
        recienRegistrado,
        readNotifications,
        applications,
    ]);
    const unread = items.filter((n) => n.sinLeer).length;
    const markRead = useCallback((id: string) => markNotificationsRead([id]), []);
    const markAllRead = useCallback(() => markNotificationsRead(items.filter((n) => n.sinLeer).map((n) => n.id)), [items]);
    return { items, unread, markRead, markAllRead };
}

/** La bandeja sin React (para pruebas): lo leído al día y sin lo que la sesión todavía no tiene. */
export function inboxItems(
    viewerId: DemoViewerId,
    recienRegistrado: boolean,
    readNotifications: ReadonlySet<string> = state.readNotifications,
    applications: ReadonlyMap<string, SessionApplication> = state.applications,
): DemoNotification[] {
    if (recienRegistrado) return [];
    return getNotifications(viewerId)
        .filter((n) => notificationInSession(n, applications))
        .map((n) => (n.sinLeer && readNotifications.has(n.id) ? { ...n, sinLeer: false } : n));
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
 * postuló; ninguna si está recién registrado) más las enviadas ahora, con
 * el turno cancelado al día. ACT-02, la
 * Agenda, Inicio y el deck usan SOLO esto.
 */
export function useApplications(actorId: DemoActorId, recienRegistrado = false): DemoApplication[] {
    const { applications, cancelledShifts, withdrawn } = useSessionState();
    return useMemo(() => {
        // Recién registrado: sin postulaciones de los datos, pero sí las que haga en esta sesión.
        const fromData = (recienRegistrado ? [] : getApplications(actorId)).filter(
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
        return merged.map((a) => {
            if (cancelledShifts.has(a.id)) return { ...a, estado: 'Cancelaste' as BadgeStatus };
            if (a.processId && withdrawnNow(withdrawn, applications, actorId, a.processId, a.publicationId)) {
                return { ...a, estado: 'Postulación retirada' as BadgeStatus };
            }
            return a;
        });
    }, [actorId, recienRegistrado, applications, cancelledShifts, withdrawn]);
}

// ─── Celular verificado (AUTH-08) ───────────────────────────────────────────

export function verifyPhone(actorId: DemoActorId): void {
    if (state.phoneVerified.has(actorId)) return;
    set({ phoneVerified: new Set([...state.phoneVerified, actorId]) });
}

/**
 * ¿Tiene el celular verificado? Lo verificó en la sesión (AUTH-08 o VER-01)
 * o viene en los datos y el flujo no parte sin él (Matías, flujo 2).
 * `inData` por defecto: el de los datos (con la identidad, que lo supone).
 */
export function usePhoneVerified(actorId: DemoActorId, inData: boolean = phoneInData(actorId)): boolean {
    const { phoneVerified } = useSessionState();
    return phoneVerified.has(actorId) || (inData && !phonePendingAtStart(actorId));
}

// ─── Identidad (VER-02 escribe; VER-01, PUBL-04, PUBL-07 y Perfil leen) ─────

/** VER-02 · «Enviar»: la identidad de la persona queda en revisión. */
export function submitIdentity(personId: DemoActorId, at: number = Date.now()): void {
    if (state.identitySubmitted.has(personId)) return;
    const identitySubmitted = new Map(state.identitySubmitted);
    identitySubmitted.set(personId, at);
    set({ identitySubmitted });
}

/**
 * Estado de la identidad sin React (como `isPhoneVerified`). `inData`:
 * «Identidad verificada» en los datos (por defecto, lo que traen).
 */
export function getIdentityStatus(personId: DemoActorId, inData: boolean = identityInData(personId)): IdentityStatus {
    return identityStatusOf({
        inData,
        pendingAtStart: identityPendingAtStart(personId),
        submitted: state.identitySubmitted.has(personId),
    });
}

/** Estado de la identidad de la persona al día con lo enviado en la sesión ('pending' | 'review' | 'verified'). */
export function useIdentityStatus(personId: DemoActorId, inData: boolean = identityInData(personId)): IdentityStatus {
    const { identitySubmitted } = useSessionState();
    return identityStatusOf({ inData, pendingAtStart: identityPendingAtStart(personId), submitted: identitySubmitted.has(personId) });
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

// ─── Personas sugeridas (EXP-05 y, cuando exista, GES-03) ────────────────────

/** La clave de una persona sugerida para una publicación propia: la publicación y la persona. */
export const suggestionKey = (publicationId: string, personId: string) => `${publicationId}/${personId}`;

/** «Invitar a postular» (`si`) o «No me interesa» (`no`) sobre una persona sugerida. */
export function decidePerson(actorId: DemoActorId, publicationId: string, personId: string, decision: DeckDecision): void {
    decide(actorId, suggestionKey(publicationId, personId), decision);
}

/** «Deshacer» del Snackbar de EXP-05. */
export function undoPersonDecision(actorId: DemoActorId, publicationId: string, personId: string): void {
    undoDecision(actorId, suggestionKey(publicationId, personId));
}

/** Lo decidido sobre una persona sugerida (EXP-05, EXP-07). */
export function usePersonDecision(actorId: DemoActorId): (publicationId: string, personId: string) => DeckDecision | undefined {
    const { decisions } = useSessionState();
    return useCallback(
        (publicationId: string, personId: string) => decisions.get(keyOf(actorId, suggestionKey(publicationId, personId))),
        [actorId, decisions],
    );
}

/** «Deshacer» del Snackbar. */
export function undoDecision(actorId: DemoActorId, publicationId: string): void {
    const key = keyOf(actorId, publicationId);
    if (!state.decisions.has(key)) return;
    const decisions = new Map(state.decisions);
    decisions.delete(key);
    set({ decisions });
}

/**
 * Lo ya decidido por el actor: ya postuló (en datos o en la sesión) o marcó
 * «No me interesa». Una postulación retirada en PRC-01 ya no cuenta (se
 * puede volver a postular). Jorge recién registrado no trae las
 * postulaciones de los datos: solo cuenta lo que hizo en esta sesión.
 */
export function useDecided(
    actorId: DemoActorId,
    recienRegistrado = false,
): (publicationId: string) => DeckDecision | 'postulado' | undefined {
    const s = useSessionState();
    return useCallback(
        (publicationId: string) => decidedIn(s, actorId, publicationId, recienRegistrado),
        [actorId, recienRegistrado, s],
    );
}

/** Lo mismo que useDecided, sin React (para pruebas y lecturas puntuales). */
export function decidedIn(
    s: SessionState,
    actorId: DemoActorId,
    publicationId: string,
    recienRegistrado = false,
): DeckDecision | 'postulado' | undefined {
    const key = keyOf(actorId, publicationId);
    const fromData = recienRegistrado
        ? undefined
        : getApplications(actorId).find((a) => a.publicationId === publicationId);
    const processId = fromData?.processId;
    const retired = processId !== undefined && withdrawnNow(s.withdrawn, s.applications, actorId, processId, publicationId);
    if (!retired) {
        if (s.applications.has(key)) return 'postulado';
        if (fromData && !startsWithoutApplication(actorId, publicationId)) return 'postulado';
    }
    return s.decisions.get(key);
}

// ─── Retirar postulación (PRC-01) ───────────────────────────────────────────

/** Retira la postulación. Si vuelve a retirar después de postular de nuevo, cuenta la última vez. */
export function withdrawApplication(actorId: DemoActorId, processId: string, at = Date.now()): void {
    const withdrawn = new Map(state.withdrawn);
    withdrawn.set(keyOf(actorId, processId), at);
    set({ withdrawn });
}

/**
 * ¿Sigue retirada? Sí, salvo que haya vuelto a postular después de retirar
 * (`appliedAt`: la postulación de esta sesión, useSessionApplication).
 */
export function stillWithdrawn(withdrawnAt: number | undefined, appliedAt: number | undefined): boolean {
    if (withdrawnAt === undefined) return false;
    return !(appliedAt !== undefined && appliedAt > withdrawnAt);
}

function withdrawnNow(
    withdrawn: ReadonlyMap<string, number>,
    applications: ReadonlyMap<string, SessionApplication>,
    actorId: DemoActorId,
    processId: string,
    publicationId: string,
): boolean {
    return stillWithdrawn(withdrawn.get(keyOf(actorId, processId)), applications.get(keyOf(actorId, publicationId))?.at);
}

export function isWithdrawn(actorId: DemoActorId, processId: string, appliedAt?: number): boolean {
    return stillWithdrawn(state.withdrawn.get(keyOf(actorId, processId)), appliedAt);
}

/** PRC-01: ¿la postulación de este proceso sigue retirada? (con `appliedAt`, la de la sesión). */
export function useWithdrawn(actorId: DemoActorId, processId: string, appliedAt?: number): boolean {
    return stillWithdrawn(useSessionState().withdrawn.get(keyOf(actorId, processId)), appliedAt);
}

// ─── Evaluaciones (REV-01 escribe; TUR-01 y la bandeja leen) ───────────────

export function sendReview(actorId: DemoActorId, publicationId: string, review: Omit<SentReview, 'at'>): void {
    const reviews = new Map(state.reviews);
    reviews.set(keyOf(actorId, publicationId), { ...review, at: Date.now() });
    set({ reviews });
}

export function getReview(actorId: DemoActorId, publicationId: string): SentReview | undefined {
    return state.reviews.get(keyOf(actorId, publicationId));
}

export function useReview(actorId: DemoActorId, publicationId: string): SentReview | undefined {
    return useSessionState().reviews.get(keyOf(actorId, publicationId));
}

/** Publicaciones que el actor ya evaluó en esta sesión: TUR-01 deja de pedirlas. */
export function reviewedBy(reviews: ReadonlyMap<string, SentReview>, actorId: DemoActorId): ReadonlySet<string> {
    const prefix = `${actorId}:`;
    return new Set([...reviews.keys()].filter((k) => k.startsWith(prefix)).map((k) => k.slice(prefix.length)));
}

export function useReviewed(actorId: DemoActorId): ReadonlySet<string> {
    const { reviews } = useSessionState();
    return useMemo(() => reviewedBy(reviews, actorId), [reviews, actorId]);
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
