// Hojas chicas de DET-01: «Verificación de …» (la abre la insignia de quien
// publica) y «Más opciones» (el ⋯ del AppBar). La hoja de verificación es la
// misma de Actividad e Inicio: src/ui no la trae como componente compartido
// (pedido en «requests»).
import { BottomSheet } from '../../../ui/BottomSheet';
import { IconDocument, IconPhone, IconReport, IconShield, type IconComponent } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import type { DemoVerification } from '../../demo/types';
import { copy } from '../copy';
import { VERIFICATION_DETAIL } from '../mock';
import '../publications.css';

function verificationIcon(label: string): IconComponent {
    if (label.startsWith('Teléfono')) return IconPhone;
    if (label.startsWith('Organización') || label.startsWith('Identidad')) return IconShield;
    return IconDocument;
}

export interface VerificationSheetProps {
    open: boolean;
    onClose: () => void;
    /** «Banquetería Rosa SpA». */
    name: string;
    verifications: readonly DemoVerification[];
}

/** Qué verificó Talently, sin RUT, fecha de nacimiento ni fotos de la cédula. */
export function VerificationSheet({ open, onClose, name, verifications }: VerificationSheetProps) {
    return (
        <BottomSheet open={open} onClose={onClose} title={copy.verification.title(name)}>
            <List flat>
                {verifications.map((v) => (
                    <ListItem
                        key={v.label}
                        icon={verificationIcon(v.label)}
                        title={v.label}
                        sub={[VERIFICATION_DETAIL[v.label], v.vence].filter(Boolean).join(' · ') || undefined}
                    />
                ))}
            </List>
            <p className="caption pub-muted">{copy.verification.note}</p>
        </BottomSheet>
    );
}

export interface MoreSheetProps {
    open: boolean;
    onClose: () => void;
    /** «Reportar publicación» (SHT-REPORTE): aún no está construida. */
    onReport: () => void;
}

/** «Más opciones» del detalle: el lugar canónico de «Reportar». */
export function MoreSheet({ open, onClose, onReport }: MoreSheetProps) {
    return (
        <BottomSheet open={open} onClose={onClose} title={copy.more.title}>
            <List flat>
                <ListItem icon={IconReport} title={copy.more.report} sub={copy.more.reportSub} onClick={onReport} />
            </List>
        </BottomSheet>
    );
}
