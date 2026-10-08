import type { ComponentPropsWithRef, CSSProperties } from 'react';
import { cx } from '../cx';
import { Stack } from '../Layout';

/**
 * line 12 · title 16 · chip 28 pill · tag 28 radio sm (forma de InfoTag) ·
 * circle (avatar de persona) · square (avatar de organización, botones).
 */
export type SkeletonShape = 'line' | 'title' | 'chip' | 'tag' | 'circle' | 'square';

type Length = number | string;

export interface SkeletonProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
    shape: SkeletonShape;
    /** Ancho del contenido que imita (px o %). */
    width?: Length;
    /** Alto, si no es el de la forma (title de 20 para un nombre). */
    height?: Length;
    /** circle y square: ancho y alto iguales (40 avatar, 96 avatar de perfil). */
    size?: number;
}

/**
 * Un bloque con la forma del contenido que viene: `color-border` con un brillo
 * `color-surface-2` de 1,4 s (quieto con «reducir movimiento»). Va dentro del
 * contenedor real, que lleva `aria-busy` (ver `SkeletonGroup`).
 */
export function Skeleton({ shape, width, height, size, style, className, ...rest }: SkeletonProps) {
    const geometry: CSSProperties = { width: size ?? width, height: size ?? height, ...style };
    return <span className={cx('tl-skel', `tl-skel--${shape}`, className)} aria-hidden="true" style={geometry} {...rest} />;
}

export interface SkeletonGroupProps extends ComponentPropsWithRef<'div'> {
    /** Texto oculto para el lector de pantalla («Cargando turnos…»). */
    label?: string;
}

/**
 * El contenedor real mientras carga: `aria-busy="true"` y «Cargando…» oculto
 * con `.tl-vh`. Pasa la clase del contenedor real (`tl-card`, `tl-list`…) en
 * `className`. Si tarda más de 10 s o falla, se reemplaza por ErrorState.
 */
export function SkeletonGroup({ label = 'Cargando…', className, children, ...rest }: SkeletonGroupProps) {
    return (
        <div className={className} aria-busy="true" {...rest}>
            <span className="tl-vh">{label}</span>
            {children}
        </div>
    );
}

export interface SkeletonListProps extends Omit<SkeletonGroupProps, 'children'> {
    /** Filas que se muestran mientras carga. */
    rows?: number;
    /** circle: personas · square: organizaciones (radio md). */
    avatar?: 'circle' | 'square';
}

/** Lista que carga (ListItem): avatar de 40 + 2 líneas por fila, separadas por space-2. */
export function SkeletonList({ rows = 3, avatar = 'circle', label, className, ...rest }: SkeletonListProps) {
    return (
        <SkeletonGroup label={label} className={className} {...rest}>
            <ul className="tl-list" aria-hidden="true">
                {Array.from({ length: rows }, (_, i) => (
                    <li key={i}>
                        <div className="tl-listitem tl-listitem--multiline">
                            <Skeleton shape={avatar} size={40} />
                            <span className="tl-listitem__body tl-stack tl-stack--2">
                                <Skeleton shape="title" width="70%" />
                                <Skeleton shape="line" width="45%" />
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </SkeletonGroup>
    );
}

/**
 * Tarjeta que carga, con la estructura de PublicationCard completa:
 * cabecera (avatar de organización + 2 líneas), título, InfoTag, monto,
 * lugar y CTA.
 */
export function SkeletonCard({ label, className, ...rest }: Omit<SkeletonGroupProps, 'children'>) {
    return (
        <SkeletonGroup label={label} className={cx('tl-pub', className)} {...rest}>
            <div className="tl-pub__head" aria-hidden="true">
                <span className="tl-avatar tl-avatar--org">
                    <Skeleton shape="square" size={40} />
                </span>
                <span className="tl-pub__by"><Skeleton shape="line" width="55%" /></span>
                <span className="tl-pub__trust"><Skeleton shape="line" width="35%" /></span>
            </div>
            <span className="tl-pub__title" aria-hidden="true"><Skeleton shape="title" width="80%" /></span>
            <span className="tl-tags tl-pub__tags" aria-hidden="true">
                <Skeleton shape="tag" width={136} />
                <Skeleton shape="tag" width={96} />
            </span>
            <span className="tl-pub__amount tl-stack tl-stack--3" aria-hidden="true">
                <Skeleton shape="title" width="50%" />
                <Skeleton shape="line" width="40%" />
            </span>
            <span className="tl-pub__cta" aria-hidden="true"><Skeleton shape="square" width="100%" height={44} /></span>
        </SkeletonGroup>
    );
}

/** Perfil que carga: avatar de 96, nombre, comuna e insignias centrados (como `.skprof` del preview) y una sección. */
export function SkeletonProfile({ label, className, ...rest }: Omit<SkeletonGroupProps, 'children'>) {
    return (
        <SkeletonGroup label={label} className={cx('tl-card', className)} {...rest}>
            <Stack gap={6} aria-hidden="true">
                <Stack gap={3} align="center">
                    <Skeleton shape="circle" size={96} />
                    <Skeleton shape="title" width="50%" height={20} />
                    <Skeleton shape="line" width="35%" />
                    <span className="tl-chipgroup__chips">
                        <Skeleton shape="chip" width={88} />
                        <Skeleton shape="chip" width={120} />
                    </span>
                </Stack>
                <Stack gap={3}>
                    <Skeleton shape="title" width="30%" />
                    <Skeleton shape="line" width="90%" />
                    <Skeleton shape="line" width="75%" />
                </Stack>
            </Stack>
        </SkeletonGroup>
    );
}
