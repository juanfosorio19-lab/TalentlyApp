// Select de src/ui con su hoja en la URL (spec §5.3 regla 3 y §5.4:
// SHT-OFICIO = ?sheet=oficio): el campo es el mismo Select (su `onClick` con
// preventDefault no abre su hoja local) y la hoja es un SheetPicker abierto
// con useSheet. Así el atrás del navegador o de Android cierra la hoja y no
// saca del asistente. `param` distingue a qué bloque pertenece (?bloque=b1).
// Pedido en «requests» un Select controlado (open/onOpenChange) en src/ui.
import { Select, type SelectSingleProps } from '../../../ui/Select';
import { SheetPicker } from '../../../ui/SheetPicker';
import { useSheet } from '../../../app/sheets';

export interface UrlSelectProps<T extends string> extends Omit<SelectSingleProps<T>, 'multiple' | 'max' | 'onClick'> {
    /** Nombre de la hoja en la URL (`?sheet=<sheet>`). */
    sheet: string;
    /** Parámetro que distingue este campo de otros con la misma hoja (`?bloque=b1`). */
    param?: { key: string; value: string };
}

export function UrlSelect<T extends string = string>({ sheet: name, param, ...props }: UrlSelectProps<T>) {
    const sheet = useSheet(name);
    const open = sheet.open && (!param || sheet.param(param.key) === param.value);
    return (
        <>
            <Select<T>
                {...props}
                aria-expanded={open}
                onClick={(e) => {
                    e.preventDefault();
                    sheet.show(param ? { [param.key]: param.value } : undefined);
                }}
            />
            <SheetPicker<T>
                open={open}
                onClose={sheet.hide}
                title={props.sheetTitle ?? props.label}
                options={props.options}
                value={props.value}
                onChange={props.onChange}
                searchable={props.searchable}
                searchPlaceholder={props.searchPlaceholder}
                groupLabel={props.groupLabel}
                emptyIcon={props.emptyIcon}
                emptyText={props.emptyText}
            />
        </>
    );
}
