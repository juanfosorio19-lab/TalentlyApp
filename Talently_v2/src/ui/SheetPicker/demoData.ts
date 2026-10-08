// Datos de ejemplo SOLO para el catálogo /dev/ui (Select, SheetPicker,
// MoneyField y DynamicFields). Las pantallas leen las comunas y los oficios
// de la base de datos, nunca de aquí.
import {
    IconClassArt,
    IconClassLanguages,
    IconClassMusic,
    IconClassPaes,
    IconClassSchool,
    IconClassSports,
    IconClassSupport,
    IconClassTech,
    IconClassTrades,
    IconClassUniversity,
} from '../icons';
import type { SheetPickerOption } from './SheetPicker';

/** Clave estable a partir del nombre («Ñuñoa» → «nunoa»), solo para la demo. */
function slug(name: string): string {
    return name
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
        .replace(/\s+/g, '-');
}

/** Las 52 comunas de la Región Metropolitana, como en SheetPicker/preview.html. */
export const COMUNAS_RM: readonly SheetPickerOption[] = [
    'Alhué', 'Buin', 'Calera de Tango', 'Cerrillos', 'Cerro Navia', 'Colina', 'Conchalí', 'Curacaví',
    'El Bosque', 'El Monte', 'Estación Central', 'Huechuraba', 'Independencia', 'Isla de Maipo',
    'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Lampa', 'Las Condes',
    'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'María Pinto', 'Melipilla', 'Ñuñoa',
    'Padre Hurtado', 'Paine', 'Pedro Aguirre Cerda', 'Peñaflor', 'Peñalolén', 'Pirque', 'Providencia',
    'Pudahuel', 'Puente Alto', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Bernardo',
    'San Joaquín', 'San José de Maipo', 'San Miguel', 'San Pedro', 'San Ramón', 'Santiago', 'Talagante',
    'Tiltil', 'Vitacura',
].map((name) => ({ value: slug(name), label: name }));

/** Oficios de Gastronomía y eventos, con sus sinónimos de búsqueda (onboarding §2.3). */
export const OFICIOS_GASTRONOMIA: readonly SheetPickerOption[] = [
    { value: 'garzon', label: 'Garzón o garzona', keywords: ['mesero', 'mesera', 'camarero'] },
    { value: 'banquetero', label: 'Banquetero/a', keywords: ['banquetería', 'garzón de eventos', 'catering'] },
    { value: 'bartender', label: 'Bartender', keywords: ['barman', 'coctelero'] },
    { value: 'cocinero', label: 'Cocinero/a', keywords: ['cocinera', 'chef'] },
    { value: 'ayudante-cocina', label: 'Ayudante de cocina', keywords: ['auxiliar de cocina'] },
    { value: 'pastelero', label: 'Pastelero/a', keywords: ['repostero', 'pastelería'] },
    { value: 'copero', label: 'Copero/a', keywords: ['lavaplatos'] },
    { value: 'barista', label: 'Barista', keywords: ['cafetero'] },
    { value: 'anfitrion', label: 'Anfitrión o anfitriona', keywords: ['hostess', 'recepcionista de eventos'] },
    { value: 'montaje-eventos', label: 'Montaje de eventos', keywords: ['montajista', 'staff de eventos'] },
];

/** Las 10 categorías de clase con su ícono (icons.json «classOrder»), para la fila con ícono. */
export const CATEGORIAS_CLASE: readonly SheetPickerOption[] = [
    { value: 'clases-escolar', label: 'Escolar', icon: IconClassSchool, description: 'Básica y media: matemática, lenguaje, ciencias' },
    { value: 'clases-paes', label: 'PAES', icon: IconClassPaes },
    { value: 'clases-universitaria', label: 'Universitaria', icon: IconClassUniversity },
    { value: 'clases-idiomas', label: 'Idiomas', icon: IconClassLanguages },
    { value: 'clases-musica', label: 'Música', icon: IconClassMusic },
    { value: 'clases-arte', label: 'Arte', icon: IconClassArt },
    { value: 'clases-deporte', label: 'Deporte', icon: IconClassSports },
    { value: 'clases-tecnologia', label: 'Tecnología', icon: IconClassTech },
    { value: 'clases-oficios', label: 'Oficios', icon: IconClassTrades },
    { value: 'clases-apoyo', label: 'Apoyo especializado', icon: IconClassSupport },
];
