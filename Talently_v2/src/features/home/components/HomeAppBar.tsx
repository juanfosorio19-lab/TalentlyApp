// AppBar large de Inicio: saludo, selector de actor (solo si la persona
// pertenece a una organización) y la campana con su contador real → NOT-01.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../../app/paths';
import { ActorSelector, AppBar, useScrolled } from '../../../ui/AppBar';
import { IconButton } from '../../../ui/IconButton';
import { IconBell } from '../../../ui/icons';
import { useDemoSession } from '../../demo/session';
import { copy } from '../copy';
import { useInbox } from '../inbox';
import { ActorSheet } from './ActorSheet';

/** NOT-01 sabe de dónde se abrió: si una notificación lleva ahí mismo, vuelve en vez de apilar. */
export interface NotificationsEntryState {
    from: string;
}

export function HomeAppBar({ title }: { title: string }) {
    const { actor, switchable } = useDemoSession();
    const { unread } = useInbox();
    const scrolled = useScrolled();
    const navigate = useNavigate();
    const [actorSheet, setActorSheet] = useState(false);
    // switchable = la persona y sus organizaciones: con una sola, no hay entre quiénes cambiar.
    const canSwitch = switchable.length > 1;

    const openNotifications = () => {
        const state: NotificationsEntryState = { from: paths.inicio() };
        navigate(paths.notificaciones(), { state });
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
                                onClick={() => setActorSheet(true)}
                            />
                        )}
                        <IconButton icon={IconBell} label={copy.bell(unread)} count={unread} onClick={openNotifications} />
                    </>
                }
            />
            {canSwitch && <ActorSheet open={actorSheet} onClose={() => setActorSheet(false)} />}
        </>
    );
}
