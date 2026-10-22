import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    ARRIVAL_DELAY_MS,
    confirmPeople,
    getManageState,
    resetManage,
    rosterKey,
    scheduleArrival,
    setPublicationStatus,
} from './store';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
    resetManage();
    vi.useRealTimers();
});

describe('store de Gestionar publicaciones', () => {
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

    it('resetManage suelta los temporizadores pendientes', () => {
        scheduleArrival('p', 's');
        resetManage();
        vi.advanceTimersByTime(ARRIVAL_DELAY_MS);
        expect(getManageState().arrived.size).toBe(0);
    });
});
