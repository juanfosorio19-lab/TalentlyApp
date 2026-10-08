import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../cx';
import { IconAlert, IconCheck } from '../icons';
import { Spinner } from '../Spinner';

/** Hay error cuando llega un mensaje (no vacío). */
export function hasFieldError(error: ReactNode): boolean {
    return error != null && error !== false && error !== '';
}

/** Une ids para `aria-describedby` ignorando los vacíos. */
export function describedBy(...ids: Array<string | false | null | undefined>): string | undefined {
    return cx(...ids) || undefined;
}

export interface FieldLabelProps {
    htmlFor: string;
    children: ReactNode;
    /** Agrega «(opcional)». Solo lo opcional se marca; nunca asteriscos. */
    optional?: boolean;
}

/** Etiqueta arriba del campo (Label 13/600), con «(opcional)» si corresponde. */
export function FieldLabel({ htmlFor, children, optional }: FieldLabelProps) {
    return (
        <label className="tl-field__label" htmlFor={htmlFor}>
            {children}
            {optional && (
                <>
                    {' '}
                    <span className="tl-field__opt">(opcional)</span>
                </>
            )}
        </label>
    );
}

export interface FieldFootProps {
    helpId: string;
    errorId: string;
    help?: ReactNode;
    /** Mensaje humano; se ve en lugar de la ayuda cuando la raíz lleva `is-error`. */
    error?: ReactNode;
    /** Contador «120/300» a la derecha (TextArea). */
    count?: ReactNode;
}

/** Pie del campo: ayuda, o error con IconAlert, y contador opcional. */
export function FieldFoot({ helpId, errorId, help, error, count }: FieldFootProps) {
    return (
        <div className="tl-field__foot">
            <span className="tl-field__help" id={helpId}>
                {help}
            </span>
            <span className="tl-field__error" id={errorId}>
                <IconAlert size={16} />
                <span>{error}</span>
            </span>
            {count !== undefined && <span className="tl-field__count">{count}</span>}
        </div>
    );
}

export interface TextFieldProps extends Omit<ComponentPropsWithRef<'input'>, 'children'> {
    /** Etiqueta arriba, en minúsculas salvo la primera letra («RUT», «Correo»). Nunca el placeholder. */
    label: ReactNode;
    /** Marca la etiqueta con «(opcional)». */
    optional?: boolean;
    /** Ayuda abajo en Caption («Con puntos y guion»). Deshabilitado: explica por qué. Cargando: dice qué pasa. */
    help?: ReactNode;
    /** Mensaje humano en lugar de la ayuda («Ingresa un RUT válido»). Puede llevar un `LinkText` de salida. */
    error?: ReactNode;
    /** Validación en vivo (M3): check de 20 en success al final. Solo en datos que se validan mientras se escriben (RUT), nunca en texto libre. */
    valid?: boolean;
    /** Spinner de 16 al final del control; la ayuda dice qué pasa («Validando RUT…»). */
    loading?: boolean;
}

/**
 * Campo de texto de una línea: etiqueta arriba, control de 48 y ayuda o error
 * abajo. `className` va en la raíz `.tl-field`; el resto de las props (con
 * `ref`, `value`, `onChange`) van al `input`.
 */
export function TextField({
    label,
    optional,
    help,
    error,
    valid,
    loading,
    id,
    disabled,
    className,
    'aria-describedby': ariaDescribedBy,
    ...rest
}: TextFieldProps) {
    const autoId = useId();
    const inputId = id ?? autoId;
    const helpId = `${inputId}-h`;
    const errorId = `${inputId}-e`;
    const isError = hasFieldError(error);

    return (
        <div
            className={cx(
                'tl-field',
                isError && 'is-error',
                disabled && 'is-disabled',
                valid && !isError && !loading && 'is-valid',
                className,
            )}
        >
            <FieldLabel htmlFor={inputId} optional={optional}>
                {label}
            </FieldLabel>
            <div className="tl-field__control">
                <input
                    className="tl-field__input"
                    id={inputId}
                    disabled={disabled}
                    aria-invalid={isError || undefined}
                    aria-busy={loading || undefined}
                    aria-describedby={describedBy(isError ? errorId : help ? helpId : undefined, ariaDescribedBy)}
                    {...rest}
                />
                {loading ? (
                    <span className="tl-field__affix">
                        <Spinner size={16} />
                    </span>
                ) : (
                    valid &&
                    !isError && (
                        <span className="tl-field__affix tl-field__valid">
                            <IconCheck size={20} />
                        </span>
                    )
                )}
            </div>
            <FieldFoot helpId={helpId} errorId={errorId} help={help} error={error} />
        </div>
    );
}
