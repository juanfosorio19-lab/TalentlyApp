// Textos de Mensajes (MSG-01, MSG-02, MSG-02b), en español de Chile y tal
// cual el prototipo F1 y el sistema de diseño (BottomSheet, Composer,
// EmptyState). Lo que viene de los datos (nombres, contexto, mensajes) no
// está aquí: sale de features/demo.

/** Filtros de la bandeja de una persona (MSG-01): uno a la vez. */
export type InboxFilter = 'todos' | 'empleo' | 'turno';

export const copy = {
    bell: (unread: number) => (unread > 0 ? `Notificaciones, ${unread} sin leer` : 'Notificaciones'),

    inbox: {
        title: 'Mensajes',
        filtersLabel: 'Tipo de conversación',
        filters: { todos: 'Todos', empleo: 'Empleo', turno: 'Turno' } satisfies Record<InboxFilter, string>,
        /** Organización (spec §5.2): «Igual, con filtro por publicación». */
        publicationFiltersLabel: 'Publicación',
        unread: (n: number) => (n === 1 ? '1 mensaje sin leer' : `${n} mensajes sin leer`),
        emptyTitle: 'Aún no tienes conversaciones',
        emptyText: 'Cuando postules o tomes un turno, aquí podrás hablar con quien publica.',
        emptyAction: 'Explorar turnos',
        emptyActionJobs: 'Explorar empleos',
        /** Quien publica (organización u hogar): le habla a quien recibe postulaciones. */
        publisherEmptyText: 'Cuando alguien postule a tus publicaciones, aquí podrás hablar con esa persona.',
        publisherEmptyAction: 'Ver mis publicaciones',
        /** Persona sin perfiles (INI-01-rosa): «Agregar un perfil», como en Inicio, Explorar y la Agenda. */
        noProfilesText: 'Agrega un perfil para buscar trabajo o contratar para tu hogar. Aquí podrás hablar con quien publica o con quien postula.',
        addProfile: 'Agregar un perfil',
        filteredTitle: {
            empleo: 'No tienes conversaciones de empleos',
            turno: 'No tienes conversaciones de turnos',
        },
        filteredText: {
            empleo: 'Cuando hagas match en un empleo, aquí podrás hablar con quien lo publica.',
            turno: 'Cuando postules a un turno, aquí podrás hablar con quien lo publica.',
        },
        /** Quien solo publica (Carolina): le habla a quien recibe postulaciones. */
        publisherFilteredText: {
            empleo: 'Cuando alguien postule a tus empleos, aquí podrás hablar con esa persona.',
            turno: 'Cuando alguien postule a tus turnos, aquí podrás hablar con esa persona.',
        },
        /** Fila con actividad de esta sesión: lo más nuevo, en la escala relativa de la bandeja. */
        justNow: 'ahora',
        filteredAction: 'Ver todas',
    },

    chat: {
        label: (name: string) => `Conversación con ${name}`,
        youPrefix: 'Tú: ',
        today: 'Hoy',
        emptyTitle: 'Aún no hay mensajes',
        emptyText: (name: string) => `Escríbele a ${name} para coordinar los próximos pasos.`,
        // «Seguridad Andes Ltda.» ya termina en punto: no se repite.
        blocked: (name: string) => `Bloqueaste a ${name}${name.endsWith('.') ? '' : '.'} Ya no pueden enviarse mensajes.`,
        offline: 'Sin conexión. Mostramos lo último que cargaste.',
        calendarDownloaded: 'Descargamos la entrevista: ábrela para agregarla a tu calendario',
        calendarError: 'No pudimos abrir el calendario. Intenta de nuevo.',
        stoppedSharing: 'Dejaste de compartir tu certificado',
        alreadySharing: 'Ya lo estás compartiendo. Puedes dejar de hacerlo desde la tarjeta.',
        interviewWith: (name: string) => `Entrevista con ${name}`,
    },

    attach: {
        title: 'Adjuntar',
        certificate: 'Compartir certificado de antecedentes',
        certificateSub: 'Compartirlo es voluntario',
        photo: 'Tomar foto',
        gallery: 'Elegir de la galería',
        document: 'Compartir un documento',
    },

    share: {
        title: 'Certificado de antecedentes',
        intro: 'Compartirlo es voluntario. Solo esta persona podrá verlo durante 7 días y puedes dejar de compartirlo cuando quieras.',
        willSee: 'Lo verá',
        legend: 'Qué certificado compartir',
        existing: 'Usar el que ya subí',
        upload: 'Subir uno nuevo',
        uploadSub: 'Foto o PDF',
        action: 'Compartir',
    },

    menu: {
        publication: 'Ver publicación',
        report: 'Reportar',
        reportSub: 'Cuéntanos qué pasó',
        block: 'Bloquear',
        blockSub: 'Te pediremos confirmarlo',
        unblock: 'Desbloquear',
        unblockSub: 'Podrán volver a escribirse',
    },

    report: {
        title: 'Reportar',
        legend: '¿Qué pasó?',
        // SHT-REPORTE (README BottomSheet, M5): los 7 motivos en este orden.
        reasons: ['Acoso', 'Estafa o cobro', 'Discriminación', 'Suplantación', 'Menor en riesgo', 'Agresión', 'Otro'],
        details: 'Cuéntanos qué pasó',
        send: 'Enviar reporte',
        sent: 'Recibimos tu reporte. Lo revisaremos.',
    },

    block: {
        title: (name: string) => `¿Bloquear a ${name}?`,
        text: 'Ya no podrán enviarse mensajes en esta conversación.',
        confirm: 'Bloquear',
        unblocked: (name: string) => `Desbloqueaste a ${name}`,
    },

    notFound: {
        appBar: 'Conversación',
        title: 'No encontramos esta conversación',
        text: 'Puede que ya no exista o que sea de otro de tus perfiles.',
        action: 'Ir a Mensajes',
    },
} as const;
