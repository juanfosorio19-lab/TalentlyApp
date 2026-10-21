// Qué rutas existen de verdad en el router (las registra router.tsx al
// crearse). Así un enlace a una pantalla que todavía no se construye no
// termina en SYS-404: quien navega pregunta canOpen() y, si no existe,
// muestra «Disponible pronto» (useOpenPath). Cuando la pantalla se registra
// en el router, el mismo botón empieza a navegar solo.
import { matchRoutes, type RouteObject } from 'react-router-dom';

let registered: RouteObject[] = [];

export function registerRoutes(routes: RouteObject[]): void {
    registered = routes;
}

/** ¿Hay una pantalla real (no SYS-404) para esta ruta? Acepta `?query` y `#hash`. */
export function canOpen(path: string): boolean {
    const pathname = path.split(/[?#]/)[0] || '/';
    const matches = matchRoutes(registered, pathname);
    const last = matches?.[matches.length - 1];
    return Boolean(last && last.route.path !== '*');
}
