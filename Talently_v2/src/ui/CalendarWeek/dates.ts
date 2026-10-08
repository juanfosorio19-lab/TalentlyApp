// Fechas de la Agenda y del SlotPicker como día civil «AAAA-MM-DD», sin hora
// ni zona: un día nunca se corre por la zona horaria del teléfono. Los textos
// siguen el README del sistema («12 dic», «sáb 12 dic · 19:00»).

/** Día civil en formato ISO: «2026-12-12». */
export type IsoDate = string;

const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'] as const;
const WEEKDAYS_LONG = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'] as const;
const MONTHS = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
] as const;
const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'] as const;

interface DayParts {
    year: number;
    /** 0 = enero. */
    month: number;
    day: number;
    /** 0 = domingo. */
    weekday: number;
}

function partsOf(iso: IsoDate): DayParts {
    const [y = 1970, m = 1, d = 1] = iso.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return { year: date.getUTCFullYear(), month: date.getUTCMonth(), day: date.getUTCDate(), weekday: date.getUTCDay() };
}

const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase('es-CL') + s.slice(1);

/** Suma (o resta) días: `addDays('2026-12-31', 1)` → «2027-01-01». */
export function addDays(iso: IsoDate, days: number): IsoDate {
    const { year, month, day } = partsOf(iso);
    return new Date(Date.UTC(year, month, day + days)).toISOString().slice(0, 10);
}

/** El lunes de la semana del día (las semanas de la Agenda van de lunes a domingo). */
export function startOfWeek(iso: IsoDate): IsoDate {
    return addDays(iso, -((partsOf(iso).weekday + 6) % 7));
}

/** Número del día del mes: 12. */
export function dayOfMonth(iso: IsoDate): number {
    return partsOf(iso).day;
}

/** Día de la semana abreviado: «sáb». */
export function weekdayShort(iso: IsoDate): string {
    return WEEKDAYS[partsOf(iso).weekday] ?? '';
}

/** «sáb 12 dic». */
export function formatDayShort(iso: IsoDate): string {
    const p = partsOf(iso);
    return `${WEEKDAYS[p.weekday]} ${p.day} ${MONTHS_SHORT[p.month]}`;
}

/** «sáb 12 de diciembre» (nombre accesible de un día). */
export function formatDayLong(iso: IsoDate): string {
    const p = partsOf(iso);
    return `${WEEKDAYS[p.weekday]} ${p.day} de ${MONTHS[p.month]}`;
}

/** «Sábado 12 de diciembre». */
export function formatDayFull(iso: IsoDate): string {
    const p = partsOf(iso);
    return capitalize(`${WEEKDAYS_LONG[p.weekday]} ${p.day} de ${MONTHS[p.month]}`);
}

/** «Marzo 2027»; si el tramo cruza de mes, «Marzo y abril 2027» o «Diciembre 2026 y enero 2027». */
export function formatMonthRange(from: IsoDate, to: IsoDate = from): string {
    const a = partsOf(from);
    const b = partsOf(to);
    if (a.year === b.year && a.month === b.month) return capitalize(`${MONTHS[a.month]} ${a.year}`);
    if (a.year === b.year) return capitalize(`${MONTHS[a.month]} y ${MONTHS[b.month]} ${a.year}`);
    return capitalize(`${MONTHS[a.month]} ${a.year} y ${MONTHS[b.month]} ${b.year}`);
}

/** «7 al 13 de diciembre»; si cruza de mes, «28 de diciembre al 3 de enero». */
export function formatDayRange(from: IsoDate, to: IsoDate): string {
    const a = partsOf(from);
    const b = partsOf(to);
    return a.month === b.month
        ? `${a.day} al ${b.day} de ${MONTHS[b.month]}`
        : `${a.day} de ${MONTHS[a.month]} al ${b.day} de ${MONTHS[b.month]}`;
}
