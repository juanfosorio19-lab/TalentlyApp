// GES-04 · Cupos del turno (/publicaciones/:id/turnos/:shiftId, prototipo
// GES-04, GES-04-postulados, GES-04-sin-postulados, GES-04-finde y
// GES-04-finde-postulados): barra de cupos, Confirmados · Postulados · Lista
// de espera (pestaña en la URL, con replace), confirmar con un toque (o a los
// favoritos de una vez) y, después del turno, asistencia y evaluación.
// Flujo 4: un turno recién publicado parte sin postulados y llegan un rato
// después (el «salto de tiempo» del prototipo), solo si la publicación sigue
// recibiendo postulaciones (ni pausada ni cerrada).
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { Avatar } from '../../../ui/Avatar';
import { Banner } from '../../../ui/Banner';
import { BottomSheet, SheetSection } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { Chip } from '../../../ui/Chip';
import { EmptyState } from '../../../ui/EmptyState';
import { IconButton } from '../../../ui/IconButton';
import { IconClock, IconEye, IconHeart, IconMore, IconOffers, IconPeople } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { List, ListItem } from '../../../ui/ListItem';
import { RatingInput, RatingStars } from '../../../ui/RatingStars';
import { SegmentedControl } from '../../../ui/SegmentedControl';
import { CuposBar } from '../../../ui/ShiftBlock';
import { useSnackbar } from '../../../ui/Snackbar';
import { useGoBack } from '../../../app/BackButtonManager';
import { useOpenPath, type LinkTargetProps } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useSheet } from '../../../app/sheets';
import type { DemoApplicant, DemoManagedPublication, DemoShiftRoster } from '../../demo/types';
import { ManageGate } from '../components/ManageGate';
import { copy } from '../copy';
import { useOwnedPublication, usePendingFocus, useReplaceParam, useSessionApplications, useTitleFocusOnMount } from '../hooks';
import { isSheetEntry, overManageOf, overManageState } from '../links';
import { firstName, isEvaluated, joinWithA, rosterFecha, rosterView, type RosterView } from '../../demo/manageSelectors';
import {
    confirmPeople,
    evaluate,
    scheduleArrival,
    setAttendance,
    slotKey,
    useManageState,
    type Attendance,
} from '../../demo/manageState';
import '../manage.css';

export const screenId = 'GES-04';

type Tab = 'confirmados' | 'postulados' | 'espera';
const TABS: readonly Tab[] = ['confirmados', 'postulados', 'espera'];
const isTab = (v: string): v is Tab => (TABS as readonly string[]).includes(v);

export function ShiftRosterScreen() {
    const { id, shiftId } = useParams();
    const owned = useOwnedPublication(id);
    if (owned.kind !== 'ok') return <ManageGate title={copy.shift.title} managed={owned.kind === 'not-owner' ? owned.managed : undefined} />;
    const roster = owned.managed.cupos?.find((r) => r.id === shiftId);
    if (!roster) return <ShiftNotFound managed={owned.managed} />;
    return <ShiftRoster key={`${owned.managed.publicationId}:${roster.id}`} managed={owned.managed} roster={roster} />;
}

function ShiftNotFound({ managed }: { managed: DemoManagedPublication }) {
    const goBack = useGoBack();
    const { open } = useOpenPath();
    return (
        <div className="tl-app-screen">
            <AppBar variant="standard" title={copy.shift.title} onBack={goBack} />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content">
                    <EmptyState
                        icon={IconClock}
                        title={copy.shift.notFoundTitle}
                        text={copy.shift.notFoundText}
                        action={{
                            label: copy.shift.manage,
                            onClick: () => open(paths.gestionarPublicacion(managed.publicationId), { replace: true }),
                        }}
                    />
                </div>
            </main>
        </div>
    );
}

/** El botón «Confirmar» o «Evaluar» de una fila (para devolverle el foco a la siguiente). */
function rowButton(list: HTMLElement | null, personId: string, label: string): HTMLElement | null {
    const row = list?.querySelector<HTMLElement>(`[data-person="${personId}"]`);
    return Array.from(row?.querySelectorAll<HTMLButtonElement>('button') ?? []).find((b) => b.textContent === label) ?? null;
}

function ShiftRoster({ managed, roster }: { managed: DemoManagedPublication; roster: DemoShiftRoster }) {
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const snackbar = useSnackbar();
    const { open, linkProps } = useOpenPath();
    const s = useManageState();
    const applications = useSessionApplications();
    const moreSheet = useSheet('opciones');
    const evaluateSheet = useSheet('evaluar', ['p']);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const focusAfter = usePendingFocus(moreSheet.open || evaluateSheet.open);
    useTitleFocusOnMount(titleRef);
    const location = useLocation();
    const navigate = useNavigate();
    // ¿Se abrió justo encima de GES-01? Se lee al montar: con la hoja abierta, la entrada de arriba es la de la hoja.
    const [overManage] = useState(() => overManageOf(location.state));

    const pub = managed.publicationId;
    const view = rosterView(managed, roster, s, applications);

    // Pestaña en la URL: la de entrada es Postulados mientras nadie esté confirmado (GES-04-sin-postulados).
    const fallbackTab: Tab = view.confirmados.length === 0 && !view.past ? 'postulados' : 'confirmados';
    const [tabParam, setTabParam, tabInUrl] = useReplaceParam('ver', fallbackTab);
    const tab: Tab = isTab(tabParam) ? tabParam : fallbackTab;
    // Se fija en la URL al entrar, para que no cambie sola cuando alguien queda confirmado.
    useEffect(() => {
        if (!tabInUrl) setTabParam(tab);
    }, [tabInUrl, tab, setTabParam]);

    // El «salto de tiempo»: los postulados de un turno recién publicado llegan un rato después,
    // solo mientras la publicación recibe postulaciones (pausarla o cerrarla cancela la llegada).
    const waiting = view.waiting;
    const accepting = view.accepting;
    useEffect(() => {
        if (waiting && accepting) scheduleArrival(pub, roster.id);
    }, [waiting, accepting, pub, roster.id]);
    const wasWaiting = useRef(waiting);
    useEffect(() => {
        if (wasWaiting.current && !waiting && view.postulados.length > 0) {
            snackbar.show({ message: copy.shift.arrived(view.postulados.length) });
            // Si el foco estaba en el estado vacío que se fue, pasa al título.
            if (!document.activeElement || document.activeElement === document.body) titleRef.current?.focus();
        }
        wasWaiting.current = waiting;
    }, [waiting, view.postulados.length, snackbar]);

    // Hoja «Evaluar»: a quién va en la URL (?p=); la nota se limpia al ABRIR.
    // Mientras la hoja sale, sigue mostrando a quien mostraba (el id, que no cambia entre renders).
    const evaluatingId = evaluateSheet.param('p');
    const [lastEvaluatingId, setLastEvaluatingId] = useState(evaluatingId);
    if (evaluatingId && evaluatingId !== lastEvaluatingId) setLastEvaluatingId(evaluatingId);
    const evaluating = view.confirmados.find((p) => p.personId === evaluatingId) ?? null;
    const evaluatingShown = evaluating ?? view.confirmados.find((p) => p.personId === lastEvaluatingId) ?? null;
    const [stars, setStars] = useState<number | null>(null);
    const [starsError, setStarsError] = useState(false);

    const showEvaluate = (p: DemoApplicant) => {
        setStars(null);
        setStarsError(false);
        evaluateSheet.show({ p: p.personId });
    };

    const nextFocus = (list: readonly DemoApplicant[], personId: string, label: string) => {
        const ids = list.map((p) => p.personId);
        const i = ids.indexOf(personId);
        const order = [...ids.slice(i + 1), ...ids.slice(0, i).reverse()];
        focusAfter(
            () => order.map((id) => rowButton(panelRef.current, id, label)).find(Boolean) ?? titleRef.current,
        );
    };

    const sendEvaluation = () => {
        if (!evaluatingShown) return;
        if (!stars) {
            setStarsError(true);
            return;
        }
        evaluate(pub, roster.id, evaluatingShown.personId, stars);
        evaluateSheet.hide();
        snackbar.show({ message: copy.shift.evaluatedToast(firstName(evaluatingShown.nombre)), tone: 'success' });
        nextFocus(view.confirmados, evaluatingShown.personId, copy.shift.evaluate);
    };

    const confirmOne = (p: DemoApplicant, list: readonly DemoApplicant[]) => {
        if (!view.canConfirm) return;
        confirmPeople(pub, roster.id, [p.personId]);
        snackbar.show({ message: copy.shift.confirmedOne(firstName(p.nombre)), tone: 'success' });
        nextFocus(list, p.personId, copy.shift.confirm);
    };

    const confirmFavorites = () => {
        const people = view.favoritesToConfirm;
        if (!view.canConfirm || people.length === 0) return;
        confirmPeople(
            pub,
            roster.id,
            people.map((p) => p.personId),
        );
        setTabParam('confirmados');
        snackbar.show({ message: copy.shift.confirmedMany(joinWithA(people.map((p) => firstName(p.nombre)))), tone: 'success' });
        // El botón de favoritos se va con la pestaña: el foco pasa a la pestaña «Confirmados»
        // (la URL cambia un render después: se busca por su nombre, no por la elegida).
        focusAfter(() =>
            Array.from(panelRef.current?.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []).find(
                (el) => el.textContent === copy.shift.tabConfirmed,
            ),
        );
    };

    const toggleAttendance = (p: DemoApplicant, value: Attendance) => {
        const current = s.attendance.get(slotKey(pub, roster.id, p.personId));
        setAttendance(pub, roster.id, p.personId, current === value ? null : value);
    };

    const tabs = [
        { value: 'confirmados' as const, label: copy.shift.tabConfirmed, controls: 'ges04-panel' },
        { value: 'postulados' as const, label: copy.shift.tabApplied, controls: 'ges04-panel' },
        { value: 'espera' as const, label: copy.shift.tabWaitlist, controls: 'ges04-panel' },
    ];

    const otherRosters = (managed.cupos ?? []).filter((r) => r.id !== roster.id);

    // «Más opciones» (spec §5.3 regla 2): si esta GES-04 está encima de GES-01, «Gestionar
    // publicación» cierra la hoja y vuelve a esa GES-01 en vez de apilar otra. Si no (INI-02,
    // NOT-01, un enlace), reemplaza la entrada de la hoja. Otro día reemplaza la hoja y queda
    // una entrada más lejos de GES-01.
    const onSheet = isSheetEntry(location.state, 'opciones');
    const otherDayState = overManage ? overManageState(overManage + (onSheet ? 1 : 0)) : undefined;
    const manageLink: LinkTargetProps = overManage
        ? {
              href: linkProps(paths.gestionarPublicacion(pub)).href,
              onClick: (e) => {
                  // Con Ctrl/⌘ o botón del medio, que el navegador abra otra pestaña.
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
                  e.preventDefault();
                  navigate(-(overManage + (onSheet ? 1 : 0)));
              },
          }
        : linkProps(paths.gestionarPublicacion(pub), { replace: true });

    return (
        <div className="tl-app-screen">
            <AppBar
                variant="standard"
                title={copy.shift.title}
                onBack={goBack}
                scrolled={scrolled}
                actions={<IconButton icon={IconMore} label={copy.shift.more} aria-haspopup="dialog" onClick={() => moreSheet.show()} />}
            />
            <main className="tl-app-screen__body">
                <div className="tl-app-screen__content manage-content">
                    <Stack gap={3}>
                        <Stack gap={1} align="start">
                            <h1 ref={titleRef} tabIndex={-1} className="h2 manage-text tl-focus">
                                {roster.titulo}
                            </h1>
                            <span className="body manage-muted">{roster.subtitulo}</span>
                        </Stack>
                        <CuposBar confirmed={view.confirmados.length} total={view.total} />
                    </Stack>

                    {view.closed && !view.past && <Banner>{copy.shift.closedBanner}</Banner>}
                    {view.paused && !view.past && <Banner>{copy.manage.pausedBanner}</Banner>}
                    {view.past &&
                        (view.toEvaluate.length > 0 ? (
                            <Banner>{copy.shift.pastBanner(view.toEvaluate.length, view.fecha)}</Banner>
                        ) : (
                            <Banner tone="success">{copy.shift.pastDone(view.fecha)}</Banner>
                        ))}

                    <SegmentedControl
                        aria-label={copy.shift.tabsLabel}
                        options={tabs}
                        value={tab}
                        onChange={(next) => setTabParam(next)}
                    />

                    <div id="ges04-panel" role="tabpanel" aria-label={tabs.find((t) => t.value === tab)?.label} ref={panelRef}>
                        {tab === 'confirmados' && (
                            <ConfirmedPanel
                                view={view}
                                attendance={(p) => s.attendance.get(slotKey(pub, roster.id, p.personId))}
                                evaluation={(p) => s.evaluations.get(slotKey(pub, roster.id, p.personId))}
                                evaluated={(p) => isEvaluated(s, pub, roster.id, p.personId)}
                                onAttendance={toggleAttendance}
                                onEvaluate={showEvaluate}
                                onSeeApplied={() => setTabParam('postulados')}
                            />
                        )}
                        {tab === 'postulados' && (
                            <AppliedPanel
                                view={view}
                                onConfirm={(p) => confirmOne(p, view.postulados)}
                                onConfirmFavorites={confirmFavorites}
                                onInvite={() => open(paths.favoritos(managed.ownerId))}
                            />
                        )}
                        {tab === 'espera' && <WaitlistPanel view={view} onConfirm={(p) => confirmOne(p, view.listaEspera)} />}
                    </div>
                </div>
            </main>

            <BottomSheet open={moreSheet.open} onClose={moreSheet.hide} title={copy.shift.more}>
                <Stack gap={4}>
                    {otherRosters.length > 0 && (
                        <SheetSection label={copy.shift.otherDays}>
                            <List flat>
                                {otherRosters.map((r) => {
                                    const rv = rosterView(managed, r, s, applications);
                                    return (
                                        <ListItem
                                            key={r.id}
                                            icon={IconPeople}
                                            title={copy.manage.optionsShift(rosterFecha(pub, r))}
                                            sub={`${copy.shift.tabConfirmed} ${rv.confirmados.length}/${rv.total}`}
                                            {...linkProps(paths.cuposTurno(pub, r.id), { replace: true, state: otherDayState })}
                                        />
                                    );
                                })}
                            </List>
                        </SheetSection>
                    )}
                    <List flat>
                        <ListItem
                            icon={IconOffers}
                            title={copy.shift.manage}
                            sub={managed.titulo}
                            {...manageLink}
                        />
                        <ListItem
                            icon={IconEye}
                            title={copy.manage.optionsSeePublication}
                            sub={copy.manage.optionsSeePublicationSub}
                            {...linkProps(paths.publicacion(pub), { replace: true })}
                        />
                    </List>
                </Stack>
            </BottomSheet>

            <BottomSheet
                open={evaluateSheet.open && evaluating !== null}
                onClose={evaluateSheet.hide}
                title={evaluatingShown ? copy.shift.evaluateTitle(evaluatingShown.nombre) : ''}
                footer={
                    <Button block onClick={sendEvaluation}>
                        {copy.shift.evaluateSend}
                    </Button>
                }
            >
                <Stack gap={3}>
                    <Stack gap={1}>
                        <span className="label">{copy.shift.evaluateQuestion}</span>
                        <RatingInput
                            size="lg"
                            label={copy.shift.evaluateQuestion}
                            value={stars}
                            onChange={(next) => {
                                setStars(next);
                                setStarsError(false);
                            }}
                            error={starsError ? copy.shift.evaluateError : undefined}
                        />
                    </Stack>
                    <p className="caption manage-muted">{copy.shift.evaluateNote}</p>
                </Stack>
            </BottomSheet>
        </div>
    );
}

// ─── Filas ──────────────────────────────────────────────────────────────────

const reliabilityOf = (p: DemoApplicant) => p.confiabilidad ?? copy.common.noShifts;
const ratingOf = (p: DemoApplicant) => <RatingStars value={p.nota?.value ?? null} count={p.nota?.count ?? 0} />;

function PersonAvatar({ p }: { p: DemoApplicant }) {
    return <Avatar name={p.nombre} initials={p.iniciales} />;
}

interface ConfirmedPanelProps {
    view: RosterView;
    attendance: (p: DemoApplicant) => Attendance | undefined;
    evaluation: (p: DemoApplicant) => number | undefined;
    evaluated: (p: DemoApplicant) => boolean;
    onAttendance: (p: DemoApplicant, value: Attendance) => void;
    onEvaluate: (p: DemoApplicant) => void;
    onSeeApplied: () => void;
}

function ConfirmedPanel({ view, attendance, evaluation, evaluated, onAttendance, onEvaluate, onSeeApplied }: ConfirmedPanelProps) {
    if (view.confirmados.length === 0) {
        return (
            <EmptyState
                className="manage-empty"
                icon={IconPeople}
                title={copy.shift.noConfirmedTitle}
                text={copy.shift.noConfirmedText}
                action={view.postulados.length > 0 ? { label: copy.shift.noConfirmedAction, onClick: onSeeApplied } : undefined}
            />
        );
    }
    return (
        <List>
            {view.confirmados.map((p) => {
                let actions;
                if (view.past) {
                    const stars = evaluation(p);
                    const done = evaluated(p);
                    const mark = attendance(p);
                    actions = done ? (
                        <span className="caption manage-muted">{stars ? copy.shift.evaluatedWith(stars) : copy.shift.evaluated}</span>
                    ) : (
                        <>
                            <Chip selected={mark === 'asistio'} onClick={() => onAttendance(p, 'asistio')}>
                                {copy.shift.attended}
                            </Chip>
                            <Chip selected={mark === 'no-asistio'} onClick={() => onAttendance(p, 'no-asistio')}>
                                {copy.shift.noShow}
                            </Chip>
                            {mark !== 'no-asistio' && (
                                <Button variant="ghost" size="sm" onClick={() => onEvaluate(p)}>
                                    {copy.shift.evaluate}
                                </Button>
                            )}
                        </>
                    );
                }
                return (
                    <ListItem
                        key={p.personId}
                        variant="person"
                        data-person={p.personId}
                        avatar={<PersonAvatar p={p} />}
                        title={p.nombre}
                        favorite={view.favorites.has(p.personId)}
                        favoriteLabel={copy.common.favorite}
                        sub={
                            <>
                                {ratingOf(p)} · {reliabilityOf(p)}
                            </>
                        }
                        actions={actions}
                    />
                );
            })}
        </List>
    );
}

interface AppliedPanelProps {
    view: RosterView;
    onConfirm: (p: DemoApplicant) => void;
    onConfirmFavorites: () => void;
    onInvite: () => void;
}

function AppliedPanel({ view, onConfirm, onConfirmFavorites, onInvite }: AppliedPanelProps) {
    if (view.postulados.length === 0) {
        if (view.closed || view.past) {
            return (
                <EmptyState className="manage-empty" icon={IconPeople} title={copy.shift.noMoreTitle} text={copy.shift.noMoreText} />
            );
        }
        if (view.full) {
            return (
                <EmptyState className="manage-empty" icon={IconPeople} title={copy.shift.noAppliedTitle} text={copy.shift.fullBanner} />
            );
        }
        if (view.paused) {
            return (
                <EmptyState className="manage-empty" icon={IconPeople} title={copy.shift.noAppliedTitle} text={copy.shift.noAppliedPaused} />
            );
        }
        const vacio = view.roster.vacio;
        return (
            <EmptyState
                className="manage-empty"
                icon={IconPeople}
                title={vacio?.titulo ?? copy.shift.noAppliedTitle}
                text={vacio?.texto ?? copy.shift.noAppliedText}
                action={{ label: vacio?.accion ?? copy.shift.inviteFavorites, onClick: onInvite }}
            />
        );
    }
    return (
        <Stack gap={4}>
            {view.full && !view.closed && !view.past && <Banner>{copy.shift.fullBanner}</Banner>}
            {view.favoritesToConfirm.length > 0 && (
                <Stack gap={2}>
                    <Button variant="tonal" block icon={IconHeart} onClick={onConfirmFavorites}>
                        {copy.shift.confirmFavorites(view.favoritesToConfirm.length)}
                    </Button>
                    {view.favoritesText && <p className="caption manage-muted">{view.favoritesText}</p>}
                </Stack>
            )}
            <PeopleList people={view.postulados} view={view} onConfirm={onConfirm} />
        </Stack>
    );
}

function WaitlistPanel({ view, onConfirm }: { view: RosterView; onConfirm: (p: DemoApplicant) => void }) {
    if (view.listaEspera.length === 0) {
        return <EmptyState className="manage-empty" icon={IconClock} title={copy.shift.noWaitlistTitle} text={copy.shift.noWaitlistText} />;
    }
    return <PeopleList people={view.listaEspera} view={view} onConfirm={onConfirm} />;
}

function PeopleList({ people, view, onConfirm }: { people: readonly DemoApplicant[]; view: RosterView; onConfirm: (p: DemoApplicant) => void }) {
    return (
        <List>
            {people.map((p) => (
                <ListItem
                    key={p.personId}
                    variant="person"
                    data-person={p.personId}
                    avatar={<PersonAvatar p={p} />}
                    title={p.nombre}
                    favorite={view.favorites.has(p.personId)}
                    favoriteLabel={copy.common.favorite}
                    sub={[ratingOf(p), reliabilityOf(p)]}
                    end={
                        view.canConfirm ? (
                            <Button variant="tonal" size="sm" onClick={() => onConfirm(p)}>
                                {copy.shift.confirm}
                            </Button>
                        ) : undefined
                    }
                />
            ))}
        </List>
    );
}
