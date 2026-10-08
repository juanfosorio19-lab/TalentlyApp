import { useId, useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../cx';
import { FieldFoot, FieldLabel, describedBy, hasFieldError } from '../TextField';

export interface TextAreaProps extends Omit<ComponentPropsWithRef<'textarea'>, 'children' | 'maxLength'> {
    /** Etiqueta arriba («Cuéntanos de tu experiencia»). */
    label: ReactNode;
    /** Marca la etiqueta con «(opcional)». */
    optional?: boolean;
    /** Ayuda abajo a la izquierda («Mínimo 20 caracteres»). Deshabilitado: explica por qué. */
    help?: ReactNode;
    /** Mensaje humano en lugar de la ayuda («Escribe al menos 20 caracteres»); el contador se mantiene. */
    error?: ReactNode;
    /** Máximo de caracteres: lo muestra el contador y `maxlength` impide seguir escribiendo. */
    maxLength: number;
    /** Ayuda al llegar al máximo. Por defecto «Llegaste al máximo de 300 caracteres». */
    maxHelp?: ReactNode;
}

/**
 * Campo de varias líneas (mínimo 4, sin redimensionar) con contador al pie
 * en cifras simples («0/3000»: el punto de miles es solo para dinero).
 * Al llegar al máximo (`is-max`) el contador pasa a warning: un límite
 * alcanzado nunca es danger. Funciona controlado (`value` + `onChange`
 * nativo) o no controlado (`defaultValue`); el contador cuenta lo escrito.
 * `className` va en la raíz `.tl-field`; el resto de las props, al `textarea`.
 */
export function TextArea({
    label,
    optional,
    help,
    error,
    maxLength,
    maxHelp,
    id,
    rows = 4,
    disabled,
    value,
    defaultValue,
    onChange,
    className,
    'aria-describedby': ariaDescribedBy,
    ...rest
}: TextAreaProps) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const helpId = `${inputId}-h`;
    const errorId = `${inputId}-e`;
    const [inner, setInner] = useState(() => String(defaultValue ?? ''));
    const text = value !== undefined ? String(value) : inner;
    const atMax = text.length >= maxLength;
    const isError = hasFieldError(error);
    const helpText = atMax ? (maxHelp ?? `Llegaste al máximo de ${maxLength} caracteres`) : help;

    return (
        <div className={cx('tl-field', isError && 'is-error', atMax && 'is-max', disabled && 'is-disabled', className)}>
            <FieldLabel htmlFor={inputId} optional={optional}>
                {label}
            </FieldLabel>
            <div className="tl-field__control tl-field__control--area">
                <textarea
                    className="tl-field__input"
                    id={inputId}
                    rows={rows}
                    maxLength={maxLength}
                    disabled={disabled}
                    value={text}
                    onChange={(e) => {
                        if (value === undefined) setInner(e.target.value);
                        onChange?.(e);
                    }}
                    aria-invalid={isError || undefined}
                    aria-describedby={describedBy(isError ? errorId : helpText ? helpId : undefined, ariaDescribedBy)}
                    {...rest}
                />
            </div>
            <FieldFoot
                helpId={helpId}
                errorId={errorId}
                help={helpText}
                error={error}
                count={`${text.length}/${maxLength}`}
            />
        </div>
    );
}
