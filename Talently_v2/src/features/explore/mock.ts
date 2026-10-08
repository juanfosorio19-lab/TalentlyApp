// Datos que Explorar necesita y que src/features/demo todavía no entrega
// (pedidos en «requests»). Solo ids y textos de catálogo: las personas, las
// publicaciones y sus montos siguen saliendo de las funciones get… de la demo.
// Cuando la demo (o Supabase) los traiga, este archivo se borra.

/**
 * Oficio de cada turno, para los chips de EXP-02 («Garzón», «Bodega»…).
 * DemoTurno no trae su oficio. «Banqueteros para bautizo» queda sin oficio
 * a propósito: ningún chip de la demo es «Banquetero/a», así que solo aparece
 * con «Todos».
 */
export const OFICIO_DEL_TURNO: Readonly<Record<string, string>> = {
    'turno-bodega-noche': 'Bodega',
    'turno-guardia-concierto': 'Guardia de eventos',
    'turno-garzones-matrimonio': 'Garzón',
    'turno-coctel-lanzamiento': 'Garzón',
    'turno-bartender-ano-nuevo': 'Bartender',
    'turno-guardia-feria-navidena': 'Guardia de eventos',
};

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

/** SHT-COMUNA: las 52 comunas de la Región Metropolitana (no hay catálogo en src/domain todavía). */
export const COMUNAS_RM: readonly string[] = [
    'Alhué', 'Buin', 'Calera de Tango', 'Cerrillos', 'Cerro Navia', 'Colina', 'Conchalí', 'Curacaví',
    'El Bosque', 'El Monte', 'Estación Central', 'Huechuraba', 'Independencia', 'Isla de Maipo',
    'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Lampa', 'Las Condes',
    'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'María Pinto', 'Melipilla', 'Ñuñoa',
    'Padre Hurtado', 'Paine', 'Pedro Aguirre Cerda', 'Peñaflor', 'Peñalolén', 'Pirque', 'Providencia',
    'Pudahuel', 'Puente Alto', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Bernardo',
    'San Joaquín', 'San José de Maipo', 'San Miguel', 'San Pedro', 'San Ramón', 'Santiago', 'Talagante',
    'Tiltil', 'Vitacura',
];

/**
 * Hoja «Verificación de …»: qué revisó Talently según la insignia. La demo
 * no trae la fecha de cada verificación; cuando la traiga, va en la línea.
 */
export const QUE_SE_VERIFICO: Readonly<Record<string, string>> = {
    'Organización verificada': 'Talently revisó su RUT y los documentos de la organización.',
    'Identidad verificada': 'Talently revisó su cédula y una selfie.',
    'Teléfono verificado': 'Confirmó su número con un código.',
    'Credencial SPD verificada': 'Talently revisó su credencial de seguridad privada vigente.',
    'Apta para trabajar con menores': 'Talently revisó su certificado de inhabilidades vigente.',
};
