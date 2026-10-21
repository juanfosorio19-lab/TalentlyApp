// DET-02 · Postular (`?sheet=postular` en la spec): la oferta arriba, la
// pregunta filtro (Sí / No), el CV del perfil con «Cambiar» si la oferta lo
// pide y un mensaje opcional de hasta 300 caracteres. «Postular» envía; el
// resultado (Snackbar y, si la organización responde, el match) lo muestra
// el detalle. Mientras Supabase está pausado, el CV elegido no se sube a
// ningún servidor.
import { useRef, useState } from 'react';
import { Avatar } from '../../../ui/Avatar';
import { BottomSheet, SheetSection } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { IconDocument } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { List, ListItem } from '../../../ui/ListItem';
import { MediaUploader } from '../../../ui/MediaUploader';
import { RadioGroup } from '../../../ui/Radio';
import { useSnackbar } from '../../../ui/Snackbar';
import { TextArea } from '../../../ui/TextArea';
import type { DemoPublication } from '../../demo/types';
import { copy } from '../copy';
import { DEMO_LATENCY_MS, messageExample, type CvFile } from '../mock';
import { useLater } from './useLater';
import '../publications.css';

export const screenId = 'DET-02';

const MAX_CV_BYTES = 10 * 1024 * 1024;
const MESSAGE_MAX = 300;

function sizeText(bytes: number): string {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export interface ApplySheetProps {
    open: boolean;
    onClose: () => void;
    publication: DemoPublication;
    /** El CV del perfil de trabajo, si lo tiene. */
    profileCv?: CvFile;
    /** Se envió: el detalle cierra la hoja y muestra el resultado. */
    onApplied: () => void;
}

/**
 * Siempre montada mientras el detalle esté abierto: si la persona cierra la
 * hoja y vuelve a abrirla, lo que había escrito sigue ahí.
 */
export function ApplySheet({ open, onClose, publication: pub, profileCv, onApplied }: ApplySheetProps) {
    const later = useLater();
    const snackbar = useSnackbar();
    const fileRef = useRef<HTMLInputElement>(null);
    const question = pub.detalle.postular?.pregunta;
    const needsCv = pub.detalle.postular?.pideCv ?? false;

    const [answer, setAnswer] = useState<'si' | 'no' | null>(null);
    const [answerMissing, setAnswerMissing] = useState(false);
    const [cv, setCv] = useState<{ file: CvFile; fromProfile: boolean } | null>(profileCv ? { file: profileCv, fromProfile: true } : null);
    const [cvError, setCvError] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const pick = (files: File[]) => {
        const f = files[0];
        if (!f) return;
        if (f.size > MAX_CV_BYTES) {
            setCvError(copy.apply.cvTooBig(sizeText(f.size)));
            return;
        }
        setCvError(null);
        setCv({ file: { nombre: f.name, detalle: sizeText(f.size) }, fromProfile: false });
    };

    const submit = () => {
        const noAnswer = Boolean(question) && answer === null;
        setAnswerMissing(noAnswer);
        if (needsCv && !cv) snackbar.show({ message: copy.apply.cvRequired, tone: 'error' });
        if (noAnswer || (needsCv && !cv)) return;
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
                <RadioGroup
                    className="pub-apply-block"
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
            )}

            {needsCv && (
                <SheetSection label={copy.apply.cv}>
                    {cv ? (
                        <List>
                            <ListItem
                                icon={IconDocument}
                                title={<span className="button-lg">{cv.file.nombre}</span>}
                                sub={cv.fromProfile ? copy.apply.cvFromProfile(cv.file.detalle) : cv.file.detalle}
                                end={
                                    <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
                                        {copy.apply.change}
                                    </Button>
                                }
                            />
                        </List>
                    ) : (
                        <MediaUploader
                            variant="document"
                            title={copy.apply.cvTitle}
                            state={cvError ? 'error' : 'empty'}
                            requirement="Obligatoria"
                            formats={copy.apply.cvFormats}
                            accept="application/pdf"
                            error={cvError ?? undefined}
                            onSelect={pick}
                        />
                    )}
                    {cvError && cv && <p className="caption pub-fact--alert pub-cv-note">{cvError}</p>}
                    <p className="caption pub-muted pub-cv-note">{cv?.fromProfile ? copy.apply.cvNote : copy.apply.cvNoteEmpty}</p>
                    <input
                        ref={fileRef}
                        type="file"
                        hidden
                        tabIndex={-1}
                        accept="application/pdf"
                        onChange={(e) => {
                            const files = Array.from(e.currentTarget.files ?? []);
                            e.currentTarget.value = '';
                            pick(files);
                        }}
                    />
                </SheetSection>
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
