// Datos que Actividad necesita y features/demo aún no trae (pedidos en
// requests). Todo es «no está en el prototipo» salvo la hora, que sale del
// índice del prototipo F1 («hoy en la demo es jue 10 dic 2026, 13:00»).
// Cuando features/demo los traiga, este archivo se borra.

/** Hora de la demo: data.ts solo exporta el día (DEMO_TODAY). */
export const DEMO_NOW_TIME = '13:00';

/**
 * no está en el prototipo: las entrevistas de la agenda no traen hora de
 * término y CalendarWeek la necesita para dibujar el bloque. Se muestran de 1 h.
 */
export const INTERVIEW_MINUTES = 60;

/**
 * no está en el prototipo: qué revisó Talently en cada insignia (hoja
 * «Verificación de …»). Sin RUT de personas, fecha de nacimiento ni fotos.
 */
export const VERIFICATION_DETAIL: Record<string, string> = {
    'Organización verificada': 'RUT y documentos de la organización revisados',
    'Teléfono verificado': 'Código por SMS',
    'Identidad verificada': 'Cédula y selfie revisadas',
    'Credencial SPD verificada': 'Credencial revisada con su vencimiento',
};
