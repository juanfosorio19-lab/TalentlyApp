// Textos del feature Perfil y configuración (PRF-01, PRF-02, PRF-12, CFG-01).
// Salen tal cual del prototipo F1 (docs/rediseno/diseno/prototipo-f1); lo que
// no está en él lleva el comentario «no está en el prototipo».

/** Versión de la app que se ve al pie de Configuración (CFG-01: «Talently 3.0.0»). */
export const APP_VERSION = '3.0.0';

export const COPY = {
    perfil: {
        titulo: 'Perfil',
        asiTeVen: 'Así te ven',
        misPerfiles: 'Mis perfiles',
        verComoMeVen: 'Ver cómo me ven',
        configuracion: 'Configuración',
    },
    impulsa: {
        titulo: 'Impulsa tu perfil',
        intro: 'Para que te encuentren antes cuando buscan a alguien como tú.',
        hecho1: 'Más organizaciones y hogares de tu oficio y comuna verán tu perfil primero',
        hecho2: 'Durante 7 o 30 días, con la etiqueta',
        hecho3: 'No cambia tu lugar entre los postulantes de una oferta',
        elige: 'Elige por cuánto tiempo',
        plan7: '7 días',
        plan30: '30 días',
        gratis: 'Postular, tomar turnos, verificarte y chatear siempre es gratis.',
        avisarme: 'Avisarme cuando esté disponible',
        avisado: 'Te avisaremos',
        snackAvisado: 'Te avisaremos cuando puedas impulsar tu perfil',
        // no está en el prototipo: tocar un plan «Pronto».
        snackPlan: 'Impulsar tu perfil estará disponible pronto',
    },
    config: {
        titulo: 'Configuración',
        cuenta: 'Cuenta',
        notificaciones: 'Notificaciones',
        privacidad: 'Privacidad y mis datos',
        privacidadSub: 'Quién ve tu teléfono, consentimientos y tus datos',
        apariencia: 'Apariencia',
        ayuda: 'Ayuda',
        ayudaSub: 'Preguntas frecuentes y soporte',
        legal: 'Términos y Privacidad',
        legalSub: 'Actualizados el 1 dic 2026',
        cerrarSesion: 'Cerrar sesión',
        eliminarCuenta: 'Eliminar cuenta',
        eliminarCuentaSub: 'Borra tu cuenta y todos tus perfiles',
        dialogTitulo: '¿Cerrar sesión?',
        dialogTexto:
            'Para volver a entrar necesitarás tu correo y tu contraseña. Tus perfiles y conversaciones quedan guardados.',
        cancelar: 'Cancelar',
        snackSesionDemo: 'Sesión de demostración: no hay cuenta que cerrar',
        // no está en el prototipo: CFG-06 no existe en la demostración.
        snackEliminarDemo: 'Sesión de demostración: no hay cuenta que eliminar',
    },
    // Hoja de Apariencia (spec §5.2: Sistema · Claro · Oscuro). no está en el prototipo.
    tema: {
        titulo: 'Apariencia',
        legend: 'Tema',
        sistema: 'Sistema',
        claro: 'Claro',
        oscuro: 'Oscuro',
        sub: (tema: string) => `Tema: ${tema}`,
    },
    // SHT-ACTOR (prototipo F1).
    actor: {
        titulo: 'Usar Talently como',
        persona: 'Tú, con todos tus perfiles',
        organizacion: (comuna: string) => `Organización · ${comuna}`,
        crearOrganizacion: 'Crear organización',
        notaHogar: 'Tu hogar no aparece aquí: su actividad se ve dentro de tu perfil.',
        cambiaste: (nombre: string) => `Cambiaste a ${nombre}`,
    },
    // Hoja «Verificación de …» (catálogo de VerificationBadge).
    verificacion: {
        titulo: (nombre: string) => `Verificación de ${nombre}`,
        nota: 'Nunca mostramos tu RUT, tu fecha de nacimiento ni las fotos de tu cédula.',
    },
    // Hoja de edición de una sección (PRF-03). no está en el prototipo.
    editar: {
        titulo: (seccion: string) => `Editar ${seccion.toLocaleLowerCase('es-CL')}`,
        cancelar: 'Cancelar',
        guardar: 'Guardar',
        guardado: 'Guardamos los cambios',
    },
    // Hoja Subir CV. no está en el prototipo (la acción «Subir CV en PDF» sí).
    cv: {
        titulo: 'Subir CV',
        documento: 'Tu CV',
        formatos: 'PDF, hasta 10 MB',
        nota: 'Lo verán solo las organizaciones a las que postules.',
        guardado: 'Guardamos tu CV',
        editar: 'Cambiar CV',
    },
    /** Funciones que aún no tienen pantalla en esta demostración. */
    pronto: 'Disponible pronto',
} as const;

/**
 * Snackbar al guardar cada sección («Guardamos tu disponibilidad», PRF-01 del
 * prototipo). El resto no está en el prototipo; sin entrada, `COPY.editar.guardado`.
 */
export const SAVED_BY_SECTION: Record<string, string> = {
    Disponibilidad: 'Guardamos tu disponibilidad',
    'Sobre mí': 'Guardamos lo que cuentas de ti',
    'Oficios y experiencia': 'Guardamos tus oficios y experiencia',
    Pretensión: 'Guardamos tu pretensión',
    Idiomas: 'Guardamos tus idiomas',
    'Tu hogar': 'Guardamos los datos de tu hogar',
    'Qué necesitas': 'Guardamos lo que necesitas',
    'Sobre la organización': 'Guardamos la descripción de la organización',
    'Datos de la organización': 'Guardamos los datos de la organización',
};
