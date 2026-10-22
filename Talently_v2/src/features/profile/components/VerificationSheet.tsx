// Hoja «Verificación de …»: qué se verificó y cuándo (README de
// VerificationBadge), con las fechas de VER-01. Nunca RUT, fecha de
// nacimiento ni fotos de la cédula; la organización, lo que revisamos de ella.
import { BottomSheet } from '../../../ui/BottomSheet';
import { IconDocument, IconPhone, IconShield, type IconComponent } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import type { DemoVerification } from '../../demo/types';
import { COPY } from '../copy';

function iconOf(label: string): IconComponent {
    if (label.startsWith('Teléfono')) return IconPhone;
    if (label.startsWith('Credencial')) return IconDocument;
    return IconShield;
}

export interface VerificationSheetProps {
    open: boolean;
    onClose: () => void;
    kind: 'person' | 'org';
    nombre: string;
    verificaciones: readonly DemoVerification[];
    /** Insignia → cómo y cuándo se verificó. */
    details: Readonly<Record<string, string>>;
}

export function VerificationSheet({ open, onClose, kind, nombre, verificaciones, details }: VerificationSheetProps) {
    return (
        <BottomSheet open={open} onClose={onClose} title={COPY.verificacion.titulo(nombre)}>
            <List flat className="prf-sheet-list">
                {verificaciones.map((v) => (
                    <ListItem key={v.label} icon={iconOf(v.label)} title={v.label} sub={details[v.label]} />
                ))}
            </List>
            <p className="caption prf-muted prf-sheet-note">{kind === 'org' ? COPY.verificacion.notaOrganizacion : COPY.verificacion.nota}</p>
        </BottomSheet>
    );
}
