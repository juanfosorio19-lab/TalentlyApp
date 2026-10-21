// La campana del AppBar large (spec §5.1): contador de no leídas y abre NOT-01.
// Recién registrado, sin contador (como en INI-01-jorge-nuevo). Lo leído en
// NOT-01 vive en home/inbox.ts: hasta que suba a features/demo (pedido en
// requests), esta campana no baja al marcar leídas.
import { useNavigate } from 'react-router-dom';
import { IconButton } from '../../../ui/IconButton';
import { IconBell } from '../../../ui/icons';
import { paths } from '../../../app/paths';
import { useDemoSession } from '../../demo/session';
import { getHomeFeed } from '../../demo/data';
import { copy } from '../copy';
import { useRecienRegistrado } from '../session';

export function NotificationsButton() {
    const navigate = useNavigate();
    const { actor } = useDemoSession();
    const recienRegistrado = useRecienRegistrado(actor.id);
    const unread = getHomeFeed(actor.id, { recienRegistrado }).notificacionesSinLeer;
    return (
        <IconButton
            icon={IconBell}
            label={copy.tab.notifications(unread)}
            count={unread}
            onClick={() => navigate(paths.notificaciones())}
        />
    );
}
