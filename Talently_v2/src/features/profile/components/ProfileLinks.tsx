// Accesos al pie del perfil (PRF-01 · final): Agregar un perfil, Verificación y
// credenciales, Mis perfiles e Impulsa tu perfil (con «Pronto»).
import type { MouseEvent } from 'react';
import { useHref, useNavigate } from 'react-router-dom';
import { Badge } from '../../../ui/Badge';
import { IconAdd, IconBoost, IconPeople, IconPerson, IconShield, IconStar, type IconComponent } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import { paths } from '../../../app/paths';
import type { BadgeStatus } from '../../demo/types';
import { profilePaths } from '../paths';
import { useOpenRoute, useSoon } from '../useOpenRoute';

export type ProfileLinkId = 'agregar' | 'verificacion' | 'mis-perfiles' | 'impulsa' | 'equipo' | 'favoritos';

export interface ProfileLinkData {
    id: ProfileLinkId;
    titulo: string;
    detalle: string;
    badge?: BadgeStatus;
}

const ICON: Record<ProfileLinkId, IconComponent> = {
    agregar: IconAdd,
    verificacion: IconShield,
    'mis-perfiles': IconPerson,
    impulsa: IconBoost,
    equipo: IconPeople,
    favoritos: IconStar,
};

export function ProfileLinks({ links }: { links: readonly ProfileLinkData[] }) {
    const navigate = useNavigate();
    const openRoute = useOpenRoute();
    const soon = useSoon();
    const impulsarHref = useHref(profilePaths.impulsar());

    return (
        <List>
            {links.map((link) => {
                const common = {
                    icon: ICON[link.id],
                    title: link.titulo,
                    sub: link.detalle,
                    end: link.badge ? <Badge status={link.badge} /> : undefined,
                    chevron: true,
                };
                if (link.id === 'impulsa') {
                    return (
                        <ListItem
                            key={link.id}
                            {...common}
                            href={impulsarHref}
                            onClick={(e: MouseEvent<HTMLElement>) => {
                                e.preventDefault();
                                navigate(profilePaths.impulsar());
                            }}
                        />
                    );
                }
                const onClick = link.id === 'verificacion' ? () => openRoute(paths.verificacion()) : () => soon();
                return <ListItem key={link.id} {...common} onClick={onClick} />;
            })}
        </List>
    );
}
