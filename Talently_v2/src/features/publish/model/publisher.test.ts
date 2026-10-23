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
import { emptyTurno, initialTurno } from './turno';

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
    const plantilla = initialTurno('banqueteria');
    const aviso = initialHogar('carolina');

    it('«Ver publicación» abre la publicación de los datos si lo publicado es su borrador sin cambios', () => {
        expect(publishedId('banqueteria', plantilla)).toBe('turno-garzones-finde');
        expect(publishedId('carolina', aviso)).toBe('aviso-asesor-hogar');
    });

    it('el orden en que se marcaron las cosas o los espacios de más no la cambian', () => {
        const [b1, b2] = plantilla.bloques;
        if (!b1 || !b2) throw new Error('La plantilla trae dos bloques');
        const reordenado = {
            ...plantilla,
            titulo: ` ${plantilla.titulo} `,
            bloques: [{ ...b2, id: 'b9' }, { ...b1, id: 'b7' }],
            vestimenta: [...plantilla.vestimenta].reverse(),
        };
        expect(publishedId('banqueteria', reordenado)).toBe('turno-garzones-finde');
        expect(publishedId('carolina', { ...aviso, dias: [...aviso.dias].reverse(), tareas: [...aviso.tareas].reverse() })).toBe(
            'aviso-asesor-hogar',
        );
    });

    it('otro turno u otro aviso no abren la publicación de los datos (hallazgo: desde cero, otro título)', () => {
        expect(publishedId('banqueteria', { ...emptyTurno('cero'), oficio: 'bartender', titulo: 'Bartender para matrimonio' })).toBeNull();
        expect(publishedId('banqueteria', { ...plantilla, titulo: 'Garzones para cóctel' })).toBeNull();
        expect(publishedId('banqueteria', { ...plantilla, bloques: plantilla.bloques.slice(0, 1) })).toBeNull();
        expect(publishedId('banqueteria', { ...plantilla, tarifa: 40000 })).toBeNull();
        expect(publishedId('banqueteria', { ...plantilla, notaPostulantes: 'Llega 30 minutos antes' })).toBeNull();
        expect(publishedId('carolina', { ...aviso, modalidad: 'adentro' })).toBeNull();
        expect(publishedId('carolina', { ...aviso, sueldo: 650000 })).toBeNull();
    });

    it('solo si es del actor: el turno de un hogar o el aviso de otro hogar no están en los datos', () => {
        expect(publishedId('carolina', initialTurno('carolina'))).toBeNull();
        expect(publishedId('jorge', initialHogar('jorge'))).toBeNull();
        expect(publishedId('jorge', aviso)).toBeNull();
    });

    it('el turno de una organización verificada se publica; el aviso del hogar queda en revisión', () => {
        expect(summaryOf(DEMO_ACTORS.banqueteria, plantilla)).toEqual({
            kind: 'turno',
            titulo: 'Garzones fin de semana',
            hasta: 'hasta el dom 20 dic',
            review: false,
            publicationId: 'turno-garzones-finde',
        });
        expect(summaryOf(DEMO_ACTORS.carolina, aviso)).toEqual({
            kind: 'hogar',
            titulo: 'Asesor/a del hogar puertas afuera',
            hasta: null,
            review: true,
            publicationId: 'aviso-asesor-hogar',
        });
    });
});
