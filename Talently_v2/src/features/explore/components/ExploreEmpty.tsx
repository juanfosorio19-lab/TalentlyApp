// EmptyState de Explorar, centrado en el alto que queda (como el prototipo).
// `fromDemo` traduce el estado vacío de los datos de demostración (ícono
// semántico, texto y destino) a EmptyState de src/ui con su acción real.
import type { Ref } from 'react';
import { EmptyState, type EmptyStateAction } from '../../../ui/EmptyState';
import type { IconComponent } from '../../../ui/icons';
import type { DemoActorId } from '../../demo/session';
import { targetPath } from '../../demo/targets';
import type { DemoEmptyState } from '../../demo/types';
import { emptyIconOf } from '../model';

export interface ExploreEmptyProps {
    icon: IconComponent;
    title: string;
    text: string;
    action?: EmptyStateAction;
    /** Para llevarle el foco cuando desaparece lo que se tocó (la última tarjeta del deck o de la lista). */
    emptyRef?: Ref<HTMLDivElement>;
}

export function ExploreEmpty({ icon, title, text, action, emptyRef }: ExploreEmptyProps) {
    return (
        <div className="explore-empty">
            <EmptyState ref={emptyRef} tabIndex={emptyRef ? -1 : undefined} icon={icon} title={title} text={text} action={action} />
        </div>
    );
}

/** Props de ExploreEmpty para un estado vacío de la demo: la acción navega a su destino (demo/targets). */
export function fromDemo(
    e: DemoEmptyState,
    fallback: IconComponent,
    actorId: DemoActorId,
    go: (path: string) => void,
): ExploreEmptyProps {
    const destino = e.destino;
    return {
        icon: emptyIconOf(e, fallback),
        title: e.titulo,
        text: e.texto,
        action: e.accion && destino ? { label: e.accion, onClick: () => go(targetPath(destino, actorId)) } : undefined,
    };
}
