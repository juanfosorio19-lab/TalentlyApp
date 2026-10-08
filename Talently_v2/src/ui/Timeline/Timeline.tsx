import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Badge, type BadgeStatus } from '../Badge';
import { cx } from '../cx';
import { IconAlert, IconCheck, IconClock, type IconComponent } from '../icons';

/**
 * done: hecho (punto `color-success` con check) · current: actual (anillo
 * `color-primary-text`, `aria-current="step"`) · pending: pendiente (anillo
 * `color-text-3`) · review y error: solo en niveles de verificación (en
 * revisión con reloj; rechazada con alerta y el motivo). Un cierre negativo
 * en un proceso no usa `error`: es el último paso con su `badge`.
 */
export type TimelineStepStatus = 'done' | 'current' | 'pending' | 'review' | 'error';

export interface TimelineStep {
    /** Clave estable si dos pasos se llaman igual. */
    id?: string;
    status: TimelineStepStatus;
    /** Etiqueta literal del diccionario: Postulado, Visto, En proceso, Entrevista, Oferta, Contratado… */
    label: string;
    /**
     * Fecha en el formato único («7 dic · 21:14», «hoy · 11:30»; la entrevista,
     * su fecha agendada). Los pendientes van sin fecha. En niveles, el estado
     * del nivel («Verificado el 14 mar 2025», «Pendiente», «En revisión · …»).
     */
    date?: string;
    /** Niveles: qué permite el nivel («Tomar turnos y publicar.»). */
    description?: ReactNode;
    /** Rechazada: el motivo, que se muestra como «Motivo: …». */
    reason?: string;
    /** Niveles: su acción real si falta («Verificar identidad», «Intentar de nuevo»), un Button sm. */
    action?: ReactNode;
    /**
     * Cierre negativo de un proceso («No seleccionado», «Cancelado por la
     * organización»): va en el último paso, bajo su fecha, con el Badge del
     * diccionario y su tono fijo. Los pasos que ya no van a pasar se quitan.
     */
    badge?: BadgeStatus;
}

export interface TimelineProps extends Omit<ComponentPropsWithRef<'ol'>, 'children'> {
    steps: TimelineStep[];
    /** levels: escalera de verificación de VER-01 (M8), con qué permite cada nivel y su acción. */
    variant?: 'default' | 'levels';
}

const DOT_ICON: Partial<Record<TimelineStepStatus, IconComponent>> = { done: IconCheck, review: IconClock, error: IconAlert };

/** Estado para el lector de pantalla cuando solo se ve por color e ícono (la fecha no lo dice). */
const HIDDEN_STATUS: Partial<Record<TimelineStepStatus, string>> = {
    done: ', hecho',
    pending: ', pendiente',
};

/**
 * Pasos de un proceso en vertical: punto, línea, etiqueta y fecha en
 * Caption. PRC-01 (postulación), TUR-01, SRV-02 y RES-03; con `levels`, los
 * niveles de verificación de VER-01. No se toca.
 */
export function Timeline({ steps, variant = 'default', className, ...rest }: TimelineProps) {
    const levels = variant === 'levels';
    return (
        <ol className={cx('tl-timeline', levels && 'tl-timeline--levels', className)} {...rest}>
            {steps.map((step, i) => {
                const DotIcon = DOT_ICON[step.status];
                const hidden = levels ? undefined : HIDDEN_STATUS[step.status];
                return (
                    <li
                        key={step.id ?? i}
                        className={cx('tl-tstep', `tl-tstep--${step.status}`)}
                        aria-current={step.status === 'current' ? 'step' : undefined}
                    >
                        <span className="tl-tstep__dot">{DotIcon && <DotIcon size={16} />}</span>
                        <span className="tl-tstep__label">
                            {step.label}
                            {hidden && <span className="tl-vh">{hidden}</span>}
                        </span>
                        {step.date && <span className="tl-tstep__date">{step.date}</span>}
                        {step.reason ? (
                            <p className="tl-tstep__desc">
                                <b>Motivo:</b> {step.reason}
                            </p>
                        ) : (
                            step.description && <p className="tl-tstep__desc">{step.description}</p>
                        )}
                        {step.badge && (
                            <p className="tl-tstep__desc">
                                <Badge status={step.badge} />
                            </p>
                        )}
                        {step.action && <div className="tl-tstep__action">{step.action}</div>}
                    </li>
                );
            })}
        </ol>
    );
}
