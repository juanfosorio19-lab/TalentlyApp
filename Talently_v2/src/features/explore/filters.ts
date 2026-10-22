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

// ─── Vista (deck o lista) ───────────────────────────────────────────────────

export function readVista(params: URLSearchParams, segment: Segment, fallback: ExploreVista): ExploreVista {
    const raw = params.get(key(segment, 'vista'));
    return raw === 'deck' || raw === 'lista' ? raw : fallback;
}

export function writeVista(params: URLSearchParams, segment: Segment, vista: ExploreVista, fallback: ExploreVista): void {
    if (vista === fallback) params.delete(key(segment, 'vista'));
    else params.set(key(segment, 'vista'), vista);
}

// ─── Catálogos de los filtros (EXP-06) ──────────────────────────────────────

export const JORNADAS = ['Jornada completa', 'Part time'] as const;
export const CONTRATOS = ['Indefinido', 'Plazo fijo'] as const;
export const DISTANCIAS = [5, 10, 20] as const;
/** Títulos de día de la demo, en su orden. */
export const FECHAS = ['Hoy', 'Mañana', 'Este fin de semana', 'Más adelante'] as const;
/** Nota mínima de Personas sugeridas. */
export const NOTAS = [4.5, 4.8] as const;

export type Jornada = (typeof JORNADAS)[number];
export type Contrato = (typeof CONTRATOS)[number];
export type Distancia = (typeof DISTANCIAS)[number];
export type Fecha = (typeof FECHAS)[number];
export type Nota = (typeof NOTAS)[number];

/** La distancia de partida: 20 km si la demo trae al menos un filtro activo. */
const kmDePartida = (activos: number): Distancia | null => (activos >= 1 ? 20 : null);
/** «Solo organizaciones verificadas» de partida: si la demo trae dos filtros activos. */
const verificadasDePartida = (activos: number) => activos >= 2;

// ─── EXP-01 · Empleos ───────────────────────────────────────────────────────

export interface EmpleoFiltros {
    jornadas: Jornada[];
    contratos: Contrato[];
    distancia: Distancia | null;
    verificadas: boolean;
}

export const EMPLEO_SIN_FILTROS: EmpleoFiltros = { jornadas: [], contratos: [], distancia: null, verificadas: false };

export function readEmpleoFiltros(params: URLSearchParams, activos: number): EmpleoFiltros {
    return {
        jornadas: readList(params, key('empleo', 'jornada'), JORNADAS),
        contratos: readList(params, key('empleo', 'contrato'), CONTRATOS),
        distancia: readKm(params, key('empleo', 'km'), kmDePartida(activos)),
        verificadas: readFlag(params, key('empleo', 'verificadas'), verificadasDePartida(activos)),
    };
}

export function writeEmpleoFiltros(params: URLSearchParams, f: EmpleoFiltros, activos: number): void {
    writeList(params, key('empleo', 'jornada'), f.jornadas);
    writeList(params, key('empleo', 'contrato'), f.contratos);
    writeKm(params, key('empleo', 'km'), f.distancia, kmDePartida(activos));
    writeFlag(params, key('empleo', 'verificadas'), f.verificadas, verificadasDePartida(activos));
}

export function countEmpleoFiltros(f: EmpleoFiltros): number {
    return f.jornadas.length + f.contratos.length + (f.distancia !== null ? 1 : 0) + (f.verificadas ? 1 : 0);
}

// ─── EXP-02 · Turnos ────────────────────────────────────────────────────────

export interface TurnoFiltros {
    fechas: Fecha[];
    distancia: Distancia | null;
    verificadas: boolean;
}

export const TURNO_SIN_FILTROS: TurnoFiltros = { fechas: [], distancia: null, verificadas: false };

export function readTurnoFiltros(params: URLSearchParams, activos: number): TurnoFiltros {
    return {
        fechas: readList(params, key('turno', 'fecha'), FECHAS),
        distancia: readKm(params, key('turno', 'km'), kmDePartida(activos)),
        verificadas: readFlag(params, key('turno', 'verificadas'), verificadasDePartida(activos)),
    };
}

export function writeTurnoFiltros(params: URLSearchParams, f: TurnoFiltros, activos: number): void {
    writeList(params, key('turno', 'fecha'), f.fechas);
    writeKm(params, key('turno', 'km'), f.distancia, kmDePartida(activos));
    writeFlag(params, key('turno', 'verificadas'), f.verificadas, verificadasDePartida(activos));
}

export function countTurnoFiltros(f: TurnoFiltros): number {
    return f.fechas.length + (f.distancia !== null ? 1 : 0) + (f.verificadas ? 1 : 0);
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
