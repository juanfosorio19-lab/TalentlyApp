// «Así te ven» (PRF-01 y PRF-02): avatar, nombre, comuna, insignias reales y
// nota por rol. Las insignias se tocan y abren «Verificación de …».
import { useState, type ReactNode } from 'react';
import { Avatar } from '../../../ui/Avatar';
import { Stack } from '../../../ui/Layout';
import { RatingStars } from '../../../ui/RatingStars';
import { VerificationBadge } from '../../../ui/VerificationBadge';
import type { DemoActorId, DemoProfile } from '../../demo/types';
import { COPY } from '../copy';
import { VerificationSheet } from './VerificationSheet';

export interface AsiTeVenProps {
    actorId: DemoActorId;
    asiTeVen: DemoProfile['asiTeVen'];
    kind: 'person' | 'org';
    /** Bajo las notas (PRF-02: «Ver cómo me ven», que en la persona va junto a «Mis perfiles»). */
    children?: ReactNode;
}

export function AsiTeVen({ actorId, asiTeVen, kind, children }: AsiTeVenProps) {
    const [sheet, setSheet] = useState(false);
    const { nombre, iniciales, comuna, verificaciones, notas } = asiTeVen;
    const verified = verificaciones.some((v) => v.status === 'verified');

    return (
        <Stack gap={2} align="center">
            <span className="overline prf-muted">{COPY.perfil.asiTeVen}</span>
            <Avatar name={nombre} initials={iniciales} kind={kind} size={96} verified={verified} />
            <h2 className="h2 prf-name">{nombre}</h2>
            <span className="body prf-muted">{comuna}</span>
            {verificaciones.length > 0 && (
                <div className="prf-wrap">
                    {verificaciones.map((v) => (
                        <VerificationBadge key={v.label} status={v.status} onClick={() => setSheet(true)}>
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
                open={sheet}
                onClose={() => setSheet(false)}
                actorId={actorId}
                nombre={nombre}
                verificaciones={verificaciones}
            />
        </Stack>
    );
}
