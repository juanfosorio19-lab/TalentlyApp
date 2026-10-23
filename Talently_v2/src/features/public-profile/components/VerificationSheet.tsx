// Hoja «Verificación de …» que abre una VerificationBadge del perfil público:
// qué verificó Talently y cuándo (demo/verifications.verificationDetail, la
// misma fecha de VER-01 y NOT-01), sin RUT, fecha de nacimiento ni fotos.
// src/ui trae la hoja (BottomSheet) pero no este contenido como componente
// compartido (pedido en «requests»).
import { BottomSheet } from '../../../ui/BottomSheet';
import { IconAlert, IconClock, IconInfo, IconShield, type IconComponent } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import type { VerificationStatus } from '../../../ui/VerificationBadge';
import type { DemoVerification } from '../../demo/types';
import { verificationDetail } from '../../demo/verifications';
import { copy } from '../copy';

const STATUS_ICON: Record<VerificationStatus, IconComponent> = {
    verified: IconShield,
    review: IconClock,
    unverified: IconInfo,
    expired: IconAlert,
};

export interface VerificationSheetProps {
    open: boolean;
    onClose: () => void;
    nombre: string;
    verificaciones: readonly DemoVerification[];
}

export function VerificationSheet({ open, onClose, nombre, verificaciones }: VerificationSheetProps) {
    return (
        <BottomSheet open={open} onClose={onClose} title={copy.verificacion.titulo(nombre)}>
            {verificaciones.length === 0 ? (
                <p className="body">{copy.verificacion.ninguna(nombre)}</p>
            ) : (
                <List flat>
                    {verificaciones.map((v) => (
                        <ListItem key={v.label} icon={STATUS_ICON[v.status]} title={v.label} sub={verificationDetail(v)} />
                    ))}
                </List>
            )}
            <p className="caption pp-muted">{copy.verificacion.nota}</p>
        </BottomSheet>
    );
}
