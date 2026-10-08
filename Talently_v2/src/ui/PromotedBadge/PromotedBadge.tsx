import type { ComponentPropsWithRef } from 'react';
import { cx } from '../cx';
import { IconBoost } from '../icons';

/** Sin props propias: la etiqueta es siempre «Destacado». */
export type PromotedBadgeProps = Omit<ComponentPropsWithRef<'span'>, 'children'>;

/**
 * «Destacado»: la etiqueta de todo lo pagado (publicación Premium, perfil
 * impulsado). Neutra, con borde y la flecha que sube; no se toca. Nunca se
 * parece ni va pegada a VerificationBadge: en la tarjeta va arriba a la
 * derecha. Antes de F3 no aparece: lo que aún no se puede comprar lleva el
 * Badge neutral «Pronto» (`<Badge status="Pronto" />`).
 */
export function PromotedBadge({ className, ...rest }: PromotedBadgeProps) {
    return (
        <span className={cx('tl-promoted', className)} {...rest}>
            <IconBoost />
            Destacado
        </span>
    );
}
