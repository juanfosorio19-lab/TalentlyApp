// DATOS DE DEMOSTRACIÓN del rediseño v3 mientras Supabase está pausado.
// Fuente: prototipo F1 de Claude Design (docs/rediseno/diseno/prototipo-f1 y
// flujos.json). Hoy en la demo es jue 10 dic 2026, 13:00 (índice del prototipo).
// Los textos, montos, fechas, comunas y distancias son los del prototipo; lo que
// no está en él lleva el comentario «// no está en el prototipo».
// Cuando vuelva la base de datos, cada get… se reemplaza por su consulta real
// con el mismo tipo de retorno (types.ts) y las pantallas no cambian.
import { DEMO_ACTORS } from './session';
import type {
    DemoActorId,
    DemoAgendaEvent,
    DemoAmount,
    DemoApplicant,
    DemoApplication,
    DemoAuthor,
    DemoConversation,
    DemoEmptyState,
    DemoExplore,
    DemoHomeBlock,
    DemoHomeFeed,
    DemoManagedPublication,
    DemoMyShift,
    DemoNotification,
    DemoOrg,
    DemoOrgDashboard,
    DemoPerson,
    DemoProcess,
    DemoProfile,
    DemoProfileLink,
    DemoPublication,
    DemoRow,
    DemoSystemCard,
    DemoVerification,
    DemoViewerId,
} from './types';

/** Fecha de la demo, como la dice el índice del prototipo F1. */
export const DEMO_TODAY = 'jue 10 dic 2026';

// ─── Piezas repetidas ───────────────────────────────────────────────────────

const V = {
    org: { label: 'Organización verificada', status: 'verified' },
    telefono: { label: 'Teléfono verificado', status: 'verified' },
    spd: { label: 'Credencial SPD verificada', status: 'verified' },
    identidad: { label: 'Identidad verificada', status: 'verified' },
} satisfies Record<string, DemoVerification>;

const aptaMenores = (vence: string): DemoVerification => ({
    label: 'Apta para trabajar con menores',
    status: 'verified',
    vence: `vence ${vence}`,
});

const liquidos = (value: number, unit: DemoAmount['unit']): DemoAmount => ({ value, unit, net: true });

const AVISO_TURNO = 'Talently no contrata ni paga: quien publica el turno te contrata o te paga directamente.';
const AVISO_EMPLEO = 'Talently nunca te pedirá pagar para postular.';
const BOLETA = { forma: 'Boleta de honorarios', nota: 'Sin subordinación ni dependencia' };
const VESTIMENTA_GARZON: DemoRow = { label: 'Vestimenta', value: 'Camisa blanca, pantalón y zapatos negros' };
const BENEFICIOS = ['Colación', 'Movilización', 'Bono de asistencia'];
const NOTA_MINIMA_MATIAS = { texto: 'Nota mínima 4,5', paraTi: { texto: 'Tu nota es 4,8', cumple: true } };
const SPD_JORGE = {
    texto: 'Credencial SPD (ex OS-10)',
    obligatoria: true,
    paraTi: { texto: 'Tienes tu credencial SPD vigente · vence 03/2028', cumple: true },
};
const EXPERIENCIA_JORGE = { texto: 'Tienes 5 a 10 años de experiencia', cumple: true };

// ─── Organizaciones ─────────────────────────────────────────────────────────

const ORGS = {
    // El id coincide con el actor de la sesión (getOrgDashboard('banqueteria')).
    banqueteria: {
        id: 'banqueteria', nombre: 'Banquetería Rosa SpA', iniciales: 'BR', verificada: true, comuna: 'San Miguel',
        tipo: 'organizacion',
        rubro: 'Gastronomía y eventos', tamano: '10 a 49 trabajadores', // no está en el prototipo
    },
    hotelAndino: {
        id: 'hotel-andino', nombre: 'Hotel Andino', iniciales: 'HA', verificada: true, comuna: 'Las Condes',
        tipo: 'organizacion',
        rubro: 'Hotelería', tamano: '50 a 199 trabajadores', // no está en el prototipo
    },
    seguridadAndes: {
        id: 'seguridad-andes', nombre: 'Seguridad Andes Ltda.', iniciales: 'SA', verificada: true, comuna: 'Puente Alto',
        tipo: 'organizacion', rubro: 'Seguridad', tamano: '50 a 199 trabajadores',
    },
    tallerLosAromos: {
        id: 'taller-los-aromos', nombre: 'Taller Los Aromos', iniciales: 'TA', verificada: true, comuna: 'Macul',
        tipo: 'organizacion', rubro: 'Automotriz', tamano: '10 a 49 trabajadores',
    },
    puntoActivo: {
        id: 'punto-activo', nombre: 'Punto Activo Eventos Ltda.', iniciales: 'PA', verificada: true,
        comuna: 'Santiago', // no está en el prototipo
        tipo: 'organizacion',
    },
    santaElena: {
        id: 'distribuidora-santa-elena', nombre: 'Distribuidora Santa Elena Ltda.', iniciales: 'DS', verificada: true,
        comuna: 'Pudahuel', tipo: 'organizacion',
    },
    losPeumos: {
        id: 'edificio-los-peumos', nombre: 'Comunidad Edificio Los Peumos', iniciales: 'EP', verificada: true,
        comuna: 'Puente Alto', tipo: 'organizacion',
    },
    proteccionIntegral: {
        id: 'proteccion-integral', nombre: 'Protección Integral Ltda.', iniciales: 'PI', verificada: true,
        comuna: 'La Florida', tipo: 'organizacion',
    },
    colegioSanEsteban: {
        id: 'colegio-san-esteban', nombre: 'Colegio San Esteban', iniciales: 'CS',
        verificada: true, // no está en el prototipo
        comuna: 'Ñuñoa', tipo: 'organizacion',
    },
    // Hogar de Carolina (avatar cuadrado). Verificó su identidad en VER-02 (flujo 5).
    familiaNunoa: {
        id: 'familia-nunoa', nombre: 'Familia en Ñuñoa', iniciales: 'FÑ', verificada: true, comuna: 'Ñuñoa', tipo: 'hogar',
    },
    // Hogar de Jorge (PRF-01 · Hogar): aún no verifica su identidad.
    familiaPuenteAlto: {
        id: 'familia-puente-alto', nombre: 'Familia en Puente Alto', iniciales: 'FP', verificada: false,
        comuna: 'Puente Alto', tipo: 'hogar',
    },
    // no está en el prototipo: más tarjetas para el deck de Pedro (EXP-01 muestra una detrás).
    transportesCordillera: {
        id: 'transportes-cordillera', nombre: 'Transportes Cordillera Ltda.', iniciales: 'TC', verificada: true,
        comuna: 'San Joaquín', tipo: 'organizacion', rubro: 'Transporte', tamano: '50 a 199 trabajadores',
    },
    automotoraDelSur: {
        id: 'automotora-del-sur', nombre: 'Automotora Del Sur', iniciales: 'AS', verificada: true,
        comuna: 'La Florida', tipo: 'organizacion', rubro: 'Automotriz', tamano: '10 a 49 trabajadores',
    },
} satisfies Record<string, DemoOrg>;

// ─── Personas ───────────────────────────────────────────────────────────────

const PERSONS = {
    // Actores de la sesión (los ids coinciden con DemoActorId).
    matias: {
        id: 'matias', nombre: 'Matías Rojas', iniciales: 'MR', comuna: 'Maipú',
        verificaciones: [V.telefono], // verificó su teléfono en AUTH-08 (flujo 2)
        oficio: 'Garzón',
        experiencia: '1 a 3 años', // no está en el prototipo
        nota: { value: 4.8, count: 12 }, // «Tu nota es 4,8» (DET-01); el número de reseñas no está en el prototipo
        confiabilidad: 'Confiabilidad 94 %', // no está en el prototipo
    },
    jorge: {
        id: 'jorge', nombre: 'Jorge Muñoz', iniciales: 'JM', comuna: 'Puente Alto',
        verificaciones: [V.telefono, V.spd], oficio: 'Guardia de seguridad', experiencia: '5 a 10 años',
        nota: { value: 4.9, count: 25 },
        confiabilidad: 'Confiabilidad 98 %', // no está en el prototipo
    },
    pedro: {
        id: 'pedro', nombre: 'Pedro Valdés', iniciales: 'PV', comuna: 'Macul',
        verificaciones: [V.telefono], // no está en el prototipo
        oficio: 'Mecánico/a automotriz', experiencia: '5 a 10 años', nota: null,
    },
    carolina: {
        id: 'carolina', nombre: 'Carolina', iniciales: 'C', comuna: 'Ñuñoa',
        verificaciones: [V.identidad], // VER-02 del flujo 5
    },
    rosa: {
        id: 'rosa', nombre: 'Rosa Muñoz', iniciales: 'RM', comuna: 'Providencia',
        verificaciones: [V.identidad], // NOT-01: «Verificamos tu identidad»
    },
    // Flujo 10 y GES-02 de Carolina.
    marta: {
        id: 'marta', nombre: 'Marta Huanca', iniciales: 'MH', comuna: 'La Florida',
        verificaciones: [aptaMenores('11/2027')], oficio: 'Asesora del hogar', experiencia: 'Más de 10 años',
        nota: { value: 4.9, count: 14 },
    },
    gladys: {
        id: 'gladys-mamani', nombre: 'Gladys Mamani', iniciales: 'GM', comuna: 'Puente Alto',
        verificaciones: [aptaMenores('06/2027')], oficio: 'Asesora del hogar', experiencia: '5 a 10 años',
        nota: { value: 4.8, count: 9 },
    },
    carmen: {
        id: 'carmen-paredes', nombre: 'Carmen Paredes', iniciales: 'CP', comuna: 'Macul',
        verificaciones: [aptaMenores('02/2028')], oficio: 'Asesora del hogar', experiencia: '3 a 5 años', nota: null,
    },
    veronica: {
        id: 'veronica-lagos', nombre: 'Verónica Lagos', iniciales: 'VL', comuna: 'Ñuñoa',
        verificaciones: [aptaMenores('09/2027')], oficio: 'Cuidadora infantil', experiencia: '1 a 3 años',
        nota: { value: 4.7, count: 6 },
    },
    // no está en el prototipo: los 5 postulantes que faltan para llegar a «9 postulantes» (GES-02).
    juana: {
        id: 'juana-condori', nombre: 'Juana Condori', iniciales: 'JC', comuna: 'Peñalolén',
        verificaciones: [aptaMenores('04/2028')], oficio: 'Asesora del hogar', experiencia: '5 a 10 años',
        nota: { value: 4.6, count: 7 },
    },
    patricia: {
        id: 'patricia-soto', nombre: 'Patricia Soto', iniciales: 'PS', comuna: 'La Reina',
        verificaciones: [aptaMenores('08/2027')], oficio: 'Asesora del hogar', experiencia: 'Más de 10 años',
        nota: { value: 4.8, count: 21 },
    },
    lorena: {
        id: 'lorena-diaz', nombre: 'Lorena Díaz', iniciales: 'LD', comuna: 'Macul',
        verificaciones: [aptaMenores('12/2027')], oficio: 'Cuidadora infantil', experiencia: '3 a 5 años', nota: null,
    },
    elena: {
        id: 'elena-rivas', nombre: 'Elena Rivas', iniciales: 'ER', comuna: 'San Joaquín',
        verificaciones: [aptaMenores('03/2028')], oficio: 'Asesora del hogar', experiencia: '1 a 3 años', nota: null,
    },
    sonia: {
        id: 'sonia-paz', nombre: 'Sonia Paz', iniciales: 'SP', comuna: 'Ñuñoa',
        verificaciones: [aptaMenores('05/2027')], oficio: 'Asesora del hogar', experiencia: '3 a 5 años',
        nota: { value: 4.5, count: 4 },
    },
    // GES-04 de «Garzones para matrimonio» y «Garzones fin de semana». Comunas: no están en el prototipo.
    javiera: {
        id: 'javiera-contreras', nombre: 'Javiera Contreras', iniciales: 'JC', comuna: 'San Miguel', verificaciones: [],
        oficio: 'Garzona', nota: { value: 4.9, count: 31 }, confiabilidad: 'Confiabilidad 97 %',
    },
    felipe: {
        id: 'felipe-araya', nombre: 'Felipe Araya', iniciales: 'FA', comuna: 'La Cisterna', verificaciones: [],
        oficio: 'Garzón', nota: { value: 4.8, count: 19 }, confiabilidad: 'Confiabilidad 95 %',
    },
    daniela: {
        id: 'daniela-gomez', nombre: 'Daniela Gómez', iniciales: 'DG', comuna: 'Santiago', verificaciones: [],
        oficio: 'Garzona', nota: { value: 4.7, count: 12 }, confiabilidad: 'Confiabilidad 92 %',
    },
    sebastian: {
        id: 'sebastian-perez', nombre: 'Sebastián Pérez', iniciales: 'SP', comuna: 'San Joaquín', verificaciones: [],
        oficio: 'Garzón', nota: { value: 4.6, count: 9 }, confiabilidad: 'Confiabilidad 89 %',
    },
    constanza: {
        id: 'constanza-leiva', nombre: 'Constanza Leiva', iniciales: 'CL', comuna: 'Pedro Aguirre Cerda',
        verificaciones: [], oficio: 'Garzona', nota: null, confiabilidad: null,
    },
    martin: {
        id: 'martin-silva', nombre: 'Martín Silva', iniciales: 'MS', comuna: 'San Miguel', verificaciones: [],
        oficio: 'Garzón', nota: { value: 4.9, count: 22 }, confiabilidad: 'Confiabilidad 96 %',
    },
    fernanda: {
        id: 'fernanda-castro', nombre: 'Fernanda Castro', iniciales: 'FC', comuna: 'Santiago', verificaciones: [],
        oficio: 'Garzona', nota: { value: 4.8, count: 14 }, confiabilidad: 'Confiabilidad 93 %',
    },
    nicolas: {
        id: 'nicolas-vargas', nombre: 'Nicolás Vargas', iniciales: 'NV', comuna: 'La Granja', verificaciones: [],
        oficio: 'Garzón', nota: { value: 4.5, count: 6 }, confiabilidad: 'Confiabilidad 86 %',
    },
    antonia: {
        id: 'antonia-reyes', nombre: 'Antonia Reyes', iniciales: 'AR', comuna: 'San Miguel', verificaciones: [],
        oficio: 'Garzona', nota: null, confiabilidad: null,
    },
    // no está en el prototipo: guardias confirmados en «Guardia de eventos» del sáb 19 dic (Jorge queda en lista de espera).
    hector: {
        id: 'hector-salinas', nombre: 'Héctor Salinas', iniciales: 'HS', comuna: 'San Miguel', verificaciones: [V.spd],
        oficio: 'Guardia de eventos', nota: { value: 4.8, count: 17 }, confiabilidad: 'Confiabilidad 95 %',
    },
    ricardo: {
        id: 'ricardo-bravo', nombre: 'Ricardo Bravo', iniciales: 'RB', comuna: 'La Cisterna', verificaciones: [V.spd],
        oficio: 'Guardia de eventos', nota: { value: 4.7, count: 11 }, confiabilidad: 'Confiabilidad 93 %',
    },
    paola: {
        id: 'paola-nunez', nombre: 'Paola Núñez', iniciales: 'PN', comuna: 'Santiago', verificaciones: [V.spd],
        oficio: 'Guardia de eventos', nota: { value: 4.9, count: 8 }, confiabilidad: 'Confiabilidad 97 %',
    },
    cristian: {
        id: 'cristian-mella', nombre: 'Cristián Mella', iniciales: 'CM', comuna: 'San Miguel', verificaciones: [V.spd],
        oficio: 'Guardia de eventos', nota: { value: 4.6, count: 5 }, confiabilidad: 'Confiabilidad 90 %',
    },
    // no está en el prototipo: los «5 postulantes sin revisar en Bartender» (INI-02).
    ignacio: {
        id: 'ignacio-morales', nombre: 'Ignacio Morales', iniciales: 'IM', comuna: 'San Miguel', verificaciones: [],
        oficio: 'Bartender', experiencia: '3 a 5 años', nota: { value: 4.7, count: 10 },
    },
    catalina: {
        id: 'catalina-torres', nombre: 'Catalina Torres', iniciales: 'CT', comuna: 'La Cisterna', verificaciones: [],
        oficio: 'Bartender', experiencia: '1 a 3 años', nota: null,
    },
    diego: {
        id: 'diego-navarro', nombre: 'Diego Navarro', iniciales: 'DN', comuna: 'Santiago', verificaciones: [],
        oficio: 'Bartender', experiencia: '5 a 10 años', nota: { value: 4.9, count: 18 },
    },
    valeria: {
        id: 'valeria-campos', nombre: 'Valeria Campos', iniciales: 'VC', comuna: 'San Joaquín', verificaciones: [],
        oficio: 'Bartender', experiencia: '1 a 3 años', nota: null,
    },
    benjamin: {
        id: 'benjamin-herrera', nombre: 'Benjamín Herrera', iniciales: 'BH', comuna: 'Pedro Aguirre Cerda',
        verificaciones: [], oficio: 'Bartender', experiencia: '3 a 5 años', nota: { value: 4.6, count: 3 },
    },
} satisfies Record<string, DemoPerson>;

export const DEMO_ORGS: DemoOrg[] = Object.values(ORGS);
export const DEMO_PERSONS: DemoPerson[] = Object.values(PERSONS);

function autorOrg(o: DemoOrg): DemoAuthor {
    const verificaciones = o.verificada ? [o.tipo === 'hogar' ? V.identidad : V.org] : [];
    return { tipo: o.tipo, id: o.id, nombre: o.nombre, iniciales: o.iniciales, verificaciones };
}

function autorPersona(p: DemoPerson): DemoAuthor {
    return { tipo: 'persona', id: p.id, nombre: p.nombre, iniciales: p.iniciales, verificaciones: p.verificaciones };
}

/** Persona en GES-02 o GES-04, con la línea «Asesora del hogar · Más de 10 años · La Florida». */
function aplicante(p: DemoPerson, extra: Partial<DemoApplicant> = {}): DemoApplicant {
    return {
        personId: p.id,
        nombre: p.nombre,
        iniciales: p.iniciales,
        verificaciones: p.verificaciones,
        nota: p.nota ?? null,
        confiabilidad: p.confiabilidad,
        ...extra,
    };
}

function lineaOficio(p: DemoPerson): string {
    return [p.oficio, p.experiencia, p.comuna].filter(Boolean).join(' · ');
}

// ─── Publicaciones ──────────────────────────────────────────────────────────

export const DEMO_PUBLICATIONS: DemoPublication[] = [
    // ── Turnos ──
    {
        // INI-01 de Matías, EXP-02 y DET-01-turno (flujo 2).
        id: 'turno-garzones-matrimonio', tipo: 'turno', titulo: 'Garzones para matrimonio',
        autor: autorOrg(ORGS.banqueteria),
        tags: [{ kind: 'fecha', text: 'sáb 12 dic · 18:00–00:00 (6 h)' }],
        monto: liquidos(35000, 'turno'), cupos: { left: 3, total: 8 }, lugar: 'a 18 km · Las Condes', estado: 'Activa',
        bloques: [{ id: 'matrimonio-sab-12', weekday: 'sáb', day: 12, month: 'dic', time: '18:00–00:00', duration: '6 h', cupos: { left: 3, total: 8 } }],
        detalle: {
            subtitulo: 'Casona en Las Condes',
            contratacion: BOLETA,
            filasTitulo: 'Detalle del turno',
            filas: [
                { label: 'Punto de encuentro', value: 'Metro Los Dominicos · la dirección exacta se muestra al confirmar' },
                VESTIMENTA_GARZON,
                { label: 'Nota de la organización', value: 'Llega 30 minutos antes para el montaje. Hay colación para el equipo.' },
            ],
            requisitos: [
                { texto: 'Identidad verificada', obligatoria: true, paraTi: { texto: 'Aún no verificas tu identidad', cumple: false } },
                NOTA_MINIMA_MATIAS,
            ],
            aviso: AVISO_TURNO,
        },
    },
    {
        // Tarjeta: INI-01 de Matías y EXP-02. Detalle: no está en el prototipo.
        id: 'turno-coctel-lanzamiento', tipo: 'turno', titulo: 'Garzones para cóctel de lanzamiento',
        autor: autorOrg(ORGS.hotelAndino),
        tags: [{ kind: 'fecha', text: 'sáb 12 dic · 19:00–23:00 (4 h)' }],
        monto: liquidos(30000, 'turno'), cupos: { left: 5, total: 10 }, lugar: 'a 18 km · Las Condes', estado: 'Activa',
        bloques: [{ id: 'lanzamiento-sab-12', weekday: 'sáb', day: 12, month: 'dic', time: '19:00–23:00', duration: '4 h', cupos: { left: 5, total: 10 } }],
        detalle: {
            subtitulo: 'Salón principal del Hotel Andino', // no está en el prototipo
            contratacion: BOLETA,
            filasTitulo: 'Detalle del turno',
            filas: [
                { label: 'Punto de encuentro', value: 'Metro Manquehue · la dirección exacta se muestra al confirmar' }, // no está en el prototipo
                VESTIMENTA_GARZON,
                { label: 'Nota de la organización', value: 'Es un cóctel de pie para 200 personas. Hay colación al final del turno.' }, // no está en el prototipo
            ],
            requisitos: [NOTA_MINIMA_MATIAS], // no está en el prototipo
            aviso: AVISO_TURNO,
        },
    },
    {
        // Tarjeta: INI-01 de Matías y EXP-02. Detalle: no está en el prototipo.
        id: 'turno-banqueteros-bautizo', tipo: 'turno', titulo: 'Banqueteros para bautizo',
        autor: autorOrg(ORGS.hotelAndino),
        tags: [{ kind: 'fecha', text: 'dom 13 dic · 12:00–18:00 (6 h)' }],
        monto: liquidos(35000, 'turno'), cupos: { left: 2, total: 4 }, lugar: 'a 18 km · Las Condes', estado: 'Activa',
        bloques: [{ id: 'bautizo-dom-13', weekday: 'dom', day: 13, month: 'dic', time: '12:00–18:00', duration: '6 h', cupos: { left: 2, total: 4 } }],
        detalle: {
            subtitulo: 'Terraza del Hotel Andino', // no está en el prototipo
            contratacion: BOLETA,
            filasTitulo: 'Detalle del turno',
            filas: [
                { label: 'Punto de encuentro', value: 'Metro Manquehue · la dirección exacta se muestra al confirmar' }, // no está en el prototipo
                VESTIMENTA_GARZON,
                { label: 'Nota de la organización', value: 'Almuerzo para 80 personas. Llega 30 minutos antes para el montaje.' }, // no está en el prototipo
            ],
            requisitos: [NOTA_MINIMA_MATIAS], // no está en el prototipo
            aviso: AVISO_TURNO,
        },
    },
    {
        // Tarjeta: EXP-02 · Hoy. Detalle: no está en el prototipo.
        id: 'turno-bodega-noche', tipo: 'turno', titulo: 'Operario/a de bodega · Turno noche',
        autor: autorOrg(ORGS.santaElena),
        tags: [{ kind: 'fecha', text: 'hoy · 22:00–06:00 (8 h)' }],
        monto: liquidos(6500, 'hora'), cupos: { left: 2, total: 6 }, lugar: 'a 9 km · Pudahuel', estado: 'Activa',
        bloques: [{ id: 'bodega-jue-10', weekday: 'jue', day: 10, month: 'dic', time: '22:00–06:00', duration: 'Hoy · 8 h', cupos: { left: 2, total: 6 } }],
        detalle: {
            subtitulo: 'Centro de distribución en Pudahuel', // no está en el prototipo
            // PUBL-03 paso 3: un turno que se repite, como en bodega, no se paga con boleta.
            contratacion: { forma: 'Plazo fijo' },
            filasTitulo: 'Detalle del turno',
            filas: [
                { label: 'Punto de encuentro', value: 'Portería del centro de distribución · la dirección exacta se muestra al confirmar' }, // no está en el prototipo
                { label: 'Vestimenta', value: 'Zapatos de seguridad. Entregamos chaleco reflectante.' }, // no está en el prototipo
                { label: 'Nota de la organización', value: 'Carga y descarga de camiones y preparación de pedidos.' }, // no está en el prototipo
            ],
            requisitos: [{ texto: 'Teléfono verificado' }], // no está en el prototipo
            aviso: AVISO_TURNO,
        },
    },
    {
        // Tarjeta: EXP-02 · Mañana. Detalle: no está en el prototipo.
        id: 'turno-guardia-concierto', tipo: 'turno', titulo: "Guardia de eventos · Concierto en Parque O'Higgins",
        autor: autorOrg(ORGS.puntoActivo),
        tags: [{ kind: 'fecha', text: 'vie 11 dic · 17:00–01:00 (8 h)' }],
        monto: liquidos(40000, 'turno'), cupos: { left: 6, total: 12 }, lugar: 'a 12 km · Santiago', estado: 'Activa',
        bloques: [{ id: 'concierto-vie-11', weekday: 'vie', day: 11, month: 'dic', time: '17:00–01:00', duration: '8 h', cupos: { left: 6, total: 12 } }],
        detalle: {
            subtitulo: "Parque O'Higgins, Santiago", // no está en el prototipo
            contratacion: BOLETA,
            filasTitulo: 'Detalle del turno',
            filas: [
                { label: 'Punto de encuentro', value: "Metro Parque O'Higgins · la dirección exacta se muestra al confirmar" }, // no está en el prototipo
                { label: 'Vestimenta', value: 'Pantalón y zapatos negros. Entregamos chaqueta y credencial del evento.' }, // no está en el prototipo
            ],
            requisitos: [{ texto: 'Credencial SPD (ex OS-10)', obligatoria: true }], // no está en el prototipo
            aviso: AVISO_TURNO,
        },
    },
    {
        // Tarjeta: EXP-02 · Más adelante. Detalle: no está en el prototipo.
        id: 'turno-bartender-ano-nuevo', tipo: 'turno', titulo: 'Bartender · Fiesta de Año Nuevo',
        autor: autorOrg(ORGS.hotelAndino),
        tags: [{ kind: 'fecha', text: 'jue 31 dic · 21:00–04:00 (7 h)' }],
        monto: liquidos(60000, 'turno'), cupos: { left: 3, total: 4 }, lugar: 'a 18 km · Las Condes', estado: 'Activa',
        bloques: [{ id: 'ano-nuevo-jue-31', weekday: 'jue', day: 31, month: 'dic', time: '21:00–04:00', duration: '7 h', cupos: { left: 3, total: 4 } }],
        detalle: {
            subtitulo: 'Terraza del Hotel Andino', // no está en el prototipo
            contratacion: BOLETA,
            filasTitulo: 'Detalle del turno',
            filas: [
                { label: 'Punto de encuentro', value: 'Metro Manquehue · la dirección exacta se muestra al confirmar' }, // no está en el prototipo
                { label: 'Vestimenta', value: 'Camisa, pantalón y zapatos negros' }, // no está en el prototipo
                { label: 'Nota de la organización', value: 'Barra de cócteles para 300 personas. Hay cena para el equipo.' }, // no está en el prototipo
            ],
            requisitos: [NOTA_MINIMA_MATIAS], // no está en el prototipo
            aviso: AVISO_TURNO,
        },
    },
    {
        // ACT-02 de Matías, «Hoy en tu agenda» y TUR-01 (pago de TUR-01: $30.000).
        id: 'turno-garzones-coctel-corporativo', tipo: 'turno', titulo: 'Garzones para cóctel corporativo',
        autor: autorOrg(ORGS.banqueteria),
        tags: [{ kind: 'fecha', text: 'hoy · 19:00–00:00 (5 h)' }],
        monto: liquidos(30000, 'turno'),
        cupos: { left: 0, total: 6 }, // no está en el prototipo
        lugar: 'a 14 km · Providencia', // no está en el prototipo (la comuna sí)
        estado: 'Activa',
        bloques: [{ id: 'coctel-jue-10', weekday: 'jue', day: 10, month: 'dic', time: '19:00–00:00', duration: 'Hoy · 5 h', cupos: { left: 0, total: 6 } }],
        detalle: {
            subtitulo: 'Oficinas en Providencia', // no está en el prototipo
            contratacion: BOLETA,
            filasTitulo: 'Detalle del turno',
            filas: [
                { label: 'Punto de encuentro', value: 'Metro Pedro de Valdivia · la dirección exacta se muestra al confirmar' }, // no está en el prototipo
                VESTIMENTA_GARZON,
                { label: 'Nota de la organización', value: 'Llega 15 minutos antes. Hay colación para el equipo.' }, // no está en el prototipo
            ],
            requisitos: [NOTA_MINIMA_MATIAS], // no está en el prototipo
            aviso: AVISO_TURNO,
        },
    },
    {
        // INI-02 y NOT-01: «Turno vie 11 dic · 12:00: faltan 2 garzones». Título y detalle: no están en el prototipo.
        id: 'turno-garzones-almuerzo', tipo: 'turno', titulo: 'Garzones para almuerzo de empresa',
        autor: autorOrg(ORGS.banqueteria),
        tags: [{ kind: 'fecha', text: 'vie 11 dic · 12:00–17:00 (5 h)' }],
        monto: liquidos(30000, 'turno'), cupos: { left: 2, total: 6 }, lugar: 'Vitacura', estado: 'Activa',
        bloques: [{ id: 'almuerzo-vie-11', weekday: 'vie', day: 11, month: 'dic', time: '12:00–17:00', duration: '5 h', cupos: { left: 2, total: 6 } }],
        detalle: {
            subtitulo: 'Casa de eventos en Vitacura',
            contratacion: BOLETA,
            filasTitulo: 'Detalle del turno',
            filas: [
                { label: 'Punto de encuentro', value: 'Metro Escuela Militar · la dirección exacta se muestra al confirmar' },
                VESTIMENTA_GARZON,
            ],
            requisitos: [{ texto: 'Nota mínima 4,5' }],
            aviso: AVISO_TURNO,
        },
    },
    {
        // Flujo 4: PUBL-03 (pasos 1 a 4), PUBL-07, GES-01 y GES-04.
        id: 'turno-garzones-finde', tipo: 'turno', titulo: 'Garzones fin de semana',
        autor: autorOrg(ORGS.banqueteria),
        tags: [
            { kind: 'fecha', text: 'sáb 19 dic · 18:00–00:00 (6 h)' },
            { kind: 'fecha', text: 'dom 20 dic · 13:00–18:00 (5 h)' },
        ],
        monto: liquidos(35000, 'turno'), cupos: { left: 12, total: 12 }, lugar: 'San Miguel', estado: 'Activa',
        bloques: [
            { id: 'finde-sab-19', weekday: 'sáb', day: 19, month: 'dic', time: '18:00–00:00', duration: '6 h', cupos: { left: 8, total: 8 } },
            { id: 'finde-dom-20', weekday: 'dom', day: 20, month: 'dic', time: '13:00–18:00', duration: '5 h', cupos: { left: 4, total: 4 } },
        ],
        detalle: {
            contratacion: BOLETA,
            filasTitulo: 'Detalle del turno',
            filas: [{ label: 'Punto de encuentro', value: 'Metro San Miguel' }, VESTIMENTA_GARZON],
            requisitos: [{ texto: 'Teléfono verificado' }, { texto: 'Nota mínima 4,5' }],
            aviso: AVISO_TURNO,
        },
    },
    {
        // El turno del sáb 5 dic (PUBL-03: plantilla «Garzones fin de semana», REV-01, MSG-01 de Matías, INI-02).
        // Horario, cupos y detalle: no están en el prototipo.
        id: 'turno-garzones-finde-5dic', tipo: 'turno', titulo: 'Garzones fin de semana',
        autor: autorOrg(ORGS.banqueteria),
        tags: [{ kind: 'fecha', text: 'sáb 5 dic · 18:00–00:00 (6 h)' }],
        monto: liquidos(35000, 'turno'), cupos: { left: 0, total: 7 }, lugar: 'San Miguel', estado: 'Cerrada',
        bloques: [{ id: 'finde-sab-5', weekday: 'sáb', day: 5, month: 'dic', time: '18:00–00:00', duration: '6 h', cupos: { left: 0, total: 7 } }],
        detalle: {
            contratacion: BOLETA,
            filasTitulo: 'Detalle del turno',
            filas: [{ label: 'Punto de encuentro', value: 'Metro San Miguel' }, VESTIMENTA_GARZON],
            requisitos: [{ texto: 'Teléfono verificado' }, { texto: 'Nota mínima 4,5' }],
            aviso: AVISO_TURNO,
        },
    },
    {
        // ACT-02 de Jorge: «Guardia de eventos · Banquetería Rosa SpA · sáb 19 dic · 19:00–03:00 · En lista de espera».
        // Monto, cupos y detalle: no están en el prototipo.
        id: 'turno-guardia-eventos-19dic', tipo: 'turno', titulo: 'Guardia de eventos',
        autor: autorOrg(ORGS.banqueteria),
        tags: [{ kind: 'fecha', text: 'sáb 19 dic · 19:00–03:00 (8 h)' }],
        monto: liquidos(40000, 'turno'), cupos: { left: 0, total: 4 }, lugar: 'a 14 km · San Miguel', estado: 'Activa',
        bloques: [{ id: 'guardia-sab-19', weekday: 'sáb', day: 19, month: 'dic', time: '19:00–03:00', duration: '8 h', cupos: { left: 0, total: 4 } }],
        detalle: {
            subtitulo: 'Matrimonio en San Miguel',
            contratacion: BOLETA,
            filasTitulo: 'Detalle del turno',
            filas: [
                { label: 'Punto de encuentro', value: 'Metro San Miguel · la dirección exacta se muestra al confirmar' },
                { label: 'Vestimenta', value: 'Traje oscuro y zapatos negros' },
            ],
            requisitos: [SPD_JORGE],
            aviso: AVISO_TURNO,
        },
    },
    {
        // ACT-02 de Jorge (Confirmado) y «Nuevos matches» de MSG-01. Monto, cupos y detalle: no están en el prototipo.
        id: 'turno-guardia-eventos-12dic', tipo: 'turno', titulo: 'Guardia de eventos',
        autor: autorOrg(ORGS.puntoActivo),
        tags: [{ kind: 'fecha', text: 'sáb 12 dic · 18:00–02:00 (8 h)' }],
        monto: liquidos(40000, 'turno'), cupos: { left: 1, total: 10 }, lugar: 'a 17 km · Santiago', estado: 'Activa',
        bloques: [{ id: 'eventos-sab-12', weekday: 'sáb', day: 12, month: 'dic', time: '18:00–02:00', duration: '8 h', cupos: { left: 1, total: 10 } }],
        detalle: {
            subtitulo: 'Recital en Santiago',
            contratacion: BOLETA,
            filasTitulo: 'Detalle del turno',
            filas: [
                { label: 'Punto de encuentro', value: 'Metro Rondizzoni · la dirección exacta se muestra al confirmar' },
                { label: 'Vestimenta', value: 'Pantalón y zapatos negros. Entregamos chaqueta y credencial del evento.' },
            ],
            requisitos: [SPD_JORGE],
            aviso: AVISO_TURNO,
        },
    },
    {
        // ACT-02 de Jorge (Postulado). Monto, cupos y detalle: no están en el prototipo.
        id: 'turno-guardia-eventos-20dic', tipo: 'turno', titulo: 'Guardia de eventos',
        autor: autorOrg(ORGS.puntoActivo),
        tags: [{ kind: 'fecha', text: 'dom 20 dic · 11:00–19:00 (8 h)' }],
        monto: liquidos(40000, 'turno'), cupos: { left: 4, total: 10 }, lugar: 'a 17 km · Santiago', estado: 'Activa',
        bloques: [{ id: 'eventos-dom-20', weekday: 'dom', day: 20, month: 'dic', time: '11:00–19:00', duration: '8 h', cupos: { left: 4, total: 10 } }],
        detalle: {
            subtitulo: 'Feria de diseño en Santiago',
            contratacion: BOLETA,
            filasTitulo: 'Detalle del turno',
            filas: [
                { label: 'Punto de encuentro', value: 'Metro Rondizzoni · la dirección exacta se muestra al confirmar' },
                { label: 'Vestimenta', value: 'Pantalón y zapatos negros. Entregamos chaqueta y credencial del evento.' },
            ],
            requisitos: [SPD_JORGE],
            aviso: AVISO_TURNO,
        },
    },
    {
        // ACT-02 de Matías e INI-01 («Hotel Andino vio tu postulación · Garzón · vie 18 dic»).
        // Monto, cupos y detalle: no están en el prototipo.
        id: 'turno-garzones-cena-fin-de-ano', tipo: 'turno', titulo: 'Garzones para cena de fin de año',
        autor: autorOrg(ORGS.hotelAndino),
        tags: [{ kind: 'fecha', text: 'vie 18 dic · 20:00–01:00 (5 h)' }],
        monto: liquidos(35000, 'turno'), cupos: { left: 4, total: 10 }, lugar: 'a 18 km · Las Condes', estado: 'Activa',
        bloques: [{ id: 'cena-vie-18', weekday: 'vie', day: 18, month: 'dic', time: '20:00–01:00', duration: '5 h', cupos: { left: 4, total: 10 } }],
        detalle: {
            subtitulo: 'Salón principal del Hotel Andino',
            contratacion: BOLETA,
            filasTitulo: 'Detalle del turno',
            filas: [
                { label: 'Punto de encuentro', value: 'Metro Manquehue · la dirección exacta se muestra al confirmar' },
                VESTIMENTA_GARZON,
                { label: 'Nota de la organización', value: 'Cena de fin de año de una empresa, para 150 personas.' },
            ],
            requisitos: [NOTA_MINIMA_MATIAS],
            aviso: AVISO_TURNO,
        },
    },
    {
        // no está en el prototipo: un turno de guardia más para Explorar e Inicio de Jorge.
        id: 'turno-guardia-feria-navidena', tipo: 'turno', titulo: 'Guardia de eventos · Feria navideña',
        autor: autorOrg(ORGS.puntoActivo),
        tags: [{ kind: 'fecha', text: 'mié 23 dic · 10:00–20:00 (10 h)' }],
        monto: liquidos(45000, 'turno'), cupos: { left: 4, total: 6 }, lugar: 'a 6 km · La Florida', estado: 'Activa',
        bloques: [{ id: 'feria-mie-23', weekday: 'mié', day: 23, month: 'dic', time: '10:00–20:00', duration: '10 h', cupos: { left: 4, total: 6 } }],
        detalle: {
            subtitulo: 'Feria navideña en La Florida',
            contratacion: BOLETA,
            filasTitulo: 'Detalle del turno',
            filas: [
                { label: 'Punto de encuentro', value: 'Metro Mirador · la dirección exacta se muestra al confirmar' },
                { label: 'Vestimenta', value: 'Pantalón y zapatos negros. Entregamos chaqueta y credencial del evento.' },
            ],
            requisitos: [SPD_JORGE],
            aviso: AVISO_TURNO,
        },
    },

    // ── Empleos ──
    {
        // EXP-01 en lista (Jorge), DET-01-empleo, DET-02, PRC-01 y MSG-02.
        id: 'empleo-guardia-4x4', tipo: 'empleo', titulo: 'Guardia de seguridad 4x4',
        autor: autorOrg(ORGS.seguridadAndes),
        tags: [
            { kind: 'jornada', text: 'Jornada completa' },
            { kind: 'contrato', text: 'Plazo fijo' },
            { kind: 'fecha', text: 'Turno de noche' },
        ],
        monto: liquidos(650000, 'mes'), lugar: 'a 4 km · Puente Alto', estado: 'Activa',
        detalle: {
            descripcion:
                'Buscamos guardia para un condominio de casas en Puente Alto. Control de acceso, rondas y registro de visitas. Entregamos uniforme y radio.',
            filas: [
                { label: 'Sistema de turno', value: '4x4 · 4 días de 08:00 a 20:00 y 4 noches de 20:00 a 08:00' },
                { label: 'Lugar de trabajo', value: 'Puente Alto · la dirección exacta se comparte en la entrevista' },
            ],
            requisitos: [SPD_JORGE, { texto: '1 a 3 años de experiencia', paraTi: EXPERIENCIA_JORGE }],
            beneficios: BENEFICIOS,
            sobreOrganizacion: 'Seguridad · Puente Alto · 50 a 199 trabajadores',
            aviso: AVISO_EMPLEO,
            postular: { pregunta: '¿Tienes disponibilidad para turnos de noche?', pideCv: true },
        },
    },
    {
        // Tarjeta: EXP-01 en lista. Detalle: no está en el prototipo.
        id: 'empleo-conserje', tipo: 'empleo', titulo: 'Conserje',
        autor: autorOrg(ORGS.losPeumos),
        tags: [{ kind: 'jornada', text: 'Jornada completa' }, { kind: 'contrato', text: 'Indefinido' }],
        monto: liquidos(600000, 'mes'), lugar: 'a 2 km · Puente Alto', estado: 'Activa',
        detalle: {
            descripcion: 'Buscamos conserje para un edificio de 80 departamentos: recepción de visitas y encomiendas, rondas y apoyo a la administración.', // no está en el prototipo
            filas: [
                { label: 'Sistema de turno', value: '5x2 · de 08:00 a 17:00' }, // no está en el prototipo
                { label: 'Lugar de trabajo', value: 'Puente Alto · la dirección exacta se comparte en la entrevista' },
            ],
            requisitos: [{ texto: '1 a 3 años de experiencia', paraTi: EXPERIENCIA_JORGE }], // no está en el prototipo
            beneficios: ['Colación', 'Movilización'], // no está en el prototipo
            sobreOrganizacion: 'Administración de edificios · Puente Alto · 1 a 9 trabajadores', // no está en el prototipo
            aviso: AVISO_EMPLEO,
            postular: { pideCv: false },
        },
    },
    {
        // Tarjeta: EXP-01 en lista. Detalle: no está en el prototipo.
        id: 'empleo-supervisor-seguridad', tipo: 'empleo', titulo: 'Supervisor/a de seguridad',
        autor: autorOrg(ORGS.proteccionIntegral),
        tags: [{ kind: 'jornada', text: 'Jornada completa' }, { kind: 'contrato', text: 'Indefinido' }],
        monto: liquidos(850000, 'mes'), lugar: 'a 7 km · La Florida', estado: 'Activa',
        detalle: {
            descripcion: 'Supervisa a un equipo de 12 guardias en tres condominios de La Florida: turnos, rondas y reportes diarios.', // no está en el prototipo
            filas: [
                { label: 'Horario', value: 'Lunes a viernes de 08:00 a 18:00' }, // no está en el prototipo
                { label: 'Lugar de trabajo', value: 'La Florida · la dirección exacta se comparte en la entrevista' },
            ],
            requisitos: [SPD_JORGE, { texto: '5 a 10 años de experiencia', paraTi: EXPERIENCIA_JORGE }], // no está en el prototipo
            beneficios: BENEFICIOS, // no está en el prototipo
            sobreOrganizacion: 'Seguridad · La Florida · 50 a 199 trabajadores', // no está en el prototipo
            aviso: AVISO_EMPLEO,
            postular: { pideCv: true },
        },
    },
    {
        // Flujo 3: EXP-01 (deck), DET-01-empleo-pedro, DET-02-pedro, PRC-01-pedro y MSG-02-pedro.
        id: 'empleo-mecanico-automotriz', tipo: 'empleo', titulo: 'Mecánico/a automotriz',
        autor: autorOrg(ORGS.tallerLosAromos),
        tags: [
            { kind: 'jornada', text: 'Jornada completa' },
            { kind: 'contrato', text: 'Indefinido' },
            { kind: 'modalidad', text: 'Presencial' },
        ],
        monto: liquidos(750000, 'mes'), lugar: 'a 2 km · Macul', porQue: 'calza con tu oficio y está a 2 km', estado: 'Activa',
        detalle: {
            descripcion:
                'Buscamos mecánico/a para mantención y reparación de autos livianos: frenos, suspensión, afinamiento y diagnóstico con escáner. Entregamos uniforme y herramientas.',
            filas: [
                { label: 'Horario', value: 'Lunes a viernes de 08:30 a 17:30' },
                { label: 'Lugar de trabajo', value: 'Macul · la dirección exacta se comparte en la entrevista' },
            ],
            requisitos: [{ texto: '3 a 5 años de experiencia', paraTi: { texto: 'Tienes 5 a 10 años de experiencia', cumple: true } }],
            beneficios: BENEFICIOS,
            sobreOrganizacion: 'Automotriz · Macul · 10 a 49 trabajadores',
            aviso: AVISO_EMPLEO,
            postular: { pregunta: '¿Tienes experiencia con escáner de diagnóstico?', pideCv: true },
        },
    },
    {
        // ACT-02 de Jorge (En proceso) y «Nuevos matches» de MSG-01 («Empleo · Guardia turno de noche»).
        // Tags, monto y detalle: no están en el prototipo.
        id: 'empleo-guardia-noche-hotel-andino', tipo: 'empleo', titulo: 'Guardia de seguridad, turno de noche',
        autor: autorOrg(ORGS.hotelAndino),
        tags: [
            { kind: 'jornada', text: 'Jornada completa' },
            { kind: 'contrato', text: 'Indefinido' },
            { kind: 'fecha', text: 'Turno de noche' },
        ],
        monto: liquidos(700000, 'mes'), lugar: 'a 22 km · Las Condes', estado: 'Activa',
        detalle: {
            descripcion: 'Buscamos guardia para el turno de noche del hotel: control de acceso, rondas y apoyo a recepción.',
            filas: [
                { label: 'Sistema de turno', value: '5x2 · de noche, de 22:00 a 07:00' },
                { label: 'Lugar de trabajo', value: 'Las Condes · la dirección exacta se comparte en la entrevista' },
            ],
            requisitos: [SPD_JORGE, { texto: '3 a 5 años de experiencia', paraTi: EXPERIENCIA_JORGE }],
            beneficios: BENEFICIOS,
            sobreOrganizacion: 'Hotelería · Las Condes · 50 a 199 trabajadores',
            aviso: AVISO_EMPLEO,
            postular: { pideCv: false },
        },
    },
    {
        // ACT-02 de Jorge (Visto). Tags, monto y detalle: no están en el prototipo.
        id: 'empleo-guardia-colegio', tipo: 'empleo', titulo: 'Guardia de seguridad',
        autor: autorOrg(ORGS.colegioSanEsteban),
        tags: [{ kind: 'jornada', text: 'Jornada completa' }, { kind: 'contrato', text: 'Plazo fijo' }],
        monto: liquidos(620000, 'mes'), lugar: 'a 15 km · Ñuñoa', estado: 'Activa',
        detalle: {
            descripcion: 'Control de acceso en la entrada del colegio y rondas en horario de clases.',
            filas: [
                { label: 'Horario', value: 'Lunes a viernes de 07:00 a 16:00' },
                { label: 'Lugar de trabajo', value: 'Ñuñoa · la dirección exacta se comparte en la entrevista' },
            ],
            requisitos: [SPD_JORGE],
            beneficios: ['Colación'],
            sobreOrganizacion: 'Educación · Ñuñoa · 50 a 199 trabajadores',
            aviso: AVISO_EMPLEO,
            postular: { pideCv: false },
        },
    },
    {
        // ACT-02 de Jorge (No seleccionado) y MSG-01 (3 dic). Tags, monto y detalle: no están en el prototipo.
        id: 'empleo-supervisor-guardias', tipo: 'empleo', titulo: 'Supervisor/a de guardias',
        autor: autorOrg(ORGS.seguridadAndes),
        tags: [{ kind: 'jornada', text: 'Jornada completa' }, { kind: 'contrato', text: 'Indefinido' }],
        monto: liquidos(800000, 'mes'), lugar: 'a 4 km · Puente Alto', estado: 'Cerrada',
        detalle: {
            descripcion: 'Supervisa los turnos 4x4 de nuestros condominios en Puente Alto.',
            filas: [{ label: 'Lugar de trabajo', value: 'Puente Alto · la dirección exacta se comparte en la entrevista' }],
            requisitos: [SPD_JORGE, { texto: '5 a 10 años de experiencia', paraTi: EXPERIENCIA_JORGE }],
            beneficios: BENEFICIOS,
            sobreOrganizacion: 'Seguridad · Puente Alto · 50 a 199 trabajadores',
            aviso: AVISO_EMPLEO,
            postular: { pideCv: true },
        },
    },
    {
        // no está en el prototipo: segunda tarjeta del deck de Pedro.
        id: 'empleo-mantencion-flota', tipo: 'empleo', titulo: 'Mecánico/a de mantención de flota',
        autor: autorOrg(ORGS.transportesCordillera),
        tags: [
            { kind: 'jornada', text: 'Jornada completa' },
            { kind: 'contrato', text: 'Indefinido' },
            { kind: 'modalidad', text: 'Presencial' },
        ],
        monto: liquidos(820000, 'mes'), lugar: 'a 4 km · San Joaquín', porQue: 'calza con tu oficio y está a 4 km', estado: 'Activa',
        detalle: {
            descripcion: 'Mantención preventiva de una flota de 40 camionetas: cambios de aceite, frenos y revisión técnica.',
            filas: [
                { label: 'Horario', value: 'Lunes a viernes de 08:00 a 17:00' },
                { label: 'Lugar de trabajo', value: 'San Joaquín · la dirección exacta se comparte en la entrevista' },
            ],
            requisitos: [{ texto: '5 a 10 años de experiencia', paraTi: { texto: 'Tienes 5 a 10 años de experiencia', cumple: true } }],
            beneficios: BENEFICIOS,
            sobreOrganizacion: 'Transporte · San Joaquín · 50 a 199 trabajadores',
            aviso: AVISO_EMPLEO,
            postular: { pideCv: true },
        },
    },
    {
        // no está en el prototipo: tercera tarjeta del deck de Pedro.
        id: 'empleo-electromecanico', tipo: 'empleo', titulo: 'Electromecánico/a automotriz',
        autor: autorOrg(ORGS.automotoraDelSur),
        tags: [
            { kind: 'jornada', text: 'Jornada completa' },
            { kind: 'contrato', text: 'Plazo fijo' },
            { kind: 'modalidad', text: 'Presencial' },
        ],
        monto: liquidos(780000, 'mes'), lugar: 'a 6 km · La Florida', porQue: 'calza con tu oficio y está a 6 km', estado: 'Activa',
        detalle: {
            descripcion: 'Diagnóstico eléctrico y electrónico de autos livianos en el taller de la automotora.',
            filas: [
                { label: 'Horario', value: 'Lunes a viernes de 09:00 a 18:00 y sábados de 09:00 a 13:00' },
                { label: 'Lugar de trabajo', value: 'La Florida · la dirección exacta se comparte en la entrevista' },
            ],
            requisitos: [{ texto: '3 a 5 años de experiencia', paraTi: { texto: 'Tienes 5 a 10 años de experiencia', cumple: true } }],
            beneficios: ['Colación', 'Bono de asistencia'],
            sobreOrganizacion: 'Automotriz · La Florida · 10 a 49 trabajadores',
            aviso: AVISO_EMPLEO,
            postular: { pregunta: '¿Tienes experiencia con escáner de diagnóstico?', pideCv: true },
        },
    },
    {
        // INI-02 y NOT-01: «5 postulantes sin revisar en Bartender». Tags, monto y detalle: no están en el prototipo.
        id: 'empleo-bartender', tipo: 'empleo', titulo: 'Bartender',
        autor: autorOrg(ORGS.banqueteria),
        tags: [{ kind: 'jornada', text: 'Part time' }, { kind: 'contrato', text: 'Plazo fijo' }],
        monto: liquidos(480000, 'mes'), lugar: 'San Miguel', estado: 'Activa',
        detalle: {
            descripcion: 'Buscamos bartender para la barra de nuestros eventos de jueves a sábado: cócteles, montaje y orden de la barra.',
            filas: [
                { label: 'Horario', value: 'Jueves a sábado de 19:00 a 02:00' },
                { label: 'Lugar de trabajo', value: 'Eventos en Santiago · te avisamos el lugar de cada semana' },
            ],
            requisitos: [{ texto: '1 a 3 años de experiencia' }],
            beneficios: ['Colación', 'Movilización'],
            sobreOrganizacion: 'Gastronomía y eventos · San Miguel · 10 a 49 trabajadores',
            aviso: AVISO_EMPLEO,
            postular: { pideCv: false },
        },
    },
    {
        // Flujo 5: el aviso de Carolina (PUBL-04 pasos 1 a 5, INI-01-carolina, GES-02-hogar, PRC-01-hogar).
        id: 'aviso-asesor-hogar', tipo: 'empleo', titulo: 'Asesor/a del hogar puertas afuera',
        autor: autorOrg(ORGS.familiaNunoa),
        tags: [
            { kind: 'fecha', text: 'Lun a vie · 09:00–18:00' },
            // En el prototipo lleva un ícono de casa; InfoTag no tiene ese tipo de dato.
            { kind: 'modalidad', text: 'Puertas afuera' },
        ],
        monto: liquidos(600000, 'mes'), lugar: 'Ñuñoa', estado: 'Activa',
        detalle: {
            // no está en el prototipo como texto: sale de las tareas marcadas en PUBL-04 paso 3.
            descripcion: 'Aseo, cocina, lavado y planchado, y cuidado de niños. Ir a buscar al niño al colegio, a 4 cuadras de la casa.',
            filas: [
                { label: 'Días y horario', value: 'Lunes a viernes, de 09:00 a 18:00 · 1 hora de colación' },
                { label: 'Horas a la semana', value: '40 horas' },
                { label: 'Contexto del hogar', value: 'Hay niños' },
            ],
            requisitos: [{ texto: 'Certificado de inhabilidades vigente', obligatoria: true }],
            contratacion: { forma: 'Contrato de trabajo de casa particular' }, // no está en el prototipo
            aviso: AVISO_EMPLEO,
            postular: { pideCv: false }, // no está en el prototipo
        },
    },
];

// ─── Procesos (PRC-01) ──────────────────────────────────────────────────────

const ENTREVISTA_JORGE: DemoSystemCard = {
    tipo: 'entrevista', titulo: 'Entrevista', lineas: ['mar 15 dic · 10:00', 'Av. Concha y Toro 1234, Puente Alto'],
    accion: 'Agregar al calendario', disponible: true,
};

const ENTREVISTA_PEDRO: DemoSystemCard = {
    tipo: 'entrevista', titulo: 'Entrevista', lineas: ['lun 14 dic · 09:00', 'Av. Macul 4321, Macul'],
    accion: 'Agregar al calendario', disponible: true,
};

export const DEMO_PROCESSES: DemoProcess[] = [
    {
        // PRC-01 (Jorge).
        id: 'proc-jorge-guardia-4x4', viewerId: 'jorge', publicationId: 'empleo-guardia-4x4', appBarTitulo: 'Tu postulación',
        titulo: 'Guardia de seguridad 4x4', subtitulo: 'Seguridad Andes Ltda. · Puente Alto',
        contraparte: autorOrg(ORGS.seguridadAndes), estado: 'Entrevista',
        pasos: [
            { etapa: 'Postulado', estado: 'done', fecha: '7 dic · 21:14' },
            { etapa: 'Visto', estado: 'done', fecha: '8 dic · 09:40' },
            { etapa: 'En proceso', estado: 'done', fecha: '9 dic · 17:05' },
            { etapa: 'Entrevista', estado: 'current', fecha: 'mar 15 dic · 10:00' },
            { etapa: 'Oferta', estado: 'pending' },
            { etapa: 'Contratado', estado: 'pending' },
        ],
        entrevista: ENTREVISTA_JORGE, conversationId: 'conv-jorge-seguridad-andes', puedeRetirar: true,
    },
    {
        // PRC-01-pedro.
        id: 'proc-pedro-mecanico', viewerId: 'pedro', publicationId: 'empleo-mecanico-automotriz', appBarTitulo: 'Tu postulación',
        titulo: 'Mecánico/a automotriz', subtitulo: 'Taller Los Aromos · Macul',
        contraparte: autorOrg(ORGS.tallerLosAromos), estado: 'Entrevista',
        pasos: [
            { etapa: 'Postulado', estado: 'done', fecha: '10 dic · 13:01' },
            { etapa: 'Visto', estado: 'done', fecha: '10 dic · 16:20' },
            { etapa: 'En proceso', estado: 'done', fecha: '10 dic · 17:05' },
            { etapa: 'Entrevista', estado: 'current', fecha: 'lun 14 dic · 09:00' },
            { etapa: 'Oferta', estado: 'pending' },
            { etapa: 'Contratado', estado: 'pending' },
        ],
        entrevista: ENTREVISTA_PEDRO, conversationId: 'conv-pedro-taller', puedeRetirar: true,
    },
    {
        // PRC-01-hogar: el final del flujo 5 (Marta ya contratada, con el checklist legal).
        // GES-02 la muestra aún «En proceso»: son dos momentos del prototipo.
        id: 'proc-carolina-marta', viewerId: 'carolina', publicationId: 'aviso-asesor-hogar', appBarTitulo: 'Proceso',
        titulo: 'Marta Huanca', subtitulo: 'Asesor/a del hogar puertas afuera',
        contraparte: autorPersona(PERSONS.marta), estado: 'Contratado',
        pasos: [
            { etapa: 'Postulado', estado: 'done', fecha: '8 dic · 20:15' },
            { etapa: 'Visto', estado: 'done', fecha: '9 dic · 19:10' },
            { etapa: 'En proceso', estado: 'done', fecha: '9 dic · 19:20' },
            { etapa: 'Entrevista', estado: 'done', fecha: 'vie 11 dic · 10:00' },
            { etapa: 'Oferta', estado: 'done', fecha: 'vie 11 dic · 12:30' },
            { etapa: 'Contratado', estado: 'done', fecha: 'lun 14 dic · 09:15' },
        ],
        checklist: {
            titulo: 'Para contratar como corresponde',
            intro: 'Son los pasos que pide la ley para contratar a una trabajadora de casa particular.',
            pasos: [
                {
                    titulo: 'Firma el contrato por escrito',
                    detalle: 'Con los días, el horario, el sueldo y las tareas del aviso. Una copia para cada una.',
                    hecho: false,
                },
                {
                    titulo: 'Regístralo en la Dirección del Trabajo dentro de 15 días',
                    detalle: 'Se hace en línea con tu Clave Única.',
                    hecho: false,
                },
            ],
            enlace: 'Ir al sitio de la Dirección del Trabajo',
        },
        conversationId: 'conv-carolina-marta', puedeRetirar: false,
    },
    {
        // no está en el prototipo: PRC-01 de las otras postulaciones de Jorge (ACT-02).
        id: 'proc-jorge-guardia-noche', viewerId: 'jorge', publicationId: 'empleo-guardia-noche-hotel-andino',
        appBarTitulo: 'Tu postulación', titulo: 'Guardia de seguridad, turno de noche', subtitulo: 'Hotel Andino · Las Condes',
        contraparte: autorOrg(ORGS.hotelAndino), estado: 'En proceso',
        pasos: [
            { etapa: 'Postulado', estado: 'done', fecha: '3 dic · 22:10' },
            { etapa: 'Visto', estado: 'done', fecha: '4 dic · 09:30' },
            { etapa: 'En proceso', estado: 'current', fecha: 'hoy · 12:00' },
            { etapa: 'Entrevista', estado: 'pending' },
            { etapa: 'Oferta', estado: 'pending' },
            { etapa: 'Contratado', estado: 'pending' },
        ],
        conversationId: 'conv-jorge-hotel-andino', puedeRetirar: true,
    },
    {
        // no está en el prototipo.
        id: 'proc-jorge-guardia-colegio', viewerId: 'jorge', publicationId: 'empleo-guardia-colegio',
        appBarTitulo: 'Tu postulación', titulo: 'Guardia de seguridad', subtitulo: 'Colegio San Esteban · Ñuñoa',
        contraparte: autorOrg(ORGS.colegioSanEsteban), estado: 'Visto',
        pasos: [
            { etapa: 'Postulado', estado: 'done', fecha: '6 dic · 20:05' },
            { etapa: 'Visto', estado: 'current', fecha: '9 dic · 08:40' },
            { etapa: 'En proceso', estado: 'pending' },
            { etapa: 'Entrevista', estado: 'pending' },
            { etapa: 'Oferta', estado: 'pending' },
            { etapa: 'Contratado', estado: 'pending' },
        ],
        puedeRetirar: true,
    },
    {
        // no está en el prototipo. Cierre negativo: el último paso lleva el Badge y los que no van a pasar se quitan.
        id: 'proc-jorge-supervisor', viewerId: 'jorge', publicationId: 'empleo-supervisor-guardias',
        appBarTitulo: 'Tu postulación', titulo: 'Supervisor/a de guardias', subtitulo: 'Seguridad Andes Ltda. · Puente Alto',
        contraparte: autorOrg(ORGS.seguridadAndes), estado: 'No seleccionado',
        pasos: [
            { etapa: 'Postulado', estado: 'done', fecha: '25 nov · 19:30' },
            { etapa: 'Visto', estado: 'done', fecha: '26 nov · 10:05' },
            { etapa: 'En proceso', estado: 'done', fecha: '3 dic · 11:20', badge: 'No seleccionado' },
        ],
        conversationId: 'conv-jorge-supervisor', puedeRetirar: false,
    },
];

// ─── Postulaciones (ACT-02) y Mi turno (TUR-01) ─────────────────────────────

const TUR_MATIAS_COCTEL: DemoMyShift = {
    // TUR-01.
    titulo: 'Garzones para cóctel corporativo', comuna: 'Providencia', estado: 'Confirmado',
    bloque: { id: 'coctel-jue-10', weekday: 'jue', day: 10, month: 'dic', time: '19:00–00:00', duration: 'Hoy · 5 h' },
    filas: [
        { label: 'Dirección exacta', value: 'Av. Providencia 1650, Providencia · entrada de servicio' },
        { label: 'Hora de llegada', value: '18:45' },
        { label: 'Encargada del turno', value: 'Rosa Muñoz' },
        VESTIMENTA_GARZON,
        { label: 'Pago', monto: liquidos(30000, 'turno'), detalle: 'te paga Banquetería Rosa SpA directamente' },
    ],
    confirmacion: {
        titulo: 'Confirmo asistencia',
        texto: 'Te lo pedimos 24 h y 2 h antes del turno, para que la organización sepa que vas.',
        pasos: [
            { texto: '24 h antes · confirmaste ayer a las 19:04', hecho: true },
            { texto: '2 h antes · hoy a las 17:00', hecho: false },
        ],
    },
    conversationId: 'conv-matias-coctel',
};

// no está en el prototipo: TUR-01 del turno confirmado de Jorge.
const TUR_JORGE_EVENTOS: DemoMyShift = {
    titulo: 'Guardia de eventos', comuna: 'Santiago', estado: 'Confirmado',
    bloque: { id: 'eventos-sab-12', weekday: 'sáb', day: 12, month: 'dic', time: '18:00–02:00', duration: '8 h' },
    filas: [
        { label: 'Dirección exacta', value: 'Av. Rondizzoni 2100, Santiago · acceso de personal' },
        { label: 'Hora de llegada', value: '17:30' },
        { label: 'Encargado del turno', value: 'Claudio Pizarro' },
        { label: 'Vestimenta', value: 'Pantalón y zapatos negros. Entregamos chaqueta y credencial del evento.' },
        { label: 'Pago', monto: liquidos(40000, 'turno'), detalle: 'te paga Punto Activo Eventos Ltda. directamente' },
    ],
    confirmacion: {
        titulo: 'Confirmo asistencia',
        texto: 'Te lo pedimos 24 h y 2 h antes del turno, para que la organización sepa que vas.',
        pasos: [
            { texto: '24 h antes · el vie 11 dic a las 18:00', hecho: false },
            { texto: '2 h antes · el sáb 12 dic a las 16:00', hecho: false },
        ],
    },
    conversationId: 'conv-jorge-punto-activo-12dic',
};

export const DEMO_APPLICATIONS: DemoApplication[] = [
    // ACT-02 de Jorge (ACT-02 y ACT-02-jorge).
    {
        id: 'app-jorge-guardia-4x4', actorId: 'jorge', publicationId: 'empleo-guardia-4x4', tipo: 'empleo',
        titulo: 'Guardia de seguridad 4x4', autor: autorOrg(ORGS.seguridadAndes),
        detalle: 'Seguridad Andes Ltda. · entrevista mar 15 dic · 10:00', estado: 'Entrevista', processId: 'proc-jorge-guardia-4x4',
    },
    {
        id: 'app-jorge-guardia-noche', actorId: 'jorge', publicationId: 'empleo-guardia-noche-hotel-andino', tipo: 'empleo',
        titulo: 'Guardia de seguridad, turno de noche', autor: autorOrg(ORGS.hotelAndino),
        detalle: 'Hotel Andino · Las Condes', estado: 'En proceso', processId: 'proc-jorge-guardia-noche',
    },
    {
        id: 'app-jorge-guardia-colegio', actorId: 'jorge', publicationId: 'empleo-guardia-colegio', tipo: 'empleo',
        titulo: 'Guardia de seguridad', autor: autorOrg(ORGS.colegioSanEsteban),
        detalle: 'Colegio San Esteban · Ñuñoa', estado: 'Visto', processId: 'proc-jorge-guardia-colegio',
    },
    {
        id: 'app-jorge-supervisor', actorId: 'jorge', publicationId: 'empleo-supervisor-guardias', tipo: 'empleo',
        titulo: 'Supervisor/a de guardias', autor: autorOrg(ORGS.seguridadAndes),
        detalle: 'Seguridad Andes Ltda. · Puente Alto', estado: 'No seleccionado', processId: 'proc-jorge-supervisor',
    },
    {
        id: 'app-jorge-eventos-12dic', actorId: 'jorge', publicationId: 'turno-guardia-eventos-12dic', tipo: 'turno',
        titulo: 'Guardia de eventos', autor: autorOrg(ORGS.puntoActivo),
        detalle: 'Punto Activo Eventos Ltda. · sáb 12 dic · 18:00–02:00', estado: 'Confirmado', miTurno: TUR_JORGE_EVENTOS,
    },
    {
        id: 'app-jorge-eventos-19dic', actorId: 'jorge', publicationId: 'turno-guardia-eventos-19dic', tipo: 'turno',
        titulo: 'Guardia de eventos', autor: autorOrg(ORGS.banqueteria),
        detalle: 'Banquetería Rosa SpA · sáb 19 dic · 19:00–03:00', estado: 'En lista de espera',
    },
    {
        id: 'app-jorge-eventos-20dic', actorId: 'jorge', publicationId: 'turno-guardia-eventos-20dic', tipo: 'turno',
        titulo: 'Guardia de eventos', autor: autorOrg(ORGS.puntoActivo),
        detalle: 'Punto Activo Eventos Ltda. · dom 20 dic · 11:00–19:00', estado: 'Postulado',
    },
    // ACT-02 de Matías.
    {
        id: 'app-matias-coctel', actorId: 'matias', publicationId: 'turno-garzones-coctel-corporativo', tipo: 'turno',
        titulo: 'Garzones para cóctel corporativo', autor: autorOrg(ORGS.banqueteria),
        detalle: 'Banquetería Rosa SpA · jue 10 dic · 19:00–00:00', estado: 'Confirmado', miTurno: TUR_MATIAS_COCTEL,
    },
    {
        id: 'app-matias-matrimonio', actorId: 'matias', publicationId: 'turno-garzones-matrimonio', tipo: 'turno',
        titulo: 'Garzones para matrimonio', autor: autorOrg(ORGS.banqueteria),
        detalle: 'Banquetería Rosa SpA · sáb 12 dic · 18:00–00:00', estado: 'Postulado',
    },
    {
        id: 'app-matias-cena', actorId: 'matias', publicationId: 'turno-garzones-cena-fin-de-ano', tipo: 'turno',
        titulo: 'Garzones para cena de fin de año', autor: autorOrg(ORGS.hotelAndino),
        detalle: 'Hotel Andino · vie 18 dic · 20:00–01:00', estado: 'Postulado',
    },
    // Pedro (flujo 3). La fila de ACT-02 no está en el prototipo: sigue el formato de la de Jorge.
    {
        id: 'app-pedro-mecanico', actorId: 'pedro', publicationId: 'empleo-mecanico-automotriz', tipo: 'empleo',
        titulo: 'Mecánico/a automotriz', autor: autorOrg(ORGS.tallerLosAromos),
        detalle: 'Taller Los Aromos · entrevista lun 14 dic · 09:00', estado: 'Entrevista', processId: 'proc-pedro-mecanico',
    },
];

// ─── Conversaciones (MSG-01, MSG-02) ────────────────────────────────────────

const CON_ORG = (o: DemoOrg): DemoConversation['con'] => ({
    ...autorOrg(o),
    linea: o.tipo === 'hogar' ? `Hogar · ${o.comuna}` : o.verificada ? 'Organización verificada' : o.comuna,
});

const CON_PERSONA = (p: DemoPerson): DemoConversation['con'] => ({
    ...autorPersona(p),
    linea: [p.oficio, p.comuna].filter(Boolean).join(' · '),
});

const CERTIFICADO_MARTA: DemoSystemCard = {
    tipo: 'certificado', titulo: 'Certificado de antecedentes',
    lineas: ['Emitido el 30-11-2026', 'Subido por ti, sin verificar', 'Disponible hasta el jue 17 dic', 'Visto por Familia en Ñuñoa · hace 2 h'],
    accion: 'Dejar de compartir', disponible: true,
};

const CERTIFICADO_FAMILIA: DemoSystemCard = {
    tipo: 'certificado', titulo: 'Certificado de antecedentes',
    lineas: ['Emitido el 30-11-2026', 'Documento subido por la persona, sin verificar', 'Disponible hasta el jue 17 dic'],
    accion: 'Ver', disponible: true,
};

export const DEMO_CONVERSATIONS: DemoConversation[] = [
    // ── Matías (MSG-01) ──
    {
        id: 'conv-matias-coctel', viewerId: 'matias', con: CON_ORG(ORGS.banqueteria),
        contexto: { tipo: 'turno', texto: 'Turno · Garzón · hoy', chip: 'Turno · Garzones para cóctel corporativo', publicationId: 'turno-garzones-coctel-corporativo' },
        vistaPrevia: 'Te esperamos a las 18:45 en la entrada de servicio.', cuando: 'hace 5 min', sinLeer: 3, nuevoMatch: false,
        // Solo el último mensaje está en el prototipo; el resto sigue TUR-01 («confirmaste ayer a las 19:04»).
        mensajes: [
            { id: 'm1', dia: 'Ayer', tipo: 'texto', de: 'otro', texto: 'Hola, Matías. ¿Confirmas que vienes mañana al cóctel corporativo?', hora: '18:30' }, // no está en el prototipo
            { id: 'm2', dia: 'Ayer', tipo: 'texto', de: 'yo', texto: 'Sí, confirmo. Ahí estaré.', hora: '19:04', estado: 'Leído' }, // no está en el prototipo
            { id: 'm3', dia: 'Hoy', tipo: 'texto', de: 'otro', texto: 'Hola, Matías. Hoy somos 6 garzones para el cóctel.', hora: '12:40' }, // no está en el prototipo
            { id: 'm4', dia: 'Hoy', tipo: 'texto', de: 'otro', texto: 'Lleva camisa blanca, pantalón y zapatos negros.', hora: '12:50' }, // no está en el prototipo
            { id: 'm5', dia: 'Hoy', tipo: 'texto', de: 'otro', texto: 'Te esperamos a las 18:45 en la entrada de servicio.', hora: '12:55' },
        ],
    },
    {
        id: 'conv-matias-5dic', viewerId: 'matias', con: CON_ORG(ORGS.banqueteria),
        contexto: { tipo: 'turno', texto: 'Turno · Garzón · 5 dic', chip: 'Turno · Garzones fin de semana', publicationId: 'turno-garzones-finde-5dic' },
        vistaPrevia: 'Gracias por venir. Ya te evaluamos.', cuando: '5 dic', sinLeer: 0, nuevoMatch: false,
        mensajes: [
            { id: 'm1', dia: '5 dic', tipo: 'texto', de: 'yo', texto: 'Gracias por todo, fue un buen turno.', hora: '23:40', estado: 'Leído' }, // no está en el prototipo
            { id: 'm2', dia: '5 dic', tipo: 'texto', de: 'otro', texto: 'Gracias por venir. Ya te evaluamos.', hora: '23:55' },
        ],
    },

    // ── Jorge (MSG-01-jorge, MSG-02) ──
    {
        id: 'conv-jorge-hotel-andino', viewerId: 'jorge', con: CON_ORG(ORGS.hotelAndino),
        contexto: { tipo: 'empleo', texto: 'Empleo · Guardia turno de noche', chip: 'Empleo · Guardia de seguridad, turno de noche', publicationId: 'empleo-guardia-noche-hotel-andino' },
        vistaPrevia: null, cuando: null, sinLeer: 0, nuevoMatch: true, mensajes: [],
    },
    {
        id: 'conv-jorge-punto-activo-12dic', viewerId: 'jorge', con: CON_ORG(ORGS.puntoActivo),
        contexto: { tipo: 'turno', texto: 'Turno · Guardia de eventos · sáb 12 dic', chip: 'Turno · Guardia de eventos · sáb 12 dic', publicationId: 'turno-guardia-eventos-12dic' },
        vistaPrevia: null, cuando: null, sinLeer: 0, nuevoMatch: true, mensajes: [],
    },
    {
        // MSG-02 (estado inicial; «Enviado», «No se envió» y «en cola» son variantes de la pantalla).
        id: 'conv-jorge-seguridad-andes', viewerId: 'jorge', con: CON_ORG(ORGS.seguridadAndes),
        contexto: { tipo: 'empleo', texto: 'Empleo · Guardia 4x4', chip: 'Empleo · Guardia 4x4', publicationId: 'empleo-guardia-4x4' },
        vistaPrevia: 'Trae tu credencial SPD y tu cédula de identidad. Pregunta en la portería por el supervisor de turno.',
        cuando: 'hace 10 min', sinLeer: 1, nuevoMatch: false,
        mensajes: [
            { id: 'm1', dia: 'Ayer', tipo: 'texto', de: 'yo', texto: 'Hola, gracias por considerarme. Puedo ir a una entrevista esta semana o la próxima.', hora: '17:12', estado: 'Leído' },
            { id: 'm2', dia: 'Ayer', tipo: 'texto', de: 'otro', texto: 'Hola, Jorge. Te agendamos una entrevista para el martes.', hora: '17:34' },
            { id: 'm3', dia: 'Ayer', tipo: 'sistema', tarjeta: ENTREVISTA_JORGE },
            { id: 'm4', dia: 'Ayer', tipo: 'texto', de: 'yo', texto: 'Ahí estaré. ¿Tengo que llevar algo?', hora: '17:41', estado: 'Leído' },
            { id: 'm5', dia: 'Hoy', tipo: 'texto', de: 'otro', texto: 'Trae tu credencial SPD y tu cédula de identidad. Pregunta en la portería por el supervisor de turno.', hora: '12:50' },
        ],
    },
    {
        id: 'conv-jorge-supervisor', viewerId: 'jorge', con: CON_ORG(ORGS.seguridadAndes),
        contexto: { tipo: 'empleo', texto: 'Empleo · Supervisor/a de guardias', chip: 'Empleo · Supervisor/a de guardias', publicationId: 'empleo-supervisor-guardias' },
        vistaPrevia: 'Gracias por tu tiempo. Esta vez seguimos con otra persona.', cuando: '3 dic', sinLeer: 0, nuevoMatch: false,
        mensajes: [
            { id: 'm1', dia: '27 nov', tipo: 'texto', de: 'yo', texto: 'Hola, gracias por considerarme. Quedo atento a la entrevista.', hora: '16:10', estado: 'Leído' }, // no está en el prototipo
            { id: 'm2', dia: '3 dic', tipo: 'texto', de: 'otro', texto: 'Gracias por tu tiempo. Esta vez seguimos con otra persona.', hora: '11:20' },
        ],
    },
    {
        // Turno pasado: su publicación no está en la demo.
        id: 'conv-jorge-punto-activo-28nov', viewerId: 'jorge', con: CON_ORG(ORGS.puntoActivo),
        contexto: { tipo: 'turno', texto: 'Turno · Guardia de eventos · 28 nov', chip: 'Turno · Guardia de eventos · 28 nov' },
        vistaPrevia: 'Tú: Gracias a ustedes. Quedo atento a otros turnos.', cuando: '28 nov', sinLeer: 0, nuevoMatch: false,
        mensajes: [
            { id: 'm1', dia: '28 nov', tipo: 'texto', de: 'otro', texto: 'Gracias por tu trabajo hoy, Jorge. Todo salió bien.', hora: '23:10' }, // no está en el prototipo
            { id: 'm2', dia: '28 nov', tipo: 'texto', de: 'yo', texto: 'Gracias a ustedes. Quedo atento a otros turnos.', hora: '23:25', estado: 'Leído' },
        ],
    },

    // ── Pedro (MSG-02-pedro) ──
    {
        id: 'conv-pedro-taller', viewerId: 'pedro', con: CON_ORG(ORGS.tallerLosAromos),
        contexto: { tipo: 'empleo', texto: 'Empleo · Mecánico/a automotriz', chip: 'Empleo · Mecánico/a automotriz', publicationId: 'empleo-mecanico-automotriz' },
        vistaPrevia: 'Trae tu cédula de identidad y, si tienes, tus certificados de cursos. Pregunta en recepción por el jefe de taller.',
        cuando: 'hace 10 min', // no está en el prototipo (MSG-01 de Pedro no existe)
        sinLeer: 1, nuevoMatch: false,
        mensajes: [
            { id: 'm1', dia: 'Ayer', tipo: 'texto', de: 'yo', texto: 'Hola, gracias por considerarme. Puedo ir a una entrevista esta semana o la próxima.', hora: '17:12', estado: 'Leído' },
            { id: 'm2', dia: 'Ayer', tipo: 'texto', de: 'otro', texto: 'Hola, Pedro. Te agendamos una entrevista para el lunes.', hora: '17:34' },
            { id: 'm3', dia: 'Ayer', tipo: 'sistema', tarjeta: ENTREVISTA_PEDRO },
            { id: 'm4', dia: 'Ayer', tipo: 'texto', de: 'yo', texto: 'Ahí estaré. ¿Tengo que llevar algo?', hora: '17:41', estado: 'Leído' },
            { id: 'm5', dia: 'Hoy', tipo: 'texto', de: 'otro', texto: 'Trae tu cédula de identidad y, si tienes, tus certificados de cursos. Pregunta en recepción por el jefe de taller.', hora: '12:50' },
        ],
    },

    // ── Carolina (MSG-02b-familia: la vista de Familia en Ñuñoa, ya compartido) ──
    {
        id: 'conv-carolina-marta', viewerId: 'carolina', con: CON_PERSONA(PERSONS.marta),
        contexto: { tipo: 'empleo', texto: 'Empleo · Asesor/a del hogar', chip: 'Empleo · Asesor/a del hogar puertas afuera', publicationId: 'aviso-asesor-hogar' },
        vistaPrevia: 'Bueno, quedo atenta.', cuando: '11:05',
        sinLeer: 2, // el prototipo muestra 2 en la pestaña Mensajes de INI-01-carolina
        nuevoMatch: false,
        mensajes: [
            {
                id: 'm1', dia: 'Ayer', tipo: 'texto', de: 'yo', hora: '19:20', estado: 'Leído',
                texto: 'Hola, Marta. Soy Carolina. Nos gustó tu perfil. Buscamos a alguien de lunes a viernes, de 9:00 a 18:00, para la casa y para ir a buscar a Tomás al colegio.',
            },
            { id: 'm2', dia: 'Ayer', tipo: 'texto', de: 'otro', texto: 'Hola, Carolina. Muchas gracias, me interesa. Vivo en La Florida y llego en metro.', hora: '19:45' },
            { id: 'm3', dia: 'Hoy', tipo: 'texto', de: 'yo', texto: '¿Nos podrías mandar tu certificado de antecedentes?', hora: '10:30', estado: 'Leído' },
            { id: 'm4', dia: 'Hoy', tipo: 'sistema', tarjeta: CERTIFICADO_FAMILIA },
            { id: 'm5', dia: 'Hoy', tipo: 'texto', de: 'yo', texto: 'Gracias, Marta. Te escribo en la tarde para coordinar una entrevista.', hora: '11:02', estado: 'Leído' },
            { id: 'm6', dia: 'Hoy', tipo: 'texto', de: 'otro', texto: 'Bueno, quedo atenta.', hora: '11:05' },
        ],
    },

    // ── Marta (flujo 10: MSG-01-marta y MSG-02b-marta, antes de compartir) ──
    {
        id: 'conv-marta-familia', viewerId: 'marta', con: CON_ORG(ORGS.familiaNunoa),
        contexto: { tipo: 'empleo', texto: 'Empleo · Asesor/a del hogar', chip: 'Empleo · Asesor/a del hogar puertas afuera', publicationId: 'aviso-asesor-hogar' },
        vistaPrevia: '¿Nos podrías mandar tu certificado de antecedentes?', cuando: '10:30', sinLeer: 1, nuevoMatch: false,
        mensajes: [
            {
                id: 'm1', dia: 'Ayer', tipo: 'texto', de: 'otro', hora: '19:20',
                texto: 'Hola, Marta. Soy Carolina. Nos gustó tu perfil. Buscamos a alguien de lunes a viernes, de 9:00 a 18:00, para la casa y para ir a buscar a Tomás al colegio.',
            },
            { id: 'm2', dia: 'Ayer', tipo: 'texto', de: 'yo', texto: 'Hola, Carolina. Muchas gracias, me interesa. Vivo en La Florida y llego en metro.', hora: '19:45', estado: 'Leído' },
            { id: 'm3', dia: 'Hoy', tipo: 'texto', de: 'otro', texto: '¿Nos podrías mandar tu certificado de antecedentes?', hora: '10:30' },
        ],
        // MSG-02b-compartir → la tarjeta de sistema y lo que sigue. «Dejar de compartir» apaga la tarjeta
        // (disponible: false → «Ya no está disponible», MSG-02b-marta-no-disponible).
        certificado: {
            aviso: 'Compartirlo es voluntario.',
            alCompartir: [
                { id: 'm4', dia: 'Hoy', tipo: 'sistema', tarjeta: CERTIFICADO_MARTA },
                { id: 'm5', dia: 'Hoy', tipo: 'texto', de: 'otro', texto: 'Gracias, Marta. Te escribo en la tarde para coordinar una entrevista.', hora: '11:02' },
                { id: 'm6', dia: 'Hoy', tipo: 'texto', de: 'yo', texto: 'Bueno, quedo atenta.', hora: '11:05', estado: 'Leído' },
            ],
        },
    },

    // ── Banquetería Rosa SpA: «Conversaciones sin responder 3» (INI-02). No están en el prototipo. ──
    {
        id: 'conv-br-javiera', viewerId: 'banqueteria', con: CON_PERSONA(PERSONS.javiera),
        contexto: { tipo: 'turno', texto: 'Turno · Garzón · sáb 12 dic', chip: 'Turno · Garzones para matrimonio', publicationId: 'turno-garzones-matrimonio' },
        vistaPrevia: '¿Hay que llevar corbata humita?', cuando: 'hace 15 min', sinLeer: 1, nuevoMatch: false,
        mensajes: [
            { id: 'm1', dia: 'Hoy', tipo: 'texto', de: 'otro', texto: 'Hola, Rosa. Gracias por confirmarme para el matrimonio.', hora: '12:43' },
            { id: 'm2', dia: 'Hoy', tipo: 'texto', de: 'otro', texto: '¿Hay que llevar corbata humita?', hora: '12:45' },
        ],
    },
    {
        id: 'conv-br-felipe', viewerId: 'banqueteria', con: CON_PERSONA(PERSONS.felipe),
        contexto: { tipo: 'turno', texto: 'Turno · Garzón · sáb 12 dic', chip: 'Turno · Garzones para matrimonio', publicationId: 'turno-garzones-matrimonio' },
        vistaPrevia: '¿A qué hora termina el montaje?', cuando: 'hace 1 h', sinLeer: 1, nuevoMatch: false,
        mensajes: [{ id: 'm1', dia: 'Hoy', tipo: 'texto', de: 'otro', texto: '¿A qué hora termina el montaje?', hora: '11:58' }],
    },
    {
        id: 'conv-br-daniela', viewerId: 'banqueteria', con: CON_PERSONA(PERSONS.daniela),
        contexto: { tipo: 'turno', texto: 'Turno · Garzón · sáb 12 dic', chip: 'Turno · Garzones para matrimonio', publicationId: 'turno-garzones-matrimonio' },
        vistaPrevia: 'Llego en metro hasta Los Dominicos. ¿Hay estacionamiento de bicicletas?', cuando: 'ayer', sinLeer: 1, nuevoMatch: false,
        mensajes: [
            { id: 'm1', dia: 'Ayer', tipo: 'texto', de: 'otro', texto: 'Llego en metro hasta Los Dominicos. ¿Hay estacionamiento de bicicletas?', hora: '20:14' },
        ],
    },
    {
        // La misma conversación de Matías, vista por la organización.
        id: 'conv-br-matias', viewerId: 'banqueteria', con: CON_PERSONA(PERSONS.matias),
        contexto: { tipo: 'turno', texto: 'Turno · Garzón · hoy', chip: 'Turno · Garzones para cóctel corporativo', publicationId: 'turno-garzones-coctel-corporativo' },
        vistaPrevia: 'Tú: Te esperamos a las 18:45 en la entrada de servicio.', cuando: 'hace 5 min', sinLeer: 0, nuevoMatch: false,
        mensajes: [
            { id: 'm1', dia: 'Ayer', tipo: 'texto', de: 'yo', texto: 'Hola, Matías. ¿Confirmas que vienes mañana al cóctel corporativo?', hora: '18:30', estado: 'Leído' },
            { id: 'm2', dia: 'Ayer', tipo: 'texto', de: 'otro', texto: 'Sí, confirmo. Ahí estaré.', hora: '19:04' },
            { id: 'm3', dia: 'Hoy', tipo: 'texto', de: 'yo', texto: 'Hola, Matías. Hoy somos 6 garzones para el cóctel.', hora: '12:40', estado: 'Enviado' },
            { id: 'm4', dia: 'Hoy', tipo: 'texto', de: 'yo', texto: 'Lleva camisa blanca, pantalón y zapatos negros.', hora: '12:50', estado: 'Enviado' },
            { id: 'm5', dia: 'Hoy', tipo: 'texto', de: 'yo', texto: 'Te esperamos a las 18:45 en la entrada de servicio.', hora: '12:55', estado: 'Enviado' },
        ],
    },
];

// ─── Notificaciones (NOT-01) ────────────────────────────────────────────────

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
    // Bandeja de Rosa Muñoz: la ven Rosa y Banquetería Rosa SpA (NOT-01, flujo 7).
    {
        id: 'not-rosa-faltan-garzones', viewerId: 'rosa', actorId: 'banqueteria', grupo: 'Hoy',
        titulo: 'Faltan 2 garzones para el turno del vie 11 dic · 12:00', origen: 'Banquetería Rosa SpA', cuando: 'hace 20 min',
        sinLeer: true, icono: 'cupos',
        // En el prototipo cambia a Banquetería Rosa SpA y abre su Inicio (INI-02 con el Snackbar).
        destino: { pantalla: 'inicio' },
    },
    {
        id: 'not-rosa-identidad', viewerId: 'rosa', actorId: 'rosa', grupo: 'Hoy',
        titulo: 'Verificamos tu identidad', origen: 'Rosa Muñoz', cuando: 'hace 3 h', sinLeer: true, icono: 'verificacion',
        destino: { pantalla: 'verificacion' },
    },
    {
        id: 'not-rosa-bartender', viewerId: 'rosa', actorId: 'banqueteria', grupo: 'Ayer',
        titulo: '5 personas postularon a Bartender', origen: 'Banquetería Rosa SpA', cuando: 'ayer', sinLeer: false, icono: 'postulantes',
        destino: { pantalla: 'postulantes', publicationId: 'empleo-bartender' },
    },
    {
        id: 'not-rosa-matrimonio', viewerId: 'rosa', actorId: 'banqueteria', grupo: 'Esta semana',
        titulo: 'Garzones para matrimonio ya tiene 5 de 8 cupos confirmados', origen: 'Banquetería Rosa SpA', cuando: '8 dic',
        sinLeer: false, icono: 'turno',
        destino: { pantalla: 'cupos', publicationId: 'turno-garzones-matrimonio', bloqueId: 'matrimonio-sab-12' },
    },
    {
        id: 'not-rosa-evaluar', viewerId: 'rosa', actorId: 'banqueteria', grupo: 'Antes',
        titulo: 'Evalúa a 6 personas del turno del sáb 5 dic', origen: 'Banquetería Rosa SpA', cuando: '6 dic', sinLeer: false, icono: 'evaluar',
        destino: { pantalla: 'evaluar', publicationId: 'turno-garzones-finde-5dic' },
    },
    {
        id: 'not-rosa-org-verificada', viewerId: 'rosa', actorId: 'banqueteria', grupo: 'Antes',
        titulo: 'Verificamos Banquetería Rosa SpA', origen: 'Banquetería Rosa SpA', cuando: '28 nov', sinLeer: false, icono: 'verificacion',
        destino: { pantalla: 'verificacion' },
    },

    // no está en el prototipo: las demás bandejas, con los contadores de la campana de cada prototipo.
    // Matías (2 sin leer en INI-01).
    {
        id: 'not-matias-mensaje', viewerId: 'matias', actorId: 'matias', grupo: 'Hoy',
        titulo: 'Banquetería Rosa SpA te escribió', origen: 'Turno · Garzón · hoy', cuando: 'hace 5 min', sinLeer: true, icono: 'mensaje',
        destino: { pantalla: 'conversacion', conversationId: 'conv-matias-coctel' },
    },
    {
        id: 'not-matias-visto', viewerId: 'matias', actorId: 'matias', grupo: 'Hoy',
        titulo: 'Hotel Andino vio tu postulación a Garzones para cena de fin de año', origen: 'Hotel Andino', cuando: 'hace 2 h',
        sinLeer: true, icono: 'postulacion',
        destino: { pantalla: 'publicacion', publicationId: 'turno-garzones-cena-fin-de-ano' },
    },
    {
        id: 'not-matias-confirma', viewerId: 'matias', actorId: 'matias', grupo: 'Ayer',
        titulo: 'Confirma tu asistencia al turno de mañana', origen: 'Banquetería Rosa SpA', cuando: 'ayer', sinLeer: false, icono: 'turno',
        destino: { pantalla: 'mi-turno', applicationId: 'app-matias-coctel' },
    },
    {
        id: 'not-matias-evaluar', viewerId: 'matias', actorId: 'matias', grupo: 'Antes',
        titulo: 'Evalúa tu turno del sáb 5 dic', origen: 'Banquetería Rosa SpA', cuando: '6 dic', sinLeer: false, icono: 'evaluar',
        destino: { pantalla: 'evaluar', publicationId: 'turno-garzones-finde-5dic' },
    },
    // Jorge (2 sin leer en ACT-02, MSG-01 y PRF-01).
    {
        id: 'not-jorge-mensaje', viewerId: 'jorge', actorId: 'jorge', grupo: 'Hoy',
        titulo: 'Seguridad Andes Ltda. te escribió', origen: 'Empleo · Guardia 4x4', cuando: 'hace 10 min', sinLeer: true, icono: 'mensaje',
        destino: { pantalla: 'conversacion', conversationId: 'conv-jorge-seguridad-andes' },
    },
    {
        id: 'not-jorge-match', viewerId: 'jorge', actorId: 'jorge', grupo: 'Hoy',
        titulo: 'Hicieron match con Hotel Andino', origen: 'Empleo · Guardia turno de noche', cuando: 'hace 1 h', sinLeer: true, icono: 'match',
        destino: { pantalla: 'conversacion', conversationId: 'conv-jorge-hotel-andino' },
    },
    {
        id: 'not-jorge-entrevista', viewerId: 'jorge', actorId: 'jorge', grupo: 'Ayer',
        titulo: 'Tienes entrevista el mar 15 dic · 10:00', origen: 'Seguridad Andes Ltda.', cuando: 'ayer', sinLeer: false, icono: 'entrevista',
        destino: { pantalla: 'proceso', processId: 'proc-jorge-guardia-4x4' },
    },
    {
        id: 'not-jorge-confirmado', viewerId: 'jorge', actorId: 'jorge', grupo: 'Esta semana',
        titulo: 'Te confirmaron en Guardia de eventos del sáb 12 dic', origen: 'Punto Activo Eventos Ltda.', cuando: '8 dic',
        sinLeer: false, icono: 'turno',
        destino: { pantalla: 'mi-turno', applicationId: 'app-jorge-eventos-12dic' },
    },
    {
        id: 'not-jorge-spd', viewerId: 'jorge', actorId: 'jorge', grupo: 'Antes',
        titulo: 'Verificamos tu credencial SPD', origen: 'Jorge Muñoz', cuando: '30 nov', sinLeer: false, icono: 'verificacion',
        destino: { pantalla: 'verificacion' },
    },
    // Pedro (2 sin leer en EXP-01).
    {
        id: 'not-pedro-mensaje', viewerId: 'pedro', actorId: 'pedro', grupo: 'Hoy',
        titulo: 'Taller Los Aromos te escribió', origen: 'Empleo · Mecánico/a automotriz', cuando: 'hace 10 min', sinLeer: true, icono: 'mensaje',
        destino: { pantalla: 'conversacion', conversationId: 'conv-pedro-taller' },
    },
    {
        id: 'not-pedro-match', viewerId: 'pedro', actorId: 'pedro', grupo: 'Ayer',
        titulo: 'Hicieron match con Taller Los Aromos', origen: 'Empleo · Mecánico/a automotriz', cuando: 'ayer', sinLeer: true, icono: 'match',
        destino: { pantalla: 'conversacion', conversationId: 'conv-pedro-taller' },
    },
    {
        id: 'not-pedro-entrevista', viewerId: 'pedro', actorId: 'pedro', grupo: 'Ayer',
        titulo: 'Tienes entrevista el lun 14 dic · 09:00', origen: 'Taller Los Aromos', cuando: 'ayer', sinLeer: false, icono: 'entrevista',
        destino: { pantalla: 'proceso', processId: 'proc-pedro-mecanico' },
    },
    // Carolina (1 sin leer en INI-01-carolina).
    {
        id: 'not-carolina-postulantes', viewerId: 'carolina', actorId: 'carolina', grupo: 'Hoy',
        titulo: '6 personas postularon a Asesor/a del hogar puertas afuera', origen: 'Familia en Ñuñoa', cuando: 'hace 1 h',
        sinLeer: true, icono: 'postulantes',
        destino: { pantalla: 'postulantes', publicationId: 'aviso-asesor-hogar' },
    },
    {
        id: 'not-carolina-publicado', viewerId: 'carolina', actorId: 'carolina', grupo: 'Esta semana',
        titulo: 'Publicamos tu aviso Asesor/a del hogar puertas afuera', origen: 'Familia en Ñuñoa', cuando: '8 dic',
        sinLeer: false, icono: 'postulacion',
        destino: { pantalla: 'gestion', publicationId: 'aviso-asesor-hogar' },
    },
    {
        id: 'not-carolina-identidad', viewerId: 'carolina', actorId: 'carolina', grupo: 'Esta semana',
        titulo: 'Verificamos tu identidad', origen: 'Carolina', cuando: '8 dic', sinLeer: false, icono: 'verificacion',
        destino: { pantalla: 'verificacion' },
    },
    // Marta (1 sin leer en MSG-01-marta).
    {
        id: 'not-marta-mensaje', viewerId: 'marta', actorId: 'marta', grupo: 'Hoy',
        titulo: 'Familia en Ñuñoa te escribió', origen: 'Empleo · Asesor/a del hogar', cuando: 'hace 2 h', sinLeer: true, icono: 'mensaje',
        destino: { pantalla: 'conversacion', conversationId: 'conv-marta-familia' },
    },
];

// ─── Agenda (ACT-01 y «Hoy en tu agenda») ───────────────────────────────────

export const DEMO_AGENDA: DemoAgendaEvent[] = [
    {
        // INI-01 de Matías.
        id: 'ag-matias-coctel', viewerId: 'matias', fecha: 'jue 10 dic', esHoy: true, inicio: '19:00', fin: '00:00',
        titulo: 'Turno · Garzón', detalle: 'Banquetería Rosa SpA · Cóctel corporativo · Providencia', estado: 'Confirmado', tipo: 'turno',
        destino: { pantalla: 'mi-turno', applicationId: 'app-matias-coctel' },
    },
    // Lo que sigue sale de ACT-02, PRC-01 y MSG-02; ACT-01 no está en el prototipo.
    {
        id: 'ag-jorge-eventos-12', viewerId: 'jorge', fecha: 'sáb 12 dic', esHoy: false, inicio: '18:00', fin: '02:00',
        titulo: 'Turno · Guardia de eventos', detalle: 'Punto Activo Eventos Ltda. · Santiago', estado: 'Confirmado', tipo: 'turno',
        destino: { pantalla: 'mi-turno', applicationId: 'app-jorge-eventos-12dic' },
    },
    {
        id: 'ag-jorge-entrevista', viewerId: 'jorge', fecha: 'mar 15 dic', esHoy: false, inicio: '10:00',
        titulo: 'Entrevista · Guardia de seguridad 4x4', detalle: 'Seguridad Andes Ltda. · Av. Concha y Toro 1234, Puente Alto',
        estado: 'Entrevista', tipo: 'entrevista', destino: { pantalla: 'proceso', processId: 'proc-jorge-guardia-4x4' },
    },
    {
        id: 'ag-pedro-entrevista', viewerId: 'pedro', fecha: 'lun 14 dic', esHoy: false, inicio: '09:00',
        titulo: 'Entrevista · Mecánico/a automotriz', detalle: 'Taller Los Aromos · Av. Macul 4321, Macul',
        estado: 'Entrevista', tipo: 'entrevista', destino: { pantalla: 'proceso', processId: 'proc-pedro-mecanico' },
    },
    {
        id: 'ag-carolina-entrevista', viewerId: 'carolina', fecha: 'vie 11 dic', esHoy: false, inicio: '10:00',
        titulo: 'Entrevista · Asesor/a del hogar', detalle: 'Marta Huanca · en tu casa, Ñuñoa',
        estado: 'Entrevista', tipo: 'entrevista', destino: { pantalla: 'proceso', processId: 'proc-carolina-marta' },
    },
    // Banquetería Rosa SpA: sus turnos de los próximos días.
    {
        id: 'ag-br-coctel', viewerId: 'banqueteria', fecha: 'jue 10 dic', esHoy: true, inicio: '19:00', fin: '00:00',
        titulo: 'Turno · Garzones', detalle: 'Garzones para cóctel corporativo · Providencia', estado: 'Cupos completos', tipo: 'turno',
        destino: { pantalla: 'cupos', publicationId: 'turno-garzones-coctel-corporativo', bloqueId: 'coctel-jue-10' },
    },
    {
        id: 'ag-br-almuerzo', viewerId: 'banqueteria', fecha: 'vie 11 dic', esHoy: false, inicio: '12:00', fin: '17:00',
        titulo: 'Turno · Garzones', detalle: 'Garzones para almuerzo de empresa · Vitacura', estado: 'Activa', tipo: 'turno',
        destino: { pantalla: 'cupos', publicationId: 'turno-garzones-almuerzo', bloqueId: 'almuerzo-vie-11' },
    },
    {
        id: 'ag-br-matrimonio', viewerId: 'banqueteria', fecha: 'sáb 12 dic', esHoy: false, inicio: '18:00', fin: '00:00',
        titulo: 'Turno · Garzones', detalle: 'Garzones para matrimonio · Las Condes', estado: 'Activa', tipo: 'turno',
        destino: { pantalla: 'cupos', publicationId: 'turno-garzones-matrimonio', bloqueId: 'matrimonio-sab-12' },
    },
    {
        id: 'ag-br-finde-sab', viewerId: 'banqueteria', fecha: 'sáb 19 dic', esHoy: false, inicio: '18:00', fin: '00:00',
        titulo: 'Turno · Garzones', detalle: 'Garzones fin de semana · San Miguel', estado: 'Activa', tipo: 'turno',
        destino: { pantalla: 'cupos', publicationId: 'turno-garzones-finde', bloqueId: 'finde-sab-19' },
    },
    {
        id: 'ag-br-guardia-sab', viewerId: 'banqueteria', fecha: 'sáb 19 dic', esHoy: false, inicio: '19:00', fin: '03:00',
        titulo: 'Turno · Guardia de eventos', detalle: 'Guardia de eventos · San Miguel', estado: 'Cupos completos', tipo: 'turno',
        destino: { pantalla: 'cupos', publicationId: 'turno-guardia-eventos-19dic', bloqueId: 'guardia-sab-19' },
    },
    {
        id: 'ag-br-finde-dom', viewerId: 'banqueteria', fecha: 'dom 20 dic', esHoy: false, inicio: '13:00', fin: '18:00',
        titulo: 'Turno · Garzones', detalle: 'Garzones fin de semana · San Miguel', estado: 'Activa', tipo: 'turno',
        destino: { pantalla: 'cupos', publicationId: 'turno-garzones-finde', bloqueId: 'finde-dom-20' },
    },
];

// ─── Gestión de publicaciones (GES-01, GES-02, GES-04) ──────────────────────

const FILTROS_POSTULANTES = ['Todos', 'Nuevos', 'En proceso', 'No seleccionados'];

const SIN_POSTULADOS: DemoEmptyState = {
    titulo: 'Aún no hay postulados',
    texto: 'Avisamos a quienes buscan turnos de garzón cerca. También puedes invitar a tus favoritos.',
    accion: 'Invitar a mis favoritos',
};

const POSTULADOS_GARZONES = [
    aplicante(PERSONS.martin),
    aplicante(PERSONS.fernanda),
    aplicante(PERSONS.nicolas),
    aplicante(PERSONS.antonia),
];

export const DEMO_MANAGED_PUBLICATIONS: DemoManagedPublication[] = [
    {
        // GES-01-turno y GES-04 de «Garzones fin de semana» (flujo 4). GES-01 es recién publicada (0/12) y
        // GES-04 muestra el momento con postulados (tras el salto de tiempo): son dos momentos del prototipo.
        publicationId: 'turno-garzones-finde', ownerId: 'banqueteria', titulo: 'Garzones fin de semana',
        resumen: 'Turno · sáb 19 y dom 20 dic · San Miguel', estado: 'Activa', vigencia: 'Publicada hoy · hasta el dom 20 dic',
        metricas: [
            { label: 'Vistas', valor: '0', detalle: 'recién publicada' },
            { label: 'Confirmados', valor: '0/12', detalle: '8 el sáb y 4 el dom' },
        ],
        favoritos: { texto: 'Invitar a mis favoritos', detalle: '5 personas que ya trabajaron contigo' },
        nota: 'Un turno vence con su fecha: no se renueva.',
        cupos: [
            {
                id: 'finde-sab-19', titulo: 'Garzones · sáb 19 dic', subtitulo: 'Garzones fin de semana · 18:00–00:00 · San Miguel',
                total: 8, confirmados: [], postulados: POSTULADOS_GARZONES, listaEspera: [],
                favoritos: { personIds: ['martin-silva', 'fernanda-castro'], texto: 'Quedan 8 cupos. Con un toque confirmas a Martín y a Fernanda.' },
                vacio: SIN_POSTULADOS,
            },
            {
                // no está en el prototipo: el bloque del domingo.
                id: 'finde-dom-20', titulo: 'Garzones · dom 20 dic', subtitulo: 'Garzones fin de semana · 13:00–18:00 · San Miguel',
                total: 4, confirmados: [], postulados: [], listaEspera: [], vacio: SIN_POSTULADOS,
            },
        ],
    },
    {
        // GES-04 y GES-04-postulados (Apoyo). Métricas y vigencia: no están en el prototipo.
        publicationId: 'turno-garzones-matrimonio', ownerId: 'banqueteria', titulo: 'Garzones para matrimonio',
        resumen: 'Turno · sáb 12 dic · Las Condes', estado: 'Activa', vigencia: 'Publicada el 1 dic · hasta el sáb 12 dic',
        metricas: [
            { label: 'Vistas', valor: '214' },
            { label: 'Confirmados', valor: '5/8' },
        ],
        favoritos: { texto: 'Invitar a mis favoritos', detalle: '5 personas que ya trabajaron contigo' },
        nota: 'Un turno vence con su fecha: no se renueva.',
        cupos: [
            {
                id: 'matrimonio-sab-12', titulo: 'Garzones · sáb 12 dic', subtitulo: 'Garzones para matrimonio · 18:00–00:00 · Las Condes',
                total: 8,
                confirmados: [
                    aplicante(PERSONS.javiera, { conversationId: 'conv-br-javiera' }),
                    aplicante(PERSONS.felipe, { conversationId: 'conv-br-felipe' }),
                    aplicante(PERSONS.daniela, { conversationId: 'conv-br-daniela' }),
                    aplicante(PERSONS.sebastian),
                    aplicante(PERSONS.constanza),
                ],
                // Matías postuló en el flujo 2; GES-04 del prototipo no lo muestra (no está en el prototipo).
                postulados: [...POSTULADOS_GARZONES, aplicante(PERSONS.matias)],
                listaEspera: [],
                favoritos: { personIds: ['martin-silva', 'fernanda-castro'], texto: 'Quedan 3 cupos. Con un toque confirmas a Martín y a Fernanda.' },
            },
        ],
    },
    {
        // no está en el prototipo: el turno de hoy de Matías, visto por la organización.
        publicationId: 'turno-garzones-coctel-corporativo', ownerId: 'banqueteria', titulo: 'Garzones para cóctel corporativo',
        resumen: 'Turno · jue 10 dic · Providencia', estado: 'Activa', vigencia: 'Publicada el 2 dic · hasta hoy',
        metricas: [
            { label: 'Vistas', valor: '138' },
            { label: 'Confirmados', valor: '6/6' },
        ],
        nota: 'Un turno vence con su fecha: no se renueva.',
        cupos: [
            {
                id: 'coctel-jue-10', titulo: 'Garzones · jue 10 dic', subtitulo: 'Garzones para cóctel corporativo · 19:00–00:00 · Providencia',
                total: 6,
                confirmados: [
                    aplicante(PERSONS.matias, { conversationId: 'conv-br-matias' }),
                    aplicante(PERSONS.javiera), aplicante(PERSONS.felipe), aplicante(PERSONS.daniela),
                    aplicante(PERSONS.sebastian), aplicante(PERSONS.fernanda),
                ],
                postulados: [], listaEspera: [],
            },
        ],
    },
    {
        // INI-02: «Turno vie 11 dic · 12:00: faltan 2 garzones». Personas y métricas: no están en el prototipo.
        publicationId: 'turno-garzones-almuerzo', ownerId: 'banqueteria', titulo: 'Garzones para almuerzo de empresa',
        resumen: 'Turno · vie 11 dic · Vitacura', estado: 'Activa', vigencia: 'Publicada el 3 dic · hasta el vie 11 dic',
        metricas: [
            { label: 'Vistas', valor: '96' },
            { label: 'Confirmados', valor: '4/6' },
        ],
        favoritos: { texto: 'Invitar a mis favoritos', detalle: '5 personas que ya trabajaron contigo' },
        nota: 'Un turno vence con su fecha: no se renueva.',
        cupos: [
            {
                id: 'almuerzo-vie-11', titulo: 'Garzones · vie 11 dic', subtitulo: 'Garzones para almuerzo de empresa · 12:00–17:00 · Vitacura',
                total: 6,
                confirmados: [aplicante(PERSONS.constanza), aplicante(PERSONS.nicolas), aplicante(PERSONS.antonia), aplicante(PERSONS.martin)],
                postulados: [], listaEspera: [], vacio: SIN_POSTULADOS,
            },
        ],
    },
    {
        // no está en el prototipo: el turno donde Jorge quedó en lista de espera.
        publicationId: 'turno-guardia-eventos-19dic', ownerId: 'banqueteria', titulo: 'Guardia de eventos',
        resumen: 'Turno · sáb 19 dic · San Miguel', estado: 'Activa', vigencia: 'Publicada el 5 dic · hasta el sáb 19 dic',
        metricas: [
            { label: 'Vistas', valor: '61' },
            { label: 'Confirmados', valor: '4/4' },
        ],
        nota: 'Un turno vence con su fecha: no se renueva.',
        cupos: [
            {
                id: 'guardia-sab-19', titulo: 'Guardia de eventos · sáb 19 dic', subtitulo: 'Guardia de eventos · 19:00–03:00 · San Miguel',
                total: 4,
                confirmados: [aplicante(PERSONS.hector), aplicante(PERSONS.ricardo), aplicante(PERSONS.paola), aplicante(PERSONS.cristian)],
                postulados: [],
                listaEspera: [aplicante(PERSONS.jorge, { estado: 'En lista de espera' })],
            },
        ],
    },
    {
        // INI-02 y NOT-01: «5 postulantes sin revisar en Bartender». Postulantes y métricas: no están en el prototipo.
        publicationId: 'empleo-bartender', ownerId: 'banqueteria', titulo: 'Bartender',
        resumen: 'Empleo · Part time · San Miguel', estado: 'Activa', vigencia: 'Publicada el 4 dic · hasta el 3 ene',
        metricas: [
            { label: 'Vistas', valor: '96' },
            { label: 'Postulantes', valor: '5', detalle: 'sin revisar' },
        ],
        postulantes: {
            total: 5, orden: 'ordenados por afinidad', filtros: FILTROS_POSTULANTES,
            personas: [
                aplicante(PERSONS.diego, { linea: lineaOficio(PERSONS.diego), pretension: liquidos(500000, 'mes'), estado: 'Postulado' }),
                aplicante(PERSONS.ignacio, { linea: lineaOficio(PERSONS.ignacio), pretension: liquidos(480000, 'mes'), estado: 'Postulado' }),
                aplicante(PERSONS.benjamin, { linea: lineaOficio(PERSONS.benjamin), pretension: null, estado: 'Postulado' }),
                aplicante(PERSONS.catalina, { linea: lineaOficio(PERSONS.catalina), pretension: liquidos(450000, 'mes'), estado: 'Postulado' }),
                aplicante(PERSONS.valeria, { linea: lineaOficio(PERSONS.valeria), pretension: liquidos(460000, 'mes'), estado: 'Postulado' }),
            ],
        },
    },
    {
        // INI-02: «Evalúa a 6 personas del turno del sáb 5 dic». A Matías ya lo evaluaron (MSG-01): son 7 confirmados.
        // Personas y métricas: no están en el prototipo.
        publicationId: 'turno-garzones-finde-5dic', ownerId: 'banqueteria', titulo: 'Garzones fin de semana',
        resumen: 'Turno · sáb 5 dic · San Miguel', estado: 'Cerrada', vigencia: 'Terminó el sáb 5 dic',
        metricas: [{ label: 'Confirmados', valor: '7/7' }],
        cupos: [
            {
                id: 'finde-sab-5', titulo: 'Garzones · sáb 5 dic', subtitulo: 'Garzones fin de semana · 18:00–00:00 · San Miguel',
                total: 7,
                confirmados: [
                    aplicante(PERSONS.matias),
                    aplicante(PERSONS.javiera), aplicante(PERSONS.felipe), aplicante(PERSONS.daniela),
                    aplicante(PERSONS.sebastian), aplicante(PERSONS.constanza), aplicante(PERSONS.nicolas),
                ],
                postulados: [], listaEspera: [],
            },
        ],
    },
    {
        // GES-02-hogar (flujo 5). Las 4 primeras personas son las del prototipo; las otras 5 completan «9 postulantes».
        publicationId: 'aviso-asesor-hogar', ownerId: 'carolina', titulo: 'Asesor/a del hogar puertas afuera',
        resumen: 'Empleo · Lun a vie · 09:00–18:00 · Ñuñoa', estado: 'Activa',
        vigencia: 'Publicada el 8 dic · hasta el 7 ene', // no está en el prototipo (la Clásica dura 30 días)
        metricas: [{ label: 'Postulantes', valor: '9', detalle: '6 nuevos' }],
        postulantes: {
            total: 9, orden: 'ordenados por afinidad', filtros: FILTROS_POSTULANTES,
            aviso:
                'Como hay niños, solo pueden postular personas con certificado de inhabilidades vigente. El certificado de antecedentes es voluntario: la persona lo comparte en el chat si quiere.',
            personas: [
                aplicante(PERSONS.marta, {
                    linea: lineaOficio(PERSONS.marta), pretension: liquidos(600000, 'mes'), estado: 'En proceso',
                    conversationId: 'conv-carolina-marta', processId: 'proc-carolina-marta',
                }),
                aplicante(PERSONS.gladys, { linea: lineaOficio(PERSONS.gladys), pretension: null, estado: 'Visto' }),
                aplicante(PERSONS.carmen, { linea: lineaOficio(PERSONS.carmen), pretension: liquidos(580000, 'mes'), estado: 'Postulado' }),
                aplicante(PERSONS.veronica, { linea: lineaOficio(PERSONS.veronica), pretension: liquidos(550000, 'mes'), estado: 'Postulado' }),
                // no está en el prototipo
                aplicante(PERSONS.patricia, { linea: lineaOficio(PERSONS.patricia), pretension: liquidos(650000, 'mes'), estado: 'Postulado' }),
                aplicante(PERSONS.juana, { linea: lineaOficio(PERSONS.juana), pretension: liquidos(620000, 'mes'), estado: 'Postulado' }),
                aplicante(PERSONS.lorena, { linea: lineaOficio(PERSONS.lorena), pretension: liquidos(560000, 'mes'), estado: 'Postulado' }),
                aplicante(PERSONS.elena, { linea: lineaOficio(PERSONS.elena), pretension: null, estado: 'Postulado' }),
                aplicante(PERSONS.sonia, { linea: lineaOficio(PERSONS.sonia), pretension: liquidos(590000, 'mes'), estado: 'No seleccionado' }),
            ],
        },
    },
];

// ─── Panel de la organización (INI-02) ──────────────────────────────────────

export const DEMO_ORG_DASHBOARDS: DemoOrgDashboard[] = [
    {
        orgId: 'banqueteria', saludo: 'Hola, Rosa',
        kpis: [
            { id: 'postulantes', label: 'Postulantes nuevos', valor: '12' },
            { id: 'turnos', label: 'Turnos de la semana', valor: '4/6 cubiertos' },
            { id: 'conversaciones', label: 'Conversaciones sin responder', valor: '3' },
            { id: 'respuesta', label: 'Respondes en promedio en', valor: '2 h' },
        ],
        atencion: [
            {
                id: 'faltan-garzones', texto: 'Turno vie 11 dic · 12:00: faltan 2 garzones', detalle: 'Empieza en 23 h', icono: 'cupos',
                destino: { pantalla: 'cupos', publicationId: 'turno-garzones-almuerzo', bloqueId: 'almuerzo-vie-11' },
            },
            {
                id: 'bartender', texto: '5 postulantes sin revisar en Bartender', icono: 'postulantes',
                destino: { pantalla: 'postulantes', publicationId: 'empleo-bartender' },
            },
            {
                id: 'evaluar', texto: 'Evalúa a 6 personas del turno del sáb 5 dic', icono: 'evaluar',
                destino: { pantalla: 'evaluar', publicationId: 'turno-garzones-finde-5dic' },
            },
        ],
        publicaciones: [
            'turno-garzones-finde',
            'turno-garzones-coctel-corporativo',
            'turno-garzones-almuerzo',
            'turno-garzones-matrimonio',
            'turno-guardia-eventos-19dic',
            'empleo-bartender',
            'turno-garzones-finde-5dic',
        ],
    },
];

// ─── Perfiles (PRF-01) ──────────────────────────────────────────────────────

const NOTA_PRETENSION = 'La ven solo organizaciones y hogares con una publicación activa, nunca el público.';
const NOTA_HOGAR = 'El contexto del hogar lo ven solo quienes postulan a tus avisos.';
const PIE_HOGAR = 'Tus avisos se publican desde Inicio.';
const CONFIG_BASE = { notificaciones: 'Silencio de 22:00 a 08:00', apariencia: 'Tema: Sistema' };

function enlacesPersona(verificaciones: DemoVerification[]): DemoProfileLink[] {
    return [
        { id: 'agregar', titulo: 'Agregar un perfil', detalle: 'Ofrecer servicios, dar clases o crear una organización' },
        {
            id: 'verificacion', titulo: 'Verificación y credenciales',
            detalle: verificaciones.length ? verificaciones.map((v) => v.label).join(' · ') : 'Aún no verificas nada',
        },
        { id: 'mis-perfiles', titulo: 'Mis perfiles', detalle: 'Pausar o eliminar un perfil' },
        { id: 'impulsa', titulo: 'Impulsa tu perfil', detalle: 'Más organizaciones verán tu perfil primero', badge: 'Pronto' },
    ];
}

export const DEMO_PROFILES: DemoProfile[] = [
    {
        // PRF-01, PRF-01-final y CFG-01 (flujos 8 y 11).
        actorId: 'jorge',
        asiTeVen: {
            nombre: 'Jorge Muñoz', iniciales: 'JM', comuna: 'Puente Alto', verificaciones: PERSONS.jorge.verificaciones,
            notas: [{ rol: 'Trabajo', nota: { value: 4.9, count: 25 } }, { rol: 'Hogar', nota: null }],
        },
        perfiles: [
            {
                id: 'trabajo', nombre: 'Trabajo',
                completitud: {
                    titulo: 'Te falta 1 cosa', texto: 'Sube tu CV: lo piden varias ofertas de empleo de jornada completa.', accion: 'Subir CV en PDF',
                },
                secciones: [
                    {
                        tipo: 'texto', titulo: 'Sobre mí', editable: true,
                        texto: 'Guardia con experiencia en condominios y eventos: control de acceso, rondas y registro de visitas. Trabajo en sistema 4x4 y los fines de semana tomo turnos de eventos.',
                    },
                    {
                        tipo: 'filas', titulo: 'Oficios y experiencia', editable: true,
                        filas: [
                            { label: 'Guardia de seguridad', value: '5 a 10 años de experiencia', badge: 'Principal' },
                            { label: 'Guardia de eventos', value: '3 a 5 años de experiencia' },
                            { label: 'Último trabajo', value: 'Guardia de seguridad en Vigilancia Cordillera Ltda. · 2018 a 2026' },
                        ],
                    },
                    {
                        tipo: 'filas', titulo: 'Disponibilidad', editable: true,
                        filas: [
                            { label: 'Jornada', value: 'Jornada completa · Part time' },
                            { label: 'Disponible desde', value: 'Inmediata' },
                            { label: 'Sistema de turno', value: '4x4 · de día y de noche' },
                            { label: 'Turnos por día', value: 'Vie noche · Sáb tarde y noche · Dom tarde' },
                            { label: 'Hasta dónde te mueves', value: '20 km desde Puente Alto' },
                        ],
                    },
                    {
                        tipo: 'filas', titulo: 'Pretensión', editable: true, nota: NOTA_PRETENSION,
                        filas: [
                            { label: 'Sueldo líquido para empleos', monto: liquidos(650000, 'mes') },
                            { label: 'Tarifa mínima para turnos', monto: liquidos(40000, 'turno') },
                        ],
                    },
                    {
                        tipo: 'filas', titulo: 'Credenciales', editable: true,
                        filas: [
                            { label: 'Credencial SPD (ex OS-10)', badge: 'Verificada', detalle: 'Vence 03/2028' },
                            {
                                label: 'Certificado de antecedentes', badge: 'Recomendado',
                                detalle: 'Si quieres, lo compartes tú en el chat después del match.',
                            },
                        ],
                    },
                    {
                        tipo: 'filas', titulo: 'Idiomas', editable: true,
                        filas: [{ label: 'Español', value: 'Nativo' }, { label: 'Inglés', value: 'Básico' }],
                    },
                    {
                        tipo: 'vacio', titulo: 'CV', accion: 'Subir CV en PDF',
                        texto: 'Aún no subes tu CV. Lo verán solo las organizaciones a las que postules.',
                    },
                ],
            },
            {
                id: 'hogar', nombre: 'Hogar',
                completitud: {
                    titulo: 'Te falta 1 cosa',
                    texto: 'Verifica tu identidad para recibir a alguien en tu casa. Es una foto de tu cédula y una selfie, y es gratis.',
                    accion: 'Verificar identidad', destino: { pantalla: 'verificacion' },
                },
                secciones: [
                    {
                        tipo: 'filas', titulo: 'Tu hogar', editable: true, nota: NOTA_HOGAR,
                        filas: [
                            { label: 'Así lo ven en tus avisos', value: 'Familia en Puente Alto' },
                            { label: 'Comuna', value: 'Puente Alto' },
                            { label: 'Contexto del hogar', value: 'Hay adulto mayor' },
                        ],
                    },
                    { tipo: 'tags', titulo: 'Qué necesitas', editable: true, tags: [{ text: 'Cuidador/a de adulto mayor' }] },
                ],
                pie: PIE_HOGAR,
            },
        ],
        enlaces: enlacesPersona(PERSONS.jorge.verificaciones),
        configuracion: { cuenta: 'jorge.munoz@correo.cl', ...CONFIG_BASE },
    },
    {
        // no está en el prototipo: PRF-01 de Matías, con lo que sus pantallas dicen de él.
        actorId: 'matias',
        asiTeVen: {
            nombre: 'Matías Rojas', iniciales: 'MR', comuna: 'Maipú', verificaciones: PERSONS.matias.verificaciones,
            notas: [{ rol: 'Trabajo', nota: { value: 4.8, count: 12 } }],
        },
        perfiles: [
            {
                id: 'trabajo', nombre: 'Trabajo',
                completitud: {
                    titulo: 'Te falta 1 cosa', badge: 'Recomendado',
                    texto: 'Agrega tu curso de manipulación de alimentos: algunas organizaciones lo piden para turnos con comida.',
                    accion: 'Subir curso',
                },
                secciones: [
                    {
                        tipo: 'texto', titulo: 'Sobre mí', editable: true,
                        texto: 'Garzón con experiencia en matrimonios, cócteles y eventos de empresa. Tomo turnos de tarde y noche, sobre todo los fines de semana.',
                    },
                    {
                        tipo: 'filas', titulo: 'Oficios y experiencia', editable: true,
                        filas: [
                            { label: 'Garzón', value: '1 a 3 años de experiencia', badge: 'Principal' },
                            { label: 'Banquetero', value: '1 a 3 años de experiencia' },
                        ],
                    },
                    {
                        tipo: 'filas', titulo: 'Disponibilidad', editable: true,
                        filas: [
                            { label: 'Turnos por día', value: 'Jue a dom · tarde y noche' },
                            { label: 'Hasta dónde te mueves', value: '20 km desde Maipú' },
                        ],
                    },
                    {
                        tipo: 'filas', titulo: 'Pretensión', editable: true, nota: NOTA_PRETENSION,
                        filas: [{ label: 'Tarifa mínima para turnos', monto: liquidos(30000, 'turno') }],
                    },
                    {
                        tipo: 'filas', titulo: 'Credenciales', editable: true,
                        filas: [
                            {
                                label: 'Curso de manipulación de alimentos', badge: 'Recomendado',
                                detalle: 'Algunas organizaciones lo piden para turnos con comida.',
                            },
                        ],
                    },
                ],
            },
        ],
        enlaces: enlacesPersona(PERSONS.matias.verificaciones),
        configuracion: { cuenta: 'matias.rojas@correo.cl', ...CONFIG_BASE },
    },
    {
        // no está en el prototipo: PRF-01 de Pedro (oficio y experiencia de EXP-01, CV de DET-02-pedro).
        actorId: 'pedro',
        asiTeVen: {
            nombre: 'Pedro Valdés', iniciales: 'PV', comuna: 'Macul', verificaciones: PERSONS.pedro.verificaciones,
            notas: [{ rol: 'Trabajo', nota: null }],
        },
        perfiles: [
            {
                id: 'trabajo', nombre: 'Trabajo',
                secciones: [
                    {
                        tipo: 'texto', titulo: 'Sobre mí', editable: true,
                        texto: 'Mecánico automotriz con experiencia en autos livianos: frenos, suspensión, afinamiento y diagnóstico con escáner.',
                    },
                    {
                        tipo: 'filas', titulo: 'Oficios y experiencia', editable: true,
                        filas: [
                            { label: 'Mecánico/a automotriz', value: '5 a 10 años de experiencia', badge: 'Principal' },
                            { label: 'Último trabajo', value: 'Mecánico en Servicio Automotriz Vicuña Mackenna · 2017 a 2026' },
                        ],
                    },
                    {
                        tipo: 'filas', titulo: 'Disponibilidad', editable: true,
                        filas: [
                            { label: 'Jornada', value: 'Jornada completa' },
                            { label: 'Disponible desde', value: 'En 15 días' },
                            { label: 'Hasta dónde te mueves', value: '10 km desde Macul' },
                        ],
                    },
                    {
                        tipo: 'filas', titulo: 'Pretensión', editable: true, nota: NOTA_PRETENSION,
                        filas: [{ label: 'Sueldo líquido para empleos', monto: liquidos(750000, 'mes') }],
                    },
                    { tipo: 'archivo', titulo: 'CV', nombre: 'CV Pedro Valdés.pdf', detalle: '180 KB', editable: true },
                ],
            },
        ],
        enlaces: enlacesPersona(PERSONS.pedro.verificaciones),
        configuracion: { cuenta: 'pedro.valdes@correo.cl', ...CONFIG_BASE },
    },
    {
        // no está en el prototipo: PRF-01 de Carolina (su hogar sale de PUBL-04).
        actorId: 'carolina',
        asiTeVen: {
            nombre: 'Carolina', iniciales: 'C', comuna: 'Ñuñoa', verificaciones: PERSONS.carolina.verificaciones,
            notas: [{ rol: 'Hogar', nota: null }],
        },
        perfiles: [
            {
                id: 'hogar', nombre: 'Hogar',
                secciones: [
                    {
                        tipo: 'filas', titulo: 'Tu hogar', editable: true, nota: NOTA_HOGAR,
                        filas: [
                            { label: 'Así lo ven en tus avisos', value: 'Familia en Ñuñoa' },
                            { label: 'Comuna', value: 'Ñuñoa' },
                            { label: 'Contexto del hogar', value: 'Hay niños' },
                        ],
                    },
                    { tipo: 'tags', titulo: 'Qué necesitas', editable: true, tags: [{ text: 'Asesor/a del hogar' }] },
                ],
                pie: PIE_HOGAR,
            },
        ],
        enlaces: enlacesPersona(PERSONS.carolina.verificaciones),
        configuracion: { cuenta: 'carolina@correo.cl', ...CONFIG_BASE },
    },
    {
        // Rosa como persona no tiene perfiles (INI-01-rosa); el texto del estado vacío es el de esa pantalla.
        actorId: 'rosa',
        asiTeVen: {
            nombre: 'Rosa Muñoz', iniciales: 'RM', comuna: 'Providencia', verificaciones: PERSONS.rosa.verificaciones, notas: [],
        },
        perfiles: [],
        vacio: {
            icono: 'agregar', titulo: 'Aún no tienes perfiles',
            texto: 'Agrega uno para buscar trabajo o contratar para tu hogar. Tus publicaciones siguen en Banquetería Rosa SpA.',
            accion: 'Agregar un perfil',
        },
        enlaces: enlacesPersona(PERSONS.rosa.verificaciones),
        configuracion: { cuenta: 'rosa.munoz@correo.cl', ...CONFIG_BASE }, // no está en el prototipo
    },
    {
        // no está en el prototipo: el perfil de la organización.
        actorId: 'banqueteria',
        asiTeVen: {
            nombre: 'Banquetería Rosa SpA', iniciales: 'BR', comuna: 'San Miguel', verificaciones: [V.org],
            notas: [{ rol: 'Organización', nota: { value: 4.8, count: 52 } }],
        },
        perfiles: [
            {
                id: 'organizacion', nombre: 'Organización',
                secciones: [
                    {
                        tipo: 'texto', titulo: 'Sobre la organización', editable: true,
                        texto: 'Banquetería para matrimonios, cócteles y eventos de empresa en Santiago. Trabajamos con equipos de garzones, bartenders y guardias de eventos.',
                    },
                    {
                        tipo: 'filas', titulo: 'Datos de la organización', editable: true,
                        filas: [
                            { label: 'Rubro', value: 'Gastronomía y eventos' },
                            { label: 'Tamaño', value: '10 a 49 trabajadores' },
                            { label: 'Comuna', value: 'San Miguel' },
                            { label: 'La administra', value: 'Rosa Muñoz' },
                        ],
                    },
                ],
            },
        ],
        enlaces: [{ id: 'verificacion', titulo: 'Verificación y credenciales', detalle: 'Organización verificada' }],
        configuracion: { cuenta: 'contacto@banqueteriarosa.cl', ...CONFIG_BASE },
    },
];

// ─── Explorar (EXP-01, EXP-02) ──────────────────────────────────────────────

const agregarPerfil = (titulo: string, texto: string): DemoEmptyState => ({
    titulo, texto, accion: 'Agregar un perfil', destino: { pantalla: 'perfil' },
});

export const DEMO_EXPLORE: DemoExplore[] = [
    {
        // EXP-02 (flujos 2 y 9).
        actorId: 'matias', filtrosActivos: 2,
        empleos: {
            titulo: 'Ofertas cerca de Maipú', vista: 'deck', publicaciones: [],
            // no está en el prototipo
            vacio: { icono: 'empleo', ...agregarPerfil('Aún no buscas empleo', 'Agrega un perfil de empleo para ver ofertas estables cerca de Maipú.') },
        },
        turnos: {
            comuna: 'Maipú', filtros: ['Todos', 'Garzón', 'Bartender', 'Guardia de eventos', 'Bodega'],
            dias: [
                { titulo: 'Hoy', publicaciones: ['turno-bodega-noche'] },
                { titulo: 'Mañana', publicaciones: ['turno-guardia-concierto'] },
                { titulo: 'Este fin de semana', publicaciones: ['turno-garzones-matrimonio', 'turno-coctel-lanzamiento', 'turno-banqueteros-bautizo'] },
                { titulo: 'Más adelante', publicaciones: ['turno-bartender-ano-nuevo'] },
            ],
            vacio: { icono: 'turno', titulo: 'No hay turnos en Maipú esta semana', texto: 'Hay 8 a menos de 10 km.', accion: 'Ver' },
        },
    },
    {
        // EXP-01 en lista (Apoyo). Los turnos de Jorge no están en el prototipo.
        actorId: 'jorge', filtrosActivos: 2,
        empleos: {
            titulo: 'Ofertas cerca de Puente Alto', vista: 'lista',
            publicaciones: ['empleo-guardia-4x4', 'empleo-conserje', 'empleo-supervisor-seguridad'],
        },
        turnos: {
            comuna: 'Puente Alto', filtros: ['Todos', 'Guardia de eventos', 'Garzón', 'Bodega'], // no está en el prototipo
            dias: [
                { titulo: 'Mañana', publicaciones: ['turno-guardia-concierto'] },
                { titulo: 'Más adelante', publicaciones: ['turno-guardia-feria-navidena'] },
            ],
            vacio: { icono: 'turno', titulo: 'No hay turnos en Puente Alto esta semana', texto: 'Prueba con una distancia mayor.', accion: 'Ver' },
        },
    },
    {
        // EXP-01 (deck, flujo 3). Las tarjetas 2 y 3 del deck y los turnos no están en el prototipo.
        actorId: 'pedro', filtrosActivos: 2,
        empleos: {
            titulo: 'Ofertas cerca de Macul', vista: 'deck',
            publicaciones: ['empleo-mecanico-automotriz', 'empleo-mantencion-flota', 'empleo-electromecanico'],
        },
        turnos: {
            comuna: 'Macul', filtros: ['Todos'], dias: [],
            vacio: { icono: 'turno', ...agregarPerfil('Aún no tomas turnos', 'Agrega Turnos a tu perfil para ver trabajos por día cerca de Macul.') },
        },
    },
    {
        // no está en el prototipo: Carolina contrata para su hogar (sus clases están en el prototipo F2).
        actorId: 'carolina', filtrosActivos: 0,
        empleos: {
            titulo: 'Ofertas cerca de Ñuñoa', vista: 'lista', publicaciones: [],
            vacio: { icono: 'empleo', ...agregarPerfil('Aún no buscas trabajo', 'Tu perfil es para contratar en tu hogar. Si quieres buscar trabajo, agrega un perfil.') },
        },
        turnos: {
            comuna: 'Ñuñoa', filtros: ['Todos'], dias: [],
            vacio: { icono: 'turno', ...agregarPerfil('Aún no tomas turnos', 'Si quieres tomar turnos por día, agrega un perfil de trabajo.') },
        },
    },
    {
        // no está en el prototipo: Rosa como persona no tiene perfiles.
        actorId: 'rosa', filtrosActivos: 0,
        empleos: {
            titulo: 'Ofertas cerca de Providencia', vista: 'lista', publicaciones: [],
            vacio: { icono: 'agregar', ...agregarPerfil('Aún no tienes perfiles', 'Agrega uno para buscar trabajo o contratar para tu hogar.') },
        },
        turnos: {
            comuna: 'Providencia', filtros: ['Todos'], dias: [],
            vacio: { icono: 'agregar', ...agregarPerfil('Aún no tienes perfiles', 'Agrega uno para buscar trabajo o contratar para tu hogar.') },
        },
    },
    {
        // no está en el prototipo: una organización no busca empleos ni turnos.
        actorId: 'banqueteria', filtrosActivos: 0,
        empleos: {
            titulo: 'Ofertas cerca de San Miguel', vista: 'lista', publicaciones: [],
            vacio: { icono: 'empleo', titulo: 'Publica para recibir postulantes', texto: 'Las organizaciones encuentran personas desde sus publicaciones.', accion: 'Publicar' },
        },
        turnos: {
            comuna: 'San Miguel', filtros: ['Todos'], dias: [],
            vacio: { icono: 'turno', titulo: 'Publica para recibir postulantes', texto: 'Las organizaciones encuentran personas desde sus publicaciones.', accion: 'Publicar' },
        },
    },
];

// ─── Inicio (INI-01, INI-02) ────────────────────────────────────────────────

function bloquesInicio(actorId: DemoActorId): DemoHomeBlock[] {
    switch (actorId) {
        case 'matias':
            // Main (INI-01 de Matías).
            return [
                { tipo: 'agenda', titulo: 'Hoy en tu agenda', accion: 'Ver agenda', eventos: getAgenda('matias').filter((e) => e.esHoy) },
                {
                    tipo: 'turnos', titulo: 'Turnos para ti', accion: 'Ver todos',
                    publicaciones: ['turno-garzones-matrimonio', 'turno-coctel-lanzamiento', 'turno-banqueteros-bautizo'],
                },
                {
                    tipo: 'novedades', titulo: 'Postulaciones con novedades',
                    items: [
                        {
                            id: 'nov-matias-cena', iniciales: 'HA', titulo: 'Hotel Andino vio tu postulación', detalle: 'Garzón · vie 18 dic',
                            estado: 'Postulado', destino: { pantalla: 'publicacion', publicationId: 'turno-garzones-cena-fin-de-ano' },
                        },
                    ],
                },
                {
                    tipo: 'completar',
                    aviso: {
                        titulo: 'Agrega tu curso de manipulación de alimentos para destacar', badge: 'Recomendado',
                        texto: 'Algunas organizaciones lo piden para turnos con comida.', accion: 'Subir curso', destino: { pantalla: 'perfil' },
                    },
                },
            ];
        case 'jorge':
            // no está en el prototipo: el Inicio de Jorge con actividad (el del prototipo es el recién registrado,
            // getHomeFeed('jorge', { recienRegistrado: true })). Usa sus datos de ACT-02, EXP-01 y PRF-01.
            return [
                {
                    tipo: 'novedades', titulo: 'Postulaciones con novedades',
                    items: [
                        {
                            id: 'nov-jorge-entrevista', iniciales: 'SA', titulo: 'Seguridad Andes Ltda. te citó a entrevista',
                            detalle: 'Guardia de seguridad 4x4 · mar 15 dic · 10:00', estado: 'Entrevista',
                            destino: { pantalla: 'proceso', processId: 'proc-jorge-guardia-4x4' },
                        },
                        {
                            id: 'nov-jorge-hotel', iniciales: 'HA', titulo: 'Hotel Andino avanzó tu postulación',
                            detalle: 'Guardia de seguridad, turno de noche', estado: 'En proceso',
                            destino: { pantalla: 'proceso', processId: 'proc-jorge-guardia-noche' },
                        },
                    ],
                },
                { tipo: 'turnos', titulo: 'Turnos para ti', accion: 'Ver todos', publicaciones: ['turno-guardia-concierto', 'turno-guardia-feria-navidena'] },
                { tipo: 'empleos', titulo: 'Empleos para ti', accion: 'Ver todos', publicaciones: ['empleo-conserje', 'empleo-supervisor-seguridad'] },
                {
                    tipo: 'completar',
                    aviso: {
                        titulo: 'Te falta 1 cosa', badge: 'Recomendado',
                        texto: 'Sube tu CV: lo piden varias ofertas de empleo de jornada completa.', accion: 'Subir CV en PDF',
                        destino: { pantalla: 'perfil' },
                    },
                },
            ];
        case 'pedro':
            // no está en el prototipo: el Inicio de Pedro, con sus datos del flujo 3.
            return [
                {
                    tipo: 'novedades', titulo: 'Postulaciones con novedades',
                    items: [
                        {
                            id: 'nov-pedro-entrevista', iniciales: 'TA', titulo: 'Taller Los Aromos te citó a entrevista',
                            detalle: 'Mecánico/a automotriz · lun 14 dic · 09:00', estado: 'Entrevista',
                            destino: { pantalla: 'proceso', processId: 'proc-pedro-mecanico' },
                        },
                    ],
                },
                { tipo: 'empleos', titulo: 'Empleos para ti', accion: 'Ver todos', publicaciones: ['empleo-mantencion-flota', 'empleo-electromecanico'] },
            ];
        case 'carolina':
            // INI-01-carolina.
            return [
                {
                    tipo: 'que-necesitas', titulo: '¿Qué necesitas?',
                    opciones: [
                        { id: 'asesor-hogar', texto: 'Asesor/a del hogar' },
                        { id: 'cuidador-infantil', texto: 'Cuidador/a infantil' },
                        { id: 'cuidador-adulto-mayor', texto: 'Cuidador/a de adulto mayor' },
                        { id: 'banquetero-evento', texto: 'Banquetero/a para un evento' },
                    ],
                },
                { tipo: 'tu-aviso', titulo: 'Tu aviso', publicationId: 'aviso-asesor-hogar', detalle: '6 postulantes nuevos', estado: 'Activa' },
                { tipo: 'publicar', texto: 'Publicar' },
            ];
        case 'rosa':
            // INI-01-rosa.
            return [
                {
                    tipo: 'vacio',
                    estado: {
                        icono: 'agregar', titulo: 'Aún no tienes perfiles',
                        texto: 'Agrega uno para buscar trabajo o contratar para tu hogar. Tus publicaciones siguen en Banquetería Rosa SpA.',
                        accion: 'Agregar un perfil', destino: { pantalla: 'perfil' },
                    },
                },
            ];
        case 'banqueteria': {
            // INI-02.
            const panel = getOrgDashboard('banqueteria');
            return panel ? [{ tipo: 'panel', panel }] : [];
        }
    }
}

/** INI-01-jorge-nuevo: el Inicio de Jorge al terminar el onboarding (flujo 1). */
const BLOQUES_JORGE_NUEVO: DemoHomeBlock[] = [
    {
        tipo: 'vacio',
        estado: {
            icono: 'empleo', titulo: 'Aún no tienes actividad',
            texto: 'Cuando postules a un empleo o tomes un turno, aquí verás tu agenda y sus novedades.',
            accion: 'Ver empleos cerca', destino: { pantalla: 'explorar', tipo: 'empleo' },
        },
    },
    {
        tipo: 'completar',
        aviso: {
            titulo: 'Te falta la credencial SPD', badge: 'Obligatoria',
            texto: 'Sin ella no podrás ser confirmado en turnos de guardia.', accion: 'Subir credencial',
            destino: { pantalla: 'verificacion' },
        },
    },
];

// ─── Funciones de acceso ────────────────────────────────────────────────────

/** Bandeja de notificaciones: una organización usa la de la persona que la administra. */
function inboxOf(viewerId: DemoViewerId): DemoViewerId {
    return viewerId === 'marta' ? viewerId : (DEMO_ACTORS[viewerId].owner ?? viewerId);
}

/**
 * Inicio del actor (INI-01, o INI-02 para una organización). Con
 * `recienRegistrado`, Jorge ve el Inicio vacío del final del onboarding
 * (INI-01-jorge-nuevo); los demás actores no tienen esa variante.
 */
export function getHomeFeed(actorId: DemoActorId, opciones: { recienRegistrado?: boolean } = {}): DemoHomeFeed {
    const actor = DEMO_ACTORS[actorId];
    const persona = actor.owner ? DEMO_ACTORS[actor.owner] : actor;
    const saludo = `Hola, ${persona.shortName}`;
    if (opciones.recienRegistrado && actorId === 'jorge') {
        return { actorId, saludo, notificacionesSinLeer: 0, mensajesSinLeer: 0, bloques: BLOQUES_JORGE_NUEVO };
    }
    return {
        actorId,
        saludo,
        notificacionesSinLeer: getNotifications(actorId).filter((n) => n.sinLeer).length,
        mensajesSinLeer: getConversations(actorId).reduce((total, c) => total + c.sinLeer, 0),
        bloques: bloquesInicio(actorId),
    };
}

/** Explorar: empleos (deck o lista) y turnos por día. */
export function getExplore(actorId: DemoActorId): DemoExplore {
    const explore = DEMO_EXPLORE.find((e) => e.actorId === actorId);
    if (!explore) throw new Error(`Sin datos de Explorar para ${actorId}`);
    return explore;
}

export function getPublication(id: string): DemoPublication | undefined {
    return DEMO_PUBLICATIONS.find((p) => p.id === id);
}

/** ACT-02 · Postulaciones, en el orden del prototipo (empleos y luego turnos). */
export function getApplications(actorId: DemoActorId): DemoApplication[] {
    return DEMO_APPLICATIONS.filter((a) => a.actorId === actorId);
}

export function getApplication(id: string): DemoApplication | undefined {
    return DEMO_APPLICATIONS.find((a) => a.id === id);
}

/** PRC-01. */
export function getProcess(id: string): DemoProcess | undefined {
    return DEMO_PROCESSES.find((p) => p.id === id);
}

/** MSG-01: los nuevos matches llevan `nuevoMatch` y van arriba, sin mensajes. */
export function getConversations(viewerId: DemoViewerId): DemoConversation[] {
    return DEMO_CONVERSATIONS.filter((c) => c.viewerId === viewerId);
}

/** MSG-02. */
export function getConversation(id: string): DemoConversation | undefined {
    return DEMO_CONVERSATIONS.find((c) => c.id === id);
}

/** NOT-01: la bandeja de la persona (una organización ve la de quien la administra), agrupada por `grupo`. */
export function getNotifications(viewerId: DemoViewerId): DemoNotification[] {
    const inbox = inboxOf(viewerId);
    return DEMO_NOTIFICATIONS.filter((n) => n.viewerId === inbox);
}

/** ACT-01 · Agenda, en orden de fecha. «Hoy en tu agenda» son los de `esHoy`. */
export function getAgenda(actorId: DemoActorId): DemoAgendaEvent[] {
    return DEMO_AGENDA.filter((e) => e.viewerId === actorId);
}

/** PRF-01 y CFG-01. */
export function getProfile(actorId: DemoActorId): DemoProfile {
    const profile = DEMO_PROFILES.find((p) => p.actorId === actorId);
    if (!profile) throw new Error(`Sin perfil de demostración para ${actorId}`);
    return profile;
}

/** INI-02. Solo Banquetería Rosa SpA tiene panel. */
export function getOrgDashboard(orgId: string): DemoOrgDashboard | undefined {
    return DEMO_ORG_DASHBOARDS.find((d) => d.orgId === orgId);
}

/** GES-01, GES-02 y GES-04 de una publicación propia. */
export function getManagedPublication(publicationId: string): DemoManagedPublication | undefined {
    return DEMO_MANAGED_PUBLICATIONS.find((m) => m.publicationId === publicationId);
}

export function getOrg(id: string): DemoOrg | undefined {
    return DEMO_ORGS.find((o) => o.id === id);
}

export function getPerson(id: string): DemoPerson | undefined {
    return DEMO_PERSONS.find((p) => p.id === id);
}
