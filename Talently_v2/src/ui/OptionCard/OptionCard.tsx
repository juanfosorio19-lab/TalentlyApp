import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { Badge } from '../Badge';
import { cx } from '../cx';
import { IconAlert, IconCheck, type IconComponent } from '../icons';

/**
 * - `list`: tarjeta a lo ancho (onboarding, «Tipo de organización»).
 * - `grid`: tarjeta de una grilla de 2 (`tl-option--grid`), círculo arriba a la derecha.
 * - `plan`: Clásica / Premium de PUBL-08 (`tl-option--grid tl-option--plan`), con precio y lo que incluye.
 */
export type OptionCardVariant = 'list' | 'grid' | 'plan';

/** `single` = radio; `multi` = checkbox. El indicador es el mismo: círculo de 22 a la derecha. */
export type OptionCardMode = 'single' | 'multi';

const ignore = () => {};

export interface OptionCardProps extends Omit<ComponentPropsWithRef<'input'>, 'type' | 'children' | 'title'> {
    mode?: OptionCardMode;
    variant?: OptionCardVariant;
    /** Ícono de 24 en el tile de 40. */
    icon: IconComponent;
    /** Título 16/600 («Busco trabajo»). */
    title: ReactNode;
    /** Línea de ejemplo 14 en `color-text-2` («Empleo estable o turnos por día»). */
    example?: ReactNode;
    /** Badge info de lo no lanzado, como pre-registro («Reservas desde marzo»). */
    badge?: string;
    /** plan: el precio, con Amount («Gratis», «$14.990 por 30 días»). */
    price?: ReactNode;
    /** plan: lo que incluye, con viñetas (nunca checks). */
    includes?: readonly ReactNode[];
    /** plan: primera línea de lo que incluye, sin viñeta (el PromotedBadge «Destacado» de Premium). */
    tag?: ReactNode;
    /**
     * plan antes de F3: se ve deshabilitada (`is-disabled` + `aria-disabled`),
     * con el Badge «Pronto» en lugar del precio y lo que incluye legible. Sigue
     * siendo tocable: no se elige, pero emite `onClick` para que la pantalla
     * muestre el Snackbar «Te avisaremos cuando puedas destacar tus publicaciones».
     */
    soon?: boolean;
}

/**
 * Tarjeta de elección grande y tocable: `label.tl-option` con el `input`
 * real, tile, título, ejemplo y el único indicador de selección. Las props
 * nativas (`name`, `value`, `checked`, `onChange`, `disabled`, `ref`…) van al
 * `input`; `className` va a la tarjeta. En grupo, con OptionGroup.
 */
export function OptionCard({
    mode = 'single',
    variant = 'list',
    icon: Icon,
    title,
    example,
    badge,
    price,
    includes,
    tag,
    soon,
    className,
    onClick,
    onChange,
    ...rest
}: OptionCardProps) {
    const plan = variant === 'plan';
    return (
        <label
            className={cx(
                'tl-option',
                variant !== 'list' && 'tl-option--grid',
                plan && 'tl-option--plan',
                // aria-disabled no tiene selector en bundle.css: «Pronto» se ve deshabilitada con la clase.
                soon && 'is-disabled',
                className,
            )}
        >
            <input
                type={mode === 'multi' ? 'checkbox' : 'radio'}
                aria-disabled={soon || undefined}
                onClick={(e) => {
                    if (soon) e.preventDefault();
                    onClick?.(e);
                }}
                // «Pronto» nunca se elige (tampoco con las flechas del teclado).
                onChange={soon ? ignore : onChange}
                {...rest}
            />
            <span className="tl-option__bg" />
            <span className="tl-option__tile">
                <Icon />
            </span>
            <span className="tl-option__body">
                <span className="tl-option__title">{title}</span>
                {example && <span className="tl-option__ex">{example}</span>}
                {badge && <Badge tone="info">{badge}</Badge>}
                {plan && (soon || price) && (
                    <span className="tl-option__price">{soon ? <Badge status="Pronto" /> : price}</span>
                )}
                {plan && (tag || (includes && includes.length > 0)) && (
                    <ul className="tl-option__list">
                        {tag && <li className="is-tag">{tag}</li>}
                        {includes?.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                )}
            </span>
            <span className="tl-option__ind">
                <IconCheck size={16} />
            </span>
        </label>
    );
}

export interface OptionGroupOption<T extends string = string>
    extends Pick<OptionCardProps, 'icon' | 'title' | 'example' | 'badge' | 'price' | 'includes' | 'tag' | 'soon' | 'disabled' | 'className'> {
    value: T;
}

interface OptionGroupBaseProps<T extends string> extends Omit<ComponentPropsWithRef<'fieldset'>, 'onChange' | 'children'> {
    /** Etiqueta del grupo («Elige una o más», «Tipo de organización»). */
    legend: ReactNode;
    /** La etiqueta solo para lectores de pantalla (PUBL-08: el paso ya la dice en su H1). */
    legendHidden?: boolean;
    variant?: OptionCardVariant;
    options: readonly OptionGroupOption<T>[];
    /** Mensaje del grupo al pie, con bordes en danger («Elige al menos una opción para continuar»). */
    error?: ReactNode;
    /** Todo el grupo deshabilitado. */
    disabled?: boolean;
    /** Nombre de los inputs; por defecto uno único. */
    name?: string;
    /** Al tocar una opción `soon` (no se elige): la pantalla muestra su Snackbar. */
    onSoonClick?: (value: T) => void;
}

export interface OptionGroupSingleProps<T extends string> extends OptionGroupBaseProps<T> {
    mode: 'single';
    value: T | null;
    onChange: (next: T) => void;
    max?: undefined;
}

export interface OptionGroupMultiProps<T extends string> extends OptionGroupBaseProps<T> {
    mode: 'multi';
    value: readonly T[];
    onChange: (next: T[]) => void;
    /** Máximo elegible: muestra «2 de 3» junto a la etiqueta y, al llegar, deshabilita las demás hasta quitar una. */
    max?: number;
}

export type OptionGroupProps<T extends string = string> = OptionGroupSingleProps<T> | OptionGroupMultiProps<T>;

/**
 * Grupo de OptionCard: `fieldset.tl-optgroup` (lista) o `--grid` (2
 * columnas; también el plan). Controlado: single recibe y emite un valor;
 * multi, la lista de valores en el orden de las opciones.
 */
export function OptionGroup<T extends string = string>(props: OptionGroupProps<T>) {
    const {
        legend,
        legendHidden,
        variant = 'list',
        options,
        error,
        disabled,
        name,
        onSoonClick,
        className,
        mode,
        value,
        onChange,
        max,
        ...rest
    } = props;
    const autoName = useId();
    const labelId = useId();
    const errorId = useId();
    const groupName = name ?? autoName;
    const multi = mode === 'multi';
    // Las dos formas del valor, normalizadas a la lista de elegidos.
    const selected: readonly T[] = multi ? (value as readonly T[]) : value === null ? [] : [value as T];
    const count = selected.length;
    const atMax = max !== undefined && count >= max;

    const choose = (v: T, on: boolean) => {
        if (multi) {
            (onChange as (next: T[]) => void)(options.map((o) => o.value).filter((x) => (x === v ? on : selected.includes(x))));
        } else {
            (onChange as (next: T) => void)(v);
        }
    };

    // Con máximo, la etiqueta va en la cabecera con el contador (como ChipGroup) y nombra al grupo.
    const head = max !== undefined && (
        <div className="tl-chipgroup__head">
            <span className="tl-chipgroup__label" id={labelId}>{legend}</span>
            <span className="tl-chipgroup__count" aria-live="polite">
                {count} de {max}
            </span>
        </div>
    );

    const group = (
        <fieldset
            className={cx('tl-optgroup', variant !== 'list' && 'tl-optgroup--grid', error ? 'is-error' : undefined, className)}
            role={multi ? undefined : 'radiogroup'}
            aria-labelledby={head ? labelId : undefined}
            aria-invalid={!multi && error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            {...rest}
        >
            {!head && <legend className={legendHidden ? 'tl-vh' : 'tl-group__label'}>{legend}</legend>}
            {options.map((o) => {
                const on = selected.includes(o.value);
                return (
                    <OptionCard
                        key={o.value}
                        mode={mode}
                        variant={variant}
                        name={groupName}
                        value={o.value}
                        icon={o.icon}
                        title={o.title}
                        example={o.example}
                        badge={o.badge}
                        price={o.price}
                        includes={o.includes}
                        tag={o.tag}
                        soon={o.soon}
                        className={o.className}
                        checked={on}
                        disabled={disabled || o.disabled || (atMax && !on)}
                        // multi: cada casilla dice por qué no es válida (single lo dice el radiogroup).
                        aria-invalid={multi && error ? true : undefined}
                        aria-describedby={multi && error ? errorId : undefined}
                        onChange={(e) => choose(o.value, e.target.checked)}
                        onClick={o.soon ? () => onSoonClick?.(o.value) : undefined}
                    />
                );
            })}
            {error && (
                <span className="tl-field__error" id={errorId}>
                    <IconAlert size={16} />
                    <span>{error}</span>
                </span>
            )}
        </fieldset>
    );

    return head ? (
        <>
            {head}
            {group}
        </>
    ) : (
        group
    );
}

export interface OptionLinkProps extends Omit<ComponentPropsWithRef<'a'>, 'children' | 'title' | 'href'> {
    /**
     * Destino, obligatorio: sin `href` el `a` no se enfoca ni se activa con el
     * teclado ni se anuncia como enlace. Con el router, pasa la ruta y
     * navega en `onClick` (con `preventDefault`).
     */
    href: string;
    icon: IconComponent;
    /** La necesidad («Asesor/a del hogar», «Banquetero/a para un evento»). */
    title: ReactNode;
    /** Por defecto `grid` (la grilla «¿Qué necesitas?» del Inicio del hogar). */
    variant?: 'list' | 'grid';
}

/**
 * Atajo (M4): OptionCard que navega en vez de elegir (`a.tl-option--link`).
 * Sin input ni círculo; no tiene seleccionado ni deshabilitado.
 */
export function OptionLink({ icon: Icon, title, variant = 'grid', className, ...rest }: OptionLinkProps) {
    return (
        <a className={cx('tl-option', variant === 'grid' && 'tl-option--grid', 'tl-option--link', className)} {...rest}>
            <span className="tl-option__bg" />
            <span className="tl-option__tile">
                <Icon />
            </span>
            <span className="tl-option__body">
                <span className="tl-option__title">{title}</span>
            </span>
        </a>
    );
}

export interface OptionLinkGroupProps extends ComponentPropsWithRef<'div'> {
    variant?: 'list' | 'grid';
}

/** Grilla de atajos (`div.tl-optgroup--grid`). Ponle `aria-label` si la pantalla no tiene un título que la nombre. */
export function OptionLinkGroup({ variant = 'grid', className, ...rest }: OptionLinkGroupProps) {
    return <div className={cx('tl-optgroup', variant === 'grid' && 'tl-optgroup--grid', className)} {...rest} />;
}
