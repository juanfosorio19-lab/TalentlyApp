// AppBar large de Inicio: saludo, selector de actor (solo si la persona
// pertenece a una organización) y la campana con su contador real → NOT-01.
import { useOpenNotifications } from '../../../app/navigation/notifications';
import { useSheet } from '../../../app/sheets';
import { ActorSelector, AppBar, useScrolled } from '../../../ui/AppBar';
import { IconButton } from '../../../ui/IconButton';
import { IconBell } from '../../../ui/icons';
import { useDemoSession } from '../../demo/session';
import { useInbox } from '../../demo/sessionStore';
import { copy } from '../copy';
import { ActorSheet } from './ActorSheet';

export function HomeAppBar({ title }: { title: string }) {
    const { actor, switchable, recienRegistrado } = useDemoSession();
    const { unread } = useInbox(actor.id, recienRegistrado);
    const scrolled = useScrolled();
    // SHT-ACTOR es `?sheet=actor` (spec §5.4): atrás la cierra.
    const actorSheet = useSheet('actor');
    const showActorSheet = () => actorSheet.show();
    // switchable = la persona y sus organizaciones: con una sola, no hay entre quiénes cambiar.
    const canSwitch = switchable.length > 1;

    // NOT-01 sabe de dónde se abrió: si una notificación lleva aquí mismo, vuelve en vez de apilar.
    const openNotifications = useOpenNotifications();

    return (
        <>
            <AppBar
                title={title}
                scrolled={scrolled}
                actions={
                    <>
                        {canSwitch && (
                            <ActorSelector
                                name={actor.fullName}
                                kind={actor.kind === 'organizacion' ? 'org' : 'person'}
                                onClick={showActorSheet}
                            />
                        )}
                        <IconButton icon={IconBell} label={copy.bell(unread)} count={unread} onClick={openNotifications} />
                    </>
                }
            />
            {canSwitch && <ActorSheet open={actorSheet.open} onClose={actorSheet.hide} />}
        </>
    );
}
