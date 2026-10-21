// AppBar large de la pestaña Perfil (spec §5.1): selector de actor (solo si la
// persona pertenece a una organización), la campana con su contador real y el
// engranaje a Configuración (solo aquí). El selector muestra el nombre
// completo, igual que en Inicio (INI-02).
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActorSelector, AppBar, useScrolled } from '../../../ui/AppBar';
import { IconButton } from '../../../ui/IconButton';
import { IconBell, IconGear } from '../../../ui/icons';
import { paths } from '../../../app/paths';
import { useDemoSession } from '../../demo/session';
import { takeActorSelectorFocus } from '../actor';
import { COPY } from '../copy';
import { useInbox, type NotificationsEntryState } from '../inbox';
import { ActorSheet } from './ActorSheet';

export function ProfileAppBar() {
    const navigate = useNavigate();
    const scrolled = useScrolled();
    const { actor, switchable } = useDemoSession();
    const { unread } = useInbox();
    const [actorSheet, setActorSheet] = useState(false);
    const selectorRef = useRef<HTMLButtonElement>(null);
    const canSwitch = switchable.length > 1;

    // Recién montado por un cambio de actor: el foco vuelve al selector (el que abrió la hoja ya no existe).
    useEffect(() => {
        if (takeActorSelectorFocus()) selectorRef.current?.focus();
    }, []);

    // NOT-01 sabe de dónde se abrió: si una notificación lleva a Perfil, vuelve en vez de apilar otro.
    const openNotifications = () => {
        const state: NotificationsEntryState = { from: paths.perfil() };
        navigate(paths.notificaciones(), { state });
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
                                ref={selectorRef}
                                name={actor.fullName}
                                kind={actor.kind === 'organizacion' ? 'org' : 'person'}
                                onClick={() => setActorSheet(true)}
                            />
                        )}
                        <IconButton
                            icon={IconBell}
                            label={unread > 0 ? `Notificaciones, ${unread} sin leer` : 'Notificaciones'}
                            count={unread}
                            onClick={openNotifications}
                        />
                        <IconButton
                            icon={IconGear}
                            label={COPY.perfil.configuracion}
                            onClick={() => navigate(paths.configuracion())}
                        />
                    </>
                }
            />
            {canSwitch && <ActorSheet open={actorSheet} onClose={() => setActorSheet(false)} />}
        </>
    );
}
