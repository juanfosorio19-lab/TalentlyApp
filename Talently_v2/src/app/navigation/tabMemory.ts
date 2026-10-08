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
