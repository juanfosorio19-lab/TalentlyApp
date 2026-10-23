// MSG-01 · Mensajes (/mensajes, prototipo MSG-01, MSG-01-jorge y
// MSG-01-marta): bandeja única. Arriba, «Nuevos matches (n)» solo con los
// matches sin mensajes; debajo, los filtros y las conversaciones por último
// mensaje, cada una con su ContextChip, la hora relativa y los no leídos
// reales. Persona: Todos · Empleo · Turno (?tipo=); organización: por
// publicación (?pub=, spec §5.2). El filtro va en la URL con replace: al
// volver de una conversación o de otra pestaña se conserva (spec §5.3 r. 1).
import { useMemo, useRef, type MouseEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { Avatar } from '../../../ui/Avatar';
import { ContextChipInRow, contextChipText } from '../../../ui/ContextChip';
import { EmptyState, type EmptyStateAction } from '../../../ui/EmptyState';
import { IconChat } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { List, ListItem } from '../../../ui/ListItem';
import { NewMatches, type NewMatch } from '../../../ui/NewMatches';
import { useOpenPath, type LinkTargetProps } from '../../../app/navigation/useOpenPath';
import { paths } from '../../../app/paths';
import { InboxFilterChips } from '../components/InboxFilterChips';
import { NotificationsButton } from '../components/NotificationsButton';
import { copy } from '../copy';
import { ALL, filteredEmpty, inboxFilters, inboxRow, matchesFilter, peerKind, selectedFilter, sortRows, type InboxRow } from '../model';
import { EMPTY_STATE, useConversationStates, useConversations } from '../../demo/conversationState';
import { useViewer, type Viewer } from '../viewer';
import '../messaging.css';

export const screenId = 'MSG-01';

export function InboxScreen() {
    const viewer = useViewer();
    const { viewerId, recienRegistrado, audience } = viewer;
    const scrolled = useScrolled();
    const [params, setParams] = useSearchParams();
    const states = useConversationStates();
    const { open, linkProps } = useOpenPath();
    const allChipRef = useRef<HTMLButtonElement>(null);

    // Las que existen en la sesión (demo/conversationState): Jorge recién registrado todavía no
    // tiene conversaciones, y la de una postulación que aún no envía aparece al postular.
    const conversations = useConversations(viewerId, recienRegistrado);
    const rows = useMemo(
        () => conversations.map((c) => inboxRow(c, states.get(c.id) ?? EMPTY_STATE)),
        [conversations, states],
    );
    const matches: NewMatch[] = rows
        .filter((r) => r.newMatch)
        .map((r) => ({
            id: r.conv.id,
            name: r.conv.con.nombre,
            kind: peerKind(r.conv.con),
            context: r.context,
            href: linkProps(paths.conversacion(r.conv.id)).href,
        }));
    const list = sortRows(rows.filter((r) => !r.newMatch));
    const filters = inboxFilters(list, audience);
    const filter = selectedFilter(filters, filters ? params.get(filters.param) : null);
    const visible = list.filter((r) => matchesFilter(r, filters, filter));
    const emptyFilter = filteredEmpty(filters, filter, viewer.seeksWork);

    const setFilter = (next: string) => {
        if (!filters) return;
        const nextParams = new URLSearchParams(params);
        if (next === ALL) nextParams.delete(filters.param);
        else nextParams.set(filters.param, next);
        setParams(nextParams, { replace: true, preventScrollReset: true });
    };

    // «Ver todas» desaparece al vaciar el filtro: el foco pasa al chip «Todos», que sigue en pantalla.
    const showAll = () => {
        allChipRef.current?.focus({ preventScroll: true });
        setFilter(ALL);
    };

    const openMatch = (match: NewMatch, event: MouseEvent<HTMLElement>) => linkProps(paths.conversacion(match.id)).onClick(event);

    return (
        <>
            <AppBar title={copy.inbox.title} scrolled={scrolled} actions={<NotificationsButton />} />
            <main className="tl-app-screen__body" data-screen-id={screenId}>
                <div className="tl-app-screen__content msg-content">
                    {rows.length === 0 ? (
                        <EmptyState
                            icon={IconChat}
                            title={copy.inbox.emptyTitle}
                            text={viewer.seeksWork ? copy.inbox.emptyText : copy.inbox.publisherEmptyText}
                            action={emptyAction(viewer, (path) => open(path, { replace: true }))}
                        />
                    ) : (
                        <>
                            <NewMatches matches={matches} onOpen={openMatch} />
                            {list.length > 0 && (
                                <Stack gap={4}>
                                    {filters && <InboxFilterChips filters={filters} value={filter} onChange={setFilter} allRef={allChipRef} />}
                                    {visible.length > 0 ? (
                                        <List>
                                            {visible.map((row) => (
                                                <ConversationRow key={row.conv.id} row={row} {...linkProps(paths.conversacion(row.conv.id))} />
                                            ))}
                                        </List>
                                    ) : (
                                        emptyFilter && (
                                            <EmptyState
                                                icon={IconChat}
                                                title={emptyFilter.title}
                                                text={emptyFilter.text}
                                                action={{ label: copy.inbox.filteredAction, onClick: showAll }}
                                            />
                                        )
                                    )}
                                </Stack>
                            )}
                        </>
                    )}
                </div>
            </main>
        </>
    );
}

/**
 * Sin conversaciones: quien busca trabajo va a Explorar (turnos o empleos);
 * quien publica, a sus publicaciones. Cambiar de pestaña hace replace (spec
 * §5.3 regla 1).
 */
function emptyAction(viewer: Viewer, go: (path: string) => void): EmptyStateAction {
    if (!viewer.seeksWork) {
        return { label: copy.inbox.publisherEmptyAction, onClick: () => go(paths.actividad('publicaciones')) };
    }
    return viewer.explore === 'turno'
        ? { label: copy.inbox.emptyAction, onClick: () => go(paths.explorar('turno')) }
        : { label: copy.inbox.emptyActionJobs, onClick: () => go(paths.explorar('empleo')) };
}

type ConversationRowProps = { row: InboxRow } & LinkTargetProps;

/** Una conversación (ListItem --chat): toda la fila abre el chat. */
function ConversationRow({ row, href, onClick }: ConversationRowProps) {
    const { conv, context, preview, when, unread } = row;
    const label = [conv.con.nombre, contextChipText(context), when, unread > 0 ? copy.inbox.unread(unread) : null]
        .filter(Boolean)
        .join(', ');
    return (
        <ListItem
            variant="chat"
            href={href}
            onClick={onClick}
            aria-label={label}
            avatar={<Avatar name={conv.con.nombre} initials={conv.con.iniciales} kind={peerKind(conv.con)} />}
            title={conv.con.nombre}
            context={<ContextChipInRow {...context} />}
            sub={preview ?? undefined}
            time={when ?? undefined}
            unreadCount={unread}
        />
    );
}
