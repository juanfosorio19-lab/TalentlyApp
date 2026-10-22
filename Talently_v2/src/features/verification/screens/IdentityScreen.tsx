// VER-02 · Verificar identidad (`/verificacion/identidad`, prototipo F1:
// VER-02, VER-02-frente, VER-02-dorso y VER-02-selfie). Asistida: ejemplos
// visuales, guía de encuadre (MediaCapture), «Tomar foto» con la cámara real y
// «Elegir de la galería», consentimiento en contexto al enviar la selfie y
// resultado «En revisión · te avisamos en menos de 24 h».
//
// El paso va en la URL (`?paso=frente|dorso|selfie`) y cambia con replace:
// VER-02 es una sola entrada del historial y el atrás (AppBar y Android,
// useWizardBack) vuelve al paso anterior. Con `?volver=<ruta>` (PUBL-04,
// flujo 5), al enviar vuelve al asistente que la pidió; sin él, muestra el
// resultado. Las fotos viven solo en esta pantalla y se borran al salir.
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Banner } from '../../../ui/Banner';
import { Checkbox } from '../../../ui/Checkbox';
import { cx } from '../../../ui/cx';
import { IconCamera, IconDocument, IconLock } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { DocSample, DocSampleList, MediaCapture, type DocSampleVariant } from '../../../ui/MediaUploader';
import { ResultScreen } from '../../../ui/ResultScreen';
import { SnackbarOutlet, useSnackbar } from '../../../ui/Snackbar';
import { StepLayout } from '../../../ui/StepLayout';
import { useGoBack } from '../../../app/BackButtonManager';
import { useWizardBack } from '../../../app/navigation/backHandlers';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useSheet } from '../../../app/sheets';
import { OptionsSheet } from '../components/OptionsSheet';
import { useLater } from '../components/useLater';
import { COPY } from '../copy';
import {
    CAPTURE_STEPS,
    firstMissing,
    isPhoto,
    nextStep,
    parseStep,
    previousStep,
    safeReturnPath,
    stepNumber,
    type CaptureStep,
    type IdentityStatus,
    type IdentityStep,
} from '../model';
import { submitIdentity } from '../store';
import { useVerification } from '../useVerification';
import type { FromVerificationState } from './VerificationScreen';
import '../verification.css';

export const screenId = 'VER-02';

const T = COPY.ver02;

/** Ejemplo visual de cada paso: lo marcado es lo que debe leerse (prototipo). */
const SAMPLE: Record<CaptureStep, { variant: DocSampleVariant; marks: readonly number[] }> = {
    frente: { variant: 'front', marks: [0, 1] },
    dorso: { variant: 'back', marks: [2] },
    selfie: { variant: 'face', marks: [] },
};

type Photos = Partial<Record<CaptureStep, string>>;

/** El CTA fijo del paso: la acción principal y, si hay, la ghost de abajo. */
interface StepCta {
    label: string;
    onClick: () => void;
    skipLabel?: string;
    onSkip?: () => void;
}

function cameFromVerification(state: unknown): boolean {
    return (state as Partial<FromVerificationState> | null)?.desde === 'verificacion';
}

/** Índice de React Router en el historial (cuántas entradas propias hay debajo). */
function historyIndex(): number {
    const state = window.history.state as { idx?: number } | null;
    return typeof state?.idx === 'number' ? state.idx : 0;
}

export function IdentityScreen() {
    const { personId, identity, hogar } = useVerification();
    const [params] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { canOpen } = useOpenPath();
    // Solo una pantalla que existe: volver nunca termina en «No encontramos esta página».
    const asked = safeReturnPath(params.get('volver'), paths.verificarIdentidad());
    const volver = asked && canOpen(asked) ? asked : null;
    // Al enviar con `volver`, la pantalla se va: no alcanza a mostrar el resultado.
    const [leaving, setLeaving] = useState(false);

    if (leaving) return null;
    if (identity !== 'pending') return <IdentityResult status={identity} volver={volver} />;

    const onSent = () => {
        if (volver) {
            setLeaving(true);
            navigate(volver, { replace: true });
        } else {
            // Sin `?paso`: el resultado queda en la entrada de VER-02.
            const next = new URLSearchParams(params);
            next.delete('paso');
            navigate({ search: next.size ? `?${next}` : '' }, { replace: true, state: location.state });
        }
        submitIdentity(personId);
    };

    return <IdentityWizard hogar={hogar || volver !== null} volver={volver} onSent={onSent} />;
}

interface IdentityWizardProps {
    /** Viene a recibir a alguien en su casa (perfil Hogar o un aviso del hogar). */
    hogar: boolean;
    volver: string | null;
    onSent: () => void;
}

function IdentityWizard({ hogar, volver, onSent }: IdentityWizardProps) {
    const goBack = useGoBack();
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();
    const { soon } = useOpenPath();
    const { show } = useSnackbar();
    const later = useLater();
    const options = useSheet('opciones');
    const step = parseStep(params.get('paso'));

    const [photos, setPhotos] = useState<Photos>({});
    const [notPhoto, setNotPhoto] = useState<CaptureStep | null>(null);
    const [consent, setConsent] = useState(false);
    const [consentError, setConsentError] = useState(false);
    const [sending, setSending] = useState(false);
    const cameraRef = useRef<HTMLInputElement>(null);
    const galleryRef = useRef<HTMLInputElement>(null);
    const consentRef = useRef<HTMLInputElement>(null);
    const consentBox = useRef<HTMLDivElement>(null);

    // Las fotos son de esta pantalla: al salir (o al cambiar una), se sueltan.
    const urls = useRef(new Set<string>());
    useEffect(() => {
        const created = urls.current;
        return () => {
            created.forEach((u) => URL.revokeObjectURL(u));
            created.clear();
        };
    }, []);

    const taken = new Set(CAPTURE_STEPS.filter((s) => photos[s]));

    const goTo = (next: IdentityStep) => {
        const search = new URLSearchParams(params);
        search.delete('sheet');
        if (next === 'inicio') search.delete('paso');
        else search.set('paso', next);
        navigate({ search: search.size ? `?${search}` : '' }, { replace: true, state: location.state });
    };

    // Atrás (AppBar y Android): paso anterior; desde el inicio, sale de VER-02.
    useWizardBack(() => {
        const prev = previousStep(step);
        if (prev === null) return false;
        goTo(prev);
        return true;
    });

    const onFile = (files: FileList | null) => {
        const file = files?.[0];
        if (!file || step === 'inicio') return;
        if (!isPhoto(file)) {
            setNotPhoto(step);
            return;
        }
        const url = URL.createObjectURL(file);
        urls.current.add(url);
        const old = photos[step];
        if (old) {
            URL.revokeObjectURL(old);
            urls.current.delete(old);
        }
        setPhotos({ ...photos, [step]: url });
        setNotPhoto(null);
        const next = nextStep(step, new Set([...taken, step]));
        if (next !== step) goTo(next);
    };

    const send = () => {
        const missing = firstMissing(taken);
        if (missing) {
            show({ message: T.faltaFoto[missing] });
            goTo(missing);
            return;
        }
        if (!consent) {
            setConsentError(true);
            consentRef.current?.focus({ preventScroll: true });
            // El motivo queda a la vista, sobre el CTA fijo.
            requestAnimationFrame(() => consentBox.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }));
            return;
        }
        setSending(true);
        later(() => {
            setSending(false);
            onSent();
        });
    };

    /** «Salir sin enviar»: deja VER-02 (y la hoja abierta encima) de una vez. */
    const exit = () => {
        const depth = (location.state as { sheet?: string } | null)?.sheet === 'opciones' ? 2 : 1;
        if (historyIndex() >= depth) navigate(-depth);
        else navigate(volver ?? paths.verificacion(), { replace: true });
    };

    const help = () => {
        // Aún no hay un número de WhatsApp de soporte (pedido en «requests»): aviso honesto.
        if (options.open) options.hide();
        soon();
    };

    const fileInputs = step !== 'inicio' && (
        <>
            <input
                ref={cameraRef}
                type="file"
                hidden
                tabIndex={-1}
                accept="image/*"
                capture={step === 'selfie' ? 'user' : 'environment'}
                onChange={(e) => {
                    onFile(e.currentTarget.files);
                    e.currentTarget.value = '';
                }}
            />
            <input
                ref={galleryRef}
                type="file"
                hidden
                tabIndex={-1}
                accept="image/*"
                onChange={(e) => {
                    onFile(e.currentTarget.files);
                    e.currentTarget.value = '';
                }}
            />
        </>
    );

    const sheet = <OptionsSheet open={options.open} onClose={options.hide} onHelp={help} onExit={exit} />;
    const menu = () => options.show();

    if (step === 'inicio') {
        return (
            <>
                <StepLayout
                    title={T.titulo}
                    subtitle={hogar ? T.subHogar : T.subTrabajo}
                    onBack={goBack}
                    onMenu={menu}
                    continueLabel={T.comenzar}
                    onContinue={() => goTo('frente')}
                    skipLabel={T.ayuda}
                    onSkip={help}
                    notice={<SnackbarOutlet />}
                >
                    <Stack gap={6}>
                        <DocSampleList items={T.ejemplos} />
                        {/* Hechos con ícono: el marcado tl-pub__facts del prototipo (src/ui no exporta la lista; pedida). */}
                        <ul className="tl-pub__facts ver-facts">
                            <li className="tl-pub__fact">
                                <IconDocument />
                                <span>{T.hechoCedula}</span>
                            </li>
                            <li className="tl-pub__fact">
                                <IconCamera />
                                <span>{T.hechoLuz}</span>
                            </li>
                            <li className="tl-pub__fact">
                                <IconLock />
                                <span>{T.hechoPrivacidad}</span>
                            </li>
                        </ul>
                        <Banner tone="success">{T.gratis}</Banner>
                    </Stack>
                </StepLayout>
                {sheet}
            </>
        );
    }

    const copy = T.pasos[step];
    const face = step === 'selfie';
    const photo = photos[step];
    const sample = SAMPLE[step];
    const takePhoto = () => cameraRef.current?.click();
    const captureState = notPhoto === step ? 'error' : photo ? 'ok' : 'ready';
    const hint = captureState === 'error' ? T.noEsFoto : photo ? T.fotoLista : copy.hint;

    // Sin foto: «Tomar foto» y «Elegir de la galería» (la selfie, solo con la cámara).
    // Con foto: «Continuar» (en la selfie, «Enviar») y «Tomar otra».
    const cta: StepCta = photo
        ? face
            ? { label: T.enviar, onClick: send, skipLabel: T.otraSelfie, onSkip: takePhoto }
            : { label: T.continuar, onClick: () => goTo(nextStep(step, taken)), skipLabel: T.otraFoto, onSkip: takePhoto }
        : face
          ? { label: T.tomarSelfie, onClick: takePhoto }
          : { label: T.tomarFoto, onClick: takePhoto, skipLabel: T.galeria, onSkip: () => galleryRef.current?.click() };

    return (
        <>
            <StepLayout
                title={copy.titulo}
                subtitle={copy.sub}
                progress={{ step: stepNumber(step), total: CAPTURE_STEPS.length }}
                onBack={goBack}
                onMenu={menu}
                continueLabel={cta.label}
                onContinue={cta.onClick}
                continueLoading={sending}
                continueLoadingLabel={T.enviando}
                skipLabel={cta.skipLabel}
                onSkip={cta.onSkip}
                notice={<SnackbarOutlet />}
            >
                <Stack gap={6}>
                    <MediaCapture
                        className="ver-capture"
                        guide={face ? 'face' : 'document'}
                        state={captureState}
                        hint={hint}
                        shot={photo ?? null}
                    />
                    <div className="ver-example">
                        <div className={cx('ver-example__sample', face && 'ver-example__sample--face')}>
                            <DocSample variant={sample.variant} marks={sample.marks} label={copy.ejemploLabel} />
                        </div>
                        <div className="ver-example__text">
                            <span className="caption ver-muted">{T.asi}</span>
                            <span className="body">{copy.ejemplo}</span>
                        </div>
                    </div>
                    {face && photo && (
                        <div ref={consentBox}>
                            <Checkbox
                                ref={consentRef}
                                label={T.consentimiento}
                                description={T.consentimientoDetalle}
                                checked={consent}
                                onChange={(e) => {
                                    setConsent(e.currentTarget.checked);
                                    if (e.currentTarget.checked) setConsentError(false);
                                }}
                                error={consentError ? T.consentimientoError : undefined}
                            />
                        </div>
                    )}
                </Stack>
                {fileInputs}
            </StepLayout>
            {sheet}
        </>
    );
}

interface IdentityResultProps {
    status: Exclude<IdentityStatus, 'pending'>;
    volver: string | null;
}

/** «En revisión» (o ya verificada): un solo mensaje y su CTA. */
function IdentityResult({ status, volver }: IdentityResultProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { open } = useOpenPath();
    const review = status === 'review';

    const action = volver
        ? { label: T.volverAlAviso, onClick: () => navigate(volver, { replace: true }) }
        : {
              label: T.verMiVerificacion,
              // Si la abrió VER-01, vuelve a ella (que ya dice «En revisión»); si no, la abre en su lugar.
              onClick: () =>
                  cameFromVerification(location.state) && historyIndex() > 0
                      ? navigate(-1)
                      : open(paths.verificacion(), { replace: true }),
          };

    return (
        <ResultScreen
            variant={review ? 'info' : 'success'}
            title={review ? T.revisionTitulo : T.verificadaTitulo}
            text={review ? T.revisionTexto : T.verificadaTexto}
            action={action}
        />
    );
}
