// EXP-06 · Filtros (spec §5.4: `?sheet=filtros`, una variante por segmento).
// BottomSheet «Filtros» con secciones de Chips y, al pie, «Limpiar» (ghost) y
// la primaria con el resultado concreto («Ver 7 turnos»). Lo que se toca es
// un borrador: se aplica solo con el botón del pie (README de BottomSheet);
// cerrar con Cerrar, el velo, el asa o atrás no cambia nada.
import { useCallback, useState, type ReactNode } from 'react';
import { BottomSheet, SheetSection } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { Chip } from '../../../ui/Chip';
import { copy } from '../copy';

export const screenId = 'EXP-06';

export interface FiltersDraft<F> {
    open: boolean;
    draft: F;
    setDraft: (next: F) => void;
    /** Abre la hoja con los filtros aplicados como borrador. */
    openSheet: () => void;
    close: () => void;
    /** Aplica el borrador y cierra. */
    apply: () => void;
}

/** Estado de la hoja: abierta, y el borrador que se aplica con el pie. */
export function useFiltersDraft<F>(applied: F, setApplied: (next: F) => void): FiltersDraft<F> {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<F>(applied);
    const openSheet = useCallback(() => {
        setDraft(applied);
        setOpen(true);
    }, [applied]);
    const close = useCallback(() => setOpen(false), []);
    const apply = useCallback(() => {
        setApplied(draft);
        setOpen(false);
    }, [draft, setApplied]);
    return { open, draft, setDraft, openSheet, close, apply };
}

export interface FiltersSheetProps {
    open: boolean;
    onClose: () => void;
    /** Deja el borrador sin filtros (no aplica hasta el botón del pie). */
    onClear: () => void;
    onApply: () => void;
    /** «Ver 7 turnos», «Ver 3 empleos»: el resultado del borrador. */
    applyLabel: string;
    children: ReactNode;
}

export function FiltersSheet({ open, onClose, onClear, onApply, applyLabel, children }: FiltersSheetProps) {
    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title={copy.filtros.titulo}
            footer={
                <>
                    <Button variant="ghost" onClick={onClear}>
                        {copy.filtros.limpiar}
                    </Button>
                    <Button onClick={onApply}>{applyLabel}</Button>
                </>
            }
        >
            {children}
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
