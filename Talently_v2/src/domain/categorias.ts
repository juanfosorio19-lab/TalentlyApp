// Categorías del catálogo (solo datos; src/domain no importa nada de src/ui).
// `key` es la clave estable: el `slug` de nivel 1 de la tabla `categories`
// (docs/rediseno/03-base-de-datos.md §8 y §8.5). `name` es el nombre corto que
// muestra la interfaz, tal como en el sistema de diseño (assets/Iconos/icons.json
// «usage», components/IconsCategories y components/CategoryGrid).

export interface Category<K extends string = string> {
    /** Clave estable (slug de nivel 1). Nunca se muestra. */
    readonly key: K;
    /** Nombre en español de Chile, tal como se muestra. */
    readonly name: string;
}

/** Las 16 categorías de oficio, en el orden fijo del catálogo. Tecnología es una más. */
export const JOB_CATEGORIES = [
    { key: 'tecnologia', name: 'Tecnología' },
    { key: 'administracion', name: 'Administración' },
    { key: 'comercio', name: 'Comercio' },
    { key: 'gastronomia-eventos', name: 'Gastronomía y eventos' },
    { key: 'hogar-cuidados', name: 'Hogar y cuidados' },
    { key: 'seguridad', name: 'Seguridad' },
    { key: 'construccion', name: 'Construcción' },
    { key: 'industria', name: 'Industria' },
    { key: 'transporte-logistica', name: 'Transporte' },
    { key: 'automotriz', name: 'Automotriz' },
    { key: 'educacion', name: 'Educación' },
    { key: 'salud-bienestar', name: 'Salud' },
    { key: 'limpieza', name: 'Limpieza' },
    { key: 'agro-mineria-energia', name: 'Agro y minería' },
    { key: 'profesionales', name: 'Profesionales' },
    { key: 'creativos-eventos', name: 'Creativos' },
] as const satisfies readonly Category[];

export type JobCategoryKey = (typeof JOB_CATEGORIES)[number]['key'];
export type JobCategory = (typeof JOB_CATEGORIES)[number];

/** Las 10 categorías de clase, en el orden oficial (icons.json «classOrder»). */
export const CLASS_CATEGORIES = [
    { key: 'clases-escolar', name: 'Escolar' },
    { key: 'clases-paes', name: 'PAES' },
    { key: 'clases-universitaria', name: 'Universitaria' },
    { key: 'clases-idiomas', name: 'Idiomas' },
    { key: 'clases-musica', name: 'Música' },
    { key: 'clases-arte', name: 'Arte' },
    { key: 'clases-deporte', name: 'Deporte' },
    { key: 'clases-tecnologia', name: 'Tecnología' },
    { key: 'clases-oficios', name: 'Oficios' },
    { key: 'clases-apoyo', name: 'Apoyo especializado' },
] as const satisfies readonly Category[];

export type ClassCategoryKey = (typeof CLASS_CATEGORIES)[number]['key'];
export type ClassCategory = (typeof CLASS_CATEGORIES)[number];
