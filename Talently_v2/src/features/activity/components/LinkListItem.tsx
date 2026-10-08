// Fila de lista que navega dentro de la app: ListItem con `href` real (el
// enlace funciona con clic medio y lector de pantalla) y, al tocarla,
// navegación del router con push (spec §5.3 regla 2).
import type { MouseEvent } from 'react';
import { useHref, useNavigate } from 'react-router-dom';
import { ListItem, type ListItemProps } from '../../../ui/ListItem';

export interface LinkListItemProps extends Omit<ListItemProps, 'href' | 'onClick'> {
    /** Ruta de `paths` (src/app/paths.ts). */
    to: string;
}

export function LinkListItem({ to, ...rest }: LinkListItemProps) {
    const href = useHref(to);
    const navigate = useNavigate();
    const onClick = (event: MouseEvent<HTMLElement>) => {
        // Abrir en otra pestaña (Ctrl/Cmd o clic medio) queda en manos del navegador.
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        navigate(to);
    };
    return <ListItem {...rest} href={href} onClick={onClick} />;
}
