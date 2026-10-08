// Textos de «Inicio y notificaciones» (INI-01, INI-02, SHT-ACTOR, PUBL-01, NOT-01),
// tal cual el prototipo F1 de Claude Design. Los que dependen de los datos
// (saludo, bloques, notificaciones) vienen de src/features/demo.

export const copy = {
    soon: 'Disponible pronto',

    bell: (unread: number) => (unread > 0 ? `Notificaciones, ${unread} sin leer` : 'Notificaciones'),

    home: {
        verAgenda: 'Ver agenda',
        publicar: 'Publicar',
    },

    org: {
        atencion: 'Requiere tu atención',
    },

    actor: {
        titulo: 'Usar Talently como',
        persona: 'Tú, con todos tus perfiles',
        organizacion: (comuna: string) => `Organización · ${comuna}`,
        conNovedades: 'Tiene novedades sin leer',
        crear: 'Crear organización',
        nota: 'Tu hogar no aparece aquí: su actividad se ve dentro de tu perfil.',
        cambiaste: (nombre: string) => `Cambiaste a ${nombre}`,
    },

    publicar: {
        titulo: '¿Qué quieres publicar?',
        publicasComo: (nombre: string) => `Publicas como ${nombre}.`,
        leyenda: 'Tipo de publicación',
        continuar: 'Continuar',
    },

    verificacion: {
        titulo: (nombre: string) => `Verificación de ${nombre}`,
        nota: 'Talently nunca muestra el RUT, la fecha de nacimiento ni las fotos de la cédula.',
    },

    notificaciones: {
        titulo: 'Notificaciones',
        marcarTodas: 'Marcar todas como leídas',
        marcadas: 'Marcaste todas como leídas',
        sinLeer: 'Sin leer',
        vacia: {
            titulo: 'No tienes notificaciones',
            texto: 'Aquí te avisaremos cuando te confirmen un turno, alguien postule a lo que publicaste o te escriban.',
            accion: 'Elegir qué notificaciones recibo',
        },
    },
} as const;
