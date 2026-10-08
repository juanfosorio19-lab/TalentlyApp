// Grupo de una lista con su rótulo Overline arriba («Empleos», «Turnos»,
// «Activas»), como en ACT-02 del prototipo. src/ui aún no trae este rótulo
// (pedido en requests): es un H2 con el estilo Overline y color-text-2.
import { useId, type ReactNode } from 'react';
import { Stack } from '../../../ui/Layout';
import { List } from '../../../ui/ListItem';
import '../activity.css';

export interface ListGroupProps {
    /** Sin rótulo, solo la lista («Impulsa tu perfil» al final de ACT-02). */
    label?: string;
    /** Filas: ListItem o LinkListItem. */
    children: ReactNode;
}

export function ListGroup({ label, children }: ListGroupProps) {
    const id = useId();
    if (!label) return <List>{children}</List>;
    return (
        <Stack gap={2}>
            <h2 id={id} className="overline act-muted">
                {label}
            </h2>
            <List aria-labelledby={id}>{children}</List>
        </Stack>
    );
}
