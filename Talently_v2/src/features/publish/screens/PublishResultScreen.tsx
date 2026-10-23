// PUBL-07 · Publicación enviada (/publicar/:tipo/listo), con ResultScreen:
// «Publicada» (PUBL-07-turno) o «En revisión» (PUBL-07-aviso-hogar). Se llega
// con replace al publicar, o desde VER-02 en el flujo 5: entonces termina de
// publicar el aviso que quedó guardado. «Ver publicación» lleva, con replace,
// a GES-01 del turno o a GES-02 del aviso (los de los datos de demostración).
// Sin nada publicado en la sesión (un enlace, una recarga, «Ahora no») no
// dice que se publicó: vuelve al asistente, que retoma el borrador guardado.
import { useEffect, useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Badge } from '../../../ui/Badge';
import { ResultScreen } from '../../../ui/ResultScreen';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { NotFoundScreen } from '../../../app/system/NotFoundScreen';
import { useDemoSession, type DemoActor } from '../../demo/session';
import { copy } from '../copy';
import { initialHogar } from '../model/hogar';
import { canPublish, publishedId, type WizardKind } from '../model/publisher';
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
import { NoPublisherScreen } from './PublishInfoScreens';
import '../publish.css';

export const screenId = 'PUBL-07';

export function PublishResultScreen() {
    const { tipo } = useParams();
    const { actor, recienRegistrado } = useDemoSession();
    if (tipo !== 'turno' && tipo !== 'hogar') return <NotFoundScreen />;
    if (!canPublish(actor, tipo, recienRegistrado)) return <NoPublisherScreen tipo={tipo} />;
    return <PublishResult key={`${actor.id}:${tipo}`} kind={tipo} actor={actor} />;
}

/** El borrador del actor (el guardado o, si no hay, con el que parte el asistente). */
function draftOf(kind: WizardKind, actor: DemoActor, recienRegistrado: boolean) {
    return kind === 'turno'
        ? (turnoDrafts.get(actor.id)?.draft ?? initialTurno(actor.id))
        : (hogarDrafts.get(actor.id)?.draft ?? initialHogar(actor.id, { recienRegistrado }));
}

function resultText(kind: WizardKind, actor: DemoActor, s: PublishedSummary): string {
    if (!s.review) return copy.resultado.publicadaTurno(s.titulo);
    if (kind === 'hogar') return copy.resultado.revisionHogar('aviso');
    return actor.kind === 'organizacion' ? copy.resultado.revisionOrg : copy.resultado.revisionHogar('turno');
}

function PublishResult({ kind, actor }: { kind: WizardKind; actor: DemoActor }) {
    const { recienRegistrado } = useDemoSession();
    const { open } = useOpenPath();
    const published = usePublished(actor.id, kind);
    const awaiting = useAwaitingIdentity(actor.id, kind);
    // Vuelve de VER-02: mientras el efecto lo publica, se muestra el aviso guardado (en revisión).
    const pending = useMemo(
        () => ({ ...summaryOf(actor, draftOf(kind, actor, recienRegistrado)), review: true }),
        [actor, kind, recienRegistrado],
    );

    // Vuelve de VER-02 (flujo 5): el aviso guardado se publica, en revisión, y la identidad queda enviada.
    useEffect(() => {
        if (!awaiting) return;
        markPublished(actor.id, { ...summaryOf(actor, draftOf(kind, actor, recienRegistrado)), review: true });
        markIdentitySent(actor.id);
        (kind === 'turno' ? turnoDrafts : hogarDrafts).discard(actor.id);
    }, [awaiting, actor, kind, recienRegistrado]);

    // Nada publicado ni por publicar: no hay resultado que mostrar.
    if (!published && !awaiting) return <Navigate to={paths.publicar(kind, 1)} replace />;

    const s = published ?? pending;
    const id = publishedId(actor.id, kind);
    const home = { label: copy.resultado.inicio, onClick: () => open(paths.inicio(), { replace: true }) };

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
            // Al terminar un flujo, replace hacia su destino natural (spec §5.3 regla 6): el turno abre
            // GES-01 y el aviso del hogar, sus postulantes (GES-02), como en el prototipo. Si lo publicado
            // aún no existe en los datos (ACT-03 no lo mostraría), el único destino honesto es Inicio.
            action={
                id
                    ? {
                          label: copy.resultado.ver,
                          onClick: () => open(kind === 'turno' ? paths.gestionarPublicacion(id) : paths.postulantes(id), { replace: true }),
                      }
                    : home
            }
            secondaryAction={id ? home : undefined}
        />
    );
}
