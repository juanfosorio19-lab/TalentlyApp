import { beforeEach, describe, expect, it } from 'vitest';
import { getManageState, publishInSession, resetManage, setPublicationStatus } from '../demo/manageState';
import { resetSession, submitIdentity, verifyPhone } from '../demo/sessionStore';
import { activePublicationsOf, isPublicView, publicOrg, publicPerson } from './model';

beforeEach(() => {
    resetSession();
    resetManage();
});

const labels = (id: string) => publicPerson(id)?.verificaciones.map((v) => v.label) ?? [];

describe('PRF-10 · perfil público de persona', () => {
    it('muestra solo lo publicable: nombre, comuna, insignias, oficio y nota (nada de pretensión ni teléfono)', () => {
        const jorge = publicPerson('jorge');
        expect(jorge).toMatchObject({ nombre: 'Jorge Muñoz', comuna: 'Puente Alto' });
        expect(jorge?.trabajo?.oficios).toEqual([{ nombre: 'Guardia de seguridad', experiencia: '5 a 10 años' }]);
        expect(jorge?.trabajo?.nota).toEqual({ value: 4.9, count: 25 });
        expect(Object.keys(jorge ?? {})).not.toContain('pretension');
    });

    it('las insignias siguen la sesión: el teléfono de Matías aparece después de AUTH-08', () => {
        expect(labels('matias')).not.toContain('Teléfono verificado');
        verifyPhone('matias');
        expect(labels('matias')).toContain('Teléfono verificado');
    });

    it('la identidad de Carolina no se ve verificada mientras está pendiente o en revisión', () => {
        expect(labels('carolina')).not.toContain('Identidad verificada');
        submitIdentity('carolina');
        expect(labels('carolina')).not.toContain('Identidad verificada');
        expect(labels('carolina')).toContain('Teléfono verificado');
    });

    it('sin oficio no hay perfil de trabajo (Carolina) y quien no existe da null', () => {
        expect(publicPerson('carolina')?.trabajo).toBeNull();
        expect(publicPerson('carolina')?.hogar).toBe(true);
        expect(publicPerson('no-existe')).toBeNull();
    });

    it('recién registrado: solo lo que dejó el onboarding, sin insignias ni reseñas', () => {
        const p = publicPerson('jorge', {
            recienRegistrado: true,
            onboarding: {
                nombre: 'Camila',
                apellido: 'Soto',
                comuna: 'La Florida',
                foto: null,
                oficios: [{ nombre: 'Guardia de seguridad', experiencia: '1 a 3 años', principal: true }],
                credencial: 'pendiente',
            },
        });
        expect(p).toMatchObject({ nombre: 'Camila Soto', iniciales: 'CS', comuna: 'La Florida', verificaciones: [] });
        expect(p?.trabajo?.nota).toBeNull();
    });

    it('acepta solo las capacidades de la ruta', () => {
        expect(isPublicView('trabajo')).toBe(true);
        expect(isPublicView('hogar')).toBe(false);
        expect(isPublicView(null)).toBe(false);
    });
});

describe('PRF-11 · perfil público de organización', () => {
    it('trae la insignia de organización con su fecha y «Sobre la organización»', () => {
        const b = publicOrg('banqueteria');
        expect(b?.verificaciones).toEqual([{ label: 'Organización verificada', status: 'verified', fecha: '28 nov 2026' }]);
        expect(b?.sobre).toBe('Gastronomía y eventos · 10 a 49 trabajadores');
        expect(publicOrg('no-existe')).toBeNull();
    });

    it('un hogar muestra la identidad de quien publica, como DET-01', () => {
        expect(publicOrg('familia-nunoa')?.verificaciones.map((v) => v.label)).toEqual(['Identidad verificada']);
        expect(publicOrg('familia-puente-alto')?.verificaciones).toEqual([]);
    });

    it('lista solo lo activo en la sesión: pausar en GES-01 la saca', () => {
        // «Garzones fin de semana» existe recién cuando Rosa la publica (flujo 4).
        expect(activePublicationsOf('banqueteria', getManageState()).map((p) => p.id)).not.toContain('turno-garzones-finde');
        publishInSession('turno-garzones-finde');
        const before = activePublicationsOf('banqueteria', getManageState()).map((p) => p.id);
        expect(before).toContain('turno-garzones-finde');
        setPublicationStatus('turno-garzones-finde', { estado: 'Pausada' });
        expect(activePublicationsOf('banqueteria', getManageState()).map((p) => p.id)).not.toContain('turno-garzones-finde');
    });
});
