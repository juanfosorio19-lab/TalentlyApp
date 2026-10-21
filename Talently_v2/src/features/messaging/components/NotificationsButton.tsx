// La campana del AppBar large (spec §5.1): contador real de no leídas de quien
// mira y abre NOT-01.
import { IconButton } from '../../../ui/IconButton';
import { IconBell } from '../../../ui/icons';
import { paths } from '../../../app/paths';
import { getNotifications } from '../../demo/data';
import type { DemoViewerId } from '../../demo/types';
import { copy } from '../copy';
import { useLinks } from '../links';

export function NotificationsButton({ viewerId }: { viewerId: DemoViewerId }) {
    const { go } = useLinks();
    const unread = getNotifications(viewerId).filter((n) => n.sinLeer).length;
    return <IconButton icon={IconBell} label={copy.bell(unread)} count={unread} onClick={() => go(paths.notificaciones())} />;
}
