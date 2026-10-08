import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { DemoModule } from '../catalog/types';
import { DemoFrame, DemoItem, DemoLabel, DemoNotApplicable, DemoRow, DemoSection } from '../catalog/demo';
import { Stack } from '../Layout';
import {
    DocSample,
    DocSampleList,
    MediaCapture,
    MediaUploader,
    type DocumentUploadState,
    type GalleryPhoto,
} from './MediaUploader';

/** Contenido de una pantalla de 390 (margen lateral space-4). */
function Phone({ children }: { children: ReactNode }) {
    return (
        <DemoFrame width={390}>
            <div className="tl-app-screen__content">{children}</div>
        </DemoFrame>
    );
}

const nada = () => {};
const fotos = (n: number): GalleryPhoto[] => Array.from({ length: n }, (_, i) => ({ id: `f${i + 1}`, label: `Foto ${i + 1}` }));

/** Avatar: al elegir una foto, «sube» 1,5 s y queda puesta (en el catálogo, el marcador rayado). */
function AvatarDemo() {
    const [photo, setPhoto] = useState<true | null>(null);
    const [uploading, setUploading] = useState(false);
    const timer = useRef<number | undefined>(undefined);
    useEffect(() => () => window.clearTimeout(timer.current), []);
    const onSelect = () => {
        setPhoto(true);
        setUploading(true);
        timer.current = window.setTimeout(() => setUploading(false), 1500);
    };
    return <MediaUploader variant="avatar" name="Matías Rojas" photo={photo} uploading={uploading} onSelect={onSelect} />;
}

/** Documento: al elegir un archivo, la barra avanza con el porcentaje y queda «En revisión». */
function DocumentDemo() {
    const [state, setState] = useState<DocumentUploadState>('empty');
    const [progress, setProgress] = useState(0);
    const [file, setFile] = useState<{ name: string; size: string } | null>(null);
    const timer = useRef<number | undefined>(undefined);
    useEffect(() => () => window.clearInterval(timer.current), []);
    const stop = () => window.clearInterval(timer.current);
    const onSelect = (files: File[]) => {
        const f = files[0];
        if (!f) return;
        stop();
        setFile({ name: f.name, size: `${Math.max(1, Math.round(f.size / 1024))} KB` });
        setProgress(0);
        setState('uploading');
        let p = 0;
        timer.current = window.setInterval(() => {
            p += 15;
            if (p >= 100) {
                stop();
                setState('uploaded');
            } else setProgress(p);
        }, 300);
    };
    return (
        <MediaUploader
            variant="document"
            title="Credencial SPD (ex OS-10)"
            requirement="Obligatoria"
            formats="Foto o PDF, hasta 10 MB"
            state={state}
            fileName={file?.name}
            size={file?.size}
            progress={progress}
            status="En revisión"
            onSelect={onSelect}
            onCancel={() => {
                stop();
                setState('empty');
            }}
            onRemove={() => setState('empty')}
        />
    );
}

function GalleryDemo() {
    const [photos, setPhotos] = useState<GalleryPhoto[]>(fotos(3));
    return (
        <MediaUploader
            variant="gallery"
            label="Fotos de tus trabajos"
            optional
            photos={photos}
            onSelect={(files) => setPhotos((prev) => [...prev, ...fotos(prev.length + files.length).slice(prev.length)])}
            onOpenPhoto={nada}
        />
    );
}

function MediaUploaderDemo() {
    return (
        <>
            <DemoSection title="Avatar · círculo de 96 con botón cámara">
                <DemoItem label="Sin foto · toca la cámara o un botón">
                    <AvatarDemo />
                </DemoItem>
                <DemoRow>
                    <DemoItem label="Subiendo… · spinner de 40 sobre el velo">
                        <MediaUploader variant="avatar" name="Matías Rojas" photo uploading actions={false} onSelect={nada} />
                    </DemoItem>
                    <DemoItem label="Con foto · la cámara cambia la foto">
                        <MediaUploader variant="avatar" name="Matías Rojas" photo actions={false} onSelect={nada} />
                    </DemoItem>
                </DemoRow>
            </DemoSection>
            <DemoSection title="Logo · cuadrado de 96 con radio md (organización, ONB-O3)">
                <DemoRow>
                    <DemoItem label="Sin logo · Avatar de organización con iniciales">
                        <MediaUploader variant="logo" name="Banquetería Rosa SpA" actions={false} onSelect={nada} />
                    </DemoItem>
                    <DemoItem label="Con logo · la cámara cambia el logo">
                        <MediaUploader variant="logo" name="Banquetería Rosa SpA" photo actions={false} onSelect={nada} />
                    </DemoItem>
                    <DemoItem label="Subiendo…">
                        <MediaUploader variant="logo" name="Banquetería Rosa SpA" photo uploading actions={false} onSelect={nada} />
                    </DemoItem>
                </DemoRow>
            </DemoSection>
            <DemoSection title="Documento · credencial del oficio">
                <Phone>
                    <Stack gap={4}>
                        <DocumentDemo />
                        <MediaUploader
                            variant="document"
                            title="Credencial SPD (ex OS-10)"
                            state="uploading"
                            fileName="credencial-spd.pdf"
                            progress={45}
                            onSelect={nada}
                            onCancel={nada}
                        />
                        <MediaUploader
                            variant="document"
                            title="Credencial SPD (ex OS-10)"
                            state="uploaded"
                            fileName="credencial-spd.pdf"
                            size="320 KB"
                            status="En revisión"
                            onSelect={nada}
                            onRemove={nada}
                        />
                        <MediaUploader
                            variant="document"
                            title="Credencial SPD (ex OS-10)"
                            state="uploaded"
                            status="Verificada"
                            note="Vence 03/2028"
                            onSelect={nada}
                            onRemove={nada}
                        />
                        <MediaUploader
                            variant="document"
                            title="Credencial SPD (ex OS-10)"
                            state="error"
                            fileName="credencial-spd-scan.pdf"
                            error="Pesa 14 MB. Elige uno de hasta 10 MB."
                            onSelect={nada}
                        />
                    </Stack>
                </Phone>
                <DemoLabel>El primero se puede probar: elige un archivo y la barra avanza con el porcentaje real.</DemoLabel>
            </DemoSection>
            <DemoSection title="Galería · hasta 8 (F3, perfil de servicios)">
                <Phone>
                    <Stack gap={6}>
                        <GalleryDemo />
                        <MediaUploader
                            variant="gallery"
                            label="Fotos de tus trabajos"
                            optional
                            photos={fotos(8)}
                            onSelect={nada}
                            onOpenPhoto={nada}
                        />
                    </Stack>
                </Phone>
                <DemoLabel>
                    Tocar una foto abre una hoja con «Ver», «Cambiar» y «Quitar foto» (la arma la pantalla con BottomSheet y
                    ListItem). Llena: sin «Agregar», contador y aviso en warning.
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Cámara · VER-02 (M8): guía de encuadre; la foto se toma con Buttons reales">
                <Phone>
                    <Stack gap={4}>
                        <MediaCapture hint="Centra la cédula" onSelect={nada} />
                        <MediaCapture state="ok" hint="Bien, no te muevas" />
                        <MediaCapture state="error" hint="Salió borrosa" shot />
                        <MediaCapture guide="face" hint="Cara dentro del óvalo" onSelect={nada} />
                    </Stack>
                </Phone>
                <DemoLabel>
                    Guía en color-primary-text; bien encuadrada, color-success-text; con problema, color-danger-text y el
                    motivo. Fuera de la guía, el velo color-scrim. Debajo, siempre «Tomar foto» y «Elegir de la galería».
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Ejemplo visual · VER-02 y VER-03 (M8): esquema, nunca una foto ni datos de verdad">
                <Phone>
                    <DocSampleList
                        items={[
                            { variant: 'front', label: 'Cédula por delante' },
                            { variant: 'back', label: 'Cédula por detrás' },
                            { variant: 'face', label: 'Una selfie' },
                        ]}
                    />
                </Phone>
                {/* Ancho del ejemplo suelto en preview.html. */}
                <div style={{ width: 232 }}>
                    <DocSample variant="credential" marks={[0, 1, 3]} label="Ejemplo: credencial SPD" />
                </div>
                <DemoLabel>
                    Credencial SPD: lo marcado (color-primary-subtle con borde color-primary-text) es lo que debe leerse:
                    nombre, número y vencimiento.
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Default">
                <DemoLabel>Vacío, arriba.</DemoLabel>
            </DemoSection>
            <DemoSection title="Presionado">
                <DemoNotApplicable>Lo tienen sus botones y miniaturas.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Foco">
                <DemoNotApplicable>Lo tienen sus botones y miniaturas.</DemoNotApplicable>
            </DemoSection>
            <DemoSection title="Seleccionado">
                <DemoLabel>Con archivo: nombre, peso y Badge del diccionario («En revisión», «Verificada»).</DemoLabel>
            </DemoSection>
            <DemoSection title="Deshabilitado">
                <DemoLabel>
                    Galería llena: sin «Agregar» y contador en warning. Mientras se guarda (saving), también sin
                    «Agregar»: la galería aún no tiene estilo deshabilitado en el sistema.
                </DemoLabel>
            </DemoSection>
            <DemoSection title="Error">
                <DemoLabel>Borde y texto danger con el motivo y «Elegir otro».</DemoLabel>
            </DemoSection>
            <DemoSection title="Cargando">
                <DemoLabel>Barra de 4 px con el porcentaje real o spinner de 40 en el avatar.</DemoLabel>
            </DemoSection>
        </>
    );
}

const demo: DemoModule = {
    name: 'MediaUploader',
    group: 'Agenda y archivos',
    summary: 'Fotos y documentos con botones reales «Tomar foto» y «Elegir de la galería»: avatar o logo, documento con progreso y estados, galería de hasta 8, cámara con guía de encuadre y ejemplo visual.',
    Demo: MediaUploaderDemo,
};

export default demo;
