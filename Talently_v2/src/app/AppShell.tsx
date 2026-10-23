// Shell de las pestañas (spec §5.1): la raíz de cada pestaña con la
// BottomTabBar abajo. Las pantallas apiladas (detalle, conversación,
// configuración…) van fuera del shell y no llevan TabBar.
import type { MouseEvent } from 'react';
import { Outlet, useHref, useLocation, useNavigate } from 'react-router-dom';
import { BottomTabBar, type BottomTabBarItem } from '../ui/BottomTabBar';
import { IconCalendar, IconChat, IconHome, IconPerson, IconSearch } from '../ui/icons';
import { useUnreadMessages } from '../features/demo/conversationState';
import { useDemoSession } from '../features/demo/session';
import { historyIndex } from './navigation/history';
import { inicioAtFirstEntry, lastUrlOf } from './navigation/tabMemory';
import { tabOf, type TabKey } from './paths';

function useTabItems(): BottomTabBarItem<TabKey>[] {
    const { actor, recienRegistrado } = useDemoSession();
    // Solo no leídos reales, los mismos de MSG-01: baja al abrir la conversación y no cuenta las que
    // la sesión todavía no tiene (demo/conversationState). Recién registrado: ninguno.
    const unread = useUnreadMessages(actor.id, recienRegistrado);
    const hrefs = {
        inicio: useHref(lastUrlOf('inicio')),
        explorar: useHref(lastUrlOf('explorar')),
        actividad: useHref(lastUrlOf('actividad')),
        mensajes: useHref(lastUrlOf('mensajes')),
        perfil: useHref(lastUrlOf('perfil')),
    };
    return [
        { key: 'inicio', label: 'Inicio', icon: IconHome, href: hrefs.inicio },
        { key: 'explorar', label: 'Explorar', icon: IconSearch, href: hrefs.explorar },
        { key: 'actividad', label: 'Actividad', icon: IconCalendar, href: hrefs.actividad },
        { key: 'mensajes', label: 'Mensajes', icon: IconChat, href: hrefs.mensajes, badge: unread || undefined },
        { key: 'perfil', label: 'Perfil', icon: IconPerson, href: hrefs.perfil },
    ];
}

export function AppShell() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const items = useTabItems();
    const active = tabOf(pathname);

    // Cambiar de pestaña hace replace y vuelve a su última subruta (spec §5.3 regla 1). Excepción:
    // Inicio queda siempre debajo (paso 5 del atrás, que la web no puede detener): salir de Inicio
    // cuando es la primera entrada apila la otra pestaña, y volver a él vuelve de un salto a esa
    // primera entrada, aunque haya otras en medio (DET-01 → «Ver mis postulaciones» deja Explorar
    // debajo): en Inicio, el atrás de Android da «Presiona atrás otra vez para salir».
    const onSelect = (key: TabKey, event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        if (key === active) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const index = historyIndex();
        if (active === 'inicio' && index === 0) void navigate(lastUrlOf(key));
        else if (key === 'inicio' && index > 0 && inicioAtFirstEntry()) void navigate(-index);
        else void navigate(lastUrlOf(key), { replace: true });
    };

    return (
        <div className="tl-app-screen">
            <Outlet />
            <BottomTabBar items={items} activeKey={active} onSelect={onSelect} />
        </div>
    );
}
