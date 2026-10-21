// DET-01 · Detalle de publicación (/p/:id), plantillas empleo y turno del
// prototipo F1 (DET-01-empleo, DET-01-empleo-pedro, DET-01-turno,
// DET-01-turno-postulado, DET-01-turno--f9). AppBar transparente sobre la
// cabecera de quien publica, los bloques del detalle y el CTA fijo con el
// aviso de Talently: «Tomar turno» en un turno, «No me interesa» / «Me
// interesa» en un empleo. Desde aquí se abren AUTH-08 (Verificar teléfono,
// antes del primer acto transaccional), DET-02 (Postular) y DET-03 (¡Hicieron
// match!, que lleva a la conversación).
import { useEffect, useState, type MouseEvent } from 'react';
import { useHref, useNavigate, useParams } from 'react-router-dom';
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
import { MatchModal } from '../../../ui/MatchModal';
import { SectionCard } from '../../../ui/SectionCard';
import { ShiftBlock, ShiftBlocks } from '../../../ui/ShiftBlock';
import { SnackbarOutlet, useSnackbar } from '../../../ui/Snackbar';
import { useGoBack } from '../../../app/BackButtonManager';
import { paths } from '../../../app/paths';
import { NotFoundScreen } from '../../../app/system/NotFoundScreen';
import { useDemoSession } from '../../demo/session';
import { getPublication } from '../../demo/data';
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
import { useMoreBelow, useOpenPath } from '../components/hooks';
import { PhoneSheet } from '../components/PhoneSheet';
import { useLater } from '../components/useLater';
import { copy } from '../copy';
import { DEMO_LATENCY_MS, MATCH_DELAY_MS, isWrittenFor, profileCv, shortOrgName } from '../mock';
import { detailCta, hasVerifiedPhone, isAccepting, matchConversation, rowIcon, rowText, type DetailCta } from '../model';
import { applyTo, markMatchSeen, usePublicationSession, verifyPhone } from '../store';
import '../publications.css';

export const screenId = 'DET-01';

export function PublicationDetailScreen() {
    const { id } = useParams();
    const { actor } = useDemoSession();
    const publication = id ? getPublication(id) : undefined;
    if (!publication) return <NotFoundScreen />;
    // Otro actor u otra publicación parten de cero (hojas cerradas, sin match pendiente).
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

type PhoneRequest = { open: boolean; key: number; next: 'take' | 'apply' };

function PublicationDetail({ pub }: { pub: DemoPublication }) {
    const { actor } = useDemoSession();
    const goBack = useGoBack();
    const navigate = useNavigate();
    const snackbar = useSnackbar();
    const later = useLater();
    const scrolled = useScrolled();
    const moreBelow = useMoreBelow();
    const { open: openPath } = useOpenPath();
    const session = usePublicationSession(actor.id, pub.id);

    const cta = detailCta(actor, pub, session);
    const conversation = matchConversation(actor, pub);
    const forViewer = isWrittenFor(actor.id, pub.id);
    const orgPath = pub.autor.tipo === 'persona' ? paths.perfilPublico(pub.autor.id) : paths.organizacion(pub.autor.id);
    const orgHref = useHref(orgPath);

    const [verificationOpen, setVerificationOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [applyOpen, setApplyOpen] = useState(false);
    const [phone, setPhone] = useState<PhoneRequest>({ open: false, key: 0, next: 'take' });
    const [taking, setTaking] = useState(false);
    const [matchOpen, setMatchOpen] = useState(false);
    const [leaving, setLeaving] = useState(false);

    // DET-03: la organización responde un rato después de postular (el «salto de tiempo» del prototipo).
    const appliedAt = session.application?.at;
    useEffect(() => {
        if (appliedAt === undefined || session.matchSeen || !conversation) return;
        const wait = Math.max(0, appliedAt + MATCH_DELAY_MS - Date.now());
        const timer = window.setTimeout(() => {
            setMatchOpen(true);
            markMatchSeen(actor.id, pub.id);
        }, wait);
        return () => window.clearTimeout(timer);
    }, [appliedAt, session.matchSeen, conversation, actor.id, pub.id]);

    // «Seguir explorando» (o atrás con el match abierto): cuando el modal ya salió de la pila de capas, vuelve.
    useEffect(() => {
        if (leaving) goBack();
    }, [leaving, goBack]);

    const askPhone = (next: PhoneRequest['next']) => setPhone((p) => ({ open: true, key: p.key + 1, next }));

    /** Antes del primer acto transaccional: una organización no postula y hace falta el celular verificado. */
    const canAct = (next: PhoneRequest['next']): boolean => {
        if (actor.kind === 'organizacion') {
            snackbar.show({ message: copy.orgCannotApply });
            return false;
        }
        if (!hasVerifiedPhone(actor, session)) {
            askPhone(next);
            return false;
        }
        return true;
    };

    const takeShift = (waitlist: boolean) => {
        setTaking(true);
        later(() => {
            setTaking(false);
            applyTo(actor.id, pub.id, waitlist ? 'En lista de espera' : 'Postulado');
            snackbar.show({ message: waitlist ? copy.done.waitlist : copy.done.turno, tone: 'success' });
        }, DEMO_LATENCY_MS);
    };

    const waitlist = cta.kind === 'open' && cta.waitlist;
    const onTake = () => {
        if (canAct('take')) takeShift(waitlist);
    };
    const onInterested = () => {
        if (canAct('apply')) setApplyOpen(true);
    };

    const onPhoneVerified = () => {
        verifyPhone(actor.id);
        setPhone((p) => ({ ...p, open: false }));
        if (phone.next === 'take') takeShift(waitlist);
        else setApplyOpen(true);
    };

    const onApplied = () => {
        setApplyOpen(false);
        applyTo(actor.id, pub.id, 'Postulado');
        snackbar.show({ message: copy.done.empleo(pub.titulo), tone: 'success' });
    };

    const share = async () => {
        const url = window.location.href;
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

    const badge = stateBadge(pub, cta);
    const accepting = isAccepting(pub);
    const similar = () => navigate(paths.explorar(pub.tipo === 'turno' ? 'turno' : 'empleo'));

    let action;
    if (cta.kind === 'own') {
        action = (
            <Button variant="tonal" size="lg" block onClick={() => openPath(paths.gestionarPublicacion(pub.id))}>
                {copy.cta.manage}
            </Button>
        );
    } else if (cta.kind === 'applied') {
        action = (
            <Button variant="tonal" size="lg" block onClick={() => openPath(cta.to)}>
                {cta.label}
            </Button>
        );
    } else if (cta.kind === 'closed') {
        action = (
            <Button variant="tonal" size="lg" block onClick={similar}>
                {pub.tipo === 'turno' ? copy.cta.similarShifts : copy.cta.similarJobs}
            </Button>
        );
    } else if (pub.tipo === 'turno') {
        action = (
            <Button size="lg" block loading={taking} loadingLabel={copy.cta.taking} onClick={onTake}>
                {cta.waitlist ? copy.cta.waitlist : copy.cta.take}
            </Button>
        );
    } else if (pub.tipo === 'empleo') {
        action = <ActionPair onNo={goBack} onYes={onInterested} />;
    } else {
        // Servicios (F3) y clases (F2): sus hojas aún no existen.
        action = (
            <Button size="lg" block onClick={() => snackbar.show({ message: copy.soon })}>
                {pub.tipo === 'servicio' ? copy.cta.quote : copy.cta.schedule}
            </Button>
        );
    }

    const notice =
        cta.kind === 'own' ? null : cta.kind === 'closed' || !accepting ? copy.closed[pub.tipo === 'turno' ? 'turno' : 'empleo'] : pub.detalle.aviso;

    return (
        <div className="tl-app-screen">
            <AppBar
                variant="transparent"
                title={copy.appBar[pub.tipo]}
                onBack={goBack}
                scrolled={scrolled}
                actions={
                    <>
                        <IconButton icon={IconShare} label={copy.appBar.share} onClick={() => void share()} />
                        <IconButton icon={IconMore} label={copy.appBar.more} aria-haspopup="dialog" onClick={() => setMoreOpen(true)} />
                    </>
                }
            />
            <main className="tl-app-screen__body">
                <DetailHero author={pub.autor} onVerification={() => setVerificationOpen(true)} />
                <div className="tl-app-screen__content pub-content">
                    {pub.tipo === 'turno' ? (
                        <ShiftBody pub={pub} badge={badge} forViewer={forViewer} />
                    ) : (
                        <JobBody
                            pub={pub}
                            badge={badge}
                            forViewer={forViewer}
                            orgHref={orgHref}
                            onOpenOrg={(e) => {
                                e.preventDefault();
                                openPath(orgPath);
                            }}
                        />
                    )}
                </div>
            </main>
            <CtaBar scrolled={moreBelow}>
                {notice && <Banner className="pub-cta-note">{notice}</Banner>}
                <SnackbarOutlet />
                {action}
            </CtaBar>

            <VerificationSheet
                open={verificationOpen}
                onClose={() => setVerificationOpen(false)}
                name={pub.autor.nombre}
                verifications={pub.autor.verificaciones}
            />
            <MoreSheet
                open={moreOpen}
                onClose={() => setMoreOpen(false)}
                onReport={() => {
                    setMoreOpen(false);
                    snackbar.show({ message: copy.soon });
                }}
            />
            {phone.key > 0 && (
                <PhoneSheet
                    key={phone.key}
                    open={phone.open}
                    onClose={() => setPhone((p) => ({ ...p, open: false }))}
                    purpose={pub.tipo === 'turno' ? 'turno' : 'empleo'}
                    onVerified={onPhoneVerified}
                />
            )}
            {pub.tipo === 'empleo' && (
                <ApplySheet
                    open={applyOpen}
                    onClose={() => setApplyOpen(false)}
                    publication={pub}
                    profileCv={profileCv(actor.id)}
                    onApplied={onApplied}
                />
            )}
            {conversation && (
                <MatchModal
                    open={matchOpen}
                    onClose={() => {
                        setMatchOpen(false);
                        setLeaving(true);
                    }}
                    onMessage={() => navigate(paths.conversacion(conversation.id))}
                    person={{ name: actor.fullName }}
                    org={{ name: pub.autor.nombre, shortName: shortOrgName(pub.autor.nombre) }}
                    publication={pub.titulo}
                />
            )}
        </div>
    );
}

/** Título, bajada (Casona en Las Condes) y el Badge de estado si corresponde. */
function TitleBlock({ pub, badge }: { pub: DemoPublication; badge: BadgeStatus | null }) {
    return (
        <>
            <h1 className="h2 pub-flush">{pub.titulo}</h1>
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
function ShiftBody({ pub, badge, forViewer }: { pub: Extract<DemoPublication, { tipo: 'turno' }>; badge: BadgeStatus | null; forViewer: boolean }) {
    const { contratacion, filasTitulo, filas, requisitos } = pub.detalle;
    return (
        <>
            <Stack gap={1}>
                <TitleBlock pub={pub} badge={badge} />
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
    orgHref,
    onOpenOrg,
}: {
    pub: DemoPublication;
    badge: BadgeStatus | null;
    forViewer: boolean;
    orgHref: string;
    onOpenOrg: (e: MouseEvent<HTMLElement>) => void;
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
                <TitleBlock pub={pub} badge={badge} />
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
            {sobreOrganizacion && <AboutOrgSection author={pub.autor} text={sobreOrganizacion} href={orgHref} onOpen={onOpenOrg} />}
        </>
    );
}
