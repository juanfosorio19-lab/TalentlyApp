// Turnos que la persona canceló en esta sesión (TUR-01 → «Cancelar turno»).
// Mientras Supabase está pausado, la cancelación vive en memoria: Mi turno,
// Postulaciones y la Agenda la ven igual hasta recargar la app. Cuando vuelva
// la base de datos, la cancelación es una RPC y este módulo se borra.
import { useSyncExternalStore } from 'react';

let cancelled: ReadonlySet<string> = new Set();
const listeners = new Set<() => void>();

/** Marca cancelado el turno de esta postulación (id de DemoApplication). */
export function cancelShift(applicationId: string): void {
    if (cancelled.has(applicationId)) return;
    cancelled = new Set([...cancelled, applicationId]);
    listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

const snapshot = () => cancelled;

/** Ids de postulación con el turno cancelado. */
export function useCancelledShifts(): ReadonlySet<string> {
    return useSyncExternalStore(subscribe, snapshot, snapshot);
}
