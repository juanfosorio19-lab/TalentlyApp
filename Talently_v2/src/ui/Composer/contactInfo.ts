// Detección de datos de contacto en un mensaje (M5, decisiones punto 8): al
// escribir un teléfono o un enlace aparece sobre el Composer el Banner warning
// «Por tu seguridad, mantén la conversación en Talently.». Avisa y no bloquea,
// así que se prefiere no avisar ante la duda (montos, fechas, RUT, horas).

/** Qué se detectó: un número de teléfono o un enlace. */
export type ContactInfoKind = 'phone' | 'link';

// Un enlace: con protocolo, con «www.» o un dominio con una terminación
// conocida («mi-negocio.cl», «bit.ly/…»). Las terminaciones que también son
// palabras («me», «co», «app», «info»…) cuentan solo con «/» después
// («wa.me/56…», «t.me/…»), para no confundir «nos vemos.me avisas». Un correo
// cae aquí por su dominio («@gmail.com»), y también saca la conversación de Talently.
const DOMAIN = String.raw`(?<![\p{L}\p{N}-])[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.`;
const LINKS = [
    /(?<![\p{L}\p{N}])https?:\/\/\S/iu,
    /(?<![\p{L}\p{N}])www\.[a-z0-9-]/iu,
    new RegExp(`${DOMAIN}(?:cl|com|net|org|io|ly|gl|gg|tv|xyz|biz|lat|store|shop)(?![\\p{L}\\p{N}-])`, 'iu'),
    new RegExp(`${DOMAIN}(?:me|co|app|info|link|site|online)\\/`, 'iu'),
];

// Una corrida de cifras con separadores de teléfono (espacio, punto, guion,
// paréntesis), con «+» opcional al inicio. Sin una cifra, letra o «$» pegada
// antes ni una cifra o letra pegada después.
const DIGIT_RUN = /(?<![\p{L}\p{N}$])\+?\(?\d[\d\s().-]*\d(?![\p{L}\p{N}])/gu;

// Formas que se parecen a un teléfono y no lo son.
const NOT_PHONE = [
    /^\d{1,3}(?:\.\d{3})+(?:,\d+)?$/, // monto con punto de miles: 650.000, 35.000.000
    /^\d{1,2}\.\d{3}\.\d{3}-?\d?$/, // RUT: 12.345.678-9
    /^\d{1,2}[-.]\d{1,2}[-.]\d{2,4}$/, // fecha: 30-11-2026, 12.12.26
    /^\d{1,2}[.:]\d{2}\s*-\s*\d{1,2}[.:]\d{2}$/, // horario: 18.00 - 23.30
];

/**
 * ¿La corrida es un teléfono? Chile usa 9 cifras desde 2012 (celular 9 + 8,
 * fijo con código de área: 2 2123 4567, 32 212 3456) y 11 con el 56 delante.
 * Con «+» delante, cualquier número internacional de 8 a 15 cifras.
 */
function isPhone(run: string): boolean {
    const trimmed = run.trim();
    if (NOT_PHONE.some((re) => re.test(trimmed))) return false;
    const digits = trimmed.replace(/\D/g, '');
    if (trimmed.startsWith('+')) return digits.length >= 8 && digits.length <= 15;
    if (digits.length === 11) return digits.startsWith('56') && /[2-9]/.test(digits[2] ?? '');
    if (digits.length === 9) return /^[2-9]/.test(digits);
    return false;
}

/** El primer dato de contacto del texto, o `null` si no hay. */
export function findContactInfo(text: string): ContactInfoKind | null {
    if (LINKS.some((re) => re.test(text))) return 'link';
    for (const match of text.matchAll(DIGIT_RUN)) {
        if (isPhone(match[0])) return 'phone';
    }
    return null;
}

/** `true` si el texto trae un teléfono o un enlace: el Composer muestra el aviso de seguridad. */
export function hasContactInfo(text: string): boolean {
    return findContactInfo(text) !== null;
}
