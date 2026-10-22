// Enlaces de Gestionar publicaciones que no son una ruta de paths.ts: el
// historial entre GES-01 y GES-04 (spec §5.3 regla 2) y la URL que se
// comparte desde GES-01. Funciones puras (links.test.ts).

/**
 * Estado del historial de una GES-04 abierta encima de GES-01: cuántas
 * entradas la separan de esa GES-01 (1 = justo encima; 2 = se cambió de día
 * desde «Más opciones», que reemplaza la entrada de la hoja). Con él,
 * «Gestionar publicación» vuelve a la GES-01 que ya está en el historial en
 * vez de apilar otra.
 */
export interface OverManageState {
    overManage: number;
}

export const overManageState = (entries: number): OverManageState => ({ overManage: entries });

/** Las entradas hasta GES-01, o `null` si GES-04 no se abrió encima de una (INI-02, NOT-01, un enlace). */
export function overManageOf(state: unknown): number | null {
    if (typeof state !== 'object' || state === null || !('overManage' in state)) return null;
    const n = state.overManage;
    return typeof n === 'number' && Number.isInteger(n) && n > 0 ? n : null;
}

/** ¿La entrada actual es la de una hoja que abrió la app (useSheet hace push con `{ sheet }`)? */
export function isSheetEntry(state: unknown, sheet: string): boolean {
    return typeof state === 'object' && state !== null && 'sheet' in state && state.sheet === sheet;
}

/**
 * La URL que se comparte (la misma regla que DET-01): la página más la ruta,
 * sin la query de la demo (`?demo=banqueteria`), para que quien la abra vea
 * la publicación como quien busca y no entre como la organización dueña.
 */
export function shareUrl(location: { origin: string; pathname: string }, href: string): string {
    // HashRouter: la página (v3.html) más «#/p/…». BrowserRouter: la ruta sola.
    return href.startsWith('#') ? `${location.origin}${location.pathname}${href}` : `${location.origin}${href}`;
}
