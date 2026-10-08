import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Button, type ButtonProps } from '../Button';
import { cx } from '../cx';
import type { IconComponent } from '../icons';

export interface EmptyStateAction extends Omit<ButtonProps, 'children' | 'variant'> {
    /** Acción real, en infinitivo: «Ver turnos cercanos», «Explorar turnos». */
    label: string;
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
}

/**
 * Lo que se ve cuando una lista o pantalla no tiene nada que mostrar. Mientras
 * carga va Skeleton (nunca un EmptyState) y si falló, ErrorState.
 */
export function EmptyState({ icon: Icon, title, text, action, className, ...rest }: EmptyStateProps) {
    return (
        <div className={cx('tl-empty', className)} {...rest}>
            <div className="tl-empty__icon">
                <Icon />
            </div>
            <h3 className="tl-empty__title h3">{title}</h3>
            <p className="tl-empty__text">{text}</p>
            {action && <EmptyStateButton {...action} />}
        </div>
    );
}

function EmptyStateButton({ label, ...rest }: EmptyStateAction) {
    return (
        <Button variant="tonal" {...rest}>
            {label}
        </Button>
    );
}
