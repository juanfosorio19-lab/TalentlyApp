import { describe, expect, it } from 'vitest';
import { borradorInicial, type OnboardingDraft } from './model';
import { leerBorrador, serializarBorrador, sinVolatiles } from './persist';

function conCambios(): OnboardingDraft {
    const base = borradorInicial();
    return {
        ...base,
        cuenta: { nombre: 'Ana Pérez', correo: 'ana@correo.cl', acepta: true },
        intenciones: ['empleo', 'turnos'],
        bloque: 'trabajo',
        datos: { ...base.datos, nombre: 'Ana', apellido: 'Pérez', comuna: null, foto: 'blob:foto', fotoSubiendo: true },
        trabajo: {
            ...base.trabajo,
            principal: 'guardia-eventos',
            sueldo: null,
            tarifa: 45000,
            noDecir: false,
            credencial: { estado: 'revision', progreso: 100, archivo: { nombre: 'credencial.pdf', peso: '1,2 MB' } },
        },
        retomar: '/onboarding/trabajo/3',
    };
}

describe('sinVolatiles', () => {
    it('quita la foto (object URL) y la subida de la foto en curso', () => {
        const limpio = sinVolatiles(conCambios());
        expect(limpio.datos.foto).toBeNull();
        expect(limpio.datos.fotoSubiendo).toBe(false);
    });

    it('una credencial a medio subir vuelve a pedirse; una en revisión se conserva', () => {
        const draft = conCambios();
        const subiendo: OnboardingDraft = {
            ...draft,
            trabajo: { ...draft.trabajo, credencial: { estado: 'subiendo', progreso: 40, archivo: { nombre: 'a.pdf', peso: '1 MB' } } },
        };
        expect(sinVolatiles(subiendo).trabajo.credencial).toEqual({ estado: 'pendiente', progreso: 0, archivo: null });
        expect(sinVolatiles(draft).trabajo.credencial.estado).toBe('revision');
    });
});

describe('serializarBorrador / leerBorrador', () => {
    it('lo guardado vuelve igual, sin lo volátil', () => {
        const draft = conCambios();
        expect(leerBorrador(serializarBorrador(draft))).toEqual(sinVolatiles(draft));
    });

    it('respeta los campos que quedaron sin elegir (null)', () => {
        const leido = leerBorrador(serializarBorrador(conCambios()));
        expect(leido?.datos.comuna).toBeNull();
        expect(leido?.trabajo.sueldo).toBeNull();
        expect(leido?.trabajo.tarifa).toBe(45000);
        expect(leido?.retomar).toBe('/onboarding/trabajo/3');
    });

    it('nunca guarda una contraseña ni la foto', () => {
        const texto = serializarBorrador(conCambios());
        expect(texto).not.toContain('blob:');
        expect(texto.toLowerCase()).not.toContain('clave');
    });

    it('sin nada guardado, dañado o de otra versión: null', () => {
        expect(leerBorrador(null)).toBeNull();
        expect(leerBorrador('')).toBeNull();
        expect(leerBorrador('{no es json')).toBeNull();
        expect(leerBorrador(JSON.stringify({ v: 99, draft: conCambios() }))).toBeNull();
        expect(leerBorrador(JSON.stringify({ v: 1 }))).toBeNull();
        expect(leerBorrador(JSON.stringify([1, 2]))).toBeNull();
    });

    it('lo que falta o no calza queda como al empezar', () => {
        const base = borradorInicial();
        const leido = leerBorrador(
            JSON.stringify({
                v: 1,
                draft: {
                    cuenta: { nombre: 42, correo: 'ana@correo.cl' },
                    datos: { nombre: null, telefono: '912345678' },
                    trabajo: { oficios: 'guardia', movilizacion: 'sí' },
                },
            }),
        );
        expect(leido?.cuenta).toEqual({ nombre: base.cuenta.nombre, correo: 'ana@correo.cl', acepta: false });
        expect(leido?.datos.nombre).toBe(base.datos.nombre);
        expect(leido?.datos.telefono).toBe('912345678');
        expect(leido?.trabajo.oficios).toEqual(base.trabajo.oficios);
        expect(leido?.trabajo.movilizacion).toBe(base.trabajo.movilizacion);
        expect(leido?.retomar).toBeNull();
    });

    it('descarta intenciones que no existen', () => {
        const leido = leerBorrador(JSON.stringify({ v: 1, draft: { intenciones: ['empleo', 'astronauta', 'hogar'] } }));
        expect(leido?.intenciones).toEqual(['empleo', 'hogar']);
    });
});
