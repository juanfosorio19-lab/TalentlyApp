// Hoja «Verificación de …» que abre una VerificationBadge: qué verificó
// Talently, sin RUT de personas, fecha de nacimiento ni fotos de la cédula.
// src/ui trae la hoja (BottomSheet) pero no este contenido como componente
// compartido (pedido en requests).
import { BottomSheet } from '../../../ui/BottomSheet';
import { IconPhone, IconShield } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import type { DemoVerification } from '../../demo/types';
import { copy } from '../copy';
import { VERIFICATION_DETAIL } from '../mock';
import '../activity.css';

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
                {verifications.map((v) => {
                    const sub = [VERIFICATION_DETAIL[v.label], v.vence].filter(Boolean).join(' · ');
                    return (
                        <ListItem
                            key={v.label}
                            icon={v.label.startsWith('Teléfono') ? IconPhone : IconShield}
                            title={v.label}
                            sub={sub || undefined}
                        />
                    );
                })}
            </List>
            <p className="caption act-muted">{copy.verification.note}</p>
        </BottomSheet>
    );
}
