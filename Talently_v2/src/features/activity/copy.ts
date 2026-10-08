// Textos de Actividad (ACT-01 a ACT-03) y Mi turno (TUR-01). Los que están en
// el prototipo F1 van tal cual (ACT-02.dc.html, ACT-02-matias.dc.html,
// TUR-01.dc.html); los demás siguen la voz del sistema de diseño.

export const copy = {
    tab: {
        title: 'Actividad',
        segmentsLabel: 'Actividad',
        notifications: (n: number) => (n > 0 ? `Notificaciones, ${n} sin leer` : 'Notificaciones'),
    },
    segments: {
        agenda: 'Agenda',
        postulaciones: 'Postulaciones',
        /** Persona (aviso del hogar, clases, servicios). */
        misPublicaciones: 'Mis publicaciones',
        /** Organización. */
        publicaciones: 'Publicaciones',
    },

    agenda: {
        later: 'Más adelante',
        emptyTitle: 'Aún no tienes nada agendado',
        emptyWorker: 'Cuando te confirmen un turno o te citen a una entrevista, lo verás aquí con su fecha y hora.',
        emptyOrg: 'Cuando publiques un turno, lo verás aquí por fecha, con sus cupos cubiertos.',
        emptyOther: 'Cuando agendes una entrevista, la verás aquí con su fecha y hora.',
        seeShifts: 'Ver turnos cerca',
        seeJobs: 'Ver empleos cerca',
        weekEmptyTitle: 'Nada agendado esta semana',
        weekEmptyNext: (fecha: string) => `Lo próximo es el ${fecha}: lo ves más abajo.`,
        /** Organización: «5/8 confirmados». */
        coverage: (confirmed: number, total: number) => `${confirmed}/${total} confirmados`,
    },

    applications: {
        empleos: 'Empleos',
        turnos: 'Turnos',
        boostTitle: 'Impulsa tu perfil',
        boostSub: 'Más organizaciones verán tu perfil primero',
        emptyTitle: 'Aún no tienes postulaciones',
        emptyText: 'Cuando postules a un empleo o tomes un turno, aquí verás en qué va cada uno.',
        seeShifts: 'Ver turnos cerca',
        seeJobs: 'Ver empleos cerca',
    },

    publications: {
        groups: { activas: 'Activas', pausadas: 'Pausadas', cerradas: 'Cerradas' },
        emptyTitle: 'Aún no tienes publicaciones',
        emptyText: 'Lo que publiques aparece aquí, con sus postulantes y su estado.',
        goHome: 'Ir a Inicio',
        summaryTitle: 'Tu publicación',
        close: 'Cerrar',
    },

    shift: {
        title: 'Mi turno',
        addToCalendar: 'Agregar al calendario',
        calendarDownloaded: 'Descargamos el turno: ábrelo para agregarlo a tu calendario',
        soon: 'Disponible pronto',
        whereWho: 'Dónde y con quién',
        chat: 'Conversación con la organización',
        share: 'Compartir mi turno con alguien de confianza',
        shareSub: 'Le enviamos la dirección y el horario a quien elijas',
        shareCopied: 'Copiamos la dirección y el horario para que los envíes',
        shareError: 'No pudimos compartir tu turno. Intenta de nuevo.',
        shareText: (titulo: string, fecha: string, horario: string, direccion?: string, llegada?: string) =>
            [
                `Mi turno: ${titulo}`,
                `${fecha} · ${horario}`,
                direccion && `Dirección: ${direccion}`,
                llegada && `Llego a las ${llegada}`,
            ]
                .filter(Boolean)
                .join('\n'),
        cancel: 'Cancelar turno',
        cancelSub: 'Si cancelas con menos de 12 h, baja tu Confiabilidad',
        cancelDialogTitle: '¿Cancelar este turno?',
        cancelDialogLate: (org: string) =>
            `Faltan menos de 12 h: si cancelas ahora, baja tu Confiabilidad. Le avisaremos a ${org}.`,
        cancelDialogOnTime: (org: string) => `Le avisaremos a ${org} para que busque a otra persona.`,
        keep: 'Mantener turno',
        cancelled: 'Cancelaste el turno',
        notFoundTitle: 'No encontramos este turno',
        notFoundText: 'Puede que el enlace esté incompleto o que el turno ya no esté en tu cuenta.',
        seeApplications: 'Ver mis postulaciones',
    },

    verification: {
        title: (name: string) => `Verificación de ${name}`,
        note: 'Talently revisa estos datos antes de marcar una insignia como verificada.',
    },
} as const;
