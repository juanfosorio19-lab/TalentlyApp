import { cx } from '../cx';

export type SpinnerSize = 16 | 24 | 40;

export interface SpinnerProps {
    /** 16: campos, botones sm, SearchField, Switch · 24: botones lg/md, IconButton · 40: subida de foto. */
    size?: SpinnerSize;
    className?: string;
}

/**
 * Indicador de espera DENTRO de un control. Nunca suelto en una pantalla:
 * una lista o tarjeta que carga usa Skeleton. El control que espera lleva
 * `aria-busy` y un texto que dice qué pasa («Guardando…»).
 */
export function Spinner({ size = 24, className }: SpinnerProps) {
    return (
        <span
            className={cx('tl-spinner', size !== 24 && `tl-spinner--${size}`, className)}
            aria-hidden="true"
        />
    );
}
