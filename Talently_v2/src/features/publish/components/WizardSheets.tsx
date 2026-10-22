// Hojas del asistente, en la URL (useSheet): el menú ⋯ «Opciones» (Guardar y
// salir · Ayuda) y PUBL-04-identidad «Verifica tu identidad para publicar tu
// aviso» (entrada a VER-02). No guardan elección propia: todo lo que muestran
// sale de sus props, así un cierre con el atrás del navegador no deja nada viejo.
import { BottomSheet } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { IconHelp, IconUpload } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import { copy } from '../copy';
import { FactList } from './Parts';

export function WizardMenuSheet({
    open,
    onClose,
    onSaveExit,
    onHelp,
}: {
    open: boolean;
    onClose: () => void;
    onSaveExit: () => void;
    onHelp: () => void;
}) {
    return (
        <BottomSheet open={open} onClose={onClose} title={copy.menu.titulo}>
            <List flat>
                <ListItem icon={IconUpload} title={copy.menu.guardar} sub={copy.menu.guardarSub} onClick={onSaveExit} />
                <ListItem icon={IconHelp} title={copy.menu.ayuda} onClick={onHelp} />
            </List>
        </BottomSheet>
    );
}

export const screenId = 'PUBL-04-identidad';

export function IdentitySheet({
    open,
    onClose,
    onVerify,
    que,
    phoneVerified,
}: {
    open: boolean;
    onClose: () => void;
    onVerify: () => void;
    que: 'aviso' | 'turno';
    phoneVerified: boolean;
}) {
    return (
        <BottomSheet
            open={open}
            onClose={onClose}
            title={copy.identidad.titulo(que)}
            className="publish-sheet"
            footer={
                <>
                    <Button size="lg" block onClick={onVerify}>
                        {copy.identidad.verificar}
                    </Button>
                    <Button variant="ghost" size="lg" block onClick={onClose}>
                        {copy.identidad.ahoraNo}
                    </Button>
                </>
            }
        >
            <p className="body-l publish-sheet-text">{copy.identidad.texto}</p>
            <FactList
                className="publish-sheet-facts"
                facts={[
                    { text: phoneVerified ? copy.identidad.telefonoOk : copy.identidad.telefonoFalta, ok: phoneVerified },
                    { text: copy.identidad.identidadFalta, ok: false },
                ]}
            />
            <p className="caption publish-flush publish-muted">{copy.identidad.guardado(que)}</p>
        </BottomSheet>
    );
}
