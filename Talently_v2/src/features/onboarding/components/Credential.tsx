// La credencial SPD del guardia (ONB-T4 y ONB-99): la tarjeta con «Subir
// ahora» o «Después» y la hoja para elegir el archivo (`?sheet=credencial`,
// SHT-SUBIR del prototipo). La subida se simula (Supabase está pausado) y
// queda «En revisión».
import { useEffect, useRef, useState } from 'react';
import { useSheet } from '../../../app/sheets';
import { Badge } from '../../../ui/Badge';
import { BottomSheet } from '../../../ui/BottomSheet';
import { Button } from '../../../ui/Button';
import { IconUpload } from '../../../ui/icons';
import { MediaUploader } from '../../../ui/MediaUploader';
import { COPY } from '../copy';
import { MAX_ARCHIVO_BYTES, megas, type CredencialDraft } from '../model';
import { credencialDespues, quitarCredencial, subirCredencial } from '../store';

export const CREDENTIAL_SHEET = 'credencial';

const C = COPY.trabajo.requisitos;

/**
 * El documento según su estado. Vacío: la tarjeta del prototipo (MediaUploader
 * aún no trae «Subir ahora» / «Después», pedido en «requests»). Subiendo y en
 * revisión: MediaUploader documento.
 */
export function CredentialCard({ credencial, onUpload }: { credencial: CredencialDraft; onUpload: () => void }) {
    if (credencial.estado === 'subiendo' || credencial.estado === 'revision') {
        const uploading = credencial.estado === 'subiendo';
        return (
            <>
                <MediaUploader
                    variant="document"
                    title={C.credencialNombre}
                    state={uploading ? 'uploading' : 'uploaded'}
                    fileName={credencial.archivo?.nombre}
                    progress={credencial.progreso}
                    size={credencial.archivo?.peso}
                    status="En revisión"
                    onSelect={() => undefined}
                    onCancel={quitarCredencial}
                    onRemove={quitarCredencial}
                />
                {!uploading && <p className="body onb-muted onb-after">{C.enRevisionNota}</p>}
            </>
        );
    }
    return (
        <>
            <div className="tl-doc tl-doc--empty">
                <div className="tl-doc__body">
                    <span className="tl-doc__name">{C.credencialNombre}</span>
                    <span className="tl-doc__meta">
                        <Badge status="Obligatoria" />
                        {C.formatos}
                    </span>
                </div>
                <p className="body onb-muted onb-flush">{C.sinCredencial}</p>
                <div className="tl-upload-actions">
                    <Button variant="tonal" icon={IconUpload} aria-haspopup="dialog" onClick={onUpload}>
                        {C.subirAhora}
                    </Button>
                    <Button variant="ghost" onClick={credencialDespues}>
                        {C.despues}
                    </Button>
                </div>
            </div>
            {credencial.estado === 'despues' && (
                <p className="body onb-muted onb-after" role="status">
                    {C.despuesNota}
                </p>
            )}
        </>
    );
}

/** Elegir el archivo: el contenido se monta al abrir, así un error anterior no queda. */
function CredentialPicker({ onPicked }: { onPicked: () => void }) {
    const [error, setError] = useState<string | null>(null);
    const boxRef = useRef<HTMLDivElement>(null);
    // Con el error, «Elegir archivo» (que tenía el foco) desaparece: el foco pasa a «Elegir otro».
    useEffect(() => {
        if (error) boxRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    }, [error]);
    return (
        <MediaUploader
            ref={boxRef}
            variant="document"
            title={C.credencialNombre}
            state={error ? 'error' : 'empty'}
            requirement="Obligatoria"
            formats={C.formatos}
            error={error ?? undefined}
            onSelect={(files) => {
                const file = files[0];
                if (!file) return;
                if (file.size > MAX_ARCHIVO_BYTES) {
                    setError(C.errPeso(megas(file.size)));
                    return;
                }
                subirCredencial(file);
                onPicked();
            }}
        />
    );
}

export function CredentialSheet() {
    const sheet = useSheet(CREDENTIAL_SHEET);
    return (
        <BottomSheet open={sheet.open} onClose={sheet.hide} title={C.credencial}>
            <CredentialPicker onPicked={sheet.hide} />
        </BottomSheet>
    );
}
