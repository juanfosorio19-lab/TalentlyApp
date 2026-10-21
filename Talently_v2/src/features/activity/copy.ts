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
        /** Sistema de diseño (EmptyState, «Actividad · Agenda, sin nada agendado»). */
        emptyWorker: 'Cuando te confirmen un turno o una entrevista, aparecerá aquí.',
        emptyOrg: 'Cuando publiques un turno, lo verás aquí por fecha, con sus cupos cubiertos.',
        emptyOther: 'Cuando agendes una entrevista, aparecerá aquí.',
        /** Persona sin perfiles (INI-01-rosa): «Agregar un perfil», como en Inicio. */
        emptyNoProfiles: 'Agrega un perfil para buscar trabajo o contratar para tu hogar. Aquí verás tus turnos y entrevistas.',
        addProfile: 'Agregar un perfil',
        /** Sistema de diseño (EmptyState de la Agenda). */
        seeShifts: 'Ver turnos de esta semana',
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
        /** Como en INI-01-carolina: Button primary block con IconAdd. */
        publish: 'Publicar',
    },

    shift: {
        title: 'Mi turno',
        addToCalendar: 'Agregar al calendario',
        calendarDownloaded: 'Descargamos el turno: ábrelo para agregarlo a tu calendario',
        calendarError: 'No pudimos abrir el calendario. Intenta de nuevo.',
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
        /** Quien no tiene Postulaciones (organización, hogar, sin perfiles). */
        goActivity: 'Ir a Actividad',
    },

    verification: {
        title: (name: string) => `Verificación de ${name}`,
        /** Igual que la hoja de Inicio: la hoja nunca muestra datos sensibles. */
        note: 'Talently nunca muestra el RUT, la fecha de nacimiento ni las fotos de la cédula.',
    },
} as const;
