import { describe, expect, it } from 'vitest';
import { dateOptions, dayParts, formatDuration, formatHours, hhmmOf, minutesOf, sameDayMinutes, spanMinutes, timeOptions } from './time';

describe('horas', () => {
    it('convierte HH:MM a minutos y de vuelta', () => {
        expect(minutesOf('18:30')).toBe(1110);
        expect(hhmmOf(1110)).toBe('18:30');
        expect(hhmmOf(24 * 60)).toBe('00:00');
    });

    it('un bloque que termina a medianoche dura hasta ella', () => {
        expect(spanMinutes('18:00', '00:00')).toBe(360);
        expect(spanMinutes('13:00', '18:00')).toBe(300);
        expect(spanMinutes('22:00', '06:00')).toBe(480);
        expect(spanMinutes('10:00', '10:00')).toBe(0);
    });

    it('la jornada del hogar es dentro del mismo día', () => {
        expect(sameDayMinutes('09:00', '18:00')).toBe(540);
        expect(sameDayMinutes('18:00', '09:00')).toBeLessThan(0);
    });

    it('formatea duraciones y horas a la semana como el prototipo', () => {
        expect(formatDuration(360)).toBe('6 h');
        expect(formatDuration(330)).toBe('5 h 30 min');
        expect(formatDuration(30)).toBe('30 min');
        expect(formatHours(40)).toBe('40 horas');
        expect(formatHours(1)).toBe('1 hora');
        expect(formatHours(42.5)).toBe('42,5 horas');
    });

    it('ofrece las horas cada 30 minutos', () => {
        const all = timeOptions();
        expect(all).toHaveLength(48);
        expect(all[0]).toEqual({ value: '00:00', label: '00:00' });
        expect(timeOptions(30, '06:00', '07:00').map((o) => o.value)).toEqual(['06:00', '06:30', '07:00']);
    });
});

describe('fechas', () => {
    it('ofrece los días desde mañana, con el formato de las tarjetas', () => {
        const days = dateOptions('2026-12-10', 3);
        expect(days.map((d) => d.label)).toEqual(['vie 11 dic', 'sáb 12 dic', 'dom 13 dic']);
        expect(days[0]?.value).toBe('2026-12-11');
    });

    it('cruza el año sin correrse', () => {
        expect(dateOptions('2026-12-30', 2).map((d) => d.label)).toEqual(['jue 31 dic', 'vie 1 ene']);
    });

    it('da las partes de un ShiftBlock', () => {
        expect(dayParts('2026-12-19')).toEqual({ weekday: 'sáb', day: 19, month: 'dic' });
    });
});
