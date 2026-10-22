// Accesos al pie del perfil (PRF-01 · final): Agregar un perfil, Verificación y
// credenciales (VER-01), Mis perfiles e Impulsa tu perfil (PRF-12, con
// «Pronto»); en la organización (PRF-02), también Equipo y Trabajadores
// favoritos. Todo navega con useOpenPath: lo que aún no tiene pantalla (o
// ruta en paths.ts, pedida en «requests») avisa «Disponible pronto».
import { Badge } from '../../../ui/Badge';
import { IconAdd, IconBoost, IconPeople, IconPerson, IconShield, IconStar, type IconComponent } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import { paths } from '../../../app/paths';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import type { BadgeStatus } from '../../demo/types';

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

/**
 * Pantallas de cada acceso que ya tienen ruta en paths.ts. PRF-04
 * (/perfil/agregar), PRF-05 (/perfil/mis-perfiles), PRF-06 (/o/:id/equipo) y
 * GES-05 (/o/:id/favoritos) aún no la tienen.
 */
const PATH: Partial<Record<ProfileLinkId, () => string>> = {
    verificacion: paths.verificacion,
    impulsa: paths.impulsar,
};

export function ProfileLinks({ links }: { links: readonly ProfileLinkData[] }) {
    const { linkProps, soon } = useOpenPath();

    return (
        <List>
            {links.map((link) => {
                const path = PATH[link.id]?.();
                return (
                    <ListItem
                        key={link.id}
                        icon={ICON[link.id]}
                        title={link.titulo}
                        sub={link.detalle}
                        end={link.badge ? <Badge status={link.badge} /> : undefined}
                        chevron
                        {...(path ? linkProps(path) : { onClick: soon })}
                    />
                );
            })}
        </List>
    );
}
