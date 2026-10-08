import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../cx';

export interface CtaBarProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
    /**
     * Un Button primary lg `block` («Continuar», «Ver mis postulaciones») y,
     * si hace falta, uno ghost `block` debajo («Omitir», «Seguir explorando»).
     * Si guardar falla, el Snackbar estático va aquí, encima del botón.
     */
    children: ReactNode;
    /** Hay contenido pasando por debajo: gana `color-surface` y `elev-2` (`is-scrolled`). */
    scrolled?: boolean;
}

/**
 * CTA fijo inferior (`.tl-ctabar`) de StepLayout y ResultScreen. Queda pegado
 * abajo y es, junto a la TabBar, lo único que compensa la barra de gestos.
 */
export function CtaBar({ children, scrolled, className, ...rest }: CtaBarProps) {
    return (
        <div className={cx('tl-ctabar', scrolled && 'is-scrolled', className)} {...rest}>
            {children}
        </div>
    );
}
