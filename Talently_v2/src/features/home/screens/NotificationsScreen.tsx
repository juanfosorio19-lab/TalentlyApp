// NOT-01 · Notificaciones (/notificaciones, apilada): la bandeja de la persona
// (sus organizaciones comparten bandeja), agrupada en Hoy, Ayer, Esta semana y
// Antes, con «Marcar todas como leídas» solo si hay alguna sin leer. Lo leído
// vive en demo/sessionStore (useInbox): todas las campanas lo ven igual.
// Tocar una la marca leída y abre su destino; si es de otro actor (una
// notificación de Banquetería Rosa SpA mientras Rosa usa Talently como
// persona), cambia de actor solo y lo dice con el Snackbar «Cambiaste a …»
// (flujo 7, spec §5.3 regla 7). El destino se resuelve con demo/targets y se
// valida con canOpen ANTES de cambiar de actor: si la pantalla todavía no
// existe, dice «Disponible pronto» sin cambiar de actor ni llevar a SYS-404.
import { useId, useRef, type MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { useGoBack } from '../../../app/BackButtonManager';
import { paths } from '../../../app/paths';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { Button } from '../../../ui/Button';
import { EmptyState } from '../../../ui/EmptyState';
import {
    IconBell,
    IconCalendar,
    IconChat,
    IconDocument,
    IconMatchHeart,
    IconOffers,
    IconPeople,
    IconShield,
    IconStar,
    type IconComponent,
} from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import { useSnackbar } from '../../../ui/Snackbar';
import { useDemoSession } from '../../demo/session';
import { useInbox } from '../../demo/sessionStore';
import type { DemoNotification, DemoNotificationIcon } from '../../demo/types';
import { notificationsFrom } from '../../../app/navigation/notifications';
import { copy } from '../copy';
import { useFocusTitleIfLost, useHomeNavigation } from '../navigation';
import { groupNotifications, resolveNotification } from '../selectors';
import '../home.css';

export const screenId = 'NOT-01';

const ICON: Record<DemoNotificationIcon, IconComponent> = {
    cupos: IconPeople,
    verificacion: IconShield,
    postulantes: IconDocument,
    turno: IconCalendar,
    evaluar: IconStar,
    mensaje: IconChat,
    match: IconMatchHeart,
    entrevista: IconOffers,
    postulacion: IconOffers,
};

/** Abrir en otra pestaña (Ctrl, Cmd, Mayús, rueda) sigue siendo del navegador. */
const plainClick = (e: MouseEvent<HTMLElement>) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

export function NotificationsScreen() {
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const location = useLocation();
    const { actor, switchable, setActor, recienRegistrado } = useDemoSession();
    const { items, unread, markRead, markAllRead } = useInbox(actor.id, recienRegistrado);
    const snackbar = useSnackbar();
    const { go, link, soon, canOpen } = useHomeNavigation();
    const from = notificationsFrom(location.state);
    const headingId = useId();
    // «Marcar todas como leídas» desaparece al tocarlo: el foco pasa al primer grupo, no al body.
    const firstHeading = useRef<HTMLHeadingElement>(null);
    const switchableIds = switchable.map((a) => a.id);
    // Se llega desde la campana (o de vuelta de CFG-01), que ya no está: el foco va al título, no al body.
    useFocusTitleIfLost(location.key);

    const route = (n: DemoNotification) => resolveNotification(n, actor.id, switchableIds, canOpen);

    const open = (n: DemoNotification) => {
        const { switchTo, path } = route(n);
        markRead(n.id);
        // La pantalla de destino es de una fase futura: se dice, sin cambiar de actor.
        if (!path) {
            soon();
            return;
        }
        if (switchTo) {
            setActor(switchTo);
            const name = switchable.find((a) => a.id === switchTo)?.fullName ?? '';
            snackbar.show({ message: copy.actor.cambiaste(name) });
        }
        // Si lleva a la pantalla de la que se vino (Inicio), vuelve en vez de apilarla otra vez.
        if (path === from) goBack();
        else go(path);
    };

    const onMarkAll = () => {
        firstHeading.current?.focus();
        markAllRead();
        snackbar.show({ message: copy.notificaciones.marcadas, tone: 'success' });
    };

    const groups = groupNotifications(items);

    return (
        <div className="tl-app-screen">
            <AppBar variant="standard" title={copy.notificaciones.titulo} onBack={goBack} scrolled={scrolled} />
            <main className="tl-app-screen__body">
                {groups.length === 0 ? (
                    <EmptyState
                        icon={IconBell}
                        title={copy.notificaciones.vacia.titulo}
                        text={copy.notificaciones.vacia.texto}
                        // CFG-03 (Notificaciones) se abre desde Configuración.
                        action={{ label: copy.notificaciones.vacia.accion, onClick: () => go(paths.configuracion()) }}
                    />
                ) : (
                    <div className="tl-app-screen__content home-notifs">
                        {unread > 0 && (
                            <div className="home-notifs__actions">
                                <Button variant="ghost" size="sm" onClick={onMarkAll}>
                                    {copy.notificaciones.marcarTodas}
                                </Button>
                            </div>
                        )}
                        {groups.map(({ grupo, items: list }, gi) => (
                            <section key={grupo} aria-labelledby={`${headingId}-${gi}`}>
                                <h2
                                    className="overline home-muted home-group tl-focus"
                                    id={`${headingId}-${gi}`}
                                    ref={gi === 0 ? firstHeading : undefined}
                                    tabIndex={gi === 0 ? -1 : undefined}
                                >
                                    {grupo}
                                </h2>
                                <List>
                                    {list.map((n) => {
                                        const { path } = route(n);
                                        return (
                                            <ListItem
                                                key={n.id}
                                                className="home-notif"
                                                icon={ICON[n.icono]}
                                                title={n.titulo}
                                                sub={`${n.origen} · ${n.cuando}`}
                                                unread={n.sinLeer}
                                                chevron={false}
                                                href={path ? link(path).href : undefined}
                                                onClick={(e: MouseEvent<HTMLElement>) => {
                                                    if (path && !plainClick(e)) return;
                                                    e.preventDefault();
                                                    open(n);
                                                }}
                                            />
                                        );
                                    })}
                                </List>
                            </section>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
