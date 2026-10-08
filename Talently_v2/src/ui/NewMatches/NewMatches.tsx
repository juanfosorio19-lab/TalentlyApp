import type { ComponentPropsWithRef, MouseEvent } from 'react';
import { Avatar, type AvatarKind } from '../Avatar';
import { contextChipText, PUBLICATION_TYPES, type ContextChipContent } from '../ContextChip';
import { cx } from '../cx';
import { ScreenSection } from '../Layout';

export interface NewMatch {
    /** Identificador del match (la `key` de la fila). */
    id: string;
    /** Nombre de la otra parte, en dos líneas como máximo. */
    name: string;
    /** Organización u hogar = cuadrado; persona = redondo, como en todas las vistas. */
    kind?: AvatarKind;
    /** Foto real, si la hay (prestadores de servicios). */
    photo?: string | null;
    /** De qué publicación es: ícono del tipo + «tipo · título · fecha», como el ContextChip. */
    context: ContextChipContent;
    /** Dirección de la conversación: con ella la tarjeta es un enlace real (`a`); sin ella, un botón. */
    href?: string;
}

interface NewMatchCardOwnProps {
    match: Omit<NewMatch, 'id'>;
    /** Solo para el catálogo (`is-pressed`, `is-focus`). */
    className?: string;
}

export type NewMatchCardProps = NewMatchCardOwnProps &
    (
        | Omit<ComponentPropsWithRef<'a'>, 'children' | 'href' | 'className' | 'aria-label'>
        | Omit<ComponentPropsWithRef<'button'>, 'children' | 'type' | 'className' | 'aria-label'>
    );

/**
 * Una tarjeta de «Nuevos matches»: 144 de ancho, Avatar de 56, nombre y la
 * publicación en texto. Toda la tarjeta abre la conversación: es un `a` con
 * `match.href` o un `button`. Presionado: capa `color-text` al 8 %.
 */
export function NewMatchCard({ match, className, ...rest }: NewMatchCardProps) {
    const { name, kind = 'person', photo, context, href } = match;
    const Icon = PUBLICATION_TYPES[context.kind].icon;
    const ctx = contextChipText(context);
    const body = (
        <>
            <Avatar name={name} kind={kind} photo={photo} size={56} />
            <span className="tl-newmatch__name">{name}</span>
            <span className="tl-newmatch__ctx">
                <Icon size={16} />
                <span>{ctx}</span>
            </span>
        </>
    );
    const label = `${name}, ${ctx}, sin mensajes`;
    const cls = cx('tl-newmatch', className);
    if (href !== undefined) {
        return (
            <a className={cls} href={href} aria-label={label} {...(rest as Omit<ComponentPropsWithRef<'a'>, 'children'>)}>
                {body}
            </a>
        );
    }
    return (
        <button type="button" className={cls} aria-label={label} {...(rest as Omit<ComponentPropsWithRef<'button'>, 'children'>)}>
            {body}
        </button>
    );
}

export interface NewMatchesProps extends Omit<ComponentPropsWithRef<'section'>, 'children' | 'title'> {
    /** Solo los matches que todavía no tienen mensajes. Sin ninguno, la sección no aparece. */
    matches: NewMatch[];
    /**
     * Abre la conversación con ese match. Con `href`, la pantalla decide si
     * navega sin recargar (`event.preventDefault()` + router).
     */
    onOpen: (match: NewMatch, event: MouseEvent<HTMLElement>) => void;
}

/**
 * «Nuevos matches (n)» arriba de Mensajes (MSG-01): H2 con el número real y
 * una fila de tarjetas que se desliza de lado y llega al borde de la
 * pantalla. Con el primer mensaje, el match sale de aquí y pasa a la lista de
 * conversaciones. Sin matches nuevos no se muestra: nunca una fila vacía ni «0».
 */
export function NewMatches({ matches, onOpen, ...rest }: NewMatchesProps) {
    if (matches.length === 0) return null;
    return (
        <ScreenSection title={`Nuevos matches (${matches.length})`} {...rest}>
            <ul className="tl-newmatches">
                {matches.map((m) => (
                    <li key={m.id}>
                        <NewMatchCard match={m} onClick={(e: MouseEvent<HTMLElement>) => onOpen(m, e)} />
                    </li>
                ))}
            </ul>
        </ScreenSection>
    );
}
