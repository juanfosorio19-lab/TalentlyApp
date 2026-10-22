import { afterEach, describe, expect, it } from 'vitest';
import { hasSubmittedIdentity, resetVerificationStore, submitIdentity } from './store';

afterEach(() => resetVerificationStore());

describe('store de identidad enviada', () => {
    it('guarda el envío por persona y no lo duplica', () => {
        expect(hasSubmittedIdentity('carolina')).toBe(false);
        submitIdentity('carolina', 1);
        submitIdentity('carolina', 2);
        expect(hasSubmittedIdentity('carolina')).toBe(true);
        expect(hasSubmittedIdentity('jorge')).toBe(false);
    });

    it('resetVerificationStore vuelve al inicio de la sesión', () => {
        submitIdentity('jorge');
        resetVerificationStore();
        expect(hasSubmittedIdentity('jorge')).toBe(false);
    });
});
