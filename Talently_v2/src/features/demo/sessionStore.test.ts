import { beforeEach, describe, expect, it } from 'vitest';
import { getSessionState, applyTo, cancelShift, decide, markMatchSeen, markNotificationsRead, resetSession, scheduleMatch, startsWithoutApplication, undoDecision } from './sessionStore';

beforeEach(() => resetSession());

describe('sesión de demostración', () => {
    it('marca leídas sin duplicar', () => {
        markNotificationsRead(['a', 'b']);
        markNotificationsRead(['b']);
        expect([...getSessionState().readNotifications]).toEqual(['a', 'b']);
    });

    it('guarda postulaciones y turnos cancelados', () => {
        applyTo('matias', 'turno-garzones-matrimonio', 'Postulado');
        cancelShift('app-1');
        expect(getSessionState().applications.get('matias:turno-garzones-matrimonio')?.estado).toBe('Postulado');
        expect(getSessionState().cancelledShifts.has('app-1')).toBe(true);
    });

    it('el match se programa una vez y al verlo sale de pendientes', () => {
        scheduleMatch('pedro', 'empleo-mecanico-automotriz', 0);
        scheduleMatch('pedro', 'empleo-mecanico-automotriz', 0);
        expect(getSessionState().pendingMatches.size).toBe(1);
        markMatchSeen('pedro', 'empleo-mecanico-automotriz');
        expect(getSessionState().pendingMatches.size).toBe(0);
        scheduleMatch('pedro', 'empleo-mecanico-automotriz', 0);
        expect(getSessionState().pendingMatches.size).toBe(0);
    });

    it('decidir y deshacer en el deck', () => {
        decide('pedro', 'x', 'no');
        expect(getSessionState().decisions.get('pedro:x')).toBe('no');
        undoDecision('pedro', 'x');
        expect(getSessionState().decisions.has('pedro:x')).toBe(false);
    });

    it('los flujos del prototipo parten sin postulación', () => {
        expect(startsWithoutApplication('matias', 'turno-garzones-matrimonio')).toBe(true);
        expect(startsWithoutApplication('matias', 'otra')).toBe(false);
    });
});
