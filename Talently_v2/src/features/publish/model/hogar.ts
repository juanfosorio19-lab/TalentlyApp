// PUBL-04 · Aviso para mi hogar (plantilla legal del trabajo de casa
// particular): el borrador, sus diccionarios, la validación por paso y los
// textos que se arman con lo escrito. Lógica pura: hogar.test.ts.
import type { PayUnit } from '../../../ui/Amount';
import type { CheckboxOption } from '../../../ui/Checkbox';
import type { ChipGroupOption } from '../../../ui/ChipGroup';
import type { PublicationTag } from '../../../ui/PublicationCard';
import type { SheetPickerOption } from '../../../ui/SheetPicker';
import { getProfile } from '../../demo/data';
import type { DemoActorId } from '../../demo/session';
import { formatHours, sameDayMinutes } from './time';

// ─── Diccionarios ───────────────────────────────────────────────────────────

export type HogarOficio = 'asesor-hogar' | 'cuidador-infantil' | 'cuidador-adulto-mayor' | 'chofer';

/** Oficio del aviso (04-perfiles §4.5: «Permanente»), con sus sinónimos de búsqueda (nunca se muestran). */
export const HOGAR_OFICIOS: readonly SheetPickerOption<HogarOficio>[] = [
    { value: 'asesor-hogar', label: 'Asesor/a del hogar', keywords: ['nana', 'empleada doméstica', 'trabajadora de casa particular'] },
    { value: 'cuidador-infantil', label: 'Cuidador/a infantil', keywords: ['niñera', 'nana', 'cuidadora de niños'] },
    { value: 'cuidador-adulto-mayor', label: 'Cuidador/a de adulto mayor', keywords: ['cuidadora', 'acompañante'] },
    { value: 'chofer', label: 'Chofer particular', keywords: ['conductor particular'] },
];

export type Modalidad = 'adentro' | 'afuera' | 'dias';

/** PUBL-04 paso 1 · Tipo de trabajo: título y ejemplo de cada opción, y cómo se nombra en el aviso. */
export const MODALIDADES: readonly { value: Modalidad; title: string; example: string; enTitulo: string; tag: string }[] = [
    { value: 'adentro', title: 'Puertas adentro', example: 'Vive en tu casa', enTitulo: 'puertas adentro', tag: 'Puertas adentro' },
    { value: 'afuera', title: 'Puertas afuera', example: 'Llega y se va cada día', enTitulo: 'puertas afuera', tag: 'Puertas afuera' },
    { value: 'dias', title: 'Por días', example: 'Algunos días a la semana', enTitulo: 'por días', tag: 'Por días' },
];

export type Dia = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom';

/** PUBL-04 paso 2 · Días, de lunes a domingo. */
export const DIAS: readonly ChipGroupOption<Dia>[] = [
    { value: 'lun', label: 'Lun' },
    { value: 'mar', label: 'Mar' },
    { value: 'mie', label: 'Mié' },
    { value: 'jue', label: 'Jue' },
    { value: 'vie', label: 'Vie' },
    { value: 'sab', label: 'Sáb' },
    { value: 'dom', label: 'Dom' },
];

/** PUBL-04 paso 2 · Colación, en minutos. Solo «1 hora» está en el prototipo. */
export const COLACIONES: readonly SheetPickerOption[] = [
    { value: '0', label: 'Sin colación' },
    { value: '30', label: '30 minutos' },
    { value: '60', label: '1 hora' },
];

export type Contexto = 'ninos' | 'adulto-mayor' | 'mascotas';

/** PUBL-04 paso 3 · Contexto del hogar (el mismo de ONB-H1). */
export const CONTEXTOS: readonly CheckboxOption<Contexto>[] = [
    { value: 'ninos', label: 'Hay niños' },
    { value: 'adulto-mayor', label: 'Hay adulto mayor' },
    { value: 'mascotas', label: 'Hay mascotas' },
];

export type Tarea = 'aseo' | 'cocina' | 'lavado' | 'ninos' | 'adulto-mayor' | 'mascotas';

/** PUBL-04 paso 3 · Tareas. */
export const TAREAS: readonly CheckboxOption<Tarea>[] = [
    { value: 'aseo', label: 'Aseo' },
    { value: 'cocina', label: 'Cocina' },
    { value: 'lavado', label: 'Lavado y planchado' },
    { value: 'ninos', label: 'Cuidado de niños' },
    { value: 'adulto-mayor', label: 'Cuidado de adulto mayor' },
    { value: 'mascotas', label: 'Cuidado de mascotas' },
];

/** Unidades del sueldo del aviso. */
export const HOGAR_UNITS: readonly PayUnit[] = ['mes', 'dia'];

export const ALGO_MAS_MAX = 300;

// ─── Borrador ───────────────────────────────────────────────────────────────

export interface HogarDraft {
    kind: 'hogar';
    oficio: HogarOficio;
    modalidad: Modalidad | null;
    dias: Dia[];
    desde: string;
    hasta: string;
    /** Minutos de colación. */
    colacion: number;
    contexto: Contexto[];
    tareas: Tarea[];
    algoMas: string;
    neto: boolean;
    sueldo: number | null;
    unidad: PayUnit;
}

/** El contexto que el hogar ya contó en su perfil («Contexto del hogar: Hay niños»): no se pregunta dos veces. */
function contextoDelPerfil(actorId: DemoActorId): Contexto[] {
    const filas = getProfile(actorId)
        .perfiles.filter((p) => p.id === 'hogar')
        .flatMap((p) => p.secciones)
        .flatMap((s) => (s.tipo === 'filas' ? s.filas : []));
    const texto = filas.find((f) => f.label === 'Contexto del hogar')?.value ?? '';
    return CONTEXTOS.filter((c) => texto.includes(String(c.label).replace('Hay ', ''))).map((c) => c.value);
}

/**
 * Lo que trae el asistente al abrir. Carolina parte con lo que muestra el
 * prototipo (PUBL-04 pasos 1 a 4); cualquier otro hogar, con la plantilla
 * legal y su contexto, sin sueldo ni nota.
 */
export function initialHogar(actorId: DemoActorId): HogarDraft {
    const contexto = contextoDelPerfil(actorId);
    const base: HogarDraft = {
        kind: 'hogar',
        oficio: 'asesor-hogar',
        modalidad: 'afuera',
        dias: ['lun', 'mar', 'mie', 'jue', 'vie'],
        desde: '09:00',
        hasta: '18:00',
        colacion: 60,
        contexto,
        tareas: ['aseo', 'cocina', 'lavado', ...(contexto.includes('ninos') ? (['ninos'] as const) : [])],
        algoMas: '',
        neto: true,
        sueldo: null,
        unidad: 'mes',
    };
    if (actorId !== 'carolina') return base;
    // PUBL-04 pasos 3 y 4 de Carolina.
    return { ...base, algoMas: 'Ir a buscar al niño al colegio, a 4 cuadras de la casa.', sueldo: 600000 };
}

// ─── Validación ─────────────────────────────────────────────────────────────

export type HogarField = 'modalidad' | 'dias' | 'hasta' | 'tareas' | 'sueldo';
export type HogarErrors = Partial<Record<HogarField, string>>;

export function hogarErrors(d: HogarDraft, step: number): HogarErrors {
    const e: HogarErrors = {};
    if (step === 1 && !d.modalidad) e.modalidad = 'Elige el tipo de trabajo';
    if (step === 2) {
        if (d.dias.length === 0) e.dias = 'Elige al menos un día';
        if (sameDayMinutes(d.desde, d.hasta) <= d.colacion) e.hasta = 'La salida tiene que ser después de la entrada y la colación';
    }
    if (step === 3 && d.tareas.length === 0) e.tareas = 'Elige al menos una tarea';
    if (step === 4 && (d.sueldo === null || d.sueldo <= 0)) e.sueldo = 'Ingresa el sueldo';
    return e;
}

export function firstIncompleteHogarStep(d: HogarDraft): number | null {
    for (const step of [1, 2, 3, 4]) if (Object.keys(hogarErrors(d, step)).length) return step;
    return null;
}

// ─── Textos que se arman con lo escrito ────────────────────────────────────

const oficioLabel = (o: HogarOficio) => HOGAR_OFICIOS.find((x) => x.value === o)?.label ?? '';

/** PUBL-04 paso 1: «Asesor/a del hogar puertas afuera». */
export function hogarTitle(d: HogarDraft): string {
    const m = MODALIDADES.find((x) => x.value === d.modalidad);
    return m ? `${oficioLabel(d.oficio)} ${m.enTitulo}` : oficioLabel(d.oficio);
}

const DAY_ORDER: readonly Dia[] = DIAS.map((d) => d.value);
const lower = (d: Dia) => (DIAS.find((x) => x.value === d)?.label ?? '').toLocaleLowerCase('es-CL');

/**
 * «Lun a vie» (días seguidos), «Lun, mié y vie» (sueltos), «Sáb» (uno).
 * Los tramos de 3 o más días seguidos se dicen «de … a …».
 */
export function diasText(dias: readonly Dia[]): string {
    const sorted = DAY_ORDER.filter((d) => dias.includes(d));
    if (sorted.length === 0) return '';
    const runs: Dia[][] = [];
    for (const d of sorted) {
        const run = runs[runs.length - 1];
        const prev = run?.[run.length - 1];
        if (run && prev && DAY_ORDER.indexOf(d) === DAY_ORDER.indexOf(prev) + 1) run.push(d);
        else runs.push([d]);
    }
    const parts = runs.flatMap((r) => {
        const first = r[0];
        const last = r[r.length - 1];
        if (!first || !last) return [];
        return r.length >= 3 ? [`${lower(first)} a ${lower(last)}`] : r.map(lower);
    });
    const text = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1]}` : (parts[0] ?? '');
    return text.charAt(0).toLocaleUpperCase('es-CL') + text.slice(1);
}

/** Horas a la semana: días × (salida − entrada − colación). */
export function horasSemana(d: HogarDraft): number {
    const daily = Math.max(0, sameDayMinutes(d.desde, d.hasta) - d.colacion);
    return (d.dias.length * daily) / 60;
}

/** «40 horas». */
export const horasSemanaText = (d: HogarDraft): string => formatHours(horasSemana(d));

/** InfoTag del aviso: «Lun a vie · 09:00–18:00» y «Puertas afuera». */
export function hogarTags(d: HogarDraft): PublicationTag[] {
    const tags: PublicationTag[] = [];
    if (d.dias.length) tags.push({ kind: 'fecha', label: `${diasText(d.dias)} · ${d.desde}–${d.hasta}` });
    const m = MODALIDADES.find((x) => x.value === d.modalidad);
    if (m) tags.push({ kind: 'modalidad', label: m.tag });
    return tags;
}

/** Como hay niños, solo pueden postular personas con certificado de inhabilidades vigente (04-perfiles §5). */
export const pideInhabilidades = (d: HogarDraft): boolean => d.contexto.includes('ninos');
