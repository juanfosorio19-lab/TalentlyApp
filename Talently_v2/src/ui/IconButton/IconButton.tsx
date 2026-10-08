import type { ComponentPropsWithRef } from 'react';
import { cx } from '../cx';
import { IconArrowLeft, type IconComponent } from '../icons';

export interface IconButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'children' | 'aria-label'> {
    icon: IconComponent;
    /** Obligatorio y en español: el ícono solo no basta. Si hay contador, lo incluye («Notificaciones, 2 sin leer»). */
    label: string;
    variant?: 'ghost' | 'tonal';
    /** Alternar (Guardar): pone `is-selected` y `aria-pressed`. */
    selected?: boolean;
    /** Spinner de 24 en lugar del ícono. */
    loading?: boolean;
    /** Contador real (no leídas, filtros activos). 0 o sin valor = sin contador; desde 10, «9+». */
    count?: number;
}

/** Botón circular de solo ícono: 40 visual, 48 de área táctil. */
export function IconButton({
    icon: Icon,
    label,
    variant = 'ghost',
    selected,
    loading,
    count,
    type = 'button',
    className,
    ...rest
}: IconButtonProps) {
    return (
        <button
            type={type}
            className={cx(
                'tl-iconbtn',
                variant === 'tonal' && 'tl-iconbtn--tonal',
                selected && 'is-selected',
                loading && 'is-loading',
                className,
            )}
            aria-label={label}
            aria-pressed={selected === undefined ? undefined : selected}
            aria-busy={loading || undefined}
            {...rest}
        >
            <Icon />
            {loading && <span className="tl-spinner" aria-hidden="true" />}
            {count !== undefined && count > 0 && (
                <span className="tl-iconbtn__badge" aria-hidden="true">{count > 9 ? '9+' : count}</span>
            )}
        </button>
    );
}

export type BackButtonProps = Omit<IconButtonProps, 'icon' | 'label' | 'variant' | 'selected' | 'count'> & {
    label?: string;
};

/**
 * El único botón de volver. Va a la izquierda del AppBar standard y vuelve
 * SIEMPRE a la pantalla de origen: quien lo usa pasa `onClick` del
 * BackButtonManager (mismo comportamiento que el atrás de Android).
 */
export function BackButton({ label = 'Volver', className, ...rest }: BackButtonProps) {
    return <IconButton icon={IconArrowLeft} label={label} className={cx('tl-backbtn', className)} {...rest} />;
}
