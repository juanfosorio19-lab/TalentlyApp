// CFG-01 · Apariencia: Sistema · Claro · Oscuro (spec §5.2). Es la hoja del
// sistema para elegir una opción (SheetPicker, sin buscador): un toque,
// Espacio o Enter aplican el tema al tiro (ThemeProvider) y cierran; las
// flechas solo recorren la lista.
import { SheetPicker } from '../../../ui/SheetPicker';
import { useTheme, type ThemePreference } from '../../../app/providers/ThemeProvider';
import { COPY } from '../copy';

export const THEME_LABEL: Record<ThemePreference, string> = {
    system: COPY.tema.sistema,
    light: COPY.tema.claro,
    dark: COPY.tema.oscuro,
};

const OPTIONS = (['system', 'light', 'dark'] as const).map((p) => ({ value: p, label: THEME_LABEL[p] }));

export function AppearanceSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { preference, setPreference } = useTheme();
    return (
        <SheetPicker<ThemePreference>
            open={open}
            onClose={onClose}
            title={COPY.tema.titulo}
            searchable={false}
            options={OPTIONS}
            value={preference}
            onChange={setPreference}
        />
    );
}
