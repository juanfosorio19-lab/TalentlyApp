// MSG-01 · Mensajes (/mensajes, prototipo MSG-01, MSG-01-jorge y
// MSG-01-marta): bandeja única. Arriba, «Nuevos matches (n)» solo con los
// matches sin mensajes; debajo, los filtros Todos · Empleo · Turno y las
// conversaciones por último mensaje, cada una con su ContextChip, la hora
// relativa y los no leídos reales. El filtro va en la URL (?tipo=, replace):
// al volver a la pestaña se conserva (spec §5.3 regla 1).
import { useMemo, type MouseEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppBar, useScrolled } from '../../../ui/AppBar';
import { Avatar } from '../../../ui/Avatar';
import { ContextChipInRow, contextChipText } from '../../../ui/ContextChip';
import { EmptyState } from '../../../ui/EmptyState';
import { IconChat } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { List, ListItem } from '../../../ui/ListItem';
import { NewMatches, type NewMatch } from '../../../ui/NewMatches';
import { paths } from '../../../app/paths';
import { getConversations } from '../../demo/data';
import { NotificationsButton } from '../components/NotificationsButton';
import { TypeFilter } from '../components/TypeFilter';
import { copy, type InboxFilter } from '../copy';
import { useLinks, useViewerId } from '../links';
import { inboxRow, matchesFilter, parseFilter, peerKind, sortRows, type InboxRow } from '../model';
import { EMPTY_STATE, useConversationStates } from '../store';
import '../messaging.css';

export const screenId = 'MSG-01';

export function InboxScreen() {
    const viewerId = useViewerId();
    const scrolled = useScrolled();
    const [params, setParams] = useSearchParams();
    const states = useConversationStates();
    const { go, linkProps } = useLinks();
    const filter = parseFilter(params.get('tipo'));

    const rows = useMemo(
        () => getConversations(viewerId).map((c) => inboxRow(c, states.get(c.id) ?? EMPTY_STATE)),
        [viewerId, states],
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
    const visible = list.filter((r) => matchesFilter(r, filter));

    const setFilter = (next: InboxFilter) => {
        const nextParams = new URLSearchParams(params);
        if (next === 'todos') nextParams.delete('tipo');
        else nextParams.set('tipo', next);
        setParams(nextParams, { replace: true });
    };

    const openMatch = (match: NewMatch, event: MouseEvent<HTMLElement>) => linkProps(paths.conversacion(match.id)).onClick(event);

    return (
        <>
            <AppBar title={copy.inbox.title} scrolled={scrolled} actions={<NotificationsButton viewerId={viewerId} />} />
            <main className="tl-app-screen__body" data-screen-id={screenId}>
                <div className="tl-app-screen__content msg-content">
                    {rows.length === 0 ? (
                        <EmptyState
                            icon={IconChat}
                            title={copy.inbox.emptyTitle}
                            text={copy.inbox.emptyText}
                            action={{ label: copy.inbox.emptyAction, onClick: () => go(paths.explorar('turno')) }}
                        />
                    ) : (
                        <>
                            <NewMatches matches={matches} onOpen={openMatch} />
                            {list.length > 0 && (
                                <Stack gap={4}>
                                    <TypeFilter value={filter} onChange={setFilter} />
                                    {visible.length > 0 ? (
                                        <List>
                                            {visible.map((row) => (
                                                <ConversationRow key={row.conv.id} row={row} {...linkProps(paths.conversacion(row.conv.id))} />
                                            ))}
                                        </List>
                                    ) : (
                                        filter !== 'todos' && (
                                            <EmptyState
                                                icon={IconChat}
                                                title={copy.inbox.filteredTitle[filter]}
                                                text={copy.inbox.filteredText[filter]}
                                                action={{ label: copy.inbox.filteredAction, onClick: () => setFilter('todos') }}
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

interface ConversationRowProps {
    row: InboxRow;
    href: string;
    onClick: (event: MouseEvent<HTMLElement>) => void;
}

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
