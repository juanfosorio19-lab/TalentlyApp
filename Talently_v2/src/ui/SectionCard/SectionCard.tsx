import { useId, type ComponentPropsWithRef, type MouseEventHandler, type ReactNode } from 'react';
import { cx } from '../cx';
import { IconAdd, IconEdit, type IconComponent } from '../icons';
import { Button } from '../Button';
import { IconButton } from '../IconButton';

export interface SectionCardEmpty {
    /** Para qué sirve, en `color-text-2` («Agrega dónde has trabajado. Las organizaciones lo miran…»). */
    text: ReactNode;
    /** La acción real, en infinitivo («Agregar experiencia»). */
    actionLabel: string;
    onAction: MouseEventHandler<HTMLButtonElement>;
}

export interface SectionCardProps extends Omit<ComponentPropsWithRef<'section'>, 'title'> {
    /** Título con estilo H3 («Oficios», «Credenciales», «Descripción»). */
    title: ReactNode;
    /** Nivel del encabezado: h2 en el Perfil (bajo el H1 de la pestaña); h3 si va dentro de otra sección. */
    titleAs?: 'h2' | 'h3';
    /** Lápiz «Editar» (IconButton de 40/48) en la cabecera. Si no se puede editar, no se pasa. */
    onEdit?: MouseEventHandler<HTMLButtonElement>;
    editLabel?: string;
    /** Button tonal sm «Agregar» en la cabecera (solo si no hay lápiz). */
    onAdd?: MouseEventHandler<HTMLButtonElement>;
    addLabel?: string;
    /** Vacía: ayuda + Button tonal con la acción real, en vez del contenido y de la acción de la cabecera. */
    empty?: SectionCardEmpty;
    /** Contenido con el mismo formato que en las tarjetas y el detalle (filas: `SectionRow`). */
    children?: ReactNode;
}

/**
 * Sección del Perfil («Así te ven») y de los detalles: Card con título H3 y,
 * en la cabecera, el lápiz «Editar» o un Button sm «Agregar». La sección no
 * se toca: lo hacen su lápiz o su botón. Nada de «Perfil al 100 %».
 */
export function SectionCard({
    title,
    titleAs: Title = 'h2',
    onEdit,
    editLabel = 'Editar',
    onAdd,
    addLabel = 'Agregar',
    empty,
    children,
    className,
    ...rest
}: SectionCardProps) {
    const titleId = useId();
    // El lápiz dice «Editar» (README); el título de la sección le da el contexto al lector de pantalla.
    let action: ReactNode = null;
    if (!empty && onEdit) {
        action = <IconButton icon={IconEdit} label={editLabel} aria-describedby={titleId} onClick={onEdit} />;
    } else if (!empty && onAdd) {
        action = (
            <Button variant="tonal" size="sm" icon={IconAdd} aria-describedby={titleId} onClick={onAdd}>
                {addLabel}
            </Button>
        );
    }
    return (
        <section className={cx('tl-section', className)} {...rest}>
            <div className="tl-section__head">
                <Title id={titleId} className="tl-section__title h3">
                    {title}
                </Title>
                {action}
            </div>
            {empty ? (
                <>
                    <p className="tl-section__empty">{empty.text}</p>
                    <Button variant="tonal" icon={IconAdd} onClick={empty.onAction}>
                        {empty.actionLabel}
                    </Button>
                </>
            ) : (
                children
            )}
        </section>
    );
}

export interface SectionRowProps extends ComponentPropsWithRef<'div'> {
    /** Tile de 40 (`radius-md`, `color-primary-subtle`) al inicio: IconDocument en credenciales. */
    icon?: IconComponent;
}

/** Fila interna de una SectionCard (`.tl-section__row`): divisor `color-border` entre filas. */
export function SectionRow({ icon: Icon, className, children, ...rest }: SectionRowProps) {
    return (
        <div className={cx('tl-section__row', className)} {...rest}>
            {Icon && (
                <span className="tl-listitem__tile">
                    <Icon />
                </span>
            )}
            {children}
        </div>
    );
}
