// Piezas de maquetación que src/ui aún no trae como componente (pedidas en
// «requests»): la nota con ícono de 16 delante, la fila «rótulo + valor» del
// resumen y la lista de hechos con check fuera de una tarjeta.
import type { ReactNode } from 'react';
import { cx } from '../../../ui/cx';
import { IconCheck, IconInfo, type IconComponent } from '../../../ui/icons';
import { SectionRow } from '../../../ui/SectionCard';

/** «Lo pagado nunca salta requisitos…» (caption) o «Son 40 horas a la semana.» (body, en color-text). */
export function Note({ icon: Icon, children, size = 'caption' }: { icon: IconComponent; children: ReactNode; size?: 'caption' | 'body' }) {
    return (
        <p className={cx('publish-note', size, size === 'body' && 'publish-note--text')}>
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
