import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../cx';
import { BADGE_TONE_BY_STATUS, type BadgeStatus, type BadgeTone } from './badgeTones';

type BadgeRootProps = Omit<ComponentPropsWithRef<'span'>, 'children'>;

export type BadgeProps = BadgeRootProps &
    (
        | {
              /** Estado del diccionario: pone la etiqueta y su tono fijo («Postulado» → info). */
              status: BadgeStatus;
              tone?: never;
              children?: never;
          }
        | {
              status?: never;
              /**
               * Solo para etiquetas con un dato variable, que no caben en el
               * diccionario: «Quedan 2 de 8 cupos» y «Vence en 45 min» en
               * warning, «Reservas desde marzo» en info. Por defecto, neutral.
               */
              tone?: BadgeTone;
              children: ReactNode;
          }
    );

/**
 * Etiqueta de estado: pill de 24, 12/600, fondo `-subtle` y texto `-text`
 * del tono. No es interactiva y la palabra siempre está (el estado nunca
 * depende solo del color).
 */
export function Badge({ status, tone, children, className, ...rest }: BadgeProps) {
    const t: BadgeTone = status ? BADGE_TONE_BY_STATUS[status] : (tone ?? 'neutral');
    return (
        <span className={cx('tl-badge', t !== 'neutral' && `tl-badge--${t}`, className)} {...rest}>
            {status ?? children}
        </span>
    );
}
