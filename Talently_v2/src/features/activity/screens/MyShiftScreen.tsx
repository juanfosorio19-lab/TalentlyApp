// TUR-01 · Mi turno (/turnos/:assignmentId, prototipo TUR-01): lo que solo
// ve quien fue confirmado. Quién publica (con su insignia), el bloque del
// turno, «Agregar al calendario» (.ics con buildIcs), «Dónde y con quién», la
// confirmación de asistencia 24 h y 2 h antes, la conversación, compartir el
// turno y cancelarlo (con la regla de 12 h). Si el turno ya pasó, o hay uno
// anterior por evaluar (la evaluación se pide antes de postular al siguiente,
// spec §5.2), «Dejar reseña» lleva a REV-01 (flujo 2); una evaluación ya
// enviada en REV-01 (demo/sessionStore.useReviewed) no se vuelve a pedir. Cancelado, queda el
// bloque con su Badge «Cancelaste» y la conversación. La postulación sale de
// la sesión (useApplications) y la cancelación se guarda allí (cancelShift):
// ACT-02, la Agenda e Inicio la ven igual. El :assignmentId es el id de la
// postulación (DemoApplication) mientras Supabase está pausado. La hoja de
// verificación y el diálogo de cancelar van en la URL (?sheet=); si se llega
// con uno abierto, al cerrarlo el foco va al título (useFocusAfterClose).
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { formatAmount } from '../../../ui/Amount';
import { Avatar } from '../../../ui/Avatar';
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { Dialog } from '../../../ui/Dialog';
import { EmptyState } from '../../../ui/EmptyState';
import {
    IconCalendar,
    IconChat,
    IconClock,
    IconCloseCircle,
    IconLocation,
    IconMoney,
    IconPerson,
    IconShare,
    IconStar,
    type IconComponent,
} from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { List, ListItem } from '../../../ui/ListItem';
import { SectionCard } from '../../../ui/SectionCard';
import { ShiftBlock, ShiftBlocks } from '../../../ui/ShiftBlock';
import { useSnackbar } from '../../../ui/Snackbar';
import { VerificationBadge } from '../../../ui/VerificationBadge';
import { useGoBack } from '../../../app/BackButtonManager';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useSheet } from '../../../app/sheets';
import { buildIcs } from '../../../domain/calendario';
import { useDemoSession } from '../../demo/session';
import { cancelShift, useApplications, useInbox, useReviewed } from '../../demo/sessionStore';
import { targetPath } from '../../demo/targets';
import type { DemoApplication, DemoMyShift, DemoRow } from '../../demo/types';
import { DetailRow } from '../components/DetailRow';
import { FactList } from '../components/FactList';
import { useFocusAfterClose } from '../components/useFocusAfterClose';
import { VerificationSheet } from '../components/VerificationSheet';
import { copy } from '../copy';
import {
    googleCalendarUrl,
    hasEnded,
    icsFileName,
    minutesUntil,
    pendingReviewsFor,
    seeksWork,
    shiftCalendarEvent,
    shiftWindow,
    type ShiftWindow,
} from '../selectors';
import '../activity.css';

export const screenId = 'TUR-01';

const LATE_CANCEL_MIN = 12 * 60;

/** Ícono de cada fila de «Dónde y con quién» (TUR-01). */
function rowIcon(label: string): IconComponent {
    if (label.startsWith('Dirección')) return IconLocation;
    if (label.startsWith('Hora')) return IconClock;
    if (label.startsWith('Pago')) return IconMoney;
    return IconPerson; // Encargada del turno, Vestimenta
}

function rowText(row: DemoRow): string {
    const main = row.monto ? formatAmount(row.monto) : (row.value ?? '');
    return row.detalle ? `${main} · ${row.detalle}` : main;
}

const rowValue = (shift: DemoMyShift, label: string) => shift.filas.find((f) => f.label.startsWith(label))?.value;

function NotFound() {
    const { open } = useOpenPath();
    const goBack = useGoBack();
    const { actor } = useDemoSession();
    // Solo quien busca trabajo tiene Postulaciones; los demás vuelven a su Actividad (replace: es otra pestaña).
    const action = seeksWork(actor)
        ? { label: copy.shift.seeApplications, onClick: () => open(paths.actividad('postulaciones'), { replace: true }) }
        : { label: copy.shift.goActivity, onClick: () => open(paths.actividad(), { replace: true }) };
    return (
        <div className="tl-app-screen">
            <AppBar variant="standard" title={copy.shift.title} onBack={goBack} />
            <main className="tl-app-screen__body">
                <EmptyState
                    icon={IconCalendar}
                    title={copy.shift.notFoundTitle}
                    text={copy.shift.notFoundText}
                    action={action}
                />
            </main>
        </div>
    );
}

export function MyShiftScreen() {
    const { assignmentId } = useParams();
    const { actor, recienRegistrado } = useDemoSession();
    // Solo las postulaciones del actor en esta sesión: quien fue confirmado ve la dirección exacta y la encargada.
    const application = useApplications(actor.id, recienRegistrado).find((a) => a.id === assignmentId);
    if (!application?.miTurno) return <NotFound />;
    return <MyShift application={application} shift={application.miTurno} />;
}

interface ReviewCardProps {
    title: string;
    text: string;
    path: string;
    /** El turno ya pasó: evaluarlo es la acción principal de la pantalla. */
    primary?: boolean;
}

/** «Dejar reseña» → REV-01. */
function ReviewCard({ title, text, path, primary }: ReviewCardProps) {
    const { open } = useOpenPath();
    return (
        <Card>
            <Stack gap={3} align="start">
                <Stack gap={1}>
                    <h2 className="button-lg act-text">{title}</h2>
                    <p className="body act-muted">{text}</p>
                </Stack>
                <Button
                    variant={primary ? 'primary' : 'tonal'}
                    icon={IconStar}
                    onClick={() => open(path)}
                >
                    {copy.shift.review}
                </Button>
            </Stack>
        </Card>
    );
}

function MyShift({ application, shift }: { application: DemoApplication; shift: DemoMyShift }) {
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const snackbar = useSnackbar();
    const { linkProps } = useOpenPath();
    const { actor, recienRegistrado } = useDemoSession();
    const { items: notifications } = useInbox(actor.id, recienRegistrado);
    const verificationSheet = useSheet('verificacion');
    const cancelDialog = useSheet('cancelar');
    const titleRef = useRef<HTMLHeadingElement>(null);
    const focusTitleAfterCancel = useRef(false);

    const org = application.autor;
    const cancelled = application.estado === 'Cancelaste';
    const slot = shiftWindow(shift.bloque);
    const late = slot ? minutesUntil(slot.date, slot.start) < LATE_CANCEL_MIN : true;
    const ended = slot ? hasEnded(slot) : false;
    const active = !cancelled && !ended;
    const verification = org.verificaciones[0];
    const fecha = `${shift.bloque.weekday} ${shift.bloque.day} ${shift.bloque.month}`;
    const address = rowValue(shift, 'Dirección');
    const reviewPath = targetPath({ pantalla: 'evaluar', publicationId: application.publicationId }, actor.id);
    // Lo ya evaluado en REV-01 (demo/sessionStore) no se vuelve a pedir: ni este turno ni el anterior.
    const reviewed = useReviewed(actor.id);
    const pendingReviews = pendingReviewsFor(notifications, actor.id, application.publicationId, reviewed);

    // Al cancelar se van «Cancelar turno» y su diálogo: el foco pasa al título (no queda en el body).
    // El diálogo se cierra en el mismo cambio (y su foco vuelve a un botón que ya no está): esto corre después.
    useEffect(() => {
        if (!cancelled || !focusTitleAfterCancel.current) return;
        focusTitleAfterCancel.current = false;
        titleRef.current?.focus();
    }, [cancelled]);

    // Llegó con la hoja o el diálogo abierto (enlace, notificación): nada en pantalla lo abrió y,
    // al cerrarlo, el foco quedaría en el body. Va al título.
    useFocusAfterClose(verificationSheet.open, titleRef);
    useFocusAfterClose(cancelDialog.open && active, titleRef);

    const addToCalendar = async (w: ShiftWindow) => {
        const event = shiftCalendarEvent(
            `${application.id}-${shift.bloque.id}`,
            shift.titulo,
            w,
            address ?? shift.comuna,
            org.nombre,
        );
        const file = new File([buildIcs(event)], icsFileName(shift.titulo), { type: 'text/calendar' });
        if (Capacitor.isNativePlatform()) {
            // En el teléfono: compartir el .ics (el sistema ofrece el calendario) o, si el WebView no
            // comparte archivos, la plantilla de Google Calendar en el navegador del sistema.
            try {
                if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], title: shift.titulo });
                    return;
                }
                const { Browser } = await import('@capacitor/browser');
                await Browser.open({ url: googleCalendarUrl(event) });
            } catch (error) {
                // La persona cerró la hoja de compartir: no es un error.
                if (error instanceof DOMException && error.name === 'AbortError') return;
                snackbar.show({ message: copy.shift.calendarError, tone: 'error' });
            }
            return;
        }
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        snackbar.show({ message: copy.shift.calendarDownloaded, tone: 'success' });
    };

    const share = async () => {
        const text = copy.shift.shareText(shift.titulo, fecha, shift.bloque.time, address, rowValue(shift, 'Hora de llegada'));
        if (typeof navigator.share === 'function') {
            try {
                await navigator.share({ title: copy.shift.title, text });
                return;
            } catch (error) {
                // La persona cerró la hoja de compartir: no es un error.
                if (error instanceof DOMException && error.name === 'AbortError') return;
            }
        }
        try {
            await navigator.clipboard.writeText(text);
            snackbar.show({ message: copy.shift.shareCopied, tone: 'success' });
        } catch {
            snackbar.show({ message: copy.shift.shareError, tone: 'error' });
        }
    };

    const confirmCancel = () => {
        focusTitleAfterCancel.current = true;
        cancelShift(application.id);
        cancelDialog.hide();
        snackbar.show({ message: copy.shift.cancelled });
    };

    return (
        <div className="tl-app-screen">
            <AppBar variant="standard" title={copy.shift.title} onBack={goBack} scrolled={scrolled} />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content">
                    <Stack gap={4}>
                        <Stack gap={3}>
                            <Stack row gap={3}>
                                <Avatar
                                    name={org.nombre}
                                    initials={org.iniciales}
                                    kind={org.tipo === 'persona' ? 'person' : 'org'}
                                />
                                <div>
                                    <p className="button-md act-text">{org.nombre}</p>
                                    {verification && (
                                        <VerificationBadge
                                            status={verification.status}
                                            aria-haspopup="dialog"
                                            onClick={() => verificationSheet.show()}
                                        >
                                            {verification.label}
                                        </VerificationBadge>
                                    )}
                                </div>
                            </Stack>
                            <Stack gap={1} align="start">
                                <h1 ref={titleRef} tabIndex={-1} className="h2 act-text tl-focus">
                                    {shift.titulo}
                                </h1>
                                <span className="body act-muted">{shift.comuna}</span>
                                <Badge status={application.estado} />
                            </Stack>
                        </Stack>

                        <Stack gap={2}>
                            <ShiftBlocks>
                                <ShiftBlock
                                    weekday={shift.bloque.weekday}
                                    day={shift.bloque.day}
                                    month={shift.bloque.month}
                                    time={shift.bloque.time}
                                    duration={shift.bloque.duration}
                                />
                            </ShiftBlocks>
                            {/* Sin un horario que se entienda no hay qué agregar: el botón no se muestra. */}
                            {active && slot && (
                                <div>
                                    <Button
                                        variant="tonal"
                                        size="sm"
                                        icon={IconCalendar}
                                        onClick={() => void addToCalendar(slot)}
                                    >
                                        {copy.shift.addToCalendar}
                                    </Button>
                                </div>
                            )}
                        </Stack>

                        {!cancelled && ended && !reviewed.has(application.publicationId) && (
                            <ReviewCard title={copy.shift.reviewTitle} text={copy.shift.reviewNote} path={reviewPath} primary />
                        )}

                        {/* Al cancelar deja de estar confirmado: ya no ve la dirección exacta ni la encargada. */}
                        {!cancelled && (
                            <SectionCard title={copy.shift.whereWho}>
                                {shift.filas.map((row) => (
                                    <DetailRow key={row.label} icon={rowIcon(row.label)} label={row.label}>
                                        {rowText(row)}
                                    </DetailRow>
                                ))}
                            </SectionCard>
                        )}

                        {active && (
                            <Card>
                                <Stack gap={2}>
                                    <h2 className="button-lg act-text">{shift.confirmacion.titulo}</h2>
                                    <p className="body act-muted">{shift.confirmacion.texto}</p>
                                    <FactList
                                        facts={shift.confirmacion.pasos.map((p) => ({ text: p.texto, done: p.hecho }))}
                                    />
                                </Stack>
                            </Card>
                        )}

                        {pendingReviews.map((r) => (
                            <ReviewCard
                                key={r.id}
                                title={r.title}
                                text={copy.shift.pendingReviewNote(r.from)}
                                path={targetPath(r.target, actor.id)}
                            />
                        ))}

                        {(shift.conversationId || active) && (
                            <List>
                                {shift.conversationId && (
                                    <ListItem
                                        {...linkProps(paths.conversacion(shift.conversationId))}
                                        icon={IconChat}
                                        title={copy.shift.chat}
                                        sub={org.nombre}
                                    />
                                )}
                                {active && (
                                    <ListItem
                                        icon={IconShare}
                                        title={copy.shift.share}
                                        sub={copy.shift.shareSub}
                                        chevron
                                        onClick={() => void share()}
                                    />
                                )}
                            </List>
                        )}

                        {active && (
                            <List>
                                <ListItem
                                    danger
                                    icon={IconCloseCircle}
                                    title={copy.shift.cancel}
                                    sub={copy.shift.cancelSub}
                                    aria-haspopup="dialog"
                                    onClick={() => cancelDialog.show()}
                                />
                            </List>
                        )}
                    </Stack>
                </div>
            </main>

            <VerificationSheet
                open={verificationSheet.open}
                onClose={verificationSheet.hide}
                name={org.nombre}
                verifications={org.verificaciones}
            />
            <Dialog
                open={cancelDialog.open && active}
                onClose={cancelDialog.hide}
                title={copy.shift.cancelDialogTitle}
                cancelLabel={copy.shift.keep}
                confirmLabel={copy.shift.cancel}
                destructive
                onConfirm={confirmCancel}
            >
                {late ? copy.shift.cancelDialogLate(org.nombre) : copy.shift.cancelDialogOnTime(org.nombre)}
            </Dialog>
        </div>
    );
}

