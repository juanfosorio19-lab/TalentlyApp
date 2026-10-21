// Adjuntar (MSG-02b-adjuntar): «Tomar foto», «Elegir de la galería» y
// «Compartir un documento»; para quien trabaja, después del match, primero
// «Compartir certificado de antecedentes» (M5). La otra parte nunca tiene esa
// opción ni un botón para pedirlo.
import { BottomSheet } from '../../../ui/BottomSheet';
import { IconAttach, IconCamera, IconDocument, IconUpload } from '../../../ui/icons';
import { List, ListItem } from '../../../ui/ListItem';
import { copy } from '../copy';

interface AttachSheetProps {
    open: boolean;
    onClose: () => void;
    /** Ofrece compartir el certificado de antecedentes. */
    certificate: boolean;
    onCertificate: () => void;
    /** Foto, galería y documento: aún no se envían archivos en la demostración. */
    onSoon: () => void;
}

export function AttachSheet({ open, onClose, certificate, onCertificate, onSoon }: AttachSheetProps) {
    return (
        <BottomSheet open={open} onClose={onClose} title={copy.attach.title}>
            <List>
                {certificate && (
                    <ListItem
                        icon={IconDocument}
                        title={copy.attach.certificate}
                        sub={copy.attach.certificateSub}
                        chevron
                        onClick={onCertificate}
                    />
                )}
                <ListItem icon={IconCamera} title={copy.attach.photo} chevron onClick={onSoon} />
                <ListItem icon={IconUpload} title={copy.attach.gallery} chevron onClick={onSoon} />
                <ListItem icon={IconAttach} title={copy.attach.document} chevron onClick={onSoon} />
            </List>
        </BottomSheet>
    );
}
