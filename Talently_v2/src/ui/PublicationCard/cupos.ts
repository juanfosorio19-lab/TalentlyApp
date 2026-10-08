// Formato único de los cupos de un turno: el mismo en la tarjeta
// (PublicationCard), en el bloque del turno (ShiftBlock) y en el detalle.

/** Cupos libres de un turno: «Quedan 3 de 8 cupos». */
export interface Cupos {
    /** Cupos que quedan libres (0 = completo). */
    left: number;
    /** Cupos del turno. */
    total: number;
}

/**
 * `text` con 3 o más (texto) · `warning` con 2 o menos (Badge warning) ·
 * `full` sin cupos (Badge neutral «Cupos completos»). Decisiones M1·L6 punto 8.
 */
export type CuposTone = 'text' | 'warning' | 'full';

export function cuposTone({ left }: Cupos): CuposTone {
    if (left <= 0) return 'full';
    return left <= 2 ? 'warning' : 'text';
}

/** «Quedan 3 de 8 cupos», «Queda 1 de 8 cupos», «Cupos completos». */
export function cuposLabel({ left, total }: Cupos): string {
    if (left <= 0) return 'Cupos completos';
    return `${left === 1 ? 'Queda' : 'Quedan'} ${left} de ${total} cupos`;
}
