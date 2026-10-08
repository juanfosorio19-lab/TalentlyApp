// Bandeja de notificaciones con su estado de leído. Mientras Supabase está
// pausado, lo leído vive en memoria (dura la sesión de la app): la campana de
// Inicio, NOT-01 y el punto de «Usar Talently como» leen de aquí, así tocar
// una notificación baja el contador en todas partes (INI-02-cambio: 2 → 1).
import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { useSearchParams } from 'react-router-dom';
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

/** INI-01-jorge-nuevo: la URL trae `nuevo=1` (`?demo=jorge&nuevo=1`). */
export function useRecienRegistrado(): boolean {
    const [hashSearch] = useSearchParams();
    // Lo de antes del # no cambia mientras la app está abierta: se lee una vez.
    const [fromLocation] = useState(() => nuevoEnUrl(new URLSearchParams()));
    return fromLocation || hashSearch.get('nuevo') === '1';
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
