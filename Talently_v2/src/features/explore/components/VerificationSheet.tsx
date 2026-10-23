// Hoja «Verificación de …» (VerificationBadge): qué verificó Talently de quien
// publica o de la persona sugerida. Nunca RUT, fecha de nacimiento ni fotos.
// Vive en la URL (`?sheet=verificacion&publicacion=:id` o `&persona=:id`,
// spec §5.3 regla 3): atrás la cierra y su contenido sale de los datos, nunca
// de un estado que quede viejo. Las insignias de una persona son las de la
// sesión (personVerifications), las mismas que muestra su tarjeta: Matías no
// tiene «Teléfono verificado» hasta que lo verifica en AUTH-08.
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSheet } from '../../../app/sheets';
import { BottomSheet } from '../../../ui/BottomSheet';
import { IconDocument, IconPhone, IconShield, type IconComponent } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import { getPerson, getPublication } from '../../demo/data';
import { useSessionState } from '../../demo/sessionStore';
import type { DemoVerification } from '../../demo/types';
import { copy } from '../copy';
import { withParams } from '../filters';
import { verificationDetail } from '../../demo/verifications';
import { personVerifications } from '../model';

const SHEET = 'verificacion';
/** Los datos de la hoja en la URL: se van con ella al cerrarla. */
const SHEET_PARAMS = ['publicacion', 'persona'] as const;

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
        return p ? { nombre: p.nombre, verificaciones: personVerifications(p) } : null;
    }
    return null;
}

/** Quién y qué insignias: para saber si cambió lo que muestra la hoja. */
const signatureOf = (w: Who) => [w.nombre, ...w.verificaciones.map((v) => `${v.label}:${v.status}`)].join('|');

/** Abre la hoja (push de `?sheet=verificacion…`). */
export function useShowVerification(): (of: VerificationOf) => void {
    const { show } = useSheet(SHEET, SHEET_PARAMS);
    return useCallback((of: VerificationOf) => show({ ...of }), [show]);
}

/** La hoja: una por pantalla. */
export function VerificationSheet() {
    const sheet = useSheet(SHEET, SHEET_PARAMS);
    // Vuelve a pintarse cuando alguien verifica su celular (AUTH-08).
    useSessionState();
    const current = resolve(sheet.param('publicacion'), sheet.param('persona'));
    // Mientras sale (ya sin `?sheet=` en la URL) muestra lo último que mostró.
    const [last, setLast] = useState<Who | null>(current);
    // Se compara por contenido: personVerifications arma una lista nueva en cada render.
    if (current && signatureOf(current) !== (last && signatureOf(last))) {
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
            {who && who.verificaciones.length === 0 ? (
                // Matías antes de AUTH-08 (enlace directo): nada que mostrar todavía, dicho en palabras.
                <p className="body">{copy.verificacion.ninguna(who.nombre)}</p>
            ) : (
                <List flat>
                    {(who?.verificaciones ?? []).map((v) => (
                        <ListItem
                            key={v.label}
                            icon={iconOf(v.label)}
                            title={v.label}
                            sub={verificationDetail(v)}
                        />
                    ))}
                </List>
            )}
            <p className="caption">{copy.verificacion.nota}</p>
        </BottomSheet>
    );
}
