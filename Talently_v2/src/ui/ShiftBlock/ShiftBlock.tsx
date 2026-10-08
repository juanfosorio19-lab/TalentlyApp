import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../cx';
import { Badge } from '../Badge';
import { cuposLabel, cuposTone, type Cupos } from '../PublicationCard';

export interface ShiftBlocksProps extends ComponentPropsWithRef<'ul'> {
    /** Un ShiftBlock por día: una serie (sáb 12 y dom 13 dic) lleva un bloque por día y se postula a todos. */
    children: ReactNode;
}

/** Lista de bloques de un turno (`ul.tl-shifts`), separados por 8. */
export function ShiftBlocks({ className, ...rest }: ShiftBlocksProps) {
    return <ul className={cx('tl-shifts', className)} {...rest} />;
}

export interface ShiftBlockProps extends Omit<ComponentPropsWithRef<'li'>, 'children'> {
    /** Día de la semana abreviado, en minúscula: «sáb» (se ve en mayúsculas). */
    weekday: string;
    /** Número del día: 12. */
    day: number | string;
    /** Mes abreviado: «dic». */
    month: string;
    /** Horario, con raya: «18:00–00:00». */
    time: string;
    /** Duración, con «Hoy» delante si es hoy: «6 h», «Hoy · 5 h». */
    duration?: string;
    /** Cupos del bloque, con el mismo formato de la tarjeta: texto con 3 o más, Badge con 2 o menos o sin cupos. */
    cupos?: Cupos;
}

/**
 * Un día de un turno con la fecha y el horario grandes (DET-01 Turno, TUR-01
 * y la vista previa de PUBL-03). Informa: no se toca, no se selecciona ni se
 * deshabilita. La fecha se lee como texto («sáb 12 dic, 18:00–00:00, 6 h ·
 * Quedan 3 de 8 cupos»); el recuadro es decorativo para el lector.
 */
export function ShiftBlock({ weekday, day, month, time, duration, cupos, className, ...rest }: ShiftBlockProps) {
    const tone = cupos ? cuposTone(cupos) : undefined;
    const label = cupos ? cuposLabel(cupos) : undefined;
    // Con 3 o más cupos, duración y cupos van en una sola línea de texto; si no, el Badge va aparte.
    const text = [duration, tone === 'text' ? label : undefined].filter(Boolean).join(' · ');
    return (
        <li className={cx('tl-shift', className)} {...rest}>
            <span className="tl-shift__date" aria-hidden="true">
                <span className="tl-shift__wd">{weekday}</span>
                <span className="tl-shift__day">{day}</span>
                <span className="tl-shift__mon">{month}</span>
            </span>
            <span className="tl-shift__body">
                <span className="tl-vh">{`${weekday} ${day} ${month}, `}</span>
                <span className="tl-shift__time">{time}</span>
                {(text || (tone && tone !== 'text')) && (
                    <span className="tl-shift__meta">
                        {text && <span>{text}</span>}
                        {tone === 'warning' && <Badge tone="warning">{label}</Badge>}
                        {tone === 'full' && <Badge status="Cupos completos" />}
                    </span>
                )}
            </span>
        </li>
    );
}

export interface CuposBarProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
    /** Personas confirmadas. */
    confirmed: number;
    /** Cupos del turno. */
    total: number;
    /** Rótulo de la fila: «Confirmados». */
    label?: string;
    /** Nota bajo la barra. Por defecto: «Faltan 3 personas», «Falta 1 persona» o, completa, «Cupos completos». */
    note?: string;
}

/**
 * Barra de cupos de un turno (GES-04): «Confirmados 5/8» y una barra de 8
 * con `role="meter"`; completa pasa a `color-success-text` (`is-full`).
 * Siempre con el número al lado: el avance no depende solo de la barra.
 */
export function CuposBar({ confirmed, total, label = 'Confirmados', note, className, ...rest }: CuposBarProps) {
    const full = total > 0 && confirmed >= total;
    const missing = Math.max(total - confirmed, 0);
    const defaultNote = full ? 'Cupos completos' : missing === 1 ? 'Falta 1 persona' : `Faltan ${missing} personas`;
    const pct = total > 0 ? Math.min(confirmed / total, 1) * 100 : 0;
    return (
        <div className={cx('tl-cupos', full && 'is-full', className)} {...rest}>
            <div className="tl-cupos__row">
                <span>{label}</span>
                <span className="tl-cupos__value">
                    {confirmed}/{total}
                </span>
            </div>
            <div
                className="tl-progress"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={confirmed}
                aria-label={`${confirmed} de ${total} cupos ${label.toLocaleLowerCase('es-CL')}`}
            >
                <div className="tl-progress__bar" style={{ width: `${pct}%` }} />
            </div>
            <span className="tl-cupos__note">{note ?? defaultNote}</span>
        </div>
    );
}
