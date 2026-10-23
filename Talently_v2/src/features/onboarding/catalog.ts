// Catálogos que el onboarding necesita mientras Supabase está pausado:
// comunas de la RM, oficios con sus sinónimos (04-perfiles-y-onboarding.md
// §2.3, una selección de los que se contratan como empleo o turno) y las
// opciones de cada paso tal como las muestra el prototipo F1. Cuando vuelva
// la base de datos, salen de `comunas`, `categories` y sus diccionarios.
import type { JobCategoryKey } from '../../domain/categorias';
import { COMUNAS_RM } from '../demo/catalog';

/** Clave estable a partir del nombre («Ñuñoa» → «nunoa», «Puente Alto» → «puente-alto»). Nunca se muestra. */
export function comunaKey(name: string): string {
    return name
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
        .replace(/\s+/g, '-');
}

/** Las 52 comunas de la Región Metropolitana (demo/catalog), con su clave. */
export const COMUNAS: readonly { value: string; label: string }[] = COMUNAS_RM.map((name) => ({
    value: comunaKey(name),
    label: name,
}));

export function comunaName(key: string | null): string | null {
    return COMUNAS.find((c) => c.value === key)?.label ?? null;
}

/** Credencial que pide un oficio (spec §10.1): solo la SPD en esta demostración. */
export type CredentialKey = 'spd';

export interface Oficio {
    /** Slug de `categories` (nunca se muestra). */
    id: string;
    /** Nombre digno, tal como se muestra. */
    name: string;
    category: JobCategoryKey;
    /** Sinónimos de búsqueda: nunca se muestran. */
    keywords: readonly string[];
    /** Credencial obligatoria del oficio (ONB-T4). */
    credential?: CredentialKey;
}

export const OFICIOS: readonly Oficio[] = [
    // Seguridad
    { id: 'guardia-seguridad', name: 'Guardia de seguridad', category: 'seguridad', keywords: ['guardia', 'OS10', 'OS-10', 'nochero'], credential: 'spd' },
    { id: 'guardia-eventos', name: 'Guardia de eventos', category: 'seguridad', keywords: ['seguridad de eventos'], credential: 'spd' },
    { id: 'supervisor-seguridad', name: 'Supervisor/a de seguridad', category: 'seguridad', keywords: ['supervisor de guardias'], credential: 'spd' },
    { id: 'rondin', name: 'Rondín', category: 'seguridad', keywords: ['guardia rondín', 'rondas'], credential: 'spd' },
    { id: 'operador-cctv', name: 'Operador/a de CCTV', category: 'seguridad', keywords: ['central de monitoreo', 'cámaras'] },
    { id: 'conserje', name: 'Conserje o mayordomo', category: 'seguridad', keywords: ['mayordomo de edificio', 'portero'] },
    // Gastronomía, eventos y hotelería
    { id: 'garzon', name: 'Garzón o garzona', category: 'gastronomia-eventos', keywords: ['mesero', 'mesera', 'camarero'] },
    { id: 'banquetero', name: 'Banquetero/a', category: 'gastronomia-eventos', keywords: ['banquetería', 'garzón de eventos', 'catering'] },
    { id: 'bartender', name: 'Bartender', category: 'gastronomia-eventos', keywords: ['barman', 'coctelero'] },
    { id: 'cocinero', name: 'Cocinero/a', category: 'gastronomia-eventos', keywords: ['cocinera', 'chef'] },
    { id: 'ayudante-cocina', name: 'Ayudante de cocina', category: 'gastronomia-eventos', keywords: ['auxiliar de cocina'] },
    { id: 'copero', name: 'Copero/a', category: 'gastronomia-eventos', keywords: ['lavaplatos'] },
    { id: 'barista', name: 'Barista', category: 'gastronomia-eventos', keywords: ['cafetero'] },
    { id: 'anfitrion', name: 'Anfitrión o anfitriona', category: 'gastronomia-eventos', keywords: ['hostess', 'recepcionista de eventos'] },
    { id: 'montaje-eventos', name: 'Montaje de eventos', category: 'gastronomia-eventos', keywords: ['montajista', 'staff de eventos'] },
    { id: 'mucama', name: 'Camarero/a de pisos', category: 'gastronomia-eventos', keywords: ['mucama', 'camarera de hotel', 'housekeeping'] },
    // Comercio
    { id: 'vendedor', name: 'Vendedor/a', category: 'comercio', keywords: ['vendedora', 'dependiente'] },
    { id: 'cajero', name: 'Cajero/a', category: 'comercio', keywords: ['cajera', 'caja'] },
    { id: 'reponedor', name: 'Reponedor/a', category: 'comercio', keywords: ['repositor'] },
    { id: 'promotor', name: 'Promotor/a', category: 'comercio', keywords: ['promotora', 'impulsadora', 'degustadora'] },
    { id: 'call-center', name: 'Ejecutivo/a de call center', category: 'comercio', keywords: ['teleoperador', 'atención telefónica', 'atención al cliente'] },
    // Administración
    { id: 'administrativo', name: 'Administrativo/a', category: 'administracion', keywords: ['asistente administrativo', 'oficinista'] },
    { id: 'recepcionista', name: 'Recepcionista', category: 'administracion', keywords: ['recepción'] },
    // Hogar y cuidados
    { id: 'asesora-hogar', name: 'Asesor/a del hogar', category: 'hogar-cuidados', keywords: ['nana', 'empleada doméstica', 'nana puertas afuera', 'nana por día'] },
    { id: 'ninera', name: 'Cuidador/a infantil', category: 'hogar-cuidados', keywords: ['niñera', 'nana', 'babysitter', 'cuidadora de niños'] },
    { id: 'cuidador-adulto-mayor', name: 'Cuidador/a de adulto mayor', category: 'hogar-cuidados', keywords: ['cuidadora', 'acompañante'] },
    { id: 'jardinero', name: 'Jardinero/a', category: 'hogar-cuidados', keywords: ['jardinería', 'mantención de jardines'] },
    // Construcción
    { id: 'maestro-albanil', name: 'Maestro/a albañil', category: 'construccion', keywords: ['albañil', 'maestro de obra', 'albañilería'] },
    { id: 'pintor', name: 'Pintor/a', category: 'construccion', keywords: ['pintor de casas'] },
    { id: 'jornal', name: 'Jornal', category: 'construccion', keywords: ['peón', 'ayudante de obra', 'jornalero'] },
    { id: 'soldador', name: 'Soldador/a', category: 'construccion', keywords: ['soldadura'] },
    // Industria
    { id: 'operario-produccion', name: 'Operario/a de producción', category: 'industria', keywords: ['operaria', 'línea de producción'] },
    { id: 'operario-bodega', name: 'Operario/a de bodega', category: 'industria', keywords: ['bodeguero', 'auxiliar de bodega', 'picking', 'bodega'] },
    { id: 'operador-grua-horquilla', name: 'Operador/a de grúa horquilla', category: 'industria', keywords: ['grúa', 'horquillero', 'montacargas', 'yale'] },
    { id: 'empaque', name: 'Empaque', category: 'industria', keywords: ['empacador', 'envasado'] },
    // Transporte
    { id: 'peoneta', name: 'Peoneta', category: 'transporte-logistica', keywords: ['ayudante de camión'] },
    { id: 'despachador', name: 'Despachador/a', category: 'transporte-logistica', keywords: ['despacho'] },
    // Limpieza
    { id: 'auxiliar-aseo', name: 'Auxiliar de aseo', category: 'limpieza', keywords: ['aseador', 'personal de aseo'] },
    { id: 'aseo-industrial', name: 'Aseo industrial', category: 'limpieza', keywords: ['limpieza industrial'] },
];

export function getOficio(id: string): Oficio | undefined {
    return OFICIOS.find((o) => o.id === id);
}

/** `experience_range`, en su orden (04-perfiles-y-onboarding.md, ONB-T1). */
export const EXPERIENCIAS = [
    { value: 'sin_experiencia', label: 'Sin experiencia' },
    { value: 'menos_1', label: 'Menos de 1 año' },
    { value: '1_3', label: '1 a 3 años' },
    { value: '3_5', label: '3 a 5 años' },
    { value: '5_10', label: '5 a 10 años' },
    { value: 'mas_10', label: 'Más de 10 años' },
] as const;
export type Experiencia = (typeof EXPERIENCIAS)[number]['value'];

export const JORNADAS = [
    { value: 'completa', label: 'Jornada completa' },
    { value: 'parcial', label: 'Part time' },
    { value: 'part_time_estudiante', label: 'Part time estudiante' },
    { value: 'temporada', label: 'Temporada' },
    { value: 'por_obra', label: 'Por obra' },
] as const;
export type Jornada = (typeof JORNADAS)[number]['value'];

export const DISPONIBLE_DESDE = [
    { value: 'inmediata', label: 'Inmediata' },
    { value: '15_dias', label: 'En 15 días' },
    { value: '1_mes', label: 'En 1 mes' },
    { value: 'a_convenir', label: 'A convenir' },
] as const;
export type DisponibleDesde = (typeof DISPONIBLE_DESDE)[number]['value'];

export const RADIOS = [
    { value: '5', label: '5 km' },
    { value: '10', label: '10 km' },
    { value: '20', label: '20 km' },
    { value: 'region', label: 'Toda la región' },
] as const;
export type Radio = (typeof RADIOS)[number]['value'];

/** Vestimenta propia (catálogo `dress_code`, el de ONB-T3 del prototipo). */
export const VESTIMENTA = [
    { value: 'camisa_blanca', label: 'Camisa blanca' },
    { value: 'pantalon_negro', label: 'Pantalón negro' },
    { value: 'zapatos_negros', label: 'Zapatos negros' },
    { value: 'corbata_humita', label: 'Corbata humita' },
] as const;
export type Vestimenta = (typeof VESTIMENTA)[number]['value'];

/** Campos del oficio de seguridad (`attribute_schemas`, ONB-T4). */
export const SISTEMAS_TURNO = [
    { value: '4x4', label: '4x4' },
    { value: '5x2', label: '5x2' },
    { value: '7x7', label: '7x7' },
    { value: '12h', label: '12 h' },
    { value: 'rotativo', label: 'Rotativo' },
] as const;

export const DIA_NOCHE = [
    { value: 'dia', label: 'De día' },
    { value: 'noche', label: 'De noche' },
] as const;

/** Unidades que ofrece el MoneyField de ONB-T3 (spec §4.3, ONB-T3). */
export const UNIDADES_PAGO = ['mes', 'dia', 'hora', 'turno'] as const;
