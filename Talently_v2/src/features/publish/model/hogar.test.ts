import { describe, expect, it } from 'vitest';
import {
    INGRESO_MINIMO,
    LEGAL,
    bajoMinimo,
    descansoCorto,
    diasText,
    excedeJornada,
    firstIncompleteHogarStep,
    hogarErrors,
    hogarTags,
    hogarTitle,
    horasSemana,
    horasSemanaText,
    initialHogar,
    sueldoBrutoMensual,
    sueldoMinimo,
} from './hogar';

describe('aviso de Carolina (PUBL-04, flujo 5)', () => {
    const d = initialHogar('carolina');

    it('parte con lo del prototipo y el contexto de su perfil', () => {
        expect(hogarTitle(d)).toBe('Asesor/a del hogar puertas afuera');
        expect(d.contexto).toEqual(['ninos']);
        expect(d.tareas).toEqual(['aseo', 'cocina', 'lavado', 'ninos']);
        expect(d.sueldo).toBe(600000);
        expect(firstIncompleteHogarStep(d)).toBeNull();
    });

    it('son 40 horas a la semana (5 días de 9 h con 1 hora de colación)', () => {
        expect(horasSemana(d)).toBe(40);
        expect(horasSemanaText(d)).toBe('40 horas');
    });

    it('InfoTag de la tarjeta', () => {
        expect(hogarTags(d).map((t) => t.label)).toEqual(['Lun a vie · 09:00–18:00', 'Puertas afuera']);
    });

    it('otro hogar no parte con el sueldo ni la nota de Carolina', () => {
        const jorge = initialHogar('jorge');
        expect(jorge.sueldo).toBeNull();
        expect(jorge.algoMas).toBe('');
        expect(firstIncompleteHogarStep(jorge)).toBe(4);
    });
});

describe('días', () => {
    it('dice los días como se leen', () => {
        expect(diasText(['lun', 'mar', 'mie', 'jue', 'vie'])).toBe('Lun a vie');
        expect(diasText(['lun', 'mie', 'vie'])).toBe('Lun, mié y vie');
        expect(diasText(['sab'])).toBe('Sáb');
        expect(diasText(['sab', 'dom'])).toBe('Sáb y dom');
        expect(diasText(['vie', 'lun', 'mar', 'mie'])).toBe('Lun a mié y vie');
        expect(diasText([])).toBe('');
    });

    it('por días: el título lo dice', () => {
        expect(hogarTitle({ ...initialHogar('carolina'), modalidad: 'dias' })).toBe('Asesor/a del hogar por días');
    });
});

describe('validación por paso', () => {
    const d = initialHogar('carolina');
    it('pide tipo, días, horario, tareas y sueldo', () => {
        expect(hogarErrors({ ...d, modalidad: null }, 1).modalidad).toBeTruthy();
        expect(hogarErrors({ ...d, dias: [] }, 2).dias).toBeTruthy();
        expect(hogarErrors({ ...d, desde: '18:00', hasta: '09:00' }, 2).hasta).toBeTruthy();
        expect(hogarErrors({ ...d, desde: '09:00', hasta: '09:30', colacion: 60 }, 2).hasta).toBeTruthy();
        expect(hogarErrors({ ...d, tareas: [] }, 3).tareas).toBeTruthy();
        expect(hogarErrors({ ...d, sueldo: null }, 4).sueldo).toBeTruthy();
        expect(firstIncompleteHogarStep({ ...d, dias: [] })).toBe(2);
    });
});

describe('plantilla legal (05-spec §3.1, job_legal_check)', () => {
    const d = initialHogar('carolina');

    it('el sueldo de Carolina ($600.000 líquidos, 40 h) cumple el mínimo proporcional', () => {
        expect(sueldoMinimo(d)).toBeCloseTo((INGRESO_MINIMO * 40) / 42);
        expect(sueldoBrutoMensual(d)).toBeCloseTo(600000 / 0.81);
        expect(bajoMinimo(d)).toBe(false);
        expect(hogarErrors(d, 4)).toEqual({});
    });

    it('un sueldo bajo el mínimo no deja continuar, con el texto del super-prompt', () => {
        expect(hogarErrors({ ...d, sueldo: 1 }, 4).sueldo).toBe(LEGAL.sueldoMinimo);
        // Bruto se compara tal cual: $520.000 brutos por 40 h es menos que $527.193.
        expect(bajoMinimo({ ...d, neto: false, sueldo: 520000 })).toBe(true);
        expect(bajoMinimo({ ...d, neto: false, sueldo: 528000 })).toBe(false);
        // Líquido se lleva a bruto: $430.000 líquidos ≈ $530.864 brutos.
        expect(bajoMinimo({ ...d, neto: true, sueldo: 430000 })).toBe(false);
    });

    it('puertas adentro pide el mínimo completo; jornada parcial, el proporcional', () => {
        expect(sueldoMinimo({ ...d, modalidad: 'adentro' })).toBe(INGRESO_MINIMO);
        const parcial = { ...d, modalidad: 'dias' as const, dias: ['lun' as const, 'mie' as const] };
        expect(horasSemana(parcial)).toBe(16);
        expect(sueldoMinimo(parcial)).toBeCloseTo((INGRESO_MINIMO * 16) / 42);
    });

    it('un sueldo por día se lleva a un mes con los días de la semana', () => {
        const porDia = { ...d, neto: false, unidad: 'dia' as const, sueldo: 30000, dias: ['lun' as const, 'mie' as const] };
        expect(sueldoBrutoMensual(porDia)).toBeCloseTo(30000 * 2 * (52 / 12));
        expect(bajoMinimo(porDia)).toBe(false);
        expect(bajoMinimo({ ...porDia, sueldo: 10000 })).toBe(true);
    });

    it('puertas afuera sobre 42 horas avisa y no deja continuar; puertas adentro no tiene ese tope', () => {
        const sabado = { ...d, dias: [...d.dias, 'sab' as const] };
        expect(horasSemana(sabado)).toBe(48);
        expect(excedeJornada(sabado)).toBe(true);
        expect(hogarErrors(sabado, 2).horas).toBe(LEGAL.jornada);
        expect(excedeJornada({ ...sabado, modalidad: 'dias' })).toBe(true);
        expect(excedeJornada({ ...sabado, modalidad: 'adentro' })).toBe(false);
        expect(hogarErrors(d, 2)).toEqual({});
    });

    it('puertas adentro avisa si no quedan 12 horas de descanso', () => {
        const adentro = { ...d, modalidad: 'adentro' as const };
        expect(descansoCorto(adentro)).toBe(false);
        expect(descansoCorto({ ...adentro, desde: '07:00', hasta: '21:00' })).toBe(true);
        expect(descansoCorto({ ...d, desde: '07:00', hasta: '21:00' })).toBe(false);
        // Es un aviso: no bloquea.
        expect(hogarErrors({ ...adentro, dias: ['lun'], desde: '07:00', hasta: '21:00' }, 2)).toEqual({});
    });
});
