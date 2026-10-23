// Lo que la persona cambia en su perfil durante la sesión de demostración, en
// UN solo lugar para Perfil (PRF-01, PRF-02, PRF-03), Inicio («Te falta 1
// cosa · Subir CV») y DET-02 (el CV «Del perfil»): las secciones editadas, el
// CV subido y el «Avisarme» de PRF-12. Vive en memoria mientras la app está
// abierta (al recargar vuelve a los datos). Cuando vuelva Supabase, cada
// acción es una escritura en el perfil y el CV, un archivo en Storage.
import { useCallback, useSyncExternalStore } from 'react';
import { getProfile } from './data';
import type { DemoActorId } from './session';
import type { DemoCv, DemoProfileTab } from './types';

/** Un CV subido en la sesión (Subir CV de PRF-01). */
export interface SessionCv extends DemoCv {
    /** Cuándo se subió (ms). */
    at: number;
}

interface ProfileState {
    /** Clave de `profileKey()` → perfiles con lo editado. */
    tabs: ReadonlyMap<string, readonly DemoProfileTab[]>;
    /** Clave de `profileKey()` → CV subido en la sesión. */
    cvs: ReadonlyMap<string, SessionCv>;
    /** PRF-12: actores que pidieron que les avisemos. */
    boostNotify: ReadonlySet<DemoActorId>;
}

const INITIAL: ProfileState = { tabs: new Map(), cvs: new Map(), boostNotify: new Set() };

let state: ProfileState = INITIAL;
const listeners = new Set<() => void>();

function set(next: Partial<ProfileState>): void {
    state = { ...state, ...next };
    listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

const snapshot = () => state;

function useProfileState(): ProfileState {
    return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** Solo para pruebas: vuelve al estado inicial. */
export function resetProfileState(): void {
    set(INITIAL);
}

/** Jorge recién registrado tiene su propio perfil (el del onboarding): sus cambios van aparte. */
export function profileKey(actorId: DemoActorId, recienRegistrado = false): string {
    return recienRegistrado ? `${actorId}:nuevo` : actorId;
}

// ─── Secciones editadas (PRF-03) ────────────────────────────────────────────

/** Los perfiles editados en la sesión, o `undefined` si aún no cambia nada. */
export function useProfileTabs(key: string): readonly DemoProfileTab[] | undefined {
    return useProfileState().tabs.get(key);
}

export function saveProfileTabs(key: string, tabs: readonly DemoProfileTab[]): void {
    const next = new Map(state.tabs);
    next.set(key, tabs);
    set({ tabs: next });
}

// ─── CV (PRF-01 sube; Inicio y DET-02 leen) ─────────────────────────────────

/** El CV que traen los datos en el perfil de trabajo (sección «CV» con archivo), si lo hay. */
export function cvInData(actorId: DemoActorId): DemoCv | undefined {
    let perfiles: readonly DemoProfileTab[] = [];
    try {
        perfiles = getProfile(actorId).perfiles;
    } catch {
        // Sin perfil de demostración: no tiene CV.
    }
    for (const tab of perfiles) {
        for (const s of tab.secciones) {
            if (s.tipo === 'archivo' && s.titulo === 'CV') return { nombre: s.nombre, detalle: s.detalle };
        }
    }
    return undefined;
}

/** Subir CV (PRF-01): reemplaza el anterior. */
export function saveCv(actorId: DemoActorId, cv: DemoCv, recienRegistrado = false): void {
    const cvs = new Map(state.cvs);
    cvs.set(profileKey(actorId, recienRegistrado), { nombre: cv.nombre, detalle: cv.detalle, at: Date.now() });
    set({ cvs });
}

/** El CV de la persona sin React: el subido en la sesión o el de los datos (recién registrado, solo el de la sesión). */
export function getCv(actorId: DemoActorId, recienRegistrado = false): DemoCv | undefined {
    return cvOf(state, actorId, recienRegistrado);
}

/** El CV de la persona al día con la sesión. Inicio deja de pedirlo y DET-02 lo ofrece «Del perfil». */
export function useCv(actorId: DemoActorId, recienRegistrado = false): DemoCv | undefined {
    return cvOf(useProfileState(), actorId, recienRegistrado);
}

function cvOf(s: ProfileState, actorId: DemoActorId, recienRegistrado: boolean): DemoCv | undefined {
    const session = s.cvs.get(profileKey(actorId, recienRegistrado));
    if (session) return { nombre: session.nombre, detalle: session.detalle };
    return recienRegistrado ? undefined : cvInData(actorId);
}

// ─── Impulsa tu perfil (PRF-12) ─────────────────────────────────────────────

/** PRF-12: ¿ya pidió que le avisemos? */
export function useBoostNotify(actorId: DemoActorId): [boolean, () => void] {
    const on = useProfileState().boostNotify.has(actorId);
    const turnOn = useCallback(() => {
        if (state.boostNotify.has(actorId)) return;
        set({ boostNotify: new Set([...state.boostNotify, actorId]) });
    }, [actorId]);
    return [on, turnOn];
}

export function getProfileState(): ProfileState {
    return state;
}
