// ACT-03 · Actividad · Publicaciones (spec §5.2): la organización ve sus
// publicaciones activas, pausadas y cerradas; la persona, «Mis publicaciones»
// (aviso del hogar, clases, servicios). Cada una abre su gestión (GES-01)
// cuando esté en el router; mientras tanto, su resumen (DET-01, que en una
// publicación propia trae «Gestionar publicación»). Al final, «Publicar»
// (spec §5.3 regla 9: Publicar va en Inicio y en Actividad).
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import { EmptyState } from '../../../ui/EmptyState';
import { IconAdd, IconBook, IconClock, IconOffers, IconTool, type IconComponent } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { paths } from '../../../app/paths';
import type { DemoPublication } from '../../demo/types';
import { LinkListItem } from '../components/LinkListItem';
import { ListGroup } from '../components/ListGroup';
import { copy } from '../copy';
import { useGo } from '../navigation';
import { activityPaths } from '../paths';
import { groupOf, metricLine, type MyPublication, type PublicationGroup } from '../selectors';

export const screenId = 'ACT-03';

const TYPE_ICON: Record<DemoPublication['tipo'], IconComponent> = {
    empleo: IconOffers,
    turno: IconClock,
    servicio: IconTool,
    clase: IconBook,
};

const GROUP_ORDER: PublicationGroup[] = ['activas', 'pausadas', 'cerradas'];

function iconOf(p: MyPublication): IconComponent {
    if (p.kind === 'summary') return TYPE_ICON[p.publication.tipo];
    // Sin la publicación pública, el tipo sale del resumen («Turno · sáb 19 y dom 20 dic · San Miguel»).
    return p.tipo ? TYPE_ICON[p.tipo] : p.managed.resumen.startsWith('Turno') ? IconClock : IconOffers;
}

function Row({ p }: { p: MyPublication }) {
    if (p.kind === 'managed') {
        const metric = metricLine(p.managed);
        // GES-01 (/publicaciones/:id) aún no está en el router: vuelve a paths.gestionarPublicacion cuando se registre.
        return (
            <LinkListItem
                to={paths.publicacion(p.id)}
                icon={iconOf(p)}
                title={p.managed.titulo}
                sub={metric ? [p.managed.resumen, metric] : p.managed.resumen}
                status={<Badge status={p.managed.estado} />}
            />
        );
    }
    return (
        <LinkListItem
            to={paths.publicacion(p.id)}
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
    const go = useGo();
    // PUBL-01 vive en Inicio (?sheet=publicar) hasta que PublishSheet pase a src/ui.
    const publish = () => go(activityPaths.publicar());

    if (publications.length === 0) {
        return (
            <EmptyState
                icon={IconOffers}
                title={copy.publications.emptyTitle}
                text={copy.publications.emptyText}
                action={{ label: copy.publications.publish, onClick: publish }}
            />
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
            <Button block icon={IconAdd} onClick={publish}>
                {copy.publications.publish}
            </Button>
        </Stack>
    );
}
