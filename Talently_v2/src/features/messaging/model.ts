// Lo que Mensajes lee de los datos de demostración, ya listo para las
// pantallas. Solo usa las funciones de acceso de features/demo (nunca sus
// constantes DEMO_*): cuando vuelva Supabase no cambia nada aquí.
import type { AvatarKind } from '../../ui/Avatar';
import { PUBLICATION_TYPES, type ContextChipContent } from '../../ui/ContextChip';
import type { MessageStatus } from '../../ui/MessageBubble';
import { paths } from '../../app/paths';
import { DEMO_TODAY, getApplications, getManagedPublication, getProcess } from '../demo/data';
import type { DemoConversation, DemoMessage, DemoSystemCard, DemoViewerId } from '../demo/types';
import { copy, type InboxFilter } from './copy';
import { isPendingRoute } from './pending';
import type { ConversationState } from './store';

// ─── Contexto («Turno · Garzón · hoy») ──────────────────────────────────────

/**
 * El texto listo de los datos («Turno · Guardia de eventos · sáb 12 dic») en
 * las partes del ContextChip: tipo, título y el dato del final. El chip lo
 * vuelve a armar igual (contextChipText).
 */
export function contextOf(tipo: DemoConversation['contexto']['tipo'], texto: string): ContextChipContent {
    const parts = texto.split(' · ');
    if (parts[0] === PUBLICATION_TYPES[tipo].label) parts.shift();
    const [title = texto, ...rest] = parts;
    return { kind: tipo, title, detail: rest.length > 0 ? rest.join(' · ') : undefined };
}

// ─── La otra parte ──────────────────────────────────────────────────────────

export function peerKind(con: DemoConversation['con']): AvatarKind {
    // Organización y hogar («Familia en …») = cuadrado; persona = redondo.
    return con.tipo === 'persona' ? 'person' : 'org';
}

/**
 * Punto de verificación del Avatar: solo con verificación real. Organización
 * verificada (Seguridad Andes Ltda.) o persona con identidad o teléfono
 * verificados. El hogar no lo lleva: su verificación es la de la persona que
 * lo administra (MSG-02b, «Familia en Ñuñoa»).
 */
export function peerVerified(con: DemoConversation['con']): boolean {
    const verified = con.verificaciones.filter((v) => v.status === 'verified').map((v) => v.label);
    if (con.tipo === 'organizacion') return verified.includes('Organización verificada');
    if (con.tipo === 'persona') return verified.some((l) => l === 'Identidad verificada' || l === 'Teléfono verificado');
    return false;
}

/** Quien trabaja es quien conversa con una organización o un hogar: solo él comparte su certificado (M5). */
export function viewerWorks(conv: DemoConversation): boolean {
    return conv.con.tipo !== 'persona';
}

/** Perfil público de la otra parte (PRF-10 o PRF-11). */
export function peerProfilePath(con: DemoConversation['con']): string {
    return con.tipo === 'persona' ? paths.perfilPublico(con.id) : paths.organizacion(con.id);
}

// ─── A dónde lleva el ContextChip ───────────────────────────────────────────

/**
 * El chip fijo bajo el AppBar abre lo más útil de esa publicación para quien
 * mira: quien postuló, su proceso (PRC-01, flujo 3) o su turno confirmado
 * (TUR-01); quien publicó, el proceso de esa persona o la gestión de la
 * publicación (GES-01); si no, el detalle (DET-01). Lo que el router aún no
 * tiene (pending.ts) se salta, como el prototipo cuando falta PRC-01: el chip
 * nunca termina en SYS-404. `null` si la publicación ya no existe en la demo
 * (turnos pasados).
 */
export function contextPath(conv: DemoConversation, viewerId: DemoViewerId): string | null {
    const publicationId = conv.contexto.publicationId;
    if (!publicationId) return null;
    const detail = paths.publicacion(publicationId);
    return contextTargets(conv, viewerId, publicationId).find((to) => !isPendingRoute(to)) ?? detail;
}

/** Los destinos del chip antes que el detalle, del más útil al menos. */
function contextTargets(conv: DemoConversation, viewerId: DemoViewerId, publicationId: string): string[] {
    if (viewerId === 'marta') return [];
    const targets: string[] = [];
    const application = getApplications(viewerId).find((a) => a.publicationId === publicationId);
    if (application?.processId && getProcess(application.processId)) targets.push(paths.proceso(application.processId));
    if (application?.miTurno) targets.push(paths.miTurno(application.id));
    const managed = getManagedPublication(publicationId);
    if (managed?.ownerId === viewerId) {
        const person = managed.postulantes?.personas.find((p) => p.conversationId === conv.id);
        if (person?.processId && getProcess(person.processId)) targets.push(paths.proceso(person.processId));
        targets.push(paths.gestionarPublicacion(publicationId));
    }
    return targets;
}

// ─── Mensajes de la conversación ────────────────────────────────────────────

export interface ChatText {
    kind: 'texto';
    id: string;
    dia: string;
    own: boolean;
    texto: string;
    hora: string;
    status?: MessageStatus;
}

export interface ChatCard {
    kind: 'sistema';
    id: string;
    dia: string;
    tarjeta: DemoSystemCard;
    /** Certificado compartido en esta sesión: «Dejar de compartir» apaga esta entrada. */
    shareId?: string;
    /** Hora en que se compartió (la tarjeta no la muestra; la usa la fila de MSG-01). */
    hora?: string;
}

export type ChatItem = ChatText | ChatCard;

const STATUS: Record<'Enviado' | 'Leído', MessageStatus> = { Enviado: 'sent', Leído: 'read' };

function fromDemo(m: DemoMessage, idPrefix = ''): ChatItem {
    if (m.tipo === 'sistema') return { kind: 'sistema', id: idPrefix + m.id, dia: m.dia, tarjeta: m.tarjeta };
    return {
        kind: 'texto',
        id: idPrefix + m.id,
        dia: m.dia,
        own: m.de === 'yo',
        texto: m.texto,
        hora: m.hora,
        status: m.de === 'yo' && m.estado ? STATUS[m.estado] : undefined,
    };
}

/**
 * Los mensajes de la demo y, después, lo hecho en esta sesión. Compartir el
 * certificado agrega solo su tarjeta, ahora, y sin «Visto por…»: esa línea sale
 * del registro real de aperturas (spec §10.1.1) y nadie la ha abierto todavía.
 * Lo que la otra parte responde después (MSG-02b-marta) no se inventa.
 */
export function chatItems(conv: DemoConversation, state: ConversationState): ChatItem[] {
    const items = conv.mensajes.map((m) => fromDemo(m));
    const shared = conv.certificado?.alCompartir[0];
    for (const e of state.entries) {
        if (e.kind === 'texto') {
            items.push({ kind: 'texto', id: e.id, dia: copy.chat.today, own: true, texto: e.texto, hora: e.hora, status: e.status });
            continue;
        }
        if (shared?.tipo !== 'sistema') continue;
        const card: DemoSystemCard = {
            ...shared.tarjeta,
            lineas: shared.tarjeta.lineas.filter((l) => !l.startsWith('Visto por')),
            disponible: shared.tarjeta.disponible && !e.off,
        };
        items.push({ kind: 'sistema', id: e.id, dia: copy.chat.today, tarjeta: card, shareId: e.id, hora: e.hora });
    }
    return items;
}

/** Fecha de emisión del certificado que ya subió («Emitido el 30-11-2026»), para la hoja MSG-02b. */
export function certificateIssued(conv: DemoConversation): string | undefined {
    const first = conv.certificado?.alCompartir[0];
    return first?.tipo === 'sistema' ? first.tarjeta.lineas.find((l) => l.startsWith('Emitido')) : undefined;
}

/** El certificado está pedido y no compartido: Banner «Compartirlo es voluntario.» sobre el Composer. */
export function certificatePending(conv: DemoConversation, state: ConversationState): boolean {
    return Boolean(conv.certificado) && !state.entries.some((e) => e.kind === 'certificado');
}

/** Hay una tarjeta compartida que todavía se puede ver. */
export function certificateActive(state: ConversationState): boolean {
    return state.entries.some((e) => e.kind === 'certificado' && !e.off);
}

// ─── La fila de la bandeja (MSG-01) ─────────────────────────────────────────

export interface InboxRow {
    conv: DemoConversation;
    context: ContextChipContent;
    preview: string | null;
    when: string | null;
    unread: number;
    newMatch: boolean;
    touched: number;
    /** Marca del último mensaje de los datos (ms), para ordenar la bandeja. */
    lastAt: number;
}

/**
 * Con actividad en esta sesión, la vista previa y la hora salen de lo último:
 * un mensaje o el certificado recién compartido («Tú: Certificado de
 * antecedentes»; no está en el prototipo).
 */
export function inboxRow(conv: DemoConversation, state: ConversationState): InboxRow {
    const base = {
        conv,
        context: contextOf(conv.contexto.tipo, conv.contexto.texto),
        unread: state.read ? 0 : conv.sinLeer,
        touched: state.touched,
        lastAt: lastMessageAt(conv),
    };
    if (state.entries.length === 0) {
        return { ...base, preview: conv.vistaPrevia, when: conv.cuando, newMatch: conv.nuevoMatch };
    }
    const last = chatItems(conv, state)
        .filter((i) => i.kind === 'texto' || i.shareId)
        .at(-1);
    const preview = !last
        ? conv.vistaPrevia
        : last.kind === 'texto'
          ? `${last.own ? copy.chat.youPrefix : ''}${last.texto}`
          : `${copy.chat.youPrefix}${last.tarjeta.titulo}`;
    return {
        ...base,
        preview,
        when: last?.hora ?? conv.cuando,
        // Con el primer mensaje, el match sale de «Nuevos matches» y pasa a la lista.
        newMatch: false,
    };
}

const desc = (a: number, b: number) => (a === b ? 0 : a > b ? -1 : 1);

/**
 * Por último mensaje (spec §5.2): lo que tuvo actividad en esta sesión arriba
 * (es lo más reciente, a la hora de la demo); el resto, por la marca de su
 * último mensaje en los datos.
 */
export function sortRows(rows: InboxRow[]): InboxRow[] {
    return rows
        .map((row, index) => ({ row, index }))
        .sort((a, b) => b.row.touched - a.row.touched || desc(a.row.lastAt, b.row.lastAt) || a.index - b.index)
        .map(({ row }) => row);
}

export function matchesFilter(row: InboxRow, filter: InboxFilter): boolean {
    return filter === 'todos' || row.conv.contexto.tipo === filter;
}

export const FILTERS: readonly InboxFilter[] = ['todos', 'empleo', 'turno'];

export function parseFilter(value: string | null): InboxFilter {
    return FILTERS.includes(value as InboxFilter) ? (value as InboxFilter) : 'todos';
}

// ─── Fechas de la demo ──────────────────────────────────────────────────────

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
const DAY_MS = 86_400_000;
const pad = (n: number) => String(n).padStart(2, '0');

/** «5 dic», «sáb 12 dic», «mar 15 dic · 10:00», «jue 10 dic 2026» → día, mes y año si viene. */
function parseDayMonth(text: string): { d: number; m: number; y?: number } | null {
    const match = /(\d{1,2})\s+([a-z]+)\.?(?:\s+(\d{4}))?/i.exec(text);
    if (!match) return null;
    const monthText = (match[2] ?? '').toLocaleLowerCase('es-CL');
    const m = MONTHS.indexOf(monthText === 'sep' ? 'sept' : monthText) + 1;
    if (m === 0) return null;
    return { d: Number(match[1]), m, y: match[3] ? Number(match[3]) : undefined };
}

/** «jue 10 dic 2026» a las 00:00 (ms, en la hora de pared de la demo). */
function demoToday(): { at: number; y: number } | null {
    const p = parseDayMonth(DEMO_TODAY);
    if (!p?.y) return null;
    return { at: Date.UTC(p.y, p.m - 1, p.d), y: p.y };
}

/** El separador de día del chat («Hoy», «Ayer», «5 dic») a las 00:00; sin año, el último ya pasado. */
function dayStart(dia: string): number | null {
    const today = demoToday();
    if (!today) return null;
    const key = dia.toLocaleLowerCase('es-CL');
    if (key === 'hoy') return today.at;
    if (key === 'ayer') return today.at - DAY_MS;
    const p = parseDayMonth(dia);
    if (!p) return null;
    const at = Date.UTC(p.y ?? today.y, p.m - 1, p.d);
    return p.y === undefined && at > today.at ? Date.UTC(today.y - 1, p.m - 1, p.d) : at;
}

/** Marca del último mensaje de la demo (día + hora); sin mensajes, al final. */
export function lastMessageAt(conv: DemoConversation): number {
    let last = Number.NEGATIVE_INFINITY;
    for (const m of conv.mensajes) {
        const day = dayStart(m.dia);
        if (day === null) continue;
        const time = m.tipo === 'texto' ? /^(\d{1,2}):(\d{2})$/.exec(m.hora) : null;
        const at = day + (time ? (Number(time[1]) * 60 + Number(time[2])) * 60_000 : 0);
        if (at > last) last = at;
    }
    return last;
}

// ─── Entrevista al calendario (.ics) ────────────────────────────────────────

const TIME_ZONE = 'America/Santiago';

/** Cuánto se separa la hora de Chile de UTC en ese instante (cambia con el horario de verano). */
function zoneOffset(utc: number): number {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: TIME_ZONE,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).formatToParts(new Date(utc));
    const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value);
    return Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute')) - utc;
}

/** Hora de pared en Santiago → instante UTC. */
function santiagoToUtc(y: number, m: number, d: number, h: number, min: number): Date {
    const wall = Date.UTC(y, m - 1, d, h, min);
    let utc = wall;
    for (let i = 0; i < 2; i++) utc = wall - zoneOffset(utc);
    return new Date(utc);
}

/** «mar 15 dic · 10:00» → la entrevista en hora de Chile, con el año de la demo. */
function parseWhen(when: string): Date | null {
    const day = parseDayMonth(when);
    const time = /·\s*(\d{1,2}):(\d{2})/.exec(when);
    const year = day?.y ?? demoToday()?.y;
    if (!day || !time || !year) return null;
    return santiagoToUtc(year, day.m, day.d, Number(time[1]), Number(time[2]));
}

/** 20261215T130000Z: fecha y hora UTC de RFC 5545 (§3.3.5, forma 2). */
const utcStamp = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

/** Texto de RFC 5545 (§3.3.11). */
const escapeText = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\r?\n/g, '\\n');

/** Líneas de a lo más 75 octetos; las siguientes empiezan con un espacio (§3.1). */
function fold(line: string): string {
    const encoder = new TextEncoder();
    const chunks: string[] = [];
    let chunk = '';
    let size = 0;
    for (const ch of line) {
        const n = encoder.encode(ch).length;
        if (size + n > (chunks.length === 0 ? 75 : 74)) {
            chunks.push(chunk);
            chunk = '';
            size = 0;
        }
        chunk += ch;
        size += n;
    }
    chunks.push(chunk);
    return chunks.join('\r\n ');
}

/**
 * Calendario de la entrevista (RFC 5545): DTSTAMP obligatorio y horas en UTC,
 * así no hace falta un VTIMEZONE y cualquier calendario la muestra a la hora de
 * Chile. `null` si la fecha no se entiende.
 */
export function interviewIcs(card: DemoSystemCard, title: string, minutes: number, now: Date = new Date()): string | null {
    const [when = '', place = ''] = card.lineas;
    const start = parseWhen(when);
    if (!start) return null;
    const end = new Date(start.getTime() + minutes * 60_000);
    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Talently//Mensajes//ES',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        `UID:${utcStamp(start)}-${title.replace(/[^\p{L}\p{N}]+/gu, '-')}@talently`,
        `DTSTAMP:${utcStamp(now)}`,
        `DTSTART:${utcStamp(start)}`,
        `DTEND:${utcStamp(end)}`,
        `SUMMARY:${escapeText(title)}`,
        `LOCATION:${escapeText(place)}`,
        'END:VEVENT',
        'END:VCALENDAR',
    ]
        .map(fold)
        .join('\r\n')
        .concat('\r\n');
}
