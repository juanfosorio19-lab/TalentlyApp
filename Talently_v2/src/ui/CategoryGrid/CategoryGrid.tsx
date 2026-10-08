import type { ComponentPropsWithRef } from 'react';
import { JOB_CATEGORIES, type Category, type JobCategoryKey } from '../../domain/categorias';
import { cx } from '../cx';
import type { IconComponent } from '../icons';
import { JOB_CATEGORY_ICONS } from './categoryIcons';

export interface CategoryTileProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
    /** Ícono de la categoría (24, en tile de 40). */
    icon: IconComponent;
    /** Nombre en 13/600, centrado, hasta 2 líneas. */
    name: string;
    /** Oficios ya elegidos en la categoría: la marca y dice «2 elegidos». */
    count?: number;
    /** Selector de rubro: la elegida (`aria-pressed`). Sin valor, la tarjeta navega. */
    selected?: boolean;
}

/** Una tarjeta `button.tl-cat` de la grilla: alto mínimo 96, borde 1, `radius-lg`. */
export function CategoryTile({ icon: Icon, name, count, selected, type = 'button', className, ...rest }: CategoryTileProps) {
    const withCount = count !== undefined && count > 0;
    return (
        <button
            type={type}
            className={cx('tl-cat', (selected || withCount) && 'is-selected', className)}
            aria-pressed={selected}
            {...rest}
        >
            <span className="tl-cat__tile">
                <Icon />
            </span>
            {name}
            {withCount && <span className="tl-cat__count">{count === 1 ? '1 elegido' : `${count} elegidos`}</span>}
        </button>
    );
}

export interface CategoryGridProps extends Omit<ComponentPropsWithRef<'ul'>, 'onSelect' | 'children'> {
    /** Por defecto las 16 categorías de oficio, en su orden fijo. */
    categories?: readonly Category<JobCategoryKey>[];
    /** Tocar una categoría: abre sus oficios en la misma hoja, o (con `value`) la elige y cierra la hoja. */
    onSelect: (key: JobCategoryKey) => void;
    /** Navegación (SHT-OFICIO): oficios elegidos por categoría; las que tienen se marcan con «n elegidos». */
    counts?: Partial<Record<JobCategoryKey, number>>;
    /** Selector de rubro (ONB-O1, hoja «Rubro»): la categoría elegida, marcada sin contador. `null` = ninguna. */
    value?: JobCategoryKey | null;
}

/**
 * Grilla de 3 columnas con las categorías del catálogo de oficios
 * (`ul.tl-catgrid`). Va en SHT-OFICIO bajo «Oficios populares» o, con
 * `value`, como selector de rubro. Mientras carga el catálogo, la pantalla
 * muestra Skeleton de 96 con `radius-lg` por tarjeta.
 */
export function CategoryGrid({
    categories = JOB_CATEGORIES,
    onSelect,
    counts,
    value,
    'aria-label': ariaLabel = 'Categorías',
    className,
    ...rest
}: CategoryGridProps) {
    const picker = value !== undefined;
    return (
        <ul className={cx('tl-catgrid', className)} aria-label={ariaLabel} {...rest}>
            {categories.map((c) => (
                <li key={c.key}>
                    <CategoryTile
                        icon={JOB_CATEGORY_ICONS[c.key]}
                        name={c.name}
                        count={picker ? undefined : counts?.[c.key]}
                        selected={picker ? value === c.key : undefined}
                        onClick={() => onSelect(c.key)}
                    />
                </li>
            ))}
        </ul>
    );
}
