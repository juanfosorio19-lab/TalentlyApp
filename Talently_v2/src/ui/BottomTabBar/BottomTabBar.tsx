import type { ComponentPropsWithRef, MouseEvent } from 'react';
import { cx } from '../cx';
import type { IconComponent } from '../icons';

export interface BottomTabBarItem<K extends string = string> {
    key: K;
    /** «Inicio», «Explorar», «Actividad», «Mensajes», «Perfil». */
    label: string;
    /** Inicio IconHome · Explorar IconSearch · Actividad IconCalendar · Mensajes IconChat · Perfil IconPerson. */
    icon: IconComponent;
    /** Ruta de la pestaña: la da el router de la app. */
    href: string;
    /** Número real de no leídos. 0 o sin valor = sin badge; desde 100, «99+». */
    badge?: number;
    /** Solo catálogo: fuerza `is-pressed` / `is-focus` en esa pestaña. */
    className?: string;
}

export interface BottomTabBarProps<K extends string = string>
    extends Omit<ComponentPropsWithRef<'nav'>, 'children' | 'onSelect'> {
    /** Las 5 pestañas, en el orden fijo del sistema (lo arma la app). */
    items: readonly BottomTabBarItem<K>[];
    /** Pestaña activa (`aria-current="page"`). `null` solo fuera de las pestañas (catálogo). */
    activeKey: K | null;
    /**
     * Al tocar una pestaña. En la app: `event.preventDefault()` + navegar a
     * `href` (o volver a la raíz de la pestaña si ya estaba activa).
     */
    onSelect?: (key: K, event: MouseEvent<HTMLAnchorElement>) => void;
    /** Nombre del landmark. */
    label?: string;
}

/** Badge de la pestaña: hasta «99+». */
function badgeText(n: number): string {
    return n > 99 ? '99+' : String(n);
}

/**
 * La navegación principal: 5 pestañas fijas, iguales para cualquier perfil.
 * La activa lleva la píldora `color-primary-subtle` y `color-primary-text`.
 * Badge numérico en `color-primary` solo con no leídos reales, y la etiqueta
 * accesible dice cuántos («Mensajes, 3 sin leer»).
 */
export function BottomTabBar<K extends string = string>({
    items,
    activeKey,
    onSelect,
    label = 'Navegación principal',
    className,
    ...rest
}: BottomTabBarProps<K>) {
    return (
        <nav className={cx('tl-tabbar', className)} aria-label={label} {...rest}>
            {items.map(({ key, label: tabLabel, icon: Icon, href, badge, className: tabClass }) => {
                const count = badge !== undefined && badge > 0 ? Math.floor(badge) : 0;
                return (
                    <a
                        key={key}
                        className={cx('tl-tab', tabClass)}
                        href={href}
                        aria-current={key === activeKey ? 'page' : undefined}
                        aria-label={count > 0 ? `${tabLabel}, ${count} sin leer` : undefined}
                        onClick={onSelect && ((event) => onSelect(key, event))}
                    >
                        <span className="tl-tab__pill">
                            <Icon />
                            {count > 0 && (
                                <span className="tl-tab__badge" aria-hidden="true">
                                    {badgeText(count)}
                                </span>
                            )}
                        </span>
                        <span className="tab-label">{tabLabel}</span>
                    </a>
                );
            })}
        </nav>
    );
}
