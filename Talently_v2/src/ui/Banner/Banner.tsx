import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Button, type ButtonProps } from '../Button/Button';
import { cx } from '../cx';
import { IconAlert, IconInfo } from '../icons';

export type BannerTone = 'info' | 'success' | 'warning' | 'danger';

export interface BannerAction extends Pick<ButtonProps, 'loading' | 'loadingLabel' | 'className'> {
    /** «Reintentar», «Subir», «Verificar». Si la acción no aplica, el Banner no la muestra. */
    label: string;
    onAction: () => void;
}

export interface BannerProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'role'> {
    /** Texto en Body 14: «Sin conexión. Mostramos lo último que cargaste.». */
    children: ReactNode;
    tone?: BannerTone;
    /** Button ghost sm a la derecha. */
    action?: BannerAction;
    /** Aviso fijo bajo el AppBar, de borde a borde y sin radio. */
    fixed?: boolean;
    /**
     * Contador a la derecha («09:42», RES-02 en F3). No se anuncia cada
     * segundo: el lector lo lee al llegar a él, con `timerLabel`.
     */
    timer?: string;
    /** «Quedan 9 minutos y 42 segundos». */
    timerLabel?: string;
}

// Decisiones M1 · L5 punto 3: IconInfo en info y éxito, IconAlert en warning y danger.
const TONE_ICON = { info: IconInfo, success: IconInfo, warning: IconAlert, danger: IconAlert } as const;

/**
 * El único componente para todo aviso que se queda en pantalla. No se cierra
 * solo: desaparece cuando la situación cambia. Lo temporal es un Snackbar.
 */
export function Banner({ children, tone = 'info', action, fixed, timer, timerLabel, className, ...rest }: BannerProps) {
    const Icon = TONE_ICON[tone];
    return (
        <div
            className={cx('tl-banner', tone !== 'info' && `tl-banner--${tone}`, fixed && 'tl-banner--fixed', className)}
            role={tone === 'danger' ? 'alert' : 'status'}
            {...rest}
        >
            <span className="tl-banner__icon">
                <Icon size={20} />
            </span>
            <span className="tl-banner__text">{children}</span>
            {timer && (
                <span className="tl-banner__timer" role="timer" aria-label={timerLabel}>
                    {timer}
                </span>
            )}
            {action && (
                <Button
                    variant="ghost"
                    size="sm"
                    className={action.className}
                    loading={action.loading}
                    loadingLabel={action.loadingLabel}
                    onClick={action.onAction}
                >
                    {action.label}
                </Button>
            )}
        </div>
    );
}
