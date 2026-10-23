// Memoria por pestaña (spec §5.3 regla 1): cambiar de pestaña hace replace y
// vuelve a la última subruta de cada una (/explorar?tipo=turno). El scroll lo
// restaura ScrollRestoration (RootLayout), con clave por ruta en las raíces
// de pestaña. Vive en memoria: al reabrir la app todo parte en Inicio.
import { paths, type TabKey } from '../paths';

const memory = new Map<TabKey, string>();

export function rememberTab(tab: TabKey, url: string): void {
    memory.set(tab, url);
}

/** Última subruta visitada de la pestaña, o su raíz. */
export function lastUrlOf(tab: TabKey): string {
    return memory.get(tab) ?? paths[tab]();
}

// ─── Inicio debajo de las otras pestañas (paso 5 del atrás, también en la web) ──
//
// En Android, el atrás desde otra pestaña sin historial va a Inicio (paso 5 del
// BackButtonManager). En la web el atrás del navegador no se puede detener:
// sin una entrada de Inicio debajo, saldría de la app. Por eso Inicio queda
// siempre en la primera entrada: al abrir la app en otra pestaña se pone
// debajo (putInicioBelow) y al salir de Inicio por la TabBar se apila la otra
// pestaña en vez de reemplazarla (AppShell).

/** ¿La primera entrada del historial es la raíz de Inicio? Se actualiza cada vez que se pasa por ella. */
let inicioFirst = false;

export function noteFirstEntry(index: number, pathname: string): void {
    if (index === 0) inicioFirst = pathname === paths.inicio();
}

/** ¿La entrada de abajo es Inicio (la primera)? Entonces volver a Inicio es un atrás, no otra entrada. */
export function inicioJustBelow(index: number): boolean {
    return index === 1 && inicioFirst;
}

/**
 * Antes de crear el router: si la app se abre en la raíz de otra pestaña
 * (/mensajes, un enlace), pone Inicio debajo. Una recarga en medio de la
 * sesión (la entrada ya tiene índice) no se toca.
 */
export function putInicioBelow(isTabRootPath: (pathname: string) => boolean): void {
    if (typeof window === 'undefined') return;
    const state = window.history.state as { idx?: unknown } | null;
    if (typeof state?.idx === 'number') return;
    const entry = window.location.hash.replace(/^#/, '');
    const pathname = entry.split(/[?#]/)[0] ?? '';
    if (!isTabRootPath(pathname) || pathname === paths.inicio()) return;
    window.history.replaceState({ usr: null, key: 'inicio', idx: 0 }, '', `#${paths.inicio()}`);
    window.history.pushState({ usr: null, key: 'entrada', idx: 1 }, '', `#${entry}`);
    inicioFirst = true;
}
