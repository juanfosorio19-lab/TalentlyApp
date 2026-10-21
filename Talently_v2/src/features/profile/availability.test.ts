import { describe, expect, it } from 'vitest';
import { formatShiftDays, parseShiftDays } from './availability';

describe('Turnos por día ↔ AvailabilityGrid', () => {
    it('lee y vuelve a escribir el texto de Jorge (un día por tramo)', () => {
        const text = 'Vie noche · Sáb tarde y noche · Dom tarde';
        const cells = parseShiftDays(text);
        expect(cells).toEqual([
            { weekday: 5, band: 'noche' },
            { weekday: 6, band: 'tarde' },
            { weekday: 6, band: 'noche' },
            { weekday: 7, band: 'tarde' },
        ]);
        expect(formatShiftDays(cells)).toBe(text);
    });

    it('lee y vuelve a escribir un rango de días (Matías)', () => {
        const text = 'Jue a dom · tarde y noche';
        const cells = parseShiftDays(text);
        expect(cells).toHaveLength(8);
        expect(formatShiftDays(cells)).toBe(text);
    });

    it('dos días seguidos iguales no se juntan en rango; tres franjas llevan coma', () => {
        expect(
            formatShiftDays([
                { weekday: 1, band: 'manana' },
                { weekday: 1, band: 'tarde' },
                { weekday: 1, band: 'noche' },
                { weekday: 2, band: 'madrugada' },
                { weekday: 3, band: 'madrugada' },
            ]),
        ).toBe('Lun mañana, tarde y noche · Mar madrugada · Mié madrugada');
    });

    it('sin celdas queda vacío y lo que no entiende se ignora', () => {
        expect(formatShiftDays([])).toBe('');
        expect(parseShiftDays('Cuando puedo')).toEqual([]);
    });
});
