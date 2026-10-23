// Hoja «Verificación de …» que abre una VerificationBadge de un postulante
// (GES-02): qué verificó Talently, sin RUT, fecha de nacimiento ni fotos de
// la cédula. src/ui trae la hoja pero no este contenido como componente
// compartido (pedido en requests).
import { useState } from 'react';
import { BottomSheet } from '../../../ui/BottomSheet';
import { IconAlert, IconClock, IconInfo, IconShield, type IconComponent } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import type { VerificationStatus } from '../../../ui/VerificationBadge';
import type { DemoApplicant } from '../../demo/types';
import { verificationDetail } from '../../demo/verifications';
import { copy } from '../copy';

const ICON: Record<VerificationStatus, IconComponent> = {
    verified: IconShield,
    review: IconClock,
    unverified: IconInfo,
    expired: IconAlert,
};

export interface VerificationSheetProps {
    /** A quién (`?sheet=verificacion&p=…`): `null` = cerrada. */
    person: DemoApplicant | null;
    onClose: () => void;
}

export function VerificationSheet({ person, onClose }: VerificationSheetProps) {
    // Mientras la hoja sale, sigue mostrando a quien mostraba.
    const [last, setLast] = useState(person);
    if (person && person.personId !== last?.personId) setLast(person);
    const shown = person ?? last;
    return (
        <BottomSheet open={person !== null} onClose={onClose} title={shown ? copy.common.verificationTitle(shown.nombre) : ''}>
            {shown && (
                <>
                    <List flat>
                        {shown.verificaciones.map((v) => (
                            <ListItem
                                key={v.label}
                                icon={ICON[v.status]}
                                title={v.label}
                                sub={verificationDetail(v)}
                            />
                        ))}
                    </List>
                    <p className="caption manage-muted">{copy.common.verificationNote}</p>
                </>
            )}
        </BottomSheet>
    );
}
