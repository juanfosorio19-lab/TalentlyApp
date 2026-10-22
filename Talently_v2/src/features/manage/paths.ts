// Rutas que Gestionar publicaciones necesita y src/app/paths.ts aún no trae
// (pedidas en requests). Cuando lleguen a paths.ts, este archivo se borra.
// Mientras no estén en el router, useOpenPath() muestra «Disponible pronto».

export const managePaths = {
    /** GES-05 · Trabajadores favoritos (spec §5.4: /o/:id/favoritos). */
    favoritos: (orgId: string) => `/o/${orgId}/favoritos`,
    /**
     * GES-01 · Editar: reutiliza los pasos del asistente con los datos cargados
     * (01-super-prompt M7). Ni la ruta ni la pantalla existen todavía.
     */
    editar: (publicationId: string) => `/publicaciones/${publicationId}/editar`,
} as const;
