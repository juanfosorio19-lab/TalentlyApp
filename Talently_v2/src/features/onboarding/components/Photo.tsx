// La foto de perfil (ONB-03 y «Te falta tu foto» de ONB-99): MediaUploader
// avatar de src/ui. No se sube nada mientras Supabase está pausado: la foto
// elegida se muestra desde el teléfono (object URL) tras una espera breve.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSheet } from '../../../app/sheets';
import { BottomSheet } from '../../../ui/BottomSheet';
import { MediaUploader } from '../../../ui/MediaUploader';
import { COPY } from '../copy';
import { setDatos } from '../store';

export const PHOTO_SHEET = 'foto';

const DEMO_UPLOAD_MS = 700;

/** Elige la foto: muestra «subiendo» un momento y la deja en el borrador. */
export function usePickPhoto(onDone?: () => void): { uploading: boolean; pick: (files: File[]) => void } {
    const [uploading, setUploading] = useState(false);
    const timer = useRef<number | null>(null);
    useEffect(
        () => () => {
            if (timer.current !== null) window.clearTimeout(timer.current);
        },
        [],
    );
    const pick = useCallback(
        (files: File[]) => {
            const file = files[0];
            if (!file) return;
            setUploading(true);
            timer.current = window.setTimeout(() => {
                timer.current = null;
                setUploading(false);
                setDatos({ foto: URL.createObjectURL(file) });
                onDone?.();
            }, DEMO_UPLOAD_MS);
        },
        [onDone],
    );
    return { uploading, pick };
}

function PhotoPicker({ name, onDone }: { name: string; onDone: () => void }) {
    const { uploading, pick } = usePickPhoto(onDone);
    return <MediaUploader variant="avatar" name={name} uploading={uploading} onSelect={pick} />;
}

/** «Agregar» de ONB-99 (`?sheet=foto`). */
export function PhotoSheet({ name }: { name: string }) {
    const sheet = useSheet(PHOTO_SHEET);
    return (
        <BottomSheet open={sheet.open} onClose={sheet.hide} title={COPY.listo.fotoTitulo}>
            <PhotoPicker name={name} onDone={sheet.hide} />
        </BottomSheet>
    );
}
