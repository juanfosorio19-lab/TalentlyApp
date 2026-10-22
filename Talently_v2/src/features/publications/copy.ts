// Textos del feature «Detalle de publicación» (DET-01, DET-02, DET-03 y
// AUTH-08), tal como los dice el prototipo F1 de Claude Design. Lo que el
// prototipo no muestra (estados sin captura) sigue su misma voz y va marcado
// con «// no está en el prototipo».

export const copy = {
    appBar: {
        turno: 'Turno',
        empleo: 'Oferta de empleo',
        servicio: 'Servicio', // no está en el prototipo (F3)
        clase: 'Clase', // no está en el prototipo (F2)
        share: 'Compartir',
        more: 'Más opciones',
    },

    sections: {
        description: 'Descripción',
        requirements: 'Requisitos',
        benefits: 'Beneficios',
        aboutOrg: 'Sobre la organización',
    },

    cta: {
        take: 'Tomar turno',
        waitlist: 'Unirme a la lista de espera',
        myApplications: 'Ver mis postulaciones',
        myApplication: 'Ver mi postulación',
        myShift: 'Ver mi turno', // no está en el prototipo
        similarJobs: 'Ver ofertas parecidas',
        similarShifts: 'Ver turnos parecidos', // no está en el prototipo
        manage: 'Gestionar publicación', // no está en el prototipo
        quote: 'Solicitar cotización', // no está en el prototipo (F3)
        schedule: 'Ver horarios', // no está en el prototipo (F2)
        taking: 'Tomando el turno…',
    },

    closed: {
        empleo: 'Esta oferta ya no recibe postulaciones.',
        turno: 'Este turno ya no recibe postulaciones.', // no está en el prototipo
    },

    done: {
        turno: 'Postulaste al turno. Te avisaremos cuando te confirmen',
        waitlist: 'Te uniste a la lista de espera. Te avisaremos si se libera un cupo', // no está en el prototipo
        empleo: (titulo: string) => `Postulaste a ${titulo}`,
    },

    /** «No me interesa» del detalle: el mismo Snackbar que el deck (explore), con «Deshacer». */
    notInterested: (titulo: string) => `No te mostraremos más ${titulo}`,
    undo: 'Deshacer',

    /** «Gestionar publicación» de Rosa como persona: pasa a su organización (como SHT-ACTOR, flujo 7). */
    switched: (nombre: string) => `Cambiaste a ${nombre}`,

    // no está en el prototipo: una organización mira la publicación de otra (CTA sin botón, solo el aviso).
    orgCannotApply: 'Las organizaciones no postulan. Para postular, usa Talently como persona.',

    share: {
        copied: 'Copiamos el enlace',
        error: 'No pudimos copiar el enlace. Intenta de nuevo.',
    },

    more: {
        title: 'Más opciones',
        report: 'Reportar publicación',
        reportSub: 'Si algo no está bien en este aviso',
    },

    verification: {
        title: (name: string) => `Verificación de ${name}`,
        note: 'Talently nunca muestra el RUT, la fecha de nacimiento ni las fotos de la cédula.',
    },

    apply: {
        title: 'Postular',
        yes: 'Sí',
        no: 'No',
        answerRequired: 'Elige una respuesta',
        cv: 'CV',
        cvFromProfile: (size: string) => `Del perfil · ${size}`,
        change: 'Cambiar',
        cvNote: 'Esta oferta pide CV. Usamos el de tu perfil.',
        cvNoteEmpty: 'Esta oferta pide CV.', // no está en el prototipo
        cvTitle: 'Tu CV',
        cvFormats: 'PDF, hasta 10 MB',
        cvRequired: 'Sube tu CV para postular', // no está en el prototipo
        cvTooBig: (size: string) => `Pesa ${size}. Elige uno de hasta 10 MB.`,
        cvNotPdf: 'No es un PDF. Elige tu CV en PDF.', // no está en el prototipo
        message: 'Mensaje',
        messageHelp: (org: string) => `Lo verá ${org} junto a tu perfil.`,
        submit: 'Postular',
        sending: 'Enviando tu postulación…',
    },

    phone: {
        title: 'Verifica tu teléfono',
        introShift: 'Para tomar turnos necesitas un celular verificado. Lo pedimos una sola vez, y en Configuración decides quién lo ve.',
        // no está en el prototipo: la misma frase cuando el primer acto es postular a un empleo.
        introJob: 'Para postular necesitas un celular verificado. Lo pedimos una sola vez, y en Configuración decides quién lo ve.',
        label: 'Número de celular',
        prefix: '+56 9',
        help: '8 dígitos, sin el +56 9',
        invalid: 'Ingresa los 8 dígitos de tu celular', // no está en el prototipo
        channel: '¿Cómo te enviamos el código?',
        sms: 'Por SMS',
        whatsapp: 'Por WhatsApp',
        send: 'Enviar código',
        sending: 'Enviando el código…',
        codeTitle: 'Ingresa el código',
        sentTo: (channel: 'sms' | 'whatsapp', last4: string) =>
            `Te lo enviamos por ${channel === 'sms' ? 'SMS' : 'WhatsApp'} al +56 9 •••• ${last4}.`,
        resendIn: (time: string) => `Reenviar código (en ${time})`,
        resend: 'Reenviar código',
        changeNumber: 'Cambiar número',
    },
} as const;
