// DET-02 · Postular (`?sheet=postular`): la oferta arriba, la pregunta filtro
// (Sí / No), el CV del perfil con «Cambiar» si la oferta lo pide y un mensaje
// opcional de hasta 300 caracteres. «Postular» envía; el resultado (Snackbar
// y, si la organización responde, el match) lo muestra el detalle. Mientras
// Supabase está pausado, el CV elegido no se sube a ningún servidor.
import { useEffect, useId, useRef, useState } from 'react';
import { Avatar } from '../../../ui/Avatar';
import { BottomSheet, SheetSection } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { IconDocument } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { List, ListItem } from '../../../ui/ListItem';
import { MediaUploader } from '../../../ui/MediaUploader';
import { RadioGroup } from '../../../ui/Radio';
import { TextArea } from '../../../ui/TextArea';
import { FieldFoot } from '../../../ui/TextField';
import type { DemoPublication } from '../../demo/types';
import { copy } from '../copy';
import { cvProblem, sizeText, type CvProblem } from '../cv';
import { DEMO_LATENCY_MS, messageExample, type CvFile } from '../mock';
import { useLater } from './useLater';
import '../publications.css';

export const screenId = 'DET-02';

const MESSAGE_MAX = 300;
const PDF = 'application/pdf';

function problemText(problem: CvProblem): string {
    return problem.kind === 'not-pdf' ? copy.apply.cvNotPdf : copy.apply.cvTooBig(problem.size);
}

export interface ApplySheetProps {
    open: boolean;
    /** `hide` de useSheet('postular'). */
    onClose: () => void;
    publication: DemoPublication;
    /** El CV del perfil de trabajo, si lo tiene. */
    profileCv?: CvFile;
    /** Se envió: el detalle registra la postulación, cierra la hoja y muestra el resultado. */
    onApplied: () => void;
}

/**
 * Parte de cero cada vez que se abre: el detalle le pone una `key` nueva al
 * abrirla (así nada queda de antes aunque se haya cerrado con el atrás).
 */
export function ApplySheet({ open, onClose, publication: pub, profileCv, onApplied }: ApplySheetProps) {
    const later = useLater();
    const fileRef = useRef<HTMLInputElement>(null);
    const questionRef = useRef<HTMLDivElement>(null);
    const cvRef = useRef<HTMLDivElement>(null);
    const changeRef = useRef<HTMLButtonElement>(null);
    // Elegir un archivo en el MediaUploader lo cambia por la fila del CV (o por «Elegir otro»): el botón
    // tocado sale del DOM y el foco caería al body, fuera de la hoja. Va a «Cambiar» (o al botón que quedó).
    const refocusCv = useRef(false);
    const cvErrorId = useId();
    const question = pub.detalle.postular?.pregunta;
    const needsCv = pub.detalle.postular?.pideCv ?? false;

    const [answer, setAnswer] = useState<'si' | 'no' | null>(null);
    const [answerMissing, setAnswerMissing] = useState(false);
    const [cv, setCv] = useState<{ file: CvFile; fromProfile: boolean } | null>(profileCv ? { file: profileCv, fromProfile: true } : null);
    /** Por qué no sirve el archivo elegido, o que falta el CV obligatorio. */
    const [cvError, setCvError] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const pick = (files: File[]) => {
        const f = files[0];
        if (!f) return;
        if (!cv) refocusCv.current = true;
        const problem = cvProblem(f);
        if (problem) {
            setCvError(problemText(problem));
            return;
        }
        setCvError(null);
        setCv({ file: { nombre: f.name, detalle: sizeText(f.size) }, fromProfile: false });
    };

    useEffect(() => {
        if (!refocusCv.current) return;
        refocusCv.current = false;
        const active = document.activeElement;
        if (active instanceof HTMLElement && active !== document.body && active.isConnected) return;
        (changeRef.current ?? cvRef.current?.querySelector<HTMLButtonElement>('button'))?.focus({ preventScroll: true });
    }, [cv, cvError]);

    const submit = () => {
        const noAnswer = Boolean(question) && answer === null;
        const noCv = needsCv && !cv;
        setAnswerMissing(noAnswer);
        if (noCv) setCvError(copy.apply.cvRequired);
        if (noAnswer || noCv) {
            // El aviso queda en el mismo campo (no en un Snackbar que tape el mensaje): se lleva a la vista.
            (noAnswer ? questionRef : cvRef).current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
            return;
        }
        setSending(true);
        later(() => {
            setSending(false);
            onApplied();
        }, DEMO_LATENCY_MS);
    };

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title={copy.apply.title}
            className="pub-sheet"
            footer={
                <Button size="lg" block loading={sending} loadingLabel={copy.apply.sending} onClick={submit}>
                    {copy.apply.submit}
                </Button>
            }
        >
            <Stack row gap={3} className="pub-apply-block">
                <Avatar name={pub.autor.nombre} initials={pub.autor.iniciales} kind={pub.autor.tipo === 'persona' ? 'person' : 'org'} />
                <div className="pub-row-text">
                    <span className="button-lg">{pub.titulo}</span>
                    <span className="body pub-muted">{pub.autor.nombre}</span>
                </div>
            </Stack>

            {question && (
                <div ref={questionRef} className="pub-apply-block">
                    <RadioGroup
                        legend={question}
                        options={[
                            { value: 'si', label: copy.apply.yes },
                            { value: 'no', label: copy.apply.no },
                        ]}
                        value={answer}
                        onChange={(next) => {
                            setAnswer(next);
                            setAnswerMissing(false);
                        }}
                        error={answerMissing ? copy.apply.answerRequired : undefined}
                    />
                </div>
            )}

            {needsCv && (
                <div ref={cvRef}>
                    <SheetSection label={copy.apply.cv}>
                        {cv ? (
                            <>
                                <List>
                                    <ListItem
                                        icon={IconDocument}
                                        title={<span className="button-lg">{cv.file.nombre}</span>}
                                        sub={cv.fromProfile ? copy.apply.cvFromProfile(cv.file.detalle) : cv.file.detalle}
                                        end={
                                            <Button
                                                ref={changeRef}
                                                variant="ghost"
                                                size="sm"
                                                aria-describedby={cvError ? cvErrorId : undefined}
                                                onClick={() => fileRef.current?.click()}
                                            >
                                                {copy.apply.change}
                                            </Button>
                                        }
                                    />
                                </List>
                                {/* «Cambiar» eligió algo que no sirve: el CV de antes se queda y el motivo va debajo, como el error de un campo. */}
                                {cvError && (
                                    <div className="tl-field is-error" role="alert">
                                        <FieldFoot helpId={`${cvErrorId}-h`} errorId={cvErrorId} error={cvError} />
                                    </div>
                                )}
                                <input
                                    ref={fileRef}
                                    type="file"
                                    hidden
                                    tabIndex={-1}
                                    accept={PDF}
                                    onChange={(e) => {
                                        const files = Array.from(e.currentTarget.files ?? []);
                                        e.currentTarget.value = '';
                                        pick(files);
                                    }}
                                />
                            </>
                        ) : (
                            <MediaUploader
                                variant="document"
                                title={copy.apply.cvTitle}
                                state={cvError ? 'error' : 'empty'}
                                requirement="Obligatoria"
                                formats={copy.apply.cvFormats}
                                accept={PDF}
                                error={cvError ?? undefined}
                                onSelect={pick}
                            />
                        )}
                        <p className="caption pub-muted pub-cv-note">{cv?.fromProfile ? copy.apply.cvNote : copy.apply.cvNoteEmpty}</p>
                    </SheetSection>
                </div>
            )}

            <TextArea
                label={copy.apply.message}
                optional
                rows={3}
                maxLength={MESSAGE_MAX}
                placeholder={messageExample(pub.id)}
                help={copy.apply.messageHelp(pub.autor.nombre)}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
        </BottomSheet>
    );
}
