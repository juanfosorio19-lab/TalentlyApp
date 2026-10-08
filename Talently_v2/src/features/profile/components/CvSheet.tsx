// Subir CV en PDF (PRF-01 · «Te falta 1 cosa» y sección CV): elige el archivo
// real del teléfono con MediaUploader y, al guardar, el perfil de esta sesión
// muestra el CV. Mientras Supabase está pausado no se sube a ningún servidor.
import { useState } from 'react';
import { BottomSheet } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { Stack } from '../../../ui/Layout';
import { MediaUploader } from '../../../ui/MediaUploader';
import { COPY } from '../copy';

export interface CvFile {
    nombre: string;
    /** «180 KB». */
    detalle: string;
}

const MAX_BYTES = 10 * 1024 * 1024;

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

    const pick = (files: File[]) => {
        const f = files[0];
        if (!f) return;
        if (f.size > MAX_BYTES) {
            setError(`Pesa ${sizeText(f.size)}. Elige uno de hasta 10 MB.`);
            return;
        }
        setError(null);
        setFile({ nombre: f.name, detalle: sizeText(f.size) });
    };

    const changed = file !== null && (file.nombre !== current?.nombre || file.detalle !== current?.detalle);

    return (
        <BottomSheet
            open={open}
            onClose={onClose}
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
    );
}
