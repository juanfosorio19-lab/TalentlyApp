// Destinos que src/app/paths.ts ya define pero que ninguna pantalla registra
// todavía en el router: hoy terminarían en SYS-404. Sin React, para que lo usen
// tanto links.ts (Snackbar «Disponible pronto») como model.ts (el ContextChip
// elige otro destino). Cuando el dueño de una de estas pantallas registre su
// ruta, se quita de esta lista y el mismo botón navega.

export const PENDING_ROUTES: readonly string[] = [
    '/u/', // PRF-10 · perfil público de persona
    '/o/', // PRF-11 · perfil público de organización
    '/procesos/', // PRC-01 · proceso de selección
    '/publicaciones/', // GES-01, GES-02 y GES-04 · gestionar la publicación
];

export function isPendingRoute(path: string): boolean {
    return PENDING_ROUTES.some((p) => path.startsWith(p));
}
