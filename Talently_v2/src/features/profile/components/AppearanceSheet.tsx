// CFG-01 · Apariencia: Sistema · Claro · Oscuro (spec §5.2). Elegir aplica el
// tema al tiro (ThemeProvider) y cierra la hoja.
import { BottomSheet } from '../../../ui/BottomSheet';
import { RadioGroup } from '../../../ui/Radio';
import { useTheme, type ThemePreference } from '../../../app/providers/ThemeProvider';
import { COPY } from '../copy';

export const THEME_LABEL: Record<ThemePreference, string> = {
    system: COPY.tema.sistema,
    light: COPY.tema.claro,
    dark: COPY.tema.oscuro,
};

export function AppearanceSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { preference, setPreference } = useTheme();
    return (
        <BottomSheet open={open} onClose={onClose} title={COPY.tema.titulo}>
            <RadioGroup<ThemePreference>
                legend={COPY.tema.legend}
                legendHidden
                variant="row"
                value={preference}
                onChange={(next) => {
                    setPreference(next);
                    onClose();
                }}
                options={(['system', 'light', 'dark'] as const).map((p) => ({ value: p, label: THEME_LABEL[p] }))}
            />
        </BottomSheet>
    );
}
