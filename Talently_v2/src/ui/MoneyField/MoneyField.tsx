import { useId, useState, type ChangeEvent, type ComponentPropsWithRef, type ReactNode } from 'react';
import { amountUnitText, formatClp, type PayUnit } from '../Amount';
import { cx } from '../cx';
import { IconChevronDown } from '../icons';
import { SheetPicker } from '../SheetPicker';
import { FieldFoot, FieldLabel, describedBy, hasFieldError } from '../TextField';

/** El diccionario de unidades, en su orden (MoneyField/README.md). */
export const PAY_UNITS: readonly PayUnit[] = ['mes', 'dia', 'hora', 'turno', 'evento', 'visita', 'clase', 'proyecto', 'a_convenir'];

/** Cómo se lee la unidad en el campo y en la hoja: «al mes», «por turno», «A convenir». */
export function payUnitLabel(unit: PayUnit): string {
    return amountUnitText({ unit }) || 'A convenir';
}

/** Hasta 9.999.999.999: más dígitos no son un monto real. */
const MAX_DIGITS = 10;

/** Monto con punto de miles y sin «$» (el prefijo va aparte): 650000 → «650.000». */
function groupThousands(n: number): string {
    return formatClp(n).replace('$', '');
}

export interface MoneyFieldProps
    extends Omit<ComponentPropsWithRef<'input'>, 'value' | 'defaultValue' | 'onChange' | 'children' | 'type'> {
    /** Dice si es líquido o bruto: «Sueldo líquido», «Tarifa por turno», «Valor de la clase». */
    label: ReactNode;
    /** Marca la etiqueta con «(opcional)». */
    optional?: boolean;
    /** Monto en CLP, sin decimales; `null` = vacío. */
    value: number | null;
    /** En cada tecla, con el monto ya limpio (sin puntos). */
    onChange: (next: number | null) => void;
    /**
     * Unidad elegida. Con `a_convenir` no hay monto: el campo queda vacío
     * («Sin monto»), de solo lectura, y no se escribe.
     */
    unit: PayUnit;
    /**
     * Al elegir en la hoja. Al pasar a `a_convenir` con monto, antes llega
     * `onChange(null)`: esta es la última llamada y trae el estado final, así
     * que un padre que guarda `{ amount, unit }` junto no la pisa.
     */
    onUnitChange: (next: PayUnit) => void;
    /** Unidades que se ofrecen en la hoja; por defecto, todo el diccionario. */
    units?: readonly PayUnit[];
    /** Ayuda abajo: qué significa el monto («Lo que se recibe en mano, después de descuentos.»). */
    help?: ReactNode;
    /** Mensaje humano en lugar de la ayuda («Ingresa el sueldo líquido»). */
    error?: ReactNode;
    /** Título H2 de la hoja de unidades. */
    unitSheetTitle?: string;
    /** Solo para el catálogo: `is-pressed` o `is-focus` en el botón de unidad. */
    unitClassName?: string;
    /** `false`: la hoja de unidades se dibuja en su lugar (catálogo, marcos de 390). */
    portal?: boolean;
}

/**
 * Campo de monto en CLP: prefijo «$», separador de miles mientras se escribe
 * (650.000) y la unidad como botón al final, que abre un SheetPicker con el
 * diccionario. `className` va en la raíz `.tl-field`; el resto de las props
 * nativas (`ref`, `name`, `onBlur`…) van al `input`.
 */
export function MoneyField({
    label,
    optional,
    value,
    onChange,
    unit,
    onUnitChange,
    units = PAY_UNITS,
    help,
    error,
    unitSheetTitle = 'Unidad',
    unitClassName,
    portal,
    id,
    disabled,
    readOnly,
    placeholder = '0',
    className,
    'aria-describedby': ariaDescribedBy,
    ...rest
}: MoneyFieldProps) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const helpId = `${inputId}-h`;
    const errorId = `${inputId}-e`;
    const [open, setOpen] = useState(false);
    const isError = hasFieldError(error);
    const negotiable = unit === 'a_convenir';
    const unitText = payUnitLabel(unit);

    // Se reescribe el texto en el mismo evento (con el cursor donde estaba,
    // contando dígitos), así React no lo mueve al final al poner los puntos.
    const onInput = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.currentTarget;
        const raw = input.value;
        const caret = input.selectionStart ?? raw.length;
        const allDigits = raw.replace(/\D/g, '');
        const zeros = (allDigits.match(/^0+(?=\d)/)?.[0] ?? '').length;
        const digits = allDigits.slice(zeros);
        if (digits.length > MAX_DIGITS) {
            // Lleno: se rechaza lo escrito (o pegado) en vez de recortar el
            // monto por el final; el texto y el cursor vuelven a como estaban.
            const prev = value === null ? '' : groupThousands(value);
            const back = Math.min(prev.length, Math.max(0, caret - (raw.length - prev.length)));
            input.value = prev;
            input.setSelectionRange(back, back);
            return;
        }
        const next = digits === '' ? null : Number(digits);
        const text = next === null ? '' : groupThousands(next);
        let keep = Math.max(0, raw.slice(0, caret).replace(/\D/g, '').length - zeros);
        let pos = 0;
        while (pos < text.length && keep > 0) {
            if (/\d/.test(text.charAt(pos))) keep--;
            pos++;
        }
        input.value = text;
        input.setSelectionRange(pos, pos);
        onChange(next);
    };

    // El monto se borra antes y la unidad va al final: si el padre guarda los
    // dos juntos y copia el valor anterior en cada llamada, gana el último.
    const chooseUnit = (next: PayUnit) => {
        if (next === 'a_convenir' && value !== null) onChange(null);
        onUnitChange(next);
    };

    return (
        <>
            <div className={cx('tl-field tl-money', isError && 'is-error', disabled && 'is-disabled', className)}>
                <FieldLabel htmlFor={inputId} optional={optional}>
                    {label}
                </FieldLabel>
                <div className="tl-field__control">
                    {!negotiable && (
                        <span className="tl-field__affix" aria-hidden="true">
                            $
                        </span>
                    )}
                    <input
                        className="tl-field__input"
                        id={inputId}
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder={negotiable ? 'Sin monto' : placeholder}
                        value={negotiable || value === null ? '' : groupThousands(value)}
                        onChange={onInput}
                        disabled={disabled}
                        // A convenir: sin monto, pero no deshabilitado (se ve y se enfoca como un
                        // campo; el lector dice «solo lectura» y el placeholder «Sin monto»).
                        readOnly={readOnly || negotiable}
                        aria-invalid={isError || undefined}
                        aria-describedby={describedBy(isError ? errorId : help ? helpId : undefined, ariaDescribedBy)}
                        {...rest}
                    />
                    <button
                        type="button"
                        className={cx('tl-money__unit', unitClassName)}
                        aria-label={`Unidad: ${unitText}`}
                        aria-haspopup="dialog"
                        aria-expanded={open}
                        disabled={disabled}
                        onClick={() => setOpen(true)}
                    >
                        {unitText}
                        <IconChevronDown size={20} />
                    </button>
                </div>
                <FieldFoot helpId={helpId} errorId={errorId} help={help} error={error} />
            </div>
            <SheetPicker<PayUnit>
                open={open}
                onClose={() => setOpen(false)}
                title={unitSheetTitle}
                options={units.map((u) => ({ value: u, label: payUnitLabel(u) }))}
                value={unit}
                onChange={chooseUnit}
                searchPlaceholder="Buscar unidad"
                portal={portal}
            />
        </>
    );
}
