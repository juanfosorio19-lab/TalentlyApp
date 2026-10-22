// Lo que la organización (o el hogar) hace con sus publicaciones durante la
// sesión de demostración: pausar, cerrar con motivo, renovar, confirmar
// cupos, avanzar o no seleccionar postulantes, marcar asistencia y evaluar.
// GES-01, GES-02 y GES-04 leen SOLO de aquí (más los datos de features/demo):
// si se cierra la publicación, GES-04 ya no deja confirmar, y las métricas de
// GES-01 se recalculan con lo confirmado.
//
// Vive en memoria mientras la app está abierta. Pedido en requests: subirlo a
// demo/sessionStore para que INI-02 (KPIs y «Requiere tu atención»), ACT-03,
// la Agenda y NOT-01 muestren las mismas cifras. Cuando vuelva Supabase, cada
// acción es una RPC (confirm_assignment(), close_publication()…).
import { useSyncExternalStore } from 'react';
import type { BadgeStatus } from '../../ui/Badge';

export type PublicationStatus = 'Activa' | 'Pausada' | 'Cerrada';
export type Attendance = 'asistio' | 'no-asistio';

export interface StatusChange {
    estado: PublicationStatus;
    /** Motivo elegido al cerrar (texto tal como se muestra). */
    motivo?: string;
}

export interface ManageState {
    /** Publicación → estado cambiado en esta sesión (sin entrada = el de los datos). */
    status: ReadonlyMap<string, StatusChange>;
    /** Publicaciones renovadas hoy (30 días desde hoy). */
    renewed: ReadonlySet<string>;
    /** `pub:turno` → personas confirmadas en esta sesión, en el orden en que se confirmaron. */
    confirmed: ReadonlyMap<string, readonly string[]>;
    /** `pub:turno` cuyos postulados ya llegaron (el «salto de tiempo» del prototipo). */
    arrived: ReadonlySet<string>;
    /** `pub:turno` → cuándo llegan sus postulados (ms). */
    arriving: ReadonlyMap<string, number>;
    /** `pub:persona` → estado del postulante cambiado en GES-02. */
    applicants: ReadonlyMap<string, BadgeStatus>;
    /** `pub:turno:persona` → asistencia marcada después del turno. */
    attendance: ReadonlyMap<string, Attendance>;
    /** `pub:turno:persona` → nota de 1 a 5 que le puso la organización. */
    evaluations: ReadonlyMap<string, number>;
}

const INITIAL: ManageState = {
    status: new Map(),
    renewed: new Set(),
    confirmed: new Map(),
    arrived: new Set(),
    arriving: new Map(),
    applicants: new Map(),
    attendance: new Map(),
    evaluations: new Map(),
};

let state: ManageState = INITIAL;
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function set(next: Partial<ManageState>): void {
    state = { ...state, ...next };
    listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

const snapshot = () => state;

export const rosterKey = (publicationId: string, shiftId: string) => `${publicationId}:${shiftId}`;
export const applicantKey = (publicationId: string, personId: string) => `${publicationId}:${personId}`;
export const slotKey = (publicationId: string, shiftId: string, personId: string) => `${publicationId}:${shiftId}:${personId}`;

/** Todo lo que la organización cambió en la sesión. */
export function useManageState(): ManageState {
    return useSyncExternalStore(subscribe, snapshot, snapshot);
}

export function getManageState(): ManageState {
    return state;
}

/** Solo para pruebas: vuelve al estado inicial y suelta los temporizadores. */
export function resetManage(): void {
    timers.forEach((t) => clearTimeout(t));
    timers.clear();
    set(INITIAL);
}

// ─── Publicación (GES-01) ───────────────────────────────────────────────────

/**
 * Pausar, reanudar o cerrar. `null` vuelve al estado de los datos («Deshacer»).
 * Pausada o cerrada no recibe postulaciones: los postulados que estaban por
 * llegar (el «salto de tiempo») no llegan. Al reanudar o deshacer, la llegada
 * se vuelve a programar en la siguiente visita a GES-04.
 */
export function setPublicationStatus(publicationId: string, change: StatusChange | null): void {
    const status = new Map(state.status);
    if (change) status.set(publicationId, change);
    else status.delete(publicationId);
    const next: Partial<ManageState> = { status };
    if (change && change.estado !== 'Activa') {
        const prefix = `${publicationId}:`;
        const pending = new Set([...state.arriving.keys(), ...timers.keys()].filter((k) => k.startsWith(prefix)));
        for (const key of pending) {
            clearTimeout(timers.get(key));
            timers.delete(key);
        }
        if ([...pending].some((k) => state.arriving.has(k))) {
            next.arriving = new Map([...state.arriving].filter(([k]) => !pending.has(k)));
        }
    }
    set(next);
}

export function renewPublication(publicationId: string): void {
    if (state.renewed.has(publicationId)) return;
    set({ renewed: new Set([...state.renewed, publicationId]) });
}

// ─── Cupos (GES-04) ─────────────────────────────────────────────────────────

/** Confirma con un toque (una persona o los favoritos). Nunca duplica. */
export function confirmPeople(publicationId: string, shiftId: string, personIds: readonly string[]): void {
    const key = rosterKey(publicationId, shiftId);
    const before = state.confirmed.get(key) ?? [];
    const added = personIds.filter((id) => !before.includes(id));
    if (!added.length) return;
    const confirmed = new Map(state.confirmed);
    confirmed.set(key, [...before, ...added]);
    set({ confirmed });
}

/** Cuánto tarda en llegar la primera tanda de postulados de un turno recién publicado. */
export const ARRIVAL_DELAY_MS = 4000;

/**
 * El «salto de tiempo» del prototipo (flujo 4): un turno recién publicado
 * parte sin postulados y, un rato después, llegan los de los datos. Se
 * programa una sola vez; llega aunque la persona cambie de pantalla.
 */
export function scheduleArrival(publicationId: string, shiftId: string, delayMs = ARRIVAL_DELAY_MS): void {
    const key = rosterKey(publicationId, shiftId);
    if (state.arrived.has(key) || state.arriving.has(key)) return;
    const arriving = new Map(state.arriving);
    arriving.set(key, Date.now() + delayMs);
    set({ arriving });
    timers.set(
        key,
        setTimeout(() => arrive(publicationId, shiftId), delayMs),
    );
}

export function arrive(publicationId: string, shiftId: string): void {
    const key = rosterKey(publicationId, shiftId);
    const timer = timers.get(key);
    if (timer) clearTimeout(timer);
    timers.delete(key);
    if (state.arrived.has(key)) return;
    const arriving = new Map(state.arriving);
    arriving.delete(key);
    set({ arriving, arrived: new Set([...state.arrived, key]) });
}

export function setAttendance(publicationId: string, shiftId: string, personId: string, value: Attendance | null): void {
    const attendance = new Map(state.attendance);
    const key = slotKey(publicationId, shiftId, personId);
    if (value) attendance.set(key, value);
    else attendance.delete(key);
    set({ attendance });
}

export function evaluate(publicationId: string, shiftId: string, personId: string, stars: number): void {
    const evaluations = new Map(state.evaluations);
    evaluations.set(slotKey(publicationId, shiftId, personId), Math.min(5, Math.max(1, Math.round(stars))));
    set({ evaluations });
}

// ─── Postulantes (GES-02) ───────────────────────────────────────────────────

/** «Avanzar» (En proceso) o «No seleccionar». `null` vuelve al estado de los datos («Deshacer»). */
export function setApplicantStatus(publicationId: string, personId: string, estado: BadgeStatus | null): void {
    const applicants = new Map(state.applicants);
    const key = applicantKey(publicationId, personId);
    if (estado) applicants.set(key, estado);
    else applicants.delete(key);
    set({ applicants });
}
