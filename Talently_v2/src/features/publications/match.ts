// DET-03 · ¡Hicieron match!: qué match toca mostrar y con qué datos. Lo usa
// MatchHost (sobre cualquier pantalla) y el detalle, que solo programa el
// match si la organización tiene una conversación con quien postuló.
import { getConversations, getPublication } from '../demo/data';
import type { DemoActor, DemoActorId } from '../demo/session';
import type { PendingMatch } from '../demo/sessionStore';
import type { DemoConversation, DemoPublication } from '../demo/types';

/**
 * Nombre corto de una organización para el texto del match: «Seguridad
 * Andes» de «Seguridad Andes Ltda.» (DET-03). Quita solo la razón social.
 */
export function shortOrgName(nombre: string): string {
    return nombre.replace(/\s+(Ltda\.|Limitada|SpA|S\.A\.|EIRL|E\.I\.R\.L\.)$/u, '');
}

/** La conversación que abre el match: la del actor sobre este empleo. */
export function matchConversation(actorId: DemoActorId, pub: DemoPublication): DemoConversation | undefined {
    if (pub.tipo !== 'empleo') return undefined;
    return getConversations(actorId).find((c) => c.contexto.publicationId === pub.id);
}

/** El próximo match del actor (el que vence primero); los de otro actor esperan a que vuelva. */
export function nextMatch(pending: ReadonlyMap<string, PendingMatch>, actorId: DemoActorId): PendingMatch | undefined {
    let next: PendingMatch | undefined;
    for (const m of pending.values()) {
        if (m.actorId !== actorId) continue;
        if (!next || m.dueAt < next.dueAt) next = m;
    }
    return next;
}

export interface MatchView {
    publicationId: string;
    /** «Enviar mensaje» lleva aquí (MSG-02). */
    conversationId: string;
    person: string;
    org: { name: string; shortName: string };
    publication: string;
}

/** Lo que dice el MatchModal; `undefined` si ya no hay publicación o conversación a la que llevar. */
export function matchView(match: PendingMatch, actor: Pick<DemoActor, 'id' | 'fullName'>): MatchView | undefined {
    const pub = getPublication(match.publicationId);
    if (!pub || actor.id !== match.actorId) return undefined;
    const conversation = matchConversation(actor.id, pub);
    if (!conversation) return undefined;
    return {
        publicationId: pub.id,
        conversationId: conversation.id,
        person: actor.fullName,
        org: { name: pub.autor.nombre, shortName: shortOrgName(pub.autor.nombre) },
        publication: pub.titulo,
    };
}
