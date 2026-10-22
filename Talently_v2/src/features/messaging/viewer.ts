// Quién mira Mensajes: el actor de la sesión (useDemoSession) o, en el flujo
// 10, Marta Huanca (mock.ts: ?demo=marta, mientras la demo no la tenga como
// actor). La bandeja, la conversación y el badge de la pestaña (unread.ts)
// leen de aquí. La campana no: abre NOT-01, que es del actor de la sesión, y
// cuenta lo mismo que esa pantalla (NotificationsButton).
import { useDemoSession, type DemoActor } from '../demo/session';
import type { DemoViewerId } from '../demo/types';
import { VIEWER_OVERRIDE } from './mock';

export interface Viewer {
    viewerId: DemoViewerId;
    /** INI-01-jorge-nuevo: todavía no tiene conversaciones ni notificaciones. */
    recienRegistrado: boolean;
    /**
     * Organización: la bandeja filtra por publicación (spec §5.2). Persona:
     * Todos · Empleo · Turno.
     */
    audience: 'persona' | 'organizacion';
    /**
     * Busca trabajo (o todavía no elige qué hacer en Talently). `false` para
     * quien solo publica (organización, hogar): su EmptyState le habla a
     * quien recibe postulaciones.
     */
    seeksWork: boolean;
    /** A qué segmento de Explorar lleva el EmptyState: turnos, salvo quien solo busca empleo. */
    explore: 'turno' | 'empleo';
    /**
     * Quien mira es el actor de la sesión. `false` en el flujo 10 (Marta): las
     * pantallas de otros features (DET-01, PRC-01, NOT-01…) se dibujan para el
     * actor de la sesión (Matías), así que Mensajes no lleva a ellas.
     */
    isActor: boolean;
}

function viewerOf(actor: DemoActor, recienRegistrado: boolean): Viewer {
    if (VIEWER_OVERRIDE === 'marta') {
        // Marta busca empleo como asesora del hogar (flujo 10).
        return { viewerId: 'marta', recienRegistrado: false, audience: 'persona', seeksWork: true, explore: 'empleo', isActor: false };
    }
    const caps = actor.capabilities;
    const seeks = caps.includes('turnos') || caps.includes('empleo');
    return {
        viewerId: actor.id,
        recienRegistrado,
        audience: actor.kind === 'organizacion' ? 'organizacion' : 'persona',
        seeksWork: actor.kind !== 'organizacion' && (seeks || caps.length === 0),
        explore: caps.includes('empleo') && !caps.includes('turnos') ? 'empleo' : 'turno',
        isActor: true,
    };
}

export function useViewer(): Viewer {
    const { actor, recienRegistrado } = useDemoSession();
    return viewerOf(actor, recienRegistrado);
}
