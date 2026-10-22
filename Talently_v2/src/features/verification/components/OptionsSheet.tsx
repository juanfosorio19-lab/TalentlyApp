// ⋯ de VER-02 (`?sheet=opciones`): «Pedir ayuda por WhatsApp» y «Salir sin
// enviar». Sin estado propio: no hay nada que limpiar al abrirla otra vez.
import { BottomSheet } from '../../../ui/BottomSheet';
import { IconChat, IconLogout } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import { COPY } from '../copy';

const T = COPY.ver02;

export interface OptionsSheetProps {
    open: boolean;
    onClose: () => void;
    onHelp: () => void;
    onExit: () => void;
}

export function OptionsSheet({ open, onClose, onHelp, onExit }: OptionsSheetProps) {
    return (
        <BottomSheet open={open} onClose={onClose} title={T.opciones} className="ver-sheet">
            <List flat className="ver-sheet-list">
                <ListItem icon={IconChat} title={T.ayuda} onClick={onHelp} />
                <ListItem icon={IconLogout} title={T.salir} sub={T.salirSub} onClick={onExit} />
            </List>
        </BottomSheet>
    );
}
