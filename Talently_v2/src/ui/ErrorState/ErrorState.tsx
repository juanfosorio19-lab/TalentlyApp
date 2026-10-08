import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Button, type ButtonProps } from '../Button';
import { cx } from '../cx';
import { IconAlert } from '../icons';

export interface ErrorStateProps extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'children'> {
    /** Qué falló, con palabras humanas: «No pudimos cargar los turnos». Nunca un error técnico ni un código. */
    title: ReactNode;
    /** Qué hacer. */
    text?: ReactNode;
    /** Vuelve a pedir los datos. Una pantalla que no cargó siempre ofrece «Reintentar». */
    onRetry: () => void;
    /** Mientras reintenta, «Reintentar» muestra su spinner; si vuelve a fallar, el texto no cambia. */
    retrying?: boolean;
    /** Props extra del botón (`ref`, o `className` para forzar estados en el catálogo). */
    retryProps?: Omit<ButtonProps, 'children' | 'variant' | 'onClick' | 'loading' | 'loadingLabel'>;
}

/**
 * La pantalla no pudo cargar y no hay nada guardado. Si hay datos guardados no
 * se usa: se muestran con el Banner info «Sin conexión. Mostramos lo último que
 * cargaste».
 */
export function ErrorState({
    title,
    text = 'Revisa tu conexión e intenta de nuevo.',
    onRetry,
    retrying,
    retryProps,
    className,
    ...rest
}: ErrorStateProps) {
    return (
        <div className={cx('tl-empty tl-empty--error', className)} {...rest}>
            <div className="tl-empty__icon">
                <IconAlert />
            </div>
            <h3 className="tl-empty__title h3">{title}</h3>
            <p className="tl-empty__text">{text}</p>
            {/*
              Mientras reintenta: bundle.css oculta con visibility:hidden todo lo que va dentro del
              botón cargando (también el .tl-vh de loadingLabel), así que el nombre va en aria-label;
              e is-loading solo bloquea el puntero, así que se quita onClick para que Enter o
              Espacio no repitan la petición.
            */}
            <Button
                {...retryProps}
                aria-label={retrying ? 'Reintentando…' : retryProps?.['aria-label']}
                onClick={retrying ? undefined : onRetry}
                loading={retrying}
                loadingLabel="Reintentando…"
            >
                Reintentar
            </Button>
        </div>
    );
}
