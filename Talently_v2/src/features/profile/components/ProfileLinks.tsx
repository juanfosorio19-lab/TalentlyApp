// Accesos al pie del perfil (PRF-01 · final): Agregar un perfil, Verificación y
// credenciales (VER-01), Mis perfiles e Impulsa tu perfil (PRF-12, con
// «Pronto»); en la organización (PRF-02), también Equipo y Trabajadores
// favoritos. Todo navega con useOpenPath: lo que aún no tiene pantalla
// (PRF-04, PRF-05, PRF-06, GES-05) avisa «Disponible pronto» y empieza a
// navegar solo cuando el router la tenga.
import { Badge } from '../../../ui/Badge';
import { IconAdd, IconBoost, IconPeople, IconPerson, IconShield, IconStar, type IconComponent } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import { paths } from '../../../app/paths';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { useDemoSession } from '../../demo/session';
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

/** La pantalla de cada acceso (Equipo y Favoritos, de la organización activa). */
const PATH: Record<ProfileLinkId, (actorId: string) => string> = {
    agregar: () => paths.agregarPerfil(),
    verificacion: () => paths.verificacion(),
    'mis-perfiles': () => paths.misPerfiles(),
    impulsa: () => paths.impulsar(),
    equipo: (orgId) => paths.equipo(orgId),
    favoritos: (orgId) => paths.favoritos(orgId),
};

export function ProfileLinks({ links }: { links: readonly ProfileLinkData[] }) {
    const { linkProps } = useOpenPath();
    const { actor } = useDemoSession();

    return (
        <List>
            {links.map((link) => {
                const path = PATH[link.id](actor.id);
                return (
                    <ListItem
                        key={link.id}
                        icon={ICON[link.id]}
                        title={link.titulo}
                        sub={link.detalle}
                        end={link.badge ? <Badge status={link.badge} /> : undefined}
                        chevron
                        {...linkProps(path)}
                    />
                );
            })}
        </List>
    );
}
