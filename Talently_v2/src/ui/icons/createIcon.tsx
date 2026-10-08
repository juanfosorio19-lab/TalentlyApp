// Fábrica de íconos del set único de Talently (sistema de diseño de Claude Design).
// Cada ícono es un componente: los demás componentes reciben el componente,
// nunca un string con el nombre.
import { cx } from '../cx';

export type IconSize = 16 | 20 | 24 | 32 | 40;

export interface IconProps {
    /** 24 por defecto. 16 y 20 tienen clase propia en bundle.css; 32 y 40 se fijan en línea. */
    size?: IconSize;
    className?: string;
    /** Si se pasa, el ícono deja de ser decorativo y se anuncia con este nombre. */
    label?: string;
}

export type IconComponent = ((props: IconProps) => React.JSX.Element) & { iconName: string };

export function createIcon(name: string, svg: string): IconComponent {
    const Icon = ({ size = 24, className, label }: IconProps) => (
        <span
            className={cx('tl-icon', (size === 16 || size === 20) && `tl-icon--${size}`, className)}
            style={size === 32 || size === 40 ? { width: size, height: size } : undefined}
            role={label ? 'img' : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
    Icon.displayName = name;
    return Object.assign(Icon, { iconName: name });
}
