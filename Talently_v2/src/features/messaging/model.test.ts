import { describe, expect, it } from 'vitest';
import { contextChipText } from '../../ui/ContextChip';
import { buildIcs } from '../../domain/calendario';
import { getConversation, getConversations } from '../demo/data';
import type { DemoSystemCard } from '../demo/types';
import {
    ALL,
    certificateActive,
    certificateIssued,
    certificatePending,
    chatItems,
    contextOf,
    contextPath,
    filteredEmpty,
    googleCalendarUrl,
    inboxFilters,
    inboxRow,
    interviewEvent,
    matchesFilter,
    peerVerified,
    selectedFilter,
    sortRows,
    viewerWorks,
} from './model';
import { EMPTY_STATE, type ConversationState } from '../demo/conversationState';

const conv = (id: string) => {
    const c = getConversation(id);
    if (!c) throw new Error(`falta ${id}`);
    return c;
};

const rowsOf = (viewer: Parameters<typeof getConversations>[0]) =>
    sortRows(getConversations(viewer).map((c) => inboxRow(c, EMPTY_STATE)).filter((r) => !r.newMatch));

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
        // Lo de esta sesión es lo más nuevo: «ahora», no «13:00» sobre filas que dicen «hace 10 min».
        expect(hotel).toMatchObject({ newMatch: false, preview: 'Tú: Hola', when: 'ahora' });
        expect(sortRows(rows.filter((r) => !r.newMatch))[0]?.conv.id).toBe('conv-jorge-hotel-andino');
    });
    it('abrirla deja sus no leídos en 0', () => {
        expect(inboxRow(conv('conv-matias-coctel'), EMPTY_STATE).unread).toBe(3);
        expect(inboxRow(conv('conv-matias-coctel'), { ...EMPTY_STATE, read: true }).unread).toBe(0);
    });
    it('va por último mensaje, aunque los datos vengan en otro orden', () => {
        expect(rowsOf('jorge').map((r) => r.conv.id)).toEqual([
            'conv-jorge-seguridad-andes', // hoy 12:50
            'conv-jorge-supervisor', // 3 dic
            'conv-jorge-punto-activo-28nov', // 28 nov
        ]);
        // Banquetería: Matías (hoy 12:55) va antes que Javiera (12:45) y Felipe (11:58); Daniela es de ayer.
        expect(rowsOf('banqueteria').map((r) => r.conv.id)).toEqual([
            'conv-br-matias',
            'conv-br-javiera',
            'conv-br-felipe',
            'conv-br-daniela',
        ]);
    });
});

describe('filtros', () => {
    it('una persona filtra por tipo y el valor desconocido vuelve a «Todos»', () => {
        const rows = rowsOf('jorge');
        const filters = inboxFilters(rows, 'persona');
        expect(filters?.param).toBe('tipo');
        expect(filters?.options.map((o) => o.label)).toEqual(['Todos', 'Empleo', 'Turno']);
        expect(selectedFilter(filters, 'clase')).toBe(ALL);
        expect(rows.filter((r) => matchesFilter(r, filters, 'turno')).map((r) => r.conv.id)).toEqual(['conv-jorge-punto-activo-28nov']);
        expect(filteredEmpty(filters, 'empleo', true)).toEqual({
            title: 'No tienes conversaciones de empleos',
            text: 'Cuando hagas match en un empleo, aquí podrás hablar con quien lo publica.',
        });
    });
    it('a quien solo publica (Carolina) el filtro vacío le habla de quienes postulan', () => {
        const filters = inboxFilters(rowsOf('carolina'), 'persona');
        expect(filteredEmpty(filters, 'turno', false)).toEqual({
            title: 'No tienes conversaciones de turnos',
            text: 'Cuando alguien postule a tus turnos, aquí podrás hablar con esa persona.',
        });
        expect(filteredEmpty(filters, 'empleo', false)?.text).toBe('Cuando alguien postule a tus empleos, aquí podrás hablar con esa persona.');
    });
    it('una organización filtra por publicación (spec §5.2), sin «Empleo» ni «Turno»', () => {
        const rows = rowsOf('banqueteria');
        const filters = inboxFilters(rows, 'organizacion');
        expect(filters?.param).toBe('pub');
        expect(filters?.options).toEqual([
            { value: ALL, label: 'Todos' },
            { value: 'turno-garzones-coctel-corporativo', label: 'Garzones para cóctel corporativo' },
            { value: 'turno-garzones-matrimonio', label: 'Garzones para matrimonio' },
        ]);
        const value = selectedFilter(filters, 'turno-garzones-matrimonio');
        expect(rows.filter((r) => matchesFilter(r, filters, value)).map((r) => r.conv.con.nombre)).toHaveLength(3);
        expect(selectedFilter(filters, 'turno')).toBe(ALL);
        expect(filteredEmpty(filters, value, false)).toBeNull();
    });
    it('con una sola publicación no hay nada que filtrar', () => {
        expect(inboxFilters(rowsOf('carolina'), 'organizacion')).toBeNull();
    });
});

describe('certificado (flujo 10)', () => {
    const marta = conv('conv-marta-familia');
    it('compartir agrega solo su tarjeta, sin inventar «Visto por…» ni respuestas; dejar de compartir la apaga', () => {
        const shared: ConversationState = { ...EMPTY_STATE, entries: [{ kind: 'certificado', id: 'c1', off: false, hora: '13:00' }] };
        const items = chatItems(marta, shared);
        expect(items).toHaveLength(marta.mensajes.length + 1);
        const card = items.at(-1);
        expect(card).toMatchObject({ kind: 'sistema', shareId: 'c1', hora: '13:00', tarjeta: { disponible: true, accion: 'Dejar de compartir' } });
        expect(card?.kind === 'sistema' && card.tarjeta.lineas).toEqual([
            'Emitido el 30-11-2026',
            'Subido por ti, sin verificar',
            'Disponible hasta el jue 17 dic',
        ]);
        const off = chatItems(marta, { ...shared, entries: [{ kind: 'certificado', id: 'c1', off: true }] });
        expect(off.at(-1)).toMatchObject({ kind: 'sistema', tarjeta: { disponible: false } });
    });
    it('compartirlo otra vez agrega solo otra tarjeta', () => {
        const twice: ConversationState = {
            ...EMPTY_STATE,
            entries: [
                { kind: 'certificado', id: 'c1', off: true },
                { kind: 'certificado', id: 'c2', off: false },
            ],
        };
        const items = chatItems(marta, twice);
        expect(items).toHaveLength(marta.mensajes.length + 2);
        expect(items.filter((i) => i.kind === 'sistema' && i.tarjeta.lineas.some((l) => l.startsWith('Visto por')))).toHaveLength(0);
        expect(certificateActive(twice)).toBe(true);
        expect(certificatePending(marta, twice)).toBe(false);
    });
    it('la fila de la bandeja dice «Tú: Certificado de antecedentes» «ahora»', () => {
        const shared: ConversationState = { ...EMPTY_STATE, touched: 1, entries: [{ kind: 'certificado', id: 'c1', off: false, hora: '13:00' }] };
        expect(inboxRow(marta, shared)).toMatchObject({ preview: 'Tú: Certificado de antecedentes', when: 'ahora' });
    });
    it('la fecha de emisión del que ya subió va en la hoja', () => {
        expect(certificateIssued(marta)).toBe('Emitido el 30-11-2026');
        expect(certificateIssued(conv('conv-jorge-seguridad-andes'))).toBeUndefined();
    });
});

describe('quién puede compartir el certificado', () => {
    it('quien trabaja, en toda conversación con una organización o un hogar; nunca quien contrata', () => {
        expect(viewerWorks(conv('conv-marta-familia'))).toBe(true);
        expect(viewerWorks(conv('conv-jorge-seguridad-andes'))).toBe(true);
        expect(viewerWorks(conv('conv-carolina-marta'))).toBe(false);
        expect(viewerWorks(conv('conv-br-javiera'))).toBe(false);
    });
});

describe('a dónde lleva el chip', () => {
    it('quien postuló va a su proceso (final del flujo 3) o a su turno', () => {
        expect(contextPath(conv('conv-pedro-taller'), 'pedro')).toBe('/procesos/proc-pedro-mecanico');
        expect(contextPath(conv('conv-matias-coctel'), 'matias')).toBe('/turnos/app-matias-coctel');
    });
    it('quien publicó va al proceso de esa persona o a la gestión de la publicación', () => {
        expect(contextPath(conv('conv-carolina-marta'), 'carolina')).toBe('/procesos/proc-carolina-marta');
        expect(contextPath(conv('conv-br-javiera'), 'banqueteria')).toBe('/publicaciones/turno-garzones-matrimonio');
    });
    it('salta lo que el router todavía no tiene y termina en el detalle, nunca en SYS-404', () => {
        const onlyDetail = (path: string) => path.startsWith('/p/');
        expect(contextPath(conv('conv-pedro-taller'), 'pedro', onlyDetail)).toBe('/p/empleo-mecanico-automotriz');
        expect(contextPath(conv('conv-marta-familia'), 'marta')).toBe('/p/aviso-asesor-hogar');
    });
    it('sin publicación (turno pasado) no lleva a ninguna parte', () => {
        expect(contextPath(conv('conv-jorge-punto-activo-28nov'), 'jorge')).toBeNull();
    });
});

describe('entrevista al calendario', () => {
    const card: DemoSystemCard = {
        tipo: 'entrevista',
        titulo: 'Entrevista',
        lineas: ['mar 15 dic · 10:00', 'Av. Concha y Toro 1234, Puente Alto'],
        accion: 'Agregar al calendario',
        disponible: true,
    };
    it('arma el evento en hora local de Chile, con el año de la demo', () => {
        expect(interviewEvent(card, 'Entrevista con Seguridad Andes Ltda.', 60, 'conv-1-m3')).toEqual({
            uid: 'conv-1-m3',
            title: 'Entrevista con Seguridad Andes Ltda.',
            start: '2026-12-15T10:00',
            end: '2026-12-15T11:00',
            location: 'Av. Concha y Toro 1234, Puente Alto',
        });
        expect(interviewEvent({ ...card, lineas: ['Por definir'] }, 'x', 60, 'u')).toBeNull();
    });
    it('el .ics sale de buildIcs (RFC 5545, con DTSTAMP) y Google Calendar recibe las mismas horas', () => {
        const event = interviewEvent(card, 'Entrevista', 60, 'conv-1-m3');
        if (!event) throw new Error('sin evento');
        const ics = buildIcs(event, new Date(Date.UTC(2026, 11, 10, 16, 0)));
        expect(ics).toContain('DTSTAMP:20261210T160000Z');
        expect(ics).toContain('DTSTART:20261215T100000');
        expect(ics).toContain('LOCATION:Av. Concha y Toro 1234\\, Puente Alto');
        expect(googleCalendarUrl(event)).toContain('&dates=20261215T100000/20261215T110000');
    });
});

describe('punto de verificación', () => {
    it('organización verificada sí; hogar y persona sin identidad ni teléfono, no', () => {
        expect(peerVerified(conv('conv-jorge-seguridad-andes').con)).toBe(true);
        expect(peerVerified(conv('conv-marta-familia').con)).toBe(false);
        expect(peerVerified(conv('conv-carolina-marta').con)).toBe(false);
    });
});
