// Hoja «Verificación de …»: qué se verificó y cuándo (README de
// VerificationBadge). Nunca RUT, fecha de nacimiento ni fotos de la cédula.
import { BottomSheet } from '../../../ui/BottomSheet';
import { IconDocument, IconPhone, IconShield, type IconComponent } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import type { DemoActorId, DemoVerification } from '../../demo/types';
import { COPY } from '../copy';
import { VERIFICATION_DETAIL } from '../mock';

function iconOf(label: string): IconComponent {
    if (label.startsWith('Teléfono')) return IconPhone;
    if (label.startsWith('Credencial')) return IconDocument;
    return IconShield;
}

export interface VerificationSheetProps {
    open: boolean;
    onClose: () => void;
    actorId: DemoActorId;
    nombre: string;
    verificaciones: readonly DemoVerification[];
}

export function VerificationSheet({ open, onClose, actorId, nombre, verificaciones }: VerificationSheetProps) {
    const detail = VERIFICATION_DETAIL[actorId] ?? {};
    return (
        <BottomSheet open={open} onClose={onClose} title={COPY.verificacion.titulo(nombre)}>
            <List flat>
                {verificaciones.map((v) => (
                    <ListItem key={v.label} icon={iconOf(v.label)} title={v.label} sub={detail[v.label] ?? v.vence} />
                ))}
            </List>
            <p className="caption prf-muted prf-flush">{COPY.verificacion.nota}</p>
        </BottomSheet>
    );
}
