// «Así te ven» (PRF-01 y PRF-02): avatar, nombre, comuna, insignias reales y
// nota por rol. Las insignias se tocan y abren «Verificación de …»
// (`?sheet=verificacion`).
import type { ReactNode } from 'react';
import { Avatar } from '../../../ui/Avatar';
import { Stack } from '../../../ui/Layout';
import { RatingStars } from '../../../ui/RatingStars';
import { VerificationBadge } from '../../../ui/VerificationBadge';
import type { DemoProfile } from '../../demo/types';
import { COPY } from '../copy';
import { useStillSheet } from '../useStillSheet';
import { VerificationSheet } from './VerificationSheet';

export interface AsiTeVenProps {
    asiTeVen: DemoProfile['asiTeVen'];
    /** Hoja «Verificación de …»: insignia → cómo y cuándo se verificó (useProfile). */
    details: Readonly<Record<string, string>>;
    kind: 'person' | 'org';
    /** Bajo las notas (PRF-02: «Ver cómo me ven», que en la persona va junto a «Mis perfiles»). */
    children?: ReactNode;
}

export function AsiTeVen({ asiTeVen, details, kind, children }: AsiTeVenProps) {
    const sheet = useStillSheet('verificacion');
    const { nombre, iniciales, foto, comuna, verificaciones, notas } = asiTeVen;
    const verified = verificaciones.some((v) => v.status === 'verified');

    return (
        <Stack gap={2} align="center">
            <span className="overline prf-muted">{COPY.perfil.asiTeVen}</span>
            <Avatar name={nombre} initials={iniciales} photo={foto} kind={kind} size={96} verified={verified} />
            <h2 className="h2 prf-name">{nombre}</h2>
            <span className="body prf-muted">{comuna}</span>
            {verificaciones.length > 0 && (
                <div className="prf-wrap">
                    {verificaciones.map((v) => (
                        <VerificationBadge key={v.label} status={v.status} onClick={() => sheet.show()}>
                            {v.label}
                        </VerificationBadge>
                    ))}
                </div>
            )}
            {notas.length > 0 && (
                <div className="prf-wrap prf-wrap--loose">
                    {notas.map((n) => (
                        <Stack key={n.rol} row gap={2}>
                            <span className="caption prf-muted">{n.rol}</span>
                            <RatingStars value={n.nota?.value ?? null} count={n.nota?.count ?? 0} />
                        </Stack>
                    ))}
                </div>
            )}
            {children}
            <VerificationSheet
                // Sin insignias (un enlace viejo con la hoja abierta) no hay nada que contar.
                open={sheet.open && verificaciones.length > 0}
                onClose={sheet.hide}
                kind={kind}
                nombre={nombre}
                details={details}
                verificaciones={verificaciones}
            />
        </Stack>
    );
}
