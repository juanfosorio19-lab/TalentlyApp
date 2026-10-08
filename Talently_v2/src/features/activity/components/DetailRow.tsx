// Fila «rótulo + valor» de una SectionCard con su ícono de 20 en
// color-text-2 (TUR-01 · «Dónde y con quién»). src/ui aún no la trae como
// componente (pedido en requests): se arma con SectionRow y estilos de texto.
import type { ReactNode } from 'react';
import type { IconComponent } from '../../../ui/icons';
import { SectionRow } from '../../../ui/SectionCard';
import '../activity.css';

export interface DetailRowProps {
    icon: IconComponent;
    /** Caption: «Dirección exacta», «Hora de llegada». */
    label: string;
    /** Body: «Av. Providencia 1650, Providencia · entrada de servicio». */
    children: ReactNode;
}

export function DetailRow({ icon: Icon, label, children }: DetailRowProps) {
    return (
        <SectionRow>
            <Icon size={20} className="act-muted" />
            <div>
                <p className="caption act-muted">{label}</p>
                <p className="body act-text">{children}</p>
            </div>
        </SectionRow>
    );
}
