// Celular chileno con el «+56 9» fijo delante (ONB-03). TextField de src/ui
// aún no trae prefijo (pedido en «requests»): mismo marcado `.tl-field` con
// FieldLabel y FieldFoot de la librería.
import { useId, type ReactNode, type Ref } from 'react';
import { cx } from '../../../ui/cx';
import { FieldFoot, FieldLabel, describedBy, hasFieldError } from '../../../ui/TextField';
import { COPY } from '../copy';
import { agruparTelefono, digitosTelefono } from '../model';

export interface PhoneFieldProps {
    /** Los 8 dígitos, sin el prefijo. */
    value: string;
    onChange: (digits: string) => void;
    help?: ReactNode;
    error?: ReactNode;
    inputRef?: Ref<HTMLInputElement>;
}

export function PhoneField({ value, onChange, help, error, inputRef }: PhoneFieldProps) {
    const id = useId();
    const helpId = `${id}-h`;
    const errorId = `${id}-e`;
    const isError = hasFieldError(error);
    return (
        <div className={cx('tl-field', isError && 'is-error')}>
            <FieldLabel htmlFor={id} optional>
                {COPY.datos.telefono}
            </FieldLabel>
            <div className="tl-field__control">
                <span className="tl-field__affix" aria-hidden="true">
                    {COPY.datos.telefonoPrefijo}
                </span>
                <input
                    ref={inputRef}
                    className="tl-field__input"
                    id={id}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder={COPY.datos.telefonoPlaceholder}
                    value={agruparTelefono(value)}
                    onChange={(e) => onChange(digitosTelefono(e.target.value))}
                    aria-invalid={isError || undefined}
                    aria-describedby={describedBy(isError ? errorId : help ? helpId : undefined)}
                />
            </div>
            <FieldFoot helpId={helpId} errorId={errorId} help={help} error={error} />
        </div>
    );
}
