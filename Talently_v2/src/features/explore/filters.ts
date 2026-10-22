// Filtros, chips y vista de Explorar en la URL (spec §5.3: lo que se elige en
// una pestaña sobrevive a ir a una pantalla apilada y volver, y la memoria de
// pestañas guarda la URL completa). Cada segmento lleva sus claves con su
// prefijo («empleo.km», «turno.oficio»), así que cambiar de segmento y volver
// no pierde lo elegido. Sin React: leer y escribir URLSearchParams.
//
// Lo que no está en la URL vale lo de partida: la distancia y «Solo
// organizaciones verificadas» según `filtrosActivos` de la demo, la vista que
// trae la demo y ningún chip elegido.
import type { ExploreType } from '../../app/paths';
import type { AvailabilityBand } from '../../ui/AvailabilityGrid';

export type Segment = Extract<ExploreType, 'empleo' | 'turno' | 'personas'>;
export type ExploreVista = 'deck' | 'lista';

/** Parámetros compartidos (spec §5.4: `/explorar?tipo=personas&p=:pubId`). */
export const PARAM_TIPO = 'tipo';
export const PARAM_PUBLICACION = 'p';

const key = (segment: Segment, field: string) => `${segment}.${field}`;

/** Sin límite de distancia (el valor de la URL cuando se quitó el filtro de partida). */
const SIN_LIMITE = 'todas';

// ─── Lectura y escritura genéricas ──────────────────────────────────────────

function readList<T extends string>(params: URLSearchParams, name: string, allowed: readonly T[]): T[] {
    const values = params.getAll(name);
    return allowed.filter((v) => values.includes(v));
}

function writeList(params: URLSearchParams, name: string, values: readonly string[]): void {
    params.delete(name);
    for (const v of values) params.append(name, v);
}

function readKm(params: URLSearchParams, name: string, fallback: Distancia | null): Distancia | null {
    const raw = params.get(name);
    if (raw === null) return fallback;
    if (raw === SIN_LIMITE) return null;
    const km = Number(raw);
    return (DISTANCIAS as readonly number[]).includes(km) ? (km as Distancia) : fallback;
}

function writeKm(params: URLSearchParams, name: string, km: Distancia | null, fallback: Distancia | null): void {
    if (km === fallback) params.delete(name);
    else params.set(name, km === null ? SIN_LIMITE : String(km));
}

function readFlag(params: URLSearchParams, name: string, fallback: boolean): boolean {
    const raw = params.get(name);
    if (raw === '1') return true;
    if (raw === '0') return false;
    return fallback;
}

function writeFlag(params: URLSearchParams, name: string, value: boolean, fallback: boolean): void {
    if (value === fallback) params.delete(name);
    else params.set(name, value ? '1' : '0');
}

/** Copia de los parámetros con los cambios de `edit` (no toca el original). */
export function withParams(params: URLSearchParams, edit: (next: URLSearchParams) => void): URLSearchParams {
    const next = new URLSearchParams(params);
    edit(next);
    return next;
}

/** Monto mínimo (CLP, entero positivo); cualquier otra cosa = sin mínimo. */
function readMoney(params: URLSearchParams, name: string): number | null {
    const raw = params.get(name);
    if (raw === null || !/^\d{1,10}$/.test(raw)) return null;
    const n = Number(raw);
    return n > 0 ? n : null;
}

function writeMoney(params: URLSearchParams, name: string, value: number | null): void {
    if (value === null || value <= 0) params.delete(name);
    else params.set(name, String(value));
}

// ─── Vista (deck o lista) ───────────────────────────────────────────────────

/**
 * `vista=lista` sin prefijo: así llega desde otras pantallas (ONB-99,
 * «Ver empleos en lista»). Vale para el segmento de `tipo` mientras
 * paths.explorar no arme `empleo.vista` (pedido en «requests»).
 */
const VISTA_ALIAS = 'vista';

const isVista = (raw: string | null): raw is ExploreVista => raw === 'deck' || raw === 'lista';

export function readVista(params: URLSearchParams, segment: Segment, fallback: ExploreVista): ExploreVista {
    const raw = params.get(key(segment, 'vista'));
    if (isVista(raw)) return raw;
    const alias = params.get(VISTA_ALIAS);
    return isVista(alias) && params.get(PARAM_TIPO) === segment ? alias : fallback;
}

export function writeVista(params: URLSearchParams, segment: Segment, vista: ExploreVista, fallback: ExploreVista): void {
    params.delete(VISTA_ALIAS);
    if (vista === fallback) params.delete(key(segment, 'vista'));
    else params.set(key(segment, 'vista'), vista);
}

/** ¿La URL trae `vista=` sin prefijo? Se pasa a la clave del segmento (normalizeVista). */
export const hasVistaAlias = (params: URLSearchParams) => params.has(VISTA_ALIAS);

/** Deja la vista del alias en su clave con prefijo (o la quita si es la de partida) y borra el alias. */
export function normalizeVista(params: URLSearchParams, segment: Segment, fallback: ExploreVista | null): void {
    if (fallback !== null) writeVista(params, segment, readVista(params, segment, fallback), fallback);
    params.delete(VISTA_ALIAS);
}

// ─── Catálogos de los filtros (EXP-06) ──────────────────────────────────────

export const JORNADAS = ['Jornada completa', 'Part time'] as const;
export const CONTRATOS = ['Indefinido', 'Plazo fijo'] as const;
export const DISTANCIAS = [5, 10, 20] as const;
/** Títulos de día de la demo, en su orden. */
export const FECHAS = ['Hoy', 'Mañana', 'Este fin de semana', 'Más adelante'] as const;
/** Nota mínima de Personas sugeridas. */
export const NOTAS = [4.5, 4.8] as const;
/** Franjas del diccionario (`time_band`, spec §4.5), en su orden: Mañana 07–13 · Tarde 13–19 · Noche 19–01 · Madrugada 01–07. */
export const FRANJAS = ['manana', 'tarde', 'noche', 'madrugada'] as const satisfies readonly AvailabilityBand[];
/** Unidades de la tarifa mínima de un turno. */
export const TARIFA_UNIDADES = ['turno', 'hora'] as const;

export type Jornada = (typeof JORNADAS)[number];
export type Contrato = (typeof CONTRATOS)[number];
export type Distancia = (typeof DISTANCIAS)[number];
export type Fecha = (typeof FECHAS)[number];
export type Nota = (typeof NOTAS)[number];
export type Franja = (typeof FRANJAS)[number];
export type TarifaUnidad = (typeof TARIFA_UNIDADES)[number];

/** La distancia de partida: 20 km si la demo trae al menos un filtro activo. */
const kmDePartida = (activos: number): Distancia | null => (activos >= 1 ? 20 : null);
/** «Solo organizaciones verificadas» de partida: si la demo trae dos filtros activos. */
const verificadasDePartida = (activos: number) => activos >= 2;

// ─── EXP-01 · Empleos ───────────────────────────────────────────────────────

export interface EmpleoFiltros {
    jornadas: Jornada[];
    contratos: Contrato[];
    distancia: Distancia | null;
    /** Sueldo líquido mínimo al mes; null = cualquiera. */
    sueldoMin: number | null;
    verificadas: boolean;
}

export const EMPLEO_SIN_FILTROS: EmpleoFiltros = { jornadas: [], contratos: [], distancia: null, sueldoMin: null, verificadas: false };

export function readEmpleoFiltros(params: URLSearchParams, activos: number): EmpleoFiltros {
    return {
        jornadas: readList(params, key('empleo', 'jornada'), JORNADAS),
        contratos: readList(params, key('empleo', 'contrato'), CONTRATOS),
        distancia: readKm(params, key('empleo', 'km'), kmDePartida(activos)),
        sueldoMin: readMoney(params, key('empleo', 'min')),
        verificadas: readFlag(params, key('empleo', 'verificadas'), verificadasDePartida(activos)),
    };
}

export function writeEmpleoFiltros(params: URLSearchParams, f: EmpleoFiltros, activos: number): void {
    writeList(params, key('empleo', 'jornada'), f.jornadas);
    writeList(params, key('empleo', 'contrato'), f.contratos);
    writeKm(params, key('empleo', 'km'), f.distancia, kmDePartida(activos));
    writeMoney(params, key('empleo', 'min'), f.sueldoMin);
    writeFlag(params, key('empleo', 'verificadas'), f.verificadas, verificadasDePartida(activos));
}

export function countEmpleoFiltros(f: EmpleoFiltros): number {
    return (
        f.jornadas.length +
        f.contratos.length +
        (f.distancia !== null ? 1 : 0) +
        (f.sueldoMin !== null ? 1 : 0) +
        (f.verificadas ? 1 : 0)
    );
}

// ─── EXP-02 · Turnos ────────────────────────────────────────────────────────

export interface TurnoFiltros {
    fechas: Fecha[];
    franjas: Franja[];
    distancia: Distancia | null;
    /** Tarifa líquida mínima en `tarifaUnidad`; null = cualquiera. */
    tarifaMin: number | null;
    tarifaUnidad: TarifaUnidad;
    verificadas: boolean;
}

export const TURNO_SIN_FILTROS: TurnoFiltros = {
    fechas: [],
    franjas: [],
    distancia: null,
    tarifaMin: null,
    tarifaUnidad: 'turno',
    verificadas: false,
};

export function readTurnoFiltros(params: URLSearchParams, activos: number): TurnoFiltros {
    return {
        fechas: readList(params, key('turno', 'fecha'), FECHAS),
        franjas: readList(params, key('turno', 'franja'), FRANJAS),
        distancia: readKm(params, key('turno', 'km'), kmDePartida(activos)),
        tarifaMin: readMoney(params, key('turno', 'min')),
        tarifaUnidad: params.get(key('turno', 'unidad')) === 'hora' ? 'hora' : 'turno',
        verificadas: readFlag(params, key('turno', 'verificadas'), verificadasDePartida(activos)),
    };
}

export function writeTurnoFiltros(params: URLSearchParams, f: TurnoFiltros, activos: number): void {
    writeList(params, key('turno', 'fecha'), f.fechas);
    writeList(params, key('turno', 'franja'), f.franjas);
    writeKm(params, key('turno', 'km'), f.distancia, kmDePartida(activos));
    writeMoney(params, key('turno', 'min'), f.tarifaMin);
    // La unidad solo importa con un monto: sin él, la de partida (por turno).
    if (f.tarifaMin !== null && f.tarifaUnidad !== 'turno') params.set(key('turno', 'unidad'), f.tarifaUnidad);
    else params.delete(key('turno', 'unidad'));
    writeFlag(params, key('turno', 'verificadas'), f.verificadas, verificadasDePartida(activos));
}

export function countTurnoFiltros(f: TurnoFiltros): number {
    return (
        f.fechas.length + f.franjas.length + (f.distancia !== null ? 1 : 0) + (f.tarifaMin !== null ? 1 : 0) + (f.verificadas ? 1 : 0)
    );
}

/**
 * Comuna del Chip de EXP-02 (SHT-COMUNA). Sin ella (o la del actor), los
 * turnos cerca de su comuna; con otra, solo los de esa comuna.
 */
export function readComuna(params: URLSearchParams, comunas: readonly string[], home: string): string {
    const raw = params.get(key('turno', 'comuna'));
    return raw !== null && comunas.includes(raw) ? raw : home;
}

export function writeComuna(params: URLSearchParams, comuna: string, home: string): void {
    if (comuna === home) params.delete(key('turno', 'comuna'));
    else params.set(key('turno', 'comuna'), comuna);
}

/** Chips de oficio de EXP-02 («Garzón», «Bodega»…); vacío = «Todos». */
export function readOficios(params: URLSearchParams, chips: readonly string[]): string[] {
    return readList(params, key('turno', 'oficio'), chips);
}

export function writeOficios(params: URLSearchParams, oficios: readonly string[]): void {
    writeList(params, key('turno', 'oficio'), oficios);
}

/** Tocar un chip de oficio: lo elige o lo quita, en el orden de los chips. */
export function toggleOficio(chips: readonly string[], elegidos: readonly string[], oficio: string): string[] {
    const on = elegidos.includes(oficio);
    return chips.filter((c) => (c === oficio ? !on : elegidos.includes(c)));
}

// ─── EXP-05 · Personas sugeridas ────────────────────────────────────────────

export interface PersonaFiltros {
    /** Nota mínima; null = cualquiera. */
    nota: Nota | null;
    yaTrabajaron: boolean;
}

export const PERSONA_SIN_FILTROS: PersonaFiltros = { nota: null, yaTrabajaron: false };

export function readPersonaFiltros(params: URLSearchParams): PersonaFiltros {
    const nota = Number(params.get(key('personas', 'nota')));
    return {
        nota: (NOTAS as readonly number[]).includes(nota) ? (nota as Nota) : null,
        yaTrabajaron: readFlag(params, key('personas', 'trabajaron'), false),
    };
}

export function writePersonaFiltros(params: URLSearchParams, f: PersonaFiltros): void {
    if (f.nota === null) params.delete(key('personas', 'nota'));
    else params.set(key('personas', 'nota'), String(f.nota));
    writeFlag(params, key('personas', 'trabajaron'), f.yaTrabajaron, false);
}

export const countPersonaFiltros = (f: PersonaFiltros) => (f.nota !== null ? 1 : 0) + (f.yaTrabajaron ? 1 : 0);

export const formatNota = (n: number) => n.toFixed(1).replace('.', ',');
