import type { ComponentPropsWithRef, MouseEventHandler, ReactNode } from 'react';
import { cx } from '../cx';
import { IconAlert, IconClock, IconInfo, IconShield, type IconComponent } from '../icons';

/**
 * `unverified` neutral con IconInfo · `review` info con IconClock ·
 * `verified` success con IconShield (el único que usa el escudo) ·
 * `expired` danger con IconAlert.
 */
export type VerificationStatus = 'unverified' | 'review' | 'verified' | 'expired';

const ICON_BY_STATUS: Record<VerificationStatus, IconComponent> = {
    unverified: IconInfo,
    review: IconClock,
    verified: IconShield,
    expired: IconAlert,
};

export interface VerificationBadgeProps
    extends Omit<ComponentPropsWithRef<'button'>, 'children' | 'disabled' | 'onClick'> {
    /** Solo `verified` con verificación real: nunca «Verificado» sin respaldo. */
    status: VerificationStatus;
    /**
     * Qué se verificó y en qué estado: «Identidad verificada», «Teléfono
     * verificado», «Organización verificada», «Identidad en revisión»,
     * «Identidad sin verificar», «Verificación vencida», «SEC gas clase 3».
     */
    children: ReactNode;
    /** Obligatorio: abre la hoja «Verificación de …» con qué se verificó y cuándo. */
    onClick: MouseEventHandler<HTMLButtonElement>;
}

/**
 * Insignia de confianza: dice qué verificó Talently. Se toca (`onClick`) y
 * abre una hoja con qué se verificó y cuándo, sin RUT, fecha de nacimiento ni
 * fotos de la cédula. Siempre se puede tocar: no tiene estado deshabilitado.
 * Va junto al nombre, nunca pegada a PromotedBadge «Destacado».
 */
export function VerificationBadge({ status, children, type = 'button', className, ...rest }: VerificationBadgeProps) {
    const Icon = ICON_BY_STATUS[status];
    return (
        <button
            type={type}
            className={cx('tl-verify', status !== 'unverified' && `tl-verify--${status}`, className)}
            aria-haspopup="dialog"
            {...rest}
        >
            <Icon size={16} />
            {children}
        </button>
    );
}
