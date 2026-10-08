// Rutas del feature que aún no están en src/app/paths.ts (pedidas en «requests»).
// Cuando paths.ts las tenga, este archivo re-exporta las de allá y se borra.
import { paths } from '../../app/paths';

export const profilePaths = {
    /** PRF-12 · Impulsa tu perfil (spec §5.4). */
    impulsar: () => '/perfil/impulsar',
} as const;

/**
 * Destinos que paths.ts ya define pero que el router todavía no tiene: hoy
 * terminarían en SYS-404. Mientras estén aquí, tocarlos muestra el Snackbar
 * honesto «Disponible pronto»; cuando su pantalla exista, se quitan de esta
 * lista y el mismo botón navega (useOpenRoute).
 */
export const PENDING_ROUTES: readonly string[] = [
    paths.verificacion(), // VER-01
    paths.ayuda(), // AYU-01
    paths.terminos(), // LEG-01
    paths.privacidad(), // LEG-02
    '/u/', // PRF-10 · perfil público de persona
    '/o/', // PRF-11 · perfil público de organización
];

export function isPendingRoute(path: string): boolean {
    return PENDING_ROUTES.some((p) => (p.endsWith('/') ? path.startsWith(p) : path === p || path.startsWith(`${p}?`)));
}
