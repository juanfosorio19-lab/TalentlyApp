// Hoja «Verificación de …» que abre una VerificationBadge (TUR-01): qué
// verificó Talently, con el ícono de cada estado (el escudo solo en lo
// verificado) y sin RUT de personas, fecha de nacimiento ni fotos de la
// cédula. src/ui trae la hoja (BottomSheet) pero no este contenido como
// componente compartido (pedido en requests).
import { BottomSheet } from '../../../ui/BottomSheet';
import { IconAlert, IconClock, IconInfo, IconShield, type IconComponent } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import type { VerificationStatus } from '../../../ui/VerificationBadge';
import type { DemoVerification } from '../../demo/types';
import { copy } from '../copy';
import { verificationDetail } from '../../demo/verifications';
import '../activity.css';

const STATUS_ICON: Record<VerificationStatus, IconComponent> = {
    verified: IconShield,
    review: IconClock,
    unverified: IconInfo,
    expired: IconAlert,
};

export interface VerificationSheetProps {
    open: boolean;
    onClose: () => void;
    /** «Banquetería Rosa SpA». */
    name: string;
    verifications: readonly DemoVerification[];
}

export function VerificationSheet({ open, onClose, name, verifications }: VerificationSheetProps) {
    return (
        <BottomSheet open={open} onClose={onClose} title={copy.verification.title(name)}>
            <List flat>
                {verifications.map((v) => (
                    <ListItem key={v.label} icon={STATUS_ICON[v.status]} title={v.label} sub={verificationDetail(v)} />
                ))}
            </List>
            <p className="caption act-muted">{copy.verification.note}</p>
        </BottomSheet>
    );
}
