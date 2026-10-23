import { describe, expect, it } from 'vitest';
import {
    countEmpleoFiltros,
    countPersonaFiltros,
    countTurnoFiltros,
    EMPLEO_SIN_FILTROS,
    PERSONA_SIN_FILTROS,
    readEmpleoFiltros,
    readOficios,
    readPersonaFiltros,
    readTurnoFiltros,
    readVista,
    toggleOficio,
    TURNO_SIN_FILTROS,
    type TurnoFiltros,
    withParams,
    writeEmpleoFiltros,
    writeOficios,
    writePersonaFiltros,
    writeTurnoFiltros,
    writeVista,
} from './filters';

const url = (s = '') => new URLSearchParams(s);

describe('filtros de Explorar en la URL', () => {
    it('sin parámetros vale lo de partida de la demo (2 filtros activos: 20 km y verificadas)', () => {
        const f = readEmpleoFiltros(url('tipo=empleo'), 2);
        expect(f).toEqual({ jornadas: [], contratos: [], distancia: 20, sueldoMin: null, verificadas: true });
        expect(countEmpleoFiltros(f)).toBe(2);
        expect(readTurnoFiltros(url(), 0)).toEqual(TURNO_SIN_FILTROS);
    });

    it('quitar los filtros de partida queda escrito; volver a ellos limpia la URL', () => {
        const p = withParams(url('tipo=turno'), (n) => writeTurnoFiltros(n, TURNO_SIN_FILTROS, 2));
        expect(p.get('turno.km')).toBe('todas');
        expect(p.get('turno.verificadas')).toBe('0');
        expect(countTurnoFiltros(readTurnoFiltros(p, 2))).toBe(0);
        const back = withParams(p, (n) => writeTurnoFiltros(n, { ...TURNO_SIN_FILTROS, distancia: 20, verificadas: true }, 2));
        expect(back.toString()).toBe('tipo=turno');
    });

    it('ida y vuelta de cada segmento sin pisar los otros', () => {
        const empleo = { ...EMPLEO_SIN_FILTROS, jornadas: ['Part time' as const], distancia: 10 as const };
        const turno: TurnoFiltros = { ...TURNO_SIN_FILTROS, fechas: ['Hoy', 'Mañana'], distancia: 5, verificadas: false };
        const persona = { nota: 4.8 as const, yaTrabajaron: true };
        const p = withParams(url('tipo=empleo&p=turno-garzones-finde'), (n) => {
            writeEmpleoFiltros(n, empleo, 0);
            writeTurnoFiltros(n, turno, 0);
            writePersonaFiltros(n, persona);
        });
        expect(readEmpleoFiltros(p, 0)).toEqual(empleo);
        expect(readTurnoFiltros(p, 0)).toEqual(turno);
        expect(readPersonaFiltros(p)).toEqual(persona);
        expect(p.get('p')).toBe('turno-garzones-finde');
        expect(countPersonaFiltros(persona)).toBe(2);
        expect(readPersonaFiltros(withParams(p, (n) => writePersonaFiltros(n, PERSONA_SIN_FILTROS)))).toEqual(PERSONA_SIN_FILTROS);
    });

    it('montos mínimos: el sueldo al mes y la tarifa con su unidad, solo si hay monto', () => {
        const empleo = { ...EMPLEO_SIN_FILTROS, sueldoMin: 650000 };
        const p = withParams(url(), (n) => writeEmpleoFiltros(n, empleo, 0));
        expect(p.get('empleo.min')).toBe('650000');
        expect(readEmpleoFiltros(p, 0)).toEqual(empleo);
        expect(countEmpleoFiltros(empleo)).toBe(1);

        const turno: TurnoFiltros = { ...TURNO_SIN_FILTROS, franjas: ['noche'], tarifaMin: 8000, tarifaUnidad: 'hora' };
        const t = withParams(url(), (n) => writeTurnoFiltros(n, turno, 0));
        expect(readTurnoFiltros(t, 0)).toEqual(turno);
        expect(countTurnoFiltros(turno)).toBe(2);
        // Sin monto, la unidad no se escribe y vuelve a la de partida.
        const sinMonto = withParams(t, (n) => writeTurnoFiltros(n, { ...turno, tarifaMin: null }, 0));
        expect(sinMonto.has('turno.unidad')).toBe(false);
        expect(readTurnoFiltros(sinMonto, 0).tarifaUnidad).toBe('turno');
        expect(readEmpleoFiltros(url('empleo.min=-5'), 0).sueldoMin).toBeNull();
        expect(readEmpleoFiltros(url('empleo.min=abc'), 0).sueldoMin).toBeNull();
    });

    it('ignora valores que no existen (enlace viejo o escrito a mano)', () => {
        const p = url('empleo.km=7&empleo.jornada=Nocturna&personas.nota=3&turno.fecha=Ayer&empleo.vista=grilla');
        expect(readEmpleoFiltros(p, 1).distancia).toBe(20);
        expect(readEmpleoFiltros(p, 1).jornadas).toEqual([]);
        expect(readPersonaFiltros(p).nota).toBeNull();
        expect(readTurnoFiltros(p, 0).fechas).toEqual([]);
        expect(readVista(p, 'empleo', 'deck')).toBe('deck');
    });

    it('la vista solo se escribe si no es la de partida', () => {
        const p = withParams(url(), (n) => writeVista(n, 'empleo', 'lista', 'deck'));
        expect(p.get('empleo.vista')).toBe('lista');
        expect(readVista(p, 'personas', 'lista')).toBe('lista');
        expect(withParams(p, (n) => writeVista(n, 'empleo', 'deck', 'deck')).has('empleo.vista')).toBe(false);
    });

    it('chips de oficio: elegir, quitar y el orden de los chips', () => {
        const chips = ['Garzón', 'Bartender', 'Bodega'];
        expect(toggleOficio(chips, [], 'Bodega')).toEqual(['Bodega']);
        expect(toggleOficio(chips, ['Bodega'], 'Garzón')).toEqual(['Garzón', 'Bodega']);
        expect(toggleOficio(chips, ['Garzón', 'Bodega'], 'Garzón')).toEqual(['Bodega']);
        const p = withParams(url(), (n) => writeOficios(n, ['Garzón', 'Bodega']));
        expect(readOficios(p, chips)).toEqual(['Garzón', 'Bodega']);
        expect(readOficios(p, ['Bodega'])).toEqual(['Bodega']);
    });
});
