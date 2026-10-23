// Quién mira Mensajes: el actor de la sesión (useDemoSession; en el flujo 10,
// `?demo=marta`, Marta Huanca, que también es actor de la demo). La bandeja,
// la conversación, la campana (NOT-01) y el badge de la pestaña
// (demo/conversationState.useUnreadMessages) leen al mismo actor.
import { useDemoSession, type DemoActor } from '../demo/session';
import type { DemoViewerId } from '../demo/types';

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
     * Persona sin perfiles (INI-01-rosa): Explorar no le muestra turnos ni
     * empleos, así que su EmptyState lleva a «Agregar un perfil», como Inicio,
     * Explorar y la Agenda.
     */
    withoutProfiles: boolean;
}

export function viewerOf(actor: DemoActor, recienRegistrado: boolean): Viewer {
    const caps = actor.capabilities;
    const seeks = caps.includes('turnos') || caps.includes('empleo');
    return {
        viewerId: actor.id,
        recienRegistrado,
        audience: actor.kind === 'organizacion' ? 'organizacion' : 'persona',
        seeksWork: actor.kind !== 'organizacion' && (seeks || caps.length === 0),
        explore: caps.includes('empleo') && !caps.includes('turnos') ? 'empleo' : 'turno',
        withoutProfiles: actor.kind === 'persona' && caps.length === 0,
    };
}

export function useViewer(): Viewer {
    const { actor, recienRegistrado } = useDemoSession();
    return viewerOf(actor, recienRegistrado);
}
