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
import { getManagedPublication } from '../demo/data';
import type { DemoActor } from '../demo/session';
import type { DemoApplication, DemoPublication, DemoRow } from '../demo/types';
import { copy } from './copy';

/** Qué ofrece el CTA fijo de DET-01. */
export type DetailCta =
    /** Quien publica (o la persona que administra la organización): «Gestionar publicación» (GES-01). */
    | { kind: 'own'; ownerId: DemoActor['id'] }
    /** Una organización mira la publicación de otra: no postula (solo el aviso). */
    | { kind: 'org' }
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

/**
 * Quién gestiona la publicación entre los actores de la demo: quien la
 * publicó o la organización dueña. `undefined` si no es del actor ni de una
 * organización que la persona administra.
 */
export function ownerFor(actor: Pick<DemoActor, 'id' | 'orgs'>, pub: DemoPublication): DemoActor['id'] | undefined {
    const owners = [pub.autor.id, getManagedPublication(pub.id)?.ownerId].filter((id): id is string => Boolean(id));
    if (owners.includes(actor.id)) return actor.id;
    return actor.orgs?.find((org) => owners.includes(org));
}

/** A dónde lleva «Ver mi postulación» / «Ver mis postulaciones» (ACT-02, PRC-01 o TUR-01). */
function applicationTarget(pub: DemoPublication, app: DemoApplication | undefined): { to: string; label: string } {
    if (pub.tipo === 'turno') {
        if (app?.miTurno && app.estado === 'Confirmado') return { to: paths.miTurno(app.id), label: copy.cta.myShift };
        return { to: paths.actividad('postulaciones'), label: copy.cta.myApplications };
    }
    if (app?.processId) return { to: paths.proceso(app.processId), label: copy.cta.myApplication };
    return { to: paths.actividad('postulaciones'), label: copy.cta.myApplication };
}

/**
 * El CTA según quién mira. `applications` son las del actor tal como las ve
 * en esta sesión (useApplications: respeta Jorge recién registrado y los
 * flujos que parten sin postulación); `sessionEstado`, lo que eligió al
 * postular ahora («En lista de espera»).
 */
export function detailCta(
    actor: Pick<DemoActor, 'id' | 'kind' | 'orgs'>,
    pub: DemoPublication,
    applications: readonly DemoApplication[],
    sessionEstado?: BadgeStatus,
): DetailCta {
    const ownerId = ownerFor(actor, pub);
    if (ownerId) return { kind: 'own', ownerId };
    if (actor.kind === 'organizacion') return { kind: 'org' };
    const app = applications.find((a) => a.publicationId === pub.id);
    const estado = sessionEstado ?? app?.estado;
    if (estado) return { kind: 'applied', estado, ...applicationTarget(pub, app) };
    if (!isAccepting(pub)) return { kind: 'closed' };
    const waitlist = pub.tipo === 'turno' && pub.cupos.left <= 0;
    return { kind: 'open', waitlist };
}

/**
 * Enlace para compartir: la publicación sola, sin el actor de la demo
 * (`?demo=`), la hoja abierta ni nada de la sesión. `href` es el de
 * useHref(paths.publicacion(id)) («#/p/…» con HashRouter).
 */
export function shareUrl(location: { origin: string; pathname: string }, href: string): string {
    // HashRouter: la página (v3.html) más «#/p/…». BrowserRouter: la ruta sola.
    return href.startsWith('#') ? `${location.origin}${location.pathname}${href}` : `${location.origin}${href}`;
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
