// Los bloques del Inicio de una persona (INI-01, spec §5.2), en el orden en
// que llegan de los datos: cada uno aparece solo si su capacidad está activa.
// Todo destino sale de paths.ts o de demo/targets y se abre con useOpenPath.
import type { MouseEvent } from 'react';
import { paths } from '../../../app/paths';
import { Avatar } from '../../../ui/Avatar';
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
import { DEMO_TODAY, getPublication } from '../../demo/data';
import type { DemoEmptyState, DemoHomeBlock } from '../../demo/types';
import { isoOf } from '../mock';
import { profileCvPath, useHomeNavigation } from '../navigation';
import { isCvTip, type PublishKind } from '../selectors';
import { JobsShortcut, ShiftCards } from './HomePublications';
import { ProfileTipCard } from './ProfileTipCard';

const YEAR = Number(DEMO_TODAY.split(' ').pop());

const EMPTY_ICON: Record<NonNullable<DemoEmptyState['icono']>, IconComponent> = {
    empleo: IconOffers,
    turno: IconClock,
    agregar: IconAdd,
    mensajes: IconChat,
    notificaciones: IconBell,
};

/** «¿Qué necesitas?» del hogar: el ícono de la categoría y qué opción marca en PUBL-01. */
const NEED: Record<string, { icon: IconComponent; publish: PublishKind }> = {
    'asesor-hogar': { icon: IconJobHomeCare, publish: 'hogar' },
    'cuidador-infantil': { icon: IconPeople, publish: 'hogar' },
    'cuidador-adulto-mayor': { icon: IconJobHealth, publish: 'hogar' },
    'banquetero-evento': { icon: IconJobFoodEvents, publish: 'evento' },
};

/** Abrir en otra pestaña (Ctrl, Cmd, Mayús, rueda) sigue siendo del navegador. */
const plainClick = (e: MouseEvent<HTMLElement>) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

export interface PersonBlockProps {
    block: DemoHomeBlock;
    /** Abre «Verificación de …» de quien publica la tarjeta. */
    onVerify: (publicationId: string) => void;
    /** Abre PUBL-01, con una opción marcada si viene de «¿Qué necesitas?». */
    onPublish: (kind?: PublishKind) => void;
    /** `href` de PUBL-01 con esa opción (el enlace también sirve abierto en otra pestaña). */
    publishHref: (kind: PublishKind) => string;
}

export function PersonBlock({ block, onVerify, onPublish, publishHref }: PersonBlockProps) {
    const { go, targetLink, openTarget } = useHomeNavigation();

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
                    {/* El último compromiso no deja su margen de lista bajo la sección (Main). */}
                    <div className="home-agenda">
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
                    </div>
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
                                // Con o sin pantalla de destino todavía, la fila lleva a un lugar: chevron como en el prototipo.
                                chevron
                                {...targetLink(n.destino)}
                            />
                        ))}
                    </List>
                </ScreenSection>
            );

        case 'completar': {
            const tip = block.aviso;
            // «Subir CV en PDF» abre la hoja del CV de Perfil, no solo Perfil (donde habría que tocarlo otra vez).
            const onAction = isCvTip(tip) ? () => go(profileCvPath()) : () => openTarget(tip.destino);
            return <ProfileTipCard tip={tip} onAction={onAction} />;
        }

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
                                    // PUBL-01 vive en la URL como hoja (spec §5.4).
                                    href={publishHref(need.publish)}
                                    aria-haspopup="dialog"
                                    onClick={(e) => {
                                        if (!plainClick(e)) return;
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
                            chevron
                            // GES-01 de su aviso.
                            {...targetLink({ pantalla: 'gestion', publicationId: block.publicationId })}
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
            // INI-01-jorge-nuevo e INI-01-rosa: justo bajo el H1 («Hola, Jorge»), `h2.tl-empty__title.h3`, y la
            // única acción de la pantalla en primary («Ver empleos cerca», «Agregar un perfil»).
            return (
                <EmptyState
                    icon={EMPTY_ICON[estado.icono ?? 'agregar']}
                    headingLevel={2}
                    title={estado.titulo}
                    text={estado.texto}
                    action={
                        estado.accion
                            ? { label: estado.accion, onClick: () => openTarget(estado.destino), variant: 'primary' }
                            : undefined
                    }
                />
            );
        }

        case 'panel':
            // El panel es de la organización (INI-02): nunca llega al Inicio de una persona.
            return null;
    }
}
