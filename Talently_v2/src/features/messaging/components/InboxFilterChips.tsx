// Filtros de la bandeja (MSG-01), de a uno: Todos · Empleo · Turno para una
// persona; Todos y cada publicación para una organización (spec §5.2).
// Marcado tl-chipgroup del prototipo con Chip de src/ui: ChipGroup siempre
// muestra su etiqueta y elige varios (pedido en requests: modo de una opción
// con la etiqueta solo para lectores de pantalla).
import type { Ref } from 'react';
import { Chip } from '../../../ui/Chip';
import { ALL, type InboxFilters } from '../model';

interface InboxFilterChipsProps {
    filters: InboxFilters;
    value: string;
    onChange: (next: string) => void;
    /** El chip «Todos»: recibe el foco cuando desaparece el botón que vació el filtro. */
    allRef?: Ref<HTMLButtonElement>;
}

export function InboxFilterChips({ filters, value, onChange, allRef }: InboxFilterChipsProps) {
    return (
        <div className="tl-chipgroup" role="group" aria-label={filters.label}>
            <div className="tl-chipgroup__chips">
                {filters.options.map((o) => (
                    <Chip
                        key={o.value}
                        ref={o.value === ALL ? allRef : undefined}
                        selected={o.value === value}
                        onClick={() => onChange(o.value)}
                    >
                        {o.label}
                    </Chip>
                ))}
            </div>
        </div>
    );
}
