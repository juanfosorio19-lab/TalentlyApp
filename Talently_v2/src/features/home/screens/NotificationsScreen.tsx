// NOT-01 · Notificaciones (/notificaciones, apilada): la bandeja de la persona
// (sus organizaciones comparten bandeja), agrupada en Hoy, Ayer, Esta semana y
// Antes, con «Marcar todas como leídas» solo si hay alguna sin leer. Tocar una
// la marca leída y abre su destino; si es de otro actor (una notificación de
// Banquetería Rosa SpA mientras Rosa usa Talently como persona), cambia de
// actor solo y lo dice con el Snackbar «Cambiaste a …» (flujo 7, spec §5.3
// regla 7: cada notificación trae su destino y su actor). Si la pantalla de
// destino todavía no está en el router, dice «Disponible pronto» sin cambiar
// de actor ni llevar a SYS-404.
import { useId, useRef, type MouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { useDemoSession, type DemoActor } from '../../demo/session';
import type { DemoNotification, DemoNotificationGroup, DemoNotificationIcon } from '../../demo/types';
import type { NotificationsEntryState } from '../components/HomeAppBar';
import { copy } from '../copy';
import { useInbox } from '../inbox';
import { isPlainClick, useAppLinks, useTargetPath } from '../links';
import '../home.css';

export const screenId = 'NOT-01';

const GROUPS: readonly DemoNotificationGroup[] = ['Hoy', 'Ayer', 'Esta semana', 'Antes'];

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

type TargetPath = ReturnType<typeof useTargetPath>;

/**
 * A quién y a dónde lleva una notificación: el actor al que se refiere (si es
 * otro de la persona) y la ruta, solo si su pantalla ya existe (si no, `null`).
 */
function resolve(n: DemoNotification, actor: DemoActor, switchable: readonly DemoActor[], pathOf: TargetPath) {
    const other = n.actorId !== actor.id ? switchable.find((a) => a.id === n.actorId) : undefined;
    const path = pathOf(n.destino, other?.id ?? actor.id);
    return { other, path };
}

export function NotificationsScreen() {
    const goBack = useGoBack();
    const scrolled = useScrolled();
    const navigate = useNavigate();
    const location = useLocation();
    const { actor, switchable, setActor } = useDemoSession();
    const { items, unread, markRead, markAllRead } = useInbox();
    const snackbar = useSnackbar();
    const { hrefOf, go } = useAppLinks();
    const pathOf = useTargetPath();
    const from = (location.state as NotificationsEntryState | null)?.from;
    const headingId = useId();
    // «Marcar todas como leídas» desaparece al tocarlo: el foco pasa al primer grupo, no al body.
    const firstHeading = useRef<HTMLHeadingElement>(null);

    const open = (n: DemoNotification) => {
        const { other, path } = resolve(n, actor, switchable, pathOf);
        markRead(n.id);
        // La pantalla de destino es de una fase futura: se dice, sin cambiar de actor.
        if (!path) {
            snackbar.show({ message: copy.soon });
            return;
        }
        if (other) {
            setActor(other.id);
            snackbar.show({ message: copy.actor.cambiaste(other.fullName) });
        }
        // Si lleva a la pantalla de la que se vino (Inicio), vuelve en vez de apilarla otra vez.
        if (path === from) goBack();
        else go(path);
    };

    const onMarkAll = () => {
        markAllRead();
        firstHeading.current?.focus();
        snackbar.show({ message: copy.notificaciones.marcadas, tone: 'success' });
    };

    const groups = GROUPS.map((g) => ({ grupo: g, items: items.filter((n) => n.grupo === g) })).filter((g) => g.items.length > 0);

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
                        action={{ label: copy.notificaciones.vacia.accion, onClick: () => navigate(paths.configuracion()) }}
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
                                    className="tl-agenda__day overline"
                                    id={`${headingId}-${gi}`}
                                    ref={gi === 0 ? firstHeading : undefined}
                                    tabIndex={gi === 0 ? -1 : undefined}
                                >
                                    {grupo}
                                </h2>
                                <List>
                                    {list.map((n) => {
                                        const { path } = resolve(n, actor, switchable, pathOf);
                                        return (
                                            <ListItem
                                                key={n.id}
                                                icon={ICON[n.icono]}
                                                title={n.titulo}
                                                sub={`${n.origen} · ${n.cuando}`}
                                                unread={n.sinLeer}
                                                chevron={false}
                                                href={path ? hrefOf(path) : undefined}
                                                onClick={(e: MouseEvent<HTMLElement>) => {
                                                    if (path && !isPlainClick(e)) return;
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
