// Subir CV en PDF (PRF-01 · «Te falta 1 cosa» y sección CV): elige el archivo
// real del teléfono con MediaUploader y, al guardar, el perfil de esta sesión
// muestra el CV. Solo acepta un PDF de hasta 10 MB: MediaUploader documento
// trae también «Tomar foto» (sin prop para quitarla, pedida en «requests») y
// esa foto se rechaza aquí. Mientras Supabase está pausado no se sube a
// ningún servidor.
import { useState } from 'react';
import { BottomSheet } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { Stack } from '../../../ui/Layout';
import { MediaUploader } from '../../../ui/MediaUploader';
import { COPY } from '../copy';
import { DiscardDialog } from './DiscardDialog';

export interface CvFile {
    nombre: string;
    /** «180 KB». */
    detalle: string;
}

const MAX_BYTES = 10 * 1024 * 1024;

function isPdf(file: File): boolean {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

function sizeText(bytes: number): string {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export interface CvSheetProps {
    open: boolean;
    /** El CV que ya tiene, si lo hay. */
    current?: CvFile;
    onClose: () => void;
    onSave: (file: CvFile) => void;
}

export function CvSheet({ open, current, onClose, onSave }: CvSheetProps) {
    const [file, setFile] = useState<CvFile | null>(current ?? null);
    const [error, setError] = useState<string | null>(null);
    const [confirm, setConfirm] = useState(false);

    // Un archivo que no sirve no reemplaza al anterior a medias: queda sin archivo
    // elegido (Guardar deshabilitado) y la tarjeta dice por qué.
    const reject = (message: string) => {
        setFile(null);
        setError(message);
    };

    const pick = (files: File[]) => {
        const f = files[0];
        if (!f) return;
        // Solo PDF: «Tomar foto» de MediaUploader entrega una imagen y el selector puede saltarse `accept`.
        if (!isPdf(f)) {
            reject(COPY.cv.soloPdf);
            return;
        }
        if (f.size > MAX_BYTES) {
            reject(COPY.cv.muyGrande(sizeText(f.size)));
            return;
        }
        setError(null);
        setFile({ nombre: f.name, detalle: sizeText(f.size) });
    };

    const changed = file !== null && (file.nombre !== current?.nombre || file.detalle !== current?.detalle);
    // Velo, X, asa, Escape y atrás de Android: con un archivo elegido sin guardar, pregunta antes.
    const requestClose = () => (changed ? setConfirm(true) : onClose());

    return (
        <>
            <BottomSheet
                open={open}
                onClose={requestClose}
                title={current ? COPY.cv.editar : COPY.cv.titulo}
                footer={
                    <>
                        <Button variant="ghost" onClick={onClose}>
                            {COPY.editar.cancelar}
                        </Button>
                        <Button disabled={!changed} onClick={() => file && onSave(file)}>
                            {COPY.editar.guardar}
                        </Button>
                    </>
                }
            >
                <Stack gap={3}>
                    <p className="body prf-muted prf-flush">{COPY.cv.nota}</p>
                    <MediaUploader
                        variant="document"
                        title={COPY.cv.documento}
                        formats={COPY.cv.formatos}
                        accept="application/pdf"
                        state={error ? 'error' : file ? 'uploaded' : 'empty'}
                        fileName={file?.nombre}
                        size={file?.detalle}
                        error={error ?? undefined}
                        onSelect={pick}
                        onRemove={() => setFile(null)}
                    />
                </Stack>
            </BottomSheet>
            <DiscardDialog
                open={open && confirm}
                onKeep={() => setConfirm(false)}
                onDiscard={() => {
                    setConfirm(false);
                    onClose();
                }}
            />
        </>
    );
}
