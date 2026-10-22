import { describe, expect, it } from 'vitest';
import { diasText, firstIncompleteHogarStep, hogarErrors, hogarTags, hogarTitle, horasSemana, horasSemanaText, initialHogar } from './hogar';

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
