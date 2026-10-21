// Rutas de Explorar que paths.ts todavía no sabe armar (pedido en «requests»):
// la vista del deck o la lista (?vista=) y la publicación de Personas sugeridas
// (?p=, spec §5.4 EXP-05). Se arman sobre paths.explorar para no escribir la
// ruta a mano; cuando paths.explorar acepte estos parámetros, este archivo sobra.
import { paths, type ExploreType } from '../../app/paths';

export type ExploreVista = 'deck' | 'lista';

export interface ExploreParams {
    tipo?: ExploreType;
    vista?: ExploreVista;
    /** EXP-05: la publicación para la que se sugieren personas. */
    p?: string;
}

export function explorarUrl({ tipo, vista, p }: ExploreParams): string {
    const base = paths.explorar(tipo);
    const extra = new URLSearchParams();
    if (vista) extra.set('vista', vista);
    if (p) extra.set('p', p);
    const rest = extra.toString();
    if (!rest) return base;
    return `${base}${base.includes('?') ? '&' : '?'}${rest}`;
}

/**
 * Destinos que paths.ts ya define pero que el router todavía no tiene: hoy
 * terminarían en SYS-404. Mientras estén aquí, tocarlos muestra el Snackbar
 * honesto «Disponible pronto» (useLinks().openRoute); cuando su pantalla
 * exista, se quitan de esta lista y el mismo botón navega.
 */
const PENDING_ROUTES: readonly string[] = [
    '/u/', // PRF-10 · perfil público de persona
    '/publicaciones/', // GES-01, GES-02 y GES-04
];

export function isPendingRoute(path: string): boolean {
    return PENDING_ROUTES.some((p) => (p.endsWith('/') ? path.startsWith(p) : path === p || path.startsWith(`${p}?`)));
}
