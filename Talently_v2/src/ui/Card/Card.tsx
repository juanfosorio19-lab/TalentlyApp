import type { ComponentPropsWithRef, MouseEventHandler } from 'react';
import { cx } from '../cx';

/** Informativa: `div.tl-card`, no se toca. */
export type CardInfoProps = Omit<ComponentPropsWithRef<'div'>, 'onClick'> & { onClick?: undefined };

/** Tocable: `button.tl-card.tl-card--action`; abre un detalle u otra pantalla. */
export type CardActionProps = Omit<ComponentPropsWithRef<'button'>, 'onClick'> & {
    /** En la app, navegar al detalle (`navigate(...)`). */
    onClick: MouseEventHandler<HTMLButtonElement>;
};

export type CardProps = CardInfoProps | CardActionProps;

/**
 * El contenedor base: `color-surface`, borde 1 px `color-border`, `radius-lg`,
 * padding 16 y sin sombra (elev-0). Así van las tarjetas en listas.
 * Con `onClick` es tocable (`tl-card--action`): presionado `color-text` al
 * 8 % y foco con contorno + halo. No se selecciona (eso es OptionCard), no se
 * deshabilita (sin acción, es informativa) y mientras carga se muestra el
 * Skeleton de tarjeta. Para publicaciones, PublicationCard.
 */
export function Card(props: CardProps) {
    if (props.onClick === undefined) {
        const { className, ...rest } = props;
        return <div className={cx('tl-card', className)} {...rest} />;
    }
    const { className, type = 'button', ...rest } = props;
    return <button type={type} className={cx('tl-card tl-card--action', className)} {...rest} />;
}
