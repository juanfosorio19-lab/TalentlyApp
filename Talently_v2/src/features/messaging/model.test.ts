import { describe, expect, it } from 'vitest';
import { contextChipText } from '../../ui/ContextChip';
import { getConversation, getConversations } from '../demo/data';
import { chatItems, contextOf, contextPath, inboxRow, peerVerified, sortRows } from './model';
import { EMPTY_STATE, type ConversationState } from './store';

const conv = (id: string) => {
    const c = getConversation(id);
    if (!c) throw new Error(`falta ${id}`);
    return c;
};

describe('contextOf', () => {
    it('arma el ContextChip con el mismo texto de los datos', () => {
        for (const viewer of ['matias', 'jorge', 'pedro', 'carolina', 'marta', 'banqueteria'] as const) {
            for (const c of getConversations(viewer)) {
                expect(contextChipText(contextOf(c.contexto.tipo, c.contexto.texto))).toBe(c.contexto.texto);
                expect(contextChipText(contextOf(c.contexto.tipo, c.contexto.chip))).toBe(c.contexto.chip);
            }
        }
    });
    it('separa tipo, título y fecha', () => {
        expect(contextOf('turno', 'Turno · Guardia de eventos · sáb 12 dic')).toEqual({
            kind: 'turno',
            title: 'Guardia de eventos',
            detail: 'sáb 12 dic',
        });
    });
});

describe('bandeja', () => {
    it('los nuevos matches salen con el primer mensaje y la conversación sube', () => {
        const state: ConversationState = {
            ...EMPTY_STATE,
            touched: 1,
            entries: [{ kind: 'texto', id: 'l1', texto: 'Hola', hora: '13:00', status: 'sent' }],
        };
        const rows = getConversations('jorge').map((c) => inboxRow(c, c.id === 'conv-jorge-hotel-andino' ? state : EMPTY_STATE));
        const hotel = rows.find((r) => r.conv.id === 'conv-jorge-hotel-andino');
        expect(hotel).toMatchObject({ newMatch: false, preview: 'Tú: Hola', when: '13:00' });
        expect(sortRows(rows.filter((r) => !r.newMatch))[0]?.conv.id).toBe('conv-jorge-hotel-andino');
    });
    it('abrirla deja sus no leídos en 0', () => {
        expect(inboxRow(conv('conv-matias-coctel'), EMPTY_STATE).unread).toBe(3);
        expect(inboxRow(conv('conv-matias-coctel'), { ...EMPTY_STATE, read: true }).unread).toBe(0);
    });
});

describe('certificado (flujo 10)', () => {
    const marta = conv('conv-marta-familia');
    it('compartir trae la tarjeta y lo que sigue; dejar de compartir la apaga', () => {
        const shared: ConversationState = { ...EMPTY_STATE, entries: [{ kind: 'certificado', id: 'c1', off: false }] };
        const items = chatItems(marta, shared);
        expect(items).toHaveLength(6);
        expect(items[3]).toMatchObject({ kind: 'sistema', shareId: 'c1', tarjeta: { disponible: true } });
        const off = chatItems(marta, { ...shared, entries: [{ kind: 'certificado', id: 'c1', off: true }] });
        expect(off[3]).toMatchObject({ kind: 'sistema', tarjeta: { disponible: false } });
    });
    it('compartirlo otra vez agrega solo una tarjeta, sin «Visto por…»', () => {
        const twice: ConversationState = {
            ...EMPTY_STATE,
            entries: [
                { kind: 'certificado', id: 'c1', off: true },
                { kind: 'certificado', id: 'c2', off: false },
            ],
        };
        const items = chatItems(marta, twice);
        const last = items.at(-1);
        expect(items).toHaveLength(7);
        expect(last?.kind === 'sistema' && last.tarjeta.lineas.some((l) => l.startsWith('Visto por'))).toBe(false);
    });
});

describe('a dónde lleva el chip', () => {
    it('quien postuló va a su proceso (flujo 3) o a su turno', () => {
        expect(contextPath(conv('conv-pedro-taller'), 'pedro')).toBe('/procesos/proc-pedro-mecanico');
        expect(contextPath(conv('conv-matias-coctel'), 'matias')).toBe('/turnos/app-matias-coctel');
    });
    it('sin publicación (turno pasado) no lleva a ninguna parte', () => {
        expect(contextPath(conv('conv-jorge-punto-activo-28nov'), 'jorge')).toBeNull();
    });
});

describe('punto de verificación', () => {
    it('organización verificada sí; hogar y persona sin identidad ni teléfono, no', () => {
        expect(peerVerified(conv('conv-jorge-seguridad-andes').con)).toBe(true);
        expect(peerVerified(conv('conv-marta-familia').con)).toBe(false);
        expect(peerVerified(conv('conv-carolina-marta').con)).toBe(false);
    });
});
