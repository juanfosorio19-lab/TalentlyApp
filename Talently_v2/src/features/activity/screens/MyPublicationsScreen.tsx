// ACT-03 · Actividad · Publicaciones (spec §5.2): la organización ve sus
// publicaciones activas, pausadas y cerradas; la persona, «Mis publicaciones»
// (aviso del hogar, clases, servicios). Cada una abre su gestión (GES-01,
// /publicaciones/:id). Al final, «Publicar» (spec §5.3 regla 9: Publicar va en
// Inicio y en Actividad), que abre PUBL-01 aquí mismo como hoja. Si se llega
// con la hoja abierta (?sheet=publicar), al cerrarla el foco va a «Publicar».
import { useRef } from 'react';
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import { EmptyState } from '../../../ui/EmptyState';
import { IconAdd, IconBook, IconClock, IconOffers, IconTool, type IconComponent } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { ListItem } from '../../../ui/ListItem';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { useDemoSession } from '../../demo/session';
import type { DemoPublication } from '../../demo/types';
import { ListGroup } from '../components/ListGroup';
import { PublishSheet, usePublishSheet } from '../components/PublishSheet';
import { useFocusAfterClose } from '../components/useFocusAfterClose';
import { copy } from '../copy';
import { groupOf, metricLine, publisherFor, type MyPublication, type PublicationGroup } from '../selectors';

export const screenId = 'ACT-03';

const TYPE_ICON: Record<DemoPublication['tipo'], IconComponent> = {
    empleo: IconOffers,
    turno: IconClock,
    servicio: IconTool,
    clase: IconBook,
};

const GROUP_ORDER: PublicationGroup[] = ['activas', 'pausadas', 'cerradas'];

function iconOf(p: MyPublication): IconComponent {
    if (p.publication) return TYPE_ICON[p.publication.tipo];
    // Sin la publicación pública, el tipo sale del resumen («Turno · sáb 19 y dom 20 dic · San Miguel»).
    return p.kind === 'managed' && p.managed.resumen.startsWith('Turno') ? IconClock : IconOffers;
}

function Row({ p }: { p: MyPublication }) {
    const { linkProps } = useOpenPath();
    const link = linkProps(paths.gestionarPublicacion(p.id));
    if (p.kind === 'managed') {
        const metric = metricLine(p.managed);
        return (
            <ListItem
                {...link}
                icon={iconOf(p)}
                title={p.managed.titulo}
                sub={metric ? [p.managed.resumen, metric] : p.managed.resumen}
                status={<Badge status={p.managed.estado} />}
            />
        );
    }
    return (
        <ListItem
            {...link}
            icon={iconOf(p)}
            title={p.publication.titulo}
            sub={p.publication.lugar}
            status={<Badge status={p.publication.estado} />}
        />
    );
}

export interface MyPublicationsScreenProps {
    /** Ya calculadas por ActivityScreen (definen si el segmento existe). */
    publications: readonly MyPublication[];
}

export function MyPublicationsScreen({ publications }: MyPublicationsScreenProps) {
    const { actor } = useDemoSession();
    const publishSheet = usePublishSheet();
    const publish = () => publishSheet.show();
    // El botón «Publicar» (de la lista o del estado vacío): ahí vuelve el foco si nada abrió la hoja.
    const publishRef = useRef<HTMLButtonElement>(null);
    useFocusAfterClose(publishSheet.open, publishRef);
    const sheet = (
        <PublishSheet
            as={actor.kind === 'organizacion' ? 'organizacion' : 'hogar'}
            publisher={publisherFor(actor, publications)}
        />
    );

    if (publications.length === 0) {
        return (
            <>
                <EmptyState
                    icon={IconOffers}
                    title={copy.publications.emptyTitle}
                    text={copy.publications.emptyText}
                    action={{ label: copy.publications.publish, onClick: publish, 'aria-haspopup': 'dialog', ref: publishRef }}
                />
                {sheet}
            </>
        );
    }

    return (
        <Stack gap={6}>
            {GROUP_ORDER.map((group) => {
                const list = publications.filter((p) => groupOf(p) === group);
                if (list.length === 0) return null;
                return (
                    <ListGroup key={group} label={copy.publications.groups[group]}>
                        {list.map((p) => (
                            <Row key={p.id} p={p} />
                        ))}
                    </ListGroup>
                );
            })}
            <Button ref={publishRef} block icon={IconAdd} onClick={publish} aria-haspopup="dialog">
                {copy.publications.publish}
            </Button>
            {sheet}
        </Stack>
    );
}
