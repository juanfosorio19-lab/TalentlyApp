// AppBar large de Inicio: saludo, selector de actor (solo si la persona
// pertenece a una organización) y la campana con su contador real → NOT-01.
import { useSheet } from '../../../app/sheets';
import { paths } from '../../../app/paths';
import { ActorSelector, AppBar, useScrolled } from '../../../ui/AppBar';
import { IconButton } from '../../../ui/IconButton';
import { IconBell } from '../../../ui/icons';
import { useDemoSession } from '../../demo/session';
import { useInbox } from '../../demo/sessionStore';
import { copy } from '../copy';
import { useHomeNavigation, useKeepScroll } from '../navigation';
import { ActorSheet } from './ActorSheet';

/** NOT-01 sabe de dónde se abrió: si una notificación lleva ahí mismo, vuelve en vez de apilar. */
export interface NotificationsEntryState {
    from: string;
}

export function HomeAppBar({ title }: { title: string }) {
    const { actor, switchable, recienRegistrado } = useDemoSession();
    const { unread } = useInbox(actor.id, recienRegistrado);
    const scrolled = useScrolled();
    const { go } = useHomeNavigation();
    // SHT-ACTOR es `?sheet=actor` (spec §5.4): atrás la cierra.
    const actorSheet = useSheet('actor');
    // Abrir la hoja no mueve la página de abajo.
    const showActorSheet = useKeepScroll()(() => actorSheet.show());
    // switchable = la persona y sus organizaciones: con una sola, no hay entre quiénes cambiar.
    const canSwitch = switchable.length > 1;

    const openNotifications = () => {
        const state: NotificationsEntryState = { from: paths.inicio() };
        go(paths.notificaciones(), { state });
    };

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
