import { useId, useRef, type KeyboardEvent } from 'react';
import { Chip } from '../Chip';
import type { ChipGroupOption } from '../ChipGroup';
import { cx } from '../cx';
import { IconAlert } from '../icons';

interface DynamicChipsBase {
    /** Etiqueta del grupo, 13/600. Es también su nombre accesible. */
    label: string;
    /** Agrega «(opcional)» como `span.tl-field__opt`, igual que en los campos. */
    optional?: boolean;
    options: readonly ChipGroupOption[];
    /** Error del grupo al intentar continuar («Elige un sistema de turno»). */
    error?: string;
    disabled?: boolean;
}

interface DynamicChipsSingle extends DynamicChipsBase {
    multiple?: false;
    value: string | null;
    onChange: (next: string | null) => void;
    /** Volver a tocar la opción elegida la quita (solo en lo opcional). */
    clearable?: boolean;
}

interface DynamicChipsMultiple extends DynamicChipsBase {
    multiple: true;
    value: readonly string[];
    onChange: (next: string[]) => void;
    /** Máximo con contador «2 de 3» y aviso en warning al llegar. */
    max?: { count: number; note: string };
}

export type DynamicChipsProps = DynamicChipsSingle | DynamicChipsMultiple;

const NEXT_KEYS: Record<string, 1 | -1> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/**
 * Chips de un campo dinámico con el marcado `tl-chipgroup` de ChipGroup
 * (modo filter), más lo que ChipGroup aún no tiene y el preview de
 * DynamicFields pide:
 * - «(opcional)» como `span.tl-field__opt` dentro de la etiqueta (500, color-text-2).
 * - Elección única (widget `segmented`) como `role="radiogroup"`: cada chip es
 *   un `role="radio"` con `aria-checked`, una sola parada de Tab y flechas que
 *   mueven y eligen, como un grupo de radios.
 * Cuando ChipGroup acepte `optional` y un modo de elección única, DynamicFields
 * vuelve a usarlo y este archivo sobra.
 */
export function DynamicChips(props: DynamicChipsProps) {
    const { label, optional, options, error, disabled } = props;
    const labelId = useId();
    const noteId = useId();
    const chipsRef = useRef<HTMLDivElement>(null);

    const chosen = props.multiple ? props.value : props.value === null ? [] : [props.value];
    const max = props.multiple ? props.max : undefined;
    const atMax = max !== undefined && chosen.length >= max.count;
    const hasNote = Boolean(error) || atMax;

    const toggle = (v: string) => {
        if (props.multiple) {
            const on = !props.value.includes(v);
            // Siempre en el orden de las opciones, no en el del toque.
            props.onChange(options.map((o) => o.value).filter((x) => (x === v ? on : props.value.includes(x))));
        } else if (props.value !== v) {
            props.onChange(v);
        } else if (props.clearable) {
            props.onChange(null);
        }
    };

    // Elección única: una sola parada de Tab, en la elegida o, si no hay, en la primera.
    const tabStop = props.multiple ? undefined : (options.find((o) => o.value === props.value) ?? options[0])?.value;

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const step = NEXT_KEYS[e.key];
        if (props.multiple || disabled || step === undefined) return;
        const buttons = Array.from(chipsRef.current?.querySelectorAll<HTMLButtonElement>('button[role="radio"]') ?? []);
        const from = buttons.findIndex((b) => b === e.target);
        if (from === -1) return;
        e.preventDefault();
        const to = (from + step + buttons.length) % buttons.length;
        const option = options[to];
        buttons[to]?.focus();
        if (option && option.value !== props.value) props.onChange(option.value);
    };

    return (
        <div
            className={cx('tl-chipgroup', atMax && 'is-max', error ? 'is-error' : undefined, disabled && 'is-disabled')}
            role={props.multiple ? 'group' : 'radiogroup'}
            aria-labelledby={labelId}
            aria-describedby={hasNote ? noteId : undefined}
            aria-invalid={!props.multiple && error ? true : undefined}
        >
            <div className="tl-chipgroup__head">
                <span className="tl-chipgroup__label" id={labelId}>
                    {label}
                    {optional && (
                        <>
                            {' '}
                            <span className="tl-field__opt">(opcional)</span>
                        </>
                    )}
                </span>
                {max !== undefined && (
                    <span className="tl-chipgroup__count" aria-live="polite">
                        {chosen.length} de {max.count}
                    </span>
                )}
            </div>
            <div className="tl-chipgroup__chips" ref={chipsRef} onKeyDown={onKeyDown}>
                {options.map((o) => {
                    const on = chosen.includes(o.value);
                    const common = {
                        variant: o.icon ? ('lead' as const) : ('filter' as const),
                        icon: o.icon,
                        disabled: disabled || (atMax && !on),
                        onClick: () => toggle(o.value),
                    };
                    return props.multiple ? (
                        <Chip key={o.value} {...common} selected={on}>
                            {o.label}
                        </Chip>
                    ) : (
                        <Chip
                            key={o.value}
                            {...common}
                            // Radio en vez de botón de alternancia: el estado va en aria-checked
                            // y el aspecto elegido en `is-selected` (bundle.css no mira aria-checked).
                            role="radio"
                            aria-checked={on}
                            aria-pressed={undefined}
                            className={on ? 'is-selected' : undefined}
                            tabIndex={o.value === tabStop ? 0 : -1}
                        >
                            {o.label}
                        </Chip>
                    );
                })}
            </div>
            {atMax && !error && (
                <div className="tl-chipgroup__note tl-chipgroup__note--max" id={noteId}>
                    <IconAlert size={16} />
                    <span>{max?.note}</span>
                </div>
            )}
            {error && (
                <div className="tl-chipgroup__note tl-chipgroup__note--error" id={noteId}>
                    <IconAlert size={16} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
