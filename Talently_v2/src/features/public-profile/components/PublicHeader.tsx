// Encabezado del perfil público, el mismo «Así te ven» de PRF-01 y PRF-02:
// avatar, nombre (el H1 de la pantalla), comuna, insignias reales (abren
// «Verificación de …», `?sheet=verificacion`) y la nota. El overline «Así te
// ven» solo cuando quien mira es el dueño del perfil.
import type { ReactNode } from 'react';
import { useSheet } from '../../../app/sheets';
import { Avatar } from '../../../ui/Avatar';
import { Stack } from '../../../ui/Layout';
import { VerificationBadge } from '../../../ui/VerificationBadge';
import type { DemoVerification } from '../../demo/types';
import { copy } from '../copy';
import { VerificationSheet } from './VerificationSheet';

export interface PublicHeaderProps {
    nombre: string;
    iniciales: string;
    foto?: string | null;
    kind: 'person' | 'org';
    /** «Maipú»; en una organización, también su rubro. */
    lineas: readonly string[];
    verificaciones: readonly DemoVerification[];
    /** Quien mira es el dueño: «Así te ven». */
    own: boolean;
    /** Nota por rol, bajo las insignias. */
    children?: ReactNode;
}

export function PublicHeader({ nombre, iniciales, foto, kind, lineas, verificaciones, own, children }: PublicHeaderProps) {
    const sheet = useSheet('verificacion');
    const verified = verificaciones.some((v) => v.status === 'verified');
    return (
        <Stack gap={2} align="center">
            {own && <span className="overline pp-muted">{copy.asiTeVen}</span>}
            <Avatar name={nombre} initials={iniciales} photo={foto ?? undefined} kind={kind} size={96} verified={verified} />
            <h1 className="h2 pp-name">{nombre}</h1>
            {lineas.map((l) => (
                <span key={l} className="body pp-muted pp-center">
                    {l}
                </span>
            ))}
            {verificaciones.length > 0 && (
                <div className="pp-wrap">
                    {verificaciones.map((v) => (
                        <VerificationBadge key={v.label} status={v.status} aria-haspopup="dialog" onClick={() => sheet.show()}>
                            {v.label}
                        </VerificationBadge>
                    ))}
                </div>
            )}
            {children}
            <VerificationSheet
                // Sin insignias (un enlace con la hoja abierta) no hay nada que contar.
                open={sheet.open && verificaciones.length > 0}
                onClose={sheet.hide}
                nombre={nombre}
                verificaciones={verificaciones}
            />
        </Stack>
    );
}
