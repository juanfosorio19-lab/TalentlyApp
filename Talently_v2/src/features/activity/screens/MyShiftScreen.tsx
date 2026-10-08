// TUR-01 · Mi turno (/turnos/:assignmentId, prototipo TUR-01): lo que solo
// ve quien fue confirmado. Quién publica (con su insignia), el bloque del
// turno, «Agregar al calendario», «Dónde y con quién», la confirmación de
// asistencia 24 h y 2 h antes, la conversación, compartir el turno y
// cancelarlo (con la regla de 12 h). El :assignmentId es el id de la
// postulación (DemoApplication) mientras Supabase está pausado.
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    type IconComponent,
} from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { List, ListItem } from '../../../ui/ListItem';
import { SectionCard } from '../../../ui/SectionCard';
import { ShiftBlock, ShiftBlocks } from '../../../ui/ShiftBlock';
import { useSnackbar } from '../../../ui/Snackbar';
import { Timeline, type TimelineStep } from '../../../ui/Timeline';
import { VerificationBadge } from '../../../ui/VerificationBadge';
import { useGoBack } from '../../../app/BackButtonManager';
import { paths } from '../../../app/paths';
import { useDemoSession } from '../../demo/session';
import { getApplication } from '../../demo/data';
import type { DemoApplication, DemoMyShift, DemoRow } from '../../demo/types';
import { DetailRow } from '../components/DetailRow';
import { LinkListItem } from '../components/LinkListItem';
import { VerificationSheet } from '../components/VerificationSheet';
import { copy } from '../copy';
import { isoFromBlock, minutesUntil, splitTimeRange } from '../selectors';
import { cancelShift, useCancelledShifts } from '../shiftStore';
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

/** «24 h antes · confirmaste ayer a las 19:04» → paso «24 h antes» con fecha «confirmaste ayer a las 19:04». */
function confirmationSteps(shift: DemoMyShift): TimelineStep[] {
    const firstPending = shift.confirmacion.pasos.findIndex((p) => !p.hecho);
    return shift.confirmacion.pasos.map((p, i) => {
        const [label = p.texto, ...rest] = p.texto.split(' · ');
        return {
            id: p.texto,
            label,
            date: rest.join(' · ') || undefined,
            status: p.hecho ? 'done' : i === firstPending ? 'current' : 'pending',
        };
    });
}

/** Calendario (.ics) del turno, en hora local de Chile. */
function icsOf(shift: DemoMyShift, date: string): string {
    const { start, end } = splitTimeRange(shift.bloque.time);
    const stamp = (d: string, t: string) => `${d.replaceAll('-', '')}T${t.replace(':', '')}00`;
    // Termina al día siguiente si la hora de término es menor que la de inicio (18:00–02:00).
    const endDate = end <= start ? nextDay(date) : date;
    const where = rowValue(shift, 'Dirección') ?? shift.comuna;
    const escape = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`);
    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Talently//Mi turno//ES',
        'BEGIN:VEVENT',
        `UID:${shift.bloque.id}@talently`,
        `DTSTART;TZID=America/Santiago:${stamp(date, start)}`,
        `DTEND;TZID=America/Santiago:${stamp(endDate, end)}`,
        `SUMMARY:${escape(shift.titulo)}`,
        `LOCATION:${escape(where)}`,
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n');
}

function nextDay(iso: string): string {
    const [y = 1970, m = 1, d = 1] = iso.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

function NotFound() {
    const navigate = useNavigate();
    const goBack = useGoBack();
    return (
        <div className="tl-app-screen">
            <AppBar variant="standard" title={copy.shift.title} onBack={goBack} />
            <main className="tl-app-screen__body">
                <EmptyState
                    icon={IconCalendar}
                    title={copy.shift.notFoundTitle}
                    text={copy.shift.notFoundText}
                    action={{
                        label: copy.shift.seeApplications,
                        onClick: () => navigate(paths.actividad('postulaciones'), { replace: true }),
                    }}
                />
            </main>
        </div>
    );
}

export function MyShiftScreen() {
    const { assignmentId } = useParams();
    const { actor } = useDemoSession();
    const application = assignmentId ? getApplication(assignmentId) : undefined;
    // Solo quien fue confirmado ve la dirección exacta y la encargada.
    if (!application?.miTurno || application.actorId !== actor.id) return <NotFound />;
    return <MyShift application={application} shift={application.miTurno} />;
}

function MyShift({ application, shift }: { application: DemoApplication; shift: DemoMyShift }) {
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const snackbar = useSnackbar();
    const cancelledShifts = useCancelledShifts();
    const [verificationOpen, setVerificationOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);

    const org = application.autor;
    const cancelled = cancelledShifts.has(application.id);
    const date = isoFromBlock(shift.bloque);
    const { start } = splitTimeRange(shift.bloque.time);
    const late = date ? minutesUntil(date, start) < LATE_CANCEL_MIN : true;
    const verification = org.verificaciones[0];
    const fecha = `${shift.bloque.weekday} ${shift.bloque.day} ${shift.bloque.month}`;

    const addToCalendar = () => {
        // En el teléfono hace falta el plugin de calendario: aún no está.
        if (Capacitor.isNativePlatform() || !date) {
            snackbar.show({ message: copy.shift.soon });
            return;
        }
        const url = URL.createObjectURL(new Blob([icsOf(shift, date)], { type: 'text/calendar' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mi-turno.ics';
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        snackbar.show({ message: copy.shift.calendarDownloaded, tone: 'success' });
    };

    const share = async () => {
        const text = copy.shift.shareText(
            shift.titulo,
            fecha,
            shift.bloque.time,
            rowValue(shift, 'Dirección'),
            rowValue(shift, 'Hora de llegada'),
        );
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
        cancelShift(application.id);
        setCancelOpen(false);
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
                                            onClick={() => setVerificationOpen(true)}
                                        >
                                            {verification.label}
                                        </VerificationBadge>
                                    )}
                                </div>
                            </Stack>
                            <Stack gap={1} align="start">
                                <h1 className="h2 act-text">{shift.titulo}</h1>
                                <span className="body act-muted">{shift.comuna}</span>
                                <Badge status={cancelled ? 'Cancelaste' : shift.estado} />
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
                            {!cancelled && (
                                <div>
                                    <Button variant="tonal" size="sm" icon={IconCalendar} onClick={addToCalendar}>
                                        {copy.shift.addToCalendar}
                                    </Button>
                                </div>
                            )}
                        </Stack>

                        <SectionCard title={copy.shift.whereWho}>
                            {shift.filas.map((row) => (
                                <DetailRow key={row.label} icon={rowIcon(row.label)} label={row.label}>
                                    {rowText(row)}
                                </DetailRow>
                            ))}
                        </SectionCard>

                        {!cancelled && (
                            <Card>
                                <Stack gap={2}>
                                    <p className="button-lg act-text">{shift.confirmacion.titulo}</p>
                                    <p className="body act-muted">{shift.confirmacion.texto}</p>
                                    <Timeline steps={confirmationSteps(shift)} />
                                </Stack>
                            </Card>
                        )}

                        <List>
                            {shift.conversationId && (
                                <LinkListItem
                                    to={paths.conversacion(shift.conversationId)}
                                    icon={IconChat}
                                    title={copy.shift.chat}
                                    sub={org.nombre}
                                />
                            )}
                            <ListItem
                                icon={IconShare}
                                title={copy.shift.share}
                                sub={copy.shift.shareSub}
                                chevron
                                onClick={() => void share()}
                            />
                        </List>

                        {!cancelled && (
                            <List>
                                <ListItem
                                    danger
                                    icon={IconCloseCircle}
                                    title={copy.shift.cancel}
                                    sub={copy.shift.cancelSub}
                                    aria-haspopup="dialog"
                                    onClick={() => setCancelOpen(true)}
                                />
                            </List>
                        )}
                    </Stack>
                </div>
            </main>

            <VerificationSheet
                open={verificationOpen}
                onClose={() => setVerificationOpen(false)}
                name={org.nombre}
                verifications={org.verificaciones}
            />
            <Dialog
                open={cancelOpen}
                onClose={() => setCancelOpen(false)}
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
