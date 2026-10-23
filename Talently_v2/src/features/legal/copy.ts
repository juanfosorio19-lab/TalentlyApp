// Textos de LEG-01 Términos y LEG-02 Privacidad (spec §5.4). No están en el
// prototipo F1. El texto legal definitivo está pendiente (docs/PENDIENTES.md
// #2 y decisión 15 de docs/rediseno/README.md): falta la razón social, el
// domicilio en Chile y el correo de contacto. Por eso las pantallas muestran
// la estructura con un resumen de cada sección y un aviso honesto, sin
// inventar nombre de empresa, RUT, dirección ni fecha de vigencia.

export const COPY = {
    /** Banner warning, el mismo en los dos documentos. */
    enPreparacion: 'Texto en preparación: lo publicaremos con los datos legales de la empresa.',
    terminos: {
        titulo: 'Términos y condiciones',
        /** La única fecha del documento (LegalDocument): todavía no hay fecha de vigencia. */
        fecha: 'Vigentes desde: la fecha se fija al publicar el texto final',
    },
    privacidad: {
        titulo: 'Política de privacidad',
        fecha: 'Vigente desde: la fecha se fija al publicar el texto final',
    },
    /** Enlace de Términos a Privacidad (CFG-01 solo abre Términos). */
    verPrivacidad: 'Política de privacidad',
    verTerminos: 'Términos y condiciones',
} as const;
