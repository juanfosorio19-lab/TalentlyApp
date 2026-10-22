// AppBar large de la pestaña Perfil (spec §5.1): selector de actor (solo si la
// persona pertenece a una organización), la campana con su contador real y el
// engranaje a Configuración (solo aquí). El selector muestra el nombre
// completo, igual que en Inicio (INI-02).
// Se monta una sola vez para la pestaña (routes.tsx): al cambiar de actor
// sigue en su lugar y el foco vuelve al selector que abrió SHT-ACTOR.
import { ActorSelector, AppBar, useScrolled } from '../../../ui/AppBar';
import { IconButton } from '../../../ui/IconButton';
import { IconBell, IconGear } from '../../../ui/icons';
import { paths } from '../../../app/paths';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { useDemoSession } from '../../demo/session';
import { useInbox } from '../../demo/sessionStore';
import { COPY } from '../copy';
import { useStillSheet } from '../useStillSheet';
import { ActorSheet } from './ActorSheet';

/** NOT-01 sabe de dónde se abrió: si una notificación lleva a Perfil, vuelve en vez de apilar otro. */
interface NotificationsEntryState {
    from: string;
}

export function ProfileAppBar() {
    const scrolled = useScrolled();
    const { open } = useOpenPath();
    const { actor, switchable, recienRegistrado } = useDemoSession();
    // La misma bandeja de todas las campanas y de NOT-01: marcar leídas baja el contador aquí también.
    const { unread } = useInbox(actor.id, recienRegistrado);
    const actorSheet = useStillSheet('actor');
    const canSwitch = switchable.length > 1;

    const openNotifications = () => {
        const state: NotificationsEntryState = { from: paths.perfil() };
        open(paths.notificaciones(), { state });
    };

    return (
        <>
            <AppBar
                title={COPY.perfil.titulo}
                scrolled={scrolled}
                actions={
                    <>
                        {canSwitch && (
                            <ActorSelector
                                name={actor.fullName}
                                kind={actor.kind === 'organizacion' ? 'org' : 'person'}
                                onClick={() => actorSheet.show()}
                            />
                        )}
                        <IconButton
                            icon={IconBell}
                            label={unread > 0 ? `Notificaciones, ${unread} sin leer` : 'Notificaciones'}
                            count={unread}
                            onClick={openNotifications}
                        />
                        <IconButton icon={IconGear} label={COPY.perfil.configuracion} onClick={() => open(paths.configuracion())} />
                    </>
                }
            />
            {canSwitch && <ActorSheet open={actorSheet.open} onClose={actorSheet.hide} />}
        </>
    );
}
