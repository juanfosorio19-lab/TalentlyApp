// Lógica de Explorar sin React: qué segmentos ve cada actor, filtros, personas
// sugeridas, búsqueda y el paso de los datos de la demo a las props de src/ui.
// Solo usa las funciones get… de la demo (nunca sus constantes DEMO_*).
import type { MouseEventHandler } from 'react';
import { isTabRoot, paths, tabOf, type RosterTab } from '../../app/paths';
import type { AmountFormatOptions } from '../../ui/Amount';
import { IconAdd, IconBell, IconChat, IconClock, IconOffers, type IconComponent } from '../../ui/icons';
import type { PublicationCardData, PublicationRequirement, PublicationTag, PublicationVerification } from '../../ui/PublicationCard';
import {
    getExplore,
    getManagedPublication,
    getManagedPublications,
    getOrgDashboard,
    getPublications,
    getPerson,
    getPublication,
} from '../demo/data';
import { isPublicationActive, membersOf as sessionMembersOf, type MemberKind, type Membership } from '../demo/manageSelectors';
import type { ManageState } from '../demo/manageState';
import { DEMO_ACTORS, type DemoActor, type DemoActorId } from '../demo/session';
import { isPhoneVerified, suggestionKey, type DeckDecision, type SessionApplication } from '../demo/sessionStore';
import type {
    DemoAmount,
    DemoEmpleo,
    DemoEmptyState,
    DemoExplore,
    DemoPerson,
    DemoPublication,
    DemoTurno,
    DemoVerification,
} from '../demo/types';
import { copy } from './copy';
import {
    type EmpleoFiltros,
    type Franja,
    type PersonaFiltros,
    type Segment,
    type TarifaUnidad,
    type TurnoFiltros,
} from './filters';
import { CANDIDATOS_POR_PUBLICACION, SINONIMOS } from './mock';

// ─── Segmentos (spec §5.2) ──────────────────────────────────────────────────

const SEGMENT_ORDER: readonly Segment[] = ['empleo', 'turno', 'personas'];

/** Pantalla de cada segmento (spec §5.4). */
export const SEGMENT_SCREEN_ID: Readonly<Record<Segment, string>> = {
    empleo: 'EXP-01',
    turno: 'EXP-02',
    personas: 'EXP-05',
};

/**
 * Publicaciones activas propias del actor (organización u hogar), en el orden
 * de su panel, con el estado de la sesión: una que se pausó o cerró en
 * GES-01 ya no busca personas (demo/manageSelectors.isPublicationActive).
 * Jorge recién registrado (INI-01-jorge-nuevo) todavía no publicó nada.
 */
export function ownPublications(actor: DemoActor, recienRegistrado: boolean, manage: ManageState): DemoPublication[] {
    if (recienRegistrado) return [];
    if (actor.kind !== 'organizacion' && !actor.capabilities.includes('hogar')) return [];
    return getManagedPublications(actor.id)
        .filter((m) => isPublicationActive(m.publicationId, manage))
        .map((m) => getPublication(m.publicationId))
        .filter((p): p is DemoPublication => p !== undefined);
}

/**
 * Segmentos de Explorar, en orden fijo (Empleos · Turnos · Personas):
 * - Organización: solo Personas sugeridas por publicación.
 * - Hogar sin perfil de trabajo: solo Personas (no ve ofertas de trabajo).
 * - Persona que trabaja o sin perfiles: «Empleos · Turnos», como en EXP-01 y
 *   EXP-02 del prototipo F1; el segmento que no es de su perfil muestra el
 *   EmptyState de la demo con «Agregar un perfil». Suma Personas si su hogar
 *   ya tiene un aviso activo.
 * Clases y Servicios no existen en F1.
 */
export function segmentsOf(actor: DemoActor, recienRegistrado: boolean, manage: ManageState): Segment[] {
    if (actor.kind === 'organizacion') return ['personas'];
    const trabaja = actor.capabilities.includes('empleo') || actor.capabilities.includes('turnos');
    const hogar = actor.capabilities.includes('hogar');
    if (hogar && !trabaja) return ['personas'];
    const segs: Segment[] = ['empleo', 'turno'];
    if (hogar && ownPublications(actor, recienRegistrado, manage).length > 0) segs.push('personas');
    return SEGMENT_ORDER.filter((s) => segs.includes(s));
}

/** Segmento inicial: el de la capacidad con la que empezó (spec §5.2 «Orden»). */
export function defaultSegment(actor: DemoActor, segs: readonly Segment[]): Segment {
    const byCapability: Record<string, Segment> = { empleo: 'empleo', turnos: 'turno', hogar: 'personas', organizacion: 'personas' };
    for (const c of actor.capabilities) {
        const s = byCapability[c];
        if (s && segs.includes(s)) return s;
    }
    return segs[0] ?? 'empleo';
}

/** El segmento que pide la URL si aplica al actor; si no (enlace viejo, cambio de actor), el suyo. */
export function segmentFor(actor: DemoActor, segs: readonly Segment[], requested: string | null): Segment {
    return segs.find((s) => s === requested) ?? defaultSegment(actor, segs);
}

// ─── Navegación (spec §5.3) ─────────────────────────────────────────────────

const pathnameOf = (path: string) => path.split('?')[0] ?? path;

/**
 * ¿Se abre con replace? Solo al cambiar de pestaña (regla 1: la raíz de OTRA
 * pestaña) o al cambiar los parámetros de la misma raíz. Desde Buscar
 * (apilada sobre Explorar), Explorar con otra publicación es un paso más:
 * push, para que atrás vuelva a la búsqueda y a su scroll (regla 2). Las
 * pantallas de este feature son de Explorar (/buscar no tiene pestaña).
 */
export function replacesFrom(fromPathname: string, path: string): boolean {
    const to = pathnameOf(path);
    if (!isTabRoot(to)) return false;
    return tabOf(to) !== (tabOf(fromPathname) ?? 'explorar') || to === fromPathname;
}

// ─── Datos comunes ──────────────────────────────────────────────────────────

/** «a 9 km · Pudahuel» → 9. Sin distancia (publicación propia, solo la comuna) → undefined. */
export function distanceKm(lugar: string): number | undefined {
    const m = /a (\d+(?:,\d+)?) km/.exec(lugar);
    return m?.[1] ? Number(m[1].replace(',', '.')) : undefined;
}

/** «a 14 km · San Miguel» → «San Miguel». */
export function comunaOf(lugar: string): string {
    return lugar.split('·').pop()?.trim() ?? lugar;
}

const isVerifiedOrg = (p: DemoPublication) => p.autor.verificaciones.some((v) => v.status === 'verified');

/** Postulaciones de esta sesión (useSessionState().applications): `${actorId}:${publicationId}`. */
export type Applications = ReadonlyMap<string, SessionApplication>;

const isDemoActor = (id: string): id is DemoActorId => Object.hasOwn(DEMO_ACTORS, id);

const PHONE = 'Teléfono verificado';

/**
 * ¿El actor ya verificó su celular? Lo pide AUTH-08 antes del primer acto
 * transaccional, igual que DET-01: Matías lo verifica en el flujo 2 y Jorge
 * recién registrado todavía no lo tiene.
 */
export function actorPhoneVerified(actorId: DemoActorId, recienRegistrado: boolean): boolean {
    const inData = getPerson(actorId)?.verificaciones.some((v) => v.label === PHONE && v.status === 'verified') ?? false;
    return isPhoneVerified(actorId, !recienRegistrado && inData);
}

/**
 * Las insignias de una persona como las ve esta sesión: un actor de la demo
 * que verifica su celular en AUTH-08 (Matías) no tiene «Teléfono verificado»
 * hasta que lo verifica, igual que en su PRF-01 y en DET-01. Quien la lee
 * se suscribe a la sesión (useSessionState) para ver el cambio.
 */
export function personVerifications(person: DemoPerson): readonly DemoVerification[] {
    if (!isDemoActor(person.id) || isPhoneVerified(person.id, true)) return person.verificaciones;
    return person.verificaciones.filter((v) => v.label !== PHONE);
}

export function amountOf(monto: DemoAmount | null, negotiableLabel?: string): AmountFormatOptions {
    if (!monto) return { value: null, unit: 'a_convenir', negotiableLabel };
    return { value: monto.value, unit: monto.unit, net: monto.net, durationMin: monto.durationMin };
}

/** Ícono de un estado vacío de la demo. Turno = IconClock (sistema de diseño, «Íconos por tipo»). */
const EMPTY_ICON: Record<NonNullable<DemoEmptyState['icono']>, IconComponent> = {
    empleo: IconOffers,
    turno: IconClock,
    agregar: IconAdd,
    mensajes: IconChat,
    notificaciones: IconBell,
};

export function emptyIconOf(e: DemoEmptyState, fallback: IconComponent): IconComponent {
    return e.icono ? EMPTY_ICON[e.icono] : fallback;
}

// ─── Tarjetas ───────────────────────────────────────────────────────────────

export interface CardHandlers {
    /** href real del detalle (con el prefijo del router: «#/p/…»). */
    href: string;
    onOpen: MouseEventHandler<HTMLAnchorElement>;
    /** Abre la hoja «Verificación de …» de quien publica o de la persona. */
    onVerify: () => void;
}

function verificationsOf(verificaciones: readonly DemoVerification[], onVerify: () => void): PublicationVerification[] {
    return verificaciones.map((v) => ({ status: v.status, label: v.label, onClick: () => onVerify() }));
}

/** Requisitos del deck: el requisito y, debajo, su estado para quien mira. */
function requirementsOf(p: DemoPublication): PublicationRequirement[] {
    const out: PublicationRequirement[] = [];
    for (const r of p.detalle.requisitos) {
        out.push({ label: r.texto, required: r.obligatoria });
        if (r.paraTi) out.push({ label: r.paraTi.texto, met: r.paraTi.cumple });
    }
    return out;
}

/** Una publicación (empleo o turno) para PublicationCard. */
export function publicationCard(p: DemoPublication, h: CardHandlers, opts: { deck?: boolean } = {}): PublicationCardData {
    return {
        author: { name: p.autor.nombre, kind: p.autor.tipo === 'persona' ? 'person' : 'org', initials: p.autor.iniciales },
        verifications: verificationsOf(p.autor.verificaciones, h.onVerify),
        title: p.titulo,
        href: h.href,
        onOpen: h.onOpen,
        tags: p.tags.map((t) => ({ kind: t.kind, label: t.text })),
        amount: amountOf(p.monto, p.tipo === 'empleo' ? undefined : 'A convenir'),
        cupos: p.tipo === 'turno' ? p.cupos : undefined,
        place: p.lugar,
        requirements: opts.deck ? requirementsOf(p) : undefined,
        why: opts.deck ? p.porQue : undefined,
    };
}

/** Lo ya decidido sobre una publicación (demo/sessionStore → useDecided). */
export type Decided = DeckDecision | 'postulado' | undefined;

// ─── EXP-01 · Empleos ───────────────────────────────────────────────────────

const tagIn = (p: DemoPublication, kind: string, values: readonly string[]) =>
    values.length === 0 || p.tags.some((t) => t.kind === kind && values.includes(t.text));

const withinKm = (p: DemoPublication, km: number | null) => {
    if (km === null) return true;
    const d = distanceKm(p.lugar);
    return d === undefined || d <= km;
};

/** Sueldo líquido al mes, o nada si es a convenir o en otra unidad (no se puede comparar). */
const sueldoMes = (p: DemoEmpleo) => (p.monto?.unit === 'mes' ? p.monto.value : undefined);

export function passesEmpleo(p: DemoEmpleo, f: EmpleoFiltros): boolean {
    const sueldo = sueldoMes(p);
    return (
        tagIn(p, 'jornada', f.jornadas) &&
        tagIn(p, 'contrato', f.contratos) &&
        withinKm(p, f.distancia) &&
        (f.sueldoMin === null || (sueldo !== undefined && sueldo >= f.sueldoMin)) &&
        (!f.verificadas || isVerifiedOrg(p))
    );
}

export function empleosOf(explore: DemoExplore): DemoEmpleo[] {
    return explore.empleos.publicaciones
        .map((id) => getPublication(id))
        .filter((p): p is DemoEmpleo => p?.tipo === 'empleo');
}

/** Deck: lo que aún no decide (ni postuló). Lista: todo menos «No me interesa». */
export function deckAndList(
    empleos: readonly DemoEmpleo[],
    decided: (id: string) => Decided,
): { deck: DemoEmpleo[]; list: DemoEmpleo[] } {
    return {
        deck: empleos.filter((p) => decided(p.id) === undefined),
        list: empleos.filter((p) => decided(p.id) !== 'no'),
    };
}

// ─── EXP-02 · Turnos ────────────────────────────────────────────────────────

export interface TurnoDay {
    titulo: string;
    turnos: DemoTurno[];
}

export const hasTurnos = (explore: DemoExplore) => explore.turnos.dias.some((d) => d.publicaciones.length > 0);

/** Chips de oficio de la demo, sin «Todos» (que es no elegir ninguno). */
export const oficioChipsOf = (explore: DemoExplore) => explore.turnos.filtros.filter((f) => f !== copy.turnos.todos);

/**
 * Franja (`time_band`, spec §4.5) de un bloque según su hora de inicio
 * («22:00–06:00» → noche): Mañana 07–13 · Tarde 13–19 · Noche 19–01 · Madrugada 01–07.
 */
export function franjaOf(time: string): Franja | undefined {
    const m = /^(\d{1,2}):/.exec(time.trim());
    if (!m?.[1]) return undefined;
    const h = Number(m[1]);
    if (h >= 7 && h < 13) return 'manana';
    if (h >= 13 && h < 19) return 'tarde';
    if (h >= 19 || h < 1) return 'noche';
    return 'madrugada';
}

/** «8 h», «Hoy · 5 h» → horas del bloque. */
export function hoursOf(duration: string): number | undefined {
    const m = /(\d+(?:,\d+)?) h\b/.exec(duration);
    return m?.[1] ? Number(m[1].replace(',', '.')) : undefined;
}

/** Lo que paga un turno en la unidad pedida: por hora × horas del bloque, o por turno ÷ horas. */
export function rateIn(p: DemoTurno, unidad: TarifaUnidad): number | undefined {
    if (!p.monto) return undefined;
    if (p.monto.unit === unidad) return p.monto.value;
    const horas = hoursOf(p.bloques[0]?.duration ?? '');
    if (!horas) return undefined;
    if (p.monto.unit === 'hora' && unidad === 'turno') return p.monto.value * horas;
    if (p.monto.unit === 'turno' && unidad === 'hora') return Math.floor(p.monto.value / horas);
    return undefined;
}

/** La hoja de filtros de EXP-02 (sin fecha ni oficio, que se miran por día y en los chips). */
export function passesTurno(p: DemoTurno, f: TurnoFiltros): boolean {
    const rate = f.tarifaMin === null ? undefined : rateIn(p, f.tarifaUnidad);
    return (
        withinKm(p, f.distancia) &&
        (!f.verificadas || isVerifiedOrg(p)) &&
        (f.franjas.length === 0 || p.bloques.some((b) => {
            const franja = franjaOf(b.time);
            return franja !== undefined && f.franjas.includes(franja);
        })) &&
        (f.tarifaMin === null || (rate !== undefined && rate >= f.tarifaMin))
    );
}

const turnosOfDay = (ids: readonly string[]) =>
    ids.map((id) => getPublication(id)).filter((p): p is DemoTurno => p?.tipo === 'turno');

/** ¿Hay turnos en esta comuna (sin mirar los filtros)? Sin comuna, los de cerca del actor. */
export const hasTurnosIn = (explore: DemoExplore, comuna: string | null) =>
    explore.turnos.dias.some((d) => turnosOfDay(d.publicaciones).some((p) => comuna === null || comunaOf(p.lugar) === comuna));

/**
 * Días con sus turnos, filtrados por la comuna y los chips de oficio de la
 * cabecera y por la hoja de filtros. Sin días vacíos. `comuna` null = los
 * turnos cerca de la comuna del actor (todos los de su Explorar).
 */
export function turnoDays(explore: DemoExplore, oficios: readonly string[], f: TurnoFiltros, comuna: string | null = null): TurnoDay[] {
    return explore.turnos.dias
        .filter((d) => f.fechas.length === 0 || (f.fechas as readonly string[]).includes(d.titulo))
        .map((d) => ({
            titulo: d.titulo,
            turnos: turnosOfDay(d.publicaciones)
                .filter((p) => comuna === null || comunaOf(p.lugar) === comuna)
                .filter((p) => oficios.length === 0 || oficios.includes(p.oficio ?? ''))
                .filter((p) => passesTurno(p, f)),
        }))
        .filter((d) => d.turnos.length > 0);
}

export const countTurnos = (days: readonly TurnoDay[]) => days.reduce((n, d) => n + d.turnos.length, 0);

/**
 * El CTA de la tarjeta de un turno, igual que el de DET-01: «Tomar turno»;
 * sin cupos, «Unirme a la lista de espera» (con el Badge «Cupos completos»
 * de la tarjeta); si ya postuló, «Ver mis postulaciones».
 */
export type TurnoCta = 'tomar' | 'espera' | 'postulado';

export function turnoCta(p: DemoTurno, decided: Decided): TurnoCta {
    if (decided === 'postulado') return 'postulado';
    return p.cupos.left <= 0 ? 'espera' : 'tomar';
}

// ─── EXP-05 · Personas sugeridas ────────────────────────────────────────────

/** Dónde está una persona en una publicación propia (GES-04: cupos; GES-02: postulantes): demo/manageSelectors. */
export type { MemberKind, Membership };

export interface Suggestion {
    person: DemoPerson;
    porQue: string;
    /** «sáb 5 dic»: trabajó con quien publica en un turno ya terminado. */
    trabajoEl?: string;
    /** La publicación propia con la que calza. */
    publicationId: string;
    publicationTitle: string;
    /** Si ya está en esa publicación (EXP-07 también muestra a quienes postularon). */
    membership?: Membership;
    /** Ya la invitaste a postular desde EXP-05 («Me interesa»); EXP-07 lo dice. */
    invitada?: boolean;
}

export type PersonasEstado =
    | { tipo: 'sugeridas'; sugeridas: Suggestion[] }
    | { tipo: 'completo'; total: number }
    | { tipo: 'postularon'; postulados: number }
    | { tipo: 'nadie' };

/**
 * Lo decidido sobre una persona sugerida se guarda en demo/sessionStore
 * (decidePerson/undoPersonDecision) con esta clave: la publicación y la
 * persona. Así GES-03 y EXP-05 ven lo mismo.
 */
export const suggestionId = suggestionKey;

/**
 * Quienes ya están en la publicación, como los ven GES-02 y GES-04 en esta
 * sesión (demo/manageSelectors.membersOf): confirmados, postulados (los del
 * «salto de tiempo», solo cuando llegaron) y lista de espera de cada turno o
 * postulantes, con la misma regla de startsWithoutApplication que GES-04.
 */
export function membersOf(publicationId: string, applications: Applications, manage: ManageState): Map<string, Membership> {
    return sessionMembersOf(publicationId, manage, applications);
}

/** Personas que trabajaron con el actor en turnos ya terminados, con la fecha («sáb 5 dic»). */
function workedWith(actor: DemoActor): Map<string, string> {
    const out = new Map<string, string>();
    const ids = actor.kind === 'organizacion' ? (getOrgDashboard(actor.id)?.publicaciones ?? []) : [];
    for (const id of ids) {
        const m = getManagedPublication(id);
        const p = getPublication(id);
        if (!m || m.estado !== 'Cerrada' || p?.tipo !== 'turno') continue;
        const b = p.bloques[0];
        if (!b) continue;
        const fecha = `${b.weekday} ${b.day} ${b.month}`;
        for (const c of m.cupos ?? []) for (const a of c.confirmados) if (!out.has(a.personId)) out.set(a.personId, fecha);
    }
    return out;
}

/** «Por qué ves esto»: el oficio que busca la publicación y, si aplica, que ya trabajó contigo o vive en la comuna. */
export function porQueOf(trabajoEl: string | undefined, personComuna: string, pubComuna: string): string {
    const extra = trabajoEl
        ? copy.personas.porque.trabajo(trabajoEl)
        : personComuna === pubComuna
          ? copy.personas.porque.comuna(personComuna)
          : undefined;
    return [copy.personas.porque.oficio, extra].filter(Boolean).join(' y ');
}

/** La publicación que pide la URL (`?p=`) si es propia y activa; si no, la primera. */
export function pickPublication(pubs: readonly DemoPublication[], requested: string | null): DemoPublication | undefined {
    return pubs.find((p) => p.id === requested) ?? pubs[0];
}

/** Las personas que calzan con el oficio de la publicación (sin quien publica). */
function candidatesFor(actor: DemoActor, pub: DemoPublication): DemoPerson[] {
    return (CANDIDATOS_POR_PUBLICACION[pub.id] ?? [])
        .filter((id) => id !== actor.id && id !== actor.owner)
        .map((id) => getPerson(id))
        .filter((p): p is DemoPerson => p !== undefined);
}

/**
 * Lo que muestra EXP-05 para una publicación propia. Quienes ya están en
 * ella y la cifra de «Revisa a las N personas que postularon» salen de la
 * sesión (membersOf), así que dicen lo mismo que GES-02 y GES-04.
 */
export function personasFor(
    actor: DemoActor,
    pub: DemoPublication,
    applications: Applications,
    manage: ManageState,
): PersonasEstado {
    const m = getManagedPublication(pub.id);
    const cupos = m?.cupos ?? [];
    const total = cupos.reduce((n, c) => n + c.total, 0);
    const members = membersOf(pub.id, applications, manage);
    const confirmados = [...members.values()].filter((x) => x.kind === 'confirmado').length;
    if (cupos.length > 0 && confirmados >= total) return { tipo: 'completo', total };

    const worked = workedWith(actor);
    const comuna = comunaOf(pub.lugar);
    const sugeridas = candidatesFor(actor, pub)
        .filter((person) => !members.has(person.id))
        .map((person): Suggestion => {
            const trabajoEl = worked.get(person.id);
            return {
                person,
                porQue: porQueOf(trabajoEl, person.comuna, comuna),
                trabajoEl,
                publicationId: pub.id,
                publicationTitle: pub.titulo,
            };
        })
        // Primero quienes ya trabajaron contigo; luego, por nota.
        .sort(
            (a, b) =>
                Number(Boolean(b.trabajoEl)) - Number(Boolean(a.trabajoEl)) || (b.person.nota?.value ?? 0) - (a.person.nota?.value ?? 0),
        );

    if (sugeridas.length > 0) return { tipo: 'sugeridas', sugeridas };
    const postulados = [...members.values()].filter((x) => x.kind !== 'confirmado').length;
    return postulados > 0 ? { tipo: 'postularon', postulados } : { tipo: 'nadie' };
}

/** Pestaña de GES-04 (`?ver=`). */

/** GES-04 en una pestaña (pedido en «requests» que paths.cuposTurno acepte `ver`). */
const rosterPath = (publicationId: string, rosterId: string, ver: RosterTab) => paths.cuposTurno(publicationId, rosterId, ver);

export interface ReviewLink {
    path: string;
    label: string;
}

/**
 * Dónde se revisa a quienes ya están en la publicación: GES-02 (postulantes)
 * o GES-04. Con `postulados`, el turno y la pestaña donde están quienes
 * postularon («Revisa a las 4 personas que postularon» → Postulados); con
 * `confirmados`, los cupos (cupos completos).
 */
export function reviewPathOf(
    pub: DemoPublication,
    applications: Applications,
    ver: 'postulados' | 'confirmados',
    manage: ManageState,
): ReviewLink {
    const rosters = getManagedPublication(pub.id)?.cupos ?? [];
    const first = rosters[0];
    if (!first) return { path: paths.postulantes(pub.id), label: copy.personas.verPostulantes };
    if (ver === 'confirmados') return { path: rosterPath(pub.id, first.id, 'confirmados'), label: copy.personas.verCupos };
    const members = [...membersOf(pub.id, applications, manage).values()];
    const pending = members.find((x) => x.kind === 'postulado') ?? members.find((x) => x.kind === 'espera');
    const rosterId = pending?.rosterId ?? first.id;
    return {
        path: rosterPath(pub.id, rosterId, pending?.kind === 'espera' ? 'espera' : 'postulados'),
        label: copy.personas.verPostulados,
    };
}

/**
 * Adónde lleva una persona encontrada en EXP-07: si ya está en la
 * publicación, a GES-02 o a su pestaña de GES-04; si no, a EXP-05 de esa
 * publicación para invitarla (`?p=`).
 */
export function suggestionPath(s: Suggestion): string {
    const m = s.membership;
    // Ya invitada: EXP-05 ya no la muestra; su tarjeta abre su perfil, como en EXP-05.
    if (!m && s.invitada) return paths.perfilPublico(s.person.id, 'trabajo');
    if (!m) return paths.explorar('personas', { p: s.publicationId });
    if (!m.rosterId) return paths.postulantes(s.publicationId);
    const tab: RosterTab = m.kind === 'confirmado' ? 'confirmados' : m.kind === 'espera' ? 'espera' : 'postulados';
    return rosterPath(s.publicationId, m.rosterId, tab);
}

export function passesPersona(s: Suggestion, f: PersonaFiltros): boolean {
    if (f.yaTrabajaron && !s.trabajoEl) return false;
    if (f.nota !== null && (s.person.nota?.value ?? 0) < f.nota) return false;
    return true;
}

/**
 * Una persona sugerida para PublicationCard (deck o lista): nunca la edad.
 * Con `publicacion` (EXP-07), el primer dato dice con qué publicación calza
 * («Para Garzones fin de semana») o a cuál ya postuló.
 */
export function personCard(s: Suggestion, h: CardHandlers, opts: { deck?: boolean; publicacion?: boolean } = {}): PublicationCardData {
    const p = s.person;
    const tags: PublicationTag[] = [];
    if (opts.publicacion) {
        const label = s.membership
            ? copy.buscar.postulo(s.publicationTitle)
            : s.invitada
              ? copy.buscar.invitada(s.publicationTitle)
              : copy.buscar.para(s.publicationTitle);
        tags.push({ label });
    }
    if (p.experiencia) tags.push({ kind: 'experiencia', label: `${p.experiencia} de experiencia` });
    return {
        author: { name: p.nombre, kind: 'person', initials: p.iniciales },
        verifications: verificationsOf(personVerifications(p), h.onVerify),
        title: p.oficio ?? p.nombre,
        href: h.href,
        onOpen: h.onOpen,
        tags: tags.length > 0 ? tags : undefined,
        rating: { value: p.nota?.value ?? null, count: p.nota?.count ?? 0 },
        reliability: p.confiabilidad === null ? 'Aún sin turnos suficientes' : p.confiabilidad,
        place: p.comuna,
        why: opts.deck ? s.porQue : undefined,
    };
}

// ─── EXP-07 · Buscar ────────────────────────────────────────────────────────

/** Rosa sin perfiles: busca igual, pero antes de escribir ve cómo empezar (su EmptyState con «Agregar un perfil»). */
export const sinPerfiles = (actor: DemoActor) => actor.kind === 'persona' && actor.capabilities.length === 0;

/** Minúsculas y sin tildes («Ñuñoa» → «nunoa»). */
export function fold(text: string): string {
    return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Un texto ya plegado con sus formas «/a» resueltas: «asesor/a del hogar»
 * también es «asesor del hogar» y «asesora del hogar»; «camarero/a», «camarero»
 * y «camarera». Así «asesora» encuentra «Asesor/a del hogar» y al revés.
 */
export function genderVariants(text: string): string[] {
    if (!text.includes('/a')) return [text];
    const masc = text.replace(/\/a\b/g, '');
    const fem = text.replace(/o\/a\b/g, 'a').replace(/\/a\b/g, 'a');
    return [text, masc, fem];
}

/**
 * Oficios con su nombre digno para un sinónimo escrito («nana» → «Asesor/a
 * del hogar», «Cuidador/a infantil»): los Chips de sugerencia bajo el
 * buscador. El sinónimo nunca se muestra.
 */
export function synonymSuggestions(query: string): readonly string[] {
    return SINONIMOS[fold(query)] ?? [];
}

/** Lo que se busca: el texto y, si es un sinónimo, sus oficios; con sus formas «/a». */
export function searchTerms(query: string): string[] {
    const q = fold(query);
    if (!q) return [];
    const terms = [q, ...synonymSuggestions(q).map(fold)].flatMap(genderVariants);
    return [...new Set(terms)];
}

export interface SearchResults {
    empleos: DemoEmpleo[];
    turnos: DemoTurno[];
    /** Personas que calzan con las publicaciones propias (organización u hogar). */
    personas: Suggestion[];
}

const turnosOf = (explore: DemoExplore) => explore.turnos.dias.flatMap((d) => turnosOfDay(d.publicaciones));

/**
 * Todas las publicaciones activas de empleo y turno de la demo (getPublications):
 * EXP-07 es una búsqueda global (spec §5.4). Con el estado de la sesión: una
 * publicación que se pausó o cerró en GES-01 ya no aparece.
 */
export function searchablePublications(manage: ManageState): (DemoEmpleo | DemoTurno)[] {
    return getPublications().filter(
        (p): p is DemoEmpleo | DemoTurno => (p.tipo === 'empleo' || p.tipo === 'turno') && isPublicationActive(p.id, manage),
    );
}

/**
 * Orden de una persona encontrada: primero quien espera revisión, luego a
 * quien ya invitaste (lo último que hiciste con ella), después a quién
 * invitar y al final quien ya tiene cupo.
 */
const MEMBERSHIP_RANK: Record<MemberKind | 'invitar' | 'invitada', number> = {
    postulado: 0,
    espera: 0,
    postulante: 0,
    invitada: 1,
    invitar: 2,
    confirmado: 3,
};
const rankOf = (s: Suggestion) => MEMBERSHIP_RANK[s.membership?.kind ?? (s.invitada ? 'invitada' : 'invitar')];

/** Lo decidido en EXP-05 sobre una persona sugerida, con la clave suggestionId (useDecided del actor). */
export type SuggestionDecided = (suggestionId: string) => Decided;

const nothingDecided: SuggestionDecided = () => undefined;

/**
 * Las personas que calzan con las publicaciones propias del actor, una vez
 * cada una, con la publicación por la que calzan (en el orden de
 * MEMBERSHIP_RANK). Lo decidido en EXP-05 manda: con «No me interesa» ya no
 * calza con esa publicación («No te sugeriremos más a …»); con «Invitar a
 * postular» dice que ya la invitaste.
 */
function allCandidates(
    actor: DemoActor,
    recienRegistrado: boolean,
    applications: Applications,
    manage: ManageState,
    decided: SuggestionDecided,
): Suggestion[] {
    const out = new Map<string, Suggestion>();
    for (const pub of ownPublications(actor, recienRegistrado, manage)) {
        const comuna = comunaOf(pub.lugar);
        const members = membersOf(pub.id, applications, manage);
        for (const person of candidatesFor(actor, pub)) {
            const membership = members.get(person.id);
            const decision = membership ? undefined : decided(suggestionId(pub.id, person.id));
            if (decision === 'no') continue;
            const s: Suggestion = {
                person,
                porQue: porQueOf(undefined, person.comuna, comuna),
                publicationId: pub.id,
                publicationTitle: pub.titulo,
                membership,
                invitada: decision === 'si' || undefined,
            };
            const prev = out.get(person.id);
            if (!prev || rankOf(s) < rankOf(prev)) out.set(person.id, s);
        }
    }
    return [...out.values()];
}

/**
 * Lo que el actor puede buscar: todos los empleos y turnos activos (primero
 * los de su Explorar, que están cerca; sin los propios) y, para quien
 * contrata, las personas que calzan con sus publicaciones.
 */
export function searchScope(
    actor: DemoActor,
    recienRegistrado: boolean,
    applications: Applications,
    manage: ManageState,
    decided: SuggestionDecided = nothingDecided,
): SearchResults {
    const own = new Set(getManagedPublications(actor.id).map((m) => m.publicationId));
    const explore = getExplore(actor.id);
    const near = new Set([...explore.empleos.publicaciones, ...turnosOf(explore).map((p) => p.id)]);
    const all = searchablePublications(manage).filter((p) => !own.has(p.id));
    const sorted = [...all.filter((p) => near.has(p.id)), ...all.filter((p) => !near.has(p.id))];
    return {
        empleos: sorted.filter((p): p is DemoEmpleo => p.tipo === 'empleo'),
        turnos: sorted.filter((p): p is DemoTurno => p.tipo === 'turno'),
        personas: allCandidates(actor, recienRegistrado, applications, manage, decided),
    };
}

/** Busca en el título, quien publica, el lugar, los datos clave y el oficio; en personas, nombre, oficio y comuna. */
export function searchIn(scope: SearchResults, query: string): SearchResults {
    const terms = searchTerms(query);
    if (terms.length === 0) return { empleos: [], turnos: [], personas: [] };
    const matches = (text: string) => {
        const hay = genderVariants(fold(text)).join(' | ');
        return terms.some((term) => hay.includes(term));
    };
    const hit = (p: DemoPublication) =>
        matches([p.titulo, p.autor.nombre, p.lugar, (p.tipo === 'turno' && p.oficio) || '', ...p.tags.map((t) => t.text)].join(' · '));
    const hitPerson = (s: Suggestion) => matches([s.person.nombre, s.person.oficio ?? '', s.person.comuna].join(' · '));
    return {
        empleos: scope.empleos.filter(hit),
        turnos: scope.turnos.filter(hit),
        personas: scope.personas.filter(hitPerson),
    };
}

/**
 * Palabras que sí encuentran algo, para «No encontramos…»: un oficio y una
 * comuna de lo que el actor puede buscar (máximo 3, sin repetir).
 */
export function searchHints(scope: SearchResults): string[] {
    const oficios = [
        ...scope.turnos.map((p) => p.oficio),
        ...scope.empleos.map((p) => p.titulo),
        ...scope.personas.map((s) => s.person.oficio),
    ];
    const comunas = [
        ...scope.turnos.map((p) => comunaOf(p.lugar)),
        ...scope.empleos.map((p) => comunaOf(p.lugar)),
        ...scope.personas.map((s) => s.person.comuna),
    ];
    const unique = (xs: readonly (string | undefined)[]) => [...new Set(xs.filter((x): x is string => Boolean(x)))];
    const o = unique(oficios);
    const c = unique(comunas);
    return [...o.slice(0, 2), ...c.slice(0, 1)].slice(0, 3);
}
