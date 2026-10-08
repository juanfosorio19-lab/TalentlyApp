// Lo que Actividad lee de los datos de demostración, ya listo para las
// pantallas. Solo usa las funciones de acceso de features/demo (nunca sus
// constantes DEMO_*), así que cuando vuelva Supabase no cambia nada aquí.
import type { SegmentedOption } from '../../ui/SegmentedControl';
import type { AgendaEventData, IsoDate } from '../../ui/CalendarWeek';
import { addDays, startOfWeek } from '../../ui/CalendarWeek';
import { paths, type ActivitySegment } from '../../app/paths';
import type { DemoActor } from '../demo/session';
import {
    DEMO_TODAY,
    getAgenda,
    getHomeFeed,
    getManagedPublication,
    getOrgDashboard,
    getPublication,
} from '../demo/data';
import type {
    DemoAgendaEvent,
    DemoManagedPublication,
    DemoPublication,
    DemoShiftBlock,
    DemoTarget,
} from '../demo/types';
import { copy } from './copy';
import { DEMO_NOW_TIME, INTERVIEW_MINUTES } from './mock';

// ─── Fechas de la demo («sáb 12 dic» → «2026-12-12») ───────────────────────

const MONTHS: Record<string, number> = {
    ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6, jul: 7, ago: 8, sept: 9, sep: 9, oct: 10, nov: 11, dic: 12,
};

const pad = (n: number) => String(n).padStart(2, '0');

/** «jue 10 dic 2026» → partes; sin año, el de hoy en la demo. */
function parseDayText(text: string, fallbackYear?: number): { y: number; m: number; d: number } | null {
    const match = /(\d{1,2})\s+([a-zé]+)\.?(?:\s+(\d{4}))?/i.exec(text);
    if (!match) return null;
    const d = Number(match[1]);
    const m = MONTHS[(match[2] ?? '').toLocaleLowerCase('es-CL')];
    if (!m) return null;
    const y = match[3] ? Number(match[3]) : (fallbackYear ?? new Date().getFullYear());
    return { y, m, d };
}

const todayParts = parseDayText(DEMO_TODAY);

/** Hoy en la demo, como día civil («2026-12-10»). */
export const TODAY: IsoDate = todayParts
    ? `${todayParts.y}-${pad(todayParts.m)}-${pad(todayParts.d)}`
    : new Date().toISOString().slice(0, 10);

/** Lunes de la semana de hoy: la Agenda muestra esta semana (CalendarWeek aún no cambia de semana). */
export const WEEK_START: IsoDate = startOfWeek(TODAY);
export const WEEK_END: IsoDate = addDays(WEEK_START, 6);

/**
 * «sáb 12 dic» → «2026-12-12». El año es el de hoy; si el mes quedó más de
 * medio año atrás, es del año siguiente («lun 4 ene» visto en diciembre).
 */
export function isoFromDayText(text: string): IsoDate | null {
    const base = todayParts?.y;
    const p = parseDayText(text, base);
    if (!p) return null;
    const year = todayParts && !/\d{4}/.test(text) && p.m < todayParts.m - 6 ? p.y + 1 : p.y;
    return `${year}-${pad(p.m)}-${pad(p.d)}`;
}

/** Día de un bloque de turno (ShiftBlock): «jue» 10 «dic» → «2026-12-10». */
export function isoFromBlock(b: DemoShiftBlock): IsoDate | null {
    return isoFromDayText(`${b.weekday} ${b.day} ${b.month}`);
}

const minutesOf = (hhmm: string) => {
    const [h = 0, m = 0] = hhmm.split(':').map(Number);
    return h * 60 + m;
};

const hhmm = (minutes: number) => `${pad(Math.floor(minutes / 60) % 24)}:${pad(minutes % 60)}`;

const dayIndex = (iso: IsoDate) => {
    const [y = 1970, m = 1, d = 1] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d) / 86_400_000;
};

/** Minutos que faltan, desde ahora en la demo, para el día y la hora dados (negativo si ya pasó). */
export function minutesUntil(date: IsoDate, time: string): number {
    return (dayIndex(date) - dayIndex(TODAY)) * 24 * 60 + minutesOf(time) - minutesOf(DEMO_NOW_TIME);
}

/** «19:00–00:00» → { start: '19:00', end: '00:00' }. */
export function splitTimeRange(range: string): { start: string; end: string } {
    const [start = '', end = ''] = range.split(/[–-]/).map((s) => s.trim());
    return { start, end };
}

// ─── Destinos ───────────────────────────────────────────────────────────────

/** A dónde lleva tocar algo de la demo, siempre con `paths`. */
export function targetPath(t: DemoTarget): string {
    switch (t.pantalla) {
        case 'inicio':
            return paths.inicio();
        case 'explorar':
            return paths.explorar(t.tipo);
        case 'publicacion':
            return paths.publicacion(t.publicationId);
        case 'gestion':
        case 'evaluar':
            return paths.gestionarPublicacion(t.publicationId);
        case 'postulantes':
            return paths.postulantes(t.publicationId);
        case 'cupos':
            return paths.cuposTurno(t.publicationId, t.bloqueId);
        case 'conversacion':
            return paths.conversacion(t.conversationId);
        case 'proceso':
            return paths.proceso(t.processId);
        case 'mi-turno':
            return paths.miTurno(t.applicationId);
        case 'perfil':
            return paths.perfil();
        case 'verificacion':
            return paths.verificacion();
    }
}

// ─── Segmentos (spec §5.2) ──────────────────────────────────────────────────

/** Persona que busca trabajo (Postulaciones e «Impulsa tu perfil»). */
export function seeksWork(actor: DemoActor): boolean {
    return actor.kind === 'persona' && (actor.capabilities.includes('empleo') || actor.capabilities.includes('turnos'));
}

/**
 * Solo los segmentos con contenido posible. Persona: Agenda · Postulaciones
 * (si busca empleo o turnos) · Mis publicaciones (si publicó algo: aviso del
 * hogar, clases, servicios). Organización: Publicaciones · Agenda.
 */
export function segmentsFor(actor: DemoActor, hasPublications: boolean): SegmentedOption<ActivitySegment>[] {
    const panel = (value: ActivitySegment, label: string): SegmentedOption<ActivitySegment> => ({
        value,
        label,
        controls: `act-panel-${value}`,
    });
    if (actor.kind === 'organizacion') {
        return [panel('publicaciones', copy.segments.publicaciones), panel('agenda', copy.segments.agenda)];
    }
    const list = [panel('agenda', copy.segments.agenda)];
    if (seeksWork(actor)) list.push(panel('postulaciones', copy.segments.postulaciones));
    if (hasPublications) list.push(panel('publicaciones', copy.segments.misPublicaciones));
    return list;
}

// ─── Agenda (ACT-01) ────────────────────────────────────────────────────────

export interface AgendaItem {
    /** Lo que dibuja CalendarWeek. */
    event: AgendaEventData;
    /** El original, para su destino y su fecha tal como se dice («lun 14 dic»). */
    source: DemoAgendaEvent;
}

/** Organización: «5/8 confirmados» del bloque del turno, si se conoce. */
function coverageOf(t: DemoTarget): string | undefined {
    if (t.pantalla !== 'cupos') return undefined;
    const block = getManagedPublication(t.publicationId)?.cupos?.find((b) => b.id === t.bloqueId);
    return block ? copy.agenda.coverage(block.confirmados.length, block.total) : undefined;
}

/**
 * La agenda del actor para CalendarWeek, en orden de fecha y hora. Quita los
 * turnos que la persona canceló en esta sesión (`cancelled`, ids de postulación).
 */
export function agendaFor(actor: DemoActor, cancelled: ReadonlySet<string>): AgendaItem[] {
    const items: AgendaItem[] = [];
    for (const e of getAgenda(actor.id)) {
        if (e.destino.pantalla === 'mi-turno' && cancelled.has(e.destino.applicationId)) continue;
        const date = isoFromDayText(e.fecha);
        if (!date) continue;
        const end = e.fin ?? hhmm(minutesOf(e.inicio) + INTERVIEW_MINUTES);
        items.push({
            source: e,
            event: {
                id: e.id,
                date,
                start: e.inicio,
                end,
                kind: e.tipo,
                title: e.titulo,
                who: e.detalle,
                where: actor.kind === 'organizacion' ? coverageOf(e.destino) : undefined,
                status: e.estado,
            },
        });
    }
    return items.sort((a, b) =>
        a.event.date === b.event.date ? minutesOf(a.event.start) - minutesOf(b.event.start) : a.event.date < b.event.date ? -1 : 1,
    );
}

// ─── Publicaciones (ACT-03) ─────────────────────────────────────────────────

export type MyPublication =
    | { kind: 'managed'; id: string; managed: DemoManagedPublication; tipo: DemoPublication['tipo'] | undefined }
    | { kind: 'summary'; id: string; publication: DemoPublication };

/**
 * Lo que publicó el actor. Organización: las de su panel (INI-02). Persona:
 * su aviso de Inicio («Tu aviso»). features/demo aún no trae una función por
 * dueño (pedida en requests). Con GES-01 abre la gestión; si no, su resumen.
 */
export function publicationsFor(actor: DemoActor): MyPublication[] {
    const ids =
        actor.kind === 'organizacion'
            ? (getOrgDashboard(actor.id)?.publicaciones ?? [])
            : getHomeFeed(actor.id).bloques.flatMap((b) => (b.tipo === 'tu-aviso' ? [b.publicationId] : []));
    const list: MyPublication[] = [];
    for (const id of ids) {
        const managed = getManagedPublication(id);
        const publication = getPublication(id);
        if (managed) list.push({ kind: 'managed', id, managed, tipo: publication?.tipo });
        else if (publication) list.push({ kind: 'summary', id, publication });
    }
    return list;
}

export type PublicationGroup = keyof typeof copy.publications.groups;

/** Activas · Pausadas · Cerradas (spec §5.2). */
export function groupOf(p: MyPublication): PublicationGroup {
    const estado = p.kind === 'managed' ? p.managed.estado : p.publication.estado;
    if (estado === 'Pausada') return 'pausadas';
    if (estado === 'Cerrada' || estado === 'Expirada' || estado === 'Oferta cerrada') return 'cerradas';
    return 'activas';
}

/** «0/12 confirmados · 8 el sáb y 4 el dom», «9 postulantes · 6 nuevos» (la métrica que no es Vistas). */
export function metricLine(m: DemoManagedPublication): string | undefined {
    const metric = m.metricas.find((x) => x.label !== 'Vistas');
    if (!metric) return undefined;
    const main = `${metric.valor} ${metric.label.toLocaleLowerCase('es-CL')}`;
    return metric.detalle ? `${main} · ${metric.detalle}` : main;
}
