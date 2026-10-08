// Hoja «Verificación de …» (VerificationBadge): qué verificó Talently de quien
// publica o de la persona sugerida. Nunca RUT, fecha de nacimiento ni fotos.
import { useCallback, useState } from 'react';
import { BottomSheet } from '../../../ui/BottomSheet';
import { IconDocument, IconPhone, IconShield, type IconComponent } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import type { DemoVerification } from '../../demo/types';
import { copy } from '../copy';
import { QUE_SE_VERIFICO } from '../mock';

interface Who {
    open: boolean;
    nombre: string;
    verificaciones: readonly DemoVerification[];
}

function iconOf(label: string): IconComponent {
    if (label.startsWith('Teléfono')) return IconPhone;
    if (label.startsWith('Organización') || label.startsWith('Identidad')) return IconShield;
    return IconDocument;
}

/** La hoja y la función que la abre. La hoja conserva el último contenido mientras se cierra. */
export function useVerificationSheet() {
    const [who, setWho] = useState<Who>({ open: false, nombre: '', verificaciones: [] });
    const open = useCallback(
        (nombre: string, verificaciones: readonly DemoVerification[]) => setWho({ open: true, nombre, verificaciones }),
        [],
    );
    const sheet = (
        <BottomSheet open={who.open} onClose={() => setWho((w) => ({ ...w, open: false }))} title={copy.verificacion.titulo(who.nombre)}>
            <List flat>
                {who.verificaciones.map((v) => (
                    <ListItem
                        key={v.label}
                        icon={iconOf(v.label)}
                        title={v.label}
                        sub={[QUE_SE_VERIFICO[v.label], v.vence && copy.verificacion.vence(v.vence)].filter(Boolean)}
                    />
                ))}
            </List>
            <p className="caption">{copy.verificacion.nota}</p>
        </BottomSheet>
    );
    return [open, sheet] as const;
}
