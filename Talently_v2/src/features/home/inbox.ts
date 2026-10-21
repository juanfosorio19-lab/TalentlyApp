// Bandeja de notificaciones con su estado de leído. Mientras Supabase está
// pausado, lo leído vive en memoria (dura la sesión de la app): la campana de
// Inicio, NOT-01 y el punto de «Usar Talently como» leen de aquí, así tocar
// una notificación baja el contador en todas partes (INI-02-cambio: 2 → 1).
import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useDemoSession } from '../demo/session';
import type { DemoNotification } from '../demo/types';
import { getInbox, nuevoEnUrl } from './mock';

let read: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

const snapshot = () => read;

function markRead(ids: readonly string[]): void {
    const next = new Set(read);
    ids.forEach((id) => next.add(id));
    read = next;
    listeners.forEach((l) => l());
}

/**
 * INI-01-jorge-nuevo: la URL con que se abrió la app trae `nuevo=1`
 * (`?demo=jorge&nuevo=1` o `#/inicio?nuevo=1`). Se resuelve una sola vez al
 * arrancar, como el actor de demostración (demo/session.tsx): así vale en toda
 * la sesión, también en NOT-01 y al volver a Inicio, y no depende de que la
 * ruta de ahora conserve el `?nuevo=1`. Pedido moverlo a DemoSession para que
 * lo lean las demás pestañas.
 */
const RECIEN_REGISTRADO = nuevoEnUrl(new URLSearchParams(window.location.hash.split('?')[1] ?? ''));

export function useRecienRegistrado(): boolean {
    return RECIEN_REGISTRADO;
}

export interface Inbox {
    /** Notificaciones del actor (una organización ve la bandeja de quien la administra), con lo leído al día. */
    items: DemoNotification[];
    /** Contador real de la campana. */
    unread: number;
    markRead: (id: string) => void;
    markAllRead: () => void;
}

export function useInbox(): Inbox {
    const { actor } = useDemoSession();
    const recienRegistrado = useRecienRegistrado();
    const readIds = useSyncExternalStore(subscribe, snapshot, snapshot);
    const items = useMemo(
        () => getInbox(actor.id, recienRegistrado).map((n) => (n.sinLeer && readIds.has(n.id) ? { ...n, sinLeer: false } : n)),
        [actor.id, recienRegistrado, readIds],
    );
    const unread = items.filter((n) => n.sinLeer).length;
    const markOne = useCallback((id: string) => markRead([id]), []);
    const markAll = useCallback(() => markRead(items.filter((n) => n.sinLeer).map((n) => n.id)), [items]);
    return { items, unread, markRead: markOne, markAllRead: markAll };
}
