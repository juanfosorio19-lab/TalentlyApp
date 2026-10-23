import { afterEach, describe, expect, it } from 'vitest';
import { cvInData, getCv, getProfileState, profileKey, resetProfileState, saveCv, saveProfileTabs } from './profileState';

afterEach(() => resetProfileState());

describe('perfil de la sesión (demo/profileState)', () => {
    it('el CV de los datos: Pedro lo tiene; Jorge no (PRF-01 «Sube tu CV»)', () => {
        expect(cvInData('pedro')).toBeDefined();
        expect(cvInData('jorge')).toBeUndefined();
        expect(cvInData('banqueteria')).toBeUndefined();
        expect(getCv('pedro')).toEqual(cvInData('pedro'));
    });

    it('el CV subido en PRF-01 vale para Inicio y DET-02; recién registrado va aparte', () => {
        saveCv('jorge', { nombre: 'CV Jorge Muñoz.pdf', detalle: '180 KB' });
        expect(getCv('jorge')).toEqual({ nombre: 'CV Jorge Muñoz.pdf', detalle: '180 KB' });
        expect(getCv('jorge', true)).toBeUndefined();
        saveCv('jorge', { nombre: 'CV nuevo.pdf', detalle: '90 KB' }, true);
        expect(getCv('jorge', true)).toEqual({ nombre: 'CV nuevo.pdf', detalle: '90 KB' });
        // Recién registrado no trae el CV de los datos.
        expect(getCv('pedro', true)).toBeUndefined();
    });

    it('las secciones editadas se guardan por perfil (recién registrado, aparte)', () => {
        expect(profileKey('jorge')).toBe('jorge');
        expect(profileKey('jorge', true)).toBe('jorge:nuevo');
        saveProfileTabs('jorge:nuevo', []);
        expect(getProfileState().tabs.get('jorge:nuevo')).toEqual([]);
        expect(getProfileState().tabs.has('jorge')).toBe(false);
    });
});
