// GES-01 · Gestionar publicación (/publicaciones/:id, prototipo GES-01-turno):
// resumen con su estado, métricas recalculadas con la sesión, «Ver cupos» (o
// «Ver postulantes» en un empleo o aviso), invitar a los favoritos, Editar,
// Pausar (Snackbar con «Deshacer»), Renovar (empleos y avisos) y Cerrar
// publicación con motivo (hoja). Solo la ve quien la publicó.
import { useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { Badge } from '../../../ui/Badge';
import { Banner } from '../../../ui/Banner';
import { BottomSheet } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';
import { IconButton } from '../../../ui/IconButton';
import {
    IconClock,
    IconCloseCircle,
    IconEdit,
    IconEye,
    IconHeart,
    IconMore,
    IconOffers,
    IconPeople,
    IconShare,
} from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { List, ListItem } from '../../../ui/ListItem';
import { RadioGroup } from '../../../ui/Radio';
import { useSnackbar } from '../../../ui/Snackbar';
import { useGoBack } from '../../../app/BackButtonManager';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useSheet } from '../../../app/sheets';
import type { DemoManagedPublication } from '../../demo/types';
import { ManageGate } from '../components/ManageGate';
import { copy } from '../copy';
import { useOwnedPublication, usePendingFocus, useSessionApplications, useTitleFocusOnMount } from '../hooks';
import { isSheetEntry, overManageState, shareUrl } from '../links';
import { managePaths } from '../paths';
import {
    RENEW_DAYS,
    defaultRoster,
    isShiftPublication,
    metricsOf,
    publicationView,
    rosterFecha,
    rosterView,
    todayPlus,
} from '../../demo/manageSelectors';
import { renewPublication, setPublicationStatus, useManageState } from '../../demo/manageState';
import { CLOSE_REASONS } from '../selectors';
import '../manage.css';

export const screenId = 'GES-01';

export function ManagePublicationScreen() {
    const { id } = useParams();
    const owned = useOwnedPublication(id);
    if (owned.kind !== 'ok') return <ManageGate title={copy.manage.title} managed={owned.kind === 'not-owner' ? owned.managed : undefined} />;
    return <ManagePublication key={owned.managed.publicationId} managed={owned.managed} />;
}

function ManagePublication({ managed }: { managed: DemoManagedPublication }) {
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const snackbar = useSnackbar();
    const { open, linkProps } = useOpenPath();
    const s = useManageState();
    const applications = useSessionApplications();
    const optionsSheet = useSheet('opciones');
    const closeSheet = useSheet('cerrar');
    const titleRef = useRef<HTMLHeadingElement>(null);
    const focusAfter = usePendingFocus(closeSheet.open || optionsSheet.open);
    useTitleFocusOnMount(titleRef);
    const location = useLocation();

    const pub = managed.publicationId;
    const view = publicationView(managed, s);
    const metrics = metricsOf(managed, s, applications);
    const turno = isShiftPublication(managed);
    const rosters = managed.cupos ?? [];
    const target = turno ? defaultRoster(managed, s, applications) : undefined;
    const reasons = turno ? CLOSE_REASONS.turno : CLOSE_REASONS.empleo;
    // GES-04 abierta desde aquí queda justo encima de esta GES-01 (también desde la hoja
    // «Opciones», que reemplaza su propia entrada): su «Gestionar publicación» vuelve aquí.
    const optionsOverManage = isSheetEntry(location.state, 'opciones') ? overManageState(1) : undefined;

    // Hoja «Cerrar publicación»: el motivo se limpia al ABRIR (si se cerró con el atrás, no queda el anterior).
    const [reason, setReason] = useState<string | null>(null);
    const [reasonError, setReasonError] = useState(false);
    const showClose = () => {
        setReason(null);
        setReasonError(false);
        closeSheet.show();
    };

    const togglePause = () => {
        if (view.paused) {
            setPublicationStatus(pub, null);
            snackbar.show({ message: copy.manage.resumed, tone: 'success' });
            return;
        }
        const before = s.status.get(pub) ?? null;
        setPublicationStatus(pub, { estado: 'Pausada' });
        snackbar.show({
            message: copy.manage.paused,
            action: { label: copy.manage.undo, onAction: () => setPublicationStatus(pub, before) },
        });
    };

    const renew = () => {
        renewPublication(pub);
        snackbar.show({ message: copy.manage.renewed(todayPlus(RENEW_DAYS)), tone: 'success' });
        // «Renovar» desaparece: el foco pasa al título.
        focusAfter(() => titleRef.current);
    };

    const confirmClose = () => {
        if (!reason) {
            setReasonError(true);
            return;
        }
        setPublicationStatus(pub, { estado: 'Cerrada', motivo: reason });
        closeSheet.hide();
        snackbar.show({ message: copy.manage.closed, tone: 'success' });
        // La fila «Cerrar publicación» ya no está: el foco va al título.
        focusAfter(() => titleRef.current);
    };

    const share = async () => {
        const href = linkProps(paths.publicacion(pub)).href;
        // Sin la query de la demo: quien abre el enlace ve la publicación como quien busca (igual que DET-01).
        const url = href ? shareUrl(window.location, href) : undefined;
        const text = copy.manage.shareText(managed.titulo, managed.resumen);
        try {
            if (typeof navigator.share === 'function') {
                await navigator.share({ title: managed.titulo, text, url });
                return;
            }
            await navigator.clipboard.writeText(url ?? text);
            snackbar.show({ message: copy.manage.linkCopied, tone: 'success' });
        } catch (error) {
            // La persona cerró la hoja de compartir: no es un error.
            if (error instanceof DOMException && error.name === 'AbortError') return;
            snackbar.show({ message: copy.manage.shareError, tone: 'error' });
        }
    };

    return (
        <div className="tl-app-screen">
            <AppBar
                variant="standard"
                title={copy.manage.title}
                onBack={goBack}
                scrolled={scrolled}
                actions={
                    <>
                        <IconButton icon={IconShare} label={copy.manage.share} onClick={() => void share()} />
                        <IconButton
                            icon={IconMore}
                            label={copy.manage.options}
                            aria-haspopup="dialog"
                            onClick={() => optionsSheet.show()}
                        />
                    </>
                }
            />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content manage-content">
                    <Card>
                        <Stack row gap={3} align="start">
                            <span className="tl-listitem__tile">{turno ? <IconClock /> : <IconOffers />}</span>
                            <Stack gap={1} align="start">
                                <h1 ref={titleRef} tabIndex={-1} className="h3 manage-text tl-focus">
                                    {managed.titulo}
                                </h1>
                                <span className="body manage-muted">{managed.resumen}</span>
                                <Badge status={view.estado} />
                                <span className="caption manage-muted">{view.vigencia}</span>
                            </Stack>
                        </Stack>
                    </Card>

                    {view.paused && <Banner>{copy.manage.pausedBanner}</Banner>}
                    {view.closedNow && <Banner>{copy.manage.closedBanner}</Banner>}

                    <div className="manage-grid">
                        {metrics.map((m, i) => (
                            // Con un número impar de métricas, la última ocupa la fila entera.
                            <Card key={m.label} className={metrics.length % 2 === 1 && i === metrics.length - 1 ? 'manage-grid__wide' : undefined}>
                                <Stack gap={1}>
                                    <span className="body manage-muted">{m.label}</span>
                                    <span className="h2">{m.valor}</span>
                                    {m.detalle && <span className="caption manage-muted">{m.detalle}</span>}
                                </Stack>
                            </Card>
                        ))}
                    </div>

                    {turno && target ? (
                        <Button size="lg" block onClick={() => open(paths.cuposTurno(pub, target.id), { state: overManageState(1) })}>
                            {copy.manage.seeShifts}
                        </Button>
                    ) : (
                        managed.postulantes && (
                            <Button size="lg" block onClick={() => open(paths.postulantes(pub))}>
                                {copy.manage.seeApplicants}
                            </Button>
                        )
                    )}

                    {managed.favoritos && !view.closed && (
                        <List>
                            <ListItem
                                icon={IconHeart}
                                title={managed.favoritos.texto}
                                sub={managed.favoritos.detalle}
                                {...linkProps(managePaths.favoritos(managed.ownerId))}
                            />
                        </List>
                    )}

                    {!view.closed && (
                        <section className="tl-stack tl-stack--2">
                            <h2 className="h3 manage-text">{copy.manage.actions}</h2>
                            <div className="manage-grid manage-grid--tight">
                                <Button variant="outline" icon={IconEdit} onClick={() => open(managePaths.editar(pub))}>
                                    {copy.manage.edit}
                                </Button>
                                <Button variant="outline" onClick={togglePause}>
                                    {view.paused ? copy.manage.resume : copy.manage.pause}
                                </Button>
                                {view.canRenew && (
                                    <Button variant="outline" className="manage-grid__wide" onClick={renew}>
                                        {copy.manage.renew}
                                    </Button>
                                )}
                            </div>
                            {turno && managed.nota && <p className="caption manage-muted">{managed.nota}</p>}
                            {!turno && view.canRenew && view.expires && (
                                <p className="caption manage-muted">{copy.manage.renewNote(view.expires)}</p>
                            )}
                        </section>
                    )}

                    {!view.closed && (
                        <List>
                            <ListItem
                                danger
                                icon={IconCloseCircle}
                                title={copy.manage.close}
                                sub={copy.manage.closeSub}
                                aria-haspopup="dialog"
                                onClick={showClose}
                            />
                        </List>
                    )}
                </div>
            </main>

            <BottomSheet open={optionsSheet.open} onClose={optionsSheet.hide} title={copy.manage.optionsTitle}>
                <List flat>
                    <ListItem
                        icon={IconEye}
                        title={copy.manage.optionsSeePublication}
                        sub={copy.manage.optionsSeePublicationSub}
                        {...linkProps(paths.publicacion(pub), { replace: true })}
                    />
                    {rosters.length > 1 &&
                        rosters.map((r) => {
                            const rv = rosterView(managed, r, s, applications);
                            return (
                                <ListItem
                                    key={r.id}
                                    icon={IconPeople}
                                    title={copy.manage.optionsShift(rosterFecha(pub, r))}
                                    sub={`${copy.shift.tabConfirmed} ${rv.confirmados.length}/${rv.total}`}
                                    {...linkProps(paths.cuposTurno(pub, r.id), { replace: true, state: optionsOverManage })}
                                />
                            );
                        })}
                </List>
            </BottomSheet>

            <BottomSheet
                open={closeSheet.open}
                onClose={closeSheet.hide}
                title={copy.manage.closeSheetTitle}
                footer={
                    <>
                        <Button variant="ghost" onClick={closeSheet.hide}>
                            {copy.manage.closeCancel}
                        </Button>
                        <Button variant="danger" onClick={confirmClose}>
                            {copy.manage.closeConfirm}
                        </Button>
                    </>
                }
            >
                <Stack gap={3}>
                    <RadioGroup
                        legend={copy.manage.closeLegend}
                        options={reasons.map((r) => ({ value: r, label: r }))}
                        value={reason}
                        onChange={(next) => {
                            setReason(next);
                            setReasonError(false);
                        }}
                        error={reasonError ? copy.manage.closeError : undefined}
                    />
                    <p className="caption manage-muted">{copy.manage.closeNote}</p>
                </Stack>
            </BottomSheet>
        </div>
    );
}
