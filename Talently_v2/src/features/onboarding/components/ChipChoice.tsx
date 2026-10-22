// Elección única con chips (ONB-T2 «¿Hasta dónde te mueves?»): el marcado
// `tl-chipgroup` del prototipo con Chip de src/ui, como `role="radiogroup"`
// (una sola parada de Tab y flechas que mueven y eligen). ChipGroup de src/ui
// es solo de elección múltiple (pedido en «requests»); cuando la tenga, esto
// se borra.
import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Chip } from '../../../ui/Chip';

const NEXT_KEYS: Record<string, 1 | -1> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

export interface ChipChoiceProps<T extends string> {
    label: string;
    options: readonly { value: T; label: string }[];
    value: T | null;
    onChange: (next: T) => void;
    /** Bajo los chips, en `color-text-2` («Desde Puente Alto.»). */
    note?: ReactNode;
}

export function ChipChoice<T extends string>({ label, options, value, onChange, note }: ChipChoiceProps<T>) {
    const labelId = useId();
    const chipsRef = useRef<HTMLDivElement>(null);
    const tabStop = (options.find((o) => o.value === value) ?? options[0])?.value;

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const step = NEXT_KEYS[e.key];
        if (step === undefined) return;
        const buttons = Array.from(chipsRef.current?.querySelectorAll<HTMLButtonElement>('button[role="radio"]') ?? []);
        const from = buttons.findIndex((b) => b === e.target);
        if (from === -1) return;
        e.preventDefault();
        const to = (from + step + buttons.length) % buttons.length;
        buttons[to]?.focus();
        const option = options[to];
        if (option) onChange(option.value);
    };

    return (
        <div>
            <div className="tl-chipgroup" role="radiogroup" aria-labelledby={labelId}>
                <div className="tl-chipgroup__head">
                    <span className="tl-chipgroup__label" id={labelId}>
                        {label}
                    </span>
                </div>
                <div className="tl-chipgroup__chips" ref={chipsRef} onKeyDown={onKeyDown}>
                    {options.map((o) => {
                        const on = o.value === value;
                        return (
                            <Chip
                                key={o.value}
                                // Radio y no alternancia: el estado va en aria-checked y el aspecto en `is-selected`.
                                role="radio"
                                aria-checked={on}
                                aria-pressed={undefined}
                                className={on ? 'is-selected' : undefined}
                                tabIndex={o.value === tabStop ? 0 : -1}
                                onClick={() => onChange(o.value)}
                            >
                                {o.label}
                            </Chip>
                        );
                    })}
                </div>
            </div>
            {note && <p className="body onb-muted onb-chipnote">{note}</p>}
        </div>
    );
}
