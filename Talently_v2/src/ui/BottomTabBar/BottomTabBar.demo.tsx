import type { MouseEvent, ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoLabel, DemoNotApplicable, DemoRow, DemoSection } from '../catalog/demo';
import { IconCalendar, IconChat, IconHome, IconPerson, IconSearch } from '../icons';
import { BottomTabBar, type BottomTabBarItem } from './BottomTabBar';

type Tab = 'inicio' | 'explorar' | 'actividad' | 'mensajes' | 'perfil';

// En la app el orden y las rutas los da src/app; aquí, los mismos 5 con anclas que no navegan.
function tabs(unread = 0, force?: Partial<Record<Tab, string>>): BottomTabBarItem<Tab>[] {
    return [
        { key: 'inicio', label: 'Inicio', icon: IconHome, href: '#inicio', className: force?.inicio },
        { key: 'explorar', label: 'Explorar', icon: IconSearch, href: '#explorar', className: force?.explorar },
        { key: 'actividad', label: 'Actividad', icon: IconCalendar, href: '#actividad', className: force?.actividad },
        { key: 'mensajes', label: 'Mensajes', icon: IconChat, href: '#mensajes', badge: unread, className: force?.mensajes },
        { key: 'perfil', label: 'Perfil', icon: IconPerson, href: '#perfil', className: force?.perfil },
    ];
}

const stay = (_key: Tab, event: MouseEvent<HTMLAnchorElement>) => event.preventDefault();

function Example({ caption, children }: { caption?: string; children: ReactNode }) {
    return (
        <DemoRow column tight>
            {caption && <DemoLabel>{caption}</DemoLabel>}
            <DemoFrame>{children}</DemoFrame>
        </DemoRow>
    );
}

const demo: DemoModule = {
    name: 'BottomTabBar',
    group: 'Estructura',
    summary:
        'La navegación principal: Inicio, Explorar, Actividad, Mensajes y Perfil, siempre en ese orden. La activa lleva la píldora; badge solo con no leídos reales (máximo «99+»).',
    Demo: () => (
        <>
            <DemoSection title="5 pestañas fijas, mismo orden e íconos para cualquier perfil">
                <Example caption="Inicio activa · 3 mensajes sin leer">
                    <BottomTabBar items={tabs(3)} activeKey="inicio" onSelect={stay} />
                </Example>
                <Example caption="Mensajes activa · el badge se mantiene mientras haya no leídos">
                    <BottomTabBar items={tabs(3)} activeKey="mensajes" onSelect={stay} />
                </Example>
                <Example caption="Sin mensajes sin leer · no hay badge">
                    <BottomTabBar items={tabs(0)} activeKey="explorar" onSelect={stay} />
                </Example>
                <Example caption="Más de 99 sin leer · «99+» (la etiqueta accesible dice el número real)">
                    <BottomTabBar items={tabs(128)} activeKey="perfil" onSelect={stay} />
                </Example>
            </DemoSection>

            <DemoSection title="Estados">
                <DemoSection title="Default">
                    <Example>
                        <BottomTabBar items={tabs(0)} activeKey={null} onSelect={stay} />
                    </Example>
                    <DemoLabel>Inactiva: ícono y etiqueta en color-text-3.</DemoLabel>
                </DemoSection>
                <DemoSection title="Presionado">
                    <Example>
                        <BottomTabBar items={tabs(3, { explorar: 'is-pressed' })} activeKey="inicio" onSelect={stay} />
                    </Example>
                    <DemoLabel>Presionando Explorar.</DemoLabel>
                </DemoSection>
                <DemoSection title="Foco">
                    <Example>
                        <BottomTabBar items={tabs(3, { actividad: 'is-focus' })} activeKey="inicio" onSelect={stay} />
                    </Example>
                    <DemoLabel>Foco en Actividad.</DemoLabel>
                </DemoSection>
                <DemoSection title="Seleccionado">
                    <Example>
                        <BottomTabBar items={tabs(3)} activeKey="inicio" onSelect={stay} />
                    </Example>
                    <DemoLabel>Activa: color-primary-text con una sola píldora 56×32 color-primary-subtle.</DemoLabel>
                </DemoSection>
                <DemoSection title="Deshabilitado">
                    <DemoNotApplicable>Las 5 pestañas funcionan siempre, para cualquier perfil y en cualquier fase.</DemoNotApplicable>
                </DemoSection>
                <DemoSection title="Error">
                    <DemoNotApplicable>La TabBar no falla; cada pestaña muestra su propio ErrorState.</DemoNotApplicable>
                </DemoSection>
                <DemoSection title="Cargando">
                    <DemoNotApplicable>Cambia de pestaña al instante; el contenido carga con Skeleton.</DemoNotApplicable>
                </DemoSection>
            </DemoSection>
        </>
    ),
};

export default demo;
