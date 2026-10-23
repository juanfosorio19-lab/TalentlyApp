// Quién publica y qué puede publicar (spec §5.4: PUBL-02 O · PUBL-03 O,H ·
// PUBL-04 H), cómo aparece en la vista previa, si le falta verificar su
// identidad y adónde lleva «Ver publicación» al terminar. Lógica pura con los
// datos de demostración: publisher.test.ts.
import type { PublicationAuthor, PublicationVerification } from '../../../ui/PublicationCard';
import { getManagedPublication, getOrg } from '../../demo/data';
import type { DemoActor, DemoActorId } from '../../demo/session';
import { identityInData, identityPendingAtStart, phoneInData, type IdentityStatus } from '../../demo/verifications';
import { initialHogar, type HogarDraft } from './hogar';
import { turnoTemplate, type TurnoDraft } from './turno';

/** Los asistentes que existen en la URL (`paths.publicar`). */
export type PublishTipo = 'empleo' | 'turno' | 'hogar' | 'clase' | 'servicio';
/** Los que tienen pantallas en F1. */
export type WizardKind = 'turno' | 'hogar';

export const PUBLISH_TIPOS: readonly PublishTipo[] = ['empleo', 'turno', 'hogar', 'clase', 'servicio'];

export const isPublishTipo = (v: string | undefined): v is PublishTipo => PUBLISH_TIPOS.some((t) => t === v);

/** Pasos de PUBL-03 y PUBL-04: los 4 propios y el 5, PUBL-08 · Tipo de publicación. */
export const WIZARD_STEPS = 5;
export const PLAN_STEP = 5;

/**
 * Una organización publica empleos y turnos; un hogar, su aviso y turnos para
 * un evento en su casa. Recién registrado (INI-01-jorge-nuevo) todavía no
 * tiene perfil Hogar (Perfil muestra solo «Trabajo» e Inicio no ofrece
 * «Publicar»): no publica nada.
 */
export function canPublish(actor: DemoActor, tipo: WizardKind | 'empleo', recienRegistrado = false): boolean {
    if (actor.kind === 'organizacion') return tipo !== 'hogar';
    if (recienRegistrado || !actor.capabilities.includes('hogar')) return false;
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

/**
 * ¿Tiene la identidad verificada al empezar la sesión? (sin lo que pase en
 * esta sesión). Carolina la verifica en el flujo 5 (PUBL-04-identidad →
 * VER-02): la misma regla de demo/verifications que VER-01 y Perfil.
 */
export function identityVerifiedInData(actorId: DemoActorId): boolean {
    return identityInData(actorId) && !identityPendingAtStart(actorId);
}

/** PUBL-04-identidad: «Tu teléfono está verificado» (los datos de la demo; la identidad lo supone). */
export function phoneVerifiedInData(actorId: DemoActorId): boolean {
    return phoneInData(actorId);
}

/**
 * Un hogar publica con su identidad verificada (spec §10: nivel 2 de quien
 * publica): «Quienes postulen van a trabajar en tu casa». `identity`: el
 * estado de la sesión (demo/sessionStore.useIdentityStatus): enviada en
 * VER-02 (desde PUBL-04 o desde VER-01) ya no se pide.
 */
export function needsIdentity(actor: DemoActor, identity: IdentityStatus): boolean {
    return actor.kind === 'persona' && identity === 'pending';
}

// ─── Lo publicado que ya está en los datos (PUBL-07) ────────────────────────

/** Una publicación de los datos y el borrador del que sale, tal como lo muestran los pasos del prototipo. */
interface InData {
    id: string;
    draft: () => TurnoDraft | HogarDraft | undefined;
}

/**
 * Lo que se publica en los flujos 4 y 5 ya está en los datos (GES-01-turno y
 * GES-02-hogar del prototipo): «Garzones fin de semana» sale de la plantilla
 * de Banquetería Rosa SpA sin cambios (PUBL-03 pasos 1 a 4) y el aviso de
 * Carolina, de los pasos de PUBL-04. Otro borrador (desde cero, otro título,
 * otros bloques, otro sueldo) no es esa publicación.
 */
const PUBLISHED_IN_DATA: Partial<Record<DemoActorId, Partial<Record<WizardKind, InData>>>> = {
    banqueteria: { turno: { id: 'turno-garzones-finde', draft: () => turnoTemplate('banqueteria')?.draft } },
    carolina: { hogar: { id: 'aviso-asesor-hogar', draft: () => initialHogar('carolina') } },
};

/** Lo que se publica de un turno: todo menos cómo empezó y el id interno de cada bloque. */
function turnoContent(d: TurnoDraft): Record<Exclude<keyof TurnoDraft, 'kind' | 'inicio'>, unknown> {
    return {
        oficio: d.oficio,
        titulo: d.titulo.trim(),
        bloques: d.bloques
            .map(({ fecha, desde, hasta, cupos }) => ({ fecha, desde, hasta, cupos }))
            .sort((a, b) => (a.fecha ?? '').localeCompare(b.fecha ?? '')),
        neto: d.neto,
        tarifa: d.tarifa,
        unidad: d.unidad,
        esporadico: d.esporadico,
        contratacion: d.contratacion,
        vestimenta: [...d.vestimenta].sort(),
        puntoEncuentro: d.puntoEncuentro.trim(),
        direccion: d.direccion.trim(),
        pideIdentidad: d.pideIdentidad,
        notaMinima: d.notaMinima,
        notaPostulantes: d.notaPostulantes.trim(),
    };
}

/** Lo que se publica de un aviso del hogar (los días, el contexto y las tareas, sin importar el orden en que se marcaron). */
function hogarContent(d: HogarDraft): Record<Exclude<keyof HogarDraft, 'kind'>, unknown> {
    return {
        oficio: d.oficio,
        modalidad: d.modalidad,
        dias: [...d.dias].sort(),
        desde: d.desde,
        hasta: d.hasta,
        colacion: d.colacion,
        contexto: [...d.contexto].sort(),
        tareas: [...d.tareas].sort(),
        algoMas: d.algoMas.trim(),
        neto: d.neto,
        sueldo: d.sueldo,
        unidad: d.unidad,
    };
}

const contentOf = (d: TurnoDraft | HogarDraft): string => JSON.stringify(d.kind === 'turno' ? turnoContent(d) : hogarContent(d));

/**
 * La publicación propia de los datos que representa lo que se publica con
 * este borrador, o `null` si lo publicado no está en los datos de
 * demostración. Con ella, «Ver publicación» abre GES-01 o GES-02 y lo
 * publicado aparece en ACT-03, INI-02 y Explorar; sin ella, PUBL-07 solo
 * ofrece «Ir a Inicio» (no abre otra publicación con otro título).
 */
export function publishedId(actorId: DemoActorId, draft: TurnoDraft | HogarDraft): string | null {
    const inData = PUBLISHED_IN_DATA[actorId]?.[draft.kind];
    const reference = inData?.draft();
    if (!inData || !reference || contentOf(reference) !== contentOf(draft)) return null;
    const managed = getManagedPublication(inData.id);
    return managed && managed.ownerId === actorId ? managed.publicationId : null;
}
