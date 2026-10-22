import { describe, expect, it } from 'vitest';
import {
    credentialSlug,
    credentialsFromRows,
    firstMissing,
    identityStatusOf,
    nextStep,
    organizationLevels,
    parseStep,
    personLevels,
    phoneVerifiedOf,
    previousStep,
    safeReturnPath,
    stepNumber,
    isPhoto,
    type CaptureStep,
} from './model';

const taken = (...steps: CaptureStep[]) => new Set<CaptureStep>(steps);

describe('identityStatusOf', () => {
    it('enviada en la sesión queda en revisión aunque los datos digan otra cosa', () => {
        expect(identityStatusOf({ inData: false, pendingAtStart: false, submitted: true })).toBe('review');
        expect(identityStatusOf({ inData: true, pendingAtStart: true, submitted: true })).toBe('review');
    });
    it('verificada en los datos, salvo que el flujo la muestre antes (Carolina, flujo 5)', () => {
        expect(identityStatusOf({ inData: true, pendingAtStart: false, submitted: false })).toBe('verified');
        expect(identityStatusOf({ inData: true, pendingAtStart: true, submitted: false })).toBe('pending');
        expect(identityStatusOf({ inData: false, pendingAtStart: false, submitted: false })).toBe('pending');
    });
});

describe('phoneVerifiedOf', () => {
    it('Matías parte sin teléfono y lo verifica en la sesión (flujo 2)', () => {
        expect(phoneVerifiedOf({ inData: true, pendingAtStart: true, verifiedInSession: false })).toBe(false);
        expect(phoneVerifiedOf({ inData: true, pendingAtStart: true, verifiedInSession: true })).toBe(true);
    });
    it('Jorge recién registrado no lo tiene hasta verificarlo', () => {
        expect(phoneVerifiedOf({ inData: false, pendingAtStart: false, verifiedInSession: false })).toBe(false);
        expect(phoneVerifiedOf({ inData: false, pendingAtStart: false, verifiedInSession: true })).toBe(true);
    });
});

describe('personLevels', () => {
    const base = { cuentaDesde: '14 mar 2025', hogar: true };

    it('todo verificado: tres niveles hechos, sin acciones', () => {
        const levels = personLevels({
            ...base,
            phone: { verified: true, fecha: '2 dic 2026' },
            identity: { status: 'verified', fecha: 'hoy' },
        });
        expect(levels.map((l) => [l.label, l.status, l.date])).toEqual([
            ['Cuenta básica', 'done', 'Desde el 14 mar 2025'],
            ['Teléfono verificado', 'done', 'Verificado el 2 dic 2026'],
            ['Identidad verificada', 'done', 'Verificado hoy'],
        ]);
        expect(levels.some((l) => l.action)).toBe(false);
    });

    it('Jorge recién registrado: el teléfono es el actual con la acción principal y la identidad queda pendiente', () => {
        const levels = personLevels({
            cuentaDesde: 'hoy',
            hogar: false,
            phone: { verified: false, fecha: 'hoy' },
            identity: { status: 'pending', fecha: 'hoy' },
        });
        expect(levels[0]?.date).toBe('Desde hoy');
        expect(levels[1]).toMatchObject({ status: 'current', date: 'Pendiente', action: { kind: 'telefono', primary: true } });
        expect(levels[2]).toMatchObject({ status: 'pending', action: { kind: 'identidad', primary: false } });
        expect(levels.filter((l) => l.action?.primary)).toHaveLength(1);
        expect(levels.filter((l) => l.status === 'current')).toHaveLength(1);
    });

    it('la identidad que falta dice para qué sirve según el perfil (hogar o trabajo)', () => {
        const input = { cuentaDesde: 'hoy', phone: { verified: true, fecha: 'hoy' }, identity: { status: 'pending' as const, fecha: 'hoy' } };
        expect(personLevels({ ...input, hogar: true })[2]?.description).toBe('Verifica tu identidad para recibir a alguien en tu casa.');
        expect(personLevels({ ...input, hogar: false })[2]?.description).toContain('«Identidad verificada»');
        expect(personLevels({ ...input, hogar: true })[2]).toMatchObject({ status: 'current', action: { primary: true } });
    });

    it('identidad enviada: «En revisión», sin acción y sin quitarle el actual al teléfono', () => {
        const levels = personLevels({
            ...base,
            phone: { verified: false, fecha: 'hoy' },
            identity: { status: 'review', fecha: 'hoy' },
        });
        expect(levels[2]).toMatchObject({ status: 'review', date: 'En revisión · te avisamos en menos de 24 h' });
        expect(levels[2]?.action).toBeUndefined();
        expect(levels[1]?.status).toBe('current');
    });
});

describe('organizationLevels', () => {
    it('una organización verificada dice cuándo y qué permite', () => {
        expect(organizationLevels('28 nov 2026')).toEqual([
            {
                id: 'organizacion',
                status: 'done',
                label: 'Organización verificada',
                date: 'Verificada el 28 nov 2026',
                description: 'Publicar empleos y turnos.',
            },
        ]);
        expect(organizationLevels(undefined)[0]).toMatchObject({ status: 'current', date: 'Pendiente' });
    });
});

describe('credenciales', () => {
    it('credentialSlug quita tildes y signos', () => {
        expect(credentialSlug('Credencial SPD (ex OS-10)')).toBe('credencial-spd-ex-os-10');
        expect(credentialSlug('Curso de manipulación de alimentos')).toBe('curso-de-manipulacion-de-alimentos');
    });

    it('se sube lo que falta, salvo el certificado de antecedentes (se comparte en el chat)', () => {
        const creds = credentialsFromRows([
            { label: 'Credencial SPD (ex OS-10)', badge: 'Verificada', detalle: 'Vence 03/2028' },
            { label: 'Certificado de antecedentes', badge: 'Recomendado', detalle: 'Si quieres, lo compartes tú en el chat después del match.' },
            { label: 'Curso de manipulación de alimentos', badge: 'Recomendado', detalle: 'Algunas organizaciones lo piden.' },
        ]);
        expect(creds.map((c) => c.upload)).toEqual([false, false, true]);
        expect(creds[0]).toMatchObject({ badge: 'Verificada', detalle: 'Vence 03/2028', tipo: 'credencial-spd-ex-os-10' });
    });
});

describe('pasos de VER-02', () => {
    it('parseStep acepta solo los pasos conocidos', () => {
        expect(parseStep(null)).toBe('inicio');
        expect(parseStep('dorso')).toBe('dorso');
        expect(parseStep('otro')).toBe('inicio');
    });

    it('previousStep vuelve de a uno y sale desde el inicio', () => {
        expect(previousStep('selfie')).toBe('dorso');
        expect(previousStep('dorso')).toBe('frente');
        expect(previousStep('frente')).toBe('inicio');
        expect(previousStep('inicio')).toBeNull();
    });

    it('nextStep salta a la siguiente foto que falta y termina en la selfie', () => {
        expect(nextStep('frente', taken('frente'))).toBe('dorso');
        expect(nextStep('dorso', taken('frente', 'dorso'))).toBe('selfie');
        expect(nextStep('frente', taken('frente', 'dorso'))).toBe('selfie');
        expect(nextStep('frente', taken('frente', 'dorso', 'selfie'))).toBe('selfie');
        expect(nextStep('selfie', taken('selfie'))).toBe('selfie');
    });

    it('firstMissing dice qué foto falta para enviar', () => {
        expect(firstMissing(taken())).toBe('frente');
        expect(firstMissing(taken('frente', 'selfie'))).toBe('dorso');
        expect(firstMissing(taken('frente', 'dorso', 'selfie'))).toBeNull();
    });

    it('stepNumber e isPhoto', () => {
        expect(stepNumber('frente')).toBe(1);
        expect(stepNumber('selfie')).toBe(3);
        expect(isPhoto({ type: 'image/jpeg' })).toBe(true);
        expect(isPhoto({ type: 'application/pdf' })).toBe(false);
    });
});

describe('safeReturnPath', () => {
    const self = '/verificacion/identidad';
    it('acepta rutas internas con su query', () => {
        expect(safeReturnPath('/publicar/hogar/5', self)).toBe('/publicar/hogar/5');
        expect(safeReturnPath('/publicar/hogar/5?identidad=enviada', self)).toBe('/publicar/hogar/5?identidad=enviada');
    });
    it('rechaza otras webs, rutas relativas y la misma VER-02', () => {
        expect(safeReturnPath(null, self)).toBeNull();
        expect(safeReturnPath('https://otro.cl', self)).toBeNull();
        expect(safeReturnPath('//otro.cl/x', self)).toBeNull();
        expect(safeReturnPath('/\\otro.cl', self)).toBeNull();
        expect(safeReturnPath('publicar', self)).toBeNull();
        expect(safeReturnPath('/verificacion/identidad?paso=frente', self)).toBeNull();
    });
});
