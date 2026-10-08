import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../cx';

const ignore = () => {};

export interface SwitchProps extends Omit<ComponentPropsWithRef<'input'>, 'type' | 'role' | 'children'> {
    /** Qué enciende, en una línea («Avisarme de turnos nuevos»). */
    label: ReactNode;
    /** Línea de apoyo. Si está deshabilitado, explica cómo activarlo («Verifica tu correo para activarlos»). */
    description?: ReactNode;
    /** Guardando: spinner de 16 dentro del thumb y fila bloqueada. Si falla, el valor vuelve atrás y la pantalla muestra un Snackbar. */
    loading?: boolean;
    /** Texto que reemplaza a la descripción mientras guarda. */
    loadingLabel?: string;
}

/**
 * El único toggle de Talently, en una fila `label.tl-choice` tocable de 48.
 * Las props nativas (`checked`, `onChange`, `disabled`, `name`, `ref`…) van al
 * `input[role=switch]`; `className` va a la fila.
 */
export function Switch({
    label,
    description,
    loading,
    loadingLabel = 'Guardando…',
    disabled,
    className,
    onClick,
    onChange,
    ...rest
}: SwitchProps) {
    const desc = loading ? loadingLabel : description;
    return (
        <label
            className={cx(
                'tl-choice',
                // El texto deshabilitado y el spinner solo tienen selector de clase en bundle.css.
                disabled && 'is-disabled',
                loading && 'is-loading',
                className,
            )}
        >
            <span className="tl-choice__text">
                {label}
                {desc && <span className="tl-choice__desc">{desc}</span>}
            </span>
            <span className="tl-switch">
                <input
                    type="checkbox"
                    role="switch"
                    disabled={disabled}
                    aria-busy={loading || undefined}
                    // Mientras guarda no cambia (ni con el teclado: la fila ya bloquea el toque).
                    onClick={loading ? (e) => e.preventDefault() : onClick}
                    onChange={loading ? ignore : onChange}
                    {...rest}
                />
                <span className="tl-switch__track">
                    <span className="tl-switch__thumb">
                        <span className="tl-spinner tl-spinner--16" aria-hidden="true" />
                    </span>
                </span>
            </span>
        </label>
    );
}
