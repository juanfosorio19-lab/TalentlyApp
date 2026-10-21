// Filtros de la bandeja (MSG-01): Todos · Empleo · Turno, de a uno. Marcado
// tl-chipgroup del prototipo con Chip de src/ui: ChipGroup siempre muestra su
// etiqueta y elige varios (pedido en requests: modo de una opción con la
// etiqueta solo para lectores de pantalla).
import { Chip } from '../../../ui/Chip';
import { copy, type InboxFilter } from '../copy';
import { FILTERS } from '../model';

interface TypeFilterProps {
    value: InboxFilter;
    onChange: (next: InboxFilter) => void;
}

export function TypeFilter({ value, onChange }: TypeFilterProps) {
    return (
        <div className="tl-chipgroup" role="group" aria-label={copy.inbox.filtersLabel}>
            <div className="tl-chipgroup__chips">
                {FILTERS.map((f) => (
                    <Chip key={f} selected={f === value} onClick={() => onChange(f)}>
                        {copy.inbox.filters[f]}
                    </Chip>
                ))}
            </div>
        </div>
    );
}
