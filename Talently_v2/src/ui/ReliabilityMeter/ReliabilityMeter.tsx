import type { ComponentPropsWithRef } from 'react';
import { cx } from '../cx';

/** Desde cuántos turnos confirmados se muestra el porcentaje. Antes: «Aún sin turnos suficientes». */
export const RELIABILITY_MIN_SHIFTS = 3;

/** Asistidos que cuentan: nunca más que los confirmados, para que la nota cuadre con el porcentaje. */
export function attendedShifts(attended: number, confirmed: number): number {
    return Math.max(0, Math.min(attended, confirmed));
}

/**
 * Turnos asistidos ÷ turnos confirmados, redondeado como en la referencia
 * («7 de 9» → 78 %), pero la cifra siempre cuadra con la cantidad: 100 % solo
 * si asistió a todos (199 de 200 → 99 %) y 0 % solo si no asistió a ninguno.
 * `null` si todavía no hay turnos suficientes (nunca un 100 % de partida).
 */
export function reliabilityPercent(attended: number, confirmed: number): number | null {
    if (confirmed < RELIABILITY_MIN_SHIFTS) return null;
    const done = attendedShifts(attended, confirmed);
    const rounded = Math.round((done / confirmed) * 100);
    if (done < confirmed && rounded === 100) return 99;
    if (done > 0 && rounded === 0) return 1;
    return rounded;
}

const pct = (n: number) => `${n}\u00a0%`;
const shifts = (n: number) => `${n} ${n === 1 ? 'turno cumplido' : 'turnos cumplidos'}`;

export interface ReliabilityMeterProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
    /** Turnos en que quien publica marcó «Asistió». */
    attended: number;
    /** Turnos confirmados (los cancelados por la organización no cuentan). */
    confirmed: number;
}

/**
 * Cuánto cumple una persona con los turnos que le confirmaron: valor, barra
 * (`role="meter"`, avance `color-success-text`) y de dónde sale el número.
 * Siempre con la cantidad al lado; se muestra desde 3 turnos confirmados.
 */
export function ReliabilityMeter({ attended, confirmed, className, ...rest }: ReliabilityMeterProps) {
    const value = reliabilityPercent(attended, confirmed);
    const done = attendedShifts(attended, confirmed);
    return (
        <div className={cx('tl-reliab', className)} {...rest}>
            <div className="tl-reliab__row">
                <span>Confiabilidad</span>
                {value !== null && <span className="tl-reliab__value">{pct(value)}</span>}
            </div>
            {value !== null && (
                <div
                    className="tl-progress"
                    role="meter"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={value}
                    aria-label={`Confiabilidad ${pct(value)}`}
                >
                    <div className="tl-progress__bar" style={{ width: `${value}%` }} />
                </div>
            )}
            <span className="tl-reliab__note">
                {value === null
                    ? `Aún sin turnos suficientes. Se muestra desde ${RELIABILITY_MIN_SHIFTS} turnos confirmados.`
                    : `Asistió a ${done} de ${confirmed} turnos confirmados`}
            </span>
        </div>
    );
}

export type ReliabilityInlineProps = Omit<ComponentPropsWithRef<'p'>, 'children'> &
    Pick<ReliabilityMeterProps, 'attended' | 'confirmed'>;

/** Compacto, en tarjetas y Personas sugeridas: «Confiabilidad **96 %** · 25 turnos cumplidos». */
export function ReliabilityInline({ attended, confirmed, className, ...rest }: ReliabilityInlineProps) {
    const value = reliabilityPercent(attended, confirmed);
    const done = attendedShifts(attended, confirmed);
    return (
        <p className={cx('tl-reliab-inline', className)} {...rest}>
            {value === null ? (
                'Aún sin turnos suficientes'
            ) : (
                <>
                    Confiabilidad <b>{pct(value)}</b> · {shifts(done)}
                </>
            )}
        </p>
    );
}
