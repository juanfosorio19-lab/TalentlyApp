import { describe, expect, it } from 'vitest';
import {
    agregarOficio,
    agruparTelefono,
    bloquesDe,
    borradorInicial,
    buscaDe,
    correoValido,
    digitosTelefono,
    faltantes,
    mascaraFecha,
    mascaraMes,
    megas,
    mesValido,
    numeroDePaso,
    oficioConRequisitos,
    pasoAnterior,
    pasoSiguiente,
    pasosTrabajo,
    pesoLegible,
    pideNacimiento,
    quitarOficio,
    resultadoOnboarding,
    resumen,
    separarNombre,
    textoBusqueda,
    textoOficios,
    textoPago,
    textoRequisitos,
    totalPasos,
    unirConY,
    validarNacimiento,
    type OnboardingDraft,
} from './model';

const HOY = new Date(2026, 9, 22); // 22 oct 2026

function conIntenciones(draft: OnboardingDraft, intenciones: OnboardingDraft['intenciones']): OnboardingDraft {
    return { ...draft, intenciones };
}

describe('intenciones y bloques', () => {
    it('Empleo y Turnos son un solo bloque Trabajo', () => {
        expect(bloquesDe(['empleo', 'turnos'])).toEqual(['trabajo']);
    });

    it('ordena los bloques como la preselección de ONB-02', () => {
        expect(bloquesDe(['servicios', 'hogar', 'turnos', 'empresa'])).toEqual(['organizacion', 'trabajo', 'hogar', 'servicios']);
    });

    it('sin intención (paso abierto directo) muestra el bloque Trabajo completo', () => {
        expect(buscaDe([])).toEqual({ empleo: true, turnos: true });
        expect(buscaDe(['turnos'])).toEqual({ empleo: false, turnos: true });
    });

    it('pide la fecha de nacimiento solo con algo de «Quiero trabajar»', () => {
        expect(pideNacimiento(['hogar'])).toBe(false);
        expect(pideNacimiento(['hogar', 'clases'])).toBe(true);
    });

    it('N por bloque, como el prototipo (Jorge 6, Carolina 2)', () => {
        expect(totalPasos('trabajo', { empleo: true, turnos: true })).toBe(6);
        expect(totalPasos('trabajo', { empleo: false, turnos: true })).toBe(5);
        expect(totalPasos('hogar', { empleo: true, turnos: true })).toBe(2);
    });
});

describe('pasos del bloque Trabajo', () => {
    const ambos = { empleo: true, turnos: true };
    const soloTurnos = { empleo: false, turnos: true };

    it('T4 solo con requisitos y T5 solo si busca empleo', () => {
        expect(pasosTrabajo(ambos, true)).toEqual([1, 2, 3, 4, 5]);
        expect(pasosTrabajo(ambos, false)).toEqual([1, 2, 3, 5]);
        expect(pasosTrabajo(soloTurnos, true)).toEqual([1, 2, 3, 4]);
    });

    it('siguiente y anterior se saltan lo que no aplica', () => {
        expect(pasoSiguiente(3, ambos, false)).toBe(5);
        expect(pasoSiguiente(4, soloTurnos, true)).toBe('listo');
        expect(pasoSiguiente(5, ambos, true)).toBe('listo');
        expect(pasoAnterior(5, ambos, false)).toBe(3);
        expect(pasoAnterior(1, ambos, true)).toBe('datos');
    });

    it('«Paso X de N»: Tus datos es el 1 y T1 el 2', () => {
        expect(numeroDePaso(1)).toBe(2);
        expect(numeroDePaso(5)).toBe(6);
    });
});

describe('oficios', () => {
    it('agrega hasta 3, sin repetir, y el primero queda principal', () => {
        const vacio = { ...borradorInicial().trabajo, oficios: [], principal: null };
        const uno = agregarOficio(vacio, 'garzon');
        expect(uno.principal).toBe('garzon');
        expect(agregarOficio(uno, 'garzon').oficios).toHaveLength(1);
        const tres = agregarOficio(agregarOficio(uno, 'bartender'), 'barista');
        expect(agregarOficio(tres, 'cocinero').oficios).toHaveLength(3);
    });

    it('quitar el principal pasa la marca al primero que queda', () => {
        const t = borradorInicial().trabajo;
        const sin = quitarOficio(t, 'guardia-seguridad');
        expect(sin.principal).toBe('guardia-eventos');
        expect(quitarOficio(sin, 'guardia-eventos').principal).toBeNull();
    });

    it('los requisitos los define el principal si los pide', () => {
        const t = borradorInicial().trabajo;
        expect(oficioConRequisitos(t)?.id).toBe('guardia-seguridad');
        expect(oficioConRequisitos({ ...t, principal: 'guardia-eventos' })?.id).toBe('guardia-eventos');
        expect(oficioConRequisitos({ ...t, oficios: [{ id: 'garzon', experiencia: '1_3' }], principal: 'garzon' })).toBeNull();
    });
});

describe('formatos y validaciones', () => {
    it('correo', () => {
        expect(correoValido('jorge.munoz@correo.cl')).toBe(true);
        expect(correoValido('matias.rojas@correo')).toBe(false);
        expect(correoValido(' a@b.cl ')).toBe(true);
    });

    it('separa el nombre del registro', () => {
        expect(separarNombre('  Jorge   Muñoz Soto ')).toEqual({ nombre: 'Jorge', apellido: 'Muñoz Soto' });
        expect(separarNombre('Jorge')).toEqual({ nombre: 'Jorge', apellido: '' });
        expect(separarNombre('   ')).toEqual({ nombre: '', apellido: '' });
    });

    it('máscaras de fecha, mes y teléfono', () => {
        expect(mascaraFecha('14051985')).toBe('14/05/1985');
        expect(mascaraFecha('140')).toBe('14/0');
        expect(mascaraFecha('14/05/19851')).toBe('14/05/1985');
        expect(mascaraMes('032021')).toBe('03/2021');
        expect(digitosTelefono('+56 9 1234-56789')).toBe('56912345');
        expect(agruparTelefono('12345678')).toBe('1234 5678');
    });

    it('fecha de nacimiento: real, de 18 años o más', () => {
        expect(validarNacimiento('14/05/1985', HOY)).toBeNull();
        expect(validarNacimiento('14/05/2015', HOY)).toBe('menor');
        expect(validarNacimiento('31/02/1990', HOY)).toBe('invalida');
        expect(validarNacimiento('14/05', HOY)).toBe('invalida');
        expect(validarNacimiento('01/01/2030', HOY)).toBe('invalida');
        // Cumple 18 mañana: todavía no.
        expect(validarNacimiento('23/10/2008', HOY)).toBe('menor');
        expect(validarNacimiento('22/10/2008', HOY)).toBeNull();
    });

    it('mes MM/AAAA', () => {
        expect(mesValido('03/2021')).toBe(true);
        expect(mesValido('13/2021')).toBe(false);
        expect(mesValido('3/2021')).toBe(false);
    });

    it('pesos de archivo', () => {
        expect(megas(14 * 1024 * 1024 - 10)).toBe(14);
        expect(pesoLegible(320 * 1024)).toBe('320 KB');
        expect(pesoLegible(2.4 * 1024 * 1024)).toBe('2,4 MB');
    });
});

describe('resumen de ONB-99', () => {
    const jorge = conIntenciones(borradorInicial(), ['empleo', 'turnos']);

    it('une con comas e «y»', () => {
        expect(unirConY(['a'])).toBe('a');
        expect(unirConY(['a', 'b', 'c'])).toBe('a, b y c');
    });

    it('lo de Jorge en el flujo 1, igual que el prototipo', () => {
        expect(resumen(jorge)).toEqual([
            'Guardia de seguridad (principal) y Guardia de eventos',
            'Empleo y turnos: 4 franjas, hasta 20 km',
            'Sueldo, tarifa y vestimenta',
            'Sistema 4x4, de día y de noche',
            'Tu último trabajo',
        ]);
        expect(faltantes(jorge)).toEqual(['credencial', 'foto']);
    });

    it('el principal va primero aunque se haya elegido después', () => {
        expect(textoOficios({ ...jorge.trabajo, principal: 'guardia-eventos' })).toBe(
            'Guardia de eventos (principal) y Guardia de seguridad',
        );
    });

    it('solo turnos y en toda la región', () => {
        expect(textoBusqueda({ ...jorge.trabajo, radio: 'region', franjas: [{ weekday: 1, band: 'manana' }] }, { empleo: false, turnos: true })).toBe(
            'Turnos: 1 franja, en toda la región',
        );
    });

    it('pago: «Prefiero no decir», omitido o sin vestimenta', () => {
        const ambos = { empleo: true, turnos: true };
        expect(textoPago({ ...jorge.trabajo, noDecir: true }, ambos)).toBe('Pago «A convenir» y vestimenta');
        expect(textoPago({ ...jorge.trabajo, pagoOmitido: true }, ambos)).toBe('');
        expect(textoPago({ ...jorge.trabajo, vestimenta: [] }, { empleo: true, turnos: false })).toBe('Sueldo');
    });

    it('requisitos con un solo turno', () => {
        expect(textoRequisitos({ ...jorge.trabajo, diaNoche: ['noche'] })).toBe('Sistema 4x4, de noche');
    });

    it('lo subido u omitido cambia lo que falta y lo que ya está', () => {
        const conFoto = { ...jorge, datos: { ...jorge.datos, foto: 'blob:foto' } };
        const enRevision: OnboardingDraft = {
            ...conFoto,
            trabajo: {
                ...conFoto.trabajo,
                credencial: { estado: 'revision', progreso: 100, archivo: { nombre: 'credencial-spd.pdf', peso: '320 KB' } },
                experienciaOmitida: true,
            },
        };
        expect(faltantes(enRevision)).toEqual([]);
        expect(resumen(enRevision)).toContain('Credencial SPD en revisión');
        expect(resumen(enRevision)).not.toContain('Tu último trabajo');
    });

    it('sin oficio de seguridad no pide la credencial', () => {
        const garzon: OnboardingDraft = {
            ...jorge,
            trabajo: { ...jorge.trabajo, oficios: [{ id: 'garzon', experiencia: '1_3' }], principal: 'garzon' },
        };
        expect(faltantes(garzon)).toEqual(['foto']);
        expect(resumen(garzon)).not.toContain('Sistema 4x4, de día y de noche');
    });
});

describe('resultadoOnboarding (lo que ven Inicio, Perfil y VER-01 al terminar)', () => {
    it('el borrador del flujo 1: Jorge Muñoz, Puente Alto, sus oficios y la credencial por subir', () => {
        const r = resultadoOnboarding(borradorInicial());
        expect(r).toMatchObject({ nombre: 'Jorge', apellido: 'Muñoz', comuna: 'Puente Alto', foto: null, credencial: 'pendiente' });
        expect(r.oficios).toEqual([
            { nombre: 'Guardia de seguridad', experiencia: '5 a 10 años', principal: true },
            { nombre: 'Guardia de eventos', experiencia: '3 a 5 años', principal: false },
        ]);
        expect(r.ultimoTrabajo).toBe('Guardia de seguridad en Condominio Los Peumos · 2021 a 2026');
    });

    it('lo que la persona escribió manda: otro nombre, la credencial en revisión y la foto', () => {
        const d = borradorInicial();
        const r = resultadoOnboarding({
            ...d,
            datos: { ...d.datos, nombre: ' Camila ', apellido: 'Soto', foto: 'blob:foto' },
            trabajo: { ...d.trabajo, credencial: { estado: 'subiendo', progreso: 40, archivo: null }, experienciaOmitida: true },
        });
        expect(r).toMatchObject({ nombre: 'Camila', apellido: 'Soto', foto: 'blob:foto', credencial: 'revision' });
        expect(r.ultimoTrabajo).toBeUndefined();
    });
});
