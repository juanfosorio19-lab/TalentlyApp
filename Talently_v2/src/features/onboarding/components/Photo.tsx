// La foto de perfil (ONB-03 y «Te falta tu foto» de ONB-99): MediaUploader
// avatar de src/ui. No se sube nada mientras Supabase está pausado: la subida
// la simula store.ts (sigue aunque se cambie de paso) y la foto se muestra
// desde el teléfono (object URL).
//
// Mientras sube, «Tomar foto» y «Elegir de la galería» siguen habilitados
// (elegir otra reemplaza a la anterior): el botón tocado no pierde el foco. El
// botón de cámara del avatar sí desaparece (lo reemplaza el spinner), así que
// el foco pasa al bloque de la foto, que sigue en pantalla.
import { useEffect, useRef, type RefObject } from 'react';
import { useSheet } from '../../../app/sheets';
import { BottomSheet } from '../../../ui/BottomSheet';
import { Stack } from '../../../ui/Layout';
import { MediaUploader, UploadActions } from '../../../ui/MediaUploader';
import { COPY } from '../copy';
import { subirFoto, useDraft } from '../store';
import { useFocusRescue } from './useFocusRescue';

export const PHOTO_SHEET = 'foto';

export interface PickPhoto {
    uploading: boolean;
    pick: (files: File[]) => void;
}

/**
 * Elige la foto y la sube (store.ts). `focusRef`: el bloque que recibe el
 * foco si lo tocado desaparece durante la subida.
 */
export function usePickPhoto(focusRef: RefObject<HTMLElement | null>): PickPhoto {
    const uploading = useDraft().datos.fotoSubiendo;
    useFocusRescue(focusRef, [uploading]);
    return {
        uploading,
        pick: (files) => {
            const file = files[0];
            if (file) subirFoto(file);
        },
    };
}

function PhotoPicker({ name, onDone }: { name: string; onDone: () => void }) {
    const boxRef = useRef<HTMLDivElement>(null);
    const { uploading, pick } = usePickPhoto(boxRef);
    // Al terminar la subida que empezó en esta hoja, la hoja se cierra sola.
    const started = useRef(false);
    const done = useRef(onDone);
    useEffect(() => {
        done.current = onDone;
    });
    useEffect(() => {
        if (uploading) started.current = true;
        else if (started.current) {
            started.current = false;
            done.current();
        }
    }, [uploading]);

    return (
        <Stack gap={4} ref={boxRef} tabIndex={-1} className="onb-slot">
            <MediaUploader variant="avatar" name={name} uploading={uploading} actions={false} onSelect={pick} />
            <UploadActions capture="user" onSelect={pick} />
        </Stack>
    );
}

/** «Agregar» de ONB-99 (`?sheet=foto`). El contenido se monta al abrir: parte de cero cada vez. */
export function PhotoSheet({ name }: { name: string }) {
    const sheet = useSheet(PHOTO_SHEET);
    return (
        <BottomSheet open={sheet.open} onClose={sheet.hide} title={COPY.listo.fotoTitulo}>
            <PhotoPicker name={name} onDone={sheet.hide} />
        </BottomSheet>
    );
}
