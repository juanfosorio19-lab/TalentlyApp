import { describe, expect, it } from 'vitest';
import { paths } from '../../app/paths';
import { getProfile } from '../demo/data';
import { DEMO_ACTORS } from '../demo/session';
import type { DemoActorId, DemoProfile, DemoProfileTab } from '../demo/types';
import { IDENTITY_TIP } from './mock';
import {
    composeProfile,
    editAction,
    findEditable,
    orgComuna,
    profileSheetApplies,
    recienRegistradoProfile,
    resolveTab,
    sectionSlug,
    tipAction,
    trabaja,
    verificationDetail,
    verificationDetails,
    visibleLinks,
    withoutSessionTips,
    withPrototypeData,
    type SessionProfileState,
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

const NADA: SessionProfileState = {
    phoneVerifiedInSession: false,
    phonePendingAtStart: false,
    identityPendingAtStart: false,
    identitySubmitted: false,
};
const labels = (p: DemoProfile) => p.asiTeVen.verificaciones.map((v) => v.label);
const verificacionLink = (p: DemoProfile) => p.enlaces.find((l) => l.id === 'verificacion')?.detalle;

describe('composeProfile', () => {
    it('sin el teléfono verificado en la sesión, Matías no muestra la insignia ni la cuenta como verificada', () => {
        const base = getProfile('matias');
        const before = composeProfile(base, { ...NADA, phonePendingAtStart: true });
        expect(labels(before)).not.toContain('Teléfono verificado');
        expect(verificacionLink(before)).toBe('Aún no verificas nada');

        const after = composeProfile(base, { ...NADA, phonePendingAtStart: true, phoneVerifiedInSession: true });
        expect(labels(after)).toEqual(['Teléfono verificado']);
        expect(verificacionLink(after)).toBe('Teléfono verificado');
    });

    it('Jorge recién registrado gana «Teléfono verificado» al verificarlo en VER-01', () => {
        const nuevo = recienRegistradoProfile(getProfile('jorge'));
        expect(labels(composeProfile(nuevo, NADA))).toEqual([]);
        const after = composeProfile(nuevo, { ...NADA, phoneVerifiedInSession: true });
        expect(after.asiTeVen.verificaciones).toEqual([{ label: 'Teléfono verificado', status: 'verified' }]);
        expect(verificacionLink(after)).toBe('Teléfono verificado');
    });

    it('verificar en la sesión un teléfono que ya estaba no lo repite', () => {
        const shown = composeProfile(getProfile('jorge'), { ...NADA, phoneVerifiedInSession: true });
        expect(labels(shown)).toEqual(['Teléfono verificado', 'Credencial SPD verificada']);
    });

    it('Carolina, con la identidad pendiente: teléfono verificado (VER-01) y el Hogar le pide verificarla', () => {
        const base = withPrototypeData(getProfile('carolina'));
        const pending = composeProfile(base, { ...NADA, identityPendingAtStart: true });
        expect(labels(pending)).toEqual(['Teléfono verificado']);
        expect(verificacionLink(pending)).toBe('Teléfono verificado');
        const hogar = pending.perfiles.find((t) => t.id === 'hogar');
        expect(hogar?.completitud).toBe(IDENTITY_TIP);
        // La misma tarjeta del Hogar de Jorge, que lleva a VER-02.
        expect(hogar?.completitud).toEqual(getProfile('jorge').perfiles.find((t) => t.id === 'hogar')?.completitud);
        expect(hogar?.completitud && tipAction(hogar.completitud)).toEqual({ kind: 'path', path: paths.verificarIdentidad() });
    });

    it('Carolina después de enviar VER-02: identidad en revisión, sin la tarjeta', () => {
        const base = withPrototypeData(getProfile('carolina'));
        const sent = composeProfile(base, { ...NADA, identityPendingAtStart: true, identitySubmitted: true });
        expect(sent.asiTeVen.verificaciones).toEqual([
            { label: 'Teléfono verificado', status: 'verified' },
            { label: 'Identidad en revisión', status: 'review' },
        ]);
        expect(sent.perfiles.find((t) => t.id === 'hogar')?.completitud).toBeUndefined();
    });

    it('Rosa no parte con la identidad pendiente: la conserva', () => {
        expect(labels(composeProfile(withPrototypeData(getProfile('rosa')), NADA))).toEqual(['Identidad verificada']);
    });

    it('usa los perfiles editados en la sesión sin tocar los datos de la demostración', () => {
        const base = getProfile('jorge');
        const tabs: DemoProfileTab[] = base.perfiles.map((t) => ({ ...t, completitud: undefined }));
        const shown = composeProfile(base, { ...NADA, tabs });
        expect(shown.perfiles.every((t) => t.completitud === undefined)).toBe(true);
        expect(getProfile('jorge').perfiles[0]?.completitud).toBeDefined();
    });

    it('«Así te ven» dice la comuna guardada en «Datos de la organización»', () => {
        const base = getProfile('banqueteria');
        const tabs = base.perfiles.map((t) => ({
            ...t,
            secciones: t.secciones.map((s) =>
                s.tipo === 'filas' && s.titulo === 'Datos de la organización'
                    ? { ...s, filas: s.filas.map((r) => (r.label === 'Comuna' ? { ...r, value: 'Providencia' } : r)) }
                    : s,
            ),
        }));
        expect(orgComuna(base.perfiles)).toBe('San Miguel');
        expect(composeProfile(base, { ...NADA, tabs }).asiTeVen.comuna).toBe('Providencia');
        expect(orgComuna(getProfile('jorge').perfiles)).toBeUndefined();
    });

    it('lo que se guarda no lleva la tarjeta de la identidad que pone la sesión', () => {
        const pending = composeProfile(withPrototypeData(getProfile('carolina')), { ...NADA, identityPendingAtStart: true });
        expect(withoutSessionTips(pending.perfiles).every((t) => t.completitud === undefined)).toBe(true);
        // La del Hogar de Jorge viene de los datos: se queda.
        expect(withoutSessionTips(getProfile('jorge').perfiles).every((t) => t.completitud !== undefined)).toBe(true);
    });
});

describe('verificationDetails (hoja «Verificación de …»)', () => {
    const of = (id: DemoActorId, session = false) =>
        verificationDetails(id, composeProfile(withPrototypeData(getProfile(id)), NADA).asiTeVen.verificaciones, session);

    it('las mismas fechas de VER-01 y NOT-01', () => {
        expect(of('jorge')).toEqual({
            'Teléfono verificado': 'Código SMS · 2 dic 2026',
            'Credencial SPD verificada': 'Credencial revisada · vence 03/2028',
        });
        expect(of('rosa')).toEqual({ 'Identidad verificada': 'Cédula y selfie revisadas · hoy' });
        expect(of('banqueteria')).toEqual({ 'Organización verificada': 'RUT y documentos revisados · 28 nov 2026' });
        expect(of('carolina')['Teléfono verificado']).toBe('Código SMS · 1 dic 2026');
    });

    it('lo verificado en la sesión dice «hoy»', () => {
        expect(of('matias', true)).toEqual({ 'Teléfono verificado': 'Código SMS · hoy' });
        const nuevo = composeProfile(recienRegistradoProfile(getProfile('jorge')), { ...NADA, phoneVerifiedInSession: true });
        expect(verificationDetails('jorge', nuevo.asiTeVen.verificaciones, true)).toEqual({
            'Teléfono verificado': 'Código SMS · hoy',
        });
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

describe('profileSheetApplies (hojas del Perfil en la URL)', () => {
    const [trabajo, hogar] = getProfile('jorge').perfiles;
    const ctx = { canSwitch: false, tab: trabajo, verificaciones: 2 };

    it('SHT-ACTOR solo con una organización a la que cambiar', () => {
        expect(profileSheetApplies('actor', null, ctx)).toBe(false);
        expect(profileSheetApplies('actor', null, { ...ctx, canSwitch: true })).toBe(true);
    });

    it('editar solo una sección que se edita en el perfil abierto', () => {
        expect(profileSheetApplies('editar', 'sobre-mi', ctx)).toBe(true);
        expect(profileSheetApplies('editar', 'sobre-mi', { ...ctx, tab: hogar })).toBe(false);
        expect(profileSheetApplies('editar', null, ctx)).toBe(false);
        expect(profileSheetApplies('editar', 'sobre-mi', { ...ctx, tab: undefined })).toBe(false);
    });

    it('el CV solo en el perfil con la sección CV', () => {
        expect(profileSheetApplies('cv', null, ctx)).toBe(true);
        expect(profileSheetApplies('cv', null, { ...ctx, tab: hogar })).toBe(false);
        expect(profileSheetApplies('cv', null, { ...ctx, tab: undefined })).toBe(false);
    });

    it('«Verificación de …» solo con insignias; las hojas de otros no se tocan', () => {
        expect(profileSheetApplies('verificacion', null, { ...ctx, verificaciones: 0 })).toBe(false);
        expect(profileSheetApplies('verificacion', null, ctx)).toBe(true);
        expect(profileSheetApplies('match', null, ctx)).toBe(true);
    });
});
