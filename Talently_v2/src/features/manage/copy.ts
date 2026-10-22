// Textos de Gestionar publicaciones (GES-01, GES-02, GES-04). Los que están
// en el prototipo F1 van tal cual; los que no, con el comentario
// «no está en el prototipo».

export const copy = {
    common: {
        /** La misma frase en las tres pantallas cuando la publicación no existe en la demo. */
        notFoundTitle: 'No encontramos esta publicación',
        notFoundText: 'Puede que ya no exista. Tus publicaciones están en Actividad.', // no está en el prototipo
        goActivity: 'Ir a Actividad',
        notOwnerTitle: 'No puedes gestionar esta publicación', // no está en el prototipo
        notOwnerText: (owner: string) => `La gestiona ${owner}. Solo quien la publicó ve sus postulantes y sus cupos.`,
        notOwnerSwitchText: (owner: string) => `La gestiona ${owner}. Cambia a esa cuenta para ver sus postulantes y sus cupos.`,
        switchTo: (owner: string) => `Usar Talently como ${owner}`,
        switched: (owner: string) => `Ahora usas Talently como ${owner}`,
        seePublication: 'Ver publicación',
        goHome: 'Ir a Inicio',
        favorite: 'Favorito',
        noShifts: 'Aún sin turnos suficientes',
        verificationTitle: (name: string) => `Verificación de ${name}`,
        verificationNote: 'Talently nunca muestra el RUT, la fecha de nacimiento ni las fotos de la cédula.',
    },
    manage: {
        title: 'Publicación',
        share: 'Compartir',
        options: 'Opciones',
        optionsTitle: 'Opciones', // no está en el prototipo
        optionsSeePublication: 'Ver publicación',
        optionsSeePublicationSub: 'Así la ven quienes buscan', // no está en el prototipo
        optionsShift: (fecha: string) => `Cupos del ${fecha}`,
        seeShifts: 'Ver cupos',
        seeApplicants: 'Ver postulantes', // no está en el prototipo (empleos y avisos)
        actions: 'Acciones',
        edit: 'Editar',
        pause: 'Pausar',
        resume: 'Reanudar', // no está en el prototipo
        renew: 'Renovar', // no está en el prototipo
        paused: 'Publicación pausada',
        undo: 'Deshacer',
        resumed: 'Reanudaste la publicación', // no está en el prototipo
        renewed: (hasta: string) => `Renovaste la publicación hasta el ${hasta}`, // no está en el prototipo
        renewNote: (vence: string) => `Vence el ${vence}. Si la renuevas, sigue publicada 30 días desde hoy.`, // no está en el prototipo
        pausedBanner: 'Está pausada: no aparece en Explorar ni recibe postulaciones.', // no está en el prototipo
        close: 'Cerrar publicación',
        closeSub: 'Elige el motivo. Deja de recibir postulaciones.',
        closeSheetTitle: 'Cerrar publicación',
        closeLegend: '¿Por qué la cierras?', // no está en el prototipo
        closeError: 'Elige un motivo para cerrarla', // no está en el prototipo
        closeNote: 'Quienes postularon reciben un aviso. No verán el motivo.', // no está en el prototipo
        closeCancel: 'Cancelar',
        closeConfirm: 'Cerrar publicación',
        closed: 'Cerraste la publicación', // no está en el prototipo
        closedBanner: 'Ya no recibe postulaciones. Sus cupos y postulantes siguen aquí.', // no está en el prototipo
        shareText: (titulo: string, resumen: string) => `${titulo} · ${resumen}`,
        linkCopied: 'Copiamos el enlace de la publicación', // no está en el prototipo
        shareError: 'No pudimos compartir. Intenta de nuevo.', // no está en el prototipo
    },
    applicants: {
        title: 'Postulantes',
        count: (n: number, orden: string) => `${n} ${n === 1 ? 'postulante' : 'postulantes'} · ${orden}`,
        filterLabel: 'Estado',
        claim: 'Pretensión:',
        claimNegotiable: 'Pretensión: A convenir',
        advance: 'Avanzar',
        reject: 'No seleccionar',
        seeConversation: 'Ver conversación',
        seeProcess: 'Ver proceso', // no está en el prototipo
        advanced: (name: string) => `Avanzaste a ${name}`, // no está en el prototipo
        rejected: (name: string) => `Marcaste a ${name} como no seleccionada`, // no está en el prototipo
        rejectedNeutral: (name: string) => `No seleccionaste a ${name}`, // no está en el prototipo
        undo: 'Deshacer',
        rejectTitle: (name: string) => `No seleccionar a ${name}`, // no está en el prototipo
        rejectLegend: 'Mensaje que le enviaremos', // no está en el prototipo
        rejectError: 'Elige un mensaje', // no está en el prototipo
        rejectNote: 'Se lo decimos con respeto y sin más detalles.', // no está en el prototipo
        rejectCancel: 'Cancelar',
        rejectConfirm: 'No seleccionar',
        emptyTitle: 'Nadie en este estado', // no está en el prototipo
        emptyText: 'Prueba con otro filtro: aquí ves a quienes postularon según en qué etapa están.', // no está en el prototipo
        emptyAction: 'Ver todos',
        noneTitle: 'Aún no hay postulantes', // no está en el prototipo
        noneText: 'Te avisaremos cuando alguien postule.', // no está en el prototipo
        closedBanner: 'Esta publicación está cerrada: ya no cambias el estado de quienes postularon.', // no está en el prototipo
    },
    shift: {
        title: 'Cupos del turno',
        more: 'Más opciones',
        tabsLabel: 'Personas del turno',
        tabConfirmed: 'Confirmados',
        tabApplied: 'Postulados',
        tabWaitlist: 'Lista de espera',
        confirm: 'Confirmar',
        confirmFavorites: (n: number) => `Confirmar a mis favoritos (${n})`,
        confirmedOne: (name: string) => `Confirmaste a ${name}`,
        confirmedMany: (names: string) => `Confirmaste a ${names}`,
        arrived: (n: number) => (n === 1 ? 'Postuló 1 persona al turno' : `Postularon ${n} personas al turno`), // no está en el prototipo
        fullBanner: 'Completaste los cupos. Si alguien cancela, podrás confirmar a otra persona.', // no está en el prototipo
        closedBanner: 'La publicación está cerrada: ya no se confirman personas.', // no está en el prototipo
        pastBanner: (n: number, fecha: string) =>
            n === 1 ? `Evalúa a 1 persona del turno del ${fecha}` : `Evalúa a ${n} personas del turno del ${fecha}`,
        pastDone: (fecha: string) => `Evaluaste a todas las personas del turno del ${fecha}`, // no está en el prototipo
        attended: 'Asistió',
        noShow: 'No asistió',
        evaluate: 'Evaluar',
        evaluated: 'Evaluación enviada', // no está en el prototipo
        evaluatedWith: (stars: number) => `Evaluación enviada · ${stars} de 5`, // no está en el prototipo
        evaluateTitle: (name: string) => `Evaluar a ${name}`, // no está en el prototipo
        evaluateQuestion: '¿Cómo le fue en el turno?', // no está en el prototipo
        evaluateError: 'Elige de 1 a 5 estrellas',
        evaluateNote: 'Tu evaluación se publicará cuando ambos evalúen o en 7 días',
        evaluateSend: 'Enviar evaluación',
        evaluatedToast: (name: string) => `Evaluaste a ${name}`, // no está en el prototipo
        noConfirmedTitle: 'Aún no confirmas a nadie', // no está en el prototipo
        noConfirmedText: 'Confirma con un toque a quienes postularon al turno.', // no está en el prototipo
        noConfirmedAction: 'Ver postulados', // no está en el prototipo
        noAppliedTitle: 'Aún no hay postulados',
        noAppliedText: 'Avisamos a quienes buscan turnos cerca. También puedes invitar a tus favoritos.', // no está en el prototipo (variante sin oficio)
        noAppliedPaused: 'Mientras esté pausada, nadie nuevo puede postular. La reanudas desde Gestionar publicación.', // no está en el prototipo
        inviteFavorites: 'Invitar a mis favoritos',
        noMoreTitle: 'Nadie más postuló', // no está en el prototipo
        noMoreText: 'Esta publicación ya no recibe postulaciones.', // no está en el prototipo
        noWaitlistTitle: 'Nadie en lista de espera', // no está en el prototipo
        noWaitlistText: 'Cuando completes los cupos, quienes postulen después quedan aquí.', // no está en el prototipo
        otherDays: 'Otros días del turno', // no está en el prototipo
        manage: 'Gestionar publicación',
        notFoundTitle: 'No encontramos este turno', // no está en el prototipo
        notFoundText: 'Puede que la fecha ya no exista. Revisa los cupos desde la publicación.', // no está en el prototipo
    },
} as const;
