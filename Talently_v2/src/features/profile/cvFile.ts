// Reglas del archivo de CV (hoja Subir CV): solo PDF, hasta 10 MB, y su peso
// como se muestra («180 KB», «1,4 MB»).

export const CV_MAX_BYTES = 10 * 1024 * 1024;

/** Lo que importa de un archivo elegido (un `File` cumple). */
export interface PickedFile {
    name: string;
    type: string;
    size: number;
}

export function isPdf(file: PickedFile): boolean {
    // Algunos selectores no dicen el tipo (o dicen «octet-stream»): ahí manda la extensión.
    if (file.type === 'application/pdf') return true;
    return (file.type === '' || file.type === 'application/octet-stream') && file.name.toLowerCase().endsWith('.pdf');
}

/** `ok`, o por qué no sirve. */
export function checkCvFile(file: PickedFile): 'ok' | 'no-pdf' | 'muy-grande' {
    if (!isPdf(file)) return 'no-pdf';
    if (file.size > CV_MAX_BYTES) return 'muy-grande';
    return 'ok';
}

/** Peso en es-CL: KB enteros bajo 1 MB; MB con un decimal y coma, sin «,0» («1,4 MB», «14 MB»). */
export function sizeText(bytes: number): string {
    if (bytes >= 1024 * 1024) {
        const mb = Math.round((bytes / (1024 * 1024)) * 10) / 10;
        return `${String(mb).replace('.', ',')} MB`;
    }
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
