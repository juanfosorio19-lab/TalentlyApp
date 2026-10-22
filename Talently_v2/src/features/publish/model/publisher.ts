// Quién publica y qué puede publicar (spec §5.4: PUBL-02 O · PUBL-03 O,H ·
// PUBL-04 H), cómo aparece en la vista previa, si le falta verificar su
// identidad y adónde lleva «Ver publicación» al terminar. Lógica pura con los
// datos de demostración: publisher.test.ts.
import type { PublicationAuthor, PublicationVerification } from '../../../ui/PublicationCard';
import { getManagedPublication, getOrg, getProfile } from '../../demo/data';
import type { DemoActor, DemoActorId } from '../../demo/session';

/** Los asistentes que existen en la URL (`paths.publicar`). */
export type PublishTipo = 'empleo' | 'turno' | 'hogar' | 'clase' | 'servicio';
/** Los que tienen pantallas en F1. */
export type WizardKind = 'turno' | 'hogar';

export const PUBLISH_TIPOS: readonly PublishTipo[] = ['empleo', 'turno', 'hogar', 'clase', 'servicio'];

export const isPublishTipo = (v: string | undefined): v is PublishTipo => PUBLISH_TIPOS.some((t) => t === v);

/** Pasos de PUBL-03 y PUBL-04: los 4 propios y el 5, PUBL-08 · Tipo de publicación. */
export const WIZARD_STEPS = 5;
export const PLAN_STEP = 5;

/** Una organización publica empleos y turnos; un hogar, su aviso y turnos para un evento en su casa. */
export function canPublish(actor: DemoActor, tipo: WizardKind | 'empleo'): boolean {
    if (actor.kind === 'organizacion') return tipo !== 'hogar';
    if (!actor.capabilities.includes('hogar')) return false;
    return tipo !== 'empleo';
}

/** «Familia en Ñuñoa»: así ven al hogar en sus avisos (ONB-H1). */
export const hogarName = (actor: DemoActor): string => `Familia en ${actor.comuna}`;

/** Cabecera de la tarjeta de la vista previa: la organización, o el hogar con avatar cuadrado. */
export function previewAuthor(actor: DemoActor): PublicationAuthor {
    return actor.kind === 'organizacion'
        ? { name: actor.fullName, kind: 'org' }
        : { name: hogarName(actor), kind: 'org' };
}

/** La organización está verificada en los datos (sin eso, el turno queda en revisión). */
export function orgVerified(actor: DemoActor): boolean {
    return actor.kind === 'organizacion' && Boolean(getOrg(actor.id)?.verificada);
}

/** Insignia de la vista previa de un turno: «Organización verificada» o «Verificación en revisión». */
export function previewVerification(actor: DemoActor): Omit<PublicationVerification, 'onClick'> | null {
    if (actor.kind !== 'organizacion') return null;
    return orgVerified(actor)
        ? { status: 'verified', label: 'Organización verificada' }
        : { status: 'review', label: 'Verificación en revisión' };
}

const hasVerification = (actorId: DemoActorId, label: string) =>
    getProfile(actorId).asiTeVen.verificaciones.some((v) => v.label === label && v.status === 'verified');

/**
 * Carolina verifica su identidad en el flujo 5, al publicar (PUBL-04-identidad
 * → VER-02): los datos ya traen el «después». Como `phonePendingAtStart` de
 * demo/sessionStore; pedido allí como `identityPendingAtStart`.
 */
const IDENTITY_PENDING_AT_START: readonly DemoActorId[] = ['carolina'];

/** PUBL-04-identidad dice «Tu teléfono está verificado» aunque demo/data aún no lo trae (pedido en «requests»). */
const PHONE_VERIFIED_IN_PROTOTYPE: readonly DemoActorId[] = ['carolina'];

/** ¿Tiene la identidad verificada al empezar la sesión? (sin lo que pase en esta sesión). */
export function identityVerifiedInData(actorId: DemoActorId): boolean {
    return !IDENTITY_PENDING_AT_START.includes(actorId) && hasVerification(actorId, 'Identidad verificada');
}

export function phoneVerifiedInData(actorId: DemoActorId): boolean {
    return PHONE_VERIFIED_IN_PROTOTYPE.includes(actorId) || hasVerification(actorId, 'Teléfono verificado');
}

/**
 * Un hogar publica con su identidad verificada (spec §10: nivel 2 de quien
 * publica): «Quienes postulen van a trabajar en tu casa».
 */
export function needsIdentity(actor: DemoActor, identitySent: boolean): boolean {
    return actor.kind === 'persona' && !identitySent && !identityVerifiedInData(actor.id);
}

/**
 * La publicación de los datos que representa lo que se acaba de publicar en
 * los flujos 4 y 5 (GES-01-turno y GES-02-hogar del prototipo).
 */
const PUBLISHED_IN_DATA: Partial<Record<DemoActorId, Partial<Record<WizardKind, string>>>> = {
    banqueteria: { turno: 'turno-garzones-finde' },
    carolina: { hogar: 'aviso-asesor-hogar' },
};

/** La publicación propia que abre «Ver publicación», si existe en los datos. */
export function publishedId(actorId: DemoActorId, kind: WizardKind): string | null {
    const id = PUBLISHED_IN_DATA[actorId]?.[kind];
    const managed = id ? getManagedPublication(id) : undefined;
    return managed && managed.ownerId === actorId ? managed.publicationId : null;
}
