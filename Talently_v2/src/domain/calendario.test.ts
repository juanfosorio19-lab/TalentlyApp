import { describe, expect, it } from 'vitest';
import { buildIcs } from './calendario';

describe('buildIcs', () => {
    const now = new Date(Date.UTC(2026, 11, 10, 13, 0, 0));
    const ics = buildIcs(
        {
            uid: 'turno-123',
            title: 'Turno · Garzón, Banquetería Rosa SpA',
            start: '2026-12-12T18:00',
            end: '2026-12-13T00:00',
            location: 'Metro Los Dominicos; Las Condes',
        },
        now,
    );

    it('trae los campos obligatorios de RFC 5545', () => {
        expect(ics).toContain('UID:turno-123@talently.app');
        expect(ics).toContain('DTSTAMP:20261210T130000Z');
        expect(ics).toContain('DTSTART:20261212T180000');
        expect(ics).toContain('DTEND:20261213T000000');
    });

    it('escapa comas y punto y coma, y usa CRLF', () => {
        expect(ics).toContain('SUMMARY:Turno · Garzón\\, Banquetería Rosa SpA');
        expect(ics).toContain('LOCATION:Metro Los Dominicos\\; Las Condes');
        expect(ics.split('\r\n').length).toBeGreaterThan(10);
        expect(ics.includes('\n') && !ics.replace(/\r\n/g, '').includes('\n')).toBe(true);
    });

    it('corta las líneas largas en 75 octetos', () => {
        const long = buildIcs({ uid: 'x', title: 'Á'.repeat(80), start: '2026-12-12T18:00', end: '2026-12-12T19:00' }, now);
        for (const line of long.split('\r\n')) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    });
});
