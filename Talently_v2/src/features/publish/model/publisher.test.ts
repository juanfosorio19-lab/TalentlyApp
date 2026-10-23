import { describe, expect, it } from 'vitest';
import { DEMO_ACTORS } from '../../demo/session';
import { initialHogar } from './hogar';
import {
    canPublish,
    identityVerifiedInData,
    isPublishTipo,
    needsIdentity,
    phoneVerifiedInData,
    previewAuthor,
    previewVerification,
    publishedId,
} from './publisher';
import { summaryOf } from './summary';
import { initialTurno } from './turno';

describe('quién publica qué (spec §5.4)', () => {
    it('una organización publica empleos y turnos', () => {
        expect(canPublish(DEMO_ACTORS.banqueteria, 'turno')).toBe(true);
        expect(canPublish(DEMO_ACTORS.banqueteria, 'empleo')).toBe(true);
        expect(canPublish(DEMO_ACTORS.banqueteria, 'hogar')).toBe(false);
    });

    it('un hogar publica su aviso y turnos para un evento', () => {
        expect(canPublish(DEMO_ACTORS.carolina, 'hogar')).toBe(true);
        expect(canPublish(DEMO_ACTORS.carolina, 'turno')).toBe(true);
        expect(canPublish(DEMO_ACTORS.carolina, 'empleo')).toBe(false);
    });

    it('Jorge recién registrado aún no tiene perfil Hogar: no publica (INI-01-jorge-nuevo)', () => {
        expect(canPublish(DEMO_ACTORS.jorge, 'hogar')).toBe(true);
        expect(canPublish(DEMO_ACTORS.jorge, 'hogar', true)).toBe(false);
        expect(canPublish(DEMO_ACTORS.jorge, 'turno', true)).toBe(false);
        expect(canPublish(DEMO_ACTORS.banqueteria, 'turno', true)).toBe(true);
    });

    it('quien solo busca trabajo no publica', () => {
        expect(canPublish(DEMO_ACTORS.matias, 'turno')).toBe(false);
        expect(canPublish(DEMO_ACTORS.rosa, 'hogar')).toBe(false);
    });

    it('reconoce los tipos de la URL', () => {
        expect(isPublishTipo('hogar')).toBe(true);
        expect(isPublishTipo('evento')).toBe(false);
        expect(isPublishTipo(undefined)).toBe(false);
    });
});

describe('vista previa', () => {
    it('la organización con su insignia; el hogar como «Familia en …»', () => {
        expect(previewAuthor(DEMO_ACTORS.banqueteria)).toEqual({ name: 'Banquetería Rosa SpA', kind: 'org' });
        expect(previewVerification(DEMO_ACTORS.banqueteria)).toEqual({ status: 'verified', label: 'Organización verificada' });
        expect(previewAuthor(DEMO_ACTORS.carolina)).toEqual({ name: 'Familia en Ñuñoa', kind: 'org' });
        expect(previewVerification(DEMO_ACTORS.carolina)).toBeNull();
    });
});

describe('identidad al publicar (PUBL-04-identidad)', () => {
    it('Carolina la verifica en el flujo 5, con el teléfono ya verificado', () => {
        expect(identityVerifiedInData('carolina')).toBe(false);
        expect(phoneVerifiedInData('carolina')).toBe(true);
        expect(needsIdentity(DEMO_ACTORS.carolina, 'pending')).toBe(true);
        expect(needsIdentity(DEMO_ACTORS.carolina, 'review')).toBe(false);
    });

    it('Jorge aún no la verifica; la organización no la necesita', () => {
        expect(needsIdentity(DEMO_ACTORS.jorge, 'pending')).toBe(true);
        expect(needsIdentity(DEMO_ACTORS.rosa, 'verified')).toBe(false);
        expect(needsIdentity(DEMO_ACTORS.banqueteria, 'pending')).toBe(false);
    });
});

describe('al terminar (PUBL-07)', () => {
    it('«Ver publicación» abre la publicación de los datos solo si es del actor', () => {
        expect(publishedId('banqueteria', 'turno')).toBe('turno-garzones-finde');
        expect(publishedId('carolina', 'hogar')).toBe('aviso-asesor-hogar');
        expect(publishedId('carolina', 'turno')).toBeNull();
        expect(publishedId('jorge', 'hogar')).toBeNull();
    });

    it('el turno de una organización verificada se publica; el aviso del hogar queda en revisión', () => {
        expect(summaryOf(DEMO_ACTORS.banqueteria, initialTurno('banqueteria'))).toEqual({
            kind: 'turno',
            titulo: 'Garzones fin de semana',
            hasta: 'hasta el dom 20 dic',
            review: false,
        });
        expect(summaryOf(DEMO_ACTORS.carolina, initialHogar('carolina'))).toEqual({
            kind: 'hogar',
            titulo: 'Asesor/a del hogar puertas afuera',
            hasta: null,
            review: true,
        });
    });
});
