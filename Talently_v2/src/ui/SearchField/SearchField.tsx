import { useState, type ComponentPropsWithRef, type MouseEvent } from 'react';
import { cx } from '../cx';
import { IconClose, IconSearch } from '../icons';
import { IconButton } from '../IconButton';
import { Spinner } from '../Spinner';

export interface SearchFieldProps extends Omit<ComponentPropsWithRef<'input'>, 'children' | 'type'> {
    /** Nombre del campo para lectores de pantalla. Por defecto «Buscar». */
    label?: string;
    /** Spinner de 16 donde va el botón borrar, mientras llegan los resultados. */
    loading?: boolean;
    /** Texto oculto mientras carga. Por defecto «Buscando…». */
    loadingLabel?: string;
    /**
     * Se llama al tocar «Borrar búsqueda», después de vaciar el campo. El
     * campo se vacía disparando el `onChange` nativo con valor vacío, así que
     * un campo controlado no necesita este callback para limpiarse.
     */
    onClear?: () => void;
}

/** Vacía el input como si la persona lo hubiera borrado: React recibe un `onChange` real. */
function clearInput(input: HTMLInputElement) {
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setValue?.call(input, '');
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Buscador sin borde (pill de 44 en `color-surface-2`): lupa a la izquierda y,
 * si hay texto, el IconButton «Borrar búsqueda». Sin resultados no es un
 * error: la lista muestra un EmptyState. Funciona controlado (`value` +
 * `onChange` nativo) o no controlado. `className` va en la raíz
 * `.tl-search`; el resto de las props, al `input`.
 *
 * Brecha conocida (bloquea usarlo en EXP-07, SHT-COMUNA, SHT-OFICIO y AYU-01):
 * con texto y foco, Chrome y el WebView de Android suman su propia X nativa
 * (`::-webkit-search-cancel-button`) junto a «Borrar búsqueda». Falta en
 * bundle.css `appearance: none` para `.tl-search__input::-webkit-search-cancel-button`
 * y `::-webkit-search-decoration`; se agrega en el sistema de diseño, no aquí.
 */
export function SearchField({
    label = 'Buscar',
    loading,
    loadingLabel = 'Buscando…',
    onClear,
    disabled,
    value,
    defaultValue,
    onChange,
    className,
    ...rest
}: SearchFieldProps) {
    const [inner, setInner] = useState(() => String(defaultValue ?? ''));
    const text = value !== undefined ? String(value) : inner;

    const clear = (e: MouseEvent<HTMLButtonElement>) => {
        const input = e.currentTarget.parentElement?.querySelector('input');
        if (!input) return;
        clearInput(input);
        input.focus();
        onClear?.();
    };

    return (
        <div
            className={cx('tl-search', disabled && 'is-disabled', loading && 'is-loading', className)}
            role="search"
            aria-busy={loading || undefined}
        >
            <IconSearch />
            <input
                className="tl-search__input"
                type="search"
                enterKeyHint="search"
                aria-label={label}
                disabled={disabled}
                value={text}
                onChange={(e) => {
                    if (value === undefined) setInner(e.target.value);
                    onChange?.(e);
                }}
                {...rest}
            />
            {loading ? (
                <span className="tl-search__end">
                    <Spinner size={16} />
                    <span className="tl-vh">{loadingLabel}</span>
                </span>
            ) : (
                text !== '' && !disabled && <IconButton icon={IconClose} label="Borrar búsqueda" onClick={clear} />
            )}
        </div>
    );
}
