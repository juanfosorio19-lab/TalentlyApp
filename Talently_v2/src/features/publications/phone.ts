// Celular chileno de AUTH-08: el campo muestra «+56 9» fijo delante y guarda
// solo los 8 dígitos que siguen. La persona puede escribirlo o pegarlo como
// lo tenga anotado («+56 9 1234 5678», «9 1234 5678», «56912345678»).

export const PHONE_DIGITS = 8;

/**
 * Los 8 dígitos del celular, sin el código de país ni el 9 inicial. Solo
 * quita esos prefijos cuando sobran dígitos: así «9123 4567» (un número que
 * empieza con 9) se queda tal cual mientras se escribe.
 */
export function normalizePhone(raw: string): string {
    let digits = raw.replace(/\D/g, '');
    if (digits.length > PHONE_DIGITS) {
        if (digits.startsWith('00')) digits = digits.slice(2);
        if (digits.startsWith('569') && digits.length >= PHONE_DIGITS + 3) digits = digits.slice(3);
        else if (digits.startsWith('56') && digits.length >= PHONE_DIGITS + 2) digits = digits.slice(2);
        else if (digits.startsWith('9') && digits.length === PHONE_DIGITS + 1) digits = digits.slice(1);
    }
    return digits.slice(0, PHONE_DIGITS);
}

/**
 * Lo que queda en el campo después de un cambio. Con el número completo, un
 * dígito de más escrito al final se ignora (no corre el número ni le quita
 * el 9 del comienzo).
 */
export function nextPhone(previous: string, raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (previous.length === PHONE_DIGITS && digits.length === PHONE_DIGITS + 1 && digits.startsWith(previous)) return previous;
    return normalizePhone(raw);
}

/** «12345678» → «1234 5678». */
export function groupPhone(digits: string): string {
    return digits.length > 4 ? `${digits.slice(0, 4)} ${digits.slice(4)}` : digits;
}
