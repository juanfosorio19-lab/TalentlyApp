// Fechas y horas de los asistentes de publicar (PUBL-03 paso 2, PUBL-04
// paso 2). Días civiles «AAAA-MM-DD» (los de CalendarWeek, sin zona horaria)
// y horas «HH:MM». Todo es lógica pura: se prueba en time.test.ts.
import { addDays, dayOfMonth, formatDayShort, weekdayShort, type IsoDate } from '../../../ui/CalendarWeek';
import type { SheetPickerOption } from '../../../ui/SheetPicker';

/**
 * Hoy en la demo (demo/README: «hoy en la demo es jue 10 dic 2026»).
 * Pedido en «requests» como constante ISO de demo/data.
 */
export const DEMO_TODAY_ISO: IsoDate = '2026-12-10';

/** Cuántos días hacia adelante se puede publicar un turno. no está en el prototipo. */
const DAYS_AHEAD = 60;

const MINUTES_PER_DAY = 24 * 60;

/** «18:30» → 1110. */
export function minutesOf(hhmm: string): number {
    const [h = 0, m = 0] = hhmm.split(':').map(Number);
    return h * 60 + m;
}

/** 1110 → «18:30» (dentro del día). */
export function hhmmOf(minutes: number): string {
    const m = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/** Horas del día cada `stepMin` minutos, desde `from` hasta `to` incluidas: «00:00», «00:30»… */
export function timeOptions(stepMin = 30, from = '00:00', to = '23:30'): SheetPickerOption[] {
    const out: SheetPickerOption[] = [];
    for (let m = minutesOf(from); m <= minutesOf(to); m += stepMin) {
        const t = hhmmOf(m);
        out.push({ value: t, label: t });
    }
    return out;
}

/** Días que se pueden elegir para un bloque: desde mañana, «vie 11 dic», «sáb 12 dic»… */
export function dateOptions(today: IsoDate = DEMO_TODAY_ISO, days = DAYS_AHEAD): SheetPickerOption[] {
    return Array.from({ length: days }, (_, i) => {
        const iso = addDays(today, i + 1);
        return { value: iso, label: formatDayShort(iso) };
    });
}

/**
 * Minutos de un bloque. Si termina a la hora de inicio o antes, cruza la
 * medianoche (18:00–00:00 = 6 h). Igual inicio y término = 0 (no es un bloque).
 */
export function spanMinutes(desde: string, hasta: string): number {
    return (minutesOf(hasta) - minutesOf(desde) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

/** Minutos dentro del mismo día (jornada del hogar): negativo o 0 si «Hasta» no va después de «Desde». */
export function sameDayMinutes(desde: string, hasta: string): number {
    return minutesOf(hasta) - minutesOf(desde);
}

/** 360 → «6 h» · 330 → «5 h 30 min» · 30 → «30 min». */
export function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} min`;
    return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** 40 → «40 horas» · 1 → «1 hora» · 42.5 → «42,5 horas». */
export function formatHours(hours: number): string {
    const rounded = Math.round(hours * 10) / 10;
    const text = String(rounded).replace('.', ',');
    return `${text} ${rounded === 1 ? 'hora' : 'horas'}`;
}

/** Las partes de un día para ShiftBlock: «sáb», 19, «dic». */
export function dayParts(iso: IsoDate): { weekday: string; day: number; month: string } {
    const month = formatDayShort(iso).split(' ')[2] ?? '';
    return { weekday: weekdayShort(iso), day: dayOfMonth(iso), month };
}

/** «sáb 19 dic» (el formato de las tarjetas y de los bloques). */
export function formatDay(iso: IsoDate): string {
    return formatDayShort(iso);
}

export { addDays };
export type { IsoDate };
