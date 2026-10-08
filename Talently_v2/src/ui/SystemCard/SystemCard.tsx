import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Amount } from '../Amount';
import { Badge, type BadgeStatus } from '../Badge';
import { Button } from '../Button';
import { cx } from '../cx';
import {
    IconAlert,
    IconCalendar,
    IconClock,
    IconDocument,
    IconEye,
    IconInfo,
    IconLocation,
    IconLock,
    IconMoney,
    IconTool,
    type IconComponent,
} from '../icons';

export interface SystemCardLine {
    /**
     * Ícono de 16 del dato (fecha y hora IconClock, lugar IconLocation,
     * vigencia IconLock…). Sin ícono, la línea lleva solo su contenido: el
     * VerificationBadge de un documento que Talently verificó.
     */
    icon?: IconComponent;
    text: ReactNode;
    /** Dato que pide atención, en `color-warning-text` 600: «Emitido hace 45 días», «Venció el dom 20 jun». */
    warning?: boolean;
}

export interface SystemCardProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'title' | 'role'> {
    /** Ícono de 40 en el tile `color-primary-subtle` (entrevista IconCalendar, documento IconDocument, cotización IconMoney). */
    icon: IconComponent;
    /** Qué hecho es («Entrevista», «Certificado de antecedentes», «Cotización»). También nombra el grupo. */
    title: string;
    /** Total en Amount lg, sin unidad (cotización, M10). */
    amount?: number;
    /** Junto al total: «Total, con materiales». */
    amountNote?: string;
    /** Líneas de datos con ícono de 16, en orden. */
    lines?: SystemCardLine[];
    /** Buttons sm («Agregar al calendario», «Rechazar» outline + «Aceptar» primary). */
    actions?: ReactNode;
    /** Ya resuelto: el Badge del diccionario («Confirmado», «Aceptado») reemplaza a las acciones. */
    status?: BadgeStatus;
    /**
     * Ya no disponible (`tl-syscard--off`): vencido, revocado o cortado por
     * bloqueo o eliminación de la cuenta. `color-surface-2` y
     * `color-text-disabled`, una sola línea «Ya no está disponible» y sin
     * acciones; nunca baja la opacidad.
     */
    off?: boolean;
    /** Texto de la tarjeta apagada. */
    offLabel?: string;
}

/**
 * Tarjeta de sistema dentro del chat: un hecho de la plataforma (entrevista
 * agendada, documento compartido, cotización), de ancho completo y nunca una
 * burbuja. Las variantes del sistema de diseño ya armadas son InterviewCard,
 * CertificateCard y QuoteCard; esta es la base que las tres usan.
 */
export function SystemCard({
    icon: Icon,
    title,
    amount,
    amountNote,
    lines = [],
    actions,
    status,
    off,
    offLabel = 'Ya no está disponible',
    className,
    ...rest
}: SystemCardProps) {
    const shown: SystemCardLine[] = off ? [{ icon: IconInfo, text: offLabel }] : lines;
    const end = off ? null : status ? <Badge status={status} /> : actions;
    return (
        <div
            className={cx('tl-syscard', off && 'tl-syscard--off', className)}
            role="group"
            aria-label={title}
            {...rest}
        >
            <span className="tl-syscard__tile">
                <Icon />
            </span>
            <div className="tl-syscard__body">
                <span className="tl-syscard__title">{title}</span>
                {!off && amount !== undefined && (
                    <span className="tl-syscard__amount">
                        <Amount value={amount} size="lg" />
                        {amountNote && <span className="tl-syscard__note">{amountNote}</span>}
                    </span>
                )}
                {shown.map(({ icon: LineIcon, text, warning }, i) => (
                    <span key={i} className={cx('tl-syscard__meta', warning && 'tl-syscard__meta--warning')}>
                        {LineIcon ? (
                            <>
                                <LineIcon size={16} />
                                <span>{text}</span>
                            </>
                        ) : (
                            text
                        )}
                    </span>
                ))}
                {end && <div className="tl-syscard__actions">{end}</div>}
            </div>
        </div>
    );
}

type PresetRootProps = Omit<ComponentPropsWithRef<'div'>, 'children' | 'title' | 'role'>;

export interface InterviewCardProps extends PresetRootProps {
    /** Día y hora en el formato único: «mar 15 dic · 10:00». */
    when: string;
    /** Dirección: «Av. Concha y Toro 1234, Puente Alto». */
    place: string;
    /** «Agregar al calendario». */
    onAddToCalendar?: () => void;
    /** Ya resuelta: el Badge («Confirmada») reemplaza a la acción. */
    status?: BadgeStatus;
}

/**
 * Entrevista agendada (M5): la misma tarjeta en la conversación (MSG-02) y
 * en el proceso de la postulación (PRC-01), con «Agregar al calendario».
 */
export function InterviewCard({ when, place, onAddToCalendar, status, ...rest }: InterviewCardProps) {
    return (
        <SystemCard
            icon={IconCalendar}
            title="Entrevista"
            lines={[
                { icon: IconClock, text: when },
                { icon: IconLocation, text: place },
            ]}
            status={status}
            actions={
                onAddToCalendar && (
                    <Button variant="tonal" size="sm" onClick={onAddToCalendar}>
                        Agregar al calendario
                    </Button>
                )
            }
            {...rest}
        />
    );
}

/** `other`: lo ve la otra parte («Ver») · `owner`: lo ve quien lo compartió («Visto por…», «Dejar de compartir»). */
export type CertificateViewer = 'other' | 'owner';

export interface CertificateCardProps extends PresetRootProps {
    viewer: CertificateViewer;
    /** Fecha de emisión: «30-11-2026». */
    issuedOn: string;
    /** Días desde la emisión: con más de 30, la línea pasa a warning («Emitido hace 45 días»). */
    issuedDaysAgo: number;
    /** Hasta cuándo se puede ver (7 días): «jue 17 dic». */
    availableUntil: string;
    /**
     * Si Talently lo verificó, el VerificationBadge verificado en lugar de la
     * línea «sin verificar». Nunca «Verificado» sin verificación real.
     */
    verification?: ReactNode;
    /** Solo `owner`: quién lo vio y cuándo («Familia en Ñuñoa · hace 2 h»). */
    seenBy?: string;
    /** `other`: abre el documento. */
    onView?: () => void;
    /** `owner`: deja de compartirlo (la tarjeta pasa a «Ya no está disponible»). */
    onStopSharing?: () => void;
    /** Vencido a los 7 días, revocado o cortado por bloqueo o eliminación de la cuenta. */
    off?: boolean;
}

/**
 * Certificado de antecedentes compartido en el chat (MSG-02b, M5): quién lo
 * compartió, cuándo se emitió, qué es, hasta cuándo se ve y quién lo vio.
 * Nunca es una burbuja de archivo ni una insignia.
 */
export function CertificateCard({
    viewer,
    issuedOn,
    issuedDaysAgo,
    availableUntil,
    verification,
    seenBy,
    onView,
    onStopSharing,
    off,
    ...rest
}: CertificateCardProps) {
    const old = issuedDaysAgo > 30;
    const owner = viewer === 'owner';
    const lines: SystemCardLine[] = [
        old
            ? { icon: IconAlert, text: `Emitido hace ${issuedDaysAgo} días`, warning: true }
            : { icon: IconCalendar, text: `Emitido el ${issuedOn}` },
    ];
    lines.push(
        verification
            ? { text: verification }
            : { icon: IconInfo, text: owner ? 'Subido por ti, sin verificar' : 'Documento subido por la persona, sin verificar' },
    );
    lines.push({ icon: IconLock, text: `Disponible hasta el ${availableUntil}` });
    if (owner && seenBy) lines.push({ icon: IconEye, text: `Visto por ${seenBy}` });

    const action = owner
        ? onStopSharing && (
              <Button variant="ghost" size="sm" onClick={onStopSharing}>
                  Dejar de compartir
              </Button>
          )
        : onView && (
              <Button variant="tonal" size="sm" onClick={onView}>
                  Ver
              </Button>
          );

    return (
        <SystemCard
            icon={IconDocument}
            title="Certificado de antecedentes"
            lines={lines}
            actions={action}
            off={off}
            {...rest}
        />
    );
}

/** `open`: «Rechazar» / «Aceptar» · `accepted`: Badge «Aceptado» · `expired`: vigencia en warning y «Pedir nueva cotización». */
export type QuoteState = 'open' | 'accepted' | 'expired';

/** Botón de la cotización que espera respuesta. */
export type QuoteAction = 'reject' | 'accept' | 'request';

export interface QuoteCardProps extends PresetRootProps {
    state: QuoteState;
    /** Total en CLP. */
    total: number;
    /** «Total, con materiales» o «Total, sin materiales». */
    withMaterials: boolean;
    /** Qué incluye: «Cambio de llave de paso y flexible». */
    includes: string;
    /** Día y hora de la visita: «jue 17 jun · 10:00». */
    when: string;
    /** Hasta cuándo vale: «dom 20 jun». Vencida: «Venció el dom 20 jun» en warning. */
    validUntil: string;
    onReject?: () => void;
    /** Abre el pago. */
    onAccept?: () => void;
    /** Vencida: «Pedir nueva cotización». */
    onRequestNew?: () => void;
    /** El botón que espera: su estado cargando; los demás no se tocan mientras tanto. */
    loading?: QuoteAction;
}

/**
 * Cotización dentro del chat (M10, SRV-02): total en Amount lg, qué incluye,
 * día y hora, y hasta cuándo vale. Vencida no se apaga: el monto sigue
 * siendo información útil.
 */
export function QuoteCard({
    state,
    total,
    withMaterials,
    includes,
    when,
    validUntil,
    onReject,
    onAccept,
    onRequestNew,
    loading,
    ...rest
}: QuoteCardProps) {
    const expired = state === 'expired';
    const busy = loading !== undefined;
    let actions: ReactNode;
    if (expired) {
        actions = onRequestNew && (
            <Button variant="tonal" size="sm" onClick={onRequestNew} loading={loading === 'request'} loadingLabel="Pidiendo…">
                Pedir nueva cotización
            </Button>
        );
    } else if (state === 'open') {
        actions = (
            <>
                {onReject && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onReject}
                        loading={loading === 'reject'}
                        loadingLabel="Rechazando…"
                        disabled={busy && loading !== 'reject'}
                    >
                        Rechazar
                    </Button>
                )}
                {onAccept && (
                    <Button
                        size="sm"
                        onClick={onAccept}
                        loading={loading === 'accept'}
                        loadingLabel="Abriendo el pago…"
                        disabled={busy && loading !== 'accept'}
                    >
                        Aceptar
                    </Button>
                )}
            </>
        );
    }
    return (
        <SystemCard
            icon={IconMoney}
            title="Cotización"
            amount={total}
            amountNote={withMaterials ? 'Total, con materiales' : 'Total, sin materiales'}
            lines={[
                { icon: IconTool, text: includes },
                { icon: IconCalendar, text: when },
                expired
                    ? { icon: IconAlert, text: `Venció el ${validUntil}`, warning: true }
                    : { icon: IconClock, text: `Válida hasta el ${validUntil}` },
            ]}
            status={state === 'accepted' ? 'Aceptado' : undefined}
            actions={actions}
            {...rest}
        />
    );
}
