import { useEffect, useId, useRef, type ComponentPropsWithRef } from 'react';
import { cx } from '../cx';
import { IconCalendar, IconCheck } from '../icons';
import { Button } from '../Button';
import { Chip } from '../Chip';
import { Skeleton, SkeletonGroup } from '../Skeleton';
import {
    dayOfMonth,
    formatDayFull,
    formatDayLong,
    formatDayShort,
    formatMonthRange,
    weekdayShort,
    type IsoDate,
} from '../CalendarWeek/dates';

/** Un día de la tira con sus horas realmente libres (ya sin clases reservadas ni descansos). */
export interface SlotDay {
    /** «2027-03-11». */
    date: IsoDate;
    /** Horas de inicio libres, en orden («16:00»). Sin horas, el día se ve deshabilitado. */
    times: readonly string[];
}

/** Lo elegido: el día y, cuando ya la eligió, la hora. */
export interface SlotValue {
    date: IsoDate;
    time: string | null;
}

/** Aviso cuando ningún día tiene horas libres (`.tl-slots__empty`, M9). */
export interface SlotPickerEmpty {
    /** Con el nombre de quien enseña: «Camila no tiene horarios libres en los próximos 14 días». */
    title: string;
    /** Por defecto: «Te avisamos cuando abra horas nuevas.». */
    text?: string;
    /** «Avisarme»: luego, Snackbar «Te avisaremos cuando Camila abra horarios». */
    onNotify: () => void;
    /** Ya pidió el aviso: el botón pasa a «Te avisaremos», deshabilitado y con check. */
    notified?: boolean;
    /** Mientras se guarda el aviso. */
    notifying?: boolean;
}

export interface SlotPickerProps extends Omit<ComponentPropsWithRef<'div'>, 'onChange' | 'children'> {
    /** Los 14 días seguidos desde hoy. Los días sin horas no se ocultan: se ven en gris. */
    days: readonly SlotDay[];
    /** Hoy: ese día dice «hoy» en vez del día de la semana. */
    today?: IsoDate;
    /**
     * Día y hora elegidos. Sin valor, no hay día marcado y se muestran las horas
     * del primer día con horas libres.
     */
    value: SlotValue | null;
    /** Tocar un día lo elige sin hora; tocar una hora la elige en ese día. */
    onChange: (next: SlotValue) => void;
    /** Las horas del día elegido cargan con Skeleton de chips. */
    loadingTimes?: boolean;
    /** Ayuda junto al mes. `false` la quita. */
    hint?: string | false;
    /** Obligatorio si puede pasar que no haya horas en los 14 días (RES-01). */
    empty?: SlotPickerEmpty;
    /** Solo para el catálogo: clases que fuerzan estados en un día (`{ '2027-03-13': 'is-pressed' }`). */
    dayClassName?: Partial<Record<IsoDate, string>>;
}

/**
 * Para elegir día y hora de una reserva (Clases en F2; Servicios en F3): tira
 * horizontal de 14 días de 56 × 72 con imán y, debajo, las horas libres del
 * día en chips de elección única. Controlado.
 */
export function SlotPicker({
    days,
    today,
    value,
    onChange,
    loadingTimes,
    hint = 'Desliza para ver 14 días',
    empty,
    dayClassName,
    className,
    ...rest
}: SlotPickerProps) {
    const timesLabelId = useId();
    const stripRef = useRef<HTMLDivElement>(null);

    const available = days.filter((d) => d.times.length > 0);
    const selected = value ? available.find((d) => d.date === value.date) : undefined;
    const current = selected ?? available[0];
    const first = days[0];
    const last = days[days.length - 1];

    // Al abrir, el día elegido queda a la vista dentro de la tira (sin mover la pantalla).
    const selectedDate = selected?.date;
    useEffect(() => {
        const strip = stripRef.current;
        const el = strip?.querySelector<HTMLElement>('[aria-pressed="true"]');
        if (!strip || !el) return;
        if (el.offsetLeft + el.offsetWidth > strip.scrollLeft + strip.clientWidth || el.offsetLeft < strip.scrollLeft) {
            strip.scrollLeft = el.offsetLeft - strip.offsetLeft;
        }
        // Solo al montar: después, el scroll es de quien desliza.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={cx('tl-slots', className)} {...rest}>
            {first && last && (
                <div className="tl-slots__head">
                    <span className="label">{formatMonthRange(first.date, last.date)}</span>
                    {hint && available.length > 0 && <span className="tl-field__help">{hint}</span>}
                </div>
            )}
            <div className="tl-slots__days" role="group" aria-label="Días" ref={stripRef}>
                {days.map((d) => {
                    const isToday = d.date === today;
                    const free = d.times.length > 0;
                    const name = `${isToday ? 'hoy, ' : ''}${formatDayLong(d.date)}${free ? '' : ', sin horas libres'}`;
                    return (
                        <button
                            key={d.date}
                            type="button"
                            className={cx('tl-day', dayClassName?.[d.date])}
                            aria-pressed={free ? d.date === selectedDate : undefined}
                            aria-label={name}
                            disabled={!free}
                            onClick={() => onChange({ date: d.date, time: null })}
                        >
                            <span className="tl-day__wd">{isToday ? 'hoy' : weekdayShort(d.date)}</span>
                            <span className="tl-day__n">{dayOfMonth(d.date)}</span>
                        </button>
                    );
                })}
            </div>
            {current ? (
                <>
                    <div className="tl-field__label" id={timesLabelId}>
                        Horas libres el {formatDayShort(current.date)}
                    </div>
                    {loadingTimes ? (
                        <SkeletonGroup className="tl-slots__times" label="Cargando horas libres…">
                            <Skeleton shape="chip" width={72} />
                            <Skeleton shape="chip" width={72} />
                            <Skeleton shape="chip" width={72} />
                        </SkeletonGroup>
                    ) : (
                        <div className="tl-slots__times" role="group" aria-labelledby={timesLabelId}>
                            {current.times.map((t) => (
                                <Chip
                                    key={t}
                                    selected={value?.date === current.date && value.time === t}
                                    onClick={() => onChange({ date: current.date, time: t })}
                                >
                                    {t}
                                </Chip>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                empty && (
                    <div className="tl-slots__empty" role="status">
                        <span className="tl-slots__empty-icon">
                            <IconCalendar />
                        </span>
                        <p className="tl-slots__empty-title">{empty.title}</p>
                        <p className="tl-slots__empty-text">{empty.text ?? 'Te avisamos cuando abra horas nuevas.'}</p>
                        {empty.notified ? (
                            <Button variant="tonal" icon={IconCheck} disabled>
                                Te avisaremos
                            </Button>
                        ) : (
                            <Button variant="tonal" loading={empty.notifying} loadingLabel="Guardando aviso…" onClick={empty.onNotify}>
                                Avisarme
                            </Button>
                        )}
                    </div>
                )
            )}
        </div>
    );
}

export interface SlotPeekProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
    /** Día de los próximos horarios libres. */
    date: IsoDate;
    /** Las 3 próximas horas libres de ese día. */
    times: readonly string[];
    /** Abre RES-01 con esa hora ya elegida. */
    onPickTime: (time: string) => void;
    /** «Ver 14 días»: abre RES-01 sin hora. */
    onSeeAll: () => void;
    /** Solo para el catálogo: clase que fuerza un estado en una hora (`{ '16:00': 'is-pressed' }`). */
    timeClassName?: Partial<Record<string, string>>;
}

/**
 * Adelanto del SlotPicker (`tl-slots--peek`, M9) bajo el detalle de una clase
 * (DET-01): «Próximos horarios libres», el día (informativo) y sus próximas
 * horas en chips que abren la reserva.
 */
export function SlotPeek({ date, times, onPickTime, onSeeAll, timeClassName, className, ...rest }: SlotPeekProps) {
    return (
        <div className={cx('tl-slots tl-slots--peek', className)} {...rest}>
            <div className="tl-slots__head">
                <span className="label">Próximos horarios libres</span>
                <Button variant="ghost" size="sm" onClick={onSeeAll}>
                    Ver 14 días
                </Button>
            </div>
            <div className="tl-slots__row">
                <span className="tl-day is-selected" aria-hidden="true">
                    <span className="tl-day__wd">{weekdayShort(date)}</span>
                    <span className="tl-day__n">{dayOfMonth(date)}</span>
                </span>
                <span className="tl-vh">{formatDayFull(date)}:</span>
                <div className="tl-slots__times">
                    {/* Abren RES-01: son acciones, no chips que se marcan (sin aria-pressed ni check). */}
                    {times.map((t) => (
                        <button key={t} type="button" className={cx('tl-chip', timeClassName?.[t])} onClick={() => onPickTime(t)}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
