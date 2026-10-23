// Datos que Explorar necesita y que src/features/demo todavía no entrega
// (pedidos en «requests»). Solo ids y textos de catálogo: las personas, las
// publicaciones y sus montos siguen saliendo de las funciones get… de la demo.
// Cuando la demo (o Supabase) los traiga, este archivo se borra.

/**
 * EXP-05 · Personas sugeridas: quiénes calzan con el oficio de cada
 * publicación propia. Son personas que ya existen en la demo (getPerson);
 * la pantalla descarta a quienes ya están en los cupos o ya postularon.
 */
const GARZONES = [
    'javiera-contreras',
    'felipe-araya',
    'daniela-gomez',
    'sebastian-perez',
    'constanza-leiva',
    'martin-silva',
    'fernanda-castro',
    'nicolas-vargas',
    'antonia-reyes',
    'matias',
];
const GUARDIAS = ['hector-salinas', 'ricardo-bravo', 'paola-nunez', 'cristian-mella', 'jorge'];
const BARTENDERS = ['diego-navarro', 'ignacio-morales', 'catalina-torres', 'valeria-campos', 'benjamin-herrera'];
const ASESORAS = [
    'marta',
    'gladys-mamani',
    'carmen-paredes',
    'patricia-soto',
    'juana-condori',
    'elena-rivas',
    'sonia-paz',
    'veronica-lagos',
    'lorena-diaz',
];

export const CANDIDATOS_POR_PUBLICACION: Readonly<Record<string, readonly string[]>> = {
    'turno-garzones-finde': GARZONES,
    'turno-garzones-coctel-corporativo': GARZONES,
    'turno-garzones-almuerzo': GARZONES,
    'turno-garzones-matrimonio': GARZONES,
    'turno-guardia-eventos-19dic': GUARDIAS,
    'empleo-bartender': BARTENDERS,
    'aviso-asesor-hogar': ASESORAS,
};

/** Lo que tarda «Tomar turno» en responder en la demo (igual que DET-01). */
export const TOMAR_TURNO_MS = 600;


/**
 * EXP-07 · Sinónimos de búsqueda (spec §4.5 «synonyms»): palabras que la
 * gente escribe y que nunca se muestran en la interfaz. Sin tildes y en
 * minúsculas (como `fold`). Cada uno lleva a los oficios con su nombre digno
 * (brief M5·L1: «nana» → Asesor/a del hogar y Cuidador/a infantil;
 * «mucama» → Camarero/a de pisos; «babysitter» → Cuidador/a infantil): esos
 * son los Chips de sugerencia bajo el buscador y lo que se busca. Cuando
 * exista el diccionario único en src/domain (categories.synonyms), se usa ese.
 */
export const SINONIMOS: Readonly<Record<string, readonly string[]>> = {
    nana: ['Asesor/a del hogar', 'Cuidador/a infantil'],
    empleada: ['Asesor/a del hogar'],
    mucama: ['Camarero/a de pisos'],
    babysitter: ['Cuidador/a infantil'],
    ninera: ['Cuidador/a infantil'],
    // Garzón: la forma femenina y el plural no calzan con «Garzón» ni con «Garzones» al revés.
    garzona: ['Garzón/a'],
    garzones: ['Garzón/a'],
    garzonas: ['Garzón/a'],
    mesero: ['Garzón/a'],
    mesera: ['Garzón/a'],
    // Las mismas palabras que reconoce el catálogo de oficios del onboarding (keywords).
    camarero: ['Garzón/a'],
    barman: ['Bartender'],
    coctelero: ['Bartender'],
    os10: ['Guardia de seguridad', 'Guardia de eventos'],
    'os-10': ['Guardia de seguridad', 'Guardia de eventos'],
    nochero: ['Guardia de seguridad'],
    vigilante: ['Guardia de seguridad', 'Guardia de eventos'],
    bodeguero: ['Operario/a de bodega'],
    bodeguera: ['Operario/a de bodega'],
    'auxiliar de bodega': ['Operario/a de bodega'],
    'empleada domestica': ['Asesor/a del hogar'],
};

