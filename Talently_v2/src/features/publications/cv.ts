// El CV que se adjunta en DET-02: solo PDF y de hasta 10 MB (lo que dice el
// MediaUploader: «PDF, hasta 10 MB»). «Tomar foto» del MediaUploader siempre
// entrega una imagen: aquí se rechaza con un motivo en humano.

export const MAX_CV_BYTES = 10 * 1024 * 1024;

export interface PickedFile {
    name: string;
    size: number;
    /** Tipo MIME («application/pdf»); algunos teléfonos lo entregan vacío. */
    type: string;
}

/** «180 KB», «2,4 MB». */
export function sizeText(bytes: number): string {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function isPdf(file: Pick<PickedFile, 'name' | 'type'>): boolean {
    if (file.type) return file.type === 'application/pdf';
    return /\.pdf$/i.test(file.name);
}

export type CvProblem = { kind: 'not-pdf' } | { kind: 'too-big'; size: string };

/** Por qué no sirve el archivo elegido, o `null` si sirve. */
export function cvProblem(file: PickedFile): CvProblem | null {
    if (!isPdf(file)) return { kind: 'not-pdf' };
    if (file.size > MAX_CV_BYTES) return { kind: 'too-big', size: sizeText(file.size) };
    return null;
}
