// «Turnos por día» del perfil ↔ celdas de AvailabilityGrid (PRF-03 usa la
// misma grilla que el onboarding ONB-T2). El perfil lo muestra como texto:
//   «Vie noche · Sáb tarde y noche · Dom tarde»   (un día por tramo)
//   «Jue a dom · tarde y noche»                    (un rango de días y sus franjas)
// Cuando vuelva Supabase, las celdas son las filas de worker_shift_availability
// y este texto lo arma la pantalla; el parseo desaparece.
import type { AvailabilityBand, AvailabilityCell, AvailabilityWeekday } from '../../ui/AvailabilityGrid';

const DAYS: readonly string[] = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
const BANDS: Record<string, AvailabilityBand> = { mañana: 'manana', tarde: 'tarde', noche: 'noche', madrugada: 'madrugada' };
const BAND_TEXT: Record<AvailabilityBand, string> = { manana: 'mañana', tarde: 'tarde', noche: 'noche', madrugada: 'madrugada' };
const BAND_ORDER: readonly AvailabilityBand[] = ['manana', 'tarde', 'noche', 'madrugada'];

const lower = (s: string) => s.trim().toLocaleLowerCase('es-CL');
const dayOf = (s: string): AvailabilityWeekday | null => {
    const i = DAYS.indexOf(lower(s));
    return i === -1 ? null : ((i + 1) as AvailabilityWeekday);
};

/** «tarde y noche», «mañana, tarde y noche» → franjas. */
function bandsOf(text: string): AvailabilityBand[] | null {
    const parts = lower(text).split(/\s*,\s*|\s+y\s+/).filter(Boolean);
    const bands = parts.map((p) => BANDS[p]).filter((b): b is AvailabilityBand => b !== undefined);
    return bands.length > 0 && bands.length === parts.length ? bands : null;
}

function range(from: AvailabilityWeekday, to: AvailabilityWeekday): AvailabilityWeekday[] {
    const out: AvailabilityWeekday[] = [];
    for (let d = from; d <= to; d++) out.push(d as AvailabilityWeekday);
    return out;
}

/** Texto del perfil → celdas. Lo que no se entiende se ignora (la grilla parte con lo que sí). */
export function parseShiftDays(text: string): AvailabilityCell[] {
    const cells = new Map<string, AvailabilityCell>();
    const add = (days: AvailabilityWeekday[], bands: AvailabilityBand[]) => {
        for (const weekday of days) for (const band of bands) cells.set(`${weekday}-${band}`, { weekday, band });
    };
    const segments = text.split('·').map((s) => s.trim()).filter(Boolean);
    let pendingDays: AvailabilityWeekday[] | null = null;
    for (const seg of segments) {
        // Franjas solas, después de un rango: «Jue a dom · tarde y noche».
        const onlyBands = bandsOf(seg);
        if (onlyBands && pendingDays) {
            add(pendingDays, onlyBands);
            pendingDays = null;
            continue;
        }
        const m = /^(\S+)(?:\s+a\s+(\S+))?(?:\s+(.+))?$/u.exec(seg);
        const from = m?.[1] ? dayOf(m[1]) : null;
        if (!m || !from) continue;
        const to = m[2] ? dayOf(m[2]) : from;
        if (!to || to < from) continue;
        const days = range(from, to);
        const bands = m[3] ? bandsOf(m[3]) : null;
        if (bands) add(days, bands);
        else pendingDays = days;
    }
    return [...cells.values()].sort((a, b) => a.weekday - b.weekday || BAND_ORDER.indexOf(a.band) - BAND_ORDER.indexOf(b.band));
}

function bandsText(bands: readonly AvailabilityBand[]): string {
    const words = BAND_ORDER.filter((b) => bands.includes(b)).map((b) => BAND_TEXT[b]);
    return words.length > 1 ? `${words.slice(0, -1).join(', ')} y ${words[words.length - 1]}` : (words[0] ?? '');
}

const dayLabel = (d: AvailabilityWeekday) => {
    const s = DAYS[d - 1] ?? '';
    return s.charAt(0).toLocaleUpperCase('es-CL') + s.slice(1);
};

/**
 * Celdas → texto del perfil. Tres o más días seguidos con las mismas franjas
 * van como rango («Jue a dom · tarde y noche»); el resto, día por día.
 */
export function formatShiftDays(cells: readonly AvailabilityCell[]): string {
    const byDay = new Map<AvailabilityWeekday, AvailabilityBand[]>();
    for (const c of cells) byDay.set(c.weekday, [...(byDay.get(c.weekday) ?? []), c.band]);
    const days = [...byDay.keys()].sort((a, b) => a - b);
    const bandsOfDay = (d: AvailabilityWeekday) => bandsText(byDay.get(d) ?? []);
    // Tramos de días seguidos con las mismas franjas.
    const runs: { days: AvailabilityWeekday[]; bands: string }[] = [];
    for (const d of days) {
        const last = runs[runs.length - 1];
        const prev = last?.days[last.days.length - 1];
        if (last && prev !== undefined && d === prev + 1 && last.bands === bandsOfDay(d)) last.days.push(d);
        else runs.push({ days: [d], bands: bandsOfDay(d) });
    }
    const out: string[] = [];
    for (const run of runs) {
        const first = run.days[0];
        const last = run.days[run.days.length - 1];
        if (first === undefined || last === undefined) continue;
        if (run.days.length >= 3) out.push(`${dayLabel(first)} a ${lower(dayLabel(last))}`, run.bands);
        else for (const d of run.days) out.push(`${dayLabel(d)} ${run.bands}`);
    }
    return out.join(' · ');
}
