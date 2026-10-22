// Lo que muestra PUBL-07 a partir del borrador recién publicado.
import type { DemoActor } from '../../demo/session';
import type { PublishedSummary } from '../store';
import { hogarTitle, type HogarDraft } from './hogar';
import { orgVerified } from './publisher';
import { turnoUntil, type TurnoDraft } from './turno';

/**
 * Un turno se publica al tiro si la organización está verificada; si no, o
 * si lo publica un hogar, queda en revisión. El aviso del hogar siempre:
 * «Revisamos tu identidad y la primera publicación de cada hogar».
 */
export function summaryOf(actor: DemoActor, draft: TurnoDraft | HogarDraft): PublishedSummary {
    if (draft.kind === 'hogar') return { kind: 'hogar', titulo: hogarTitle(draft), hasta: null, review: true };
    return {
        kind: 'turno',
        titulo: draft.titulo.trim(),
        hasta: turnoUntil(draft),
        review: actor.kind === 'organizacion' ? !orgVerified(actor) : true,
    };
}
