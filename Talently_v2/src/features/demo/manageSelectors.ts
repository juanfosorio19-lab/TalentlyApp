// Lo que GES-01, GES-02, GES-04, Actividad (ACT-01, ACT-03), Inicio (INI-02 y
// «Tu aviso») y Explorar (EXP-05) muestran de una publicación propia,
// derivado de los datos de demostración MÁS lo que pasó en la sesión
// (./manageState y ./sessionStore). Funciones puras: la misma cifra
// (confirmados, postulantes nuevos, por evaluar, estado) sale siempre de
// aquí, nunca del texto fijo de los datos.
import type { BadgeStatus } from '../../ui/Badge';
import {
    DEMO_NOW_TIME,
    DEMO_TODAY,
    getManagedPublication,
    getManagedPublications,
    getPerson,
    getPublication,
} from './data';
import { applicantKey, rosterKey, slotKey, type ManageState } from './manageState';
import { DEMO_ACTORS, type DemoActorId } from './session';
import { keyOf, startsWithoutApplication, type SessionApplication } from './sessionStore';
import type {
    DemoApplicant,
    DemoAttentionItem,
    DemoHomeBlock,
    DemoKpi,
    DemoManagedPublication,
    DemoOrgDashboard,
    DemoPerson,
    DemoPublication,
    DemoShiftBlock,
    DemoShiftRoster,
} from './types';

/** Postulaciones hechas en la sesión (`useSessionState().applications`). */
export type SessionApplications = ReadonlyMap<string, SessionApplication>;

// ─── Lo que los datos no traen como campo ───────────────────────────────────

/**
 * Favoritos de cada organización (el corazón junto al nombre en GES-04): las
 * personas con corazón en GES-04 y GES-04-postulados del prototipo. «5
 * personas que ya trabajaron contigo»: la quinta no aparece en ningún mockup.
 */
export const ORG_FAVORITES: Partial<Record<DemoActorId, readonly string[]>> = {
    banqueteria: ['javiera-contreras', 'felipe-araya', 'martin-silva', 'fernanda-castro'],
};

/**
 * Turnos recién publicados cuyos postulados llegan después del «salto de
 * tiempo» (flujo 4: GES-04 sin postulados → GES-04-finde-postulados).
 * GES-04 programa la llegada (scheduleArrival); Explorar y las cifras de
 * Inicio y Actividad no ven a esos postulados hasta que llegan.
 */
export const ARRIVES_LATER: readonly string[] = [rosterKey('turno-garzones-finde', 'finde-sab-19')];

/** Evaluaciones hechas antes de la sesión: a Matías ya lo evaluaron (MSG-01, «Ya te evaluamos»). */
export const EVALUATED_BEFORE: readonly string[] = [slotKey('turno-garzones-finde-5dic', 'finde-sab-5', 'matias')];

// ─── Fechas de la demo (hoy es jue 10 dic 2026, 13:00) ──────────────────────

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'] as const;

export interface DemoDate {
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
const DAY_MS = 86_400_000;

/** ¿Fue antes de hoy? El turno de hoy todavía no termina (son las 13:00). */
export function isBeforeToday(text: string): boolean {
    const d = parseDemoDate(text);
    return d ? stamp(d) < stamp(TODAY) : false;
}

/** Días desde hoy hasta la fecha (0 = hoy, negativo = ya pasó). `null` si no se entiende. */
export function daysFromToday(text: string): number | null {
    const d = parseDemoDate(text);
    return d ? Math.round((stamp(d) - stamp(TODAY)) / DAY_MS) : null;
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

const minutesOf = (hhmm: string) => {
    const [h = 0, m = 0] = hhmm.split(':').map(Number);
    return h * 60 + m;
};

/** Minutos desde ahora en la demo hasta el día y la hora dados (negativo si ya pasó). */
export function minutesUntil(fecha: string, hora: string): number | null {
    const days = daysFromToday(fecha);
    if (days === null) return null;
    return days * 24 * 60 + minutesOf(hora) - minutesOf(DEMO_NOW_TIME);
}

/** «Empieza en 23 h», «Empieza en 40 min», «Empieza en 3 días». */
export function startsInText(minutes: number): string {
    if (minutes < 60) return `Empieza en ${Math.max(minutes, 1)} min`;
    const hours = Math.round(minutes / 60);
    if (hours < 48) return `Empieza en ${hours} h`;
    return `Empieza en ${Math.round(hours / 24)} días`;
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

/**
 * Estado de una publicación cualquiera en la sesión: el de GES-01 si es una
 * publicación gestionada (pausada, cerrada) o, si no, el de los datos.
 */
export function publicationStatus(publicationId: string, s: ManageState): BadgeStatus | undefined {
    const m = getManagedPublication(publicationId);
    if (m) return publicationView(m, s).estado;
    return getPublication(publicationId)?.estado;
}

/** ¿Recibe postulaciones en la sesión? Ni pausada ni cerrada (Explorar y la búsqueda la dejan fuera si no). */
export const isPublicationActive = (publicationId: string, s: ManageState) => publicationStatus(publicationId, s) === 'Activa';

// ─── Personas ───────────────────────────────────────────────────────────────

const isActor = (id: string): id is DemoActorId => Object.hasOwn(DEMO_ACTORS, id);

/**
 * ¿Cuenta una persona que traen los datos? El actor que el prototipo muestra
 * ANTES de postular (startsWithoutApplication: Matías en «Garzones para
 * matrimonio», flujo 2) solo cuando ya postuló en la sesión. La misma regla
 * para GES-02, GES-04, EXP-05 y las cifras de Inicio y Actividad.
 */
export function appliedInSession(personId: string, publicationId: string, applications: SessionApplications): boolean {
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
function sessionApplicants(publicationId: string, known: ReadonlySet<string>, applications: SessionApplications): DemoApplicant[] {
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

/** ¿Los postulados de este turno todavía no llegan? (antes del «salto de tiempo»). */
export function isWaiting(publicationId: string, shiftId: string, s: ManageState): boolean {
    const key = rosterKey(publicationId, shiftId);
    return ARRIVES_LATER.includes(key) && !s.arrived.has(key);
}

export function rosterView(
    m: DemoManagedPublication,
    roster: DemoShiftRoster,
    s: ManageState,
    applications: SessionApplications,
): RosterView {
    const pub = m.publicationId;
    const key = rosterKey(pub, roster.id);
    const waiting = isWaiting(pub, roster.id, s);
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
    const confirmados = [...roster.confirmados, ...confirmedNow.flatMap((id) => pool.find((p) => p.personId === id) ?? [])];
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
    const favoritesToConfirm = canConfirm ? postulados.filter((p) => favoriteIds.includes(p.personId)).slice(0, free) : [];
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
    applications: SessionApplications,
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
export function applicantsOf(m: DemoManagedPublication, s: ManageState, applications: SessionApplications): DemoApplicant[] {
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

// ─── Métricas de GES-01 (y la línea de ACT-03) ──────────────────────────────

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
export function metricsOf(m: DemoManagedPublication, s: ManageState, applications: SessionApplications): Metric[] {
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

// ─── Lo mismo, para Actividad (ACT-01 Agenda de la organización y ACT-03) ───

/** Una publicación tal como quedó en la sesión: estado, métricas y confirmados por bloque. */
export interface ManagedSession {
    estado: BadgeStatus;
    metricas: Metric[];
    /** Bloque del turno → personas confirmadas ahora (las de los datos y las de la sesión). */
    confirmados: ReadonlyMap<string, number>;
}

export function managedSession(m: DemoManagedPublication, s: ManageState, applications: SessionApplications): ManagedSession {
    const confirmados = new Map<string, number>();
    for (const r of m.cupos ?? []) confirmados.set(r.id, rosterView(m, r, s, applications).confirmados.length);
    return { estado: publicationView(m, s).estado, metricas: metricsOf(m, s, applications), confirmados };
}

/** Lo de la sesión para cualquier publicación gestionada (o nada si no lo es). */
export function managedSessionOf(
    s: ManageState,
    applications: SessionApplications,
): (publicationId: string) => ManagedSession | undefined {
    return (publicationId) => {
        const m = getManagedPublication(publicationId);
        return m ? managedSession(m, s, applications) : undefined;
    };
}

/**
 * Personas en una publicación, como las ven GES-02 y GES-04 en esta sesión
 * (EXP-05 no sugiere a quien ya está): confirmadas, postuladas, en lista de
 * espera o postulantes, con el turno donde están.
 */
export type MemberKind = 'confirmado' | 'postulado' | 'espera' | 'postulante';

export interface Membership {
    kind: MemberKind;
    /** Turno de GES-04 donde está (sin turno: GES-02). */
    rosterId?: string;
}

export function membersOf(
    publicationId: string,
    s: ManageState,
    applications: SessionApplications,
): Map<string, Membership> {
    const m = getManagedPublication(publicationId);
    const out = new Map<string, Membership>();
    const add = (personId: string, member: Membership) => {
        if (!out.has(personId)) out.set(personId, member);
    };
    if (!m) {
        // Sin gestión en la demo: solo quienes postularon en la sesión.
        for (const key of applications.keys()) {
            const [who = '', pub] = key.split(':');
            if (pub === publicationId) add(who, { kind: 'postulante' });
        }
        return out;
    }
    const views = (m.cupos ?? []).map((r) => rosterView(m, r, s, applications));
    for (const v of views) for (const p of v.confirmados) add(p.personId, { kind: 'confirmado', rosterId: v.roster.id });
    for (const v of views) {
        for (const p of v.postulados) add(p.personId, { kind: 'postulado', rosterId: v.roster.id });
        for (const p of v.listaEspera) add(p.personId, { kind: 'espera', rosterId: v.roster.id });
    }
    for (const p of applicantsOf(m, s, applications)) add(p.personId, { kind: 'postulante' });
    return out;
}

// ─── Lo que tiene quien publica (INI-02, ACT-03, EXP-05) ────────────────────

/**
 * Las publicaciones gestionadas de un actor: la organización, en el orden de
 * su panel (INI-02); la persona (hogar), las suyas.
 */
export function managedPublicationsOf(ownerId: DemoActorId): DemoManagedPublication[] {
    return getManagedPublications(ownerId);
}

/** «Postulantes nuevos» de INI-02: los sin revisar de GES-02 y los postulados sin confirmar de GES-04, en lo que sigue abierto. */
export function newApplicantsOf(m: DemoManagedPublication, s: ManageState, applications: SessionApplications): number {
    const view = publicationView(m, s);
    if (view.closed) return 0;
    const fromList = countNew(applicantsOf(m, s, applications));
    const fromRosters = (m.cupos ?? [])
        .map((r) => rosterView(m, r, s, applications))
        .filter((v) => !v.past)
        .reduce((n, v) => n + v.postulados.length, 0);
    return fromList + fromRosters;
}

/** Fin de la semana de hoy (domingo), en días desde hoy. */
function daysToSunday(): number {
    const weekday = new Date(Date.UTC(TODAY.year, TODAY.month, TODAY.day)).getUTCDay();
    return (7 - weekday) % 7;
}

/** «Turnos de la semana»: los bloques de hoy al domingo de turnos abiertos, y cuántos tienen todos sus cupos. */
export function weekCoverage(
    publications: readonly DemoManagedPublication[],
    s: ManageState,
    applications: SessionApplications,
): { cubiertos: number; total: number } {
    const limit = daysToSunday();
    let cubiertos = 0;
    let total = 0;
    for (const m of publications) {
        if (publicationView(m, s).closed) continue;
        for (const r of m.cupos ?? []) {
            const v = rosterView(m, r, s, applications);
            const days = daysFromToday(v.fecha);
            if (days === null || days < 0 || days > limit) continue;
            total += 1;
            if (v.full) cubiertos += 1;
        }
    }
    return { cubiertos, total };
}

/** «faltan 2 garzones» / «falta 1 garzón» con el oficio del bloque («Garzones · vie 11 dic»). */
const SINGULAR: Readonly<Record<string, string>> = { garzones: 'garzón', guardias: 'guardia', bartenders: 'bartender' };

export function missingText(free: number, roster: DemoShiftRoster): string {
    const plural = (roster.titulo.split(' · ')[0] ?? '').toLocaleLowerCase('es-CL');
    if (free === 1) return `falta 1 ${SINGULAR[plural] ?? 'persona'}`;
    return `faltan ${free} ${plural || 'personas'}`;
}

/**
 * Un pendiente de «Requiere tu atención» al día con la sesión, o nada si ya
 * se resolvió (cupos llenos, postulantes revisados, todos evaluados) o la
 * publicación se cerró.
 */
export function attentionItemView(
    item: DemoAttentionItem,
    s: ManageState,
    applications: SessionApplications,
): DemoAttentionItem | undefined {
    const d = item.destino;
    if (d.pantalla !== 'cupos' && d.pantalla !== 'postulantes' && d.pantalla !== 'evaluar') return item;
    const m = getManagedPublication(d.publicationId);
    if (!m) return item;
    if (item.icono === 'postulantes') {
        if (publicationView(m, s).closed) return undefined;
        const n = countNew(applicantsOf(m, s, applications));
        if (n === 0) return undefined;
        const texto = `${n} ${n === 1 ? 'postulante' : 'postulantes'} sin revisar en ${m.titulo}`;
        return { ...item, texto };
    }
    if (item.icono === 'evaluar') {
        const views = (m.cupos ?? []).map((r) => rosterView(m, r, s, applications)).filter((v) => v.past);
        const n = views.reduce((total, v) => total + v.toEvaluate.length, 0);
        const fecha = views[0]?.fecha;
        if (n === 0 || !fecha) return undefined;
        return { ...item, texto: `Evalúa a ${n} ${n === 1 ? 'persona' : 'personas'} del turno del ${fecha}` };
    }
    // Cupos: el bloque del destino (o el primero).
    const roster = (d.pantalla === 'cupos' && m.cupos?.find((r) => r.id === d.bloqueId)) || m.cupos?.[0];
    if (!roster) return item;
    const v = rosterView(m, roster, s, applications);
    if (v.closed || v.past || v.full) return undefined;
    const start = blockOf(m.publicationId, roster.id)?.time.split(/[–-]/)[0]?.trim() ?? '';
    const minutes = start ? minutesUntil(v.fecha, start) : null;
    return {
        ...item,
        texto: `Turno ${v.fecha}${start ? ` · ${start}` : ''}: ${missingText(v.free, roster)}`,
        detalle: minutes !== null && minutes > 0 ? startsInText(minutes) : item.detalle,
    };
}

/**
 * INI-02 al día con la sesión: «Postulantes nuevos», «Turnos de la semana»
 * y «Requiere tu atención» salen de las mismas cuentas que GES-01, GES-02 y
 * GES-04. Los KPI que no son de gestión (conversaciones, tiempo de
 * respuesta) quedan como vienen.
 */
export function orgDashboardView(
    panel: DemoOrgDashboard,
    s: ManageState,
    applications: SessionApplications,
    overrides: Partial<Record<string, string>> = {},
): DemoOrgDashboard {
    const publications = panel.publicaciones.flatMap((id) => getManagedPublication(id) ?? []);
    const kpis = panel.kpis.map((kpi): DemoKpi => {
        const override = overrides[kpi.id];
        if (override !== undefined) return { ...kpi, valor: override };
        if (kpi.id === 'postulantes') {
            const n = publications.reduce((total, m) => total + newApplicantsOf(m, s, applications), 0);
            return { ...kpi, valor: String(n) };
        }
        if (kpi.id === 'turnos') {
            const { cubiertos, total } = weekCoverage(publications, s, applications);
            return { ...kpi, valor: `${cubiertos}/${total} cubiertos` };
        }
        return kpi;
    });
    const atencion = panel.atencion.flatMap((item) => attentionItemView(item, s, applications) ?? []);
    return { ...panel, kpis, atencion };
}

/** «6 postulantes nuevos» de «Tu aviso» (INI-01 de Carolina), con la misma cuenta que GES-02. */
export function avisoDetail(m: DemoManagedPublication, s: ManageState, applications: SessionApplications): string {
    const applicants = applicantsOf(m, s, applications);
    const nuevos = countNew(applicants);
    if (nuevos > 0) return `${nuevos} ${nuevos === 1 ? 'postulante nuevo' : 'postulantes nuevos'}`;
    return `${applicants.length} ${applicants.length === 1 ? 'postulante' : 'postulantes'}`;
}

/** Un bloque «Tu aviso» de Inicio con el estado y la cifra de la sesión. */
export function avisoBlockView(block: DemoHomeBlock, s: ManageState, applications: SessionApplications): DemoHomeBlock {
    if (block.tipo !== 'tu-aviso') return block;
    const m = getManagedPublication(block.publicationId);
    if (!m) return block;
    return { ...block, estado: publicationView(m, s).estado, detalle: avisoDetail(m, s, applications) };
}

// ─── La publicación vista por quien postula (DET-01, EXP-02, EXP-07, Inicio) ─

/**
 * La publicación con lo que cambió en la sesión: el estado de GES-01 (una
 * pausada o cerrada no recibe postulaciones) y los cupos que quedan después
 * de confirmar en GES-04 («Quedan N de 8 cupos» baja con cada confirmado).
 * Parte de los cupos de los datos y descuenta solo lo confirmado ahora.
 */
export function publicationWithSession<T extends DemoPublication>(p: T, s: ManageState, applications: SessionApplications): T {
    const m = getManagedPublication(p.id);
    if (!m) return p;
    const estado = publicationView(m, s).estado;
    let next: T = estado === p.estado ? p : { ...p, estado };
    if (next.tipo !== 'turno' || !m.cupos?.length) return next;
    let confirmedNow = 0;
    const bloques = next.bloques.map((b) => {
        const r = m.cupos?.find((x) => x.id === b.id);
        if (!r || !b.cupos) return b;
        const extra = rosterView(m, r, s, applications).confirmados.length - r.confirmados.length;
        if (extra <= 0) return b;
        confirmedNow += extra;
        return { ...b, cupos: { ...b.cupos, left: Math.max(0, b.cupos.left - extra) } };
    });
    if (confirmedNow > 0) next = { ...next, bloques, cupos: { ...next.cupos, left: Math.max(0, next.cupos.left - confirmedNow) } };
    return next;
}
