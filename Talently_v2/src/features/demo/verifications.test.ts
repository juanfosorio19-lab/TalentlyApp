import { afterEach, describe, expect, it } from 'vitest';
import { getIdentityStatus, resetSession, submitIdentity } from './sessionStore';
import { identityInData, identityPendingAtStart, phoneInData, verificationDetail, verificationOf } from './verifications';

afterEach(() => resetSession());

describe('identidad de la sesión (VER-01, VER-02, PUBL-04, Perfil)', () => {
    it('Carolina parte sin verificar (flujo 5); el resto, según sus datos', () => {
        expect(identityPendingAtStart('carolina')).toBe(true);
        expect(identityPendingAtStart('rosa')).toBe(false);
        expect(getIdentityStatus('carolina', true)).toBe('pending');
        expect(getIdentityStatus('rosa', true)).toBe('verified');
        expect(getIdentityStatus('jorge', false)).toBe('pending');
    });

    it('al enviar queda en revisión, una vez por persona', () => {
        submitIdentity('carolina', 1);
        submitIdentity('carolina', 2);
        expect(getIdentityStatus('carolina', true)).toBe('review');
        expect(getIdentityStatus('jorge', false)).toBe('pending');
    });

    it('resetSession vuelve al inicio de la sesión', () => {
        submitIdentity('jorge');
        resetSession();
        expect(getIdentityStatus('jorge', false)).toBe('pending');
    });

    it('lo que traen los datos: Carolina y Rosa tienen identidad; la identidad supone el teléfono', () => {
        expect(identityInData('carolina')).toBe(true);
        expect(identityInData('carolina', true)).toBe(false);
        expect(identityInData('jorge')).toBe(false);
        expect(getIdentityStatus('carolina')).toBe('pending');
        expect(getIdentityStatus('rosa')).toBe('verified');
        expect(phoneInData('carolina')).toBe(true);
        expect(phoneInData('jorge', true)).toBe(false);
    });
});

describe('una sola fecha por verificación (hoja «Verificación de …»)', () => {
    it('como el sistema de diseño: «Código SMS · 2 dic 2026»', () => {
        const telefono = verificationOf('jorge', 'Teléfono verificado');
        expect(telefono && verificationDetail(telefono)).toBe('Código SMS · 2 dic 2026');
        const spd = verificationOf('jorge', 'Credencial SPD verificada');
        expect(spd && verificationDetail(spd)).toBe('Credencial revisada · vence 03/2028');
        const org = verificationOf('banqueteria', 'Organización verificada');
        expect(org && verificationDetail(org)).toBe('RUT y documentos revisados · 28 nov 2026');
        expect(verificationDetail({ label: 'Otra', status: 'verified' })).toBeUndefined();
    });
});
