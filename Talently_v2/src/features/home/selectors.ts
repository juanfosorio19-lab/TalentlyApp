// Lógica pura de «Inicio y notificaciones» (sin React): qué bloques se ven,
// a dónde lleva una notificación y qué se publica en PUBL-01. Los datos
// salen de src/features/demo y lo que cambia en la sesión, de
// demo/sessionStore (las pantallas se lo pasan a estas funciones).
import type { DemoActorId } from '../demo/session';
import { processPublicationId, targetPath } from '../demo/targets';
import type {
    DemoAgendaEvent,
    DemoApplication,
    DemoHomeBlock,
    DemoNews,
    DemoNotification,
    DemoNotificationGroup,
    DemoProfileTip,
    DemoTarget,
} from '../demo/types';
import { copy } from './copy';

// ─── INI-01 ─────────────────────────────────────────────────────────────────

/** «Subir CV en PDF» de «Te falta 1 cosa» (la misma regla que usa Perfil). */
export const isCvTip = (tip: DemoProfileTip): boolean => tip.accion.includes('CV');

/**
 * «Hoy en tu agenda» con lo de esta sesión: un turno que se canceló en
 * TUR-01 ya no es un compromiso (la Agenda de Actividad tampoco lo muestra).
 */
export function currentAgenda(eventos: readonly DemoAgendaEvent[], applications: readonly DemoApplication[]): DemoAgendaEvent[] {
    const cancelled = new Set(applications.filter((a) => a.estado === 'Cancelaste').map((a) => a.id));
    return eventos.filter((e) => !(e.destino.pantalla === 'mi-turno' && cancelled.has(e.destino.applicationId)));
}

export interface HomeSessionState {
    /** Postulaciones del actor tal como las ve en la sesión (useApplications). */
    applications: readonly DemoApplication[];
    /** ¿Ya subió su CV en Perfil? Entonces «Te falta 1 cosa · Subir CV» no se muestra. */
    cvSubido: boolean;
}

/**
 * ¿La novedad habla de algo que el actor tiene en esta sesión? Los datos
 * traen el «después» del prototipo: Jorge y Pedro parten sin postular a
 * Guardia 4x4 y a Mecánico/a automotriz (inicio de los flujos 3 y de apoyo),
 * así que «te citó a entrevista» no se muestra hasta que postulan (y PRC-01
 * o ACT-02 dirían lo contrario). Los destinos que no son de una postulación
 * se quedan.
 */
function newsBelongsToSession(destino: DemoTarget, applications: readonly DemoApplication[]): boolean {
    switch (destino.pantalla) {
        case 'proceso':
            return applications.some((a) => a.publicationId === processPublicationId(destino.processId));
        case 'publicacion':
            return applications.some((a) => a.publicationId === destino.publicationId);
        case 'mi-turno':
            return applications.some((a) => a.id === destino.applicationId);
        default:
            return true;
    }
}

/** A dónde lleva una postulación: PRC-01 (empleo), TUR-01 (turno confirmado) o su detalle. */
function applicationTarget(a: DemoApplication): DemoTarget {
    if (a.processId) return { pantalla: 'proceso', processId: a.processId };
    if (a.miTurno) return { pantalla: 'mi-turno', applicationId: a.id };
    return { pantalla: 'publicacion', publicationId: a.publicationId };
}

/**
 * «Tus postulaciones» // no está en el prototipo: en vez de «Aún no tienes
 * actividad» cuando Jorge recién registrado ya postuló en la sesión (las
 * mismas filas de ACT-02, con su estado).
 */
export function applicationsBlock(applications: readonly DemoApplication[]): DemoHomeBlock {
    const items: DemoNews[] = applications.map((a) => ({
        id: a.id,
        iniciales: a.autor.iniciales,
        titulo: a.titulo,
        detalle: a.detalle,
        estado: a.estado,
        destino: applicationTarget(a),
    }));
    return { tipo: 'novedades', titulo: copy.home.tusPostulaciones, items };
}

/** Los bloques de Inicio al día con la sesión (los datos traen el estado inicial). */
export function homeBlocks(bloques: readonly DemoHomeBlock[], session: HomeSessionState): DemoHomeBlock[] {
    const { applications } = session;
    return bloques.flatMap((b): DemoHomeBlock[] => {
        if (b.tipo === 'agenda') return [{ ...b, eventos: currentAgenda(b.eventos, applications) }];
        if (b.tipo === 'completar' && session.cvSubido && isCvTip(b.aviso)) return [];
        if (b.tipo === 'novedades') {
            const items = b.items.filter((n) => newsBelongsToSession(n.destino, applications));
            return items.length ? [{ ...b, items }] : [];
        }
        // «Aún no tienes actividad» deja de ser cierto en cuanto postula (ACT-02 ya lo muestra).
        if (b.tipo === 'vacio' && applications.length > 0) return [applicationsBlock(applications)];
        return [b];
    });
}

// ─── NOT-01 ─────────────────────────────────────────────────────────────────

export const NOTIFICATION_GROUPS: readonly DemoNotificationGroup[] = ['Hoy', 'Ayer', 'Esta semana', 'Antes'];

export interface NotificationGroup {
    grupo: DemoNotificationGroup;
    items: DemoNotification[];
}

/** Hoy, Ayer, Esta semana y Antes, sin grupos vacíos. */
export function groupNotifications(items: readonly DemoNotification[]): NotificationGroup[] {
    return NOTIFICATION_GROUPS.map((grupo) => ({ grupo, items: items.filter((n) => n.grupo === grupo) })).filter(
        (g) => g.items.length > 0,
    );
}

export interface NotificationRoute {
    /** Otro actor de la misma persona al que se refiere (flujo 7): se cambia antes de abrir. */
    switchTo?: DemoActorId;
    /** La ruta de destino, solo si su pantalla existe; `null` = «Disponible pronto» y sin cambiar de actor. */
    path: string | null;
}

/**
 * A quién y a dónde lleva una notificación (spec §5.3 regla 7). La ruta se
 * calcula para el actor de la notificación y se valida con `canOpen` ANTES
 * de cambiar de actor: nunca se cambia para terminar en SYS-404.
 */
export function resolveNotification(
    n: DemoNotification,
    currentId: DemoActorId,
    switchableIds: readonly DemoActorId[],
    canOpen: (path: string) => boolean,
): NotificationRoute {
    const switchTo = n.actorId !== currentId ? switchableIds.find((id) => id === n.actorId) : undefined;
    const path = n.destino ? targetPath(n.destino, switchTo ?? currentId) : null;
    return { switchTo, path: path && canOpen(path) ? path : null };
}

// ─── PUBL-01 ────────────────────────────────────────────────────────────────

/** Organización: Empleo o Turno. Hogar: Aviso para mi hogar o Turno para un evento. */
export type PublishKind = 'empleo' | 'turno' | 'hogar' | 'evento';
export type Publisher = 'organizacion' | 'hogar';

const KINDS: Record<Publisher, readonly PublishKind[]> = {
    organizacion: ['empleo', 'turno'],
    hogar: ['hogar', 'evento'],
};

/** La opción marcada de entrada, como en el prototipo (PUBL-01: Turno; PUBL-01-carolina: Aviso para mi hogar). */
const DEFAULT_KIND: Record<Publisher, PublishKind> = { organizacion: 'turno', hogar: 'hogar' };

export const publishKinds = (as: Publisher): readonly PublishKind[] => KINDS[as];

/**
 * La opción marcada según la URL (`?sheet=publicar&tipo=`). Un tipo que no
 * es de este actor (`tipo=hogar` en una organización) no deja la hoja sin
 * opción: vale la del prototipo.
 */
export function selectedKind(as: Publisher, tipo: string | null): PublishKind {
    return KINDS[as].find((k) => k === tipo) ?? DEFAULT_KIND[as];
}

/** El asistente que abre «Continuar»: un turno para un evento del hogar es un turno (PUBL-03). */
export function wizardOf(kind: PublishKind): 'empleo' | 'turno' | 'hogar' {
    return kind === 'evento' ? 'turno' : kind;
}
