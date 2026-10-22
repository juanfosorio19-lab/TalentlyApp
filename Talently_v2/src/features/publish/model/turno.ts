// PUBL-03 · Publicar turno: el borrador, sus diccionarios, la plantilla de
// Banquetería Rosa SpA, la validación por paso y los textos que se arman con
// lo escrito (vista previa y resumen). Lógica pura: turno.test.ts.
import { formatAmount, type PayUnit } from '../../../ui/Amount';
import type { ChipGroupOption } from '../../../ui/ChipGroup';
import type { PublicationTag } from '../../../ui/PublicationCard';
import type { SheetPickerOption } from '../../../ui/SheetPicker';
import { getPublication } from '../../demo/data';
import type { DemoActor } from '../../demo/session';
import { addDays, formatDay, formatDuration, spanMinutes, type IsoDate } from './time';

// ─── Diccionarios ───────────────────────────────────────────────────────────

/** Un oficio que se publica por turno (04-perfiles §3, modo T). */
export interface TurnoOficio extends SheetPickerOption {
    /** Credencial obligatoria del oficio («Credencial SPD (ex OS-10)»). */
    credencial?: string;
    /** El hogar solo publica turnos para un evento en su casa (PUBL-01 «Turno para un evento»). */
    evento?: boolean;
}

const SPD = 'Credencial SPD (ex OS-10)';

/** Los oficios con modo turno del diccionario (04-perfiles §3), con sus sinónimos de búsqueda. */
export const OFICIOS_TURNO: readonly TurnoOficio[] = [
    { value: 'garzon', label: 'Garzón o garzona', keywords: ['mesero', 'mesera', 'camarero'], evento: true },
    { value: 'banquetero', label: 'Banquetero/a', keywords: ['banquetería', 'garzón de eventos', 'catering'], evento: true },
    { value: 'bartender', label: 'Bartender', keywords: ['barman', 'coctelero'], evento: true },
    { value: 'anfitrion', label: 'Anfitrión o anfitriona', keywords: ['hostess', 'recepcionista de eventos'], evento: true },
    { value: 'cocinero', label: 'Cocinero/a', keywords: ['cocinera', 'chef'], evento: true },
    { value: 'ayudante-cocina', label: 'Ayudante de cocina', keywords: ['auxiliar de cocina'] },
    { value: 'copero', label: 'Copero/a', keywords: ['lavaplatos'] },
    { value: 'barista', label: 'Barista', keywords: ['cafetero'] },
    { value: 'montaje-eventos', label: 'Montaje de eventos', keywords: ['montajista', 'staff de eventos'] },
    { value: 'camarero-pisos', label: 'Camarero/a de pisos', keywords: ['camarera de hotel', 'housekeeping'] },
    { value: 'promotor', label: 'Promotor/a', keywords: ['promotora', 'impulsadora', 'degustadora'] },
    { value: 'vendedor', label: 'Vendedor/a', keywords: ['vendedora', 'dependiente'] },
    { value: 'cajero', label: 'Cajero/a', keywords: ['cajera', 'caja'] },
    { value: 'reponedor', label: 'Reponedor/a', keywords: ['repositor'] },
    { value: 'guardia-eventos', label: 'Guardia de eventos', keywords: ['seguridad de eventos'], credencial: SPD },
    { value: 'guardia-seguridad', label: 'Guardia de seguridad', keywords: ['guardia', 'OS10', 'OS-10', 'nochero'], credencial: SPD },
    { value: 'rondin', label: 'Rondín', keywords: ['guardia rondín', 'rondas'], credencial: SPD },
    { value: 'conserje', label: 'Conserje o mayordomo', keywords: ['mayordomo de edificio', 'portero'] },
];

/** Los oficios que puede publicar este actor: el hogar, solo los de un evento en su casa. */
export function oficiosFor(actor: DemoActor): readonly TurnoOficio[] {
    return actor.kind === 'organizacion' ? OFICIOS_TURNO : OFICIOS_TURNO.filter((o) => o.evento);
}

export const oficioOf = (value: string | null): TurnoOficio | undefined => OFICIOS_TURNO.find((o) => o.value === value);

export type Contratacion = 'plazo-fijo' | 'por-obra' | 'part-time' | 'boleta-honorarios' | 'boleta-terceros';

/** PUBL-03 paso 3 · Forma de contratación, en el orden del prototipo. */
export const CONTRATACIONES: readonly ChipGroupOption<Contratacion>[] = [
    { value: 'plazo-fijo', label: 'Plazo fijo' },
    { value: 'por-obra', label: 'Por obra' },
    { value: 'part-time', label: 'Part time' },
    { value: 'boleta-honorarios', label: 'Boleta de honorarios' },
    { value: 'boleta-terceros', label: 'Boleta de terceros' },
];

const BOLETAS: readonly Contratacion[] = ['boleta-honorarios', 'boleta-terceros'];

export const isBoleta = (c: Contratacion | null): boolean => c !== null && BOLETAS.includes(c);

/** Un turno que se repite (como en bodega) no se paga con boleta: sin «evento esporádico», no se ofrecen. */
export function contratacionesFor(esporadico: boolean): readonly ChipGroupOption<Contratacion>[] {
    return esporadico ? CONTRATACIONES : CONTRATACIONES.filter((c) => !isBoleta(c.value));
}

export type Vestimenta = 'camisa-blanca' | 'pantalon-negro' | 'zapatos-negros' | 'corbata-humita';

/** PUBL-03 paso 3 · Vestimenta (la del prototipo, para garzones y banqueteros). */
export const VESTIMENTAS: readonly ChipGroupOption<Vestimenta>[] = [
    { value: 'camisa-blanca', label: 'Camisa blanca' },
    { value: 'pantalon-negro', label: 'Pantalón negro' },
    { value: 'zapatos-negros', label: 'Zapatos negros' },
    { value: 'corbata-humita', label: 'Corbata humita' },
];

/** Nota mínima para postular. Las opciones distintas de 4,5 no están en el prototipo. */
export const NOTAS_MINIMAS: readonly SheetPickerOption[] = [
    { value: 'sin', label: 'Sin nota mínima' },
    { value: '4,0', label: '4,0' },
    { value: '4,5', label: '4,5' },
    { value: '4,8', label: '4,8' },
];

/** Unidades de la tarifa de un turno. */
export const TURNO_UNITS: readonly PayUnit[] = ['turno', 'hora', 'dia'];

// ─── Borrador ───────────────────────────────────────────────────────────────

export interface ShiftDraft {
    id: string;
    fecha: IsoDate | null;
    desde: string;
    hasta: string;
    cupos: number | null;
}

export interface TurnoDraft {
    kind: 'turno';
    /** Cómo empezó: desde su plantilla o desde cero. `null` si el actor no tiene plantilla. */
    inicio: 'plantilla' | 'cero' | null;
    oficio: string | null;
    titulo: string;
    bloques: ShiftDraft[];
    /** Líquido (true) o bruto. */
    neto: boolean;
    tarifa: number | null;
    unidad: PayUnit;
    esporadico: boolean;
    contratacion: Contratacion | null;
    vestimenta: Vestimenta[];
    puntoEncuentro: string;
    direccion: string;
    pideIdentidad: boolean;
    notaMinima: string;
    notaPostulantes: string;
}

/** La plantilla sale del turno que la organización ya publicó (PUBL-03 paso 1: «La usaste el sáb 5 dic»). */
export interface TurnoTemplate {
    titulo: string;
    /** «La usaste el sáb 5 dic · $35.000 líquidos por turno». */
    detalle: string;
    draft: TurnoDraft;
}

/** El turno del sáb 5 dic, la plantilla «Garzones fin de semana» de Banquetería Rosa SpA (PUBL-03 paso 1). */
const TEMPLATE_SOURCE: Partial<Record<DemoActor['id'], string>> = { banqueteria: 'turno-garzones-finde-5dic' };

/**
 * Lo que trae la plantilla, tal como se ve en los pasos del prototipo
 * (PUBL-03 pasos 1 a 3). Las fechas son las del turno nuevo (sáb 19 y dom
 * 20 dic) y la dirección exacta solo está en el prototipo.
 */
function templateDraft(): TurnoDraft {
    return {
        kind: 'turno',
        inicio: 'plantilla',
        oficio: 'garzon',
        titulo: 'Garzones fin de semana',
        bloques: [
            { id: 'b1', fecha: '2026-12-19', desde: '18:00', hasta: '00:00', cupos: 8 },
            { id: 'b2', fecha: '2026-12-20', desde: '13:00', hasta: '18:00', cupos: 4 },
        ],
        neto: true,
        tarifa: 35000,
        unidad: 'turno',
        esporadico: true,
        contratacion: 'boleta-honorarios',
        vestimenta: ['camisa-blanca', 'pantalon-negro', 'zapatos-negros'],
        puntoEncuentro: 'Metro San Miguel',
        direccion: 'Gran Avenida 5530, San Miguel',
        pideIdentidad: false,
        notaMinima: '4,5',
        notaPostulantes: '',
    };
}

/** La plantilla del actor, si ya publicó un turno parecido. */
export function turnoTemplate(actorId: DemoActor['id']): TurnoTemplate | null {
    const sourceId = TEMPLATE_SOURCE[actorId];
    const source = sourceId ? getPublication(sourceId) : undefined;
    if (!source || source.tipo !== 'turno') return null;
    const b = source.bloques[0];
    const cuando = b ? `La usaste el ${b.weekday} ${b.day} ${b.month}` : 'Ya la usaste';
    const monto = source.monto ? ` · ${formatAmount({ value: source.monto.value, unit: source.monto.unit, net: source.monto.net })}` : '';
    return { titulo: source.titulo, detalle: `${cuando}${monto}`, draft: { ...templateDraft(), titulo: source.titulo } };
}

/** «Empezar desde cero»: el oficio, el título y todo lo demás por completar. */
export function emptyTurno(inicio: TurnoDraft['inicio']): TurnoDraft {
    return {
        kind: 'turno',
        inicio,
        oficio: null,
        titulo: '',
        bloques: [newShift('b1', null)],
        neto: true,
        tarifa: null,
        unidad: 'turno',
        esporadico: true,
        contratacion: null,
        vestimenta: [],
        puntoEncuentro: '',
        direccion: '',
        pideIdentidad: false,
        notaMinima: 'sin',
        notaPostulantes: '',
    };
}

/** Con qué parte el asistente: la plantilla si la hay; si no, desde cero. */
export function initialTurno(actorId: DemoActor['id']): TurnoDraft {
    return turnoTemplate(actorId)?.draft ?? emptyTurno(null);
}

function newShift(id: string, fecha: IsoDate | null, from?: ShiftDraft): ShiftDraft {
    return { id, fecha, desde: from?.desde ?? '18:00', hasta: from?.hasta ?? '00:00', cupos: from?.cupos ?? null };
}

/** «Agregar otro bloque»: el día siguiente al último, con su mismo horario y cupos. */
export function addShift(bloques: readonly ShiftDraft[]): ShiftDraft[] {
    const last = bloques[bloques.length - 1];
    const used = new Set(bloques.map((b) => b.id));
    let n = bloques.length + 1;
    while (used.has(`b${n}`)) n++;
    const fecha = last?.fecha ? addDays(last.fecha, 1) : null;
    return [...bloques, newShift(`b${n}`, fecha, last)];
}

// ─── Validación ─────────────────────────────────────────────────────────────

export type TurnoField = 'oficio' | 'titulo' | 'tarifa' | 'contratacion' | 'puntoEncuentro' | 'direccion';
export type ShiftField = 'fecha' | 'hasta' | 'cupos';

export interface TurnoErrors {
    fields: Partial<Record<TurnoField, string>>;
    /** Por id de bloque. */
    bloques: Record<string, Partial<Record<ShiftField, string>>>;
}

export const TITLE_MIN = 5;
export const TITLE_MAX = 90;
export const CUPOS_MAX = 99;

export function shiftErrors(b: ShiftDraft, all: readonly ShiftDraft[]): Partial<Record<ShiftField, string>> {
    const e: Partial<Record<ShiftField, string>> = {};
    if (!b.fecha) e.fecha = 'Elige la fecha';
    else if (all.some((o) => o.id !== b.id && o.fecha === b.fecha && all.indexOf(o) < all.indexOf(b)))
        e.fecha = 'Ya hay un bloque ese día. Un bloque por día.';
    if (spanMinutes(b.desde, b.hasta) === 0) e.hasta = 'Elige una hora distinta a la de inicio';
    if (b.cupos === null || b.cupos < 1) e.cupos = 'Ingresa los cupos';
    else if (b.cupos > CUPOS_MAX) e.cupos = `Hasta ${CUPOS_MAX}`;
    return e;
}

/** Los errores de un paso (1 a 3; la vista previa y el tipo de publicación no piden nada). */
export function turnoErrors(d: TurnoDraft, step: number): TurnoErrors {
    const fields: TurnoErrors['fields'] = {};
    const bloques: TurnoErrors['bloques'] = {};
    if (step === 1) {
        if (!d.oficio) fields.oficio = 'Elige el oficio';
        const t = d.titulo.trim();
        if (!t) fields.titulo = 'Escribe un título';
        else if (t.length < TITLE_MIN) fields.titulo = `Usa al menos ${TITLE_MIN} letras`;
    }
    if (step === 2) {
        for (const b of d.bloques) {
            const e = shiftErrors(b, d.bloques);
            if (Object.keys(e).length) bloques[b.id] = e;
        }
    }
    if (step === 3) {
        if (d.tarifa === null || d.tarifa <= 0) fields.tarifa = 'Ingresa la tarifa';
        if (!d.contratacion) fields.contratacion = 'Elige la forma de contratación';
        if (!d.puntoEncuentro.trim()) fields.puntoEncuentro = 'Escribe un punto de encuentro';
        if (!d.direccion.trim()) fields.direccion = 'Escribe la dirección exacta';
    }
    return { fields, bloques };
}

export const hasErrors = (e: TurnoErrors): boolean => Object.keys(e.fields).length > 0 || Object.keys(e.bloques).length > 0;

/** El primer paso que falta completar (para no saltarse pasos con un enlace), o `null`. */
export function firstIncompleteTurnoStep(d: TurnoDraft): number | null {
    for (const step of [1, 2, 3]) if (hasErrors(turnoErrors(d, step))) return step;
    if (d.bloques.length === 0) return 2;
    return null;
}

// ─── Textos que se arman con lo escrito ────────────────────────────────────

/** Bloques con fecha, ordenados por día. */
export function datedShifts(d: TurnoDraft): Array<ShiftDraft & { fecha: IsoDate }> {
    return d.bloques
        .filter((b): b is ShiftDraft & { fecha: IsoDate } => b.fecha !== null)
        .slice()
        .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export const cuposText = (n: number): string => `${n} ${n === 1 ? 'cupo' : 'cupos'}`;

/** InfoTag de la tarjeta: «sáb 19 dic · 18:00–00:00 (6 h)». */
export function shiftTags(d: TurnoDraft): PublicationTag[] {
    return datedShifts(d).map((b) => ({
        kind: 'fecha',
        label: `${formatDay(b.fecha)} · ${b.desde}–${b.hasta} (${formatDuration(spanMinutes(b.desde, b.hasta))})`,
    }));
}

/** Resumen · Bloques: «sáb 19 dic · 18:00–00:00 · 8 cupos». */
export function shiftLines(d: TurnoDraft): string[] {
    return datedShifts(d).map((b) => `${formatDay(b.fecha)} · ${b.desde}–${b.hasta} · ${cuposText(b.cupos ?? 0)}`);
}

/** ShiftBlock del paso 2: «6 h · 8 cupos». */
export function shiftMeta(b: ShiftDraft): string {
    return [formatDuration(spanMinutes(b.desde, b.hasta)), b.cupos ? cuposText(b.cupos) : null].filter(Boolean).join(' · ');
}

export const totalCupos = (d: TurnoDraft): number => d.bloques.reduce((n, b) => n + (b.cupos ?? 0), 0);

/** PUBL-07: «hasta el dom 20 dic» (el último día del turno). */
export function turnoUntil(d: TurnoDraft): string | null {
    const last = datedShifts(d).pop();
    return last ? `hasta el ${formatDay(last.fecha)}` : null;
}

/** Resumen · Forma de contratación: «Boleta de honorarios · Sin subordinación ni dependencia». */
export function contratacionText(c: Contratacion | null): string {
    const label = CONTRATACIONES.find((o) => o.value === c)?.label ?? '';
    return isBoleta(c) ? `${label} · Sin subordinación ni dependencia` : label;
}

const lowerFirst = (s: string) => s.charAt(0).toLocaleLowerCase('es-CL') + s.slice(1);

/** «Zapatos negros» → { noun: 'zapatos', adj: 'negros' }. */
function splitGarment(label: string): { noun: string; adj: string } {
    const words = lowerFirst(label).split(' ');
    const adj = words.length > 1 ? (words.pop() ?? '') : '';
    return { noun: words.join(' '), adj };
}

/** «negro» y «negros» son el mismo color. */
const sameColor = (a: string, b: string) => a !== '' && a.replace(/s$/, '') === b.replace(/s$/, '');

/**
 * Resumen · Vestimenta, como se diría: «Camisa blanca, pantalón y zapatos
 * negros». Las prendas seguidas del mismo color comparten el adjetivo, en
 * plural; las demás se separan con coma y la última con «y».
 */
export function vestimentaText(values: readonly Vestimenta[]): string {
    const labels = VESTIMENTAS.filter((v) => values.includes(v.value)).map((v) => v.label);
    const groups: { nouns: string[]; adj: string }[] = [];
    for (const label of labels) {
        const { noun, adj } = splitGarment(label);
        const prev = groups[groups.length - 1];
        if (prev && sameColor(prev.adj, adj)) {
            prev.nouns.push(noun);
            prev.adj = adj.endsWith('s') ? adj : `${adj}s`;
        } else {
            groups.push({ nouns: [noun], adj });
        }
    }
    const phrases = groups.map((g) => `${g.nouns.join(' y ')}${g.adj ? ` ${g.adj}` : ''}`);
    let text = '';
    phrases.forEach((p, i) => {
        if (i === 0) text = p;
        else if (i === phrases.length - 1 && !p.includes(' y ')) text += ` y ${p}`;
        else text += `, ${p}`;
    });
    return text.charAt(0).toLocaleUpperCase('es-CL') + text.slice(1);
}

/** Resumen · Requisitos: «Teléfono verificado · Nota mínima 4,5». */
export function requisitosText(d: TurnoDraft): string {
    const parts = [d.pideIdentidad ? 'Identidad verificada' : 'Teléfono verificado'];
    const credencial = oficioOf(d.oficio)?.credencial;
    if (credencial) parts.push(credencial);
    if (d.notaMinima !== 'sin') parts.push(`Nota mínima ${d.notaMinima}`);
    return parts.join(' · ');
}

/** «Se verá así: $35.000 líquidos por turno», o nada sin monto. */
export function amountPreview(value: number | null, unit: PayUnit, net: boolean): string | undefined {
    if (value === null || value <= 0) return undefined;
    return `Se verá así: ${formatAmount({ value, unit, net })}`;
}

/** Requisitos · lo que pide el oficio: «Garzón o garzona no tiene credenciales obligatorias.». */
export function credencialNote(oficio: TurnoOficio | undefined): string | null {
    if (!oficio) return null;
    return oficio.credencial
        ? `${oficio.label} pide ${oficio.credencial}: solo podrán postular personas con la credencial vigente.`
        : `${oficio.label} no tiene credenciales obligatorias.`;
}
