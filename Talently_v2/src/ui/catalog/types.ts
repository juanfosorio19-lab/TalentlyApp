import type { JSX } from 'react';

/** Grupos del catálogo vivo (/dev/ui), en el orden en que se muestran. */
export const CATALOG_GROUPS = [
    'Marca',
    'Acciones',
    'Selección',
    'Campos',
    'Datos y confianza',
    'Capas',
    'Avisos y estados',
    'Estructura',
    'Publicaciones',
    'Chat y match',
    'Agenda y archivos',
] as const;

export type CatalogGroup = (typeof CATALOG_GROUPS)[number];

/** Lo que exporta por defecto cada `src/ui/<Nombre>/<Nombre>.demo.tsx`. */
export interface DemoModule {
    /** Nombre del componente tal como en el sistema de diseño («Button»). */
    name: string;
    group: CatalogGroup;
    /** Una línea: qué es y cuándo se usa. */
    summary: string;
    /** Muestra variantes y estados con datos reales de ejemplo. */
    Demo: () => JSX.Element;
}
