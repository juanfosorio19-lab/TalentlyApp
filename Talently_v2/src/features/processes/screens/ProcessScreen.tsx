// PRC-01 · Proceso de empleo (/procesos/:engagementId, prototipo PRC-01,
// PRC-01-pedro y PRC-01-hogar). El Timeline de estados es el mismo para los
// dos lados. Quien postuló ve la entrevista agendada (SystemCard con «Agregar
// al calendario»), la conversación, la publicación y «Retirar postulación»
// (Dialog). Quien contrata para su hogar ve, ya contratada la persona, el
// checklist legal «Para contratar como corresponde» y sus opciones.
import { useEffect, useMemo, useRef, type MouseEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { Avatar } from '../../../ui/Avatar';
import { Badge } from '../../../ui/Badge';
import { BottomSheet } from '../../../ui/BottomSheet';
import { LinkText } from '../../../ui/Button';
import { CheckboxGroup } from '../../../ui/Checkbox';
import { Dialog } from '../../../ui/Dialog';
import { EmptyState } from '../../../ui/EmptyState';
import { IconButton } from '../../../ui/IconButton';
import { IconCalendar, IconChat, IconCloseCircle, IconMore, IconOffers, IconPeople, IconPerson } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { List, ListItem } from '../../../ui/ListItem';
import { SectionCard } from '../../../ui/SectionCard';
import { useSnackbar } from '../../../ui/Snackbar';
import { InterviewCard, SystemCard } from '../../../ui/SystemCard';
import { Timeline } from '../../../ui/Timeline';
import { useGoBack } from '../../../app/BackButtonManager';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useSheet } from '../../../app/sheets';
import { buildIcs } from '../../../domain/calendario';
import { useDemoSession } from '../../demo/session';
import type { DemoChecklist, DemoProcess, DemoSystemCard } from '../../demo/types';
import { DT_URL, copy } from '../copy';
import { useOpenFromSheet } from '../hooks';
import {
    canWithdraw,
    counterpartPath,
    googleCalendarUrl,
    interviewEvent,
    isApplicantView,
    processStatus,
    publicationPath,
    resolveProcess,
    seeksWork,
    timelineSteps,
} from '../model';
import { useChecklist, useWithdrawn, withdraw } from '../store';
import '../processes.css';

export const screenId = 'PRC-01';

const WITHDRAW_SHEET = 'retirar';
const OPTIONS_SHEET = 'opciones';

export function ProcessScreen() {
    const { engagementId = '' } = useParams();
    const { actor, recienRegistrado } = useDemoSession();
    const process = resolveProcess(engagementId, actor.id, recienRegistrado);
    if (!process) return <ProcessNotFound />;
    // Otro actor u otro proceso parten de cero (foco, hojas).
    return <Process key={`${actor.id}:${process.id}`} process={process} />;
}

function ProcessNotFound() {
    const goBack = useGoBack();
    const { open } = useOpenPath();
    const { actor } = useDemoSession();
    const action = seeksWork(actor)
        ? { label: copy.process.seeApplications, onClick: () => open(paths.actividad('postulaciones')) }
        : { label: copy.process.goHome, onClick: () => open(paths.inicio()) };
    return (
        <div className="tl-app-screen">
            <AppBar variant="standard" title={copy.process.fallbackTitle} onBack={goBack} />
            <main className="tl-app-screen__body">
                <EmptyState icon={IconOffers} title={copy.process.notFoundTitle} text={copy.process.notFoundText} action={action} />
            </main>
        </div>
    );
}

function Process({ process }: { process: DemoProcess }) {
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const snackbar = useSnackbar();
    const { linkProps } = useOpenPath();
    const { actor } = useDemoSession();
    const withdrawSheet = useSheet(WITHDRAW_SHEET);
    const optionsSheet = useSheet(OPTIONS_SHEET);
    const openFromOptions = useOpenFromSheet(OPTIONS_SHEET);
    const headingRef = useRef<HTMLHeadingElement>(null);

    const withdrawn = useWithdrawn(actor.id, process.id);
    const applicant = isApplicantView(process);
    const withdrawable = canWithdraw(process, withdrawn);
    const steps = useMemo(() => timelineSteps(process, withdrawn), [process, withdrawn]);
    const other = process.contraparte;
    const interview = process.entrevista;

    // «Retirar postulación» deja de existir al retirar: el foco pasa al título (no cae al body).
    const focusAfterWithdraw = useRef(false);
    useEffect(() => {
        if (!withdrawn || !focusAfterWithdraw.current) return;
        focusAfterWithdraw.current = false;
        headingRef.current?.focus({ preventScroll: true });
    }, [withdrawn]);

    const confirmWithdraw = () => {
        focusAfterWithdraw.current = true;
        withdraw(actor.id, process.id);
        withdrawSheet.hide();
        snackbar.show({ message: copy.process.withdrawn });
    };

    const addToCalendar = async (card: DemoSystemCard) => {
        const event = interviewEvent(process, card);
        if (!event) {
            snackbar.show({ message: copy.process.calendarError, tone: 'error' });
            return;
        }
        // En el teléfono, la plantilla de Google Calendar en el navegador del sistema (sin plugin de calendario).
        if (Capacitor.isNativePlatform()) {
            try {
                const { Browser } = await import('@capacitor/browser');
                await Browser.open({ url: googleCalendarUrl(event) });
            } catch {
                snackbar.show({ message: copy.process.calendarError, tone: 'error' });
            }
            return;
        }
        const url = URL.createObjectURL(new Blob([buildIcs(event)], { type: 'text/calendar' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'entrevista.ics';
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        snackbar.show({ message: copy.process.calendarDownloaded, tone: 'success' });
    };

    return (
        <div className="tl-app-screen">
            <AppBar
                variant="standard"
                title={process.appBarTitulo}
                onBack={goBack}
                scrolled={scrolled}
                actions={
                    !applicant && (
                        <IconButton
                            icon={IconMore}
                            label={copy.process.options}
                            aria-haspopup="dialog"
                            onClick={() => optionsSheet.show()}
                        />
                    )
                }
            />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content">
                    <Stack gap={4}>
                        <Stack row gap={3} align="start">
                            <Avatar
                                name={other.nombre}
                                initials={other.iniciales}
                                kind={other.tipo === 'persona' ? 'person' : 'org'}
                                size={56}
                            />
                            <Stack gap={1} align="start" className="prc-grow">
                                <h2 ref={headingRef} className="h2 prc-flush tl-focus" tabIndex={-1}>
                                    {process.titulo}
                                </h2>
                                <span className="body prc-muted">{process.subtitulo}</span>
                                <Badge status={processStatus(process, withdrawn)} />
                            </Stack>
                        </Stack>

                        {process.checklist && <LegalChecklist process={process} checklist={process.checklist} />}

                        <SectionCard title={copy.process.timeline}>
                            <Timeline steps={steps} />
                        </SectionCard>

                        {interview &&
                            (withdrawn || !interview.disponible ? (
                                <SystemCard icon={IconCalendar} title={interview.titulo} off />
                            ) : (
                                <InterviewCard
                                    when={interview.lineas[0] ?? ''}
                                    place={interview.lineas[1] ?? ''}
                                    onAddToCalendar={interview.accion ? () => void addToCalendar(interview) : undefined}
                                />
                            ))}

                        <List>
                            {process.conversationId && (
                                <ListItem
                                    icon={IconChat}
                                    title={copy.process.chat}
                                    sub={other.nombre}
                                    {...linkProps(paths.conversacion(process.conversationId))}
                                />
                            )}
                            <ListItem
                                icon={IconOffers}
                                title={applicant ? copy.process.publication : copy.process.ownPublication}
                                sub={applicant ? process.titulo : process.subtitulo}
                                {...linkProps(publicationPath(process))}
                            />
                        </List>

                        {withdrawable && (
                            <List>
                                <ListItem
                                    danger
                                    icon={IconCloseCircle}
                                    title={copy.process.withdraw}
                                    aria-haspopup="dialog"
                                    onClick={() => withdrawSheet.show()}
                                />
                            </List>
                        )}
                    </Stack>
                </div>
            </main>

            <Dialog
                open={withdrawSheet.open && withdrawable}
                onClose={withdrawSheet.hide}
                title={copy.process.withdrawTitle}
                cancelLabel={copy.process.keep}
                confirmLabel={copy.process.withdraw}
                destructive
                onConfirm={confirmWithdraw}
            >
                {copy.process.withdrawBody(other.nombre, interview?.disponible ? interview.lineas[0] : undefined)}
            </Dialog>

            {!applicant && (
                <BottomSheet open={optionsSheet.open} onClose={optionsSheet.hide} title={copy.process.optionsTitle}>
                    <List flat>
                        <ListItem
                            icon={IconPerson}
                            title={copy.process.profile}
                            sub={other.nombre}
                            chevron
                            onClick={() => openFromOptions(counterpartPath(other))}
                        />
                        <ListItem
                            icon={IconPeople}
                            title={copy.process.applicants}
                            sub={process.subtitulo}
                            chevron
                            onClick={() => openFromOptions(paths.postulantes(process.publicationId))}
                        />
                    </List>
                </BottomSheet>
            )}
        </div>
    );
}

/** «Para contratar como corresponde» (PRC-01-hogar): lo marcado queda en la sesión. */
function LegalChecklist({ process, checklist }: { process: DemoProcess; checklist: DemoChecklist }) {
    const { actor } = useDemoSession();
    const initial = useMemo(() => checklist.pasos.map((p) => p.hecho), [checklist]);
    const [done, toggle] = useChecklist(actor.id, process.id, initial);
    const values = checklist.pasos.map((_, i) => String(i));
    const last = checklist.pasos.length - 1;

    const openDt = (event: MouseEvent<HTMLAnchorElement>) => {
        if (!Capacitor.isNativePlatform()) return;
        // En el teléfono, el sitio se abre en el navegador del sistema.
        event.preventDefault();
        void import('@capacitor/browser').then(({ Browser }) => Browser.open({ url: DT_URL }));
    };

    return (
        <SectionCard title={checklist.titulo}>
            <p className="body prc-flush prc-muted">{checklist.intro}</p>
            <CheckboxGroup
                legend={copy.process.checklistSteps}
                legendHidden
                options={checklist.pasos.map((p, i) => ({
                    value: String(i),
                    label: p.titulo,
                    description:
                        i === last ? (
                            <>
                                {p.detalle}
                                <LinkText className="prc-dt-link" href={DT_URL} target="_blank" rel="noopener noreferrer" onClick={openDt}>
                                    {checklist.enlace}
                                </LinkText>
                            </>
                        ) : (
                            p.detalle
                        ),
                }))}
                value={values.filter((_, i) => done[i])}
                onChange={(next) =>
                    values.forEach((v, i) => {
                        const on = next.includes(v);
                        if (on !== Boolean(done[i])) toggle(i, on);
                    })
                }
            />
        </SectionCard>
    );
}
