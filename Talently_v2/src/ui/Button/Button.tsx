import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../cx';
import type { IconComponent } from '../icons';

export type ButtonVariant = 'primary' | 'tonal' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'lg' | 'md' | 'sm';

export interface ButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
    /** Etiqueta en infinitivo: «Continuar», «Postular», «Tomar turno». */
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    /** Ancho completo. */
    block?: boolean;
    /** Ícono antes de la etiqueta (20 px en lg/md, 16 en sm). */
    icon?: IconComponent;
    /** Ícono después de la etiqueta. */
    iconEnd?: IconComponent;
    /**
     * Logo oficial de un servicio externo («Continuar con Google»), solo en
     * outline lg block, tal como lo entrega el servicio. `true` = recuadro
     * rotulado de los mockups mientras no esté el logo oficial.
     */
    logo?: ReactNode;
    /** Spinner centrado, mismo ancho, sin texto; bloquea el toque. */
    loading?: boolean;
    /** Texto para lectores de pantalla mientras carga («Guardando…»). */
    loadingLabel?: string;
}

/**
 * El único botón de Talently. Una sola acción principal (primary) por pantalla;
 * danger siempre abre un Dialog antes de destruir.
 */
export function Button({
    children,
    variant = 'primary',
    size = 'md',
    block,
    icon: Icon,
    iconEnd: IconEnd,
    logo,
    loading,
    loadingLabel,
    type = 'button',
    className,
    onClick,
    ...rest
}: ButtonProps) {
    return (
        <button
            type={type}
            className={cx(
                'tl-btn',
                `tl-btn--${variant}`,
                size !== 'md' && `tl-btn--${size}`,
                block && 'tl-btn--block',
                loading && 'is-loading',
                className,
            )}
            aria-busy={loading || undefined}
            // Mientras carga, la etiqueta queda oculta (visibility: hidden en bundle.css):
            // el nombre accesible pasa a decir qué está pasando («Enviando postulación…»).
            aria-label={loading && loadingLabel ? loadingLabel : undefined}
            // is-loading solo bloquea el puntero: Enter y Espacio tampoco deben repetir la acción.
            onClick={loading ? undefined : onClick}
            {...rest}
        >
            {logo === true ? (
                <span className="tl-btn__logo tl-btn__logo--ph" aria-hidden="true" />
            ) : (
                logo && <span className="tl-btn__logo" aria-hidden="true">{logo}</span>
            )}
            {Icon && <Icon />}
            <span className="tl-btn__label">{children}</span>
            {IconEnd && <IconEnd />}
            {loading && (
                <span className={cx('tl-btn__spinner tl-spinner', size === 'sm' && 'tl-spinner--16')} aria-hidden="true" />
            )}
        </button>
    );
}

export interface LinkTextProps extends ComponentPropsWithRef<'a'> {
    children: ReactNode;
}

/** Enlace dentro de un texto («Términos», «Política de privacidad»). */
export function LinkText({ className, ...rest }: LinkTextProps) {
    return <a className={cx('tl-link', className)} {...rest} />;
}

/** Separador «o» entre el ingreso con otro servicio y el formulario. */
export function Divider({ children = 'o' }: { children?: ReactNode }) {
    return <p className="tl-divider">{children}</p>;
}
