// Lógica de Explorar sin React: qué segmentos ve cada actor, filtros, personas
// sugeridas, búsqueda y el paso de los datos de la demo a las props de src/ui.
// Solo usa las funciones get… de la demo (nunca sus constantes DEMO_*).
import type { MouseEventHandler } from 'react';
import { paths } from '../../app/paths';
import type { AmountFormatOptions } from '../../ui/Amount';
import { IconAdd, IconBell, IconChat, IconClock, IconOffers, type IconComponent } from '../../ui/icons';
import type { PublicationCardData, PublicationRequirement, PublicationVerification } from '../../ui/PublicationCard';
import { getExplore, getHomeFeed, getManagedPublication, getOrgDashboard, getPerson, getPublication } from '../demo/data';
import type { DemoActor } from '../demo/session';
import type { DeckDecision } from '../demo/sessionStore';
import type {
    DemoAmount,
    DemoEmpleo,
    DemoEmptyState,
    DemoExplore,
    DemoManagedPublication,
    DemoPerson,
    DemoPublication,
    DemoTurno,
    DemoVerification,
} from '../demo/types';
import { copy } from './copy';
import type { EmpleoFiltros, PersonaFiltros, Segment, TurnoFiltros } from './filters';
import { CANDIDATOS_POR_PUBLICACION, OFICIO_DEL_TURNO, SINONIMOS } from './mock';

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
 * de su panel. Jorge recién registrado (INI-01-jorge-nuevo) todavía no publicó nada.
 */
export function ownPublications(actor: DemoActor, recienRegistrado = false): DemoPublication[] {
    if (recienRegistrado) return [];
    let ids: string[] = [];
    if (actor.kind === 'organizacion') {
        ids = getOrgDashboard(actor.id)?.publicaciones ?? [];
    } else if (actor.capabilities.includes('hogar')) {
        for (const b of getHomeFeed(actor.id).bloques) if (b.tipo === 'tu-aviso') ids.push(b.publicationId);
    }
    return ids
        .filter((id) => (getManagedPublication(id)?.estado ?? getPublication(id)?.estado) === 'Activa')
        .map((id) => getPublication(id))
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
export function segmentsOf(actor: DemoActor, recienRegistrado = false): Segment[] {
    if (actor.kind === 'organizacion') return ['personas'];
    const trabaja = actor.capabilities.includes('empleo') || actor.capabilities.includes('turnos');
    const hogar = actor.capabilities.includes('hogar');
    if (hogar && !trabaja) return ['personas'];
    const segs: Segment[] = ['empleo', 'turno'];
    if (hogar && ownPublications(actor, recienRegistrado).length > 0) segs.push('personas');
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

export function passesEmpleo(p: DemoEmpleo, f: EmpleoFiltros): boolean {
    return (
        tagIn(p, 'jornada', f.jornadas) &&
        tagIn(p, 'contrato', f.contratos) &&
        withinKm(p, f.distancia) &&
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

/** Días con sus turnos, filtrados por los chips de oficio y la hoja de filtros. Sin días vacíos. */
export function turnoDays(explore: DemoExplore, oficios: readonly string[], f: TurnoFiltros): TurnoDay[] {
    return explore.turnos.dias
        .filter((d) => f.fechas.length === 0 || (f.fechas as readonly string[]).includes(d.titulo))
        .map((d) => ({
            titulo: d.titulo,
            turnos: d.publicaciones
                .map((id) => getPublication(id))
                .filter((p): p is DemoTurno => p?.tipo === 'turno')
                .filter((p) => oficios.length === 0 || oficios.includes(OFICIO_DEL_TURNO[p.id] ?? ''))
                .filter((p) => withinKm(p, f.distancia) && (!f.verificadas || isVerifiedOrg(p))),
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

export interface Suggestion {
    person: DemoPerson;
    porQue: string;
    /** «sáb 5 dic»: trabajó con quien publica en un turno ya terminado. */
    trabajoEl?: string;
}

export type PersonasEstado =
    | { tipo: 'sugeridas'; sugeridas: Suggestion[] }
    | { tipo: 'completo'; total: number }
    | { tipo: 'postularon'; postulados: number };

/**
 * Lo decidido sobre una persona sugerida se guarda en demo/sessionStore
 * (decide/undoDecision) con esta clave de «publicación» propia: la
 * publicación y la persona. Así GES-03 y EXP-05 ven lo mismo.
 */
export const suggestionId = (publicationId: string, personId: string) => `${publicationId}/${personId}`;

/** Quienes ya están en la publicación: confirmados, postulados, lista de espera o postulantes. */
function inPublication(m: DemoManagedPublication | undefined): Set<string> {
    const ids = new Set<string>();
    for (const c of m?.cupos ?? []) {
        for (const a of [...c.confirmados, ...c.postulados, ...c.listaEspera]) ids.add(a.personId);
    }
    for (const a of m?.postulantes?.personas ?? []) ids.add(a.personId);
    return ids;
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

/** Lo que muestra EXP-05 para una publicación propia. */
export function personasFor(actor: DemoActor, pub: DemoPublication): PersonasEstado {
    const m = getManagedPublication(pub.id);
    const cupos = m?.cupos ?? [];
    const total = cupos.reduce((n, c) => n + c.total, 0);
    const confirmados = cupos.reduce((n, c) => n + c.confirmados.length, 0);
    if (cupos.length > 0 && confirmados >= total) return { tipo: 'completo', total };

    const taken = inPublication(m);
    const worked = workedWith(actor);
    const comuna = comunaOf(pub.lugar);
    const sugeridas = (CANDIDATOS_POR_PUBLICACION[pub.id] ?? [])
        .filter((id) => !taken.has(id) && id !== actor.id && id !== actor.owner)
        .map((id) => getPerson(id))
        .filter((p): p is DemoPerson => p !== undefined)
        .map((person) => {
            const trabajoEl = worked.get(person.id);
            return { person, porQue: porQueOf(trabajoEl, person.comuna, comuna), trabajoEl };
        })
        // Primero quienes ya trabajaron contigo; luego, por nota.
        .sort(
            (a, b) =>
                Number(Boolean(b.trabajoEl)) - Number(Boolean(a.trabajoEl)) || (b.person.nota?.value ?? 0) - (a.person.nota?.value ?? 0),
        );

    if (sugeridas.length > 0) return { tipo: 'sugeridas', sugeridas };
    const postulados = cupos.length
        ? cupos.reduce((n, c) => n + c.postulados.length + c.listaEspera.length, 0)
        : (m?.postulantes?.total ?? 0);
    return { tipo: 'postularon', postulados };
}

/** Dónde se revisa a quienes postularon: los cupos del turno (GES-04) o los postulantes (GES-02). */
export function reviewPathOf(pub: DemoPublication): { path: string; label: string } {
    const firstBlock = getManagedPublication(pub.id)?.cupos?.[0];
    return firstBlock
        ? { path: paths.cuposTurno(pub.id, firstBlock.id), label: copy.personas.verCupos }
        : { path: paths.postulantes(pub.id), label: copy.personas.verPostulantes };
}

export function passesPersona(s: Suggestion, f: PersonaFiltros): boolean {
    if (f.yaTrabajaron && !s.trabajoEl) return false;
    if (f.nota !== null && (s.person.nota?.value ?? 0) < f.nota) return false;
    return true;
}

/** Una persona sugerida para PublicationCard (deck o lista): nunca la edad. */
export function personCard(s: Suggestion, h: CardHandlers, opts: { deck?: boolean } = {}): PublicationCardData {
    const p = s.person;
    return {
        author: { name: p.nombre, kind: 'person', initials: p.iniciales },
        verifications: verificationsOf(p.verificaciones, h.onVerify),
        title: p.oficio ?? p.nombre,
        href: h.href,
        onOpen: h.onOpen,
        tags: p.experiencia ? [{ kind: 'experiencia', label: `${p.experiencia} de experiencia` }] : undefined,
        rating: { value: p.nota?.value ?? null, count: p.nota?.count ?? 0 },
        reliability: p.confiabilidad === null ? 'Aún sin turnos suficientes' : p.confiabilidad,
        place: p.comuna,
        why: opts.deck ? s.porQue : undefined,
    };
}

// ─── EXP-07 · Buscar ────────────────────────────────────────────────────────

/** Minúsculas y sin tildes («Ñuñoa» → «nunoa»). */
export function fold(text: string): string {
    return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

export interface SearchResults {
    empleos: DemoEmpleo[];
    turnos: DemoTurno[];
    /** Personas que calzan con las publicaciones propias (organización u hogar). */
    personas: Suggestion[];
}

const turnosOf = (explore: DemoExplore) =>
    explore.turnos.dias
        .flatMap((d) => d.publicaciones)
        .map((id) => getPublication(id))
        .filter((p): p is DemoTurno => p?.tipo === 'turno');

/**
 * Las personas que calzan con las publicaciones propias del actor (también
 * las que ya postularon o están en los cupos), una vez cada una.
 */
function allCandidates(actor: DemoActor, recienRegistrado: boolean): Suggestion[] {
    const out = new Map<string, Suggestion>();
    for (const pub of ownPublications(actor, recienRegistrado)) {
        const comuna = comunaOf(pub.lugar);
        for (const id of CANDIDATOS_POR_PUBLICACION[pub.id] ?? []) {
            if (out.has(id) || id === actor.id || id === actor.owner) continue;
            const person = getPerson(id);
            if (person) out.set(id, { person, porQue: porQueOf(undefined, person.comuna, comuna) });
        }
    }
    return [...out.values()];
}

/** Lo que el actor puede buscar: lo que ve en sus segmentos de Explorar. */
export function searchScope(actor: DemoActor, recienRegistrado = false): SearchResults {
    const segs = segmentsOf(actor, recienRegistrado);
    const explore = getExplore(actor.id);
    return {
        empleos: segs.includes('empleo') ? empleosOf(explore) : [],
        turnos: segs.includes('turno') ? turnosOf(explore) : [],
        personas: segs.includes('personas') ? allCandidates(actor, recienRegistrado) : [],
    };
}

export const isEmptyScope = (s: SearchResults) => s.empleos.length + s.turnos.length + s.personas.length === 0;

/** Busca en el título, quien publica, el lugar, los datos clave y el oficio; en personas, nombre, oficio y comuna. */
export function searchIn(scope: SearchResults, query: string): SearchResults {
    const q = fold(query);
    if (!q) return { empleos: [], turnos: [], personas: [] };
    // «nana» también encuentra «Asesor/a del hogar» (el sinónimo nunca se muestra).
    const terms = [q, ...(SINONIMOS[q] ?? [])];
    const matches = (text: string) => {
        const t = fold(text);
        return terms.some((term) => t.includes(term));
    };
    const hit = (p: DemoPublication) =>
        matches([p.titulo, p.autor.nombre, p.lugar, OFICIO_DEL_TURNO[p.id] ?? '', ...p.tags.map((t) => t.text)].join(' '));
    const hitPerson = (s: Suggestion) => matches([s.person.nombre, s.person.oficio ?? '', s.person.comuna].join(' '));
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
        ...scope.turnos.map((p) => OFICIO_DEL_TURNO[p.id]),
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
