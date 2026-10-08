import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../cx';
import {
    IconBook,
    IconCalendar,
    IconClock,
    IconDocument,
    IconLocation,
    IconOffers,
    IconPeople,
    type IconComponent,
} from '../icons';

/**
 * Tipo de dato, no valor: el ícono sale del tipo y es el mismo en tarjeta,
 * detalle (DET-01) y perfil.
 */
export type InfoTagKind =
    /** Jornada («Jornada completa», «Part time»): IconClock. */
    | 'jornada'
    /** Contrato o forma de contratación («Plazo fijo», «Boleta de honorarios»): IconDocument. */
    | 'contrato'
    /** Fecha, horario o sistema de turno («sáb 12 dic · 18:00–00:00 (6 h)», «Turno de noche»): IconCalendar. */
    | 'fecha'
    /** Modalidad («Online», «En la casa del alumno», «Presencial»): IconLocation. */
    | 'modalidad'
    /** Clase de prueba («Clase de prueba gratis»): IconBook. */
    | 'prueba'
    /** Cupos: IconPeople. */
    | 'cupos'
    /** Distancia, comuna o cobertura: IconLocation. */
    | 'lugar'
    /** Experiencia pedida (tarjeta del deck: «5 a 10 años de experiencia»): IconOffers. */
    | 'experiencia';

const KIND_ICON: Record<InfoTagKind, IconComponent> = {
    jornada: IconClock,
    contrato: IconDocument,
    fecha: IconCalendar,
    modalidad: IconLocation,
    prueba: IconBook,
    cupos: IconPeople,
    lugar: IconLocation,
    experiencia: IconOffers,
};

export interface InfoTagProps extends Omit<ComponentPropsWithRef<'li'>, 'children'> {
    /** Tipo de dato: define el ícono. Sin tipo, solo el texto (bloques horarios «16:00–21:00» en ACT-04). */
    kind?: InfoTagKind;
    /** Texto literal del diccionario. Nunca un código ni un texto en inglés. */
    children: ReactNode;
}

/**
 * Un dato clave de una publicación con su ícono de 16 (alto 28, radio sm,
 * `color-surface-2`). No se toca: no es un Chip ni un Badge. Va siempre
 * dentro de `InfoTags`.
 */
export function InfoTag({ kind, children, className, ...rest }: InfoTagProps) {
    const Icon = kind ? KIND_ICON[kind] : undefined;
    return (
        <li className={cx('tl-tag', className)} {...rest}>
            {Icon && <Icon />}
            {children}
        </li>
    );
}

export interface InfoTagsProps extends ComponentPropsWithRef<'ul'> {
    children: ReactNode;
}

/** Lista de InfoTag (`ul.tl-tags`): fila que envuelve con 8 de separación. */
export function InfoTags({ className, ...rest }: InfoTagsProps) {
    return <ul className={cx('tl-tags', className)} {...rest} />;
}
