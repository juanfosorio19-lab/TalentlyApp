// Lo que Actividad lee de los datos de demostración y del estado de la sesión,
// ya listo para las pantallas. Son funciones puras: las pantallas les pasan lo
// que leen de demo/sessionStore (useApplications, useInbox), así ACT-02, la
// Agenda, Inicio y TUR-01 ven lo mismo. Solo usan las funciones de acceso de
// features/demo (nunca sus constantes de datos).
import type { SegmentedOption } from '../../ui/SegmentedControl';
import { addDays, formatDayShort, startOfWeek, type AgendaEventData, type IsoDate } from '../../ui/CalendarWeek';
import { paths, type ActivitySegment } from '../../app/paths';
import type { CalendarEvent } from '../../domain/calendario';
import type { DemoActor, DemoActorId } from '../demo/session';
import { startsWithoutApplication } from '../demo/sessionStore';
import { DEMO_TODAY, getAgenda, getHomeFeed, getManagedPublication, getOrgDashboard, getProcess, getPublication } from '../demo/data';
import type {
    BadgeStatus,
    DemoAgendaEvent,
    DemoApplication,
    DemoManagedPublication,
    DemoNotification,
    DemoPublication,
    DemoShiftBlock,
    DemoTarget,
} from '../demo/types';
import { copy } from './copy';
import { DEMO_NOW_TIME } from './mock';

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

// ─── Segmentos (spec §5.2) ──────────────────────────────────────────────────

/** Persona que busca trabajo (Postulaciones e «Impulsa tu perfil»). */
export function seeksWork(actor: DemoActor): boolean {
    return actor.kind === 'persona' && (actor.capabilities.includes('empleo') || actor.capabilities.includes('turnos'));
}

/**
 * Solo los segmentos con contenido posible, en el orden de spec §5.2.
 * Persona: Agenda · Postulaciones (si busca empleo o turnos) · Mis
 * publicaciones (si publicó algo: aviso del hogar, clases, servicios).
 * Organización: Publicaciones · Agenda.
 */
export function segmentsFor(actor: DemoActor, hasPublications: boolean): SegmentedOption<ActivitySegment>[] {
    const option = (value: ActivitySegment, label: string): SegmentedOption<ActivitySegment> => ({ value, label });
    if (actor.kind === 'organizacion') {
        return [option('publicaciones', copy.segments.publicaciones), option('agenda', copy.segments.agenda)];
    }
    const list = [option('agenda', copy.segments.agenda)];
    if (seeksWork(actor)) list.push(option('postulaciones', copy.segments.postulaciones));
    if (hasPublications) list.push(option('publicaciones', copy.segments.misPublicaciones));
    return list;
}

/**
 * Segmento con que abre la pestaña (sin `?seg` o con uno que no aplica). El
 * orden de los segmentos no es el de apertura: el TabBar del prototipo lleva
 * a Matías y Jorge a ACT-02 (Postulaciones), a Carolina a ACT-03 (Mis
 * publicaciones) y a la organización a ACT-01 (Agenda, ACT-01-rosa).
 */
export function defaultSegmentFor(actor: DemoActor, hasPublications: boolean): ActivitySegment {
    if (actor.kind === 'organizacion') return 'agenda';
    if (seeksWork(actor)) return 'postulaciones';
    if (hasPublications) return 'publicaciones';
    return 'agenda';
}

/** El segmento que se muestra para `?seg=<pedido>`: el pedido si aplica al actor; si no, el de apertura. */
export function resolveSegment(
    actor: DemoActor,
    hasPublications: boolean,
    requested: string | null,
): { seg: ActivitySegment; segments: SegmentedOption<ActivitySegment>[] } {
    const segments = segmentsFor(actor, hasPublications);
    const fallback = defaultSegmentFor(actor, hasPublications);
    const current =
        segments.find((s) => s.value === requested) ?? segments.find((s) => s.value === fallback) ?? segments[0];
    return { seg: current?.value ?? 'agenda', segments };
}

// ─── Postulaciones (ACT-02) ─────────────────────────────────────────────────

export interface ActivityOptions {
    /** Cuenta recién creada (INI-01-jorge-nuevo): aún no tiene actividad. */
    recienRegistrado: boolean;
}

/**
 * A dónde lleva una fila de ACT-02: un turno confirmado abre Mi turno
 * (TUR-01, flujo 2); un empleo, su proceso (PRC-01); un turno postulado o en
 * lista de espera, su detalle (DET-01, como DET-01-turno-postulado).
 */
export function applicationPath(a: DemoApplication): string {
    if (a.miTurno) return paths.miTurno(a.id);
    if (a.tipo === 'empleo' && a.processId) return paths.proceso(a.processId);
    return paths.publicacion(a.publicationId);
}

// ─── Agenda (ACT-01) ────────────────────────────────────────────────────────

export interface AgendaItem {
    id: string;
    date: IsoDate;
    /** La fecha tal como se dice en los datos: «lun 14 dic». */
    fecha: string;
    start: string;
    /** Sin hora de término (las entrevistas de la demo): se muestra solo el inicio, nunca una inventada. */
    end?: string;
    kind: 'turno' | 'entrevista';
    /** «Turno · Garzón», «Entrevista · Mecánico/a automotriz». */
    title: string;
    /** «Banquetería Rosa SpA · Cóctel corporativo · Providencia». */
    who?: string;
    /** Organización: «5/8 confirmados» del bloque del turno. */
    where?: string;
    status: BadgeStatus;
    /** A dónde lleva tocarlo (demo/targets → paths). */
    target: DemoTarget;
}

// ─── Lo que la organización cambia en GES-01 y GES-04 ───────────────────────

/**
 * Una publicación tal como quedó en la sesión después de GES-01 (pausar,
 * cerrar) y GES-04 (confirmar). Hoy ese estado vive en features/manage, que
 * Actividad no puede leer: pedido en requests subirlo a demo/sessionStore
 * (useManagedView). Mientras no esté, las pantallas no lo pasan y todo sale
 * de los datos; cuando esté, ActivityScreen y AgendaScreen lo pasan aquí y
 * ACT-01 y ACT-03 dicen lo mismo que GES-01, GES-04 e INI-02.
 */
export interface ManagedSession {
    /** «Pausada», «Cerrada»… Sin valor, el de los datos. */
    estado?: BadgeStatus;
    /** Las métricas de GES-01 recalculadas con lo confirmado y lo revisado. */
    metricas?: DemoManagedPublication['metricas'];
    /** Bloque del turno → personas confirmadas ahora (las de los datos y las de la sesión). */
    confirmados?: ReadonlyMap<string, number>;
}

/** Lo de la sesión para una publicación (o nada: la de los datos). */
export type ManagedSessionOf = (publicationId: string) => ManagedSession | undefined;

/** La publicación de los datos con lo que cambió en la sesión. */
function withSession(m: DemoManagedPublication, s: ManagedSession | undefined): DemoManagedPublication {
    if (!s || (s.estado === undefined && s.metricas === undefined)) return m;
    return { ...m, estado: s.estado ?? m.estado, metricas: s.metricas ?? m.metricas };
}

/** Estados de la publicación que se ven en la Agenda en lugar de los del turno («Activa», «Cupos completos»). */
const STOPPED: ReadonlySet<BadgeStatus> = new Set<BadgeStatus>(['Pausada', 'Cerrada', 'Expirada']);

/**
 * Organización: «5/8 confirmados» del bloque del turno y su estado, con lo
 * confirmado en la sesión. Si la publicación se pausó o cerró, ese estado;
 * si se llenaron los cupos, «Cupos completos».
 */
function coverageOf(
    t: DemoTarget,
    estado: BadgeStatus,
    sessionOf?: ManagedSessionOf,
): { where?: string; status: BadgeStatus } {
    if (t.pantalla !== 'cupos') return { status: estado };
    const block = getManagedPublication(t.publicationId)?.cupos?.find((b) => b.id === t.bloqueId);
    if (!block) return { status: estado };
    const s = sessionOf?.(t.publicationId);
    const confirmed = s?.confirmados?.get(t.bloqueId) ?? block.confirmados.length;
    const status =
        s?.estado && STOPPED.has(s.estado) ? s.estado : confirmed >= block.total ? ('Cupos completos' as BadgeStatus) : estado;
    return { where: copy.agenda.coverage(confirmed, block.total), status };
}

/** Estados de un turno pendiente que la Agenda muestra con su Badge (README de CalendarWeek). */
const PENDING_SHIFT: ReadonlySet<BadgeStatus> = new Set<BadgeStatus>(['Postulado', 'En lista de espera']);

/** Comuna de «a 18 km · Las Condes» (o «Las Condes» si quien mira es quien publica). */
const comunaOf = (lugar: string) => lugar.split(' · ').pop() ?? lugar;

/**
 * Turnos postulados o en lista de espera, con fecha: uno por bloque (quien
 * postula, postula a todos los días). Abren su detalle (DET-01).
 */
function pendingShifts(actorId: DemoActorId, applications: readonly DemoApplication[]): DemoAgendaEvent[] {
    const events: DemoAgendaEvent[] = [];
    for (const a of applications) {
        if (a.tipo !== 'turno' || a.miTurno || !PENDING_SHIFT.has(a.estado)) continue;
        const publication = getPublication(a.publicationId);
        if (publication?.tipo !== 'turno') continue;
        for (const b of publication.bloques) {
            const { start, end } = splitTimeRange(b.time);
            if (!start) continue;
            events.push({
                id: `${a.id}:${b.id}`,
                viewerId: actorId,
                fecha: `${b.weekday} ${b.day} ${b.month}`,
                esHoy: isoFromBlock(b) === TODAY,
                inicio: start,
                fin: end || undefined,
                titulo: `Turno · ${publication.titulo}`,
                detalle: `${a.autor.nombre} · ${comunaOf(publication.lugar)}`,
                estado: a.estado,
                tipo: 'turno',
                destino: { pantalla: 'publicacion', publicationId: a.publicationId },
            });
        }
    }
    return events;
}

/**
 * ¿Sigue en pie este compromiso de los datos en esta sesión? Un turno
 * confirmado, si la postulación sigue y no se canceló en TUR-01. Una
 * entrevista, si su proceso ya existe: en los flujos 2 y 3 el actor parte sin
 * postular (FLOW_START de demo/sessionStore) y su entrevista llega al postular.
 */
function isLive(e: DemoAgendaEvent, actorId: DemoActorId, applications: readonly DemoApplication[]): boolean {
    const d = e.destino;
    if (d.pantalla === 'mi-turno') {
        const application = applications.find((a) => a.id === d.applicationId);
        return application !== undefined && application.estado !== 'Cancelaste';
    }
    if (d.pantalla === 'proceso') {
        const publicationId = getProcess(d.processId)?.publicationId;
        if (publicationId && startsWithoutApplication(actorId, publicationId)) {
            return applications.some((a) => a.publicationId === publicationId);
        }
    }
    return true;
}

const byDateAndStart = (a: AgendaItem, b: AgendaItem) =>
    a.date === b.date ? minutesOf(a.start) - minutesOf(b.start) : a.date < b.date ? -1 : 1;

/**
 * La agenda del actor en orden de fecha y hora: lo confirmado, las entrevistas
 * y los turnos pendientes con su estado. `applications` son las de la sesión
 * (useApplications): sin las canceladas y sin lo que el actor aún no postuló.
 * `sessionOf`: lo que la organización cambió en GES-01 y GES-04 (ver
 * ManagedSession). Recién registrado, vacía.
 */
export function agendaFor(
    actor: DemoActor,
    applications: readonly DemoApplication[],
    { recienRegistrado }: ActivityOptions,
    sessionOf?: ManagedSessionOf,
): AgendaItem[] {
    if (recienRegistrado) return [];
    const items: AgendaItem[] = [];
    const events = [...getAgenda(actor.id).filter((e) => isLive(e, actor.id, applications)), ...pendingShifts(actor.id, applications)];
    for (const e of events) {
        const date = isoFromDayText(e.fecha);
        if (!date) continue;
        const { where, status } =
            actor.kind === 'organizacion' ? coverageOf(e.destino, e.estado, sessionOf) : { where: undefined, status: e.estado };
        items.push({
            id: e.id,
            date,
            fecha: e.fecha,
            start: e.inicio,
            end: e.fin,
            kind: e.tipo,
            title: e.titulo,
            who: e.detalle,
            where,
            status,
            target: e.destino,
        });
    }
    return items.sort(byDateAndStart);
}

/**
 * Lo que hay que corregir en la URL de la Agenda para que diga lo que se ve:
 * un ?dia que no es un día de la tira pasa a `day` (el que se muestra) y una
 * ?vista desconocida, a «semana». Sin ?dia ni ?vista, nada.
 */
export function agendaParamsFix(dayParam: string | null, viewParam: string | null, day: IsoDate): Record<string, string> {
    const fix: Record<string, string> = {};
    if (dayParam !== null && dayParam !== day) fix.dia = day;
    if (viewParam !== null && viewParam !== 'dia' && viewParam !== 'semana') fix.vista = 'semana';
    return fix;
}

/** Lo que dibuja AgendaEvent. Sin hora de término, la columna de la hora muestra solo el inicio. */
export function toEventData(item: AgendaItem): AgendaEventData {
    return {
        id: item.id,
        date: item.date,
        start: item.start,
        end: item.end ?? '',
        kind: item.kind,
        title: item.title,
        who: item.who,
        where: item.where,
        status: item.status,
    };
}

/**
 * Nombre accesible de un compromiso sin hora de término (AgendaEvent arma
 * «de 10:00 a 11:00» y aquí no hay término): «…, vie 11 dic a las 10:00, …».
 * Con término, el de AgendaEvent.
 */
export function eventLabel(item: AgendaItem): string | undefined {
    if (item.end) return undefined;
    const sub = [item.who, item.where].filter(Boolean).join(' · ');
    return `${item.title}, ${formatDayShort(item.date)} a las ${item.start}${sub ? `, ${sub}` : ''}, ${item.status}`;
}

/** «lun 14 dic · 09:00» o «sáb 19 dic · 18:00–00:00»: la fecha y el horario como se dicen. */
export function whenText(item: AgendaItem): string {
    return `${item.fecha} · ${item.start}${item.end ? `–${item.end}` : ''}`;
}

/** Los compromisos agrupados por día, en orden (vista Semana). */
export function groupByDay(items: readonly AgendaItem[]): { date: IsoDate; items: AgendaItem[] }[] {
    const groups: { date: IsoDate; items: AgendaItem[] }[] = [];
    for (const item of items) {
        const last = groups[groups.length - 1];
        if (last && last.date === item.date) last.items.push(item);
        else groups.push({ date: item.date, items: [item] });
    }
    return groups;
}

// ─── Publicaciones (ACT-03) ─────────────────────────────────────────────────

export type MyPublication =
    | { kind: 'managed'; id: string; managed: DemoManagedPublication; publication: DemoPublication | undefined }
    | { kind: 'summary'; id: string; publication: DemoPublication };

/**
 * Lo que publicó el actor. Organización: las de su panel (INI-02). Persona:
 * su aviso de Inicio («Tu aviso»; recién registrado, ninguno). features/demo
 * aún no trae una función por dueño (pedida en requests). Con `sessionOf`, el
 * estado y las métricas son los de GES-01 (una pausada pasa a «Pausadas»).
 */
export function publicationsFor(
    actor: DemoActor,
    { recienRegistrado }: ActivityOptions,
    sessionOf?: ManagedSessionOf,
): MyPublication[] {
    if (recienRegistrado) return [];
    const ids =
        actor.kind === 'organizacion'
            ? (getOrgDashboard(actor.id)?.publicaciones ?? [])
            : getHomeFeed(actor.id).bloques.flatMap((b) => (b.tipo === 'tu-aviso' ? [b.publicationId] : []));
    const list: MyPublication[] = [];
    for (const id of ids) {
        const data = getManagedPublication(id);
        const managed = data && withSession(data, sessionOf?.(id));
        const publication = getPublication(id);
        if (managed) list.push({ kind: 'managed', id, managed, publication });
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

/**
 * «Publicas como …» de PUBL-01: la organización, o el hogar de la persona
 * («Familia en Ñuñoa», autor de su aviso). Sin aviso, su nombre.
 */
export function publisherFor(actor: DemoActor, publications: readonly MyPublication[]): string {
    if (actor.kind === 'organizacion') return actor.fullName;
    const own = publications.find((p) => p.publication)?.publication;
    return own?.autor.nombre ?? actor.fullName;
}

// ─── Mi turno (TUR-01) ──────────────────────────────────────────────────────

export interface ShiftWindow {
    date: IsoDate;
    start: string;
    /** Día en que termina: el siguiente si cruza la medianoche (18:00–02:00). */
    endDate: IsoDate;
    end: string;
}

/** Cuándo empieza y termina el bloque del turno. `null` si su día o su horario no se entienden. */
export function shiftWindow(block: DemoShiftBlock): ShiftWindow | null {
    const date = isoFromBlock(block);
    const { start, end } = splitTimeRange(block.time);
    if (!date || !start || !end) return null;
    return { date, start, end, endDate: minutesOf(end) <= minutesOf(start) ? addDays(date, 1) : date };
}

/** ¿El turno ya terminó (ahora en la demo)? Entonces se evalúa (REV-01) y ya no se confirma ni cancela. */
export function hasEnded(w: ShiftWindow): boolean {
    return minutesUntil(w.endDate, w.end) <= 0;
}

/** Evento del calendario (.ics con buildIcs) del turno, en hora local de Chile. */
export function shiftCalendarEvent(
    uid: string,
    title: string,
    w: ShiftWindow,
    location?: string,
    description?: string,
): CalendarEvent {
    return { uid, title, start: `${w.date}T${w.start}`, end: `${w.endDate}T${w.end}`, location, description };
}

/** «2026-12-10T19:00» → «20261210T190000». */
const googleStamp = (value: string) => `${value.replace(/[-:]/g, '')}00`;

/** Plantilla «Crear evento» de Google Calendar: en el teléfono abre sin plugin de calendario. */
export function googleCalendarUrl(e: CalendarEvent): string {
    const query = new URLSearchParams({ action: 'TEMPLATE', text: e.title, ctz: 'America/Santiago' });
    if (e.location) query.set('location', e.location);
    if (e.description) query.set('details', e.description);
    // `dates` va con su barra tal cual: «20261210T190000/20261211T000000».
    return `https://calendar.google.com/calendar/render?${query.toString()}&dates=${googleStamp(e.start)}/${googleStamp(e.end)}`;
}

/**
 * Nombre del archivo, legible: «Mi turno - Garzones para coctel corporativo.ics».
 * Solo ASCII (Chrome descarta un nombre con tildes o «·» y lo llama «download») y
 * sin / ni : que el sistema no acepta.
 */
export function icsFileName(title: string): string {
    const name = `${copy.shift.title} - ${title}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\x20-\x7E]+/g, '')
        .replace(/[\\/:*?"<>|]+/g, '-');
    return `${name}.ics`;
}

export interface PendingReview {
    id: string;
    /** «Evalúa tu turno del sáb 5 dic». */
    title: string;
    /** «Banquetería Rosa SpA». */
    from: string;
    /** El turno por evaluar. */
    publicationId: string;
    target: DemoTarget;
}

/**
 * Evaluaciones que el actor tiene pendientes (spec §5.2: la evaluación mutua
 * se pide antes de postular al siguiente turno), salvo la del turno que se
 * está mirando y las que ya fue a evaluar (`started`, publicaciones). Salen
 * de su bandeja (useInbox): la notificación «Evalúa tu turno del …» lleva a
 * REV-01.
 */
export function pendingReviewsFor(
    notifications: readonly DemoNotification[],
    actorId: DemoActorId,
    exceptPublicationId?: string,
    started: ReadonlySet<string> = new Set(),
): PendingReview[] {
    const seen = new Set<string>();
    const reviews: PendingReview[] = [];
    for (const n of notifications) {
        const t = n.destino;
        if (n.actorId !== actorId || t?.pantalla !== 'evaluar' || t.publicationId === exceptPublicationId) continue;
        if (seen.has(t.publicationId) || started.has(t.publicationId)) continue;
        seen.add(t.publicationId);
        reviews.push({ id: n.id, title: n.titulo, from: n.origen, publicationId: t.publicationId, target: t });
    }
    return reviews;
}
