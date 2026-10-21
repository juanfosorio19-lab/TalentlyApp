// Elección única con chips (ONB-T2 «¿Hasta dónde te mueves?», PRF-01 «Mis
// perfiles»): el marcado tl-chipgroup del prototipo con Chip de src/ui.
// ChipGroup de src/ui es de elección múltiple y no admite una acción en su
// cabecera (ambas cosas pedidas en «requests»); cuando las tenga, esto se borra.
import { useId, type ReactNode } from 'react';
import { Chip } from '../../../ui/Chip';
import { cx } from '../../../ui/cx';

export interface ChipChoiceProps<T extends string> {
    label: string;
    options: readonly { value: T; label: string }[];
    value: T | null;
    onChange: (next: T) => void;
    /** A la derecha de la etiqueta («Ver cómo me ven»). */
    action?: ReactNode;
    /** Bajo los chips, en `color-text-2` («Desde Puente Alto.»). */
    note?: ReactNode;
    className?: string;
}

export function ChipChoice<T extends string>({ label, options, value, onChange, action, note, className }: ChipChoiceProps<T>) {
    const labelId = useId();
    return (
        <div className={cx('tl-chipgroup', className)} role="group" aria-labelledby={labelId}>
            <div className="tl-chipgroup__head">
                <span className="tl-chipgroup__label" id={labelId}>
                    {label}
                </span>
                {action}
            </div>
            <div className="tl-chipgroup__chips">
                {options.map((o) => (
                    <Chip key={o.value} selected={o.value === value} onClick={() => onChange(o.value)}>
                        {o.label}
                    </Chip>
                ))}
            </div>
            {note && <p className="body prf-muted prf-chipnote">{note}</p>}
        </div>
    );
}
