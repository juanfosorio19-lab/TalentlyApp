// PUBL-07 · Publicación enviada (/publicar/:tipo/listo), con ResultScreen:
// «Publicada» (PUBL-07-turno) o «En revisión» (PUBL-07-aviso-hogar). Se llega
// con replace al publicar, o desde VER-02 en el flujo 5: entonces termina de
// publicar el aviso que quedó guardado. «Ver publicación» lleva, con replace,
// a GES-01 del turno o a GES-02 del aviso (los de los datos de demostración).
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from '../../../ui/Badge';
import { ResultScreen } from '../../../ui/ResultScreen';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { NotFoundScreen } from '../../../app/system/NotFoundScreen';
import { useDemoSession, type DemoActor } from '../../demo/session';
import { copy } from '../copy';
import { initialHogar } from '../model/hogar';
import { publishedId, type WizardKind } from '../model/publisher';
import { summaryOf } from '../model/summary';
import { initialTurno } from '../model/turno';
import {
    hogarDrafts,
    markIdentitySent,
    markPublished,
    turnoDrafts,
    useAwaitingIdentity,
    usePublished,
    type PublishedSummary,
} from '../store';
import '../publish.css';

export const screenId = 'PUBL-07';

export function PublishResultScreen() {
    const { tipo } = useParams();
    const { actor } = useDemoSession();
    if (tipo !== 'turno' && tipo !== 'hogar') return <NotFoundScreen />;
    return <PublishResult key={`${actor.id}:${tipo}`} kind={tipo} actor={actor} />;
}

/** El borrador del actor (el guardado o, si no hay, con el que parte el asistente). */
function draftOf(kind: WizardKind, actor: DemoActor) {
    return kind === 'turno'
        ? (turnoDrafts.get(actor.id)?.draft ?? initialTurno(actor.id))
        : (hogarDrafts.get(actor.id)?.draft ?? initialHogar(actor.id));
}

function resultText(kind: WizardKind, actor: DemoActor, s: PublishedSummary): string {
    if (!s.review) return copy.resultado.publicadaTurno(s.titulo);
    if (kind === 'hogar') return copy.resultado.revisionHogar('aviso');
    return actor.kind === 'organizacion' ? copy.resultado.revisionOrg : copy.resultado.revisionHogar('turno');
}

function PublishResult({ kind, actor }: { kind: WizardKind; actor: DemoActor }) {
    const { open } = useOpenPath();
    const published = usePublished(actor.id, kind);
    const awaiting = useAwaitingIdentity(actor.id, kind);
    // Lo que se muestra mientras no hay nada publicado en la sesión (un enlace directo): el borrador.
    const pending = useMemo(() => summaryOf(actor, draftOf(kind, actor)), [actor, kind]);

    // Vuelve de VER-02 (flujo 5): el aviso guardado se publica, en revisión, y la identidad queda enviada.
    useEffect(() => {
        if (!awaiting) return;
        markPublished(actor.id, { ...summaryOf(actor, draftOf(kind, actor)), review: true });
        markIdentitySent(actor.id);
        (kind === 'turno' ? turnoDrafts : hogarDrafts).discard(actor.id);
    }, [awaiting, actor, kind]);

    const s = published ?? pending;
    const id = publishedId(actor.id, kind);
    // El turno abre GES-01; el aviso del hogar, sus postulantes (GES-02), como en el prototipo.
    const target = id ? (kind === 'turno' ? paths.gestionarPublicacion(id) : paths.postulantes(id)) : paths.actividad('publicaciones');

    return (
        <ResultScreen
            variant={s.review ? 'info' : 'success'}
            title={s.review ? copy.resultado.revision : copy.resultado.publicada}
            text={
                <>
                    {resultText(kind, actor, s)}
                    <span className="publish-result-meta">
                        <Badge status={s.review ? 'En revisión' : 'Activa'} />
                        {(s.review || s.hasta) && (
                            <span className="caption publish-muted">{s.review ? copy.resultado.plazoRevision : s.hasta}</span>
                        )}
                    </span>
                </>
            }
            action={{
                label: id ? copy.resultado.ver : copy.resultado.verMias,
                // Al terminar un flujo, replace hacia su destino natural (spec §5.3 regla 6).
                onClick: () => open(target, { replace: true }),
            }}
            secondaryAction={{ label: copy.resultado.inicio, onClick: () => open(paths.inicio(), { replace: true }) }}
        />
    );
}
