import { useId, useMemo, type ComponentPropsWithRef } from 'react';
import { cx } from '../cx';
import { LOGO_SVG, LOGO_TILE_SVG } from './logos.generated';

/** `sm` 32 · `md` 56 · `lg` 72. */
export type BrandLogoSize = 'sm' | 'md' | 'lg';
/** `tile`: la T blanca sobre el tile con `gradient-brand` (sección 10.1) · `plain`: la T con `gradient-brand`, sin tile (sección 10.2). */
export type BrandLogoVariant = 'tile' | 'plain';

export interface BrandLogoProps
    extends Omit<ComponentPropsWithRef<'span'>, 'children' | 'dangerouslySetInnerHTML' | 'aria-label' | 'role'> {
    size?: BrandLogoSize;
    /** Sobre un gradiente (hero de Bienvenida) solo `tile`: la variante sin tile desaparece. */
    variant?: BrandLogoVariant;
}

// Los id de gradiente de los SVG oficiales (`tl-bg`, `tl-t`, `tm`) y sus `url(#…)`.
const GRADIENT_ID = /(id="|url\(#)(tl-bg|tl-t|tm)(?=[")])/g;

/**
 * El logo oficial de Talently, la «T», desde sus SVG oficiales tal cual
 * (`logos.generated.ts`, nunca redibujado ni reemplazado por un ícono).
 *
 * Siempre decorativo (`aria-hidden`): quien consume da solo el tamaño y la
 * variante, y «Talently» se escribe aparte, en texto (o en `.tl-vh`).
 *
 * Cada copia lleva sus propios id de gradiente: `url(#tl-bg)` apunta a la
 * primera definición del documento y, si esa copia está dentro de un
 * `display: none` (pestaña oculta, SideNav en riel), Chromium/WebView deja sin
 * relleno a todas las demás.
 */
export function BrandLogo({ size = 'md', variant = 'tile', className, ...rest }: BrandLogoProps) {
    const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
    const html = useMemo(
        () => (variant === 'tile' ? LOGO_TILE_SVG : LOGO_SVG).replace(GRADIENT_ID, `$1$2-${uid}`),
        [variant, uid],
    );
    return (
        <span
            className={cx('tl-logo', `tl-logo--${size}`, className)}
            aria-hidden="true"
            {...rest}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
