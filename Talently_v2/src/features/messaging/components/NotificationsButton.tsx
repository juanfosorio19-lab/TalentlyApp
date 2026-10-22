// La campana del AppBar large (spec §5.1): contador real de no leídas de quien
// mira (useInbox, el mismo de todas las campanas y de NOT-01) y abre NOT-01.
import { IconButton } from '../../../ui/IconButton';
import { IconBell } from '../../../ui/icons';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useInbox } from '../../demo/sessionStore';
import type { DemoViewerId } from '../../demo/types';
import { copy } from '../copy';

interface NotificationsButtonProps {
    viewerId: DemoViewerId;
    recienRegistrado: boolean;
}

export function NotificationsButton({ viewerId, recienRegistrado }: NotificationsButtonProps) {
    const { open } = useOpenPath();
    const { unread } = useInbox(viewerId, recienRegistrado);
    return <IconButton icon={IconBell} label={copy.bell(unread)} count={unread} onClick={() => open(paths.notificaciones())} />;
}
