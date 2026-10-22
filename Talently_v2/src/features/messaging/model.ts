// Lo que Mensajes lee de los datos de demostración, ya listo para las
// pantallas. Solo usa las funciones de acceso de features/demo (nunca sus
// constantes DEMO_*): cuando vuelva Supabase no cambia nada aquí.
import type { AvatarKind } from '../../ui/Avatar';
import { PUBLICATION_TYPES, type ContextChipContent } from '../../ui/ContextChip';
import type { MessageStatus } from '../../ui/MessageBubble';
import { paths } from '../../app/paths';
import type { CalendarEvent } from '../../domain/calendario';
import { DEMO_TODAY, getApplications, getManagedPublication, getProcess } from '../demo/data';
import type { DemoConversation, DemoMessage, DemoSystemCard, DemoViewerId } from '../demo/types';
import { copy, type InboxFilter } from './copy';
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
 * mira: quien postuló, su proceso (PRC-01, final del flujo 3) o su turno
 * confirmado (TUR-01); quien publicó, el proceso de esa persona o la gestión
 * de la publicación (GES-01); si no, el detalle (DET-01). `canOpen` (de
 * useOpenPath) salta lo que el router todavía no tiene: el chip nunca termina
 * en SYS-404. `null` si la publicación ya no existe en la demo (turnos
 * pasados): el chip se muestra sin poder tocarse.
 */
export function contextPath(
    conv: DemoConversation,
    viewerId: DemoViewerId,
    canOpen: (path: string) => boolean = () => true,
): string | null {
    const publicationId = conv.contexto.publicationId;
    if (!publicationId) return null;
    const detail = paths.publicacion(publicationId);
    return [...contextTargets(conv, viewerId, publicationId), detail].find(canOpen) ?? detail;
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

function fromDemo(m: DemoMessage): ChatItem {
    if (m.tipo === 'sistema') return { kind: 'sistema', id: m.id, dia: m.dia, tarjeta: m.tarjeta };
    return {
        kind: 'texto',
        id: m.id,
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
    // Lo hecho en esta sesión es lo más nuevo de la bandeja: «ahora», en la misma
    // escala relativa que «hace 5 min» (spec §5.2), no la hora del mensaje («13:00»).
    const fresh = last !== undefined && state.entries.some((e) => e.id === last.id);
    return {
        ...base,
        preview,
        when: fresh ? copy.inbox.justNow : (last?.hora ?? conv.cuando),
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

// ─── Filtros de la bandeja ──────────────────────────────────────────────────

export const ALL = 'todos';

const TYPE_FILTERS: readonly InboxFilter[] = ['todos', 'empleo', 'turno'];

export interface InboxFilters {
    /** Parámetro de la URL (con replace): `?tipo=empleo` (persona) o `?pub=<id>` (organización). */
    param: 'tipo' | 'pub';
    /** Nombre del grupo para lectores de pantalla. */
    label: string;
    /** «Todos» primero. */
    options: { value: string; label: string }[];
}

/**
 * Persona: Todos · Empleo · Turno (prototipo MSG-01). Organización: «Igual,
 * con filtro por publicación» (spec §5.2): Todos y cada publicación con
 * conversaciones, en el orden de la bandeja. Con una sola publicación no hay
 * nada que filtrar y no se muestran.
 */
export function inboxFilters(rows: readonly InboxRow[], audience: 'persona' | 'organizacion'): InboxFilters | null {
    if (audience === 'persona') {
        return {
            param: 'tipo',
            label: copy.inbox.filtersLabel,
            options: TYPE_FILTERS.map((f) => ({ value: f, label: copy.inbox.filters[f] })),
        };
    }
    const publications = new Map<string, string>();
    for (const { conv } of rows) {
        const id = conv.contexto.publicationId;
        if (id && !publications.has(id)) publications.set(id, contextOf(conv.contexto.tipo, conv.contexto.chip).title);
    }
    if (publications.size < 2) return null;
    return {
        param: 'pub',
        label: copy.inbox.publicationFiltersLabel,
        options: [{ value: ALL, label: copy.inbox.filters.todos }, ...[...publications].map(([value, label]) => ({ value, label }))],
    };
}

/** El valor de la URL si es una opción; si no, «Todos». */
export function selectedFilter(filters: InboxFilters | null, raw: string | null): string {
    return filters && raw && filters.options.some((o) => o.value === raw) ? raw : ALL;
}

export function matchesFilter(row: InboxRow, filters: InboxFilters | null, value: string): boolean {
    if (!filters || value === ALL) return true;
    return filters.param === 'tipo' ? row.conv.contexto.tipo === value : row.conv.contexto.publicationId === value;
}

/**
 * Filtro de tipo sin conversaciones: su EmptyState («No tienes conversaciones
 * de turnos»). A quien busca trabajo le habla de postular; a quien solo
 * publica (Carolina), de quienes postulan a lo suyo.
 */
export function filteredEmpty(
    filters: InboxFilters | null,
    value: string,
    seeksWork: boolean,
): { title: string; text: string } | null {
    if (filters?.param !== 'tipo' || (value !== 'empleo' && value !== 'turno')) return null;
    const text = seeksWork ? copy.inbox.filteredText[value] : copy.inbox.publisherFilteredText[value];
    return { title: copy.inbox.filteredTitle[value], text };
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

// ─── Entrevista al calendario ───────────────────────────────────────────────

/** «mar 15 dic · 10:00» → «2026-12-15T10:00», con el año de la demo. */
function parseWhen(when: string): { date: string; minutes: number } | null {
    const day = parseDayMonth(when);
    const time = /·\s*(\d{1,2}):(\d{2})/.exec(when);
    const year = day?.y ?? demoToday()?.y;
    if (!day || !time || !year) return null;
    return { date: `${year}-${pad(day.m)}-${pad(day.d)}`, minutes: Number(time[1]) * 60 + Number(time[2]) };
}

/** Fecha y minutos del día → «2026-12-15T11:00» (si pasa de medianoche, al día siguiente). */
function localDateTime(date: string, minutes: number): string {
    const [y = 1970, m = 1, d = 1] = date.split('-').map(Number);
    const at = new Date(Date.UTC(y, m - 1, d) + minutes * 60_000);
    return `${at.getUTCFullYear()}-${pad(at.getUTCMonth() + 1)}-${pad(at.getUTCDate())}T${pad(at.getUTCHours())}:${pad(at.getUTCMinutes())}`;
}

/**
 * La entrevista de la tarjeta («mar 15 dic · 10:00», «Av. Concha y Toro 1234,
 * Puente Alto») como evento de calendario, en hora local de Chile, para
 * buildIcs (src/domain/calendario). `null` si la fecha no se entiende.
 */
export function interviewEvent(card: DemoSystemCard, title: string, minutes: number, uid: string): CalendarEvent | null {
    const [when = '', place = ''] = card.lineas;
    const start = parseWhen(when);
    if (!start) return null;
    return {
        uid,
        title,
        start: localDateTime(start.date, start.minutes),
        end: localDateTime(start.date, start.minutes + minutes),
        location: place || undefined,
    };
}

/** En el teléfono, sin plugin de calendario: la plantilla «Crear evento» de Google Calendar, en hora de Chile. */
export function googleCalendarUrl(event: CalendarEvent): string {
    const stamp = (local: string) => `${local.replace(/[-:]/g, '')}00`;
    const query = new URLSearchParams({ action: 'TEMPLATE', text: event.title, ctz: 'America/Santiago' });
    if (event.location) query.set('location', event.location);
    // `dates` va con su barra tal cual: «20261215T100000/20261215T110000».
    return `https://calendar.google.com/calendar/render?${query.toString()}&dates=${stamp(event.start)}/${stamp(event.end)}`;
}
