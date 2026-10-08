// AppBar large de la pestaña Perfil (spec §5.1): selector de actor (solo si la
// persona pertenece a una organización), la campana con su contador real y el
// engranaje a Configuración (solo aquí).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActorSelector, AppBar, useScrolled } from '../../../ui/AppBar';
import { IconButton } from '../../../ui/IconButton';
import { IconBell, IconGear } from '../../../ui/icons';
import { paths } from '../../../app/paths';
import { getHomeFeed } from '../../demo/data';
import { useDemoSession } from '../../demo/session';
import { COPY } from '../copy';
import { ActorSheet } from './ActorSheet';

export function ProfileAppBar() {
    const navigate = useNavigate();
    const scrolled = useScrolled();
    const { actor, switchable } = useDemoSession();
    const [actorSheet, setActorSheet] = useState(false);
    const unread = getHomeFeed(actor.id).notificacionesSinLeer;

    return (
        <>
            <AppBar
                title={COPY.perfil.titulo}
                scrolled={scrolled}
                actions={
                    <>
                        {switchable.length > 1 && (
                            <ActorSelector
                                name={actor.fullName}
                                shortName={actor.shortName}
                                kind={actor.kind === 'organizacion' ? 'org' : 'person'}
                                onClick={() => setActorSheet(true)}
                            />
                        )}
                        <IconButton
                            icon={IconBell}
                            label={unread > 0 ? `Notificaciones, ${unread} sin leer` : 'Notificaciones'}
                            count={unread}
                            onClick={() => navigate(paths.notificaciones())}
                        />
                        <IconButton
                            icon={IconGear}
                            label={COPY.perfil.configuracion}
                            onClick={() => navigate(paths.configuracion())}
                        />
                    </>
                }
            />
            {switchable.length > 1 && <ActorSheet open={actorSheet} onClose={() => setActorSheet(false)} />}
        </>
    );
}
