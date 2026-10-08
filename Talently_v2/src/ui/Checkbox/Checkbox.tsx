import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../cx';
import { IconAlert, IconCheck } from '../icons';
import { ChoiceGroup, type ChoiceGroupProps } from '../Radio/ChoiceGroup';

export interface CheckboxProps extends Omit<ComponentPropsWithRef<'input'>, 'type' | 'children'> {
    /** Puede llevar enlaces `LinkText` («Acepto los Términos…»): abren el texto sin marcar la casilla. */
    label: ReactNode;
    /** Línea de apoyo; si está deshabilitada, explica por qué. */
    description?: ReactNode;
    /**
     * Error de una casilla suelta, con ícono alerta al pie («Para continuar,
     * acepta los Términos y la Política de privacidad»). En un grupo, el error
     * lo lleva el grupo (CheckboxGroup o ChoiceGroup).
     */
    error?: ReactNode;
}

/**
 * Casilla de 20 px dentro de una fila `label.tl-choice` tocable de 48. Las
 * props nativas (`checked`, `onChange`, `disabled`, `name`, `ref`…) van al
 * `input[type=checkbox]`; `className` va a la fila.
 */
export function Checkbox({ label, description, error, disabled, className, ...rest }: CheckboxProps) {
    const errorId = useId();
    const row = (
        <label
            className={cx(
                'tl-choice',
                // El texto deshabilitado solo tiene selector de clase en bundle.css.
                disabled && 'is-disabled',
                error ? 'is-error' : undefined,
                className,
            )}
        >
            <span className="tl-checkbox">
                <input
                    type="checkbox"
                    disabled={disabled}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    {...rest}
                />
                <span className="tl-checkbox__box">
                    <IconCheck size={16} />
                </span>
            </span>
            <span className="tl-choice__text">
                {label}
                {description && <span className="tl-choice__desc">{description}</span>}
            </span>
        </label>
    );
    if (!error) return row;
    // `.tl-field__error` solo se muestra dentro de `.tl-group.is-error` (o de `.tl-field.is-error`).
    return (
        <div className="tl-group is-error">
            {row}
            <div className="tl-field__foot">
                <span className="tl-field__error" id={errorId}>
                    <IconAlert size={16} />
                    <span>{error}</span>
                </span>
            </div>
        </div>
    );
}

export interface CheckboxOption<T extends string = string> {
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
export interface CheckboxGroupProps<T extends string = string>
    extends Omit<ChoiceGroupProps, 'children' | 'legend' | 'radio' | 'error' | 'onChange'> {
    /** Etiqueta del grupo («Jornada»). */
    legend: ReactNode;
    options: readonly CheckboxOption<T>[];
    /** Valores marcados, en el orden de `options`. */
    value: readonly T[];
    onChange: (next: T[]) => void;
    /**
     * Mensaje del grupo («Elige al menos una jornada»). Cada casilla lleva
     * `aria-invalid` y `aria-describedby` hacia él.
     */
    error?: ReactNode;
    disabled?: boolean;
}

/** Elección múltiple: `fieldset.tl-group` con una casilla por opción. Controlado. */
export function CheckboxGroup<T extends string = string>({
    legend,
    legendHidden,
    options,
    value,
    onChange,
    error,
    disabled,
    errorId: errorIdProp,
    className,
    ...rest
}: CheckboxGroupProps<T>) {
    const autoErrorId = useId();
    const errorId = errorIdProp ?? autoErrorId;
    const toggle = (v: T, on: boolean) =>
        onChange(options.map((o) => o.value).filter((x) => (x === v ? on : value.includes(x))));
    return (
        <ChoiceGroup
            {...rest}
            legend={legend}
            legendHidden={legendHidden}
            error={error}
            errorId={errorId}
            className={className}
        >
            {options.map((o) => (
                <Checkbox
                    key={o.value}
                    value={o.value}
                    label={o.label}
                    description={o.description}
                    checked={value.includes(o.value)}
                    onChange={(e) => toggle(o.value, e.target.checked)}
                    disabled={disabled || o.disabled}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className={o.className}
                />
            ))}
        </ChoiceGroup>
    );
}
