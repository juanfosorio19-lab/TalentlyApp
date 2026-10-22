// Textos de Procesos y reseñas (PRC-01, REV-01), en español de Chile y tal
// como los dice el prototipo F1. Lo que el prototipo no muestra sigue la voz
// del sistema de diseño (CTAs en infinitivo, sin emojis, sin inglés).

export const copy = {
    soon: 'Disponible pronto',
    process: {
        /** AppBar cuando no hay proceso que mostrar. */
        fallbackTitle: 'Proceso',
        timeline: 'Proceso',
        chat: 'Ver conversación',
        publication: 'Ver publicación',
        ownPublication: 'Ver aviso',
        options: 'Opciones',
        optionsTitle: 'Opciones',
        profile: 'Ver perfil',
        applicants: 'Ver postulantes',
        withdraw: 'Retirar postulación',
        withdrawTitle: '¿Retirar tu postulación?',
        withdrawBody: (org: string, interview?: string) =>
            interview
                ? `Le avisaremos a ${org} y se cancela tu entrevista del ${interview}.`
                : `Le avisaremos a ${org}. Ya no seguirás en este proceso.`,
        keep: 'Mantener postulación',
        withdrawn: 'Retiraste tu postulación',
        checklistSteps: 'Pasos',
        checklistLink: 'Ir al sitio de la Dirección del Trabajo',
        calendarDownloaded: 'Descargamos la entrevista: ábrela para agregarla a tu calendario',
        calendarError: 'No pudimos abrir el calendario. Intenta de nuevo.',
        dtError: 'No pudimos abrir el sitio. Intenta de nuevo.',
        notAppliedTitle: 'Todavía no postulas a este empleo',
        notAppliedText: 'Cuando postules, aquí verás cada etapa del proceso.',
        notFoundTitle: 'No encontramos esta postulación',
        notFoundText: 'Puede que el enlace esté incompleto o que sea de otra cuenta.',
        seeApplications: 'Ver mis postulaciones',
        goHome: 'Ir a Inicio',
    },
    review: {
        title: 'Evalúa tu turno',
        pending: (fecha: string) => `Antes de postular a otro turno, evalúa el del ${fecha}.`,
        ratingLabel: 'Tu calificación',
        ratingError: 'Elige de 1 a 5 estrellas',
        tagsLabel: '¿Qué destacas?',
        commentLabel: 'Comentario',
        commentPlaceholder: 'Cuenta cómo fue el turno',
        blind: 'Tu evaluación se publicará cuando ambos evalúen o en 7 días',
        send: 'Enviar evaluación',
        sending: 'Enviando evaluación…',
        sentTitle: 'Enviaste tu evaluación',
        sentText: 'Se publicará cuando ambos evalúen o en 7 días. Ya puedes postular a otros turnos.',
        exploreShifts: 'Explorar turnos',
        back: 'Volver',
        notFoundTitle: 'No encontramos este turno',
        notFoundText: 'Puede que el enlace esté incompleto o que el turno ya no exista.',
        notWorkedTitle: 'Este turno no se puede evaluar',
        notWorkedText: 'Solo se evalúan los turnos que trabajaste, cuando terminan.',
        ownerTitle: 'Evalúa desde los cupos del turno',
        ownerText: 'Para evaluar a quienes trabajaron, entra a los cupos del turno y elige a cada persona.',
        ownerAction: 'Ver cupos',
    },
} as const;

/** Sitio de la Dirección del Trabajo (registro del contrato de trabajadora de casa particular). */
export const DT_URL = 'https://www.dt.gob.cl/';
