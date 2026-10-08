import type { ComponentPropsWithRef } from 'react';
import { cx } from '../cx';
import { IconBook, IconChevronRight, IconClock, IconOffers, IconTool, type IconComponent } from '../icons';

/** Tipos de publicación (`publication_type`). Se distinguen por ícono y etiqueta, sin color propio. */
export type PublicationType = 'empleo' | 'turno' | 'clase' | 'servicio';

export const PUBLICATION_TYPES: Record<PublicationType, { label: string; icon: IconComponent }> = {
    empleo: { label: 'Empleo', icon: IconOffers },
    turno: { label: 'Turno', icon: IconClock },
    clase: { label: 'Clase', icon: IconBook },
    servicio: { label: 'Servicio', icon: IconTool },
};

export interface ContextChipContent {
    /** Tipo de la publicación: define el ícono y la primera palabra. */
    kind: PublicationType;
    /** Título corto de la publicación («Garzón», «Guardia de seguridad 4x4»). */
    title: string;
    /**
     * Tercer dato, uno solo: la fecha en el formato único («sáb 12 dic», «mar
     * 22 jun») o, en Servicios, la comuna (SRV-02: «Servicio · Gasfitería ·
     * San Miguel»). Empleo no lleva.
     */
    detail?: string;
    /** La publicación ya no existe: dice «Publicación cerrada» en lugar del detalle y sigue abriendo el resumen guardado. */
    closed?: boolean;
}

/** «Turno · Garzón · sáb 12 dic», «Servicio · Gasfitería · San Miguel». */
export function contextChipText({ kind, title, detail, closed }: ContextChipContent): string {
    return [PUBLICATION_TYPES[kind].label, title, closed ? 'Publicación cerrada' : detail].filter(Boolean).join(' · ');
}

export interface ContextChipProps extends Omit<ComponentPropsWithRef<'button'>, 'children' | 'title'>, ContextChipContent {}

/**
 * Dice de qué publicación habla una conversación: ícono del tipo + «tipo ·
 * título · fecha o comuna» + chevron. Pill de 36 que se corta con «…». Al tocarlo
 * abre el detalle de la publicación.
 */
export function ContextChip({ kind, title, detail, closed, type = 'button', className, ...rest }: ContextChipProps) {
    const Icon = PUBLICATION_TYPES[kind].icon;
    return (
        <button type={type} className={cx('tl-ctxchip', className)} {...rest}>
            <Icon size={16} />
            <span className="tl-ctxchip__text">{contextChipText({ kind, title, detail, closed })}</span>
            <IconChevronRight size={16} />
        </button>
    );
}

export interface ContextChipInRowProps extends Omit<ComponentPropsWithRef<'span'>, 'children' | 'title'>, ContextChipContent {}

/**
 * El mismo chip dentro de la fila de Mensajes (`tl-listitem--chat`): sin
 * chevron y sin ser botón, porque toda la fila ya se toca (M5).
 */
export function ContextChipInRow({ kind, title, detail, closed, className, ...rest }: ContextChipInRowProps) {
    const Icon = PUBLICATION_TYPES[kind].icon;
    return (
        <span className={cx('tl-ctxchip', className)} {...rest}>
            <Icon size={16} />
            <span className="tl-ctxchip__text">{contextChipText({ kind, title, detail, closed })}</span>
        </span>
    );
}

export type ContextChipBarProps = ComponentPropsWithRef<'div'>;

/** Franja fija bajo el AppBar de la conversación (`tl-chat__context`: 8 × 16, `color-bg`, borde inferior). */
export function ContextChipBar({ className, ...rest }: ContextChipBarProps) {
    return <div className={cx('tl-chat__context', className)} {...rest} />;
}
