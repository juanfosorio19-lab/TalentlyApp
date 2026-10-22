// SHT-COMUNA (`?sheet=comuna`) y SHT-OFICIO (`?sheet=oficio`): SheetPicker de
// src/ui con buscador, abiertos desde la URL (spec §5.4). Elegir cierra la
// hoja (vuelve atrás en el historial).
import { useSheet } from '../../../app/sheets';
import { JOB_CATEGORY_ICONS } from '../../../ui/CategoryGrid';
import { IconLocation } from '../../../ui/icons';
import { SheetPicker } from '../../../ui/SheetPicker';
import { JOB_CATEGORIES } from '../../../domain/categorias';
import { COMUNAS, type Oficio } from '../catalog';
import { COPY } from '../copy';

export const COMUNA_SHEET = 'comuna';
export const OFICIO_SHEET = 'oficio';

export function ComunaSheet({ value, onChange }: { value: string | null; onChange: (comuna: string) => void }) {
    const sheet = useSheet(COMUNA_SHEET);
    return (
        <SheetPicker
            open={sheet.open}
            onClose={sheet.hide}
            title={COPY.datos.comuna}
            options={COMUNAS}
            value={value}
            onChange={onChange}
            searchPlaceholder={COPY.datos.comunaBuscar}
            groupLabel={COPY.datos.comunaGrupo}
            emptyIcon={IconLocation}
            emptyText={COPY.datos.comunaVacia}
        />
    );
}

/** Nombre de la categoría de un oficio, tal como se muestra («Seguridad»). */
export function categoryName(oficio: Oficio): string {
    return JOB_CATEGORIES.find((c) => c.key === oficio.category)?.name ?? '';
}

export function OficioSheet({ options, onChange }: { options: readonly Oficio[]; onChange: (id: string) => void }) {
    const sheet = useSheet(OFICIO_SHEET);
    return (
        <SheetPicker
            open={sheet.open}
            onClose={sheet.hide}
            title={COPY.trabajo.oficios.hoja}
            options={options.map((o) => ({
                value: o.id,
                label: o.name,
                description: categoryName(o),
                icon: JOB_CATEGORY_ICONS[o.category],
                keywords: o.keywords,
            }))}
            value={null}
            onChange={onChange}
            searchPlaceholder={COPY.trabajo.oficios.buscar}
            emptyText={COPY.trabajo.oficios.vacia}
        />
    );
}
