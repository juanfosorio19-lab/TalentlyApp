import { beforeEach, describe, expect, it } from 'vitest';
import { getManagedPublications } from '../demo/data';
import { resetManage } from '../demo/manageState';
import { initialTurno } from './model/turno';
import {
    awaitIdentity,
    cancelAwaitIdentity,
    getPublished,
    isAwaitingIdentity,
    markPublished,
    resetPublishStore,
    turnoDrafts,
} from './store';

const initial = initialTurno('banqueteria');

describe('borrador del asistente', () => {
    beforeEach(() => resetPublishStore());

    it('dos cambios seguidos no se pisan (MoneyField manda monto y unidad juntos)', () => {
        turnoDrafts.patch('banqueteria', initial, { tarifa: null });
        turnoDrafts.patch('banqueteria', initial, { unidad: 'hora' });
        const d = turnoDrafts.get('banqueteria')?.draft;
        expect(d?.tarifa).toBeNull();
        expect(d?.unidad).toBe('hora');
    });

    it('«Guardar y salir» recuerda el paso; un cambio después lo deja sin guardar', () => {
        turnoDrafts.patch('banqueteria', initial, { titulo: 'Garzones para matrimonio' });
        turnoDrafts.save('banqueteria', initial, 3);
        expect(turnoDrafts.get('banqueteria')).toMatchObject({ saved: true, savedStep: 3 });
        turnoDrafts.patch('banqueteria', initial, { titulo: 'Garzones' });
        expect(turnoDrafts.get('banqueteria')).toMatchObject({ saved: false, savedStep: 3 });
    });

    it('cada actor tiene su borrador', () => {
        turnoDrafts.patch('banqueteria', initial, { titulo: 'Uno' });
        expect(turnoDrafts.get('carolina')).toBeUndefined();
        turnoDrafts.discard('banqueteria');
        expect(turnoDrafts.get('banqueteria')).toBeUndefined();
    });

    it('publicar termina la espera de la identidad', () => {
        awaitIdentity('carolina', 'hogar');
        expect(isAwaitingIdentity('carolina', 'hogar')).toBe(true);
        markPublished('carolina', { kind: 'hogar', titulo: 'Asesor/a del hogar puertas afuera', hasta: null, review: true });
        expect(isAwaitingIdentity('carolina', 'hogar')).toBe(false);
    });

    it('volver de VER-02 sin enviar cancela la espera; lo publicado queda para saltar el asistente', () => {
        awaitIdentity('carolina', 'hogar');
        cancelAwaitIdentity('carolina', 'hogar');
        expect(isAwaitingIdentity('carolina', 'hogar')).toBe(false);
        expect(getPublished('carolina', 'hogar')).toBeUndefined();
        markPublished('carolina', { kind: 'hogar', titulo: 'Asesor/a del hogar puertas afuera', hasta: null, review: true });
        expect(getPublished('carolina', 'hogar')?.review).toBe(true);
        expect(getPublished('carolina', 'turno')).toBeUndefined();
    });
});

describe('lo publicado existe para las otras pestañas (demo/manageState)', () => {
    beforeEach(() => {
        resetPublishStore();
        resetManage();
    });

    it('flujo 4: «Garzones fin de semana» aparece en ACT-03 recién al publicar', () => {
        const own = () => getManagedPublications('banqueteria').map((m) => m.publicationId);
        expect(own()).not.toContain('turno-garzones-finde');
        markPublished('banqueteria', { kind: 'turno', titulo: 'Garzones fin de semana', hasta: 'hasta el dom 20 dic', review: false });
        expect(own()).toContain('turno-garzones-finde');
    });
});
