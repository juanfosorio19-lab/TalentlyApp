// Lo que GES-01, GES-02 y GES-04 muestran, derivado de los datos de
// demostración MÁS lo que pasó en la sesión (./store y demo/sessionStore).
// Funciones puras: la misma cifra (confirmados, postulantes nuevos, por
// evaluar) sale siempre de aquí, nunca del texto fijo de los datos.
import type { BadgeStatus } from '../../ui/Badge';
import { DEMO_TODAY, getPerson, getPublication } from '../demo/data';
import { keyOf, startsWithoutApplication, type SessionApplication } from '../demo/sessionStore';
import { DEMO_ACTORS, type DemoActorId } from '../demo/session';
import type {
    DemoApplicant,
    DemoManagedPublication,
    DemoPerson,
    DemoShiftBlock,
    DemoShiftRoster,
} from '../demo/types';
import { applicantKey, rosterKey, slotKey, type ManageState } from './store';

// ─── Lo que los datos aún no traen (pedido en requests) ─────────────────────

/**
 * Favoritos de cada organización (el corazón junto al nombre en GES-04): las
 * personas con corazón en GES-04 y GES-04-postulados del prototipo. «5
 * personas que ya trabajaron contigo»: la quinta no aparece en ningún mockup.
 */
const ORG_FAVORITES: Partial<Record<DemoActorId, readonly string[]>> = {
    banqueteria: ['javiera-contreras', 'felipe-araya', 'martin-silva', 'fernanda-castro'],
};

/**
 * Turnos recién publicados cuyos postulados llegan después del «salto de
 * tiempo» (flujo 4: GES-04 sin postulados → GES-04-finde-postulados).
 */
const ARRIVES_LATER: readonly string[] = [rosterKey('turno-garzones-finde', 'finde-sab-19')];

/** Evaluaciones hechas antes de la sesión: a Matías ya lo evaluaron (MSG-01, «Ya te evaluamos»). */
const EVALUATED_BEFORE: readonly string[] = [slotKey('turno-garzones-finde-5dic', 'finde-sab-5', 'matias')];

/** Motivos de «Cerrar publicación». */
export const CLOSE_REASONS = {
    turno: ['Ya completé los cupos', 'El evento se canceló', 'Encontré personas por otro medio', 'Otro motivo'],
    empleo: ['Ya contraté a alguien', 'Contraté por otro medio', 'Ya no necesito a alguien', 'Otro motivo'],
} as const;

/** Mensajes amables de «No seleccionar» (la persona recibe este texto, sin más detalles). */
export const REJECT_MESSAGES = [
    'Gracias por postular. Esta vez buscamos otro perfil.',
    'Gracias por postular. Ya avanzamos con otras personas.',
    'Gracias por postular. El horario o la comuna no calzan esta vez.',
] as const;

// ─── Fechas de la demo (hoy es jue 10 dic 2026) ─────────────────────────────

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'] as const;

interface DemoDate {
    day: number;
    month: number;
    year: number;
}

function parseToday(): DemoDate {
    const m = /(\d{1,2}) (\p{L}{3}) (\d{4})/u.exec(DEMO_TODAY);
    const month = m ? MONTHS.indexOf(m[2] as (typeof MONTHS)[number]) : 11;
    return { day: Number(m?.[1] ?? 10), month: month === -1 ? 11 : month, year: Number(m?.[3] ?? 2026) };
}

const TODAY = parseToday();

/** «19 dic» → fecha de la demo. Sin año: un mes que ya pasó hace más de medio año es del año siguiente. */
export function parseDemoDate(text: string): DemoDate | null {
    const m = /(\d{1,2}) (\p{L}{3})/u.exec(text);
    if (!m) return null;
    const month = MONTHS.indexOf(m[2] as (typeof MONTHS)[number]);
    if (month === -1) return null;
    const year = TODAY.year + (month < TODAY.month - 6 ? 1 : 0);
    return { day: Number(m[1]), month, year };
}

const stamp = (d: DemoDate) => Date.UTC(d.year, d.month, d.day);

/** ¿Fue antes de hoy? El turno de hoy todavía no termina (son las 13:00). */
export function isBeforeToday(text: string): boolean {
    const d = parseDemoDate(text);
    return d ? stamp(d) < stamp(TODAY) : false;
}

/** «9 ene»: hoy más `days` días. */
export function todayPlus(days: number): string {
    const d = new Date(Date.UTC(TODAY.year, TODAY.month, TODAY.day + days));
    return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

/** «hasta el 7 ene» de la vigencia → «7 ene». */
export function expiryOf(vigencia: string): string | undefined {
    return /hasta el (.+)$/.exec(vigencia)?.[1];
}

// ─── Textos con nombres ─────────────────────────────────────────────────────

export const firstName = (nombre: string) => nombre.split(' ')[0] ?? nombre;

/** «Martín» · «Martín y a Fernanda» · «Martín, a Fernanda y a Nicolás» (va después de «a »). */
export function joinWithA(names: readonly string[]): string {
    if (names.length <= 1) return names[0] ?? '';
    const head = names.slice(0, -1);
    return `${head.join(', a ')} y a ${names[names.length - 1]}`;
}

/** «Quedan 3 cupos. Con un toque confirmas a Martín y a Fernanda.» */
export function favoritesText(free: number, names: readonly string[]): string {
    const quedan = free === 1 ? 'Queda 1 cupo.' : `Quedan ${free} cupos.`;
    return `${quedan} Con un toque confirmas a ${joinWithA(names)}.`;
}

// ─── Publicación (GES-01) ───────────────────────────────────────────────────

export const isShiftPublication = (m: DemoManagedPublication) => (m.cupos?.length ?? 0) > 0;

export interface PublicationView {
    estado: BadgeStatus;
    vigencia: string;
    paused: boolean;
    closed: boolean;
    /** Cerrada en esta sesión (no la que terminó con su fecha). */
    closedNow: boolean;
    renewed: boolean;
    /** Empleos y avisos: «7 ene». Un turno vence con su fecha y no se renueva. */
    expires?: string;
    canRenew: boolean;
}

export const RENEW_DAYS = 30;

export function publicationView(m: DemoManagedPublication, s: ManageState): PublicationView {
    const change = s.status.get(m.publicationId);
    const estado = change?.estado ?? m.estado;
    const closed = estado === 'Cerrada';
    const paused = estado === 'Pausada';
    const renewed = s.renewed.has(m.publicationId);
    const turno = isShiftPublication(m);
    let vigencia = m.vigencia;
    if (change?.estado === 'Cerrada') vigencia = change.motivo ? `Cerrada hoy · ${change.motivo}` : 'Cerrada hoy';
    else if (paused) vigencia = 'Pausada hoy · no recibe postulaciones';
    else if (renewed) vigencia = `Renovada hoy · hasta el ${todayPlus(RENEW_DAYS)}`;
    const expires = turno || closed ? undefined : renewed ? todayPlus(RENEW_DAYS) : expiryOf(m.vigencia);
    return {
        estado,
        vigencia,
        paused,
        closed,
        closedNow: change?.estado === 'Cerrada',
        renewed,
        expires,
        canRenew: !turno && !closed && !renewed && expires !== undefined,
    };
}

// ─── Personas ───────────────────────────────────────────────────────────────

const isActor = (id: string): id is DemoActorId => Object.hasOwn(DEMO_ACTORS, id);

/** ¿El actor de la sesión que aparece en los datos ya postuló a esta publicación? */
function appliedInSession(personId: string, publicationId: string, applications: ReadonlyMap<string, SessionApplication>): boolean {
    if (!isActor(personId) || !startsWithoutApplication(personId, publicationId)) return true;
    return applications.has(keyOf(personId, publicationId));
}

function applicantFromPerson(p: DemoPerson, estado: BadgeStatus): DemoApplicant {
    return {
        personId: p.id,
        nombre: p.nombre,
        iniciales: p.iniciales,
        linea: [p.oficio, p.experiencia, p.comuna].filter(Boolean).join(' · '),
        estado,
        verificaciones: p.verificaciones,
        nota: p.nota ?? null,
        confiabilidad: p.confiabilidad,
    };
}

/** Actores que postularon en esta sesión y que los datos no traen (DET-01 → «Postular» o «Tomar turno»). */
function sessionApplicants(
    publicationId: string,
    known: ReadonlySet<string>,
    applications: ReadonlyMap<string, SessionApplication>,
): DemoApplicant[] {
    const out: DemoApplicant[] = [];
    for (const [key, a] of applications) {
        const [who = '', pub] = key.split(':');
        if (pub !== publicationId || known.has(who)) continue;
        const person = getPerson(who);
        if (person) out.push(applicantFromPerson(person, a.estado));
    }
    return out;
}

// ─── Cupos de un turno (GES-04) ─────────────────────────────────────────────

export interface RosterView {
    roster: DemoShiftRoster;
    /** «sáb 19 dic». */
    fecha: string;
    confirmados: DemoApplicant[];
    postulados: DemoApplicant[];
    listaEspera: DemoApplicant[];
    total: number;
    free: number;
    full: boolean;
    /** El turno ya pasó: se marca asistencia y se evalúa. */
    past: boolean;
    closed: boolean;
    /** La publicación está pausada: no recibe postulaciones, pero se confirma a quienes ya postularon. */
    paused: boolean;
    /** Recibe postulaciones: ni cerrada ni pausada, y el turno está por venir. */
    accepting: boolean;
    /** Sus postulados todavía no llegan (antes del «salto de tiempo»). */
    waiting: boolean;
    /** Confirmar con un toque: publicación sin cerrar, turno por venir y cupos libres. */
    canConfirm: boolean;
    favorites: ReadonlySet<string>;
    /** «Confirmar a mis favoritos (2)»: favoritos que postularon, hasta llenar los cupos libres. */
    favoritesToConfirm: DemoApplicant[];
    favoritesText?: string;
    /** Después del turno: confirmados sin evaluar que no faltaron. */
    toEvaluate: DemoApplicant[];
}

export function blockOf(publicationId: string, shiftId: string): DemoShiftBlock | undefined {
    const p = getPublication(publicationId);
    return p?.tipo === 'turno' ? p.bloques.find((b) => b.id === shiftId) : undefined;
}

export function rosterFecha(publicationId: string, roster: DemoShiftRoster): string {
    const b = blockOf(publicationId, roster.id);
    return b ? `${b.weekday} ${b.day} ${b.month}` : (roster.titulo.split(' · ').pop() ?? roster.titulo);
}

export function isEvaluated(s: ManageState, publicationId: string, shiftId: string, personId: string): boolean {
    const key = slotKey(publicationId, shiftId, personId);
    return s.evaluations.has(key) || EVALUATED_BEFORE.includes(key);
}

export function rosterView(
    m: DemoManagedPublication,
    roster: DemoShiftRoster,
    s: ManageState,
    applications: ReadonlyMap<string, SessionApplication>,
): RosterView {
    const pub = m.publicationId;
    const key = rosterKey(pub, roster.id);
    const waiting = ARRIVES_LATER.includes(key) && !s.arrived.has(key);
    const visible = (p: DemoApplicant) => appliedInSession(p.personId, pub, applications);

    const known = new Set([...roster.confirmados, ...roster.postulados, ...roster.listaEspera].map((p) => p.personId));
    const extra = sessionApplicants(pub, known, applications);
    const appliedData = waiting ? [] : roster.postulados.filter(visible);
    const pool = [
        ...appliedData,
        ...extra.filter((p) => p.estado !== 'En lista de espera'),
        ...roster.listaEspera.filter(visible),
        ...extra.filter((p) => p.estado === 'En lista de espera'),
    ];

    const confirmedNow = s.confirmed.get(key) ?? [];
    const confirmedSet = new Set(confirmedNow);
    const confirmados = [
        ...roster.confirmados,
        ...confirmedNow.flatMap((id) => pool.find((p) => p.personId === id) ?? []),
    ];
    const postulados = [...appliedData, ...extra.filter((p) => p.estado !== 'En lista de espera')].filter(
        (p) => !confirmedSet.has(p.personId),
    );
    const listaEspera = [...roster.listaEspera.filter(visible), ...extra.filter((p) => p.estado === 'En lista de espera')].filter(
        (p) => !confirmedSet.has(p.personId),
    );

    const total = roster.total;
    const free = Math.max(total - confirmados.length, 0);
    const fecha = rosterFecha(pub, roster);
    const past = isBeforeToday(fecha);
    const { closed, paused } = publicationView(m, s);
    const canConfirm = !closed && !past && free > 0;

    const favorites = new Set([...(ORG_FAVORITES[m.ownerId] ?? []), ...(roster.favoritos?.personIds ?? [])]);
    const favoriteIds = roster.favoritos?.personIds ?? [];
    const favoritesToConfirm = canConfirm
        ? postulados.filter((p) => favoriteIds.includes(p.personId)).slice(0, free)
        : [];
    const toEvaluate = past
        ? confirmados.filter(
              (p) =>
                  !isEvaluated(s, pub, roster.id, p.personId) &&
                  s.attendance.get(slotKey(pub, roster.id, p.personId)) !== 'no-asistio',
          )
        : [];

    return {
        roster,
        fecha,
        confirmados,
        postulados,
        listaEspera,
        total,
        free,
        full: free === 0,
        past,
        closed,
        paused,
        accepting: !closed && !paused && !past,
        waiting,
        canConfirm,
        favorites,
        favoritesToConfirm,
        favoritesText: favoritesToConfirm.length
            ? favoritesText(free, favoritesToConfirm.map((p) => firstName(p.nombre)))
            : undefined,
        toEvaluate,
    };
}

/** El turno al que lleva «Ver cupos»: el primero con cupos libres o, si no, el primero. */
export function defaultRoster(
    m: DemoManagedPublication,
    s: ManageState,
    applications: ReadonlyMap<string, SessionApplication>,
): DemoShiftRoster | undefined {
    const rosters = m.cupos ?? [];
    return rosters.find((r) => !rosterView(m, r, s, applications).full) ?? rosters[0];
}

// ─── Postulantes (GES-02) ───────────────────────────────────────────────────

const NEW_STATES: readonly BadgeStatus[] = ['Postulado', 'Nuevo'];
const IN_PROCESS_STATES: readonly BadgeStatus[] = ['En proceso', 'Entrevista', 'Oferta', 'Contratado'];

export const isNew = (estado: BadgeStatus | undefined) => estado !== undefined && NEW_STATES.includes(estado);
export const isInProcess = (estado: BadgeStatus | undefined) => estado !== undefined && IN_PROCESS_STATES.includes(estado);
/** Se puede «Avanzar» o «No seleccionar». */
export const isUndecided = (estado: BadgeStatus | undefined) => estado === undefined || isNew(estado) || estado === 'Visto';

/** Los postulantes con su estado al día, en orden de afinidad (los de la sesión, al final). */
export function applicantsOf(
    m: DemoManagedPublication,
    s: ManageState,
    applications: ReadonlyMap<string, SessionApplication>,
): DemoApplicant[] {
    const list = m.postulantes?.personas ?? [];
    const pub = m.publicationId;
    const fromData = list.filter((p) => appliedInSession(p.personId, pub, applications));
    const extra = sessionApplicants(pub, new Set(list.map((p) => p.personId)), applications);
    return [...fromData, ...extra].map((p) => {
        const estado = s.applicants.get(applicantKey(pub, p.personId)) ?? p.estado ?? 'Postulado';
        return estado === p.estado ? p : { ...p, estado };
    });
}

export const countNew = (personas: readonly DemoApplicant[]) => personas.filter((p) => isNew(p.estado)).length;

/** «Todos» → todos, «En proceso» → en-proceso (para la URL). */
export function filterSlug(label: string): string {
    return label
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
        .replace(/\s+/g, '-');
}

/** ¿La persona va en el filtro? Los filtros son los de los datos («Todos», «Nuevos», «En proceso», «No seleccionados»). */
export function matchesFilter(estado: BadgeStatus | undefined, filter: string): boolean {
    switch (filterSlug(filter)) {
        case 'nuevos':
            return isNew(estado);
        case 'en-proceso':
            return isInProcess(estado);
        case 'no-seleccionados':
            return estado === 'No seleccionado';
        default:
            return true;
    }
}

// ─── Métricas de GES-01 ─────────────────────────────────────────────────────

export interface Metric {
    label: string;
    valor: string;
    detalle?: string;
}

/** «6 nuevos», «sin revisar» (todos nuevos) o nada (ya revisó a todos). */
export function newDetail(nuevos: number, total: number): string | undefined {
    if (nuevos === 0) return undefined;
    if (nuevos === total) return 'sin revisar';
    return `${nuevos} ${nuevos === 1 ? 'nuevo' : 'nuevos'}`;
}

/**
 * Las métricas de los datos, recalculadas con la sesión: Confirmados con lo
 * confirmado en GES-04, Postulantes con lo decidido en GES-02 y Vistas, como
 * mínimo, quienes ya postularon (nadie postula sin verla).
 */
export function metricsOf(
    m: DemoManagedPublication,
    s: ManageState,
    applications: ReadonlyMap<string, SessionApplication>,
): Metric[] {
    const rosters = (m.cupos ?? []).map((r) => rosterView(m, r, s, applications));
    const applicants = applicantsOf(m, s, applications);
    const people = new Set([
        ...rosters.flatMap((r) => [...r.confirmados, ...r.postulados, ...r.listaEspera].map((p) => p.personId)),
        ...applicants.map((p) => p.personId),
    ]);
    return m.metricas.map((metric) => {
        if (metric.label === 'Confirmados' && rosters.length) {
            const confirmed = rosters.reduce((n, r) => n + r.confirmados.length, 0);
            const total = rosters.reduce((n, r) => n + r.total, 0);
            return { ...metric, valor: `${confirmed}/${total}` };
        }
        if (metric.label === 'Postulantes' && m.postulantes) {
            return { label: metric.label, valor: String(applicants.length), detalle: newDetail(countNew(applicants), applicants.length) };
        }
        if (metric.label === 'Vistas') {
            const vistas = Number(metric.valor.replace(/\D/g, '')) || 0;
            return vistas >= people.size ? metric : { ...metric, valor: String(people.size) };
        }
        return metric;
    });
}
