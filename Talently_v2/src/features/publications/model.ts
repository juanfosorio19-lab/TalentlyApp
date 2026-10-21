// Del dato de demostración a lo que muestra DET-01: estado del CTA, destino
// de «Ver mi postulación», ícono de cada fila y de cada requisito.
import { paths } from '../../app/paths';
import { formatAmount } from '../../ui/Amount';
import type { BadgeStatus } from '../../ui/Badge/badgeTones';
import {
    IconCalendar,
    IconChat,
    IconClock,
    IconDocument,
    IconHome,
    IconInfo,
    IconLocation,
    IconPerson,
    IconPhone,
    IconShield,
    IconStar,
    type IconComponent,
} from '../../ui/icons';
import { getApplications, getConversations, getManagedPublication } from '../demo/data';
import type { DemoActor } from '../demo/session';
import type { DemoConversation, DemoPublication, DemoRow } from '../demo/types';
import { copy } from './copy';
import { phoneVerifiedInData, startsWithoutApplication } from './mock';
import type { PublicationSession } from './store';

/** Qué ofrece el CTA fijo de DET-01. */
export type DetailCta =
    /** Quien publica: «Gestionar publicación» (GES-01). */
    | { kind: 'own' }
    /** Ya no recibe postulaciones: Banner y «Ver ofertas parecidas». */
    | { kind: 'closed' }
    /** Abierta: «Tomar turno» (o la lista de espera si no quedan cupos) o el par «Me interesa». */
    | { kind: 'open'; waitlist: boolean }
    /** Ya postuló: «Ver mis postulaciones» o «Ver mi postulación». */
    | { kind: 'applied'; estado: BadgeStatus; to: string; label: string };

/** Solo «Activa» recibe postulaciones. */
export function isAccepting(pub: DemoPublication): boolean {
    return pub.estado === 'Activa';
}

export function isOwnPublication(actor: DemoActor, pub: DemoPublication): boolean {
    return pub.autor.id === actor.id || getManagedPublication(pub.id)?.ownerId === actor.id;
}

/** La postulación de los datos de demostración (salvo las que el prototipo muestra antes de postular). */
function dataApplication(actor: DemoActor, pub: DemoPublication) {
    if (startsWithoutApplication(actor.id, pub.id)) return undefined;
    return getApplications(actor.id).find((a) => a.publicationId === pub.id);
}

/** A dónde lleva «Ver mi postulación» / «Ver mis postulaciones» (ACT-02, PRC-01 o TUR-01). */
function applicationTarget(actor: DemoActor, pub: DemoPublication): { to: string; label: string } {
    const app = getApplications(actor.id).find((a) => a.publicationId === pub.id);
    if (pub.tipo === 'turno') {
        if (app?.miTurno && app.estado === 'Confirmado') return { to: paths.miTurno(app.id), label: copy.cta.myShift };
        return { to: paths.actividad('postulaciones'), label: copy.cta.myApplications };
    }
    if (app?.processId) return { to: paths.proceso(app.processId), label: copy.cta.myApplication };
    return { to: paths.actividad('postulaciones'), label: copy.cta.myApplication };
}

export function detailCta(actor: DemoActor, pub: DemoPublication, session: PublicationSession): DetailCta {
    if (isOwnPublication(actor, pub)) return { kind: 'own' };
    const estado = session.application?.estado ?? dataApplication(actor, pub)?.estado;
    if (estado) return { kind: 'applied', estado, ...applicationTarget(actor, pub) };
    if (!isAccepting(pub)) return { kind: 'closed' };
    const waitlist = pub.tipo === 'turno' && pub.cupos.left <= 0;
    return { kind: 'open', waitlist };
}

/** ¿Tiene el celular verificado (en los datos o en esta sesión)? */
export function hasVerifiedPhone(actor: DemoActor, session: PublicationSession): boolean {
    return session.phoneVerified || phoneVerifiedInData(actor.id);
}

/** La conversación que abre el match (DET-03): la del actor sobre este empleo. */
export function matchConversation(actor: DemoActor, pub: DemoPublication): DemoConversation | undefined {
    if (pub.tipo !== 'empleo') return undefined;
    return getConversations(actor.id).find((c) => c.contexto.publicationId === pub.id);
}

/** Ícono de una fila del detalle, según su rótulo (prototipo DET-01). */
export function rowIcon(label: string): IconComponent {
    if (/^(Punto de encuentro|Lugar de trabajo|Dirección)/.test(label)) return IconLocation;
    if (/^(Sistema de turno|Horario|Días y horario)/.test(label)) return IconCalendar;
    if (label.startsWith('Vestimenta')) return IconPerson;
    if (label.startsWith('Nota de la organización')) return IconChat;
    if (label.startsWith('Horas')) return IconClock;
    if (label.startsWith('Contexto del hogar')) return IconHome;
    return IconInfo;
}

/** «$30.000 líquidos por turno · te paga Banquetería Rosa SpA directamente». */
export function rowText(row: DemoRow): string {
    const main = row.monto ? formatAmount(row.monto) : (row.value ?? '');
    return row.detalle ? `${main} · ${row.detalle}` : main;
}

/** Ícono de un requisito (prototipo DET-01): escudo, estrella, documento o reloj. */
export function requirementIcon(texto: string): IconComponent {
    if (texto.startsWith('Identidad')) return IconShield;
    if (texto.startsWith('Nota')) return IconStar;
    if (texto.startsWith('Teléfono')) return IconPhone;
    if (texto.includes('experiencia')) return IconClock;
    return IconDocument;
}
