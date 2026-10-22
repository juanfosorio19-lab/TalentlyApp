// Subir CV en PDF (PRF-01 · «Te falta 1 cosa» y sección CV, `?sheet=cv`):
// elige el archivo real del teléfono y, al guardar, el perfil de esta sesión
// muestra el CV. Solo un PDF de hasta 10 MB: sin «Tomar foto» (una foto no es
// un CV) y el selector solo ofrece PDF; si igual llega otro archivo, se
// rechaza con el motivo. Mientras Supabase está pausado no se sube a ningún
// servidor.
import { useEffect, useRef, useState } from 'react';
import { BottomSheet } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { IconUpload } from '../../../ui/icons';
import { Stack } from '../../../ui/Layout';
import { MediaUploader } from '../../../ui/MediaUploader';
import { COPY } from '../copy';
import { checkCvFile, sizeText } from '../cvFile';
import { DiscardDialog } from './DiscardDialog';

export interface CvFile {
    nombre: string;
    /** «180 KB». */
    detalle: string;
}

const PDF = 'application/pdf,.pdf';

/**
 * Vacío: la tarjeta de documento del sistema (`tl-doc--empty`) con un solo
 * botón real, «Elegir archivo». MediaUploader `document` trae también «Tomar
 * foto» y no tiene cómo quitarla (pedido en «requests»: `camera={false}`);
 * cuando la tenga, esto vuelve a ser MediaUploader.
 */
function EmptyPdfPicker({ onSelect }: { onSelect: (files: File[]) => void }) {
    const input = useRef<HTMLInputElement>(null);
    return (
        <div className="tl-doc tl-doc--empty">
            <div className="tl-doc__body">
                <span className="tl-doc__name">{COPY.cv.documento}</span>
                <span className="tl-doc__meta">{COPY.cv.formatos}</span>
            </div>
            <div className="tl-upload-actions">
                <Button variant="outline" icon={IconUpload} onClick={() => input.current?.click()}>
                    {COPY.cv.elegir}
                </Button>
                <input
                    ref={input}
                    type="file"
                    hidden
                    tabIndex={-1}
                    accept={PDF}
                    onChange={(e) => {
                        const files = Array.from(e.currentTarget.files ?? []);
                        // Vacía el input para que elegir otra vez el mismo archivo vuelva a avisar.
                        e.currentTarget.value = '';
                        if (files.length > 0) onSelect(files);
                    }}
                />
            </div>
        </div>
    );
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
    // Al abrir, parte del CV guardado (también si la última vez se cerró con el atrás del navegador).
    const [wasOpen, setWasOpen] = useState(open);
    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) {
            setFile(current ?? null);
            setError(null);
            setConfirm(false);
        }
    }

    // Elegir o quitar un archivo cambia la tarjeta y se lleva el botón tocado: el foco
    // pasa a la tarjeta del documento (no cae en <body>).
    const docRef = useRef<HTMLDivElement>(null);
    const [docChanges, setDocChanges] = useState(0);
    useEffect(() => {
        if (docChanges > 0) docRef.current?.focus({ preventScroll: true });
    }, [docChanges]);

    // Un archivo que no sirve no reemplaza al anterior a medias: queda sin archivo
    // elegido (Guardar deshabilitado) y la tarjeta dice por qué.
    const reject = (message: string) => {
        setFile(null);
        setError(message);
    };

    const pick = (files: File[]) => {
        const f = files[0];
        if (!f) return;
        setDocChanges((n) => n + 1);
        // El selector del teléfono puede saltarse `accept`: lo que no es un PDF de hasta 10 MB se rechaza.
        const check = checkCvFile(f);
        if (check === 'no-pdf') {
            reject(COPY.cv.soloPdf);
            return;
        }
        if (check === 'muy-grande') {
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
                    <div ref={docRef} tabIndex={-1} className="tl-focus">
                        {!error && !file ? (
                            <EmptyPdfPicker onSelect={pick} />
                        ) : (
                            <MediaUploader
                                variant="document"
                                title={COPY.cv.documento}
                                formats={COPY.cv.formatos}
                                accept={PDF}
                                state={error ? 'error' : 'uploaded'}
                                fileName={file?.nombre}
                                size={file?.detalle}
                                error={error ?? undefined}
                                onSelect={pick}
                                onRemove={() => {
                                    setFile(null);
                                    setDocChanges((n) => n + 1);
                                }}
                            />
                        )}
                    </div>
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
