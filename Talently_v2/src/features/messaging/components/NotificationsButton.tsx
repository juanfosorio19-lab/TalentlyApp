// La campana del AppBar large (spec §5.1): contador real de no leídas y abre
// NOT-01. Cuenta con useInbox (el mismo de todas las campanas) para el actor
// de la sesión, igual que NOT-01: la cifra de la campana es la que se ve al
// abrirla. En el flujo 10 (?demo=marta) el actor es Marta: campana, NOT-01,
// bandeja y badge de Mensajes son los suyos.
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
    return <IconButton icon={IconBell} label={copy.bell(unread)} count={unread} onClick={openNotifications} />;
}
