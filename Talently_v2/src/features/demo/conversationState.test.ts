import { afterEach, describe, expect, it } from 'vitest';
import {
    EMPTY_STATE,
    conversationsOf,
    getConversationState,
    getConversationState as stateOf,
    isUnanswered,
    markRead,
    resetConversations,
    sendMessage,
    setBlocked,
    shareCertificate,
    stopSharing,
    unansweredOf,
    unreadOf,
} from './conversationState';
import { getConversations } from './data';
import { applyTo, getSessionState, markMatchSeen, resetSession, scheduleMatch } from './sessionStore';

describe('bloquear', () => {
    it('revoca el certificado compartido y desbloquear no lo vuelve a compartir', () => {
        const id = 'conv-prueba-bloqueo';
        shareCertificate(id, '13:00');
        const shared = getConversationState(id).entries[0];
        expect(shared).toMatchObject({ kind: 'certificado', off: false, hora: '13:00' });

        setBlocked(id, true);
        expect(getConversationState(id)).toMatchObject({ blocked: true, entries: [{ kind: 'certificado', off: true }] });

        setBlocked(id, false);
        expect(getConversationState(id)).toMatchObject({ blocked: false, entries: [{ kind: 'certificado', off: true }] });
    });
    it('«Dejar de compartir» apaga solo esa tarjeta', () => {
        const id = 'conv-prueba-dejar';
        shareCertificate(id, '13:00');
        shareCertificate(id, '13:00');
        const [first, second] = getConversationState(id).entries;
        if (!first || !second) throw new Error('faltan tarjetas');
        stopSharing(id, first.id);
        expect(getConversationState(id).entries.map((e) => e.kind === 'certificado' && e.off)).toEqual([true, false]);
    });
});

afterEach(() => {
    resetConversations();
    resetSession();
});

describe('qué conversaciones existen en la sesión', () => {
    const ids = (viewer: 'pedro' | 'jorge', nuevo = false) =>
        conversationsOf(viewer, nuevo, getSessionState().applications).map((c) => c.id);

    it('la de una postulación que todavía no envía aparece al postular (flujo 3)', () => {
        expect(ids('pedro')).not.toContain('conv-pedro-taller');
        applyTo('pedro', 'empleo-mecanico-automotriz', 'Postulado');
        expect(ids('pedro')).toContain('conv-pedro-taller');
        // Jorge (flujos 8 y 11) parte con la conversación de Seguridad Andes (MSG-01-jorge).
        expect(ids('jorge')).toContain('conv-jorge-seguridad-andes');
        expect(ids('jorge')).toContain('conv-jorge-hotel-andino');
        expect(ids('jorge', true)).toEqual([]);
    });

    it('mientras el match viene en camino, la conversación todavía no existe', () => {
        applyTo('pedro', 'empleo-mecanico-automotriz', 'Postulado');
        scheduleMatch('pedro', 'empleo-mecanico-automotriz', 60_000);
        expect(ids('pedro')).not.toContain('conv-pedro-taller');
        markMatchSeen('pedro', 'empleo-mecanico-automotriz');
        expect(ids('pedro')).toContain('conv-pedro-taller');
    });

    it('abrir la conversación deja leída su notificación «te escribió»', () => {
        markRead('conv-marta-familia');
        expect(getSessionState().readConversations.has('conv-marta-familia')).toBe(true);
    });

    it('no leídos y sin responder: bajan al abrir y al responder', () => {
        const banqueteria = conversationsOf('banqueteria', false, getSessionState().applications);
        const states = () => new Map(banqueteria.map((c) => [c.id, stateOf(c.id)]));
        expect(unansweredOf(banqueteria, states())).toBe(3);
        sendMessage('conv-br-javiera', 'Hola, Javiera', '13:00');
        expect(unansweredOf(banqueteria, states())).toBe(2);
        const marta = getConversations('marta');
        expect(unreadOf(marta, new Map())).toBe(1);
        markRead('conv-marta-familia');
        expect(unreadOf(marta, new Map([['conv-marta-familia', stateOf('conv-marta-familia')]]))).toBe(0);
        expect(marta.every((c) => isUnanswered(c, EMPTY_STATE))).toBe(true);
    });
});
