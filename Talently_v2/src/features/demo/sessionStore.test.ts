import { beforeEach, describe, expect, it } from 'vitest';
import {
    applyTo,
    cancelShift,
    decide,
    decidedIn,
    getReview,
    getSessionState,
    inboxItems,
    isWithdrawn,
    markMatchSeen,
    markNotificationsRead,
    noteConversationRead,
    resetSession,
    reviewedBy,
    scheduleMatch,
    sendReview,
    startsWithoutApplication,
    stillWithdrawn,
    undoDecision,
    withdrawApplication,
} from './sessionStore';

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

    it('retirar queda por actor y proceso; volver a postular después la deja en pie', () => {
        expect(isWithdrawn('jorge', 'proc-jorge-guardia-4x4')).toBe(false);
        withdrawApplication('jorge', 'proc-jorge-guardia-4x4');
        expect(isWithdrawn('jorge', 'proc-jorge-guardia-4x4')).toBe(true);
        expect(isWithdrawn('pedro', 'proc-jorge-guardia-4x4')).toBe(false);
        withdrawApplication('pedro', 'proc-pedro-mecanico', 2000);
        expect(isWithdrawn('pedro', 'proc-pedro-mecanico', 1000)).toBe(true);
        expect(isWithdrawn('pedro', 'proc-pedro-mecanico', 3000)).toBe(false);
        withdrawApplication('pedro', 'proc-pedro-mecanico', 4000);
        expect(isWithdrawn('pedro', 'proc-pedro-mecanico', 3000)).toBe(true);
        expect(stillWithdrawn(undefined, 3000)).toBe(false);
    });

    it('lo decidido: una postulación retirada ya no cuenta; recién registrado no trae las de los datos', () => {
        const s = () => getSessionState();
        // Jorge está en lista de espera de «Guardia de eventos» (datos).
        expect(decidedIn(s(), 'jorge', 'turno-guardia-eventos-19dic')).toBe('postulado');
        expect(decidedIn(s(), 'jorge', 'turno-guardia-eventos-19dic', true)).toBeUndefined();
        applyTo('pedro', 'empleo-mecanico-automotriz', 'Postulado');
        expect(decidedIn(s(), 'pedro', 'empleo-mecanico-automotriz')).toBe('postulado');
        withdrawApplication('pedro', 'proc-pedro-mecanico', Date.now() + 1000);
        expect(decidedIn(s(), 'pedro', 'empleo-mecanico-automotriz')).toBeUndefined();
    });

    it('la evaluación enviada (REV-01) queda por actor y publicación', () => {
        sendReview('matias', 'turno-garzones-finde-5dic', { rating: 5, tags: ['Pago a tiempo'], comment: 'Todo bien' });
        expect(getReview('matias', 'turno-garzones-finde-5dic')).toMatchObject({ rating: 5, tags: ['Pago a tiempo'] });
        expect(getReview('jorge', 'turno-garzones-finde-5dic')).toBeUndefined();
        expect(reviewedBy(getSessionState().reviews, 'matias')).toEqual(new Set(['turno-garzones-finde-5dic']));
    });

    it('la bandeja no muestra lo de una postulación que la sesión todavía no tiene (flujos 2 y 3)', () => {
        const ids = (viewer: 'pedro' | 'jorge' | 'marta') => inboxItems(viewer, false).map((n) => n.id);
        expect(ids('pedro')).toEqual([]);
        // Jorge (flujos 8 y 11) parte con su postulación a Guardia 4x4: entrevista y mensaje de Seguridad Andes.
        expect(ids('jorge')).toContain('not-jorge-entrevista');
        expect(ids('jorge')).toContain('not-jorge-mensaje');
        expect(ids('jorge')).toContain('not-jorge-match');
        expect(startsWithoutApplication('jorge', 'empleo-guardia-4x4')).toBe(false);
        applyTo('pedro', 'empleo-mecanico-automotriz', 'Postulado');
        expect(ids('pedro')).toEqual(['not-pedro-mensaje', 'not-pedro-match', 'not-pedro-entrevista']);
        // Marta (flujo 10) es actor de la demo: su bandeja es la suya.
        expect(ids('marta')).toEqual(['not-marta-mensaje']);
        expect(inboxItems('jorge', true)).toEqual([]);
    });

    it('mientras el match viene en camino, la bandeja todavía no trae lo de después (flujo 3)', () => {
        const ids = () => inboxItems('pedro', false).map((n) => n.id);
        applyTo('pedro', 'empleo-mecanico-automotriz', 'Postulado');
        scheduleMatch('pedro', 'empleo-mecanico-automotriz', 60_000);
        expect(ids()).toEqual([]);
        markMatchSeen('pedro', 'empleo-mecanico-automotriz');
        expect(ids()).toEqual(['not-pedro-mensaje', 'not-pedro-match', 'not-pedro-entrevista']);
    });

    it('«te escribió» queda leída al abrir esa conversación (la campana y Mensajes dicen lo mismo)', () => {
        const unread = () => inboxItems('marta', false).filter((n) => n.sinLeer).map((n) => n.id);
        expect(unread()).toEqual(['not-marta-mensaje']);
        noteConversationRead('conv-marta-familia');
        expect(unread()).toEqual([]);
        // Un match que lleva a la misma conversación no es «te escribió»: sigue sin leer.
        noteConversationRead('conv-jorge-hotel-andino');
        expect(inboxItems('jorge', false).find((n) => n.id === 'not-jorge-match')?.sinLeer).toBe(true);
    });

    it('retirar quita el «Me interesa» del deck: la publicación vuelve al deck', () => {
        decide('pedro', 'empleo-mecanico-automotriz', 'si');
        applyTo('pedro', 'empleo-mecanico-automotriz', 'Postulado');
        expect(decidedIn(getSessionState(), 'pedro', 'empleo-mecanico-automotriz')).toBe('postulado');
        withdrawApplication('pedro', 'proc-pedro-mecanico', Date.now() + 1000);
        expect(decidedIn(getSessionState(), 'pedro', 'empleo-mecanico-automotriz')).toBeUndefined();
        // Un «No me interesa» de otra publicación no se toca.
        decide('pedro', 'otra', 'no');
        withdrawApplication('pedro', 'proc-pedro-mecanico', Date.now() + 2000);
        expect(getSessionState().decisions.get('pedro:otra')).toBe('no');
    });
});
