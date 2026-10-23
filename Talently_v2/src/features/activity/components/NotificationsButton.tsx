// La campana del AppBar large (spec §5.1): contador real de no leídas, el
// mismo de todas las campanas (useInbox de demo/sessionStore: baja al leer en
// NOT-01) y abre NOT-01. Recién registrado, sin contador (INI-01-jorge-nuevo).
import { IconButton } from '../../../ui/IconButton';
import { IconBell } from '../../../ui/icons';
import { useOpenNotifications } from '../../../app/navigation/notifications';
import { useDemoSession } from '../../demo/session';
import { useInbox } from '../../demo/sessionStore';
import { copy } from '../copy';

export function NotificationsButton() {
    const openNotifications = useOpenNotifications();
    const { actor, recienRegistrado } = useDemoSession();
    const { unread } = useInbox(actor.id, recienRegistrado);
    return (
        <IconButton
            icon={IconBell}
            label={copy.tab.notifications(unread)}
            count={unread}
            // NOT-01 sabe de dónde se abrió (como desde Inicio): una notificación que lleva aquí mismo vuelve.
            onClick={openNotifications}
        />
    );
}
