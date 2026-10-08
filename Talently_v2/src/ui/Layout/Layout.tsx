import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../cx';

export interface StackProps extends ComponentPropsWithRef<'div'> {
    /** Separación entre hijos, en pasos de la grilla de 4 (space-1 … space-6). */
    gap?: 1 | 2 | 3 | 4 | 6;
    /** En fila, centrado verticalmente. */
    row?: boolean;
    /** Alineación de los hijos en el eje cruzado (por defecto, estirados). */
    align?: 'start' | 'center' | 'end';
}

/** Pila vertical (o fila) con separación del sistema. Solo maqueta: no dibuja nada. */
export function Stack({ gap = 3, row, align, className, ...rest }: StackProps) {
    return (
        <div
            className={cx('tl-stack', `tl-stack--${gap}`, row && 'tl-stack--row', align && `tl-stack--${align}`, className)}
            {...rest}
        />
    );
}

export interface ScreenSectionProps extends Omit<ComponentPropsWithRef<'section'>, 'title'> {
    /** Título H2 de la sección («Hoy en tu agenda»). */
    title: ReactNode;
    /** Acción a la derecha: un Button ghost sm («Ver agenda»). */
    action?: ReactNode;
    children: ReactNode;
}

/** Sección de una pantalla: H2 con acción opcional y su contenido debajo. */
export function ScreenSection({ title, action, children, className, ...rest }: ScreenSectionProps) {
    return (
        <section className={cx('tl-screen-section', className)} {...rest}>
            <div className="tl-screen-section__head">
                <h2 className="h2 tl-screen-section__title">{title}</h2>
                {action}
            </div>
            {children}
        </section>
    );
}
