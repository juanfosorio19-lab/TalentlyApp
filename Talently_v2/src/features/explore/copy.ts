// Textos de Explorar (EXP-01, EXP-02, EXP-05, EXP-06 y EXP-07), en español de
// Chile. Los de las capturas F1 van idénticos al prototipo; los demás siguen
// «Voz y textos» del sistema de diseño (infinitivo en los CTA, tuteo, nunca la edad).

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
const nombrePila = (nombre: string) => nombre.split(' ')[0] ?? nombre;

/** ««Garzón», «Bodega» o «Maipú»». */
function enumerar(palabras: readonly string[]): string {
    const q = palabras.map((p) => `«${p}»`);
    if (q.length <= 1) return q.join('');
    return `${q.slice(0, -1).join(', ')} o ${q[q.length - 1]}`;
}

export const copy = {
    titulo: 'Explorar',

    appBar: {
        buscar: 'Buscar',
        filtros: (n: number) => (n > 0 ? `Filtros, ${plural(n, 'activo', 'activos')}` : 'Filtros'),
        notificaciones: (n: number) => (n > 0 ? `Notificaciones, ${n} sin leer` : 'Notificaciones'),
    },

    segmentos: {
        aria: 'Tipo de publicación',
        empleo: 'Empleos',
        turno: 'Turnos',
        personas: 'Personas',
    },

    // EXP-01 · Empleos
    empleos: {
        verLista: 'Ver lista',
        verDeAUna: 'Ver de a una',
        noMeInteresa: (titulo: string) => `No te mostraremos más ${titulo}`,
        postulaste: 'Postulaste',
        teInteresa: 'Te interesa',
        deshacer: 'Deshacer',
        deckVacio: {
            titulo: 'Viste todas las ofertas cerca',
            conFiltros: (n: number) => `Hay ${plural(n, 'oferta más', 'ofertas más')} si cambias los filtros.`,
            sinFiltros: 'Las que marcaste con «Me interesa» siguen en la vista de lista.',
            cambiarFiltros: 'Cambiar filtros',
            verLista: 'Ver lista',
        },
        listaVacia: {
            titulo: 'No te quedan ofertas por ver',
            texto: 'Marcaste todas con «No me interesa». Te avisaremos cuando haya ofertas nuevas cerca.',
            verDescartadas: 'Volver a ver las descartadas',
        },
        sinResultados: {
            titulo: 'No hay ofertas con estos filtros',
            texto: 'Prueba con otra distancia o quita algún filtro.',
            accion: 'Quitar filtros',
        },
    },

    // EXP-02 · Turnos
    turnos: {
        chipsAria: 'Filtrar turnos',
        comuna: 'Comuna',
        todos: 'Todos',
        tomarTurno: 'Tomar turno',
        tomando: 'Tomando el turno…',
        listaEspera: 'Unirme a la lista de espera',
        /** Los mismos avisos que DET-01 al tomar el turno. */
        tomado: 'Postulaste al turno. Te avisaremos cuando te confirmen',
        tomadoEspera: 'Te uniste a la lista de espera. Te avisaremos si se libera un cupo',
        verPostulaciones: 'Ver mis postulaciones',
        sinTurnosEn: {
            titulo: (comuna: string) => `No hay turnos en ${comuna}`,
            texto: 'Por ahora no hay turnos publicados en esa comuna.',
            accion: (comuna: string) => `Ver turnos cerca de ${comuna}`,
        },
        buscarComuna: 'Buscar comuna',
        grupoComunas: 'Región Metropolitana · 52 comunas',
        sinComunaTexto: 'Revisa cómo lo escribiste o busca solo el nombre de la comuna.',
        sinResultados: {
            titulo: 'No hay turnos con estos filtros',
            texto: 'Prueba con otro oficio o cambia los filtros.',
            accion: 'Quitar filtros',
        },
    },

    // EXP-05 · Personas sugeridas
    personas: {
        publicacion: 'Publicación',
        elegirPublicacion: 'Elige una publicación',
        sugeridas: (n: number) => plural(n, 'persona sugerida', 'personas sugeridas'),
        verLista: 'Ver lista',
        verDeAUna: 'Ver de a una',
        invitar: 'Invitar a postular',
        invitaste: (nombre: string) => `Invitaste a ${nombrePila(nombre)} a postular`,
        descartaste: (nombre: string) => `No te sugeriremos más a ${nombrePila(nombre)}`,
        deshacer: 'Deshacer',
        verPostulantes: 'Ver postulantes',
        verPostulados: 'Ver postulados',
        verCupos: 'Ver cupos',
        cambiarPublicacion: 'Cambiar de publicación',
        verPublicacion: 'Ver tu publicación',
        porque: {
            oficio: 'calza con el oficio que buscas',
            trabajo: (fecha: string) => `ya trabajó contigo el ${fecha}`,
            comuna: (comuna: string) => `vive en ${comuna}`,
        },
        cuposCompletos: {
            titulo: 'Este turno ya tiene sus cupos completos',
            texto: (titulo: string, total: number) =>
                `${titulo} tiene sus ${total} cupos confirmados. Elige otra publicación para ver personas sugeridas.`,
        },
        todosPostularon: {
            titulo: 'Las personas sugeridas ya postularon',
            texto: (titulo: string, n: number) =>
                n === 1
                    ? `Revisa a la persona que postuló a ${titulo}.`
                    : `Revisa a las ${n} personas que postularon a ${titulo}.`,
        },
        nadie: {
            titulo: 'Aún no hay personas sugeridas',
            texto: (titulo: string) => `Por ahora nadie más calza con ${titulo}.`,
        },
        revisasteTodas: {
            titulo: 'Revisaste a todas las personas sugeridas',
            texto: (invitadas: number, titulo: string) =>
                invitadas > 0
                    ? `Invitaste a ${plural(invitadas, 'persona', 'personas')} a postular a ${titulo}.`
                    : `Por ahora no hay más personas que calcen con ${titulo}.`,
        },
        sinResultados: {
            titulo: 'Nadie calza con estos filtros',
            texto: 'Prueba con una nota mínima más baja o quita algún filtro.',
            accion: 'Quitar filtros',
        },
        sinPublicaciones: {
            titulo: 'Publica para ver personas sugeridas',
            texto: 'Te sugerimos personas cerca para cada publicación activa. Publica desde Inicio.',
            accion: 'Ir a Inicio',
        },
    },

    // EXP-06 · Filtros
    filtros: {
        titulo: 'Filtros',
        limpiar: 'Limpiar',
        verTurnos: (n: number) => `Ver ${plural(n, 'turno', 'turnos')}`,
        verEmpleos: (n: number) => `Ver ${plural(n, 'empleo', 'empleos')}`,
        verPersonas: (n: number) => `Ver ${plural(n, 'persona', 'personas')}`,
        fecha: 'Fecha',
        distancia: 'Distancia',
        jornada: 'Jornada',
        contrato: 'Contrato',
        nota: 'Nota mínima',
        franja: 'Franja',
        sueldoMin: 'Sueldo líquido mínimo',
        sueldoMinAyuda: 'Solo ofertas que pagan esto o más al mes.',
        tarifaMin: 'Tarifa líquida mínima',
        tarifaMinAyuda: 'Solo turnos que pagan esto o más.',
        unidad: 'Unidad',
        soloVerificadas: 'Solo organizaciones verificadas',
        soloVerificadasDesc: 'Revisamos su RUT y sus documentos.',
        yaTrabajaron: 'Solo quienes ya trabajaron contigo',
        yaTrabajaronDesc: 'Personas que confirmaste en un turno anterior.',
        hasta: (km: number) => `Hasta ${km} km`,
        notaMinima: (nota: string) => `${nota} o más`,
    },

    // Hoja «Verificación de …»
    verificacion: {
        titulo: (nombre: string) => `Verificación de ${nombre}`,
        nota: 'Talently nunca muestra el RUT, la fecha de nacimiento ni las fotos de la cédula.',
        vence: (vence: string) => vence.charAt(0).toUpperCase() + vence.slice(1),
    },

    // EXP-07 · Buscar
    buscar: {
        titulo: 'Buscar',
        campo: { trabajo: 'Buscar empleos y turnos', todo: 'Buscar empleos, turnos y personas' },
        placeholder: { trabajo: 'Oficio, organización o comuna', todo: 'Oficio, nombre o comuna' },
        empleos: (n: number) => `Empleos (${n})`,
        turnos: (n: number) => `Turnos (${n})`,
        personas: (n: number) => `Personas (${n})`,
        /** Primer dato de una persona encontrada: con qué publicación propia calza. */
        para: (titulo: string) => `Para ${titulo}`,
        postulo: (titulo: string) => `Postuló a ${titulo}`,
        /** Ya la invitaste desde EXP-05 («Invitar a postular»). */
        invitada: (titulo: string) => `Invitaste a postular a ${titulo}`,
        sugerencias: 'Oficios sugeridos',
        inicio: {
            trabajo: { titulo: 'Busca empleos y turnos', texto: 'Escribe un oficio, una organización o una comuna.' },
            todo: { titulo: 'Busca empleos, turnos y personas', texto: 'Escribe un oficio, un nombre o una comuna.' },
        },
        sinResultados: {
            titulo: (q: string) => `No encontramos «${q}»`,
            texto: (pistas: readonly string[]) =>
                pistas.length > 0
                    ? `Prueba con ${enumerar(pistas)}.`
                    : 'Prueba con otra palabra, por ejemplo el oficio o la comuna.',
        },
    },
} as const;
