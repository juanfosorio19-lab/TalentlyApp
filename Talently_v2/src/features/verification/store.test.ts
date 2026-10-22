import { afterEach, describe, expect, it } from 'vitest';
import { getIdentityStatus, identityPendingAtStart, resetVerificationStore, submitIdentity } from './store';

afterEach(() => resetVerificationStore());

describe('store de identidad', () => {
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

    it('resetVerificationStore vuelve al inicio de la sesión', () => {
        submitIdentity('jorge');
        resetVerificationStore();
        expect(getIdentityStatus('jorge', false)).toBe('pending');
    });
});
