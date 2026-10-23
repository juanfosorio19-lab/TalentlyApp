import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Button, type ButtonProps } from '../Button';
import { cx } from '../cx';
import type { IconComponent } from '../icons';

export interface EmptyStateAction extends Omit<ButtonProps, 'children' | 'variant'> {
    /** Acción real, en infinitivo: «Ver turnos cercanos», «Explorar turnos». */
    label: string;
    /**
     * Tonal por defecto (README del sistema). `primary` cuando es la única
     * acción de la pantalla, como en las pantallas aprobadas INI-01-jorge-nuevo,
     * INI-01-rosa y GES-04-sin-postulados (decisiones.md).
     */
    variant?: 'tonal' | 'primary';
}

export interface EmptyStateProps extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'children'> {
    /** Ícono del set que dice qué falta (IconChat en Mensajes, IconCalendar en la Agenda). Va a 40 en un círculo de 72. */
    icon: IconComponent;
    /** Qué no hay: «No hay turnos en Ñuñoa». */
    title: ReactNode;
    /** Por qué y qué hacer, con datos reales: «Hay 8 turnos a menos de 10 km, en Providencia, Macul y Santiago.». */
    text: ReactNode;
    /** Button tonal con una acción real. Si no hay ninguna posible, el texto da la sugerencia. */
    action?: EmptyStateAction;
    /**
     * Nivel del título: h3 por defecto (dentro de una sección); h2 cuando el
     * vacío va justo bajo el H1 de la pantalla (INI-01-jorge-nuevo:
     * `h2.tl-empty__title.h3`), para no saltar un nivel. El estilo es el mismo.
     */
    headingLevel?: 2 | 3;
}

/**
 * Lo que se ve cuando una lista o pantalla no tiene nada que mostrar. Mientras
 * carga va Skeleton (nunca un EmptyState) y si falló, ErrorState.
 */
export function EmptyState({ icon: Icon, title, text, action, headingLevel = 3, className, ...rest }: EmptyStateProps) {
    const Title = headingLevel === 2 ? 'h2' : 'h3';
    return (
        <div className={cx('tl-empty', className)} {...rest}>
            <div className="tl-empty__icon">
                <Icon />
            </div>
            <Title className="tl-empty__title h3">{title}</Title>
            <p className="tl-empty__text">{text}</p>
            {action && <EmptyStateButton {...action} />}
        </div>
    );
}

function EmptyStateButton({ label, variant = 'tonal', ...rest }: EmptyStateAction) {
    return (
        <Button variant={variant} {...rest}>
            {label}
        </Button>
    );
}
