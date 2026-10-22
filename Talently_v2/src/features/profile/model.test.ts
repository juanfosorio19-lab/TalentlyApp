import { describe, expect, it } from 'vitest';
import { paths } from '../../app/paths';
import { getProfile } from '../demo/data';
import { DEMO_ACTORS } from '../demo/session';
import type { DemoProfileTab } from '../demo/types';
import {
    composeProfile,
    editAction,
    findEditable,
    recienRegistradoProfile,
    resolveTab,
    sectionSlug,
    tipAction,
    trabaja,
    verificationDetail,
    visibleLinks,
} from './model';

describe('trabaja (PRF-12 solo para quien trabaja)', () => {
    it('empleo o turnos sí; hogar, sin perfiles u organización no', () => {
        expect(trabaja(DEMO_ACTORS.jorge)).toBe(true);
        expect(trabaja(DEMO_ACTORS.matias)).toBe(true);
        expect(trabaja(DEMO_ACTORS.carolina)).toBe(false);
        expect(trabaja(DEMO_ACTORS.rosa)).toBe(false);
        expect(trabaja(DEMO_ACTORS.banqueteria)).toBe(false);
    });
});

describe('composeProfile', () => {
    it('sin el teléfono verificado en la sesión, Matías no muestra la insignia ni la cuenta como verificada', () => {
        const base = getProfile('matias');
        const before = composeProfile(base, { phoneVerified: false });
        expect(before.asiTeVen.verificaciones.map((v) => v.label)).not.toContain('Teléfono verificado');
        expect(before.enlaces.find((l) => l.id === 'verificacion')?.detalle).toBe('Aún no verificas nada');

        const after = composeProfile(base, { phoneVerified: true });
        expect(after.asiTeVen.verificaciones.map((v) => v.label)).toContain('Teléfono verificado');
        expect(after.enlaces.find((l) => l.id === 'verificacion')?.detalle).toBe('Teléfono verificado');
    });

    it('usa los perfiles editados en la sesión sin tocar los datos de la demostración', () => {
        const base = getProfile('jorge');
        const tabs: DemoProfileTab[] = base.perfiles.map((t) => ({ ...t, completitud: undefined }));
        const shown = composeProfile(base, { phoneVerified: true, tabs });
        expect(shown.perfiles.every((t) => t.completitud === undefined)).toBe(true);
        expect(getProfile('jorge').perfiles[0]?.completitud).toBeDefined();
    });
});

describe('recienRegistradoProfile (INI-01-jorge-nuevo)', () => {
    const nuevo = recienRegistradoProfile(getProfile('jorge'));

    it('no tiene insignias ni reseñas que todavía no tiene', () => {
        expect(nuevo.asiTeVen.verificaciones).toEqual([]);
        expect(nuevo.asiTeVen.notas).toEqual([{ rol: 'Trabajo', nota: null }]);
        expect(nuevo.enlaces.find((l) => l.id === 'verificacion')?.detalle).toBe('Aún no verificas nada');
    });

    it('solo el perfil de trabajo, con lo que capturó el onboarding y la credencial SPD como lo que falta', () => {
        expect(nuevo.perfiles.map((t) => t.id)).toEqual(['trabajo']);
        const [trabajo] = nuevo.perfiles;
        expect(trabajo?.completitud?.titulo).toBe('Te falta la credencial SPD');
        const titulos = trabajo?.secciones.map((s) => s.titulo);
        expect(titulos).toEqual(['Oficios y experiencia', 'Disponibilidad', 'Pretensión', 'Credenciales', 'CV']);
        const oficios = trabajo?.secciones[0];
        expect(oficios?.tipo === 'filas' && oficios.filas.map((r) => r.value)).toContain(
            'Guardia de seguridad en Condominio Los Peumos · 2021 a 2026',
        );
        const credenciales = trabajo?.secciones[3];
        expect(credenciales?.tipo === 'filas' && credenciales.filas[0]?.badge).toBe('Obligatoria');
    });
});

describe('resolveTab (?perfil=)', () => {
    const { perfiles } = getProfile('jorge');
    it('elige el pedido o, si no existe, el primero', () => {
        expect(resolveTab(perfiles, 'hogar')?.id).toBe('hogar');
        expect(resolveTab(perfiles, null)?.id).toBe('trabajo');
        expect(resolveTab(perfiles, 'clases')?.id).toBe('trabajo');
        expect(resolveTab([], 'hogar')).toBeUndefined();
    });
});

describe('visibleLinks', () => {
    it('Rosa sin perfiles: ni «Mis perfiles» ni «Agregar un perfil» (va en el estado vacío) ni Impulsa', () => {
        const ids = visibleLinks(getProfile('rosa'), DEMO_ACTORS.rosa).map((l) => l.id);
        expect(ids).toEqual(['verificacion']);
    });
    it('Jorge: todos, con Impulsa', () => {
        const ids = visibleLinks(getProfile('jorge'), DEMO_ACTORS.jorge).map((l) => l.id);
        expect(ids).toEqual(['agregar', 'verificacion', 'mis-perfiles', 'impulsa']);
    });
    it('Carolina (solo hogar) no ve Impulsa', () => {
        expect(visibleLinks(getProfile('carolina'), DEMO_ACTORS.carolina).map((l) => l.id)).not.toContain('impulsa');
    });
});

describe('tipAction', () => {
    it('CV aquí mismo; identidad a VER-02; credencial o curso a VER-01', () => {
        expect(tipAction({ titulo: 'Te falta 1 cosa', texto: '', accion: 'Subir CV en PDF' })).toEqual({ kind: 'cv' });
        expect(tipAction({ titulo: 'Te falta 1 cosa', texto: '', accion: 'Verificar identidad' })).toEqual({
            kind: 'path',
            path: paths.verificarIdentidad(),
        });
        expect(tipAction({ titulo: 'Te falta la credencial SPD', texto: '', accion: 'Subir credencial' })).toEqual({
            kind: 'path',
            path: paths.verificacion(),
        });
        expect(tipAction({ titulo: 'Te falta 1 cosa', texto: '', accion: 'Subir curso' })).toEqual({
            kind: 'path',
            path: paths.verificacion(),
        });
    });
});

describe('secciones en la URL (?sheet=editar&s=)', () => {
    it('sectionSlug quita tildes, mayúsculas y espacios', () => {
        expect(sectionSlug('Sobre mí')).toBe('sobre-mi');
        expect(sectionSlug('Oficios y experiencia')).toBe('oficios-y-experiencia');
        expect(sectionSlug('Pretensión')).toBe('pretension');
        expect(sectionSlug('Qué necesitas')).toBe('que-necesitas');
    });

    it('findEditable solo encuentra lo que se edita en la hoja', () => {
        const [trabajo] = getProfile('jorge').perfiles;
        if (!trabajo) throw new Error('sin perfil de trabajo');
        expect(findEditable(trabajo, 'sobre-mi')?.section.titulo).toBe('Sobre mí');
        expect(findEditable(trabajo, 'disponibilidad')?.index).toBe(2);
        expect(findEditable(trabajo, 'credenciales')).toBeUndefined();
        expect(findEditable(trabajo, 'cv')).toBeUndefined();
        expect(findEditable(trabajo, 'no-existe')).toBeUndefined();
        expect(findEditable(trabajo, null)).toBeUndefined();
    });

    it('editAction: CV a su hoja, Credenciales a VER-01, el resto a PRF-03', () => {
        const [trabajo] = getProfile('jorge').perfiles;
        const byTitle = (t: string) => trabajo?.secciones.find((s) => s.titulo === t);
        const sobreMi = byTitle('Sobre mí');
        const credenciales = byTitle('Credenciales');
        const cv = byTitle('CV');
        expect(sobreMi && editAction(sobreMi)).toBe('editar');
        expect(credenciales && editAction(credenciales)).toBe('verificacion');
        expect(editAction({ tipo: 'archivo', titulo: 'CV', nombre: 'cv.pdf', detalle: '180 KB', editable: true })).toBe('cv');
        expect(cv && editAction(cv)).toBeNull();
    });
});

describe('verificationDetail', () => {
    it('une las insignias o dice que aún no hay', () => {
        expect(verificationDetail([])).toBe('Aún no verificas nada');
        expect(
            verificationDetail([
                { label: 'Teléfono verificado', status: 'verified' },
                { label: 'Credencial SPD verificada', status: 'verified' },
            ]),
        ).toBe('Teléfono verificado · Credencial SPD verificada');
    });
});
