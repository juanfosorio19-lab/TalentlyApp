import {
    useEffect,
    useId,
    useState,
    type ComponentPropsWithRef,
    type HTMLAttributes,
    type MouseEvent,
    type MouseEventHandler,
    type ReactNode,
    type Ref,
} from 'react';
import { cx } from '../cx';
import { IconChevronDown, IconChevronRight, IconHeart, IconTrash, type IconComponent } from '../icons';
import { Badge } from '../Badge';
import { IconButton } from '../IconButton';
import { InfoTag, InfoTags } from '../InfoTag';
import { Spinner } from '../Spinner';

/* ---------- List ---------- */

export interface ListProps extends ComponentPropsWithRef<'ul'> {
    /** Sin borde ni fondo, dentro de una hoja (`tl-list--flat`, brecha B3 de app.css). */
    flat?: boolean;
}

/** `ul.tl-list`: Card con divisores `color-border` entre filas. Sus hijos son `ListItem` (cada uno es un `li`). */
export function List({ flat, className, ...rest }: ListProps) {
    return <ul className={cx('tl-list', flat && 'tl-list--flat', className)} {...rest} />;
}

export interface ListColumnsProps {
    /** Encabezados de las columnas de Switch, en Overline («Teléfono», «Correo»). */
    columns: readonly string[];
}

/**
 * Encabezado de la fila de dos canales (CFG-03), primer hijo de la List.
 * Oculto al lector: cada Switch ya dice su canal («Mensajes por correo»).
 */
export function ListColumns({ columns }: ListColumnsProps) {
    return (
        <li className="tl-list__cols" aria-hidden="true">
            {columns.map((c) => (
                <span key={c} className="overline">
                    {c}
                </span>
            ))}
        </li>
    );
}

/* ---------- ListItem ---------- */

/** Props del `input[role=switch]` de la fila (checked, onChange nativo, disabled, name, ref…). */
export type ListItemSwitchProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'role' | 'children'>;

export interface ListItemChannel extends ListItemSwitchProps {
    /** Nombre completo del Switch para el lector de pantalla («Mensajes por correo»). */
    label: string;
}

export interface ListItemProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'children' | 'onClick'> {
    /** Título 16 («Notificaciones», «Seguridad Andes Ltda.»). */
    title: ReactNode;
    /** Línea secundaria 14 en `color-text-2`. Varias líneas: un arreglo (postulante: oficio y pretensión). */
    sub?: ReactNode | readonly ReactNode[];

    /* Inicio */
    /** Tile de ícono de 40 (`radius-md`, `color-primary-subtle`). */
    icon?: IconComponent;
    /** O un `<Avatar />` (persona redondo, organización cuadrado). */
    avatar?: ReactNode;

    /* Cuerpo */
    /** Persona favorita: corazón junto al nombre, con su texto oculto. */
    favorite?: boolean;
    favoriteLabel?: string;
    /** Conversación: `<ContextChipInRow />` bajo el nombre. */
    context?: ReactNode;
    /** Estado bajo el texto (M4): `<Badge status="…" />`. Al final queda solo el chevron. */
    status?: ReactNode;
    /** Bloques horarios (ACT-04): InfoTag sin ícono bajo el título («16:00–21:00»). */
    tags?: readonly ReactNode[];
    /** Postulante (M7): insignias y nota (`.tl-listitem__badges`). */
    badges?: ReactNode;
    /** Acciones bajo el texto (`.tl-listitem__actions`): «Avanzar» / «No seleccionar», «Asistió» / «No asistió». */
    actions?: ReactNode;

    /* Final */
    /** Valor actual en `color-text-2` («Según el sistema»). */
    value?: ReactNode;
    /** Otro contenido al final: un Badge, o un Button ghost sm («Revocar») en una fila informativa. */
    end?: ReactNode;
    /** `IconChevronRight` al final. Por defecto, solo si la fila navega de verdad (`href` en un `a` o `button`) y no es conversación. */
    chevron?: boolean;
    /** Punto de no leído (M2) con «Sin leer» oculto. Solo con algo realmente sin leer. */
    unread?: boolean;
    unreadLabel?: string;
    /** Conversación: hora relativa («hace 10 min», «28 nov»). */
    time?: ReactNode;
    /** Conversación: número real de mensajes sin leer (Badge primary; nombre en 600). */
    unreadCount?: number;
    /** Quitar: basurero en `color-text-2` al final; la fila pasa a ser informativa (`div`). */
    onRemove?: MouseEventHandler<HTMLButtonElement>;
    /** Por defecto «Quitar <título>». */
    removeLabel?: string;
    /** Switch al final: la fila es un `label` y el nombre del Switch es su texto. */
    toggle?: ListItemSwitchProps;
    /** Dos canales (CFG-03): un Switch por canal, en columnas de 64, bajo `ListColumns`. */
    channels?: readonly ListItemChannel[];

    /* Desplegable (AYU-01) */
    /** Respuesta que se abre en el lugar (`tl-listitem--expand`, `aria-expanded`). Un string va en un `p`. */
    panel?: ReactNode;
    /** Controlado. Sin él, la fila guarda su propio estado (`defaultExpanded`). */
    expanded?: boolean;
    defaultExpanded?: boolean;
    onExpandedChange?: (expanded: boolean) => void;

    /* Acción de la fila */
    /**
     * La fila navega: `a.tl-listitem`. En la app, `onClick` hace `preventDefault()` + `navigate(href)`.
     * Una fila con controles adentro (persona, quitar, dos canales, acciones o insignias) es un `div`
     * y no navega: el enlace va en el título.
     */
    href?: string;
    target?: string;
    rel?: string;
    /**
     * Sin `href`: la fila es un `button` que hace algo (abre una hoja, un Dialog). Con `toggle` no se
     * usa (el `label` ya cambia el Switch): el cambio llega por `toggle.onChange`.
     */
    onClick?: MouseEventHandler<HTMLElement>;

    /* Variantes y estados */
    /** `chat`: Mensajes (M5) · `person`: GES-02, GES-04 y GES-05 (siempre una fila `div`, con sus botones adentro). */
    variant?: 'chat' | 'person';
    /** Acción destructiva al pie: abre un Dialog o, con confirmación escrita, su pantalla. */
    danger?: boolean;
    /** Alinea arriba cuando el texto ocupa varias líneas (Button al final, dos canales). */
    multiline?: boolean;
    /** Textos y tile en `color-text-disabled`; `sub` dice cuándo estará disponible. */
    disabled?: boolean;
    /** Spinner de 16 al final (en una fila con Switch, dentro del thumb) y la fila bloqueada. */
    loading?: boolean;
    /** Reemplaza la línea secundaria mientras carga («Preparando el archivo…»). */
    loadingLabel?: string;
    ref?: Ref<HTMLElement>;
}

/** «99+» como máximo, igual que la TabBar. */
function countText(n: number): string {
    return n > 99 ? '99+' : String(n);
}

const blockClick = (event: MouseEvent<HTMLElement>) => event.preventDefault();
const ignore = () => {};

/**
 * Fila de lista (`li` > `.tl-listitem`) de alto mínimo 56: inicio (tile o
 * Avatar), cuerpo (título 16 y línea 14) y final. La fila es un elemento
 * tocable real cuando tiene acción: `a` si navega (`href`), `button` si hace
 * algo (`onClick`), `label` con un Switch y `button[aria-expanded]` si se
 * despliega. Con controles adentro (persona, quitar, dos canales, acciones o
 * insignias que se tocan) es un `div`, para no meter un botón dentro de otro:
 * ahí `href` y `onClick` no se usan (avisa en desarrollo) y el enlace va en el
 * título. Por lo mismo, `end` solo lleva un botón en una fila sin `href` ni
 * `onClick`.
 */
export function ListItem({
    title,
    sub,
    icon: Icon,
    avatar,
    favorite,
    favoriteLabel = 'Favorito',
    context,
    status,
    tags,
    badges,
    actions,
    value,
    end,
    chevron,
    unread,
    unreadLabel = 'Sin leer',
    time,
    unreadCount,
    onRemove,
    removeLabel,
    toggle,
    channels,
    panel,
    expanded,
    defaultExpanded = false,
    onExpandedChange,
    href,
    target,
    rel,
    onClick,
    variant,
    danger,
    multiline,
    disabled,
    loading,
    loadingLabel,
    ref,
    className,
    ...rest
}: ListItemProps) {
    const panelId = useId();
    const [ownExpanded, setOwnExpanded] = useState(defaultExpanded);
    const isExpanded = expanded ?? ownExpanded;
    const expandable = panel !== undefined && panel !== null;

    // La persona siempre es un div (README ListItem, M6): su acción («Confirmar») va adentro.
    const hasInnerControls = Boolean(onRemove || channels || actions || badges || variant === 'person');
    const kind: 'expand' | 'label' | 'a' | 'button' | 'div' = expandable
        ? 'expand'
        : toggle
          ? 'label'
          : hasInnerControls
            ? 'div'
            : href !== undefined && !disabled
              ? 'a'
              : href !== undefined || onClick
                ? 'button'
                : 'div';

    // Una fila div no navega: `href` y `onClick` se perderían sin aviso.
    const dropsAction = kind === 'div' && hasInnerControls && (href !== undefined || onClick !== undefined);
    useEffect(() => {
        if (import.meta.env.DEV && dropsAction) {
            console.error('ListItem: una fila con controles adentro no navega; pon el enlace en el título o quita los controles');
        }
    }, [dropsAction]);

    const unreadN = unreadCount !== undefined && unreadCount > 0 ? Math.floor(unreadCount) : 0;
    const subs = loading && loadingLabel ? [loadingLabel] : sub === undefined || sub === null ? [] : Array.isArray(sub) ? sub : [sub];
    // El chevron promete navegar: solo en una fila que navega de verdad. La conversación
    // no lo lleva: toda la fila abre el chat (M5).
    const showChevron = chevron ?? ((kind === 'a' || (kind === 'button' && href !== undefined)) && variant !== 'chat');

    const rowClass = cx(
        'tl-listitem',
        variant && `tl-listitem--${variant}`,
        danger && 'tl-listitem--danger',
        expandable && 'tl-listitem--expand',
        (multiline || channels) && 'tl-listitem--multiline',
        unreadN > 0 && 'is-unread',
        // bundle.css solo pinta el deshabilitado con la clase (no hay selector `:disabled`).
        disabled && 'is-disabled',
        loading && 'is-loading',
        className,
    );

    const start = Icon ? (
        <span className="tl-listitem__tile">
            <Icon />
        </span>
    ) : (
        avatar
    );

    const body = (
        <span className="tl-listitem__body">
            <span className="tl-listitem__title">
                {title}
                {favorite && (
                    <span className="tl-listitem__fav" role="img" aria-label={favoriteLabel}>
                        <IconHeart />
                    </span>
                )}
            </span>
            {context}
            {subs.map((line, i) => (
                <span key={i} className="tl-listitem__sub">
                    {line}
                </span>
            ))}
            {status}
            {tags && tags.length > 0 && (
                <InfoTags>
                    {tags.map((tag, i) => (
                        <InfoTag key={i}>{tag}</InfoTag>
                    ))}
                </InfoTags>
            )}
            {badges && <span className="tl-listitem__badges">{badges}</span>}
            {actions && <span className="tl-listitem__actions">{actions}</span>}
        </span>
    );

    const switchControl = toggle && <SwitchControl {...toggle} disabled={disabled || toggle.disabled} loading={loading} />;

    const endContent = channels ? (
        <span className="tl-listitem__end tl-listitem__end--cols">
            {channels.map(({ label, ...input }) => (
                <SwitchControl
                    key={label}
                    as="label"
                    aria-label={label}
                    {...input}
                    disabled={disabled || input.disabled}
                    loading={loading}
                />
            ))}
        </span>
    ) : (
        <span className="tl-listitem__end">
            {time && <span className="tl-listitem__time">{time}</span>}
            {unreadN > 0 && (
                <>
                    <Badge tone="primary" aria-hidden="true">
                        {countText(unreadN)}
                    </Badge>
                    <span className="tl-vh">
                        {unreadN} {unreadN === 1 ? 'mensaje sin leer' : 'mensajes sin leer'}
                    </span>
                </>
            )}
            {loading && !toggle ? (
                <Spinner size={16} />
            ) : (
                <>
                    {value && <span className="tl-listitem__value">{value}</span>}
                    {end}
                    {unread && (
                        <>
                            <span className="tl-unread" aria-hidden="true" />
                            <span className="tl-vh">{unreadLabel}</span>
                        </>
                    )}
                    {switchControl}
                    {onRemove && (
                        <IconButton
                            icon={IconTrash}
                            label={removeLabel ?? (typeof title === 'string' ? `Quitar ${title}` : 'Quitar')}
                            disabled={disabled}
                            onClick={onRemove}
                        />
                    )}
                    {showChevron && <IconChevronRight />}
                    {expandable && <IconChevronDown />}
                </>
            )}
        </span>
    );

    const content = (
        <>
            {start}
            {body}
            {endContent}
        </>
    );

    const busy = loading || undefined;

    if (kind === 'expand') {
        const toggleExpanded = (event: MouseEvent<HTMLButtonElement>) => {
            onClick?.(event);
            if (event.defaultPrevented) return;
            const next = !isExpanded;
            if (expanded === undefined) setOwnExpanded(next);
            onExpandedChange?.(next);
        };
        return (
            <li>
                <button
                    ref={ref as Ref<HTMLButtonElement>}
                    type="button"
                    className={rowClass}
                    aria-expanded={isExpanded}
                    aria-controls={isExpanded ? panelId : undefined}
                    aria-busy={busy}
                    disabled={disabled}
                    onClick={loading ? undefined : toggleExpanded}
                    {...rest}
                >
                    {content}
                </button>
                {isExpanded && (
                    <div className="tl-listitem__panel" id={panelId}>
                        {typeof panel === 'string' ? <p>{panel}</p> : panel}
                    </div>
                )}
            </li>
        );
    }

    if (kind === 'label') {
        return (
            <li>
                {/* Sin onClick: el label reenvía el toque al Switch y lo dispararía dos veces. */}
                <label ref={ref as Ref<HTMLLabelElement>} className={rowClass} aria-busy={busy} {...rest}>
                    {content}
                </label>
            </li>
        );
    }

    if (kind === 'a') {
        return (
            <li>
                <a
                    ref={ref as Ref<HTMLAnchorElement>}
                    className={rowClass}
                    href={href}
                    target={target}
                    rel={rel}
                    aria-busy={busy}
                    // `is-loading` solo bloquea el puntero: Enter tampoco debe navegar mientras carga.
                    onClick={loading ? blockClick : onClick}
                    {...rest}
                >
                    {content}
                </a>
            </li>
        );
    }

    if (kind === 'button') {
        return (
            <li>
                <button
                    ref={ref as Ref<HTMLButtonElement>}
                    type="button"
                    className={rowClass}
                    aria-busy={busy}
                    disabled={disabled}
                    onClick={loading ? undefined : onClick}
                    {...rest}
                >
                    {content}
                </button>
            </li>
        );
    }

    return (
        <li>
            <div ref={ref as Ref<HTMLDivElement>} className={rowClass} aria-busy={busy} aria-disabled={disabled || undefined} {...rest}>
                {content}
            </div>
        </li>
    );
}

/* ---------- Switch de la fila ---------- */

type SwitchControlProps = ListItemSwitchProps & {
    /** `span` dentro de una fila `label`; `label` propio en las columnas de dos canales. */
    as?: 'span' | 'label';
    loading?: boolean;
};

/**
 * El Switch sin su fila `tl-choice` (que ya pone el ListItem): `input[role=switch]`
 * + riel + thumb con el spinner de 16 que bundle.css muestra con `is-loading`.
 */
function SwitchControl({ as: Root = 'span', loading, onClick, onChange, className, ...input }: SwitchControlProps) {
    return (
        <Root className={cx('tl-switch', className)}>
            <input
                type="checkbox"
                role="switch"
                aria-busy={loading || undefined}
                // Mientras guarda no cambia (ni con Espacio: la fila ya bloquea el toque).
                onClick={loading ? blockClick : onClick}
                onChange={loading ? ignore : onChange}
                {...input}
            />
            <span className="tl-switch__track">
                <span className="tl-switch__thumb">
                    <span className="tl-spinner tl-spinner--16" aria-hidden="true" />
                </span>
            </span>
        </Root>
    );
}
