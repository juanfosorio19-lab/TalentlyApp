import { describe, expect, it } from 'vitest';
import { DEMO_ACTORS } from '../../demo/session';
import {
    addShift,
    contratacionText,
    contratacionesFor,
    credencialNote,
    emptyTurno,
    firstIncompleteTurnoStep,
    hasErrors,
    initialTurno,
    oficioOf,
    oficiosFor,
    requisitosText,
    shiftLines,
    shiftMeta,
    shiftTags,
    totalCupos,
    turnoErrors,
    turnoTemplate,
    turnoUntil,
    vestimentaText,
} from './turno';

describe('plantilla de Banquetería Rosa SpA (PUBL-03 paso 1)', () => {
    it('sale del turno del sáb 5 dic, con su tarifa', () => {
        const t = turnoTemplate('banqueteria');
        expect(t?.titulo).toBe('Garzones fin de semana');
        expect(t?.detalle).toBe('La usaste el sáb 5 dic · $35.000 líquidos por turno');
    });

    it('quien no publicó turnos parte desde cero', () => {
        expect(turnoTemplate('carolina')).toBeNull();
        const d = initialTurno('carolina');
        expect(d.inicio).toBeNull();
        expect(d.oficio).toBeNull();
    });

    it('la plantilla trae todo para llegar a la vista previa', () => {
        expect(firstIncompleteTurnoStep(initialTurno('banqueteria'))).toBeNull();
        expect(firstIncompleteTurnoStep(emptyTurno('cero'))).toBe(1);
    });
});

describe('textos de la vista previa (PUBL-03 paso 4)', () => {
    const d = initialTurno('banqueteria');

    it('InfoTag por bloque, con duración', () => {
        expect(shiftTags(d).map((t) => t.label)).toEqual(['sáb 19 dic · 18:00–00:00 (6 h)', 'dom 20 dic · 13:00–18:00 (5 h)']);
    });

    it('Resumen · Bloques y cupos', () => {
        expect(shiftLines(d)).toEqual(['sáb 19 dic · 18:00–00:00 · 8 cupos', 'dom 20 dic · 13:00–18:00 · 4 cupos']);
        expect(totalCupos(d)).toBe(12);
        expect(shiftMeta(d.bloques[0]!)).toBe('6 h · 8 cupos');
        expect(shiftMeta({ id: 'x', fecha: null, desde: '10:00', hasta: '11:00', cupos: 1 })).toBe('1 h · 1 cupo');
    });

    it('Resumen · contratación, vestimenta y requisitos como en el prototipo', () => {
        expect(contratacionText(d.contratacion)).toBe('Boleta de honorarios · Sin subordinación ni dependencia');
        expect(contratacionText('plazo-fijo')).toBe('Plazo fijo');
        expect(vestimentaText(d.vestimenta)).toBe('Camisa blanca, pantalón y zapatos negros');
        expect(requisitosText(d)).toBe('Teléfono verificado · Nota mínima 4,5');
        expect(requisitosText({ ...d, pideIdentidad: true, notaMinima: 'sin' })).toBe('Identidad verificada');
        expect(requisitosText({ ...d, oficio: 'guardia-eventos' })).toBe('Teléfono verificado · Credencial SPD (ex OS-10) · Nota mínima 4,5');
    });

    it('vestimenta con prendas sueltas', () => {
        expect(vestimentaText(['camisa-blanca'])).toBe('Camisa blanca');
        expect(vestimentaText(['camisa-blanca', 'corbata-humita'])).toBe('Camisa blanca y corbata humita');
        expect(vestimentaText(['camisa-blanca', 'pantalon-negro', 'zapatos-negros', 'corbata-humita'])).toBe(
            'Camisa blanca, pantalón y zapatos negros y corbata humita',
        );
        expect(vestimentaText([])).toBe('');
    });

    it('PUBL-07: hasta el último día del turno', () => {
        expect(turnoUntil(d)).toBe('hasta el dom 20 dic');
    });
});

describe('validación por paso', () => {
    it('paso 1: oficio y título', () => {
        const e = turnoErrors(emptyTurno('cero'), 1);
        expect(e.fields.oficio).toBeTruthy();
        expect(e.fields.titulo).toBeTruthy();
        expect(turnoErrors({ ...emptyTurno('cero'), oficio: 'garzon', titulo: 'Gar' }, 1).fields.titulo).toBe('Usa al menos 5 letras');
    });

    it('paso 2: fecha, cupos, horario y un bloque por día', () => {
        const d = initialTurno('banqueteria');
        expect(hasErrors(turnoErrors(d, 2))).toBe(false);
        const dup = { ...d, bloques: [d.bloques[0]!, { ...d.bloques[1]!, fecha: d.bloques[0]!.fecha }] };
        expect(turnoErrors(dup, 2).bloques.b2?.fecha).toMatch(/Un bloque por día/);
        const bad = { ...d, bloques: [{ ...d.bloques[0]!, cupos: null, hasta: '18:00' }] };
        expect(turnoErrors(bad, 2).bloques.b1).toEqual({ cupos: 'Ingresa los cupos', hasta: 'Elige una hora distinta a la de inicio' });
    });

    it('paso 3: tarifa, contratación, punto de encuentro y dirección', () => {
        const e = turnoErrors(emptyTurno('cero'), 3);
        expect(Object.keys(e.fields).sort()).toEqual(['contratacion', 'direccion', 'puntoEncuentro', 'tarifa']);
    });
});

describe('bloques y diccionarios', () => {
    it('«Agregar otro bloque» parte el día siguiente con el mismo horario', () => {
        const next = addShift(initialTurno('banqueteria').bloques);
        expect(next).toHaveLength(3);
        expect(next[2]).toEqual({ id: 'b3', fecha: '2026-12-21', desde: '13:00', hasta: '18:00', cupos: 4 });
        expect(addShift([])).toEqual([{ id: 'b1', fecha: null, desde: '18:00', hasta: '00:00', cupos: null }]);
    });

    it('sin evento esporádico no se ofrece la boleta', () => {
        expect(contratacionesFor(false).map((c) => c.label)).toEqual(['Plazo fijo', 'Por obra', 'Part time']);
        expect(contratacionesFor(true)).toHaveLength(5);
    });

    it('un hogar solo publica turnos para un evento en su casa', () => {
        expect(oficiosFor(DEMO_ACTORS.carolina).map((o) => o.value)).toEqual(['garzon', 'banquetero', 'bartender', 'anfitrion', 'cocinero']);
        expect(oficiosFor(DEMO_ACTORS.banqueteria).length).toBeGreaterThan(5);
    });

    it('dice qué credencial pide el oficio', () => {
        expect(credencialNote(oficioOf('garzon'))).toBe('Garzón o garzona no tiene credenciales obligatorias.');
        expect(credencialNote(oficioOf('guardia-eventos'))).toMatch(/^Guardia de eventos pide Credencial SPD/);
        expect(credencialNote(undefined)).toBeNull();
    });

    it('ninguna etiqueta es un slug', () => {
        for (const o of oficiosFor(DEMO_ACTORS.banqueteria)) expect(o.label).not.toMatch(/-|_/);
    });
});
