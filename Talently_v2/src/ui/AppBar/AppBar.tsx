import {
    useCallback,
    useSyncExternalStore,
    type ComponentPropsWithRef,
    type MouseEventHandler,
    type ReactNode,
} from 'react';
import { cx } from '../cx';
import { IconChevronDown, IconMore } from '../icons';
import { Avatar, type AvatarKind } from '../Avatar';
import { BackButton, IconButton } from '../IconButton';

/** large: pestañas · standard: pantallas apiladas · chat: conversación (M5) · transparent: sobre una foto o cabecera. */
export type AppBarVariant = 'large' | 'standard' | 'chat' | 'transparent';

/** Elemento del título. h1 por defecto; StepLayout usa `p`, porque el H1 del paso va en el cuerpo. */
export type AppBarTitleTag = 'h1' | 'h2' | 'p';

interface AppBarCommonProps extends Omit<ComponentPropsWithRef<'header'>, 'title' | 'children'> {
    /**
     * Hay contenido pasando por debajo: gana `color-surface` y `elev-2`
     * (`is-scrolled`). En una pantalla con scroll de ventana, `useScrolled()`.
     * El transparente, además, muestra el título.
     */
    scrolled?: boolean;
}

export interface AppBarLargeProps extends AppBarCommonProps {
    variant?: 'large';
    /** Título H1 de la pestaña («Inicio», «Explorar», «Hola, Rosa»). */
    title: ReactNode;
    titleAs?: AppBarTitleTag;
    /**
     * A la derecha, en este orden: ActorSelector (solo Inicio y Perfil, y solo
     * si la persona pertenece a una organización que no es su hogar), Filtros
     * (solo Explorar), la campana (siempre) y Ajustes (solo Perfil).
     */
    actions?: ReactNode;
}

export interface AppBarStandardProps extends AppBarCommonProps {
    /** `transparent`: sin título hasta el scroll y con los íconos sobre un círculo `color-surface` al 90 %. */
    variant: 'standard' | 'transparent';
    /** H3 centrado que se corta con «…». Sin título (acceso, AUTH-02 a AUTH-06), solo el BackButton. */
    title?: ReactNode;
    titleAs?: AppBarTitleTag;
    /** Obligatorio: la app pasa `useGoBack()` (vuelve a la pantalla de origen, como el atrás de Android). */
    onBack: () => void;
    backLabel?: string;
    /** Hasta 2 IconButton («Compartir», «Guardar», «Más opciones»). */
    actions?: ReactNode;
}

/** Quién está al otro lado de la conversación. Tocarlo abre su perfil público. */
export interface AppBarChatPeer {
    /** Nombre completo («Seguridad Andes Ltda.»): se corta con «…». */
    name: string;
    /** Línea 12/500 en `color-text-2` («Organización verificada»). */
    meta?: ReactNode;
    kind?: AvatarKind;
    /** Punto de verificación del Avatar: solo con verificación real. */
    verified?: boolean;
    photo?: string | true | null;
    /** Perfil público. Con `href` es un enlace; sin él, un botón con `onClick`. */
    href?: string;
    /** En la app: `preventDefault()` + `navigate(href)`. */
    onClick?: MouseEventHandler<HTMLElement>;
    /** Nombre accesible; por defecto «Ver perfil de <nombre>». */
    label?: string;
    /** Solo catálogo: fuerza `is-pressed` / `is-focus`. */
    className?: string;
}

export interface AppBarChatProps extends AppBarCommonProps {
    variant: 'chat';
    peer: AppBarChatPeer;
    /** Obligatorio: la app pasa `useGoBack()`. */
    onBack: () => void;
    backLabel?: string;
    /** ⋯ abre la hoja Ver publicación · Reportar · Bloquear. */
    onMore: MouseEventHandler<HTMLButtonElement>;
    moreLabel?: string;
}

export type AppBarProps = AppBarLargeProps | AppBarStandardProps | AppBarChatProps;

// Vista plana de la unión, para leer las props de cualquier variante de una vez.
type AnyAppBarProps = AppBarCommonProps & {
    variant?: AppBarVariant;
    title?: ReactNode;
    titleAs?: AppBarTitleTag;
    actions?: ReactNode;
    onBack?: () => void;
    backLabel?: string;
    peer?: AppBarChatPeer;
    onMore?: MouseEventHandler<HTMLButtonElement>;
    moreLabel?: string;
};

/**
 * La barra superior: una por pantalla. En reposo sobre `color-bg`; con
 * `scrolled`, `color-surface` + `elev-2`. Lleva el espaciador del safe area
 * superior (`.tl-statusbar` vacío: env(safe-area-inset-top) en el teléfono,
 * 0 en web); la status bar «13:00» existe solo en los mockups.
 */
export function AppBar(props: AppBarProps) {
    const {
        variant = 'large',
        title,
        titleAs: Title = 'h1',
        actions,
        onBack,
        backLabel,
        peer,
        onMore,
        moreLabel = 'Más opciones',
        scrolled,
        className,
        ...rest
    } = props as AnyAppBarProps;

    if (variant === 'chat' && peer) {
        return (
            <header className={cx('tl-appbar tl-appbar--chat', scrolled && 'is-scrolled', className)} {...rest}>
                <div className="tl-statusbar" aria-hidden="true" />
                <div className="tl-appbar__row">
                    <BackButton label={backLabel} onClick={onBack} />
                    <ChatPeer peer={peer} />
                    <div className="tl-appbar__actions">
                        <IconButton icon={IconMore} label={moreLabel} aria-haspopup="dialog" onClick={onMore} />
                    </div>
                </div>
            </header>
        );
    }

    if (variant === 'standard' || variant === 'transparent') {
        return (
            <header
                className={cx(
                    'tl-appbar tl-appbar--standard',
                    variant === 'transparent' && 'tl-appbar--transparent',
                    scrolled && 'is-scrolled',
                    className,
                )}
                {...rest}
            >
                <div className="tl-statusbar" aria-hidden="true" />
                <div className="tl-appbar__row">
                    <div>
                        <BackButton label={backLabel} onClick={onBack} />
                    </div>
                    {title != null && title !== '' ? (
                        <Title className="tl-appbar__title h3">{title}</Title>
                    ) : (
                        // Mantiene las 3 columnas de la grilla (92 · título · 92) sin un encabezado vacío.
                        <span className="tl-appbar__title" />
                    )}
                    <div className="tl-appbar__actions">{actions}</div>
                </div>
            </header>
        );
    }

    return (
        <header className={cx('tl-appbar', scrolled && 'is-scrolled', className)} {...rest}>
            <div className="tl-statusbar" aria-hidden="true" />
            <div className="tl-appbar__row">
                <Title className="tl-appbar__title h1">{title}</Title>
                {actions && <div className="tl-appbar__actions">{actions}</div>}
            </div>
        </header>
    );
}

/** Avatar de 40, nombre 16/600 y una línea 12/500: tocable, abre el perfil público. */
function ChatPeer({ peer }: { peer: AppBarChatPeer }) {
    const { name, meta, kind, verified, photo, href, onClick, label, className } = peer;
    const content = (
        <>
            <Avatar name={name} kind={kind} verified={verified} photo={photo} />
            <span className="tl-appbar__who-text">
                <span className="tl-appbar__name">{name}</span>
                {meta && <span className="tl-appbar__meta">{meta}</span>}
            </span>
        </>
    );
    const common = {
        className: cx('tl-appbar__who', className),
        'aria-label': label ?? `Ver perfil de ${name}`,
        onClick,
    };
    return href !== undefined ? (
        <a href={href} {...common}>
            {content}
        </a>
    ) : (
        <button type="button" {...common}>
            {content}
        </button>
    );
}

export interface ActorSelectorProps extends Omit<ComponentPropsWithRef<'button'>, 'children'> {
    /** Nombre completo del actor actual: de aquí salen las iniciales («Jorge Muñoz» → JM). */
    name: string;
    /** Nombre corto que se ve («Jorge», «Seguridad Andes»); se corta con «…». Por defecto, `name`. */
    shortName?: string;
    /** Persona = Avatar redondo; organización = cuadrado. El hogar nunca aparece aquí. */
    kind?: AvatarKind;
    photo?: string | null;
}

/**
 * Selector de actor del AppBar large (`.tl-actor`): chip de 40 con Avatar de
 * 32, nombre corto y chevron. Abre la hoja «Usar Talently como» (`onClick`).
 * Solo en Inicio y Perfil, y solo si la persona pertenece a una organización
 * que no es su hogar. Bajo 375 px de ancho baja a 144 px de máximo.
 */
export function ActorSelector({ name, shortName, kind = 'person', photo, type = 'button', className, ...rest }: ActorSelectorProps) {
    const shown = shortName ?? name;
    return (
        <button
            type={type}
            className={cx('tl-actor', className)}
            aria-haspopup="dialog"
            aria-label={`Usar Talently como: ${shown}`}
            {...rest}
        >
            <Avatar name={name} kind={kind} size={32} photo={photo} />
            <span className="tl-actor__name">{shown}</span>
            <IconChevronDown />
        </button>
    );
}

function subscribeToScroll(onChange: () => void): () => void {
    window.addEventListener('scroll', onChange, { passive: true });
    return () => window.removeEventListener('scroll', onChange);
}

/**
 * `true` cuando la ventana bajó más de `threshold` px: para el `scrolled`
 * del AppBar en pantallas cuyo contenido pasa por debajo. Escucha el scroll
 * de `window` con un listener pasivo y lo suelta al desmontar.
 */
export function useScrolled(threshold = 4): boolean {
    const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold]);
    return useSyncExternalStore(subscribeToScroll, getSnapshot, () => false);
}
