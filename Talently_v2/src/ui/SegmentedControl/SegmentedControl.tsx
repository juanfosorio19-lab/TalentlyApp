import type { ComponentPropsWithRef, KeyboardEvent } from 'react';
import { cx } from '../cx';

export interface SegmentedOption<T extends string = string> {
    value: T;
    /** «Empleos», «Turnos», «Clases». Lo no lanzado nunca es segmento. */
    label: string;
    /** id del panel que muestra (`aria-controls`). */
    controls?: string;
    /** Solo para el catálogo (`is-pressed`, `is-focus`). */
    className?: string;
}

export interface SegmentedControlProps<T extends string = string>
    extends Omit<ComponentPropsWithRef<'div'>, 'onChange' | 'children' | 'role'> {
    /** Una variante por fase: F1 «Empleos · Turnos»; F2 «Empleos · Turnos · Clases». */
    options: readonly SegmentedOption<T>[];
    value: T;
    onChange: (next: T) => void;
    /** Solo mientras se cambia de actor; nunca para ocultar algo no lanzado. */
    disabled?: boolean;
}

/**
 * Selector de vista dentro de una pantalla (Explorar): `div.tl-seg[role=tablist]`,
 * alto 40, pill. Controlado; flechas, Inicio y Fin mueven el segmento activo.
 */
export function SegmentedControl<T extends string = string>({
    options,
    value,
    onChange,
    disabled,
    className,
    onKeyDown,
    ...rest
}: SegmentedControlProps<T>) {
    const move = (e: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(e);
        if (disabled || e.defaultPrevented) return;
        const i = options.findIndex((o) => o.value === value);
        const last = options.length - 1;
        const next =
            e.key === 'ArrowRight' ? (i >= last ? 0 : i + 1)
            : e.key === 'ArrowLeft' ? (i <= 0 ? last : i - 1)
            : e.key === 'Home' ? 0
            : e.key === 'End' ? last
            : -1;
        const opt = options[next];
        if (!opt) return;
        e.preventDefault();
        onChange(opt.value);
        e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
    };

    return (
        <div
            className={cx('tl-seg', disabled && 'is-disabled', className)}
            role="tablist"
            onKeyDown={move}
            {...rest}
        >
            {options.map((o) => {
                const selected = o.value === value;
                return (
                    <button
                        key={o.value}
                        type="button"
                        role="tab"
                        // `is-selected` además de aria-selected: el activo deshabilitado solo tiene selector de clase.
                        className={cx('tl-seg__opt', selected && 'is-selected', o.className)}
                        aria-selected={selected}
                        aria-controls={o.controls}
                        tabIndex={selected ? 0 : -1}
                        disabled={disabled}
                        onClick={() => !selected && onChange(o.value)}
                    >
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}
