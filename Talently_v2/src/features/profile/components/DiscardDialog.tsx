// «¿Descartar cambios?» al cerrar una hoja con cambios sin guardar (velo, X,
// asa, Escape o atrás de Android). Es el mismo diálogo que el BackButtonManager
// usa para un formulario: atrás sobre él lo cierra (= «Seguir editando»).
import { Dialog } from '../../../ui/Dialog';
import { COPY } from '../copy';

export function DiscardDialog({ open, onKeep, onDiscard }: { open: boolean; onKeep: () => void; onDiscard: () => void }) {
    return (
        <Dialog
            open={open}
            onClose={onKeep}
            title={COPY.descartar.titulo}
            cancelLabel={COPY.descartar.seguir}
            confirmLabel={COPY.descartar.confirmar}
            destructive
            onConfirm={onDiscard}
        >
            {COPY.descartar.texto}
        </Dialog>
    );
}
