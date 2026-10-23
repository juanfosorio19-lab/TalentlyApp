// PUBL-07 · Publicación enviada (/publicar/:tipo/listo), con ResultScreen:
// «Publicada» (PUBL-07-turno) o «En revisión» (PUBL-07-aviso-hogar). Se llega
// al publicar (push sobre el paso 5) o desde VER-02 en el flujo 5 (replace
// sobre VER-02): entonces termina de publicar el aviso que quedó guardado. En
// los dos casos queda encima de una entrada del asistente ya publicado, que
// atrás se salta (useWizard) hasta la pantalla de antes de la hoja PUBL-01. «Ver publicación» lleva a GES-01 del
// turno o a GES-02 del aviso (los de los datos de demostración) e «Ir a
// Inicio», a Inicio: los dos terminan el flujo (spec §5.3 regla 6) volviendo
// de un salto a la pantalla desde la que se abrió PUBL-01, sin dejar en el
// historial la hoja, los pasos ni VER-02 (así atrás no reabre la hoja).
// Sin nada publicado en la sesión (un enlace, una recarga, «Ahora no») no
// dice que se publicó: vuelve al asistente, que retoma el borrador guardado.
import { useEffect, useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Badge } from '../../../ui/Badge';
import { ResultScreen } from '../../../ui/ResultScreen';
import { useFinishFlow } from '../../../app/navigation/history';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { NotFoundScreen } from '../../../app/system/NotFoundScreen';
import { useDemoSession, type DemoActor } from '../../demo/session';
import { submitIdentity } from '../../demo/sessionStore';
import { copy } from '../copy';
import { initialHogar } from '../model/hogar';
import { canPublish, publishedId, type WizardKind } from '../model/publisher';
import { summaryOf } from '../model/summary';
import { initialTurno } from '../model/turno';
import {
    clearWizardOrigin,
    getWizardOrigin,
    hogarDrafts,
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
    const { canOpen, soon } = useOpenPath();
    const finishFlow = useFinishFlow();
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
        submitIdentity(actor.id);
        (kind === 'turno' ? turnoDrafts : hogarDrafts).discard(actor.id);
    }, [awaiting, actor, kind, recienRegistrado]);

    // Nada publicado ni por publicar: no hay resultado que mostrar.
    if (!published && !awaiting) return <Navigate to={paths.publicar(kind, 1)} replace />;

    const s = published ?? pending;
    const id = publishedId(actor.id, kind);
    const finish = (dest: string) => {
        if (!canOpen(dest)) {
            soon();
            return;
        }
        const origin = getWizardOrigin(actor.id, kind);
        clearWizardOrigin(actor.id, kind);
        finishFlow(origin, dest);
    };
    const home = { label: copy.resultado.inicio, onClick: () => finish(paths.inicio()) };

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
            // Al terminar un flujo, su destino natural (spec §5.3 regla 6): el turno abre GES-01 y el aviso
            // del hogar, sus postulantes (GES-02), como en el prototipo. Si lo publicado aún no existe en
            // los datos (ACT-03 no lo mostraría), el único destino honesto es Inicio.
            action={
                id
                    ? {
                          label: copy.resultado.ver,
                          onClick: () => finish(kind === 'turno' ? paths.gestionarPublicacion(id) : paths.postulantes(id)),
                      }
                    : home
            }
            secondaryAction={id ? home : undefined}
        />
    );
}
