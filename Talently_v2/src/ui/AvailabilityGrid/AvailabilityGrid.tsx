import { useId, type ComponentPropsWithRef } from 'react';
import { cx } from '../cx';
import { IconAlert, IconCheck } from '../icons';

/** Día ISO, como `worker_shift_availability.weekday`: 1 lunes … 7 domingo. */
export type AvailabilityWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;
/** Franja del diccionario, como el enum `time_band`. */
export type AvailabilityBand = 'manana' | 'tarde' | 'noche' | 'madrugada';

/** Una celda elegida: un día y una franja (una fila de `worker_shift_availability`). */
export interface AvailabilityCell {
    weekday: AvailabilityWeekday;
    band: AvailabilityBand;
}

const WEEKDAYS: readonly { value: AvailabilityWeekday; label: string }[] = [
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' },
    { value: 7, label: 'Dom' },
];

/** Las 4 franjas del diccionario, en su orden fijo. */
export const AVAILABILITY_BANDS: readonly { value: AvailabilityBand; label: string; hours: string }[] = [
    { value: 'manana', label: 'Mañana', hours: '07–13' },
    { value: 'tarde', label: 'Tarde', hours: '13–19' },
    { value: 'noche', label: 'Noche', hours: '19–01' },
    { value: 'madrugada', label: 'Madrugada', hours: '01–07' },
];

const BAND_ORDER: Record<AvailabilityBand, number> = { manana: 0, tarde: 1, noche: 2, madrugada: 3 };

export interface AvailabilityGridProps extends Omit<ComponentPropsWithRef<'div'>, 'onChange' | 'children'> {
    /** Franjas elegidas. */
    value: readonly AvailabilityCell[];
    /** Devuelve siempre en orden: lunes a domingo y, dentro del día, Mañana a Madrugada. */
    onChange: (next: AvailabilityCell[]) => void;
    /**
     * Pregunta del paso, 13/600 («¿Cuándo puedes trabajar?»): va arriba con el
     * contador «5 franjas» y nombra la grilla. Sin ella, la grilla se llama «Disponibilidad».
     */
    label?: string;
    /** Días que se muestran (todos por defecto). */
    days?: readonly AvailabilityWeekday[];
    /** Al intentar continuar sin elegir: «Elige al menos una franja». */
    error?: string;
    /** Mientras se guarda el paso. */
    disabled?: boolean;
    /** Solo para el catálogo: clases que fuerzan estados en una celda (`{ '5-manana': 'is-pressed' }`). */
    cellClassName?: Partial<Record<`${AvailabilityWeekday}-${AvailabilityBand}`, string>>;
}

const keyOf = (c: AvailabilityCell) => `${c.weekday}-${c.band}` as const;

/**
 * Disponibilidad semanal por franjas: días en filas (Lun a Dom) y franjas en
 * columnas, con celdas de 48 de alto que se marcan con check. Se usa igual en
 * el onboarding de Trabajo, el Perfil y los filtros.
 */
export function AvailabilityGrid({
    value,
    onChange,
    label,
    days,
    error,
    disabled,
    cellClassName,
    className,
    ...rest
}: AvailabilityGridProps) {
    const labelId = useId();
    const errorId = useId();
    const chosen = new Set(value.map(keyOf));
    const rows = days ? WEEKDAYS.filter((d) => days.includes(d.value)) : WEEKDAYS;

    const toggle = (cell: AvailabilityCell) => {
        const on = !chosen.has(keyOf(cell));
        const next = on ? [...value, cell] : value.filter((c) => keyOf(c) !== keyOf(cell));
        onChange(next.sort((a, b) => a.weekday - b.weekday || BAND_ORDER[a.band] - BAND_ORDER[b.band]));
    };

    return (
        <div className={className} {...rest}>
            {label && (
                <div className="tl-chipgroup__head">
                    <span className="tl-chipgroup__label" id={labelId}>{label}</span>
                    <span className="tl-chipgroup__count" aria-live="polite">
                        {value.length} {value.length === 1 ? 'franja' : 'franjas'}
                    </span>
                </div>
            )}
            <div
                className={cx('tl-avail', error && 'is-error', disabled && 'is-disabled')}
                role="group"
                aria-labelledby={label ? labelId : undefined}
                aria-label={label ? undefined : 'Disponibilidad'}
                aria-describedby={error ? errorId : undefined}
            >
                <span />
                {AVAILABILITY_BANDS.map((b) => (
                    <span key={b.value} className="tl-avail__colh">
                        {b.label}
                        <small>{b.hours}</small>
                    </span>
                ))}
                {rows.map((d) => [
                    <span key={d.value} className="tl-avail__rowh">{d.label}</span>,
                    ...AVAILABILITY_BANDS.map((b) => {
                        const cell: AvailabilityCell = { weekday: d.value, band: b.value };
                        return (
                            <button
                                key={keyOf(cell)}
                                type="button"
                                className={cx('tl-avail__cell', cellClassName?.[keyOf(cell)])}
                                aria-pressed={chosen.has(keyOf(cell))}
                                aria-label={`${d.label}, ${b.label}`}
                                disabled={disabled}
                                onClick={() => toggle(cell)}
                            >
                                <IconCheck size={16} />
                            </button>
                        );
                    }),
                ])}
            </div>
            {error && (
                <p className="tl-code-foot is-error" id={errorId}>
                    <IconAlert size={16} />
                    <span>{error}</span>
                </p>
            )}
        </div>
    );
}
