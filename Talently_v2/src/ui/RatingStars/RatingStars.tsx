import { useId, useRef, type ComponentPropsWithRef, type KeyboardEvent } from 'react';
import { cx } from '../cx';
import { IconAlert, IconStar } from '../icons';
import { IconButton } from '../IconButton';

/** Nota con coma decimal: `formatRating(4.8)` → «4,8». */
export function formatRating(value: number): string {
    return value.toFixed(1).replace('.', ',');
}

export interface RatingStarsProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
    /** Nota promedio de 1 a 5. `null` o sin reseñas = «Sin reseñas aún». */
    value: number | null;
    /** Cantidad de reseñas: siempre visible junto a la nota. */
    count: number;
    /** lg (20/700) en el perfil. */
    size?: 'md' | 'lg';
}

/**
 * La nota de reseñas: estrella ámbar + nota con coma + cantidad entre
 * paréntesis («4,8 (23)»). Sin reseñas dice «Sin reseñas aún», nunca «0,0».
 * Las reseñas solo existen después de una transacción real.
 */
export function RatingStars({ value, count, size = 'md', className, ...rest }: RatingStarsProps) {
    if (value === null || count <= 0) {
        return (
            <span className={cx('tl-rating', 'tl-rating--none', className)} {...rest}>
                <IconStar />
                Sin reseñas aún
            </span>
        );
    }
    const nota = formatRating(value);
    return (
        <span
            className={cx('tl-rating', size === 'lg' && 'tl-rating--lg', className)}
            role="img"
            aria-label={`Nota ${nota} de 5, ${count} ${count === 1 ? 'reseña' : 'reseñas'}`}
            {...rest}
        >
            <IconStar />
            {nota}
            <span className="tl-rating__count">({count})</span>
        </span>
    );
}

/** Lo que dice cada nota al calificar («4 de 5 · Muy bien»). */
export const RATING_LABELS = ['Mal', 'Regular', 'Bien', 'Muy bien', 'Excelente'] as const;

export interface RatingInputProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'onChange' | 'defaultValue'> {
    /** Nota elegida, de 1 a 5. `null` = sin elegir. */
    value: number | null;
    onChange: (next: number) => void;
    /** Nombre del grupo para el lector de pantalla. */
    label?: string;
    /** lg: botones de 56 con estrellas de 40, en la evaluación al cerrar el turno (REV-01). */
    size?: 'md' | 'lg';
    disabled?: boolean;
    /** Mensaje humano bajo las estrellas («Elige de 1 a 5 estrellas»). */
    error?: string;
    /** Por qué está deshabilitado u otra ayuda («Podrás calificar cuando termine el turno.»). */
    hint?: string;
    /** Solo catálogo: fuerza `is-pressed` / `is-focus` en una estrella. */
    starClassName?: (star: number) => string | undefined;
}

/**
 * Calificar de 1 a 5 después de un turno, clase o servicio real: 5
 * IconButtons de 44 (`role="radio"`) y el texto «4 de 5 · Muy bien», para no
 * depender solo del color. Flechas, Inicio y Fin cambian la nota; un
 * `onKeyDown` propio corre antes y puede cancelarlas con `preventDefault()`.
 *
 * La nota y la ayuda de deshabilitado usan `.tl-stars__note` (12/16 500,
 * margin-top space-1, `color-text-2`), que bundle.css aún no trae: está en
 * app.css como brecha B4. El error usa `.tl-code-foot`, como en el preview.
 */
export function RatingInput({
    value,
    onChange,
    label = 'Tu calificación',
    size = 'md',
    disabled,
    error,
    hint,
    starClassName,
    className,
    onKeyDown: onKeyDownProp,
    'aria-describedby': describedBy,
    ...rest
}: RatingInputProps) {
    const id = useId();
    const errorId = `${id}-error`;
    const noteId = `${id}-note`;
    const buttons = useRef<Array<HTMLButtonElement | null>>([]);

    const choose = (star: number) => {
        onChange(star);
        buttons.current[star - 1]?.focus();
    };

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const current = value ?? 0;
        let next: number | null = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(5, current + 1);
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(1, current - 1);
        else if (e.key === 'Home') next = 1;
        else if (e.key === 'End') next = 5;
        if (next === null) return;
        e.preventDefault();
        choose(next);
    };

    const note = error ? null : value ? `${value} de 5 · ${RATING_LABELS[value - 1]}` : hint;

    return (
        <>
            <div
                {...rest}
                className={cx('tl-stars', size === 'lg' && 'tl-stars--lg', className)}
                role="radiogroup"
                aria-label={label}
                aria-invalid={error ? true : undefined}
                aria-describedby={cx(describedBy, error ? errorId : hint && !value ? noteId : undefined) || undefined}
                aria-disabled={disabled || undefined}
                onKeyDown={(e) => {
                    onKeyDownProp?.(e);
                    if (!disabled && !e.defaultPrevented) onKeyDown(e);
                }}
            >
                {RATING_LABELS.map((word, i) => {
                    const star = i + 1;
                    const checked = value === star;
                    return (
                        <IconButton
                            key={word}
                            ref={(el) => {
                                buttons.current[i] = el;
                            }}
                            icon={IconStar}
                            label={`${star} de 5, ${word}`}
                            role="radio"
                            aria-checked={checked}
                            tabIndex={checked || (!value && star === 1) ? 0 : -1}
                            disabled={disabled}
                            className={cx(value !== null && star <= value && 'is-on', starClassName?.(star))}
                            onClick={() => choose(star)}
                        />
                    );
                })}
            </div>
            {error ? (
                <p className="tl-code-foot is-error" id={errorId}>
                    <IconAlert size={16} />
                    <span>{error}</span>
                </p>
            ) : (
                note && (
                    <p className="tl-stars__note" id={noteId}>
                        {note}
                    </p>
                )
            )}
        </>
    );
}
