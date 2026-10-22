// GES-02 · Postulantes (/publicaciones/:id/postulantes, prototipo GES-02-hogar):
// lista por afinidad con el estado de cada persona al día, filtros de estado
// (en la URL, con replace) y acciones rápidas «Avanzar» / «No seleccionar»
// (hoja con un mensaje amable). Marta abre su proceso (PRC-01) desde el
// nombre y su conversación desde «Ver conversación». Nunca la edad.
// Un turno no tiene lista de postulantes: quienes postulan están en los cupos
// de cada día, así que su /postulantes lleva a GES-04 (como «Ver cupos»).
import { useRef, useState, type ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Amount } from '../../../ui/Amount';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { Avatar } from '../../../ui/Avatar';
import { Badge } from '../../../ui/Badge';
import { Banner } from '../../../ui/Banner';
import { BottomSheet } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { Chip } from '../../../ui/Chip';
import { EmptyState } from '../../../ui/EmptyState';
import { IconPeople } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { List, ListItem } from '../../../ui/ListItem';
import { RadioGroup } from '../../../ui/Radio';
import { RatingStars } from '../../../ui/RatingStars';
import { useSnackbar } from '../../../ui/Snackbar';
import { VerificationBadge } from '../../../ui/VerificationBadge';
import { useGoBack } from '../../../app/BackButtonManager';
import { useOpenPath, type LinkTargetProps } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useSheet } from '../../../app/sheets';
import type { BadgeStatus, DemoApplicant, DemoManagedPublication } from '../../demo/types';
import { ManageGate } from '../components/ManageGate';
import { VerificationSheet } from '../components/VerificationSheet';
import { copy } from '../copy';
import { useOwnedPublication, usePendingFocus, useReplaceParam, useSessionApplications, useTitleFocusOnMount } from '../hooks';
import {
    REJECT_MESSAGES,
    applicantsOf,
    defaultRoster,
    filterSlug,
    firstName,
    isInProcess,
    isUndecided,
    matchesFilter,
    publicationView,
} from '../selectors';
import { setApplicantStatus, useManageState } from '../store';
import '../manage.css';

export const screenId = 'GES-02';

export function ApplicantsScreen() {
    const { id } = useParams();
    const owned = useOwnedPublication(id);
    const s = useManageState();
    const applications = useSessionApplications();
    if (owned.kind !== 'ok') {
        return <ManageGate title={copy.applicants.title} managed={owned.kind === 'not-owner' ? owned.managed : undefined} />;
    }
    const { managed } = owned;
    if (!managed.postulantes) {
        // La dueña abrió /postulantes de un turno (una URL o un enlace externo): sus postulados
        // están en GES-04, el mismo día que abre «Ver cupos». Sin cupos, su GES-01.
        const roster = defaultRoster(managed, s, applications);
        const to = roster
            ? paths.cuposTurno(managed.publicationId, roster.id)
            : paths.gestionarPublicacion(managed.publicationId);
        return <Navigate to={to} replace />;
    }
    return <Applicants key={managed.publicationId} managed={managed} />;
}

/** El primer botón o enlace de las acciones de una fila (para devolverle el foco). */
function firstActionOf(list: HTMLElement | null, personId: string): HTMLElement | null {
    return list?.querySelector<HTMLElement>(`[data-person="${personId}"] .tl-listitem__actions :is(button, a[href])`) ?? null;
}

function Applicants({ managed }: { managed: DemoManagedPublication }) {
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const snackbar = useSnackbar();
    const { linkProps, open } = useOpenPath();
    const s = useManageState();
    const applications = useSessionApplications();
    const rejectSheet = useSheet('no-seleccionar');
    const titleRef = useRef<HTMLHeadingElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const verifySheet = useSheet('verificacion');
    const focusAfter = usePendingFocus(rejectSheet.open || verifySheet.open);
    useTitleFocusOnMount(titleRef);

    const pub = managed.publicationId;
    const data = managed.postulantes;
    const filtros = data?.filtros ?? [];
    const [filterParam, setFilter] = useReplaceParam('estado', filterSlug(filtros[0] ?? 'Todos'));
    const filter = filtros.find((f) => filterSlug(f) === filterParam) ?? filtros[0] ?? 'Todos';
    const closed = publicationView(managed, s).closed;

    const personas = applicantsOf(managed, s, applications);
    const visible = personas.filter((p) => matchesFilter(p.estado, filter));
    const verifying = personas.find((p) => p.personId === verifySheet.param('p')) ?? null;

    // Hoja «No seleccionar»: quién va en la URL (?p=); el mensaje se limpia al ABRIR.
    // Mientras la hoja sale, sigue mostrando a quien mostraba (el id, que no cambia entre renders).
    const rejectId = rejectSheet.param('p');
    const [lastRejectId, setLastRejectId] = useState(rejectId);
    if (rejectId && rejectId !== lastRejectId) setLastRejectId(rejectId);
    const rejecting = personas.find((p) => p.personId === rejectId) ?? null;
    const rejectShown = rejecting ?? personas.find((p) => p.personId === lastRejectId) ?? null;
    const [message, setMessage] = useState<string | null>(null);
    const [messageError, setMessageError] = useState(false);

    /** Después de cambiar a alguien: su nueva acción, si sigue en la lista; si no, la de la fila siguiente; si no, el título. */
    const refocus = (personId: string) => {
        const ids = visible.map((p) => p.personId);
        const i = ids.indexOf(personId);
        const neighbors = [ids[i + 1], ids[i - 1]].filter((x): x is string => x !== undefined);
        focusAfter(
            () =>
                firstActionOf(listRef.current, personId) ??
                neighbors.map((n) => firstActionOf(listRef.current, n)).find(Boolean) ??
                titleRef.current,
        );
    };

    const change = (p: DemoApplicant, estado: BadgeStatus, message: string) => {
        const before = s.applicants.get(`${pub}:${p.personId}`) ?? null;
        setApplicantStatus(pub, p.personId, estado);
        snackbar.show({
            message,
            action: { label: copy.applicants.undo, onAction: () => setApplicantStatus(pub, p.personId, before) },
        });
        refocus(p.personId);
    };

    const advance = (p: DemoApplicant) => change(p, 'En proceso', copy.applicants.advanced(firstName(p.nombre)));

    const showReject = (p: DemoApplicant) => {
        setMessage(null);
        setMessageError(false);
        rejectSheet.show({ p: p.personId });
    };

    const confirmReject = () => {
        if (!rejectShown) return;
        if (!message) {
            setMessageError(true);
            return;
        }
        rejectSheet.hide();
        change(rejectShown, 'No seleccionado', copy.applicants.rejectedNeutral(firstName(rejectShown.nombre)));
    };

    return (
        <div className="tl-app-screen">
            <AppBar variant="standard" title={copy.applicants.title} onBack={goBack} scrolled={scrolled} />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content manage-content">
                    <Stack gap={1}>
                        <h1 ref={titleRef} tabIndex={-1} className="h3 manage-text tl-focus">
                            {managed.titulo}
                        </h1>
                        <span className="body manage-muted">{copy.applicants.count(personas.length, data?.orden ?? '')}</span>
                    </Stack>

                    {data?.aviso && <Banner>{data.aviso}</Banner>}
                    {closed && <Banner>{copy.applicants.closedBanner}</Banner>}

                    {personas.length > 0 && filtros.length > 1 && (
                        <div className="manage-chips" role="group" aria-label={copy.applicants.filterLabel}>
                            {filtros.map((f) => (
                                <Chip key={f} selected={f === filter} onClick={() => setFilter(filterSlug(f))}>
                                    {f}
                                </Chip>
                            ))}
                        </div>
                    )}

                    {personas.length === 0 ? (
                        <EmptyState icon={IconPeople} title={copy.applicants.noneTitle} text={copy.applicants.noneText} />
                    ) : visible.length === 0 ? (
                        <EmptyState
                            icon={IconPeople}
                            title={copy.applicants.emptyTitle}
                            text={copy.applicants.emptyText}
                            action={{ label: copy.applicants.emptyAction, onClick: () => setFilter(filterSlug(filtros[0] ?? 'Todos')) }}
                        />
                    ) : (
                        <List ref={listRef}>
                            {visible.map((p) => (
                                <ApplicantRow
                                    key={p.personId}
                                    person={p}
                                    closed={closed}
                                    nameLink={p.processId ? linkProps(paths.proceso(p.processId)) : undefined}
                                    onVerify={() => verifySheet.show({ p: p.personId })}
                                    onAdvance={() => advance(p)}
                                    onReject={() => showReject(p)}
                                    onConversation={p.conversationId ? () => open(paths.conversacion(p.conversationId ?? '')) : undefined}
                                    onProcess={p.processId ? () => open(paths.proceso(p.processId ?? '')) : undefined}
                                />
                            ))}
                        </List>
                    )}
                </div>
            </main>

            <VerificationSheet person={verifying} onClose={verifySheet.hide} />

            <BottomSheet
                open={rejectSheet.open && rejecting !== null}
                onClose={rejectSheet.hide}
                title={rejectShown ? copy.applicants.rejectTitle(firstName(rejectShown.nombre)) : ''}
                footer={
                    <>
                        <Button variant="ghost" onClick={rejectSheet.hide}>
                            {copy.applicants.rejectCancel}
                        </Button>
                        <Button onClick={confirmReject}>{copy.applicants.rejectConfirm}</Button>
                    </>
                }
            >
                <Stack gap={3}>
                    <RadioGroup
                        legend={copy.applicants.rejectLegend}
                        options={REJECT_MESSAGES.map((m) => ({ value: m, label: m }))}
                        value={message}
                        onChange={(next) => {
                            setMessage(next);
                            setMessageError(false);
                        }}
                        error={messageError ? copy.applicants.rejectError : undefined}
                    />
                    <p className="caption manage-muted">{copy.applicants.rejectNote}</p>
                </Stack>
            </BottomSheet>
        </div>
    );
}

interface ApplicantRowProps {
    person: DemoApplicant;
    closed: boolean;
    nameLink?: LinkTargetProps;
    onVerify: () => void;
    onAdvance: () => void;
    onReject: () => void;
    onConversation?: () => void;
    onProcess?: () => void;
}

function ApplicantRow({ person: p, closed, nameLink, onVerify, onAdvance, onReject, onConversation, onProcess }: ApplicantRowProps) {
    const sub: ReactNode[] = [];
    if (p.linea) sub.push(p.linea);
    if (p.pretension === null) sub.push(copy.applicants.claimNegotiable);
    else if (p.pretension)
        sub.push(
            <>
                {copy.applicants.claim} <Amount value={p.pretension.value} unit={p.pretension.unit} net={p.pretension.net} />
            </>,
        );

    let actions: ReactNode = null;
    if (!closed && isUndecided(p.estado)) {
        actions = (
            <>
                <Button variant="tonal" size="sm" onClick={onAdvance}>
                    {copy.applicants.advance}
                </Button>
                <Button variant="ghost" size="sm" onClick={onReject}>
                    {copy.applicants.reject}
                </Button>
            </>
        );
    } else if (isInProcess(p.estado)) {
        if (onConversation)
            actions = (
                <Button variant="ghost" size="sm" onClick={onConversation}>
                    {copy.applicants.seeConversation}
                </Button>
            );
        else if (onProcess)
            actions = (
                <Button variant="ghost" size="sm" onClick={onProcess}>
                    {copy.applicants.seeProcess}
                </Button>
            );
        else if (!closed)
            actions = (
                <Button variant="ghost" size="sm" onClick={onReject}>
                    {copy.applicants.reject}
                </Button>
            );
    }

    const verification = p.verificaciones[0];
    return (
        <ListItem
            variant="person"
            data-person={p.personId}
            avatar={<Avatar name={p.nombre} initials={p.iniciales} />}
            title={
                nameLink ? (
                    <a className="manage-title-link tl-focus" {...nameLink}>
                        {p.nombre}
                    </a>
                ) : (
                    p.nombre
                )
            }
            sub={sub}
            status={p.estado && <Badge status={p.estado} />}
            badges={
                <>
                    {verification && (
                        <Stack gap={1} align="start">
                            <VerificationBadge status={verification.status} onClick={onVerify}>
                                {verification.label}
                            </VerificationBadge>
                            {verification.vence && <span className="caption manage-muted">{verification.vence}</span>}
                        </Stack>
                    )}
                    <RatingStars value={p.nota?.value ?? null} count={p.nota?.count ?? 0} />
                </>
            }
            actions={actions ?? undefined}
        />
    );
}
