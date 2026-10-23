// Textos de Bienvenida, registro y onboarding, tal como en el prototipo F1
// (docs/rediseno/diseno/prototipo-f1/project/AUTH-0*.dc.html y ONB-*.dc.html).
// Lo que el prototipo no muestra y hacía falta (errores, la hoja de
// «Ya tengo cuenta», el menú ⋯) sigue 04-perfiles-y-onboarding.md y lleva
// el comentario «no está en el prototipo».
import { DEMO_COPY } from '../demo/copy';

export const COPY = {
    bienvenida: {
        titulo: 'Trabajo, turnos, servicios y clases cerca de ti',
        sub: 'Con gente verificada en tu comuna',
        marca: 'Talently',
        crear: 'Crear cuenta',
        tengo: 'Ya tengo cuenta',
    },

    // no está en el prototipo: AUTH-04 no existe en la demostración; esta hoja lo dice.
    ingresar: {
        titulo: 'Entrar a la demostración',
        texto: 'En esta demostración no hay cuentas reales. Elige con quién quieres entrar.',
        retomar: 'Retomar tu registro',
        retomarSub: 'Sigue donde lo dejaste',
        personas: 'Personas de la demostración',
        roles: {
            matias: 'Toma turnos',
            jorge: 'Busca empleo y turnos',
            pedro: 'Busca empleo',
            carolina: 'Contrata para su hogar',
            rosa: 'Administra Banquetería Rosa SpA',
        },
    },

    registro: {
        titulo: 'Crea tu cuenta',
        sub: 'Para trabajar, contratar o aprender.',
        aceptoA: 'Acepto los ',
        terminos: 'Términos',
        aceptoB: ' y la ',
        privacidad: 'Política de privacidad',
        google: 'Continuar con Google',
        o: 'o',
        nombre: 'Nombre y apellido',
        correo: 'Correo',
        crear: 'Crear cuenta',
        creando: 'Creando tu cuenta…',
        errCorreo: 'Ingresa un correo válido, como nombre@correo.cl',
        // no está en el prototipo
        errNombre: 'Escribe tu nombre y apellido',
    },

    verificar: {
        titulo: 'Revisa tu correo',
        subA: 'Te enviamos un código de 6 dígitos a ',
        subB: '.',
        // no está en el prototipo: se llegó sin pasar por «Crear cuenta».
        subSinCorreo: 'Te enviamos un código de 6 dígitos a tu correo.',
        ayuda: 'Escribe o pega los 6 dígitos. Si no te llega, revisa la carpeta de spam.',
        reenviarEn: (t: string) => `Reenviar código (en ${t})`,
        reenviar: 'Reenviar código',
    },

    menu: {
        boton: 'Opciones del registro',
        titulo: 'Opciones del registro',
        guardarSalir: 'Guardar y salir',
        ayuda: 'Ayuda',
        cerrarSesion: 'Cerrar sesión',
        eliminar: 'Eliminar cuenta',
        // no está en el prototipo: CFG-06 no existe en la demostración. El mismo texto que «Eliminar
        // cuenta» de CFG-01 (demo/copy.ts).
        eliminarDemo: DEMO_COPY.sinCuentaQueEliminar,
        cerrarTitulo: '¿Cerrar sesión?',
        cerrarTexto: 'Tu avance queda guardado.',
    },

    salir: {
        titulo: '¿Salir del registro?',
        texto: 'Guardaremos lo que llevas.',
        seguir: 'Seguir',
        guardarSalir: 'Guardar y salir',
    },

    intencion: {
        titulo: '¿Qué quieres hacer en Talently?',
        sub: 'Elige todas las que quieras.',
        trabajar: 'Quiero trabajar',
        contratar: 'Quiero contratar o aprender',
        pie: 'Puedes agregar más perfiles después.',
        opciones: {
            empleo: {
                titulo: 'Buscar empleo',
                ejemplo: 'Estable o part time: profesor, operario, técnico, vendedor, asesor/a del hogar…',
            },
            turnos: { titulo: 'Tomar turnos o trabajos por día', ejemplo: 'Garzón, banquetero, guardia de eventos, bodega…' },
            servicios: { titulo: 'Ofrecer mis servicios', ejemplo: 'Gasfíter, electricista, mecánico…', badge: 'Reservas desde junio' },
            clases: { titulo: 'Dar clases particulares', ejemplo: 'Matemática, inglés, PAES, música…', badge: 'Reservas desde marzo' },
            empresa: { titulo: 'Contratar para mi empresa o negocio', ejemplo: 'Empleos y turnos' },
            hogar: { titulo: 'Contratar para mi hogar', ejemplo: 'Asesor/a del hogar, cuidador/a infantil o de adulto mayor' },
        },
    },

    // ONB-02 (04-perfiles-y-onboarding.md §4.2): no está en el prototipo F1.
    empezar: {
        titulo: '¿Con cuál empiezas?',
        // 04 §4.2 dice «Los demás quedan guardados en Inicio para cuando quieras», pero Inicio aún no
        // muestra los bloques pendientes (pedido en «requests»): mientras, el texto promete solo lo que hay.
        texto: 'Completa uno ahora. Los demás los puedes agregar después.',
        cta: 'Empezar con este',
        trabajoAmbos: 'Buscar empleo y tomar turnos',
    },

    datos: {
        titulo: 'Tus datos',
        sub: 'Lo básico para armar tu perfil.',
        nombre: 'Nombre',
        apellido: 'Apellido',
        comuna: 'Comuna',
        comunaPlaceholder: 'Elige tu comuna',
        comunaBuscar: 'Buscar comuna',
        comunaGrupo: 'Región Metropolitana · 52 comunas',
        comunaVacia: 'Revisa cómo lo escribiste o busca solo el nombre de la comuna.',
        foto: 'Foto',
        // Ayuda de la foto según el bloque (prototipo ONB-03: Jorge, Rosa, Carolina, Camila y Luis).
        fotoAyuda: {
            trabajo: 'Una foto donde se vea tu cara ayuda a que te elijan.',
            organizacion: 'Así te reconocen las personas que contrates.',
            hogar: 'Así te reconocen las personas que contrates.',
            clases: 'La necesitarás para publicar.',
            servicios: 'La necesitarás para publicar.',
        },
        nacimiento: 'Fecha de nacimiento',
        nacimientoPlaceholder: 'DD/MM/AAAA',
        nacimientoAyuda: 'Es privada, no se muestra.',
        errEdad: 'Debes tener 18 años o más para ofrecer trabajo, servicios o clases',
        telefono: 'Teléfono',
        telefonoPrefijo: '+56 9',
        telefonoPlaceholder: '1234 5678',
        telefonoAyuda: 'Te lo pediremos verificado cuando tomes tu primer turno o publiques.',
        // no está en el prototipo
        errNombre: 'Escribe tu nombre',
        errApellido: 'Escribe tu apellido',
        errComuna: 'Elige tu comuna',
        errFecha: 'Escribe tu fecha de nacimiento, como 14/05/1985',
        errTelefono: 'Escribe los 8 dígitos de tu celular',
    },

    trabajo: {
        oficios: {
            titulo: '¿En qué quieres trabajar?',
            sub: 'Elige hasta 3. El principal se ve primero.',
            tus: 'Tus oficios',
            principal: 'Principal',
            marcar: 'Marcar como principal',
            quitar: (oficio: string) => `Quitar ${oficio}`,
            experiencia: 'Años de experiencia',
            experienciaPlaceholder: 'Elige tus años de experiencia',
            agregar: 'Agregar otro oficio',
            // no está en el prototipo
            agregarPrimero: 'Agregar oficio',
            hoja: 'Oficio',
            buscar: 'Prueba con: guardia, garzón, nana, grúa horquilla',
            vacia: 'Prueba con otra palabra o con el nombre del oficio.',
            errOficios: 'Elige al menos un oficio',
            errExperiencia: 'Elige tus años de experiencia',
        },
        tipo: {
            titulo: '¿Qué tipo de trabajo buscas?',
            subAmbos: 'Con esto te mostramos empleos y turnos que te sirven.',
            subEmpleo: 'Con esto te mostramos empleos que te sirven.',
            subTurnos: 'Con esto te mostramos turnos que te sirven.',
            jornada: 'Jornada',
            desde: 'Disponible desde',
            radio: '¿Hasta dónde te mueves?',
            desdeComuna: (comuna: string) => `Desde ${comuna}.`,
            movil: 'Tengo movilización propia',
            movilDesc: 'Auto o moto. Algunos turnos terminan tarde.',
            franjas: '¿Cuándo puedes tomar turnos?',
            // no está en el prototipo
            errJornada: 'Elige al menos una jornada',
            errDesde: 'Elige desde cuándo puedes empezar',
            errFranjas: 'Elige al menos una franja',
        },
        pago: {
            titulo: '¿Cuánto esperas ganar?',
            sub: 'Opcional. Puedes cambiarlo después.',
            sueldo: 'Sueldo líquido para empleos',
            tarifa: 'Tarifa mínima para turnos',
            ayuda: 'Lo verán solo las organizaciones y hogares con una publicación activa, nunca el público. Si eliges Prefiero no decir, verán «A convenir».',
            noDecir: 'Prefiero no decir',
            vestimenta: 'Tengo vestimenta propia',
            unidad: 'Unidad',
            // El buscador de la hoja, como en MoneyField de src/ui.
            buscarUnidad: 'Buscar unidad',
        },
        requisitos: {
            titulo: 'Requisitos de tu oficio',
            subSeguridad: 'Lo que piden las empresas de seguridad antes de confirmarte.',
            para: (oficio: string) => `Para ${oficio.charAt(0).toLowerCase()}${oficio.slice(1)}`,
            sistema: 'Sistema de turno',
            diaNoche: 'Turno de día o de noche',
            credencial: 'Credencial',
            credencialNombre: 'Credencial de guardia SPD (ex OS-10)',
            formatos: 'Foto o PDF, hasta 10 MB',
            sinCredencial: 'Sin credencial SPD vigente no podrás ser confirmado en turnos de guardia.',
            subirAhora: 'Subir ahora',
            despues: 'Después',
            // 04-perfiles-y-onboarding.md §4.3, ONB-T4: «Lo que se ve debajo de “Después”».
            despuesNota: 'Puedes subirla cuando quieras desde Mi perfil. Te recordaremos.',
            enRevisionNota: 'Te avisamos cuando esté verificada. Mientras, puedes seguir.',
            // no está en el prototipo
            errSistema: 'Elige un sistema de turno',
            errDiaNoche: 'Elige de día, de noche o ambos',
            errPeso: (mb: number) => `Pesa ${mb} MB. Elige uno de hasta 10 MB.`,
        },
        experiencia: {
            titulo: 'Experiencia y CV',
            sub: 'Opcional. Ayuda a que te elijan.',
            ultimo: 'Tu último trabajo',
            empleador: 'Empleador',
            empleadorPlaceholder: 'Empresa, condominio o persona',
            cargo: 'Cargo',
            desde: 'Desde',
            hasta: 'Hasta',
            mesPlaceholder: 'MM/AAAA',
            actual: 'Trabajo aquí actualmente',
            pie: 'Puedes agregar más trabajos desde tu perfil.',
            terminar: 'Terminar',
            // no está en el prototipo
            errMes: 'Usa el formato MM/AAAA, como 03/2021',
        },
    },

    listo: {
        titulo: (nombre: string) => (nombre ? `Listo, ${nombre}` : 'Listo'),
        sub: 'Tu perfil de trabajo ya está creado. Esto es lo que le falta.',
        // no está en el prototipo: sin nada por completar.
        subCompleto: 'Tu perfil de trabajo ya está creado.',
        perfil: 'Perfil de trabajo',
        porCompletar: (n: number) => `${n} por completar`,
        faltaCredencial: 'Te falta la credencial SPD',
        faltaCredencialTexto: 'Sin ella no podrás ser confirmado en turnos de guardia.',
        subir: 'Subir',
        faltaFoto: 'Te falta tu foto',
        faltaFotoTexto: 'Una foto donde se vea tu cara ayuda a que te elijan.',
        agregar: 'Agregar',
        yaEsta: 'Ya está en tu perfil',
        verEmpleos: 'Ver empleos cerca',
        // spec §6.3, ONB-99: la acción sugerida de quien solo busca turnos es «Ver turnos de este fin de
        // semana», pero la demostración no tiene turnos ese fin de semana (Explorar con ese filtro queda
        // vacío; pedido en «requests»). Mientras, el texto promete solo lo que abre: los turnos cerca.
        verTurnos: 'Ver turnos cerca',
        irInicio: 'Ir a Inicio',
        fotoTitulo: 'Tu foto',
    },
} as const;
