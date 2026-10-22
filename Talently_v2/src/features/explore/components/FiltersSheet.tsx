// EXP-06 · Filtros (spec §5.4: `?sheet=filtros`, una variante por segmento).
// BottomSheet «Filtros» con secciones de Chips y, al pie, «Limpiar» (ghost) y
// la primaria con el resultado concreto («Ver 7 turnos»). Lo que se toca es
// un borrador: se aplica solo con el botón del pie (README de BottomSheet);
// cerrar con Cerrar, el velo, el asa o atrás no cambia nada. El borrador se
// toma de los filtros aplicados cada vez que la hoja se ABRE (también si se
// cerró con el atrás del navegador), así nunca muestra lo de la vez anterior.
import { useState, type ReactNode } from 'react';
import type { UrlSheet } from '../../../app/sheets';
import { BottomSheet, SheetSection } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { Chip } from '../../../ui/Chip';
import { copy } from '../copy';
import { useCommitOnClose } from './useCommitOnClose';

export const screenId = 'EXP-06';

export interface FiltersSheetProps<F> {
    /** useSheet('filtros') de la pantalla: `open` y `hide`. */
    sheet: UrlSheet;
    /** Los filtros aplicados (de la URL). */
    applied: F;
    /** «Limpiar»: sin ningún filtro. */
    empty: F;
    /** Aplica el borrador (se llama ya con la hoja cerrada). */
    onApply: (next: F) => void;
    /** «Ver 7 turnos», «Ver 3 empleos»: el resultado del borrador. */
    applyLabel: (draft: F) => string;
    /** Las secciones de la hoja para el borrador. */
    children: (draft: F, setDraft: (next: F) => void) => ReactNode;
}

export function FiltersSheet<F>({ sheet, applied, empty, onApply, applyLabel, children }: FiltersSheetProps<F>) {
    const [draft, setDraft] = useState<F>(applied);
    // Al abrir, el borrador parte de lo aplicado (estado derivado durante el render).
    const [wasOpen, setWasOpen] = useState(sheet.open);
    if (sheet.open !== wasOpen) {
        setWasOpen(sheet.open);
        if (sheet.open) setDraft(applied);
    }
    const applyAfterClose = useCommitOnClose(sheet.open, onApply);

    return (
        <BottomSheet
            open={sheet.open}
            onClose={sheet.hide}
            title={copy.filtros.titulo}
            footer={
                <>
                    <Button variant="ghost" onClick={() => setDraft(empty)}>
                        {copy.filtros.limpiar}
                    </Button>
                    <Button
                        onClick={() => {
                            applyAfterClose(draft);
                            sheet.hide();
                        }}
                    >
                        {applyLabel(draft)}
                    </Button>
                </>
            }
        >
            {children(draft, setDraft)}
        </BottomSheet>
    );
}

export interface ChipSectionOption<T> {
    value: T;
    label: string;
}

export interface ChipSectionProps<T> {
    label: string;
    options: readonly ChipSectionOption<T>[];
    /** Elegidos. */
    value: readonly T[];
    onChange: (next: T[]) => void;
    /** Un solo valor (distancia, nota mínima): tocar el elegido lo quita. */
    single?: boolean;
}

/** Sección de la hoja con Chips filter (como el preview de BottomSheet: «Fecha», «Distancia»). */
export function ChipSection<T extends string | number>({ label, options, value, onChange, single }: ChipSectionProps<T>) {
    const toggle = (v: T) => {
        const on = value.includes(v);
        if (single) onChange(on ? [] : [v]);
        else onChange(options.map((o) => o.value).filter((x) => (x === v ? !on : value.includes(x))));
    };
    return (
        <SheetSection label={label}>
            <div className="tl-chipgroup__chips">
                {options.map((o) => (
                    <Chip key={String(o.value)} selected={value.includes(o.value)} onClick={() => toggle(o.value)}>
                        {o.label}
                    </Chip>
                ))}
            </div>
        </SheetSection>
    );
}
