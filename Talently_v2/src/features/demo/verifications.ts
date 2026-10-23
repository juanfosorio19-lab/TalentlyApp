// Las verificaciones en UN solo lugar: qué revisó Talently en cada insignia
// (la hoja «Verificación de …» de DET-01, Inicio, Actividad, Explorar,
// Gestionar y Perfil), cuándo (la fecha va en los datos, DemoVerification.fecha)
// y la regla del estado de la identidad (VER-01, VER-02, PUBL-04, PUBL-07 y
// Perfil). Lo que cambia en la sesión (identidad enviada, teléfono
// verificado) vive en ./sessionStore.
import { getOrg, getPerson } from './data';
import type { DemoActorId } from './session';
import type { DemoVerification } from './types';

export const IDENTIDAD_VERIFICADA = 'Identidad verificada';
export const TELEFONO_VERIFICADO = 'Teléfono verificado';
export const ORGANIZACION_VERIFICADA = 'Organización verificada';

/**
 * Qué revisó Talently, como en la hoja «Verificación de Jorge Muñoz» del
 * sistema de diseño («Código SMS · 2 dic 2026», «Cédula y selfie revisadas ·
 * 3 dic 2026»). Nunca RUT, fecha de nacimiento ni fotos.
 */
export const QUE_SE_VERIFICO: Readonly<Record<string, string>> = {
    [TELEFONO_VERIFICADO]: 'Código SMS',
    [IDENTIDAD_VERIFICADA]: 'Cédula y selfie revisadas',
    [ORGANIZACION_VERIFICADA]: 'RUT y documentos revisados',
    'Credencial SPD verificada': 'Credencial revisada',
    // no está en el prototipo: mismo estilo que el resto.
    'Apta para trabajar con menores': 'Certificado de inhabilidades revisado',
};

/** «Código SMS · 2 dic 2026», «Credencial revisada · vence 03/2028». Sin nada que decir, `undefined`. */
export function verificationDetail(v: DemoVerification): string | undefined {
    return [QUE_SE_VERIFICO[v.label], v.fecha, v.vence].filter(Boolean).join(' · ') || undefined;
}

/** La insignia de una persona u organización de la demo, si la tiene en los datos. */
export function verificationOf(id: string, label: string): DemoVerification | undefined {
    const list = getPerson(id)?.verificaciones ?? [];
    const found = list.find((v) => v.label === label);
    if (found || label !== ORGANIZACION_VERIFICADA) return found;
    const org = getOrg(id);
    return org?.verificada ? { label, status: 'verified', fecha: org.verificadaEl } : undefined;
}

/** Desde cuándo existe la cuenta del actor (VER-01 «Cuenta básica · Desde el …»). */
export const accountSince = (actorId: DemoActorId): string | undefined => getPerson(actorId)?.desde;

// ─── Identidad (VER-02 escribe; VER-01, PUBL-04, PUBL-07 y Perfil leen) ─────

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

/**
 * Flujo 5: Carolina verifica su identidad en VER-02 antes de publicar su
 * aviso (PUBL-04-identidad: «Falta verificar tu identidad»). Los datos traen
 * el «después» (Identidad verificada); como `phonePendingAtStart`, parte sin
 * verificar. La ÚNICA lista: VER-01, VER-02, PUBL-04 y Perfil leen esta.
 */
const IDENTITY_PENDING_AT_START: readonly DemoActorId[] = ['carolina'];

export function identityPendingAtStart(actorId: DemoActorId): boolean {
    return IDENTITY_PENDING_AT_START.includes(actorId);
}

/** ¿Trae «Identidad verificada» en los datos? (Jorge recién registrado: no). */
export function identityInData(personId: DemoActorId, recienRegistrado = false): boolean {
    return !recienRegistrado && verificationOf(personId, IDENTIDAD_VERIFICADA) !== undefined;
}

/** ¿Trae el teléfono verificado en los datos? La identidad (nivel 2) supone el teléfono (nivel 1, spec §10.1). */
export function phoneInData(personId: DemoActorId, recienRegistrado = false): boolean {
    if (recienRegistrado) return false;
    return verificationOf(personId, TELEFONO_VERIFICADO) !== undefined || identityInData(personId);
}
