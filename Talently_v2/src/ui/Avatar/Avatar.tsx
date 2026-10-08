import { useState, type ComponentPropsWithRef } from 'react';
import { cx } from '../cx';
import { IconShield } from '../icons';

/** 32 · 40 (por defecto) · 56 · 96. */
export type AvatarSize = 32 | 40 | 56 | 96;
/** Persona = redondo · organización (incluida «Familia en …») = cuadrado (`tl-avatar--org`). */
export type AvatarKind = 'person' | 'org';

export interface AvatarProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
    /** Nombre de la persona u organización: de aquí salen las iniciales. */
    name: string;
    kind?: AvatarKind;
    size?: AvatarSize;
    /**
     * Foto real (prestadores de servicios, M10): `img` que llena el contenedor,
     * con el rayado de `tl-avatar--photo` mientras carga. Si no carga, vuelven
     * las iniciales. `true` = marcador rayado de los mockups (catálogo).
     */
    photo?: string | true | null;
    /** Escudo de verificación. Solo con verificación real (teléfono, identidad u organización). */
    verified?: boolean;
    /** Iniciales a mano, si las calculadas no sirven. */
    initials?: string;
    /**
     * Solo si el avatar va SIN el nombre al lado: lo anuncia como imagen
     * («Foto de Luis Contreras»; si `verified`, dilo también). Sin `label`
     * es decorativo (`aria-hidden`), porque el nombre ya está escrito.
     */
    label?: string;
}

// Partículas que no dan inicial («Familia en Ñuñoa» → FÑ, «María de la Luz» → ML).
const PARTICLES = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e', 'en', 'el', 'da', 'das', 'do', 'dos', 'van', 'von']);

/**
 * Iniciales de un nombre: la primera letra de las dos primeras palabras que no
 * son partículas. Se decide por lista y no por mayúscula, porque los nombres
 * que escriben las personas llegan mal capitalizados («jorge Muñoz» → JM).
 * «Matías Rojas» → MR, «Familia en Ñuñoa» → FÑ, «Banquetería Rosa SpA» → BR,
 * «Seguridad andes ltda.» → SA.
 */
export function initialsOf(name: string): string {
    const words = name
        .trim()
        .split(/\s+/)
        .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ''))
        .filter(Boolean);
    const main = words.filter((w) => !PARTICLES.has(w.toLocaleLowerCase('es-CL')));
    return (main.length > 0 ? main : words)
        .slice(0, 2)
        .map((w) => Array.from(w)[0])
        .join('')
        .toLocaleUpperCase('es-CL');
}

/**
 * Imagen de persona (redonda) u organización (cuadrada). Sin foto, iniciales
 * sobre `color-primary-subtle`. No es interactivo: lo toca la fila, la tarjeta
 * o el selector que lo contiene.
 */
export function Avatar({
    name,
    kind = 'person',
    size = 40,
    photo,
    verified,
    initials,
    label,
    className,
    ...rest
}: AvatarProps) {
    // Foto que no cargó: se guarda su URL para volver a las iniciales (y reintentar si cambia).
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const src = typeof photo === 'string' && photo && photo !== failedSrc ? photo : undefined;
    const withPhoto = photo === true || src !== undefined;

    return (
        <span
            className={cx(
                'tl-avatar',
                kind === 'org' && 'tl-avatar--org',
                withPhoto && 'tl-avatar--photo',
                size !== 40 && `tl-avatar--${size}`,
                className,
            )}
            role={label ? 'img' : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            {...rest}
        >
            {src ? (
                <img src={src} alt="" onError={() => setFailedSrc(src)} />
            ) : photo === true ? (
                <span className="tl-avatar__ph" />
            ) : (
                (initials ?? initialsOf(name))
            )}
            {verified && (
                <span className="tl-avatar__verify" title="Verificado">
                    <IconShield />
                </span>
            )}
        </span>
    );
}
