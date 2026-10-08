// «Verificación de …»: lo que abre una VerificationBadge (qué verificó
// Talently). Nunca muestra RUT, fecha de nacimiento ni fotos de la cédula.
import { useState } from 'react';
import { BottomSheet } from '../../../ui/BottomSheet';
import { IconAlert, IconClock, IconInfo, IconShield, type IconComponent } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import type { VerificationStatus } from '../../../ui/VerificationBadge';
import type { DemoAuthor } from '../../demo/types';
import { copy } from '../copy';
import { verificationDetail } from '../mock';

const ICON: Record<VerificationStatus, IconComponent> = {
    verified: IconShield,
    review: IconClock,
    unverified: IconInfo,
    expired: IconAlert,
};

export interface VerificationSheetProps {
    /** Quién: la organización, el hogar o la persona de la tarjeta. `null` = cerrada. */
    author: DemoAuthor | null;
    onClose: () => void;
}

export function VerificationSheet({ author, onClose }: VerificationSheetProps) {
    // Mientras la hoja sale, sigue mostrando a quien mostraba.
    const [last, setLast] = useState(author);
    if (author && author !== last) setLast(author);
    const shown = author ?? last;
    return (
        <BottomSheet open={author !== null} onClose={onClose} title={shown ? copy.verificacion.titulo(shown.nombre) : ''}>
            {shown && (
                <>
                    <List flat className="home-sheet-list">
                        {shown.verificaciones.map((v) => (
                            <ListItem key={v.label} icon={ICON[v.status]} title={v.label} sub={verificationDetail(v)} />
                        ))}
                    </List>
                    <p className="tl-field__help home-sheet-note">{copy.verificacion.nota}</p>
                </>
            )}
        </BottomSheet>
    );
}
