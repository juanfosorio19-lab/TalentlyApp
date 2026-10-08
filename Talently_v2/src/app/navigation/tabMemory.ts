// Memoria por pestaña (spec §5.3 regla 1): cambiar de pestaña hace replace y
// conserva la última subruta y el scroll de cada una. Vive en memoria: al
// reabrir la app todo parte en Inicio.
import { paths, type TabKey } from '../paths';

type Entry = { url: string; scrollY: number };

const memory = new Map<TabKey, Entry>();

export function rememberTab(tab: TabKey, url: string, scrollY: number): void {
    memory.set(tab, { url, scrollY });
}

/** Última subruta visitada de la pestaña, o su raíz. */
export function lastUrlOf(tab: TabKey): string {
    return memory.get(tab)?.url ?? paths[tab]();
}

export function lastScrollOf(tab: TabKey, url: string): number {
    const e = memory.get(tab);
    return e && e.url === url ? e.scrollY : 0;
}
