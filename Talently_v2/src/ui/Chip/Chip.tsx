import type { ComponentPropsWithRef } from 'react';
import { cx } from '../cx';
import { IconAdd, IconCheck, IconChevronDown, IconClose, IconLocation, type IconComponent } from '../icons';

/**
 * - `filter`: filtra o elige; `selected` = `aria-pressed` con check.
 * - `lead`: filter con el ícono de la categoría al inicio, que el check reemplaza al elegir.
 * - `suggestion`: una opción para agregar, con +.
 * - `menu`: un valor que se cambia en una hoja (comuna en EXP-02): ícono, valor y chevron. Solo emite `onClick`.
 * - `input`: un valor ya elegido, con X para quitarlo (`onRemove`).
 */
export type ChipVariant = 'filter' | 'lead' | 'suggestion' | 'menu' | 'input';

export interface ChipProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
    /** El valor, tal como se muestra («Garzón», «Maipú»). */
    children: string;
    variant?: ChipVariant;
    /** filter y lead: elegido (`aria-pressed="true"`). */
    selected?: boolean;
    /** lead: ícono de la categoría (obligatorio). menu: ícono del dato (por defecto IconLocation). */
    icon?: IconComponent;
    /** menu: qué dato muestra, para el nombre accesible «Comuna: Maipú. Cambiar». */
    field?: string;
    /** input: quita el valor. Las demás props (`ref`, `disabled`…) van a la X, que es el botón real. */
    onRemove?: () => void;
    /** input: nombre de la X; por defecto «Quitar <valor>». */
    removeLabel?: string;
}

/**
 * Chip de 36 px, pill, con área táctil de 48 (la X del chip input, 44). Entre
 * chips, `space-2`; con contador o máximo se agrupan con ChipGroup.
 */
export function Chip({
    children,
    variant = 'filter',
    selected,
    icon,
    field,
    onRemove,
    removeLabel,
    disabled,
    type = 'button',
    className,
    ...rest
}: ChipProps) {
    // bundle.css solo apaga los íconos (+, categoría, X) con la clase `is-disabled`.
    const disabledClass = disabled && 'is-disabled';

    if (variant === 'input') {
        return (
            <span className={cx('tl-chip tl-chip--input', disabledClass, className)}>
                {children}
                <button
                    type={type}
                    className="tl-chip__remove"
                    aria-label={removeLabel ?? `Quitar ${children}`}
                    disabled={disabled}
                    onClick={onRemove}
                    {...rest}
                >
                    <IconClose size={20} />
                </button>
            </span>
        );
    }

    if (variant === 'menu') {
        const Icon = icon ?? IconLocation;
        return (
            <button
                type={type}
                className={cx('tl-chip tl-chip--menu', disabledClass, className)}
                aria-haspopup="dialog"
                aria-label={field ? `${field}: ${children}. Cambiar` : undefined}
                disabled={disabled}
                {...rest}
            >
                <Icon size={16} />
                {children}
                <IconChevronDown size={16} />
            </button>
        );
    }

    if (variant === 'suggestion') {
        return (
            <button
                type={type}
                className={cx('tl-chip tl-chip--suggestion', disabledClass, className)}
                disabled={disabled}
                {...rest}
            >
                <IconAdd size={16} />
                {children}
            </button>
        );
    }

    const Lead = variant === 'lead' ? icon : undefined;
    return (
        <button
            type={type}
            className={cx('tl-chip', variant === 'lead' && 'tl-chip--lead', disabledClass, className)}
            aria-pressed={selected ?? false}
            disabled={disabled}
            {...rest}
        >
            <span className="tl-chip__check">
                <IconCheck size={16} />
            </span>
            {Lead && (
                <span className="tl-chip__lead">
                    <Lead size={16} />
                </span>
            )}
            {children}
        </button>
    );
}
