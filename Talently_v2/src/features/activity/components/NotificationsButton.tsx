// La campana del AppBar large (spec §5.1): contador real de no leídas y abre NOT-01.
import { useNavigate } from 'react-router-dom';
import { IconButton } from '../../../ui/IconButton';
import { IconBell } from '../../../ui/icons';
import { paths } from '../../../app/paths';
import { useDemoSession } from '../../demo/session';
import { getHomeFeed } from '../../demo/data';
import { copy } from '../copy';

export function NotificationsButton() {
    const navigate = useNavigate();
    const { actor } = useDemoSession();
    const unread = getHomeFeed(actor.id).notificacionesSinLeer;
    return (
        <IconButton
            icon={IconBell}
            label={copy.tab.notifications(unread)}
            count={unread}
            onClick={() => navigate(paths.notificaciones())}
        />
    );
}
