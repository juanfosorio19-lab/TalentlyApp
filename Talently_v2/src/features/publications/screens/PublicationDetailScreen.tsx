// DET-01 · Detalle de publicación (/p/:id), plantillas empleo y turno del
// prototipo F1 (DET-01-empleo, DET-01-empleo-pedro, DET-01-turno,
// DET-01-turno-postulado, DET-01-turno--f9). AppBar transparente sobre la
// cabecera de quien publica, los bloques del detalle y el CTA fijo con el
// aviso de Talently: «Tomar turno» en un turno, «No me interesa» / «Me
// interesa» en un empleo. Las hojas viven en la URL: `?sheet=telefono`
// (AUTH-08, antes del primer acto transaccional), `?sheet=postular` (DET-02),
// `?sheet=verificacion` y `?sheet=opciones`. Lo que pasa aquí (postular,
// verificar el celular, «No me interesa») va a demo/sessionStore para que
// ACT-02, la Agenda, Inicio y el deck lo vean; el match (DET-03) lo muestra
// MatchHost sobre cualquier pantalla.
import { useEffect, useRef, useState, type RefObject } from 'react';
import { useHref, useParams } from 'react-router-dom';
import { ActionPair } from '../../../ui/ActionPair';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { Amount, type AmountFormatOptions } from '../../../ui/Amount';
import { Badge } from '../../../ui/Badge';
import type { BadgeStatus } from '../../../ui/Badge/badgeTones';
import { Banner } from '../../../ui/Banner';
import { Button } from '../../../ui/Button';
import { CtaBar } from '../../../ui/CtaBar';
import { IconButton } from '../../../ui/IconButton';
import { IconInfo, IconLocation, IconMore, IconShare } from '../../../ui/icons';
import { InfoTag, InfoTags } from '../../../ui/InfoTag';
import { Stack } from '../../../ui/Layout';
import { SectionCard } from '../../../ui/SectionCard';
import { ShiftBlock, ShiftBlocks } from '../../../ui/ShiftBlock';
import { SnackbarOutlet, useSnackbar } from '../../../ui/Snackbar';
import { useGoBack } from '../../../app/BackButtonManager';
import { useOpenPath, type LinkTargetProps } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useSheet, useSwapSheet } from '../../../app/sheets';
import { NotFoundScreen } from '../../../app/system/NotFoundScreen';
import { getPublication } from '../../demo/data';
import { DEMO_ACTORS, useDemoSession, type DemoActorId } from '../../demo/session';
import { applyTo, decide, scheduleMatch, undoDecision, useApplications, useSessionApplication, verifyPhone } from '../../demo/sessionStore';
import type { DemoInfoTag, DemoPublication } from '../../demo/types';
import { ApplySheet } from '../components/ApplySheet';
import {
    AboutOrgSection,
    BenefitsSection,
    DetailHero,
    DetailRow,
    Fact,
    Facts,
    RequirementsSection,
} from '../components/DetailParts';
import { MoreSheet, VerificationSheet } from '../components/DetailSheets';
import { useMoreBelow, useOpenCount, usePhoneVerified } from '../components/hooks';
import { PhoneSheet } from '../components/PhoneSheet';
import { useLater } from '../components/useLater';
import { copy } from '../copy';
import { matchConversation } from '../match';
import { DEMO_LATENCY_MS, isWrittenFor, type CvFile } from '../mock';
import { useLivePublication } from '../../demo/manageHooks';
import { saveCv, useCv } from '../../demo/profileState';
import { detailCta, isAccepting, rowIcon, rowText, shareUrl, type DetailCta } from '../model';
import '../publications.css';

export const screenId = 'DET-01';

export function PublicationDetailScreen() {
    const { id } = useParams();
    const { actor } = useDemoSession();
    // Con el estado y los cupos de la sesión (GES-01 y GES-04): «Quedan N de 8 cupos» dice lo mismo que los cupos.
    const live = useLivePublication();
    const data = id ? getPublication(id) : undefined;
    const publication = data && live(data);
    if (!publication) return <NotFoundScreen />;
    // Otro actor u otra publicación parten de cero.
    return <PublicationDetail key={`${actor.id}:${publication.id}`} pub={publication} />;
}

const amountOf = (pub: DemoPublication): AmountFormatOptions => ({
    value: pub.monto?.value ?? null,
    unit: pub.monto?.unit,
    net: pub.monto?.net,
    durationMin: pub.monto?.durationMin,
    negotiableLabel: pub.tipo === 'empleo' ? 'Sueldo a convenir' : 'A convenir',
});

/** El Badge bajo el título: «Oferta cerrada» si ya no recibe postulaciones; quien publica ve su estado. */
function stateBadge(pub: DemoPublication, cta: DetailCta): BadgeStatus | null {
    if (cta.kind === 'own') return pub.estado;
    if (isAccepting(pub)) return null;
    return pub.tipo === 'empleo' ? 'Oferta cerrada' : 'Cerrada';
}

function PublicationDetail({ pub }: { pub: DemoPublication }) {
    const { actor, recienRegistrado, setActor } = useDemoSession();
    const goBack = useGoBack();
    const snackbar = useSnackbar();
    const later = useLater();
    const scrolled = useScrolled();
    const moreBelow = useMoreBelow();
    const { open: openPath, canOpen, linkProps, soon } = useOpenPath();
    const swapSheet = useSwapSheet();

    const applications = useApplications(actor.id, recienRegistrado);
    const sessionApplication = useSessionApplication(actor.id, pub.id);
    const phoneOk = usePhoneVerified(actor.id, recienRegistrado);
    const cta = detailCta(actor, pub, applications, sessionApplication?.estado);
    const forViewer = !recienRegistrado && isWrittenFor(actor.id, pub.id);
    // El CV del perfil (demo/profileState): el de los datos o el subido en PRF-01 en esta sesión.
    const cv = useCv(actor.id, recienRegistrado);
    const orgPath = pub.autor.tipo === 'persona' ? paths.perfilPublico(pub.autor.id) : paths.organizacion(pub.autor.id);
    const shareHref = useHref(paths.publicacion(pub.id));

    const verificationSheet = useSheet('verificacion');
    const moreSheet = useSheet('opciones');
    const phoneSheet = useSheet('telefono');
    const applySheet = useSheet('postular');
    // Cada vez que se abren, parten de cero (aunque se hayan cerrado con el atrás del navegador).
    const phoneKey = useOpenCount(phoneSheet.open);
    const applyKey = useOpenCount(applySheet.open);

    const [taking, setTaking] = useState(false);
    const ctaRef = useRef<HTMLButtonElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    // Postular quita «Me interesa» de la pantalla: al cerrar la hoja, el foco va al CTA nuevo.
    const focusCta = useRef(false);
    // La app misma está pasando de AUTH-08 a DET-02 o cerrando la hoja: la guarda de abajo no se mete.
    const handingOff = useRef(false);

    const canAct = cta.kind === 'open';
    const waitlist = cta.kind === 'open' && cta.waitlist;

    // Una hoja que llega por enlace (`?sheet=postular`) solo se abre si se puede postular, y AUTH-08 va antes.
    useEffect(() => {
        if (!applySheet.open && !phoneSheet.open) {
            handingOff.current = false;
            return;
        }
        if (handingOff.current) return;
        if (!canAct || (applySheet.open && pub.tipo !== 'empleo')) swapSheet(null);
        else if (applySheet.open && !phoneOk) swapSheet(phoneSheet.open ? null : 'telefono');
        else if (phoneSheet.open && phoneOk) swapSheet(pub.tipo === 'empleo' && !applySheet.open ? 'postular' : null);
    }, [applySheet.open, phoneSheet.open, canAct, phoneOk, pub.tipo, swapSheet]);

    useEffect(() => {
        if (!focusCta.current || applySheet.open || phoneSheet.open) return;
        focusCta.current = false;
        ctaRef.current?.focus({ preventScroll: true });
    });

    // Una hoja que se abrió por enlace (el «Me interesa» del deck, una notificación) devuelve el foco al
    // body al cerrarse: quien la abrió estaba en otra pantalla. Entonces va al CTA o, si no hay, al título.
    const sheetOpen = applySheet.open || phoneSheet.open || verificationSheet.open || moreSheet.open;
    const sheetWasOpen = useRef(sheetOpen);
    useEffect(() => {
        const closed = sheetWasOpen.current && !sheetOpen;
        sheetWasOpen.current = sheetOpen;
        if (!closed) return;
        // Después de que la hoja devuelve el foco (al empezar a cerrar).
        const frame = window.requestAnimationFrame(() => {
            const active = document.activeElement;
            if (active instanceof HTMLElement && active !== document.body && active.isConnected && !active.closest('[inert]')) return;
            (ctaRef.current ?? titleRef.current)?.focus({ preventScroll: true });
        });
        return () => window.cancelAnimationFrame(frame);
    }, [sheetOpen]);

    const takeShift = () => {
        setTaking(true);
        later(() => {
            setTaking(false);
            applyTo(actor.id, pub.id, waitlist ? 'En lista de espera' : 'Postulado');
            focusCta.current = true;
            snackbar.show({ message: waitlist ? copy.done.waitlist : copy.done.turno, tone: 'success' });
        }, DEMO_LATENCY_MS);
    };

    const onTake = () => {
        if (!phoneOk) phoneSheet.show();
        else takeShift();
    };
    const onInterested = () => {
        if (!phoneOk) phoneSheet.show();
        else applySheet.show();
    };
    const onNotInterested = () => {
        // Igual que en el deck: no vuelve a aparecer, la otra parte nunca lo sabe y se puede deshacer.
        decide(actor.id, pub.id, 'no');
        goBack();
        // El Snackbar es de toda la app: sigue a la vista en la pantalla a la que se vuelve.
        snackbar.show({
            message: copy.notInterested(pub.titulo),
            action: { label: copy.undo, onAction: () => undoDecision(actor.id, pub.id) },
        });
    };

    const onPhoneVerified = () => {
        verifyPhone(actor.id);
        handingOff.current = true;
        if (pub.tipo === 'empleo') {
            swapSheet('postular');
            return;
        }
        phoneSheet.hide();
        takeShift();
    };

    const onApplied = (pickedCv?: CvFile) => {
        applyTo(actor.id, pub.id, 'Postulado');
        // El CV que subió para postular queda en su perfil si no tenía uno: Perfil lo muestra y la próxima oferta lo ofrece.
        if (pickedCv && !cv) saveCv(actor.id, pickedCv, recienRegistrado);
        // La organización responde un rato después: MatchHost lo muestra donde esté la persona.
        // Jorge recién registrado aún no tiene conversaciones: sin una a la que llevar, no hay match.
        if (matchConversation(actor.id, pub, recienRegistrado)) scheduleMatch(actor.id, pub.id);
        handingOff.current = true;
        focusCta.current = true;
        applySheet.hide();
        snackbar.show({ message: copy.done.empleo(pub.titulo), tone: 'success' });
    };

    const share = async () => {
        // La publicación sola: sin `?demo=` ni la hoja abierta.
        const url = shareUrl(window.location, shareHref);
        if (typeof navigator.share === 'function') {
            try {
                await navigator.share({ title: pub.titulo, text: `${pub.titulo} · ${pub.autor.nombre}`, url });
                return;
            } catch (error) {
                // La persona cerró la hoja de compartir: no es un error.
                if (error instanceof DOMException && error.name === 'AbortError') return;
            }
        }
        try {
            await navigator.clipboard.writeText(url);
            snackbar.show({ message: copy.share.copied, tone: 'success' });
        } catch {
            snackbar.show({ message: copy.share.error, tone: 'error' });
        }
    };

    const manage = (ownerId: DemoActorId) => {
        const path = paths.gestionarPublicacion(pub.id);
        if (!canOpen(path)) {
            soon();
            return;
        }
        // Rosa mira un turno de su banquetería: gestiona como la organización.
        if (ownerId !== actor.id) {
            setActor(ownerId);
            snackbar.show({ message: copy.switched(DEMO_ACTORS[ownerId].fullName) });
        }
        openPath(path);
    };

    const badge = stateBadge(pub, cta);
    const accepting = isAccepting(pub);

    let action = null;
    if (cta.kind === 'own') {
        action = (
            <Button ref={ctaRef} variant="tonal" size="lg" block onClick={() => manage(cta.ownerId)}>
                {copy.cta.manage}
            </Button>
        );
    } else if (cta.kind === 'applied') {
        action = (
            <Button ref={ctaRef} variant="tonal" size="lg" block onClick={() => openPath(cta.to)}>
                {cta.label}
            </Button>
        );
    } else if (cta.kind === 'closed') {
        action = (
            <Button ref={ctaRef} variant="tonal" size="lg" block onClick={() => openPath(paths.explorar(pub.tipo === 'turno' ? 'turno' : 'empleo'))}>
                {pub.tipo === 'turno' ? copy.cta.similarShifts : copy.cta.similarJobs}
            </Button>
        );
    } else if (cta.kind === 'open' && pub.tipo === 'turno') {
        action = (
            <Button ref={ctaRef} size="lg" block loading={taking} loadingLabel={copy.cta.taking} onClick={onTake}>
                {cta.waitlist ? copy.cta.waitlist : copy.cta.take}
            </Button>
        );
    } else if (cta.kind === 'open' && pub.tipo === 'empleo') {
        action = <ActionPair onNo={onNotInterested} onYes={onInterested} yesProps={{ ref: ctaRef }} />;
    } else if (cta.kind === 'open') {
        // Servicios (F3) y clases (F2): sus hojas aún no existen.
        action = (
            <Button ref={ctaRef} size="lg" block onClick={soon}>
                {pub.tipo === 'servicio' ? copy.cta.quote : copy.cta.schedule}
            </Button>
        );
    }

    let notice: string | null = pub.detalle.aviso;
    if (cta.kind === 'own') notice = null;
    else if (cta.kind === 'org') notice = copy.orgCannotApply;
    else if (cta.kind === 'closed' || !accepting) notice = copy.closed[pub.tipo === 'turno' ? 'turno' : 'empleo'];

    return (
        <div className="tl-app-screen">
            <AppBar
                variant="transparent"
                // El H1 es el título de la publicación, en el cuerpo (como StepLayout).
                titleAs="p"
                title={copy.appBar[pub.tipo]}
                onBack={goBack}
                scrolled={scrolled}
                actions={
                    <>
                        <IconButton icon={IconShare} label={copy.appBar.share} onClick={() => void share()} />
                        <IconButton icon={IconMore} label={copy.appBar.more} aria-haspopup="dialog" onClick={() => moreSheet.show()} />
                    </>
                }
            />
            <main className="tl-app-screen__body">
                <DetailHero author={pub.autor} onVerification={() => verificationSheet.show()} />
                <div className="tl-app-screen__content pub-content">
                    {pub.tipo === 'turno' ? (
                        <ShiftBody pub={pub} badge={badge} forViewer={forViewer} titleRef={titleRef} />
                    ) : (
                        <JobBody pub={pub} badge={badge} forViewer={forViewer} titleRef={titleRef} orgLink={linkProps(orgPath)} />
                    )}
                </div>
            </main>
            <CtaBar scrolled={moreBelow}>
                {notice && <Banner className="pub-cta-note">{notice}</Banner>}
                <SnackbarOutlet />
                {action}
            </CtaBar>

            <VerificationSheet
                open={verificationSheet.open}
                onClose={verificationSheet.hide}
                name={pub.autor.nombre}
                verifications={pub.autor.verificaciones}
            />
            <MoreSheet
                open={moreSheet.open}
                onClose={moreSheet.hide}
                onReport={() => {
                    moreSheet.hide();
                    soon();
                }}
            />
            <PhoneSheet
                key={`telefono-${phoneKey}`}
                open={phoneSheet.open && canAct && !phoneOk}
                onClose={phoneSheet.hide}
                purpose={pub.tipo === 'turno' ? 'turno' : 'empleo'}
                onVerified={onPhoneVerified}
            />
            {pub.tipo === 'empleo' && (
                <ApplySheet
                    key={`postular-${applyKey}`}
                    open={applySheet.open && canAct && phoneOk}
                    onClose={applySheet.hide}
                    publication={pub}
                    profileCv={cv}
                    onApplied={onApplied}
                />
            )}
        </div>
    );
}

type TitleRef = RefObject<HTMLHeadingElement | null>;

/** Título (el único H1, con tabIndex -1 para recibir el foco), bajada (Casona en Las Condes) y el Badge de estado. */
function TitleBlock({ pub, badge, titleRef }: { pub: DemoPublication; badge: BadgeStatus | null; titleRef: TitleRef }) {
    return (
        <>
            <h1 ref={titleRef} tabIndex={-1} className="h2 pub-flush">
                {pub.titulo}
            </h1>
            {pub.detalle.subtitulo && <p className="body pub-muted pub-flush">{pub.detalle.subtitulo}</p>}
            {badge && (
                <div>
                    <Badge status={badge} />
                </div>
            )}
        </>
    );
}

/** Filas «rótulo + valor» del detalle. */
function Rows({ pub }: { pub: DemoPublication }) {
    return pub.detalle.filas.map((row) => (
        <DetailRow key={row.label} icon={rowIcon(row.label)} label={row.label}>
            {rowText(row)}
        </DetailRow>
    ));
}

/** Plantilla Turno: bloques por día, tarifa, forma de contratación, lugar, «Detalle del turno» y requisitos. */
function ShiftBody({
    pub,
    badge,
    forViewer,
    titleRef,
}: {
    pub: Extract<DemoPublication, { tipo: 'turno' }>;
    badge: BadgeStatus | null;
    forViewer: boolean;
    titleRef: TitleRef;
}) {
    const { contratacion, filasTitulo, filas, requisitos } = pub.detalle;
    return (
        <>
            <Stack gap={1}>
                <TitleBlock pub={pub} badge={badge} titleRef={titleRef} />
            </Stack>
            <ShiftBlocks>
                {pub.bloques.map((b) => (
                    <ShiftBlock key={b.id} weekday={b.weekday} day={b.day} month={b.month} time={b.time} duration={b.duration} cupos={b.cupos} />
                ))}
            </ShiftBlocks>
            <p className="pub-flush">
                <Amount size="lg" {...amountOf(pub)} />
            </p>
            {contratacion && (
                <Stack gap={1}>
                    <InfoTags>
                        <InfoTag kind="contrato">{contratacion.forma}</InfoTag>
                    </InfoTags>
                    {contratacion.nota && (
                        <p className="caption pub-note">
                            <IconInfo size={16} />
                            {contratacion.nota}
                        </p>
                    )}
                </Stack>
            )}
            <Facts variant="flush">
                <Fact icon={IconLocation}>{pub.lugar}</Fact>
            </Facts>
            {filas.length > 0 && (
                <SectionCard title={filasTitulo ?? copy.sections.description}>
                    <Rows pub={pub} />
                </SectionCard>
            )}
            {requisitos.length > 0 && <RequirementsSection items={requisitos} forViewer={forViewer} />}
        </>
    );
}

/** Plantilla Empleo (y, mientras no tengan la suya, servicio y clase): sueldo, InfoTag, lugar y secciones. */
function JobBody({
    pub,
    badge,
    forViewer,
    titleRef,
    orgLink,
}: {
    pub: DemoPublication;
    badge: BadgeStatus | null;
    forViewer: boolean;
    titleRef: TitleRef;
    /** «Sobre la organización» → su perfil público (linkProps de useOpenPath). */
    orgLink: LinkTargetProps;
}) {
    const { descripcion, filasTitulo, requisitos, beneficios, sobreOrganizacion, contratacion } = pub.detalle;
    // La forma de contratación va con los demás datos si la tarjeta no la trae ya (aviso del hogar).
    const tags: DemoInfoTag[] =
        contratacion && !pub.tags.some((t) => t.text === contratacion.forma)
            ? [...pub.tags, { kind: 'contrato', text: contratacion.forma }]
            : pub.tags;
    return (
        <>
            <Stack gap={2}>
                <TitleBlock pub={pub} badge={badge} titleRef={titleRef} />
                <p className="pub-flush">
                    <Amount size="lg" {...amountOf(pub)} />
                </p>
                {tags.length > 0 && (
                    <InfoTags>
                        {tags.map((t) => (
                            <InfoTag key={t.text} kind={t.kind}>
                                {t.text}
                            </InfoTag>
                        ))}
                    </InfoTags>
                )}
                <Facts>
                    <Fact icon={IconLocation}>{pub.lugar}</Fact>
                </Facts>
            </Stack>
            {(descripcion || (!filasTitulo && pub.detalle.filas.length > 0)) && (
                <SectionCard title={copy.sections.description}>
                    {descripcion && <p className="body pub-flush">{descripcion}</p>}
                    {!filasTitulo && <Rows pub={pub} />}
                </SectionCard>
            )}
            {filasTitulo && pub.detalle.filas.length > 0 && (
                <SectionCard title={filasTitulo}>
                    <Rows pub={pub} />
                </SectionCard>
            )}
            {requisitos.length > 0 && <RequirementsSection items={requisitos} forViewer={forViewer} />}
            {beneficios && beneficios.length > 0 && <BenefitsSection items={beneficios} />}
            {sobreOrganizacion && <AboutOrgSection author={pub.autor} text={sobreOrganizacion} link={orgLink} />}
        </>
    );
}
