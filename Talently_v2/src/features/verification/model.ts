// Lógica pura de Verificación: estado de cada nivel (VER-01), los pasos del
// asistente de identidad (VER-02) y la ruta de vuelta. Sin React: se prueba
// en model.test.ts.
import type { TimelineStepStatus } from '../../ui/Timeline';
import type { BadgeStatus, DemoRow } from '../demo/types';
import { COPY } from './copy';
import { ANTECEDENTES_PREFIX } from './mock';

const C = COPY.ver01;

// ─── Estado de cada verificación ────────────────────────────────────────────

/** pending: falta · review: enviada en esta sesión, esperando respuesta · verified: verificada. */
export type IdentityStatus = 'pending' | 'review' | 'verified';

export interface IdentityInput {
    /** La persona tiene «Identidad verificada» en los datos de demostración. */
    inData: boolean;
    /** El flujo del prototipo la muestra antes de verificarse (Carolina, flujo 5). */
    pendingAtStart: boolean;
    /** La envió en VER-02 durante esta sesión. */
    submitted: boolean;
}

export function identityStatusOf({ inData, pendingAtStart, submitted }: IdentityInput): IdentityStatus {
    if (submitted) return 'review';
    return inData && !pendingAtStart ? 'verified' : 'pending';
}

export interface PhoneInput {
    /**
     * Teléfono (o identidad, que es el nivel 2 y supone el 1: spec §10.1)
     * verificado en los datos. Jorge recién registrado no lo tiene.
     */
    inData: boolean;
    /** El flujo del prototipo lo verifica durante la sesión (Matías, flujo 2). */
    pendingAtStart: boolean;
    /** Lo verificó en AUTH-08 durante esta sesión (demo/sessionStore). */
    verifiedInSession: boolean;
}

export function phoneVerifiedOf({ inData, pendingAtStart, verifiedInSession }: PhoneInput): boolean {
    return verifiedInSession || (inData && !pendingAtStart);
}

// ─── VER-01 · Niveles de verificación (Timeline --levels) ───────────────────

export type LevelId = 'cuenta' | 'telefono' | 'identidad' | 'organizacion';
export type LevelActionKind = 'telefono' | 'identidad';

export interface LevelAction {
    kind: LevelActionKind;
    label: string;
    /** Solo una acción principal por pantalla: la del primer nivel que falta. */
    primary: boolean;
}

export interface Level {
    id: LevelId;
    status: TimelineStepStatus;
    label: string;
    /** Estado del nivel en la línea de fecha: «Verificado el 2 dic 2026», «Pendiente». */
    date: string;
    /** Qué permite o, si falta, para qué sirve. */
    description?: string;
    action?: LevelAction;
}

export interface PersonLevelsInput {
    /** «14 mar 2025» u «hoy». */
    cuentaDesde: string;
    phone: { verified: boolean; fecha: string };
    identity: { status: IdentityStatus; fecha: string };
    /** Tiene un perfil Hogar: la identidad sirve para recibir a alguien en su casa. */
    hogar: boolean;
}

/**
 * La escalera de VER-01 para una persona (spec §10.1): Cuenta básica ·
 * Teléfono verificado · Identidad verificada. El primer nivel que falta es
 * el actual y lleva la acción principal; los siguientes quedan pendientes con
 * su acción tonal. La identidad enviada queda «En revisión».
 */
export function personLevels({ cuentaDesde, phone, identity, hogar }: PersonLevelsInput): Level[] {
    const levels: Level[] = [
        { id: 'cuenta', status: 'done', label: C.cuenta, date: C.desde(cuentaDesde), description: C.cuentaPermite },
        phone.verified
            ? { id: 'telefono', status: 'done', label: C.telefono, date: C.verificado(phone.fecha), description: C.telefonoPermite }
            : {
                  id: 'telefono',
                  status: 'pending',
                  label: C.telefono,
                  date: C.pendiente,
                  description: C.telefonoFalta,
                  action: { kind: 'telefono', label: C.verificarTelefono, primary: false },
              },
        identityLevel(identity, hogar),
    ];
    return markCurrent(levels);
}

function identityLevel(identity: PersonLevelsInput['identity'], hogar: boolean): Level {
    switch (identity.status) {
        case 'verified':
            return { id: 'identidad', status: 'done', label: C.identidad, date: C.verificado(identity.fecha), description: C.identidadPermite };
        case 'review':
            return { id: 'identidad', status: 'review', label: C.identidad, date: C.enRevision };
        default:
            return {
                id: 'identidad',
                status: 'pending',
                label: C.identidad,
                date: C.pendiente,
                description: hogar ? C.identidadFaltaHogar : C.identidadFaltaTrabajo,
                action: { kind: 'identidad', label: C.verificarIdentidad, primary: false },
            };
    }
}

/** El primer pendiente pasa a actual (anillo `color-primary-text`, aria-current) y su acción es la principal. */
function markCurrent(levels: Level[]): Level[] {
    const first = levels.findIndex((l) => l.status === 'pending');
    if (first === -1) return levels;
    return levels.map((l, i) =>
        i === first ? { ...l, status: 'current', action: l.action && { ...l.action, primary: true } } : l,
    );
}

/** Una organización: «Organización verificada» (VER-04 la verifica). */
export function organizationLevels(fecha: string | undefined): Level[] {
    if (!fecha) return [{ id: 'organizacion', status: 'current', label: C.organizacionNivel, date: C.pendiente }];
    return [
        { id: 'organizacion', status: 'done', label: C.organizacionNivel, date: C.verificada(fecha), description: C.organizacionPermite },
    ];
}

// ─── VER-01 · Credenciales ──────────────────────────────────────────────────

export interface Credential {
    /** Identificador del tipo para VER-03 (`/verificacion/credencial/:tipo`). */
    tipo: string;
    label: string;
    badge?: BadgeStatus;
    /** «Vence 03/2028» o para qué sirve. */
    detalle?: string;
    /** Falta y se sube en VER-03 («Subir credencial»). */
    upload: boolean;
}

/** «Credencial SPD (ex OS-10)» → «credencial-spd-ex-os-10». */
export function credentialSlug(label: string): string {
    return label
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Las filas de «Credenciales» del perfil (las mismas que muestra PRF-01). Se
 * sube lo que falta (Obligatoria o Recomendado), salvo el certificado de
 * antecedentes: ese lo comparte la persona en el chat después del match.
 */
export function credentialsFromRows(rows: readonly DemoRow[]): Credential[] {
    return rows.map((row) => {
        const missing = row.badge === 'Obligatoria' || row.badge === 'Recomendado' || row.badge === 'Recomendada';
        return {
            tipo: credentialSlug(row.label),
            label: row.label,
            badge: row.badge,
            detalle: row.detalle ?? row.value,
            upload: missing && !row.label.startsWith(ANTECEDENTES_PREFIX),
        };
    });
}

// ─── VER-02 · Pasos del asistente ───────────────────────────────────────────

export const CAPTURE_STEPS = ['frente', 'dorso', 'selfie'] as const;
export type CaptureStep = (typeof CAPTURE_STEPS)[number];
/** `inicio`: antes de empezar (VER-02); luego los 3 pasos con cámara. */
export type IdentityStep = 'inicio' | CaptureStep;

export function parseStep(value: string | null): IdentityStep {
    return (CAPTURE_STEPS as readonly string[]).includes(value ?? '') ? (value as CaptureStep) : 'inicio';
}

/** Paso anterior (atrás del AppBar y de Android); en `inicio`, sale del asistente. */
export function previousStep(step: IdentityStep): IdentityStep | null {
    if (step === 'inicio') return null;
    return CAPTURE_STEPS[CAPTURE_STEPS.indexOf(step) - 1] ?? 'inicio';
}

/**
 * A dónde sigue después de tener la foto de `step`: al siguiente paso que
 * aún no tiene la suya; si no queda ninguno, a la selfie, donde se envía.
 */
export function nextStep(step: CaptureStep, taken: ReadonlySet<CaptureStep>): CaptureStep {
    const i = CAPTURE_STEPS.indexOf(step);
    return CAPTURE_STEPS.slice(i + 1).find((s) => !taken.has(s)) ?? 'selfie';
}

/** La primera foto que falta para poder enviar, o null si están las 3. */
export function firstMissing(taken: ReadonlySet<CaptureStep>): CaptureStep | null {
    return CAPTURE_STEPS.find((s) => !taken.has(s)) ?? null;
}

/** «Paso 2 de 3». */
export function stepNumber(step: CaptureStep): number {
    return CAPTURE_STEPS.indexOf(step) + 1;
}

/** Solo fotos: la cámara entrega una imagen, pero «Elegir de la galería» puede saltarse `accept`. */
export function isPhoto(file: Pick<File, 'type'>): boolean {
    return file.type.startsWith('image/');
}

// ─── ?volver= ───────────────────────────────────────────────────────────────

/**
 * `?volver=<ruta>`: solo una ruta interna de la app («/publicar/hogar/5»),
 * nunca otra web («//sitio», «https:…») ni VER-02 misma.
 */
export function safeReturnPath(value: string | null, self: string): string | null {
    if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null;
    const pathname = value.split(/[?#]/)[0] ?? '';
    return pathname === self ? null : value;
}
