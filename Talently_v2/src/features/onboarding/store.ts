// El borrador del registro, en UN solo lugar para todos los pasos: lo que se
// escribe en un paso sigue ahí al volver, al retomar desde «Ya tengo cuenta» o
// al pasar de ONB-T4 a ONB-99 (la credencial y la foto). Vive en memoria
// mientras la app está abierta: cuando vuelva Supabase, es `onboarding_progress`
// (se guarda en el servidor al «Continuar», spec §6.1 regla 5).
import { useSyncExternalStore } from 'react';
import {
    borradorInicial,
    pesoLegible,
    type Bloque,
    type CuentaDraft,
    type DatosDraft,
    type Intencion,
    type OnboardingDraft,
    type TrabajoDraft,
} from './model';

let draft: OnboardingDraft = borradorInicial();
const listeners = new Set<() => void>();

function emit(next: OnboardingDraft): void {
    draft = next;
    listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

const snapshot = () => draft;

export function useDraft(): OnboardingDraft {
    return useSyncExternalStore(subscribe, snapshot, snapshot);
}

export function getDraft(): OnboardingDraft {
    return draft;
}

export function setCuenta(patch: Partial<CuentaDraft>): void {
    emit({ ...draft, cuenta: { ...draft.cuenta, ...patch } });
}

export function setIntenciones(intenciones: Intencion[]): void {
    emit({ ...draft, intenciones });
}

export function setBloque(bloque: Bloque | null): void {
    emit({ ...draft, bloque });
}

export function setDatos(patch: Partial<DatosDraft>): void {
    if (patch.foto !== undefined && draft.datos.foto && patch.foto !== draft.datos.foto) URL.revokeObjectURL(draft.datos.foto);
    emit({ ...draft, datos: { ...draft.datos, ...patch } });
}

export function setTrabajo(patch: Partial<TrabajoDraft> | ((t: TrabajoDraft) => TrabajoDraft)): void {
    const trabajo = typeof patch === 'function' ? patch(draft.trabajo) : { ...draft.trabajo, ...patch };
    emit({ ...draft, trabajo });
}

export function setRetomar(path: string | null): void {
    emit({ ...draft, retomar: path });
}

/** Al terminar el onboarding: el próximo registro parte de cero. */
export function resetDraft(): void {
    stopUpload();
    if (draft.datos.foto) URL.revokeObjectURL(draft.datos.foto);
    emit(borradorInicial());
}

// ─── Subida de la credencial (simulada: Supabase está pausado) ──────────────

const UPLOAD_STEP_MS = 200;
const UPLOAD_STEP = 20;
let uploadTimer: number | null = null;

function stopUpload(): void {
    if (uploadTimer !== null) window.clearInterval(uploadTimer);
    uploadTimer = null;
}

function setCredencial(patch: Partial<TrabajoDraft['credencial']>): void {
    setTrabajo((t) => ({ ...t, credencial: { ...t.credencial, ...patch } }));
}

/**
 * Sube la credencial: avanza el porcentaje y queda «En revisión». Sigue
 * aunque la persona cambie de paso (como una subida real).
 */
export function subirCredencial(file: { name: string; size: number }): void {
    stopUpload();
    setCredencial({ estado: 'subiendo', progreso: 0, archivo: { nombre: file.name, peso: pesoLegible(file.size) } });
    uploadTimer = window.setInterval(() => {
        const progreso = Math.min(100, draft.trabajo.credencial.progreso + UPLOAD_STEP);
        if (progreso < 100) {
            setCredencial({ progreso });
            return;
        }
        stopUpload();
        setCredencial({ estado: 'revision', progreso: 100 });
    }, UPLOAD_STEP_MS);
}

/** «Cancelar subida» o el basurero «Quitar archivo»: vuelve a pedirla. */
export function quitarCredencial(): void {
    stopUpload();
    setCredencial({ estado: 'pendiente', progreso: 0, archivo: null });
}

export function credencialDespues(): void {
    setCredencial({ estado: 'despues' });
}

// ─── Dónde empezó el recorrido (para salir sin dejar los pasos en el historial) ──

let entryIdx: number | null = null;

/** Índice de React Router en el historial (`history.state.idx`). */
export function historyIndex(): number {
    const state = window.history.state as { idx?: number } | null;
    return typeof state?.idx === 'number' ? state.idx : 0;
}

/**
 * Marca la entrada del historial donde empezó el recorrido. Bienvenida la
 * marca siempre (es el inicio); los demás pasos solo si no hay marca o si se
 * volvió más atrás que ella.
 */
export function markFlowEntry(force: boolean): void {
    const idx = historyIndex();
    if (force || entryIdx === null || idx < entryIdx) entryIdx = idx;
}

/** Cuántas entradas hay que volver para quedar donde empezó el recorrido (y olvidar la marca). */
export function takeFlowDepth(): number {
    const depth = entryIdx === null ? 0 : Math.max(0, historyIndex() - entryIdx);
    entryIdx = null;
    return depth;
}
