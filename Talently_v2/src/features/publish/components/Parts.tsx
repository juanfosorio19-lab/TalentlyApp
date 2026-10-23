// Piezas de maquetación que src/ui aún no trae como componente (pedidas en
// «requests»): la nota con ícono de 16 delante, la fila «rótulo + valor» del
// resumen y la lista de hechos con check fuera de una tarjeta.
import type { ReactNode } from 'react';
import { cx } from '../../../ui/cx';
import { IconCheck, IconInfo, type IconComponent } from '../../../ui/icons';
import { SectionRow } from '../../../ui/SectionCard';

/**
 * Nota con ícono delante: «Lo pagado nunca salta requisitos…» (caption) o
 * «Garzón o garzona no tiene credenciales obligatorias.» (body), en
 * color-text-2. `tone="text"` solo para «Son 40 horas a la semana.»
 * (PUBL-04 paso 2), que va en color-text y centrada con su ícono.
 */
export function Note({
    icon: Icon,
    children,
    size = 'caption',
    tone = 'muted',
}: {
    icon: IconComponent;
    children: ReactNode;
    size?: 'caption' | 'body';
    tone?: 'muted' | 'text';
}) {
    return (
        <p className={cx('publish-note', size, tone === 'text' && 'publish-note--text')}>
            <span className="publish-note__icon">
                <Icon size={size === 'body' ? 20 : 16} />
            </span>
            <span>{children}</span>
        </p>
    );
}

/** Fila del Resumen (PUBL-03 paso 4): ícono suelto, rótulo en caption y el valor debajo. */
export function SummaryRow({ icon: Icon, label, children }: { icon: IconComponent; label: string; children: ReactNode }) {
    return (
        <SectionRow>
            <span className="publish-row-icon">
                <Icon />
            </span>
            <div className="publish-row-text">
                <span className="caption publish-muted">{label}</span>
                <span className="body">{children}</span>
            </div>
        </SectionRow>
    );
}

export interface Fact {
    text: string;
    ok: boolean;
}

/** Lo que ya está y lo que falta (PUBL-04-identidad): check en success o info en color-text-2. */
export function FactList({ facts, className }: { facts: readonly Fact[]; className?: string }) {
    return (
        <ul className={cx('tl-pub__facts', className)}>
            {facts.map((f) => (
                <li key={f.text} className={cx('tl-pub__fact', f.ok && 'tl-pub__fact--ok')}>
                    {f.ok ? <IconCheck /> : <IconInfo />}
                    <span>{f.text}</span>
                </li>
            ))}
        </ul>
    );
}
