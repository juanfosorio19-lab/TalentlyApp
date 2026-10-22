// Hoja «Verificación de …» (VerificationBadge): qué verificó Talently de quien
// publica o de la persona sugerida. Nunca RUT, fecha de nacimiento ni fotos.
// Vive en la URL (`?sheet=verificacion&publicacion=:id` o `&persona=:id`,
// spec §5.3 regla 3): atrás la cierra y su contenido sale de los datos, nunca
// de un estado que quede viejo.
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSheet } from '../../../app/sheets';
import { BottomSheet } from '../../../ui/BottomSheet';
import { IconDocument, IconPhone, IconShield, type IconComponent } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import { getPerson, getPublication } from '../../demo/data';
import type { DemoVerification } from '../../demo/types';
import { copy } from '../copy';
import { withParams } from '../filters';
import { QUE_SE_VERIFICO } from '../mock';

const SHEET = 'verificacion';

/** De quién: el autor de una publicación o una persona sugerida. */
export type VerificationOf = { publicacion: string } | { persona: string };

interface Who {
    nombre: string;
    verificaciones: readonly DemoVerification[];
}

function iconOf(label: string): IconComponent {
    if (label.startsWith('Teléfono')) return IconPhone;
    if (label.startsWith('Organización') || label.startsWith('Identidad')) return IconShield;
    return IconDocument;
}

function resolve(publicacion: string | null, persona: string | null): Who | null {
    if (publicacion) {
        const autor = getPublication(publicacion)?.autor;
        return autor ? { nombre: autor.nombre, verificaciones: autor.verificaciones } : null;
    }
    if (persona) {
        const p = getPerson(persona);
        return p ? { nombre: p.nombre, verificaciones: p.verificaciones } : null;
    }
    return null;
}

/** Abre la hoja (push de `?sheet=verificacion…`). */
export function useShowVerification(): (of: VerificationOf) => void {
    const { show } = useSheet(SHEET);
    return useCallback((of: VerificationOf) => show({ ...of }), [show]);
}

/** La hoja: una por pantalla. */
export function VerificationSheet() {
    const sheet = useSheet(SHEET);
    const current = resolve(sheet.param('publicacion'), sheet.param('persona'));
    // Mientras sale (ya sin `?sheet=` en la URL) muestra lo último que mostró.
    const [last, setLast] = useState<Who | null>(current);
    if (current && current !== last && (current.nombre !== last?.nombre || current.verificaciones !== last.verificaciones)) {
        setLast(current);
    }
    const who = current ?? last;

    // Si se llegó con la hoja en la URL (enlace), cerrarla quita `?sheet=` pero no sus datos: se quitan aquí.
    const [params, setParams] = useSearchParams();
    const leftover = !sheet.open && (params.has('publicacion') || params.has('persona'));
    useEffect(() => {
        if (!leftover) return;
        setParams(
            (prev) =>
                withParams(prev, (p) => {
                    p.delete('publicacion');
                    p.delete('persona');
                }),
            { replace: true, preventScrollReset: true },
        );
    }, [leftover, setParams]);

    return (
        <BottomSheet open={sheet.open && who !== null} onClose={sheet.hide} title={copy.verificacion.titulo(who?.nombre ?? '')}>
            <List flat>
                {(who?.verificaciones ?? []).map((v) => (
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
}
