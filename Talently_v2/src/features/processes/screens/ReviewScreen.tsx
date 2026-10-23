// REV-01 · Dejar reseña (/resena/:engagementId, prototipo REV-01): la
// evaluación mutua al cerrar un turno. Nota de 1 a 5 con estrellas grandes,
// etiquetas («¿Qué destacas?»), comentario opcional y «Enviar evaluación»,
// que termina en un ResultScreen. El :engagementId es el id de la
// postulación (TUR-01) o el de la publicación (notificación «Evalúa tu turno
// del sáb 5 dic»); si no hay nada que evaluar, un EmptyState honesto.
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { Avatar } from '../../../ui/Avatar';
import { Banner } from '../../../ui/Banner';
import { Button } from '../../../ui/Button';
import { ChipGroup } from '../../../ui/ChipGroup';
import { CtaBar } from '../../../ui/CtaBar';
import { EmptyState } from '../../../ui/EmptyState';
import { IconLock, IconStar } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { RatingInput } from '../../../ui/RatingStars';
import { ResultScreen } from '../../../ui/ResultScreen';
import { SnackbarOutlet } from '../../../ui/Snackbar';
import { TextArea } from '../../../ui/TextArea';
import { useGoBack } from '../../../app/BackButtonManager';
import { useDirtyGuard } from '../../../app/navigation/backHandlers';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useDemoSession } from '../../demo/session';
import { sendReview, useApplications, useReview } from '../../demo/sessionStore';
import { copy } from '../copy';
import { useMoreBelow } from '../hooks';
import { resolveReview, seeksWork, type ReviewSubject } from '../model';
import '../processes.css';

export const screenId = 'REV-01';

/** Lo que tarda el envío simulado («Enviando evaluación…»). */
const SEND_DELAY_MS = 600;
const COMMENT_MAX = 300;

export function ReviewScreen() {
    const { engagementId = '' } = useParams();
    const { actor, recienRegistrado } = useDemoSession();
    const applications = useApplications(actor.id, recienRegistrado);
    const target = resolveReview(engagementId, actor, applications, recienRegistrado);
    if (target.kind !== 'review') return <NothingToReview target={target} />;
    // Otro actor u otro turno parten de cero (nota, etiquetas y comentario).
    return <Review key={`${actor.id}:${target.subject.publicationId}`} subject={target.subject} />;
}

function NothingToReview({ target }: { target: { kind: 'owner'; path: string } | { kind: 'not-worked' } | { kind: 'not-found' } }) {
    const goBack = useGoBack();
    const { open } = useOpenPath();
    const { actor } = useDemoSession();
    const fallback = seeksWork(actor)
        ? { label: copy.process.seeApplications, onClick: () => open(paths.actividad('postulaciones')) }
        : { label: copy.process.goHome, onClick: () => open(paths.inicio()) };
    const content =
        target.kind === 'owner'
            ? {
                  title: copy.review.ownerTitle,
                  text: copy.review.ownerText,
                  action: { label: copy.review.ownerAction, onClick: () => open(target.path) },
              }
            : target.kind === 'not-worked'
              ? { title: copy.review.notWorkedTitle, text: copy.review.notWorkedText, action: fallback }
              : { title: copy.review.notFoundTitle, text: copy.review.notFoundText, action: fallback };
    return (
        <div className="tl-app-screen">
            <AppBar variant="standard" title={copy.review.title} onBack={goBack} />
            <main className="tl-app-screen__body">
                <EmptyState icon={IconStar} title={content.title} text={content.text} action={content.action} />
            </main>
        </div>
    );
}

function Review({ subject }: { subject: ReviewSubject }) {
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const moreBelow = useMoreBelow();
    const { open } = useOpenPath();
    const { actor } = useDemoSession();
    const sent = useReview(actor.id, subject.publicationId);

    const [rating, setRating] = useState<number | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [comment, setComment] = useState('');
    const [ratingError, setRatingError] = useState(false);
    const [sending, setSending] = useState(false);
    const timer = useRef<number | undefined>(undefined);
    const starsRef = useRef<HTMLDivElement>(null);
    // Si la persona sale mientras se envía, no se envía a sus espaldas.
    useEffect(() => () => window.clearTimeout(timer.current), []);

    // Lo elegido sin enviar: atrás pregunta «¿Descartar cambios?».
    useDirtyGuard(!sent && (rating !== null || tags.length > 0 || comment.trim() !== ''));

    if (sent) {
        // Pantalla completa, como PUBL-07: el foco va al título (el botón que se tocó ya no está).
        return (
            <ResultScreen
                variant="success"
                title={copy.review.sentTitle}
                text={copy.review.sentText}
                // Al terminar un flujo, replace hacia su destino natural (spec §5.3 regla 6): atrás no vuelve al resultado.
                action={{ label: copy.review.exploreShifts, onClick: () => open(paths.explorar('turno'), { replace: true }) }}
                secondaryAction={{ label: copy.review.back, onClick: goBack }}
            />
        );
    }

    const submit = () => {
        if (rating === null) {
            setRatingError(true);
            // El error queda junto a las estrellas: el foco va a la primera.
            starsRef.current?.querySelector<HTMLButtonElement>('[role="radio"]')?.focus();
            return;
        }
        setSending(true);
        timer.current = window.setTimeout(() => {
            sendReview(actor.id, subject.publicationId, { rating, tags, comment: comment.trim() });
        }, SEND_DELAY_MS);
    };

    const other = subject.counterpart;
    return (
        <div className="tl-app-screen">
            <AppBar variant="standard" title={copy.review.title} onBack={goBack} scrolled={scrolled} />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content">
                    <Banner>{copy.review.pending(subject.fecha)}</Banner>

                    <Stack row gap={3}>
                        <Avatar
                            name={other.nombre}
                            initials={other.iniciales}
                            kind={other.tipo === 'persona' ? 'person' : 'org'}
                            size={56}
                        />
                        <div className="prc-grow">
                            <p className="button-lg prc-flush">{other.nombre}</p>
                            <p className="body prc-flush prc-muted">{subject.linea}</p>
                        </div>
                    </Stack>

                    <Stack gap={2}>
                        <h2 className="h2 prc-flush">{subject.pregunta}</h2>
                        <RatingInput
                            ref={starsRef}
                            size="lg"
                            label={copy.review.ratingLabel}
                            value={rating}
                            onChange={(next) => {
                                setRating(next);
                                setRatingError(false);
                            }}
                            error={ratingError ? copy.review.ratingError : undefined}
                            disabled={sending}
                        />
                    </Stack>

                    <ChipGroup
                        label={copy.review.tagsLabel}
                        options={subject.tags.map((t) => ({ value: t, label: t }))}
                        value={tags}
                        onChange={setTags}
                        disabled={sending}
                    />

                    <TextArea
                        label={copy.review.commentLabel}
                        optional
                        placeholder={copy.review.commentPlaceholder}
                        maxLength={COMMENT_MAX}
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        disabled={sending}
                    />

                    <p className="caption prc-note">
                        <IconLock size={16} />
                        {copy.review.blind}
                    </p>
                </div>
            </main>
            <CtaBar scrolled={moreBelow}>
                <SnackbarOutlet />
                <Button size="lg" block loading={sending} loadingLabel={copy.review.sending} onClick={submit}>
                    {copy.review.send}
                </Button>
            </CtaBar>
        </div>
    );
}
