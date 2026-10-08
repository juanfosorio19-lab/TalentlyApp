// Piezas de maquetación SOLO para el catálogo /dev/ui (no se usan en pantallas).
import type { CSSProperties, ReactNode } from 'react';
import { cx } from '../cx';

/** Un bloque titulado dentro de la demo de un componente («Variantes», «Estados»). */
export function DemoSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="dev-sec">
            <h3 className="overline dev-sec__title">{title}</h3>
            {children}
        </section>
    );
}

/** Fila que envuelve: para variantes lado a lado. */
export function DemoRow({
    children,
    column,
    end,
    tight,
    className,
}: {
    children: ReactNode;
    column?: boolean;
    /** Alinea abajo (rótulos en una sola línea bajo muestras de distinto alto). */
    end?: boolean;
    /** Separación de 8 en vez de 16. */
    tight?: boolean;
    className?: string;
}) {
    return (
        <div className={cx('dev-row', column && 'dev-row--column', end && 'dev-row--end', tight && 'dev-row--tight', className)}>
            {children}
        </div>
    );
}

/** Rótulo pequeño bajo una muestra («presionado», «deshabilitado»). */
export function DemoLabel({ children }: { children: ReactNode }) {
    return <span className="caption dev-label">{children}</span>;
}

/** Muestra + rótulo apilados. */
export function DemoItem({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="dev-item">
            {children}
            <DemoLabel>{label}</DemoLabel>
        </div>
    );
}

/**
 * Marco de teléfono (ancho 360/390/412) para componentes de estructura y
 * capas: crea un contexto de posición para hojas, diálogos y snackbars
 * renderizados en línea (`portal={false}`).
 */
export function DemoFrame({ width = 390, height, children }: { width?: 360 | 390 | 412; height?: number; children: ReactNode }) {
    const style: CSSProperties = { width, height };
    return (
        <div className="dev-frame" style={style}>
            {children}
        </div>
    );
}

/**
 * Estado que el componente no tiene, con su motivo (como `.na` en los
 * preview.html del sistema): «No aplica» + por qué.
 */
export function DemoNotApplicable({ state, children }: { state?: string; children: ReactNode }) {
    return (
        <div className="dev-na">
            <span className="tl-badge">No aplica</span>
            <span>{state ? <><strong>{state}:</strong> {children}</> : children}</span>
        </div>
    );
}
