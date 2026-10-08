import { useId, useState, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../cx';
import { IconChevronDown, type IconComponent } from '../icons';
import { SheetPicker, type SheetPickerOption } from '../SheetPicker';
import { Spinner } from '../Spinner';
import { FieldFoot, describedBy, hasFieldError } from '../TextField';

interface SelectBaseProps<T extends string>
    extends Omit<ComponentPropsWithRef<'button'>, 'value' | 'defaultValue' | 'onChange' | 'children' | 'type'> {
    /** Etiqueta arriba («Comuna», «Rubro», «Nivel»). Es también el título de la hoja, salvo `sheetTitle`. */
    label: ReactNode;
    /** Marca la etiqueta con «(opcional)». */
    optional?: boolean;
    /** Sin valor, en imperativo: «Elige tu comuna». */
    placeholder: string;
    options: readonly SheetPickerOption<T>[];
    /** Ayuda abajo en Caption. Deshabilitado: explica por qué. */
    help?: ReactNode;
    /** Mensaje humano en lugar de la ayuda («Elige una comuna»). */
    error?: ReactNode;
    /** Mientras llegan las opciones: el texto de `loadingLabel` y spinner de 16 en lugar del chevron. */
    loading?: boolean;
    /** «Cargando comunas…». */
    loadingLabel?: string;
    /** Título H2 de la hoja, si no es la etiqueta. */
    sheetTitle?: ReactNode;
    /** Buscador de la hoja. Por defecto, sí: las listas largas se eligen buscando. */
    searchable?: boolean;
    /** «Buscar comuna». */
    searchPlaceholder?: string;
    /** Rótulo sobre la lista completa («Región Metropolitana · 52 comunas»). */
    groupLabel?: string;
    /** Ícono del «sin resultados» de la hoja. */
    emptyIcon?: IconComponent;
    /** Qué probar cuando la búsqueda no encuentra nada. */
    emptyText?: ReactNode;
    /** `false`: la hoja se dibuja en su lugar (catálogo, marcos de 390). */
    portal?: boolean;
}

export interface SelectSingleProps<T extends string = string> extends SelectBaseProps<T> {
    multiple?: false;
    value: T | null;
    onChange: (next: T) => void;
    max?: undefined;
}

export interface SelectMultipleProps<T extends string = string> extends SelectBaseProps<T> {
    /** Elección múltiple (asignaturas): el campo muestra lo elegido separado por comas. */
    multiple: true;
    value: readonly T[];
    onChange: (next: T[]) => void;
    /** Máximo elegible («2 de 3» en la hoja). */
    max?: number;
}

export type SelectProps<T extends string = string> = SelectSingleProps<T> | SelectMultipleProps<T>;

/**
 * Campo de elección: se ve como un TextField con chevron y, al tocarlo, abre
 * un SheetPicker con buscador. `className` va en la raíz `.tl-field`; el resto
 * de las props nativas (`ref`, `id`, `aria-*`, `onClick`…) van al botón.
 * Un `onClick` que llama `preventDefault()` no abre la hoja.
 */
export function Select<T extends string = string>(props: SelectProps<T>) {
    const {
        label,
        optional,
        placeholder,
        options,
        help,
        error,
        loading,
        loadingLabel = 'Cargando…',
        sheetTitle,
        searchable,
        searchPlaceholder,
        groupLabel,
        emptyIcon,
        emptyText,
        portal,
        id,
        disabled,
        className,
        onClick,
        'aria-describedby': ariaDescribedBy,
        multiple,
        value,
        onChange,
        max,
        ...rest
    } = props;

    const autoId = useId();
    const baseId = id ?? autoId;
    const labelId = `${baseId}-l`;
    const valueId = `${baseId}-v`;
    const helpId = `${baseId}-h`;
    const errorId = `${baseId}-e`;
    const [open, setOpen] = useState(false);
    const isError = hasFieldError(error);

    const chosen = multiple ? options.filter((o) => value.includes(o.value)) : options.filter((o) => o.value === value);
    const shown = loading ? loadingLabel : chosen.length > 0 ? chosen.map((o) => o.label).join(', ') : placeholder;

    const sheet = {
        open,
        onClose: () => setOpen(false),
        title: sheetTitle ?? label,
        options,
        searchable,
        searchPlaceholder,
        groupLabel,
        emptyIcon,
        emptyText,
        portal,
    };

    return (
        <>
            <div className={cx('tl-field tl-select', isError && 'is-error', disabled && 'is-disabled', className)}>
                <span className="tl-field__label" id={labelId}>
                    {label}
                    {optional && (
                        <>
                            {' '}
                            <span className="tl-field__opt">(opcional)</span>
                        </>
                    )}
                </span>
                <button
                    type="button"
                    id={id}
                    className="tl-field__control tl-select__control"
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    aria-labelledby={`${labelId} ${valueId}`}
                    aria-invalid={isError || undefined}
                    aria-busy={loading || undefined}
                    aria-describedby={describedBy(isError ? errorId : help ? helpId : undefined, ariaDescribedBy)}
                    disabled={disabled}
                    onClick={(e) => {
                        onClick?.(e);
                        // Mientras cargan las opciones no hay nada que elegir.
                        if (!e.defaultPrevented && !loading) setOpen(true);
                    }}
                    {...rest}
                >
                    <span id={valueId} className={cx('tl-select__value', (loading || chosen.length === 0) && 'is-placeholder')}>
                        {shown}
                    </span>
                    {loading ? (
                        <span className="tl-field__affix">
                            <Spinner size={16} />
                        </span>
                    ) : (
                        <IconChevronDown />
                    )}
                </button>
                <FieldFoot helpId={helpId} errorId={errorId} help={help} error={error} />
            </div>
            {multiple ? (
                <SheetPicker<T> {...sheet} multiple value={value} onChange={onChange} max={max} />
            ) : (
                <SheetPicker<T> {...sheet} value={value} onChange={onChange} />
            )}
        </>
    );
}
