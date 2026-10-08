import type { ComponentPropsWithRef } from 'react';
import { cx } from '../cx';

/** Unidades del diccionario (`pay_unit` de la base de datos). */
export type PayUnit = 'mes' | 'dia' | 'hora' | 'turno' | 'evento' | 'visita' | 'clase' | 'proyecto' | 'a_convenir';

export type AmountSize = 'sm' | 'md' | 'lg';

const UNIT_TEXT: Record<Exclude<PayUnit, 'a_convenir'>, string> = {
    mes: 'al mes',
    dia: 'por día',
    hora: 'por hora',
    turno: 'por turno',
    evento: 'por evento',
    visita: 'por visita',
    clase: 'por clase',
    proyecto: 'por proyecto',
};

/** CLP con punto de miles y sin decimales: `formatClp(650000)` → «$650.000». */
export function formatClp(n: number): string {
    const digits = String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${n < 0 ? '-' : ''}$${digits}`;
}

export interface AmountUnitOptions {
    /**
     * Unidad del diccionario. Sin unidad, solo el monto: el total de una
     * cotización («$85.000», SystemCard) o el precio de un plan con `suffix`.
     * `a_convenir` = sin monto.
     */
    unit?: PayUnit;
    /**
     * Solo en sueldos y tarifas (`pay_is_net`): `true` «líquidos», `false`
     * «brutos». Sin valor (clases y servicios), no se dice.
     */
    net?: boolean;
    /** Duración de la clase en minutos: «por clase de 60 min». */
    durationMin?: number;
}

/**
 * Lo que va después del monto: «líquidos al mes», «brutos por turno»,
 * «por clase de 60 min», «por visita». Vacío sin unidad o con `a_convenir`.
 */
export function amountUnitText({ unit, net, durationMin }: AmountUnitOptions): string {
    if (!unit || unit === 'a_convenir') return '';
    const basis = net === undefined ? '' : net ? 'líquidos ' : 'brutos ';
    const duration = unit === 'clase' && durationMin ? ` de ${durationMin} min` : '';
    return `${basis}${UNIT_TEXT[unit]}${duration}`;
}

export interface AmountFormatOptions extends AmountUnitOptions {
    /** Monto en CLP. `null` o `a_convenir` = sin monto. */
    value: number | null;
    /**
     * Texto antes del monto, sin el espacio final: «Desde» (precio base de un
     * servicio), «Pretensión:» (tarjeta de persona). Sin monto no se muestra.
     */
    prefix?: string;
    /** Atajo de `prefix="Desde"`: «Desde $25.000 por visita». */
    from?: boolean;
    /**
     * Texto que no sale del diccionario, después del monto (y de la unidad):
     * «por 30 días», «: 1 empleo activo y 3 turnos al mes». Se separa con un
     * espacio, salvo que empiece con un signo de puntuación. Sin monto no se muestra.
     */
    suffix?: string;
    /** Palabra en lugar de la cifra, con el mismo peso: «Gratis» (plan Clásica, `value={0}`). */
    valueText?: string;
    /** Texto sin monto. «Sueldo a convenir» por defecto (empleos); «A convenir» en el resto. */
    negotiableLabel?: string;
}

const STARTS_WITH_PUNCT = /^[\s:;,.)]/;

/** Une el resto con un espacio, salvo que ya empiece con puntuación («: 1 empleo…»). */
function joinSuffix(suffix: string | undefined): string {
    if (!suffix) return '';
    return STARTS_WITH_PUNCT.test(suffix) ? suffix : ` ${suffix}`;
}

/** El texto completo en una línea: «$650.000 líquidos al mes», «Desde $25.000 por visita», «Gratis». */
export function formatAmount({
    value,
    unit,
    net,
    durationMin,
    prefix,
    from,
    suffix,
    valueText,
    negotiableLabel = 'Sueldo a convenir',
}: AmountFormatOptions): string {
    if (value === null || unit === 'a_convenir') return negotiableLabel;
    const lead = prefix ?? (from ? 'Desde' : undefined);
    const rest = amountUnitText({ unit, net, durationMin });
    return `${lead ? `${lead} ` : ''}${valueText ?? formatClp(value)}${rest ? ` ${rest}` : ''}${joinSuffix(suffix)}`;
}

export interface AmountProps extends Omit<ComponentPropsWithRef<'span'>, 'children' | 'prefix'>, AmountFormatOptions {
    /** sm 14 en filas · md 16 en tarjetas · lg 20 en el detalle. */
    size?: AmountSize;
}

/**
 * El único formato de dinero: [prefijo] + monto + «líquidos» o «brutos» (solo
 * sueldos y tarifas) + unidad + [resto]. El mismo monto se ve igual en
 * tarjeta, detalle y perfil; solo cambia el tamaño. Cubre también el total de
 * una cotización (sin unidad), la pretensión («Pretensión: $650.000 líquidos
 * al mes») y el precio de un plan («Gratis», «$14.990 por 30 días»).
 */
export function Amount({
    value,
    unit,
    net,
    durationMin,
    prefix,
    from,
    suffix,
    valueText,
    negotiableLabel = 'Sueldo a convenir',
    size = 'md',
    className,
    ...rest
}: AmountProps) {
    const cls = cx('tl-amount', size !== 'md' && `tl-amount--${size}`, className);
    if (value === null || unit === 'a_convenir') {
        return (
            <span className={cls} {...rest}>
                <span className="tl-amount__value">{negotiableLabel}</span>
            </span>
        );
    }
    const lead = prefix ?? (from ? 'Desde' : undefined);
    const unitText = amountUnitText({ unit, net, durationMin });
    return (
        <span className={cls} {...rest}>
            {lead && `${lead} `}
            <span className="tl-amount__value">{valueText ?? formatClp(value)}</span>
            {unitText && ` ${unitText}`}
            {joinSuffix(suffix)}
        </span>
    );
}

export interface BreakdownItem {
    /** Concepto: «Cambio de llave de paso y flexible», «Cargo de servicio de Talently». */
    label: string;
    amount: number;
}

export interface PaymentBreakdownProps extends Omit<ComponentPropsWithRef<'dl'>, 'children'> {
    /** Un concepto por línea; el cargo de servicio de Talently, si se cobra, va en su propia línea. */
    items: BreakdownItem[];
    total: number;
    totalLabel?: string;
}

/**
 * Desglose de pago (M10): conceptos con su monto a la derecha y el total
 * abajo, separado por un divisor. RES-02 (pagar) y SRV-02 (Pagado, Reembolsado).
 */
export function PaymentBreakdown({ items, total, totalLabel = 'Total', className, ...rest }: PaymentBreakdownProps) {
    return (
        <dl className={cx('tl-breakdown', className)} {...rest}>
            {items.map((item, i) => (
                <div key={`${i}-${item.label}`} className="tl-breakdown__row">
                    <dt>{item.label}</dt>
                    <dd>{formatClp(item.amount)}</dd>
                </div>
            ))}
            <div className="tl-breakdown__row tl-breakdown__row--total">
                <dt>{totalLabel}</dt>
                <dd>{formatClp(total)}</dd>
            </div>
        </dl>
    );
}
