import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    ARRIVAL_DELAY_MS,
    confirmPeople,
    getManageState,
    resetManage,
    rosterKey,
    scheduleArrival,
    setPublicationStatus,
} from './manageState';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
    resetManage();
    vi.useRealTimers();
});

describe('estado de gestión de publicaciones (demo/manageState)', () => {
    it('los postulados llegan una sola vez, después del retraso', () => {
        const key = rosterKey('turno-garzones-finde', 'finde-sab-19');
        scheduleArrival('turno-garzones-finde', 'finde-sab-19');
        scheduleArrival('turno-garzones-finde', 'finde-sab-19');
        expect(getManageState().arriving.has(key)).toBe(true);
        expect(getManageState().arrived.has(key)).toBe(false);
        vi.advanceTimersByTime(ARRIVAL_DELAY_MS);
        expect(getManageState().arrived.has(key)).toBe(true);
        expect(getManageState().arriving.has(key)).toBe(false);
        // Ya llegaron: programarlo de nuevo no hace nada.
        scheduleArrival('turno-garzones-finde', 'finde-sab-19');
        expect(getManageState().arriving.has(key)).toBe(false);
    });

    it('confirmar no duplica y conserva el orden', () => {
        confirmPeople('p', 's', ['a', 'b']);
        confirmPeople('p', 's', ['b', 'c']);
        expect(getManageState().confirmed.get(rosterKey('p', 's'))).toEqual(['a', 'b', 'c']);
    });

    it('«Deshacer» la pausa vuelve al estado de los datos', () => {
        setPublicationStatus('p', { estado: 'Pausada' });
        expect(getManageState().status.get('p')).toEqual({ estado: 'Pausada' });
        setPublicationStatus('p', null);
        expect(getManageState().status.has('p')).toBe(false);
    });

    it('pausar o cerrar antes del «salto de tiempo»: los postulados no llegan', () => {
        for (const estado of ['Pausada', 'Cerrada'] as const) {
            const key = rosterKey('turno-garzones-finde', 'finde-sab-19');
            scheduleArrival('turno-garzones-finde', 'finde-sab-19');
            vi.advanceTimersByTime(ARRIVAL_DELAY_MS / 2);
            setPublicationStatus('turno-garzones-finde', { estado });
            expect(getManageState().arriving.has(key)).toBe(false);
            vi.advanceTimersByTime(ARRIVAL_DELAY_MS * 2);
            expect(getManageState().arrived.has(key)).toBe(false);
            resetManage();
        }
    });

    it('al reanudar, la llegada se programa de nuevo y llega', () => {
        const key = rosterKey('turno-garzones-finde', 'finde-sab-19');
        scheduleArrival('turno-garzones-finde', 'finde-sab-19');
        setPublicationStatus('turno-garzones-finde', { estado: 'Pausada' });
        setPublicationStatus('turno-garzones-finde', null);
        // GES-04 la vuelve a programar en la siguiente visita.
        scheduleArrival('turno-garzones-finde', 'finde-sab-19');
        vi.advanceTimersByTime(ARRIVAL_DELAY_MS);
        expect(getManageState().arrived.has(key)).toBe(true);
    });

    it('pausar una publicación no toca las llegadas de otra con un id parecido', () => {
        const other = rosterKey('turno-garzones-finde-5dic', 's');
        scheduleArrival('turno-garzones-finde-5dic', 's');
        setPublicationStatus('turno-garzones-finde', { estado: 'Cerrada', motivo: 'Otro motivo' });
        expect(getManageState().arriving.has(other)).toBe(true);
        vi.advanceTimersByTime(ARRIVAL_DELAY_MS);
        expect(getManageState().arrived.has(other)).toBe(true);
    });

    it('resetManage suelta los temporizadores pendientes', () => {
        scheduleArrival('p', 's');
        resetManage();
        vi.advanceTimersByTime(ARRIVAL_DELAY_MS);
        expect(getManageState().arrived.size).toBe(0);
    });
});
