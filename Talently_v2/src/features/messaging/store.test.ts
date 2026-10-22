import { describe, expect, it } from 'vitest';
import { getConversationState, setBlocked, shareCertificate, stopSharing } from './store';

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
