// Los bloques del Inicio de una persona (INI-01, spec §5.2), en el orden en
// que llegan de los datos: cada uno aparece solo si su capacidad está activa.
import { paths } from '../../../app/paths';
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import { AgendaEvent } from '../../../ui/CalendarWeek';
import { EmptyState } from '../../../ui/EmptyState';
import {
    IconAdd,
    IconBell,
    IconChat,
    IconClock,
    IconJobFoodEvents,
    IconJobHealth,
    IconJobHomeCare,
    IconOffers,
    IconPeople,
    type IconComponent,
} from '../../../ui/icons';
import { ScreenSection, Stack } from '../../../ui/Layout';
import { List, ListItem } from '../../../ui/ListItem';
import { OptionLink, OptionLinkGroup } from '../../../ui/OptionCard';
import { Avatar } from '../../../ui/Avatar';
import { DEMO_TODAY, getPublication } from '../../demo/data';
import type { DemoAuthor, DemoEmptyState, DemoHomeBlock } from '../../demo/types';
import { copy } from '../copy';
import { useAppLinks, useTargetLinks } from '../links';
import { isoOf } from '../mock';
import { JobsShortcut, ShiftCards } from './HomePublications';
import { ProfileTipCard } from './ProfileTipCard';
import type { PublishKind } from './PublishSheet';

const YEAR = Number(DEMO_TODAY.split(' ').pop());

const EMPTY_ICON: Record<NonNullable<DemoEmptyState['icono']>, IconComponent> = {
    empleo: IconOffers,
    turno: IconClock,
    agregar: IconAdd,
    mensajes: IconChat,
    notificaciones: IconBell,
};

/** «¿Qué necesitas?» del hogar: el ícono de la categoría y qué publicación prepara. */
const NEED: Record<string, { icon: IconComponent; publish: PublishKind }> = {
    'asesor-hogar': { icon: IconJobHomeCare, publish: 'hogar' },
    'cuidador-infantil': { icon: IconPeople, publish: 'hogar' },
    'cuidador-adulto-mayor': { icon: IconJobHealth, publish: 'hogar' },
    'banquetero-evento': { icon: IconJobFoodEvents, publish: 'evento' },
};

export interface PersonBlockProps {
    block: DemoHomeBlock;
    onVerify: (author: DemoAuthor) => void;
    /** Abre PUBL-01, con una opción marcada si viene de «¿Qué necesitas?». */
    onPublish: (initial?: PublishKind) => void;
}

export function PersonBlock({ block, onVerify, onPublish }: PersonBlockProps) {
    const { go, hrefOf, linkProps } = useAppLinks();
    const { targetLink, openTarget } = useTargetLinks();

    switch (block.tipo) {
        case 'agenda':
            if (block.eventos.length === 0) return null;
            return (
                <ScreenSection
                    title={block.titulo}
                    action={
                        <Button variant="ghost" size="sm" onClick={() => go(paths.actividad('agenda'))}>
                            {block.accion}
                        </Button>
                    }
                >
                    {block.eventos.map((e) => (
                        <AgendaEvent
                            key={e.id}
                            event={{
                                id: e.id,
                                date: isoOf(e.fecha, YEAR),
                                start: e.inicio,
                                end: e.fin ?? '',
                                kind: e.tipo,
                                title: e.titulo,
                                who: e.detalle,
                                status: e.estado,
                            }}
                            onClick={() => openTarget(e.destino)}
                        />
                    ))}
                </ScreenSection>
            );

        case 'turnos':
            return (
                <ScreenSection
                    title={block.titulo}
                    action={
                        <Button variant="ghost" size="sm" onClick={() => go(paths.explorar('turno'))}>
                            {block.accion}
                        </Button>
                    }
                >
                    <Stack gap={3}>
                        <ShiftCards ids={block.publicaciones} onVerify={onVerify} />
                    </Stack>
                </ScreenSection>
            );

        case 'empleos':
            return (
                <ScreenSection
                    title={block.titulo}
                    action={
                        <Button variant="ghost" size="sm" onClick={() => go(paths.explorar('empleo'))}>
                            {block.accion}
                        </Button>
                    }
                >
                    <JobsShortcut ids={block.publicaciones} onVerify={onVerify} />
                </ScreenSection>
            );

        case 'novedades':
            return (
                <ScreenSection title={block.titulo}>
                    <List>
                        {block.items.map((n) => (
                            <ListItem
                                key={n.id}
                                avatar={<Avatar name={n.titulo} initials={n.iniciales} kind="org" />}
                                title={n.titulo}
                                sub={n.detalle}
                                status={<Badge status={n.estado} />}
                                {...targetLink(n.destino)}
                            />
                        ))}
                    </List>
                </ScreenSection>
            );

        case 'completar':
            return <ProfileTipCard tip={block.aviso} onAction={() => openTarget(block.aviso.destino)} />;

        case 'que-necesitas':
            return (
                <ScreenSection title={block.titulo}>
                    <OptionLinkGroup>
                        {block.opciones.map((o) => {
                            const need = NEED[o.id] ?? { icon: IconPeople, publish: 'hogar' };
                            return (
                                <OptionLink
                                    key={o.id}
                                    icon={need.icon}
                                    title={o.texto}
                                    // PUBL-01 vive en la URL como hoja (spec §5.4): el enlace también sirve en otra pestaña.
                                    href={hrefOf(`${paths.inicio()}?sheet=publicar&tipo=${need.publish}`)}
                                    aria-haspopup="dialog"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onPublish(need.publish);
                                    }}
                                />
                            );
                        })}
                    </OptionLinkGroup>
                </ScreenSection>
            );

        case 'tu-aviso': {
            const pub = getPublication(block.publicationId);
            return (
                <ScreenSection title={block.titulo}>
                    <List>
                        <ListItem
                            icon={IconOffers}
                            title={pub?.titulo ?? ''}
                            sub={block.detalle}
                            status={<Badge status={block.estado} />}
                            {...linkProps(paths.gestionarPublicacion(block.publicationId))}
                        />
                    </List>
                </ScreenSection>
            );
        }

        case 'publicar':
            return (
                <Button block icon={IconAdd} aria-haspopup="dialog" onClick={() => onPublish()}>
                    {block.texto}
                </Button>
            );

        case 'vacio': {
            const { estado } = block;
            return (
                <EmptyState
                    icon={EMPTY_ICON[estado.icono ?? 'agregar']}
                    title={estado.titulo}
                    text={estado.texto}
                    action={estado.accion ? { label: estado.accion, onClick: () => openTarget(estado.destino) } : undefined}
                />
            );
        }

        case 'panel':
            // El panel es de la organización (INI-02): nunca llega al Inicio de una persona.
            return null;
    }
}

export { copy as personBlocksCopy };
