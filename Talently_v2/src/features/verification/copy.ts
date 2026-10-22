// Textos de Verificación (VER-01, VER-02 y AUTH-08 desde VER-01), en español
// de Chile. Los de VER-02 son los del prototipo F1 (VER-02*.dc.html); los de
// los niveles, los del Timeline «Niveles de verificación» del sistema de
// diseño. Lo que no está en el prototipo lleva el comentario.

export const COPY = {
    pronto: 'Disponible pronto',

    // VER-01 · Verificación y credenciales (sin captura en F1: sale de la spec §5.4, del
    // super-prompt M8 y del Timeline --levels del sistema de diseño).
    ver01: {
        // El nombre completo de la pantalla es «Verificación y credenciales» (spec §5.4); en el AppBar
        // standard (H3 entre columnas de 92) se cortaría en «Verificación y cred…»: va el corto.
        titulo: 'Verificación',
        niveles: 'Niveles de verificación',
        credenciales: 'Credenciales',
        organizacion: 'Tu organización',
        // La misma nota que la hoja «Verificación de …» del Perfil.
        nota: 'Nunca mostramos tu RUT, tu fecha de nacimiento ni las fotos de tu cédula.',
        // no está en el prototipo: qué revisamos de una organización (spec §10.1).
        notaOrganizacion: 'Revisamos el RUT, el giro y el inicio de actividades en el SII, y el dominio del correo.',
        // Niveles (Timeline --levels del sistema de diseño).
        cuenta: 'Cuenta básica',
        cuentaPermite: 'Postular a empleos y conversar.',
        telefono: 'Teléfono verificado',
        telefonoPermite: 'Tomar turnos y publicar.',
        telefonoFalta: 'Verifica tu teléfono para tomar turnos y publicar.', // no está en el prototipo
        identidad: 'Identidad verificada',
        // no está en el prototipo: lo que habilita el nivel 2 (spec §10.1, matriz de exigencias).
        identidadPermite: 'Publicar avisos del hogar, ofrecer servicios o clases y recibir a alguien en tu casa.',
        identidadFaltaHogar: 'Verifica tu identidad para recibir a alguien en tu casa.',
        // no está en el prototipo: para quien solo trabaja (spec §2.2: «Nivel 2 recomendado: da insignia»).
        identidadFaltaTrabajo: 'Verifica tu identidad para mostrar «Identidad verificada» y postular donde la piden.',
        organizacionNivel: 'Organización verificada',
        organizacionPermite: 'Publicar empleos y turnos.', // no está en el prototipo
        pendiente: 'Pendiente',
        enRevision: 'En revisión · te avisamos en menos de 24 h',
        desde: (fecha: string) => (fecha === 'hoy' ? 'Desde hoy' : `Desde el ${fecha}`),
        verificado: (fecha: string) => (fecha === 'hoy' ? 'Verificado hoy' : `Verificado el ${fecha}`),
        verificada: (fecha: string) => (fecha === 'hoy' ? 'Verificada hoy' : `Verificada el ${fecha}`),
        verificarTelefono: 'Verificar teléfono',
        verificarIdentidad: 'Verificar identidad',
        subirCredencial: 'Subir credencial',
        snackTelefono: 'Verificamos tu teléfono', // no está en el prototipo
    },

    // VER-02 · Verificar identidad (prototipo F1: VER-02, -frente, -dorso, -selfie).
    ver02: {
        appBar: 'Verificar identidad',
        titulo: 'Verifica tu identidad',
        subHogar: 'Para recibir a alguien en tu casa. Toma menos de lo que crees.',
        // no está en el prototipo: la misma frase para quien no tiene hogar.
        subTrabajo: 'Para mostrar «Identidad verificada» en tu perfil. Toma menos de lo que crees.',
        ejemplos: [
            { variant: 'front', label: 'Cédula por delante' },
            { variant: 'back', label: 'Cédula por detrás' },
            { variant: 'face', label: 'Una selfie' },
        ],
        hechoCedula: 'Ten a mano tu cédula de identidad vigente.',
        hechoLuz: 'Busca un lugar con buena luz.',
        hechoPrivacidad: 'Nadie ve tu RUT ni tus fotos: los demás solo ven «Identidad verificada».',
        gratis: 'Verificarte es gratis.',
        comenzar: 'Comenzar',
        ayuda: 'Pedir ayuda por WhatsApp',
        opciones: 'Opciones',
        salir: 'Salir sin enviar', // no está en el prototipo
        salirSub: 'Las fotos que tomaste se borran.', // no está en el prototipo
        ayudaSub: 'Te respondemos en horario hábil.', // no está en el prototipo
        tomarFoto: 'Tomar foto',
        tomarSelfie: 'Tomar selfie',
        galeria: 'Elegir de la galería',
        // no está en el prototipo: al volver a un paso que ya tiene su foto.
        continuar: 'Continuar',
        otraFoto: 'Tomar otra foto',
        otraSelfie: 'Tomar otra selfie',
        fotoLista: 'Foto lista',
        noEsFoto: 'Ese archivo no es una foto. Elige otro.',
        asi: 'Así',
        pasos: {
            frente: {
                titulo: 'Tu cédula por delante',
                sub: 'Apóyala en una mesa, con buena luz y sin reflejos.',
                hint: 'Centra la cédula dentro del marco',
                ejemplo: 'Entera, derecha y nítida: que se lean tu nombre y tu RUT.',
                ejemploLabel: 'Ejemplo: cédula por delante, con la foto a la izquierda y los datos a la derecha',
            },
            dorso: {
                titulo: 'Ahora por detrás',
                sub: 'Da vuelta la cédula. Que se vean el código y las tres líneas de abajo.',
                hint: 'Centra la cédula dentro del marco',
                ejemplo: 'Con las tres líneas de abajo completas.',
                ejemploLabel: 'Ejemplo: cédula por detrás, con el código QR y las tres líneas de abajo',
            },
            selfie: {
                titulo: 'Una selfie',
                sub: 'Mira de frente, sin lentes oscuros ni gorro. La comparamos con la foto de tu cédula.',
                hint: 'Pon tu cara dentro del óvalo',
                ejemplo: 'De frente, con la cara entera y buena luz.',
                ejemploLabel: 'Ejemplo: selfie de frente, con la cara dentro del óvalo',
            },
        },
        faltaFoto: {
            frente: 'Falta la foto de tu cédula por delante',
            dorso: 'Falta la foto de tu cédula por detrás',
            selfie: 'Falta tu selfie',
        },
        // Consentimiento en contexto (spec §5.3 regla 8 y Ley 21.719): al enviar la biometría.
        // no está en el prototipo: el texto sigue al de VER-03 del super-prompt M8.
        consentimiento: 'Acepto que Talently use estas fotos solo para verificar mi identidad.',
        consentimientoDetalle: 'Las borramos 30 días después de revisarlas.',
        consentimientoError: 'Para enviar, acepta que usemos tus fotos para verificarte.',
        enviar: 'Enviar',
        enviando: 'Enviando tus fotos…',
        // Estado final (spec §10.1: «En revisión, te avisamos en menos de 24 h»).
        revisionTitulo: 'En revisión',
        revisionTexto: 'Recibimos tu cédula y tu selfie. Te avisamos en menos de 24 h.',
        verificadaTitulo: 'Tu identidad ya está verificada', // no está en el prototipo
        verificadaTexto: 'Los demás ven «Identidad verificada» en tu perfil. Nadie ve tu RUT ni tus fotos.', // no está en el prototipo
        verMiVerificacion: 'Ver mi verificación',
        volverAlAviso: 'Continuar', // no está en el prototipo
    },

    // AUTH-08 · Verificar teléfono, abierto desde VER-01 (mismos textos que el prototipo).
    telefono: {
        titulo: 'Verifica tu teléfono',
        // no está en el prototipo: la frase de AUTH-08 cuando se abre desde VER-01.
        intro: 'Para tomar turnos y publicar necesitas un celular verificado. Lo pedimos una sola vez, y en Configuración decides quién lo ve.',
        label: 'Número de celular',
        prefijo: '+56 9',
        ayuda: '8 dígitos, sin el +56 9',
        invalido: 'Ingresa los 8 dígitos de tu celular', // no está en el prototipo
        canal: '¿Cómo te enviamos el código?',
        sms: 'Por SMS',
        whatsapp: 'Por WhatsApp',
        enviar: 'Enviar código',
        enviando: 'Enviando el código…',
        codigoTitulo: 'Ingresa el código',
        enviadoA: (canal: 'sms' | 'whatsapp', ultimos4: string) =>
            `Te lo enviamos por ${canal === 'sms' ? 'SMS' : 'WhatsApp'} al +56 9 •••• ${ultimos4}.`,
        reenviarEn: (tiempo: string) => `Reenviar código (en ${tiempo})`,
        reenviar: 'Reenviar código',
        cambiarNumero: 'Cambiar número',
    },
} as const;
