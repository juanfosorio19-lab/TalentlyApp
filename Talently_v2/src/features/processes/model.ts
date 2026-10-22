// Lo que PRC-01 y REV-01 leen de los datos de demostración, ya listo para las
// pantallas. Solo funciones puras sobre las funciones de acceso de
// features/demo (nunca sus constantes DEMO_*): cuando vuelva Supabase, cambian
// las consultas y las pantallas quedan igual.
import type { BadgeStatus } from '../../ui/Badge';
import type { TimelineStep } from '../../ui/Timeline';
import type { CalendarEvent } from '../../domain/calendario';
import { paths } from '../../app/paths';
import {
    DEMO_TODAY,
    getApplication,
    getConversations,
    getManagedPublication,
    getPerson,
    getProcess,
    getPublication,
} from '../demo/data';
import type { DemoActor, DemoActorId } from '../demo/session';
import type {
    DemoApplication,
    DemoAuthor,
    DemoProcess,
    DemoProcessStep,
    DemoShiftBlock,
    DemoSystemCard,
} from '../demo/types';

// ─── PRC-01 · Proceso ───────────────────────────────────────────────────────

/**
 * El proceso que abre `/procesos/:engagementId`: el id del proceso o, si
 * llega el de la postulación (ACT-02), el proceso de esa postulación. Solo lo
 * ve quien es parte de él; Jorge recién registrado todavía no tiene ninguno.
 */
export function resolveProcess(engagementId: string, actorId: DemoActorId, recienRegistrado = false): DemoProcess | null {
    if (recienRegistrado) return null;
    const process = getProcess(engagementId) ?? processOfApplication(engagementId);
    if (!process || process.viewerId !== actorId) return null;
    return process;
}

function processOfApplication(applicationId: string): DemoProcess | undefined {
    const processId = getApplication(applicationId)?.processId;
    return processId ? getProcess(processId) : undefined;
}

/** Quien mira es quien postuló (y no quien contrata): solo él puede retirar su postulación. */
export function isApplicantView(process: DemoProcess): boolean {
    return process.contraparte.tipo !== 'persona';
}

/** Etapas que ya pasaron aunque sigan siendo la actual (la entrevista agendada todavía no). */
const NOT_YET_DONE: readonly BadgeStatus[] = ['Entrevista'];

/**
 * Los pasos del Timeline. Si la persona retiró su postulación es un cierre
 * negativo: quedan los pasos que ya pasaron y el último lleva el Badge
 * «Postulación retirada»; los que ya no van a pasar se quitan (Timeline).
 */
export function timelineSteps(process: DemoProcess, withdrawn: boolean): TimelineStep[] {
    const toStep = (s: DemoProcessStep): TimelineStep => ({
        id: s.etapa,
        status: s.estado,
        label: s.etapa,
        date: s.fecha,
        badge: s.badge,
    });
    if (!withdrawn) return process.pasos.map(toStep);
    const happened = process.pasos.filter(
        (s) => s.estado === 'done' || (s.estado === 'current' && !NOT_YET_DONE.includes(s.etapa)),
    );
    return happened.map((s, i) => ({
        ...toStep(s),
        status: 'done',
        badge: i === happened.length - 1 ? 'Postulación retirada' : undefined,
    }));
}

/** El Badge bajo el título. */
export function processStatus(process: DemoProcess, withdrawn: boolean): BadgeStatus {
    return withdrawn ? 'Postulación retirada' : process.estado;
}

/** ¿Sigue en pie la postulación y se puede retirar? */
export function canWithdraw(process: DemoProcess, withdrawn: boolean): boolean {
    return process.puedeRetirar && isApplicantView(process) && !withdrawn;
}

/** A dónde lleva «Ver publicación»: el detalle para quien postuló, la gestión para quien publicó. */
export function publicationPath(process: DemoProcess): string {
    return isApplicantView(process) ? paths.publicacion(process.publicationId) : paths.gestionarPublicacion(process.publicationId);
}

/** Perfil público de la otra parte (PRF-10 o PRF-11). */
export function counterpartPath(author: DemoAuthor): string {
    return author.tipo === 'persona' ? paths.perfilPublico(author.id) : paths.organizacion(author.id);
}

// ─── Entrevista al calendario ───────────────────────────────────────────────

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'] as const;

/** «sep» y «sept» son el mismo mes. */
function monthIndex(name: string): number {
    const n = name.toLocaleLowerCase('es-CL').replace(/\.$/, '');
    return n === 'sep' ? 8 : MONTHS.indexOf(n as (typeof MONTHS)[number]);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Año y mes de hoy en la demo («jue 10 dic 2026»). */
function demoToday(): { year: number; month: number } {
    const m = /(\d{1,2})\s+([a-zé]+)\.?\s+(\d{4})/i.exec(DEMO_TODAY);
    return { year: m ? Number(m[3]) : new Date().getFullYear(), month: m ? monthIndex(m[2] ?? '') : 0 };
}

/**
 * «mar 15 dic · 10:00» → «2026-12-15T10:00», con el año de la demo (o el
 * siguiente si el mes ya pasó). `null` si no trae día, mes y hora.
 */
export function parseWhen(when: string): string | null {
    const m = /(\d{1,2})\s+([a-zé]+)\.?\s*·\s*(\d{1,2}):(\d{2})/i.exec(when);
    if (!m) return null;
    const month = monthIndex(m[2] ?? '');
    if (month < 0) return null;
    const today = demoToday();
    const year = month < today.month ? today.year + 1 : today.year;
    return `${year}-${pad(month + 1)}-${pad(Number(m[1]))}T${pad(Number(m[3]))}:${m[4]}`;
}

/** Suma minutos a una hora local «2026-12-15T10:00» (cruza el día si hace falta). */
export function addMinutes(local: string, minutes: number): string {
    const [date = '', time = '00:00'] = local.split('T');
    const [y = 1970, mo = 1, d = 1] = date.split('-').map(Number);
    const [h = 0, mi = 0] = time.split(':').map(Number);
    const at = new Date(Date.UTC(y, mo - 1, d, h, mi + minutes));
    return `${at.getUTCFullYear()}-${pad(at.getUTCMonth() + 1)}-${pad(at.getUTCDate())}T${pad(at.getUTCHours())}:${pad(at.getUTCMinutes())}`;
}

/** Duración de la entrevista en el calendario: no está en el prototipo (la misma que usa Mensajes). */
export const INTERVIEW_MINUTES = 60;

/** La entrevista como evento de calendario (buildIcs). `null` si la fecha no se entiende. */
export function interviewEvent(process: DemoProcess, card: DemoSystemCard): CalendarEvent | null {
    const [when = '', place] = card.lineas;
    const start = parseWhen(when);
    if (!start) return null;
    return {
        uid: `${process.id}-entrevista`,
        title: `Entrevista con ${process.contraparte.nombre}`,
        start,
        end: addMinutes(start, INTERVIEW_MINUTES),
        location: place,
        description: process.titulo,
    };
}

/** Plantilla «Crear evento» de Google Calendar (en el teléfono, sin plugin de calendario). */
export function googleCalendarUrl(event: CalendarEvent): string {
    const stamp = (local: string) => `${local.replace(/[-:]/g, '')}00`;
    const query = new URLSearchParams({ action: 'TEMPLATE', text: event.title, ctz: 'America/Santiago' });
    if (event.location) query.set('location', event.location);
    if (event.description) query.set('details', event.description);
    return `https://calendar.google.com/calendar/render?${query.toString()}&dates=${stamp(event.start)}/${stamp(event.end)}`;
}

// ─── REV-01 · Evaluación ────────────────────────────────────────────────────

/** Etiquetas al evaluar a quien publicó el turno (01-super-prompt, REV-01). */
export const ORG_TAGS = ['Pago a tiempo'] as const;

export interface ReviewSubject {
    publicationId: string;
    /** A quién se evalúa: quien publicó el turno. */
    counterpart: DemoAuthor;
    /** «sáb 5 dic». */
    fecha: string;
    /** «Turno · Garzón · sáb 5 dic». */
    linea: string;
    /** «¿Cómo te fue con la organización?». */
    pregunta: string;
    tags: readonly string[];
}

export type ReviewTarget =
    | { kind: 'review'; subject: ReviewSubject }
    /** Quien publicó el turno evalúa a cada persona en los cupos (GES-04). */
    | { kind: 'owner'; path: string }
    /** No trabajó ese turno (postulado, en lista de espera, cancelado) o no es un turno. */
    | { kind: 'not-worked' }
    | { kind: 'not-found' };

/**
 * `/resena/:engagementId`: el id de una postulación (DemoApplication) o el de
 * una publicación (las notificaciones «Evalúa tu turno del sáb 5 dic»).
 * `applications` son las del actor en esta sesión (useApplications): un turno
 * que canceló ya no se evalúa.
 */
export function resolveReview(
    engagementId: string,
    actor: Pick<DemoActor, 'id'>,
    applications: readonly DemoApplication[],
    recienRegistrado = false,
): ReviewTarget {
    if (recienRegistrado) return { kind: 'not-found' };
    const application = applications.find((a) => a.id === engagementId);
    if (application) {
        const pub = getPublication(application.publicationId);
        if (application.tipo !== 'turno' || application.estado !== 'Confirmado') return { kind: 'not-worked' };
        const block = application.miTurno?.bloque ?? (pub?.tipo === 'turno' ? pub.bloques[0] : undefined);
        if (!block) return { kind: 'not-found' };
        return { kind: 'review', subject: subjectOf(actor.id, application.publicationId, application.autor, block) };
    }

    const pub = getPublication(engagementId);
    if (!pub) return { kind: 'not-found' };
    const managed = getManagedPublication(pub.id);
    if (managed?.ownerId === actor.id || pub.autor.id === actor.id) {
        const shiftId = managed?.cupos?.[0]?.id;
        return { kind: 'owner', path: shiftId ? paths.cuposTurno(pub.id, shiftId) : paths.gestionarPublicacion(pub.id) };
    }
    if (pub.tipo !== 'turno') return { kind: 'not-worked' };
    // Trabajó el turno: lo confirmaron en un bloque (GES-04) o su postulación quedó confirmada.
    const roster = managed?.cupos?.find((c) => c.confirmados.some((p) => p.personId === actor.id));
    const confirmed = applications.find((a) => a.publicationId === pub.id && a.estado === 'Confirmado');
    if (!roster && !confirmed) return { kind: 'not-worked' };
    const block = pub.bloques.find((b) => b.id === roster?.id) ?? confirmed?.miTurno?.bloque ?? pub.bloques[0];
    if (!block) return { kind: 'not-found' };
    return { kind: 'review', subject: subjectOf(actor.id, pub.id, pub.autor, block) };
}

function subjectOf(actorId: DemoActorId, publicationId: string, counterpart: DemoAuthor, block: DemoShiftBlock): ReviewSubject {
    const fecha = `${block.weekday} ${block.day} ${block.month}`;
    return {
        publicationId,
        counterpart,
        fecha,
        linea: ['Turno', shiftRole(actorId, publicationId), fecha].filter(Boolean).join(' · '),
        pregunta: questionFor(counterpart),
        tags: ORG_TAGS,
    };
}

/**
 * El oficio con que trabajó el turno («Garzón»): el de su conversación con
 * quien publicó («Turno · Garzón · 5 dic») o, si no hay, su oficio principal.
 */
export function shiftRole(actorId: DemoActorId, publicationId: string): string | undefined {
    const conv = getConversations(actorId).find((c) => c.contexto.tipo === 'turno' && c.contexto.publicationId === publicationId);
    const parts = conv?.contexto.texto.split(' · ') ?? [];
    if (parts[0] === 'Turno' && parts[1]) return parts[1];
    return getPerson(actorId)?.oficio;
}

function questionFor(author: DemoAuthor): string {
    if (author.tipo === 'organizacion') return '¿Cómo te fue con la organización?';
    if (author.tipo === 'hogar') return '¿Cómo te fue con la familia?';
    return `¿Cómo te fue con ${author.nombre}?`;
}

/** Quien busca trabajo tiene «Mis postulaciones» (ACT-02); los demás vuelven a Inicio. */
export function seeksWork(actor: Pick<DemoActor, 'capabilities'>): boolean {
    return actor.capabilities.includes('empleo') || actor.capabilities.includes('turnos');
}
