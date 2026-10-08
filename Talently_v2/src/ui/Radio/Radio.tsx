import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../cx';
import { ChoiceGroup, type ChoiceGroupProps } from './ChoiceGroup';

export interface RadioProps extends Omit<ComponentPropsWithRef<'input'>, 'type' | 'children'> {
    /** Texto literal del diccionario («Inmediata», «En 15 días»). */
    label: ReactNode;
    description?: ReactNode;
    /**
     * `row`: fila de lista de 56 con divisor y el radio a la derecha
     * (`tl-choice--row`, la usa SheetPicker). Por defecto, radio a la izquierda.
     */
    variant?: 'default' | 'row';
}

/**
 * Botón de opción de 20 px dentro de una fila `label.tl-choice` tocable de 48.
 * Las props nativas (`name`, `value`, `checked`, `onChange`, `disabled`, `ref`…)
 * van al `input[type=radio]`; `className` va a la fila. Va siempre en un grupo
 * (RadioGroup o ChoiceGroup con `radio`).
 */
export function Radio({ label, description, variant = 'default', disabled, className, ...rest }: RadioProps) {
    const control = (
        <span className="tl-radio">
            <input type="radio" disabled={disabled} {...rest} />
            <span className="tl-radio__box" />
        </span>
    );
    const text = (
        <span className="tl-choice__text">
            {label}
            {description && <span className="tl-choice__desc">{description}</span>}
        </span>
    );
    return (
        <label
            className={cx(
                'tl-choice',
                variant === 'row' && 'tl-choice--row',
                // El texto deshabilitado solo tiene selector de clase en bundle.css.
                disabled && 'is-disabled',
                className,
            )}
        >
            {variant === 'row' ? (
                <>
                    {text}
                    {control}
                </>
            ) : (
                <>
                    {control}
                    {text}
                </>
            )}
        </label>
    );
}

export interface RadioOption<T extends string = string> {
    value: T;
    label: ReactNode;
    description?: ReactNode;
    disabled?: boolean;
    /** Solo para el catálogo (`is-pressed`, `is-focus`). */
    className?: string;
}

/**
 * Las props nativas del `fieldset` (`ref`, `id`, `aria-*`, `data-*`…) van a
 * la raíz, por ejemplo para enfocar o llevar a la vista el grupo con error.
 */
export interface RadioGroupProps<T extends string = string>
    extends Omit<ChoiceGroupProps, 'children' | 'legend' | 'radio' | 'error' | 'onChange'> {
    /** Etiqueta del grupo («Disponible desde»). */
    legend: ReactNode;
    options: readonly RadioOption<T>[];
    /** Opción elegida; `null` si aún no hay. */
    value: T | null;
    onChange: (next: T) => void;
    /** Mensaje del grupo («Elige cuándo puedes empezar»). */
    error?: ReactNode;
    /** Todo el grupo deshabilitado. */
    disabled?: boolean;
    variant?: RadioProps['variant'];
    /** Nombre del grupo de inputs (no del `fieldset`); por defecto uno único. */
    name?: string;
}

/** Lista corta de elección única: `fieldset.tl-group[role=radiogroup]` con un Radio por opción. Controlado. */
export function RadioGroup<T extends string = string>({
    legend,
    legendHidden,
    options,
    value,
    onChange,
    error,
    disabled,
    variant,
    name,
    className,
    ...rest
}: RadioGroupProps<T>) {
    const autoName = useId();
    const groupName = name ?? autoName;
    return (
        <ChoiceGroup {...rest} legend={legend} legendHidden={legendHidden} radio error={error} className={className}>
            {options.map((o) => (
                <Radio
                    key={o.value}
                    name={groupName}
                    value={o.value}
                    label={o.label}
                    description={o.description}
                    variant={variant}
                    checked={value === o.value}
                    onChange={() => onChange(o.value)}
                    disabled={disabled || o.disabled}
                    className={cx(error ? 'is-error' : undefined, o.className)}
                />
            ))}
        </ChoiceGroup>
    );
}
