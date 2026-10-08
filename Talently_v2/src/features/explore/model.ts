// Lógica de Explorar sin React: qué segmentos ve cada actor, filtros, personas
// sugeridas y el paso de los datos de la demo a las props de src/ui. Solo usa
// las funciones get… de la demo (nunca sus constantes DEMO_*).
import type { MouseEventHandler } from 'react';
import { paths, type ExploreType } from '../../app/paths';
import type { AmountFormatOptions } from '../../ui/Amount';
import { IconAdd, IconBell, IconCalendar, IconChat, IconOffers, type IconComponent } from '../../ui/icons';
import type { PublicationCardData, PublicationRequirement, PublicationVerification } from '../../ui/PublicationCard';
import {
    getExplore,
    getHomeFeed,
    getManagedPublication,
    getOrgDashboard,
    getPerson,
    getPublication,
} from '../demo/data';
import type { DemoActor } from '../demo/session';
import type {
    DemoAmount,
    DemoEmpleo,
    DemoEmptyState,
    DemoExplore,
    DemoManagedPublication,
    DemoPerson,
    DemoPublication,
    DemoTarget,
    DemoTurno,
    DemoVerification,
} from '../demo/types';
import { copy } from './copy';
import { CANDIDATOS_POR_PUBLICACION, OFICIO_DEL_TURNO } from './mock';

// ─── Segmentos (spec §5.2) ──────────────────────────────────────────────────

export type Segment = Extract<ExploreType, 'empleo' | 'turno' | 'personas'>;

const SEGMENT_ORDER: readonly Segment[] = ['empleo', 'turno', 'personas'];

/** Publicaciones activas propias del actor (organización u hogar), en el orden de su panel. */
export function ownPublications(actor: DemoActor): DemoPublication[] {
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
export function segmentsOf(actor: DemoActor): Segment[] {
    if (actor.kind === 'organizacion') return ['personas'];
    const trabaja = actor.capabilities.includes('empleo') || actor.capabilities.includes('turnos');
    const hogar = actor.capabilities.includes('hogar');
    if (hogar && !trabaja) return ['personas'];
    const segs: Segment[] = ['empleo', 'turno'];
    if (hogar && ownPublications(actor).length > 0) segs.push('personas');
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

/** DemoTarget → ruta de paths.ts. */
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

const EMPTY_ICON: Record<NonNullable<DemoEmptyState['icono']>, IconComponent> = {
    empleo: IconOffers,
    turno: IconCalendar,
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
    onVerify: (nombre: string, verificaciones: readonly DemoVerification[]) => void;
}

function verificationsOf(
    nombre: string,
    verificaciones: readonly DemoVerification[],
    onVerify: CardHandlers['onVerify'],
): PublicationVerification[] {
    return verificaciones.map((v) => ({
        status: v.status,
        label: v.label,
        onClick: () => onVerify(nombre, verificaciones),
    }));
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
        verifications: verificationsOf(p.autor.nombre, p.autor.verificaciones, h.onVerify),
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

// ─── EXP-01 · Empleos ───────────────────────────────────────────────────────

export interface EmpleoFiltros {
    jornadas: string[];
    contratos: string[];
    distancia: number | null;
    verificadas: boolean;
}

export const JORNADAS = ['Jornada completa', 'Part time'] as const;
export const CONTRATOS = ['Indefinido', 'Plazo fijo'] as const;
export const DISTANCIAS = [5, 10, 20] as const;

export const EMPLEO_SIN_FILTROS: EmpleoFiltros = { jornadas: [], contratos: [], distancia: null, verificadas: false };

/**
 * Los filtros con que parte la persona: tantos como dice la demo
 * (`filtrosActivos`), en este orden: distancia de 20 km y solo
 * organizaciones verificadas.
 */
export function defaultEmpleoFiltros(activos: number): EmpleoFiltros {
    return { ...EMPLEO_SIN_FILTROS, distancia: activos >= 1 ? 20 : null, verificadas: activos >= 2 };
}

export function countEmpleoFiltros(f: EmpleoFiltros): number {
    return f.jornadas.length + f.contratos.length + (f.distancia !== null ? 1 : 0) + (f.verificadas ? 1 : 0);
}

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

// ─── EXP-02 · Turnos ────────────────────────────────────────────────────────

export interface TurnoFiltros {
    /** Títulos de día de la demo: «Hoy», «Mañana», «Este fin de semana», «Más adelante». */
    fechas: string[];
    distancia: number | null;
    verificadas: boolean;
}

export const FECHAS = ['Hoy', 'Mañana', 'Este fin de semana', 'Más adelante'] as const;

export const TURNO_SIN_FILTROS: TurnoFiltros = { fechas: [], distancia: null, verificadas: false };

export function defaultTurnoFiltros(activos: number): TurnoFiltros {
    return { ...TURNO_SIN_FILTROS, distancia: activos >= 1 ? 20 : null, verificadas: activos >= 2 };
}

export function countTurnoFiltros(f: TurnoFiltros): number {
    return f.fechas.length + (f.distancia !== null ? 1 : 0) + (f.verificadas ? 1 : 0);
}

export interface TurnoDay {
    titulo: string;
    turnos: DemoTurno[];
}

/** Días con sus turnos, filtrados por los chips de oficio y la hoja de filtros. Sin días vacíos. */
export function turnoDays(explore: DemoExplore, oficios: readonly string[], f: TurnoFiltros): TurnoDay[] {
    return explore.turnos.dias
        .filter((d) => f.fechas.length === 0 || f.fechas.includes(d.titulo))
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

// ─── EXP-05 · Personas sugeridas ────────────────────────────────────────────

export interface PersonaFiltros {
    /** Nota mínima (4,5 o 4,8); null = cualquiera. */
    nota: number | null;
    yaTrabajaron: boolean;
}

export const NOTAS = [4.5, 4.8] as const;
export const PERSONA_SIN_FILTROS: PersonaFiltros = { nota: null, yaTrabajaron: false };

export const countPersonaFiltros = (f: PersonaFiltros) => (f.nota !== null ? 1 : 0) + (f.yaTrabajaron ? 1 : 0);

export const formatNota = (n: number) => n.toFixed(1).replace('.', ',');

export interface Suggestion {
    person: DemoPerson;
    porQue: string;
    /** «sáb 5 dic»: trabajó con quien publica en un turno ya terminado. */
    trabajoEl?: string;
}

export type PersonasEstado =
    | { tipo: 'sugeridas'; sugeridas: Suggestion[] }
    | { tipo: 'completo'; total: number }
    | { tipo: 'postularon'; postulados: number; revisar: string; accion: string };

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
            const extra = trabajoEl
                ? copy.personas.porque.trabajo(trabajoEl)
                : person.comuna === comuna
                  ? copy.personas.porque.comuna(person.comuna)
                  : undefined;
            const porQue = [copy.personas.porque.oficio(pub.titulo), extra].filter(Boolean).join(' y ');
            return { person, porQue, trabajoEl };
        })
        // Primero quienes ya trabajaron contigo; luego, por nota.
        .sort((a, b) => Number(Boolean(b.trabajoEl)) - Number(Boolean(a.trabajoEl)) || (b.person.nota?.value ?? 0) - (a.person.nota?.value ?? 0));

    if (sugeridas.length > 0) return { tipo: 'sugeridas', sugeridas };

    const firstBlock = cupos[0];
    if (firstBlock) {
        const postulados = cupos.reduce((n, c) => n + c.postulados.length + c.listaEspera.length, 0);
        return { tipo: 'postularon', postulados, revisar: paths.cuposTurno(pub.id, firstBlock.id), accion: copy.personas.todosPostularon.verCupos };
    }
    return {
        tipo: 'postularon',
        postulados: m?.postulantes?.total ?? 0,
        revisar: paths.postulantes(pub.id),
        accion: copy.personas.todosPostularon.verPostulantes,
    };
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
        verifications: verificationsOf(p.nombre, p.verificaciones, h.onVerify),
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
}

/** Busca en lo que el actor ve en Explorar: título, quien publica, lugar, datos clave y oficio. */
export function searchExplore(actor: DemoActor, query: string): SearchResults {
    const q = fold(query);
    const explore = getExplore(actor.id);
    if (!q) return { empleos: [], turnos: [] };
    const hit = (p: DemoPublication) =>
        fold([p.titulo, p.autor.nombre, p.lugar, OFICIO_DEL_TURNO[p.id] ?? '', ...p.tags.map((t) => t.text)].join(' ')).includes(q);
    const turnoIds = explore.turnos.dias.flatMap((d) => d.publicaciones);
    return {
        empleos: empleosOf(explore).filter(hit),
        turnos: turnoIds
            .map((id) => getPublication(id))
            .filter((p): p is DemoTurno => p?.tipo === 'turno')
            .filter(hit),
    };
}
