// Rutas que Actividad necesita y src/app/paths.ts aún no trae (pedidas en
// requests). Cuando lleguen a paths.ts, este archivo se borra.

export const activityPaths = {
    /** PRF-12 · Impulsa tu perfil (spec §5.4: /perfil/impulsar; la registra profile/routes.tsx). */
    impulsarPerfil: () => '/perfil/impulsar',
} as const;
