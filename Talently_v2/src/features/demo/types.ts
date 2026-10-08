// Tipos de los DATOS DE DEMOSTRACIÓN del rediseño v3 (Supabase pausado).
// No son modelos de base de datos: cada campo viene YA LISTO PARA MOSTRAR
// (textos del diccionario en español de Chile, fechas «sáb 12 dic · 19:00»,
// distancia «a 3 km · Ñuñoa»), salvo los montos, que van como número CLP +
// unidad para que los formatee <Amount>, y las notas, que van como número
// para <RatingStars>. Cuando vuelva la base de datos, las consultas reales
// devuelven estos mismos tipos y las pantallas no cambian.
import type { PayUnit } from '../../ui/Amount';
import type { BadgeStatus } from '../../ui/Badge/badgeTones';
import type { InfoTagKind } from '../../ui/InfoTag';
import type { VerificationStatus } from '../../ui/VerificationBadge';
import type { DemoActorId } from './session';

export type { BadgeStatus, DemoActorId };

/**
 * Quien mira una pantalla: los actores de la sesión y Marta Huanca, que solo
 * aparece como quien mira en el flujo 10 (MSG-01 de Marta). Marta no es un
 * actor de la sesión de demostración.
 */
export type DemoViewerId = DemoActorId | 'marta';

export type DemoPublicationType = 'empleo' | 'turno' | 'servicio' | 'clase';

// ─── Piezas comunes ─────────────────────────────────────────────────────────

/**
 * Monto en CLP, entero y sin formato, con su unidad del diccionario: lo
 * formatea <Amount> («$35.000 líquidos por turno»). `net` true = «líquidos»,
 * false = «brutos»; sin `net` (clases y servicios) no se dice.
 * «A convenir» no es un monto: donde aplica, el campo es `null`.
 */
export interface DemoAmount {
    value: number;
    unit: Exclude<PayUnit, 'a_convenir'>;
    net?: boolean;
    /** Solo clases: «por clase de 60 min». */
    durationMin?: number;
}

/** Un dato clave de una publicación (InfoTag): el ícono sale del tipo de dato. */
export interface DemoInfoTag {
    kind?: InfoTagKind;
    text: string;
}

/** Una insignia de confianza (VerificationBadge): «Organización verificada», «Credencial SPD verificada». */
export interface DemoVerification {
    label: string;
    status: VerificationStatus;
    /** «vence 11/2027», bajo la insignia. */
    vence?: string;
}

/** Nota con estrellas: «4,9 (25)». `null` donde se usa = «Sin reseñas aún». */
export interface DemoRating {
    value: number;
    count: number;
}

/** Cupos libres de un turno: «Quedan 3 de 8 cupos». */
export interface DemoCupos {
    left: number;
    total: number;
}

/** Fila rótulo + valor (detalle, perfil, Mi turno). El valor es texto o un monto. */
export interface DemoRow {
    label: string;
    value?: string;
    monto?: DemoAmount;
    /** Texto que sigue al monto o al valor: «te paga Banquetería Rosa SpA directamente». */
    detalle?: string;
    badge?: BadgeStatus;
}

/** Estado vacío (EmptyState). `icono` es semántico: la pantalla elige el ícono del set. */
export interface DemoEmptyState {
    icono?: 'empleo' | 'turno' | 'agregar' | 'mensajes' | 'notificaciones';
    titulo: string;
    texto: string;
    accion?: string;
    destino?: DemoTarget;
}

/** A dónde lleva tocar algo. Las pantallas lo traducen a `paths` (src/app/paths.ts). */
export type DemoTarget =
    | { pantalla: 'inicio' }
    | { pantalla: 'explorar'; tipo: 'empleo' | 'turno' }
    | { pantalla: 'publicacion'; publicationId: string }
    | { pantalla: 'gestion'; publicationId: string }
    | { pantalla: 'postulantes'; publicationId: string }
    | { pantalla: 'cupos'; publicationId: string; bloqueId: string }
    | { pantalla: 'evaluar'; publicationId: string }
    | { pantalla: 'conversacion'; conversationId: string }
    | { pantalla: 'proceso'; processId: string }
    | { pantalla: 'mi-turno'; applicationId: string }
    | { pantalla: 'perfil' }
    | { pantalla: 'verificacion' };

// ─── Organizaciones y personas ──────────────────────────────────────────────

export interface DemoOrg {
    id: string;
    nombre: string;
    iniciales: string;
    verificada: boolean;
    comuna: string;
    /** «Familia en …» es un hogar: avatar cuadrado como una organización. */
    tipo: 'organizacion' | 'hogar';
    /** «Seguridad», «Automotriz» (Sobre la organización, DET-01). */
    rubro?: string;
    /** «50 a 199 trabajadores». */
    tamano?: string;
}

export interface DemoPerson {
    id: string;
    nombre: string;
    iniciales: string;
    comuna: string;
    verificaciones: DemoVerification[];
    /** Oficio principal tal como se muestra: «Asesora del hogar», «Garzón». */
    oficio?: string;
    /** «Más de 10 años», «5 a 10 años». */
    experiencia?: string;
    nota?: DemoRating | null;
    /** «Confiabilidad 97 %»; `null` = «Aún sin turnos suficientes». */
    confiabilidad?: string | null;
}

/** Quien publica o con quien se conversa, ya resuelto para la cabecera de una tarjeta. */
export interface DemoAuthor {
    tipo: 'organizacion' | 'hogar' | 'persona';
    /** Id de DemoOrg o DemoPerson. */
    id: string;
    nombre: string;
    iniciales: string;
    verificaciones: DemoVerification[];
}

// ─── Publicaciones (tarjeta + DET-01) ───────────────────────────────────────

/** Una línea de «Requisitos» con su estado para quien la mira en el prototipo. */
export interface DemoRequirement {
    /** «Credencial SPD (ex OS-10)», «Nota mínima 4,5». */
    texto: string;
    /** Badge warning «Obligatoria». */
    obligatoria?: boolean;
    /** «Tienes tu credencial SPD vigente · vence 03/2028» (cumple) o «Aún no verificas tu identidad». */
    paraTi?: { texto: string; cumple: boolean };
}

/** Un día de un turno (ShiftBlock): «sáb 12 dic · 18:00–00:00 · 6 h · Quedan 3 de 8 cupos». */
export interface DemoShiftBlock {
    id: string;
    /** «sáb» (en minúscula; se ve en mayúsculas). */
    weekday: string;
    day: number;
    month: string;
    /** «18:00–00:00», con raya. */
    time: string;
    /** «6 h» o, si es hoy, «Hoy · 5 h». */
    duration: string;
    cupos?: DemoCupos;
}

/** Lo que DET-01 muestra bajo la tarjeta. */
export interface DemoPublicationDetail {
    /** Bajo el título: «Casona en Las Condes». */
    subtitulo?: string;
    descripcion?: string;
    /** Título del bloque de filas: «Detalle del turno». Sin título, las filas van tras la descripción. */
    filasTitulo?: string;
    /** «Sistema de turno», «Punto de encuentro», «Vestimenta», «Nota de la organización»… */
    filas: DemoRow[];
    requisitos: DemoRequirement[];
    /** Beneficios (InfoTag con check). */
    beneficios?: string[];
    /** Forma de contratación: «Boleta de honorarios» y la nota «Sin subordinación ni dependencia». */
    contratacion?: { forma: string; nota?: string };
    /** «Seguridad · Puente Alto · 50 a 199 trabajadores». */
    sobreOrganizacion?: string;
    /** Banner informativo junto al CTA. */
    aviso: string;
    /** DET-02 (hoja Postular): pregunta de la oferta y si pide CV. */
    postular?: { pregunta?: string; pideCv: boolean };
}

interface DemoPublicationBase {
    id: string;
    tipo: DemoPublicationType;
    titulo: string;
    autor: DemoAuthor;
    /** InfoTag de la tarjeta, en orden (la compacta muestra los 2 primeros). */
    tags: DemoInfoTag[];
    /** `null` = «Sueldo a convenir» / «A convenir». */
    monto: DemoAmount | null;
    /** «a 18 km · Las Condes», o solo la comuna si quien mira es quien publica. */
    lugar: string;
    /** «Por qué ves esto», sin el rótulo: «calza con tu oficio y está a 2 km». */
    porQue?: string;
    /** Estado para quien publica (Activa, Cerrada, En revisión…). */
    estado: BadgeStatus;
    detalle: DemoPublicationDetail;
}

export interface DemoEmpleo extends DemoPublicationBase {
    tipo: 'empleo';
}

export interface DemoTurno extends DemoPublicationBase {
    tipo: 'turno';
    /** Cupos de la tarjeta: la suma de los bloques. */
    cupos: DemoCupos;
    /** Un bloque por día: quien postula, postula a todos. */
    bloques: DemoShiftBlock[];
}

export interface DemoServicio extends DemoPublicationBase {
    tipo: 'servicio';
    nota: DemoRating | null;
}

export interface DemoClase extends DemoPublicationBase {
    tipo: 'clase';
    nota: DemoRating | null;
}

export type DemoPublication = DemoEmpleo | DemoTurno | DemoServicio | DemoClase;

// ─── Postulaciones, procesos y Mi turno (ACT-02, PRC-01, TUR-01) ────────────

/** Un paso del proceso (Timeline): «Postulado · 7 dic · 21:14». */
export interface DemoProcessStep {
    etapa: BadgeStatus;
    estado: 'done' | 'current' | 'pending';
    /** Los pendientes van sin fecha. */
    fecha?: string;
    /** Cierre negativo («No seleccionado»), en el último paso. */
    badge?: BadgeStatus;
}

/** Tarjeta de sistema dentro de una conversación o de PRC-01 (entrevista, certificado). */
export interface DemoSystemCard {
    tipo: 'entrevista' | 'certificado';
    titulo: string;
    /** «mar 15 dic · 10:00», «Av. Concha y Toro 1234, Puente Alto». */
    lineas: string[];
    accion?: string;
    /** `false` = «Ya no está disponible» (tarjeta apagada). */
    disponible: boolean;
}

/** Checklist legal de PRC-01 del hogar («Para contratar como corresponde»). */
export interface DemoChecklist {
    titulo: string;
    intro: string;
    pasos: { titulo: string; detalle: string; hecho: boolean }[];
    enlace: string;
}

/** PRC-01: el proceso de una postulación, visto por quien postula o por quien contrata. */
export interface DemoProcess {
    id: string;
    viewerId: DemoActorId;
    publicationId: string;
    /** «Tu postulación» (quien postula) o «Proceso» (quien contrata). */
    appBarTitulo: string;
    titulo: string;
    subtitulo: string;
    contraparte: DemoAuthor;
    estado: BadgeStatus;
    pasos: DemoProcessStep[];
    entrevista?: DemoSystemCard;
    checklist?: DemoChecklist;
    conversationId?: string;
    /** Muestra «Retirar postulación». */
    puedeRetirar: boolean;
}

/** TUR-01: un turno confirmado, con lo que solo ve quien fue confirmado. */
export interface DemoMyShift {
    titulo: string;
    comuna: string;
    estado: BadgeStatus;
    bloque: DemoShiftBlock;
    /** «Dónde y con quién»: dirección exacta, hora de llegada, encargada, vestimenta, pago. */
    filas: DemoRow[];
    confirmacion: {
        titulo: string;
        texto: string;
        pasos: { texto: string; hecho: boolean }[];
    };
    conversationId?: string;
}

/** Una fila de ACT-02 · Postulaciones. */
export interface DemoApplication {
    id: string;
    actorId: DemoActorId;
    publicationId: string;
    tipo: 'empleo' | 'turno';
    titulo: string;
    autor: DemoAuthor;
    /** Segunda línea: «Seguridad Andes Ltda. · entrevista mar 15 dic · 10:00». */
    detalle: string;
    estado: BadgeStatus;
    /** Empleos: abre PRC-01. */
    processId?: string;
    /** Turnos confirmados: abre TUR-01. */
    miTurno?: DemoMyShift;
}

// ─── Mensajes (MSG-01, MSG-02) ──────────────────────────────────────────────

interface DemoMessageBase {
    id: string;
    /** Separador de día: «Ayer», «Hoy», «5 dic». */
    dia: string;
}

export interface DemoTextMessage extends DemoMessageBase {
    tipo: 'texto';
    de: 'yo' | 'otro';
    texto: string;
    hora: string;
    /** Solo en los míos: «17:12 · Leído», «13:00 · Enviado». */
    estado?: 'Enviado' | 'Leído';
}

export interface DemoSystemMessage extends DemoMessageBase {
    tipo: 'sistema';
    tarjeta: DemoSystemCard;
}

export type DemoMessage = DemoTextMessage | DemoSystemMessage;

export interface DemoConversation {
    id: string;
    viewerId: DemoViewerId;
    /** Con quién: avatar, nombre y su línea del AppBar («Organización verificada», «Hogar · Ñuñoa»). */
    con: DemoAuthor & { linea: string };
    contexto: {
        tipo: 'empleo' | 'turno';
        /** En la lista (MSG-01): «Turno · Garzón · hoy». */
        texto: string;
        /** ContextChip de MSG-02: «Empleo · Guardia 4x4». */
        chip: string;
        /** Sin id si la publicación ya no existe en la demo (turnos pasados). */
        publicationId?: string;
    };
    /** Último mensaje en la lista, con «Tú: » si es tuyo. `null` en un match nuevo. */
    vistaPrevia: string | null;
    /** «hace 5 min», «10:30», «5 dic». `null` en un match nuevo. */
    cuando: string | null;
    sinLeer: number;
    /** Va en «Nuevos matches», sin mensajes todavía. */
    nuevoMatch: boolean;
    mensajes: DemoMessage[];
    /** Flujo 10: el pedido del certificado de antecedentes y lo que aparece al compartirlo. */
    certificado?: { aviso: string; alCompartir: DemoMessage[] };
}

// ─── Notificaciones (NOT-01) y agenda (ACT-01, «Hoy en tu agenda») ──────────

export type DemoNotificationGroup = 'Hoy' | 'Ayer' | 'Esta semana' | 'Antes';

/** Ícono semántico de la fila: la pantalla elige el del set. */
export type DemoNotificationIcon =
    | 'cupos'
    | 'verificacion'
    | 'postulantes'
    | 'turno'
    | 'evaluar'
    | 'mensaje'
    | 'match'
    | 'entrevista'
    | 'postulacion';

export interface DemoNotification {
    id: string;
    /** Bandeja de la persona (una persona y sus organizaciones comparten bandeja). */
    viewerId: DemoViewerId;
    /** Actor al que se refiere: tocarla cambia a ese actor si no es el actual (flujo 7). */
    actorId: DemoViewerId;
    grupo: DemoNotificationGroup;
    titulo: string;
    /** Bajo el título, antes de la hora: «Banquetería Rosa SpA». */
    origen: string;
    cuando: string;
    sinLeer: boolean;
    icono: DemoNotificationIcon;
    destino?: DemoTarget;
}

export interface DemoAgendaEvent {
    id: string;
    viewerId: DemoActorId;
    /** «jue 10 dic». */
    fecha: string;
    esHoy: boolean;
    inicio: string;
    fin?: string;
    /** «Turno · Garzón», «Entrevista». */
    titulo: string;
    /** «Banquetería Rosa SpA · Cóctel corporativo · Providencia». */
    detalle: string;
    estado: BadgeStatus;
    tipo: 'turno' | 'entrevista';
    destino: DemoTarget;
}

// ─── Inicio (INI-01, INI-02) ────────────────────────────────────────────────

/** «Postulaciones con novedades». */
export interface DemoNews {
    id: string;
    iniciales: string;
    titulo: string;
    detalle: string;
    estado: BadgeStatus;
    destino: DemoTarget;
}

/** Tarjeta para completar el perfil («Te falta la credencial SPD», «Te falta 1 cosa»). */
export interface DemoProfileTip {
    titulo: string;
    badge?: BadgeStatus;
    texto: string;
    accion: string;
    destino?: DemoTarget;
}

export type DemoHomeBlock =
    | { tipo: 'agenda'; titulo: string; accion: string; eventos: DemoAgendaEvent[] }
    | { tipo: 'turnos'; titulo: string; accion: string; publicaciones: string[] }
    | { tipo: 'empleos'; titulo: string; accion: string; publicaciones: string[] }
    | { tipo: 'novedades'; titulo: string; items: DemoNews[] }
    | { tipo: 'completar'; aviso: DemoProfileTip }
    | { tipo: 'que-necesitas'; titulo: string; opciones: { id: string; texto: string }[] }
    | { tipo: 'tu-aviso'; titulo: string; publicationId: string; detalle: string; estado: BadgeStatus }
    | { tipo: 'publicar'; texto: string }
    | { tipo: 'vacio'; estado: DemoEmptyState }
    | { tipo: 'panel'; panel: DemoOrgDashboard };

export interface DemoHomeFeed {
    actorId: DemoActorId;
    /** «Hola, Matías». */
    saludo: string;
    /** Contador de la campana. */
    notificacionesSinLeer: number;
    /** Contador de la pestaña Mensajes. */
    mensajesSinLeer: number;
    bloques: DemoHomeBlock[];
}

// ─── Organización: INI-02, GES-01, GES-02, GES-04 ───────────────────────────

export interface DemoKpi {
    id: string;
    label: string;
    /** «12», «4/6 cubiertos», «2 h». */
    valor: string;
}

export interface DemoAttentionItem {
    id: string;
    texto: string;
    detalle?: string;
    icono: 'cupos' | 'postulantes' | 'evaluar';
    destino: DemoTarget;
}

export interface DemoOrgDashboard {
    orgId: string;
    saludo: string;
    kpis: DemoKpi[];
    atencion: DemoAttentionItem[];
    /** Ids de DemoManagedPublication (= id de la publicación), lo que lista ACT-02 · Publicaciones. */
    publicaciones: string[];
}

/** Una persona en la lista de postulantes (GES-02) o de cupos (GES-04). */
export interface DemoApplicant {
    personId: string;
    nombre: string;
    iniciales: string;
    /** «Asesora del hogar · Más de 10 años · La Florida». */
    linea?: string;
    /** `null` = «Pretensión: A convenir». */
    pretension?: DemoAmount | null;
    estado?: BadgeStatus;
    verificaciones: DemoVerification[];
    nota: DemoRating | null;
    /** «Confiabilidad 97 %»; `null` = «Aún sin turnos suficientes». */
    confiabilidad?: string | null;
    conversationId?: string;
    processId?: string;
}

/** GES-04: cupos de un bloque del turno. */
export interface DemoShiftRoster {
    /** Id del bloque (DemoShiftBlock.id). */
    id: string;
    /** «Garzones · sáb 12 dic». */
    titulo: string;
    /** «Garzones para matrimonio · 18:00–00:00 · Las Condes». */
    subtitulo: string;
    total: number;
    confirmados: DemoApplicant[];
    postulados: DemoApplicant[];
    listaEspera: DemoApplicant[];
    /** «Confirmar a mis favoritos (2)» y su explicación. */
    favoritos?: { personIds: string[]; texto: string };
    /** Sin postulados todavía. */
    vacio?: DemoEmptyState;
}

/** GES-02: lista de postulantes de un empleo o aviso. */
export interface DemoApplicantList {
    total: number;
    /** «ordenados por afinidad». */
    orden: string;
    aviso?: string;
    filtros: string[];
    personas: DemoApplicant[];
}

/** GES-01 (y lo que cuelga de ella): una publicación vista por quien la publicó. */
export interface DemoManagedPublication {
    publicationId: string;
    ownerId: DemoActorId;
    titulo: string;
    /** «Turno · sáb 19 y dom 20 dic · San Miguel». */
    resumen: string;
    estado: BadgeStatus;
    /** «Publicada hoy · hasta el dom 20 dic». */
    vigencia: string;
    metricas: { label: string; valor: string; detalle?: string }[];
    favoritos?: { texto: string; detalle: string };
    nota?: string;
    cupos?: DemoShiftRoster[];
    postulantes?: DemoApplicantList;
}

// ─── Perfil (PRF-01) y configuración (CFG-01) ───────────────────────────────

export type DemoProfileSection =
    | { tipo: 'texto'; titulo: string; texto: string; editable: boolean }
    | { tipo: 'filas'; titulo: string; filas: DemoRow[]; nota?: string; editable: boolean }
    | { tipo: 'tags'; titulo: string; tags: DemoInfoTag[]; editable: boolean }
    | { tipo: 'archivo'; titulo: string; nombre: string; detalle: string; editable: boolean }
    | { tipo: 'vacio'; titulo: string; texto: string; accion: string };

/** Una pestaña de «Mis perfiles» (Trabajo, Hogar, Organización). */
export interface DemoProfileTab {
    id: 'trabajo' | 'hogar' | 'organizacion';
    nombre: string;
    /** «Te falta 1 cosa». */
    completitud?: DemoProfileTip;
    secciones: DemoProfileSection[];
    /** Texto al pie: «Tus avisos se publican desde Inicio.». */
    pie?: string;
}

export interface DemoProfileLink {
    id: 'agregar' | 'verificacion' | 'mis-perfiles' | 'impulsa';
    titulo: string;
    detalle: string;
    badge?: BadgeStatus;
}

export interface DemoProfile {
    actorId: DemoActorId;
    /** Cabecera «Así te ven». */
    asiTeVen: {
        nombre: string;
        iniciales: string;
        comuna: string;
        verificaciones: DemoVerification[];
        /** Nota por rol: «Trabajo 4,9 (25) · Hogar Sin reseñas aún». */
        notas: { rol: string; nota: DemoRating | null }[];
    };
    perfiles: DemoProfileTab[];
    /** Sin perfiles (Rosa como persona). */
    vacio?: DemoEmptyState;
    enlaces: DemoProfileLink[];
    /** CFG-01: lo que cambia por persona. */
    configuracion: {
        cuenta: string;
        notificaciones: string;
        apariencia: string;
    };
}

// ─── Explorar (EXP-01, EXP-02) ──────────────────────────────────────────────

export interface DemoExploreDay {
    /** «Hoy», «Mañana», «Este fin de semana», «Más adelante». */
    titulo: string;
    publicaciones: string[];
}

export interface DemoExplore {
    actorId: DemoActorId;
    /** Contador del botón Filtros. */
    filtrosActivos: number;
    empleos: {
        /** «Ofertas cerca de Macul». */
        titulo: string;
        /** Vista inicial: deck (EXP-01) o lista. */
        vista: 'deck' | 'lista';
        publicaciones: string[];
        vacio?: DemoEmptyState;
    };
    turnos: {
        /** Chip de comuna: «Maipú». */
        comuna: string;
        /** Chips de oficio, con «Todos» primero. */
        filtros: string[];
        dias: DemoExploreDay[];
        /** Lo que se muestra si no hay turnos (o si los filtros dejan la lista vacía). */
        vacio?: DemoEmptyState;
    };
}
