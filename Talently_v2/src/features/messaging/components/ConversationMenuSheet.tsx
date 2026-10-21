// Menú ⋯ de la conversación (M5, README BottomSheet): «Ver publicación»,
// «Reportar» y «Bloquear» (danger, abre un Dialog). Con la conversación
// bloqueada, «Desbloquear» la vuelve a abrir.
import { BottomSheet } from '../../../ui/BottomSheet';
import { IconBlock, IconReport, type IconComponent } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import { copy } from '../copy';

interface ConversationMenuSheetProps {
    open: boolean;
    onClose: () => void;
    /** Nombre de la otra parte: el título de la hoja. */
    title: string;
    /** La publicación de la conversación, si todavía existe. */
    publication?: { title: string; icon: IconComponent; onOpen: () => void };
    blocked: boolean;
    onReport: () => void;
    onBlock: () => void;
    onUnblock: () => void;
}

export function ConversationMenuSheet({
    open,
    onClose,
    title,
    publication,
    blocked,
    onReport,
    onBlock,
    onUnblock,
}: ConversationMenuSheetProps) {
    return (
        <BottomSheet open={open} onClose={onClose} title={title}>
            <List>
                {publication && (
                    <ListItem
                        icon={publication.icon}
                        title={copy.menu.publication}
                        sub={publication.title}
                        chevron
                        onClick={publication.onOpen}
                    />
                )}
                <ListItem icon={IconReport} title={copy.menu.report} sub={copy.menu.reportSub} chevron onClick={onReport} />
                {blocked ? (
                    <ListItem icon={IconBlock} title={copy.menu.unblock} sub={copy.menu.unblockSub} onClick={onUnblock} />
                ) : (
                    <ListItem icon={IconBlock} title={copy.menu.block} sub={copy.menu.blockSub} danger onClick={onBlock} />
                )}
            </List>
        </BottomSheet>
    );
}
