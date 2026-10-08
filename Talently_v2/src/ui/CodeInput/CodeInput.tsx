import { useCallback, useEffect, useId, useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../cx';
import { Button } from '../Button';
import { IconAlert } from '../icons';
import { Spinner } from '../Spinner';

/** El código siempre tiene 6 dígitos (AUTH-03 correo, AUTH-08 teléfono). */
export const CODE_LENGTH = 6;

const onlyDigits = (text: string) => text.replace(/\D/g, '').slice(0, CODE_LENGTH);

/** «0:45», «4:59». */
export function formatCountdown(seconds: number): string {
    const s = Math.max(0, Math.ceil(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * Cuenta regresiva real para «Reenviar en 0:45»: se calcula contra el reloj,
 * así no se atrasa si la app pasa a segundo plano. `restart(segundos)` la
 * vuelve a empezar (al reenviar).
 */
export function useCountdown(seconds: number): [left: number, restart: (seconds?: number) => void] {
    const [endAt, setEndAt] = useState(() => Date.now() + seconds * 1000);
    const [left, setLeft] = useState(seconds);

    useEffect(() => {
        const timer = setInterval(() => {
            const next = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
            setLeft(next);
            if (next === 0) clearInterval(timer);
        }, 250);
        return () => clearInterval(timer);
    }, [endAt]);

    const restart = useCallback(
        (again: number = seconds) => {
            setEndAt(Date.now() + again * 1000);
            setLeft(again);
        },
        [seconds],
    );

    return [left, restart];
}

export interface CodeInputProps
    extends Omit<
        ComponentPropsWithRef<'input'>,
        'children' | 'type' | 'value' | 'defaultValue' | 'onChange' | 'maxLength' | 'inputMode' | 'autoComplete'
    > {
    /** Dígitos escritos (controlado). */
    value?: string;
    /** Dígitos al inicio (no controlado). */
    defaultValue?: string;
    /** Cada cambio, ya limpio: solo dígitos y como máximo 6. */
    onChange?: (code: string) => void;
    /** Al completar los 6 dígitos: se verifica solo, sin botón. */
    onComplete?: (code: string) => void;
    /** Nombre para lectores de pantalla. Por defecto «Código de 6 dígitos». */
    label?: string;
    /** Ayuda bajo las casillas. Por defecto «Escribe o pega los 6 dígitos.». */
    help?: ReactNode;
    /** Mensaje humano: «El código no es correcto. Te quedan 2 intentos.». */
    error?: ReactNode;
    /** Verificando: spinner de 16 y «Verificando…»; el campo no se edita mientras tanto. */
    loading?: boolean;
    /** Por defecto «Verificando…». */
    loadingLabel?: ReactNode;
    /** Muestra «Reenviar» (Button ghost sm) bajo la ayuda. */
    onResend?: () => void;
    /** Segundos que faltan para poder reenviar: «Reenviar en 0:45» deshabilitado hasta llegar a 0 (ver `useCountdown`). */
    resendIn?: number;
}

/**
 * Código de 6 dígitos: 6 casillas visuales de 48 × 56 y UN SOLO input real
 * encima (`autocomplete="one-time-code"`, teclado numérico) para que el
 * teléfono ofrezca el código del SMS y se pueda pegar. La casilla activa
 * (borde primary-text, halo y cursor) es la siguiente por llenar mientras el
 * campo tiene el foco. `className` va en `.tl-code`; el resto de las props,
 * al `input`.
 */
export function CodeInput({
    value,
    defaultValue,
    onChange,
    onComplete,
    label = 'Código de 6 dígitos',
    help = 'Escribe o pega los 6 dígitos.',
    error,
    loading,
    loadingLabel = 'Verificando…',
    onResend,
    resendIn = 0,
    id,
    disabled,
    readOnly,
    className,
    onFocus,
    onBlur,
    onClick,
    onPaste,
    onSelect,
    'aria-describedby': ariaDescribedBy,
    ...rest
}: CodeInputProps) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const footId = `${inputId}-f`;
    const [inner, setInner] = useState(() => onlyDigits(defaultValue ?? ''));
    const [focused, setFocused] = useState(false);
    const code = value !== undefined ? onlyDigits(value) : inner;
    const isError = error != null && error !== false && error !== '';
    // El catálogo fuerza el foco con className="is-focus" (no hay selector .tl-code.is-focus).
    const forcedFocus = (className ?? '').split(/\s+/).includes('is-focus');
    const showFocus = (focused || forcedFocus) && !disabled && !loading;
    const active = showFocus ? Math.min(code.length, CODE_LENGTH - 1) : -1;

    const commit = (raw: string) => {
        const next = onlyDigits(raw);
        if (next === code) return;
        if (value === undefined) setInner(next);
        onChange?.(next);
        if (next.length === CODE_LENGTH) onComplete?.(next);
    };

    /** El cursor real siempre al final: se escribe en la casilla activa. */
    const caretToEnd = (input: HTMLInputElement) => {
        const end = input.value.length;
        input.setSelectionRange(end, end);
    };

    /**
     * Las flechas, Inicio, Fin o un toque en medio no dejan el cursor fuera
     * del final. Solo se acepta, además, seleccionar todo (para reemplazar o
     * borrar el código entero).
     */
    const keepCaretAtEnd = (input: HTMLInputElement) => {
        const end = input.value.length;
        const start = input.selectionStart ?? end;
        const finish = input.selectionEnd ?? end;
        const atEnd = start === end && finish === end;
        const all = start === 0 && finish === end;
        if (!atEnd && !all) caretToEnd(input);
    };

    return (
        <div>
            <div
                className={cx(
                    'tl-code',
                    isError && 'is-error',
                    disabled && 'is-disabled',
                    loading && 'is-loading',
                    className,
                )}
            >
                {Array.from({ length: CODE_LENGTH }, (_, i) => (
                    <span key={i} className={cx('tl-code__box', i === active && 'is-active')} aria-hidden="true">
                        {code[i]}
                    </span>
                ))}
                <input
                    className="tl-code__input"
                    id={inputId}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={CODE_LENGTH}
                    aria-label={label}
                    aria-invalid={isError || undefined}
                    aria-busy={loading || undefined}
                    aria-describedby={cx(footId, ariaDescribedBy)}
                    disabled={disabled}
                    readOnly={readOnly || loading}
                    value={code}
                    onChange={(e) => commit(e.target.value)}
                    onPaste={(e) => {
                        onPaste?.(e);
                        if (e.defaultPrevented) return;
                        e.preventDefault();
                        if (readOnly || loading) return;
                        const pasted = onlyDigits(e.clipboardData.getData('text'));
                        // Lo pegado reemplaza lo seleccionado (p. ej. todo, tras seleccionar todo).
                        const el = e.currentTarget;
                        const start = el.selectionStart ?? code.length;
                        const end = el.selectionEnd ?? code.length;
                        commit(pasted.length === CODE_LENGTH ? pasted : code.slice(0, start) + pasted + code.slice(end));
                    }}
                    onFocus={(e) => {
                        setFocused(true);
                        caretToEnd(e.currentTarget);
                        onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setFocused(false);
                        onBlur?.(e);
                    }}
                    onClick={(e) => {
                        caretToEnd(e.currentTarget);
                        onClick?.(e);
                    }}
                    onSelect={(e) => {
                        keepCaretAtEnd(e.currentTarget);
                        onSelect?.(e);
                    }}
                    {...rest}
                />
            </div>
            <p className={cx('tl-code-foot', isError && !loading && 'is-error')} id={footId} aria-live="polite">
                {loading ? (
                    <>
                        <Spinner size={16} />
                        <span>{loadingLabel}</span>
                    </>
                ) : isError ? (
                    <>
                        <IconAlert size={16} />
                        <span>{error}</span>
                    </>
                ) : (
                    <span>{help}</span>
                )}
            </p>
            {onResend && (
                <Button variant="ghost" size="sm" disabled={resendIn > 0} onClick={onResend}>
                    {resendIn > 0 ? `Reenviar en ${formatCountdown(resendIn)}` : 'Reenviar código'}
                </Button>
            )}
        </div>
    );
}
