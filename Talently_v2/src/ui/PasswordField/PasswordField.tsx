import { useId, useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../cx';
import { IconAlert, IconCheck, IconEye } from '../icons';
import { IconButton } from '../IconButton';
import { FieldFoot, FieldLabel, describedBy, hasFieldError } from '../TextField';

/** Las 3 reglas de una contraseña nueva, siempre en este orden. */
export const PASSWORD_RULES = [
    { key: 'length', label: '8 caracteres o más', test: (v: string) => v.length >= 8 },
    { key: 'upper', label: 'Una mayúscula', test: (v: string) => /\p{Lu}/u.test(v) },
    { key: 'symbol', label: 'Un número o símbolo', test: (v: string) => /[^\p{L}\s]/u.test(v) },
] as const;

export type PasswordRuleKey = (typeof PASSWORD_RULES)[number]['key'];

/** Qué reglas cumple la contraseña (para habilitar «Crear cuenta» o marcar las que faltan). */
export function checkPassword(value: string): Record<PasswordRuleKey, boolean> & { ok: boolean } {
    const length = PASSWORD_RULES[0].test(value);
    const upper = PASSWORD_RULES[1].test(value);
    const symbol = PASSWORD_RULES[2].test(value);
    return { length, upper, symbol, ok: length && upper && symbol };
}

export interface PasswordFieldProps extends Omit<ComponentPropsWithRef<'input'>, 'children' | 'type'> {
    /** Por defecto «Contraseña». */
    label?: ReactNode;
    /**
     * `new` (AUTH-02, AUTH-06): crea la contraseña, con las 3 reglas en vivo y
     * `autocomplete="new-password"`. `current` (AUTH-04): solo el ojo, sin
     * reglas, `autocomplete="current-password"`.
     */
    mode?: 'new' | 'current';
    /** Se tocó «Crear cuenta» con reglas sin cumplir: esas pasan a danger con alerta y el borde del campo también. */
    showMissing?: boolean;
    /** Ayuda abajo (sin reglas). */
    help?: ReactNode;
    /** Mensaje humano («El correo o la contraseña no coinciden»). */
    error?: ReactNode;
    /** Contraseña visible (controlado). Sin valor, el campo lo maneja solo. */
    visible?: boolean;
    /** Visible al inicio (no controlado). */
    defaultVisible?: boolean;
    onVisibleChange?: (visible: boolean) => void;
}

/**
 * TextField de contraseña con el ojo para mostrarla (IconButton dentro del
 * campo, tonal y `aria-pressed` cuando está activo) y, al crearla, las 3
 * reglas que se marcan en vivo. Funciona controlado (`value` + `onChange`
 * nativo) o no controlado. `className` va en la raíz `.tl-field`; el resto de
 * las props, al `input`.
 */
export function PasswordField({
    label = 'Contraseña',
    mode = 'new',
    showMissing,
    help,
    error,
    visible,
    defaultVisible = false,
    onVisibleChange,
    id,
    disabled,
    value,
    defaultValue,
    onChange,
    autoComplete,
    className,
    'aria-describedby': ariaDescribedBy,
    ...rest
}: PasswordFieldProps) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const helpId = `${inputId}-h`;
    const errorId = `${inputId}-e`;
    const rulesId = `${inputId}-r`;
    const [inner, setInner] = useState(() => String(defaultValue ?? ''));
    const [innerVisible, setInnerVisible] = useState(defaultVisible);
    const text = value !== undefined ? String(value) : inner;
    const shown = visible ?? innerVisible;
    const withRules = mode === 'new';
    const rules = PASSWORD_RULES.map((rule) => {
        const met = rule.test(text);
        return { ...rule, state: met ? 'met' : showMissing ? 'missing' : 'pending' } as const;
    });
    const hasMessage = hasFieldError(error);
    const isError = hasMessage || (withRules && showMissing && rules.some((r) => r.state === 'missing'));
    const withFoot = !withRules || help != null || hasMessage;

    const toggle = () => {
        const next = !shown;
        if (visible === undefined) setInnerVisible(next);
        onVisibleChange?.(next);
    };

    return (
        <div className={cx('tl-field', isError && 'is-error', disabled && 'is-disabled', className)}>
            <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
            <div className="tl-field__control">
                <input
                    className="tl-field__input"
                    id={inputId}
                    type={shown ? 'text' : 'password'}
                    autoComplete={autoComplete ?? (withRules ? 'new-password' : 'current-password')}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    disabled={disabled}
                    value={text}
                    onChange={(e) => {
                        if (value === undefined) setInner(e.target.value);
                        onChange?.(e);
                    }}
                    aria-invalid={isError || undefined}
                    aria-describedby={describedBy(
                        withRules && rulesId,
                        withFoot && (hasMessage ? errorId : help ? helpId : undefined),
                        ariaDescribedBy,
                    )}
                    {...rest}
                />
                <IconButton
                    icon={IconEye}
                    label={shown ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="tl-field__toggle"
                    aria-pressed={shown}
                    aria-controls={inputId}
                    disabled={disabled}
                    onClick={toggle}
                />
            </div>
            {withRules && (
                <ul className="tl-rules" id={rulesId} aria-live="polite">
                    {rules.map((rule) => (
                        <li
                            key={rule.key}
                            className={cx('tl-rules__item', rule.state === 'met' && 'is-met', rule.state === 'missing' && 'is-missing')}
                        >
                            <span className="tl-rules__mark">
                                {rule.state === 'met' && <IconCheck size={16} />}
                                {rule.state === 'missing' && <IconAlert size={16} />}
                            </span>
                            {rule.label}
                            <span className="tl-vh">
                                {rule.state === 'met' ? ': cumplido' : rule.state === 'missing' ? ': falta' : ': pendiente'}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
            {withFoot && <FieldFoot helpId={helpId} errorId={errorId} help={help} error={error} />}
        </div>
    );
}
