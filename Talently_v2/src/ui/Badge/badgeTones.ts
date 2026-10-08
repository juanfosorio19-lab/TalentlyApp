// Diccionario de estados de Badge: cada etiqueta lleva SIEMPRE el mismo tono
// (Badge/README.md y decisiones.md, M1·L3 punto 12; M10 punto 4).
// Una pantalla nunca elige el tono de un estado: usa `<Badge status="…" />`.

export type BadgeTone = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger';

export const BADGE_TONE_BY_STATUS = {
    // neutral: color-surface-2 + color-text-2
    'Visto': 'neutral',
    'No seleccionado': 'neutral',
    'Postulación retirada': 'neutral',
    'Oferta cerrada': 'neutral',
    'Cancelaste': 'neutral',
    'Cancelada': 'neutral',
    'Borrador': 'neutral',
    'Cerrada': 'neutral',
    'Expirada': 'neutral',
    'Pendiente': 'neutral',
    'Recomendada': 'neutral',
    'Recomendado': 'neutral',
    'Pronto': 'neutral',
    'Cerrado': 'neutral',
    'Cancelado': 'neutral',
    'Reembolsado': 'neutral',
    'Cupos completos': 'neutral',
    // primary: «Nuevo» (algo que aún no se ha visto) y avances del proceso
    'Nuevo': 'primary',
    'En proceso': 'primary',
    'Entrevista': 'primary',
    'Oferta': 'primary',
    'Cotizado': 'primary',
    'Aceptado': 'primary',
    // El oficio principal del perfil (prototipo-f1: PRF-01 y ONB-T1).
    'Principal': 'primary',
    // info
    'Invitado': 'info',
    'Postulado': 'info',
    'Solicitada': 'info',
    'En revisión': 'info',
    'Lista de espera': 'info',
    'Solicitado': 'info',
    // success
    'Contratado': 'success',
    'Confirmado': 'success',
    'Asististe': 'success',
    'Completado': 'success',
    'Confirmada': 'success',
    'Realizada': 'success',
    'Activa': 'success',
    'Verificada': 'success',
    // Un título o certificado ya revisado en el detalle (prototipo-f2: DET-01 Clase).
    'Verificado': 'success',
    'Reservado': 'success',
    'Realizado': 'success',
    'Pagado': 'success',
    // warning: un límite o algo por vencer, nunca rojo
    'En lista de espera': 'warning',
    'Pendiente de pago': 'warning',
    'Pausada': 'warning',
    'Vence en 30 días': 'warning',
    'Obligatoria': 'warning',
    'En disputa': 'warning',
    // danger
    'Cancelado por la organización': 'danger',
    'No asististe': 'danger',
    'No asistió': 'danger',
    'Vencida': 'danger',
    'Rechazada': 'danger',
} as const satisfies Record<string, BadgeTone>;

/** Etiqueta del diccionario, tal como se muestra. */
export type BadgeStatus = keyof typeof BADGE_TONE_BY_STATUS;

/** `true` si la etiqueta está en el diccionario (para textos que llegan como `string`). */
export function isBadgeStatus(label: string): label is BadgeStatus {
    return Object.hasOwn(BADGE_TONE_BY_STATUS, label);
}
