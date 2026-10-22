// Lo que la persona cambia en su perfil durante la sesión de demostración
// (secciones editadas, CV subido) y el «Avisarme» de PRF-12. Vive en memoria
// mientras la app está abierta: al volver a Perfil, los cambios siguen ahí.
// demo/sessionStore todavía no tiene un lugar para esto (pedido en
// «requests»: `saveProfileTabs` y `useProfileTabs` allá, para que Inicio
// también vea, por ejemplo, que ya subió su CV); ese día este archivo se borra.
import { useCallback, useSyncExternalStore } from 'react';
import type { DemoActorId, DemoProfileTab } from '../demo/types';

interface ProfileEdits {
    /** Clave de `profileKey()` → perfiles con lo editado. */
    tabs: ReadonlyMap<string, readonly DemoProfileTab[]>;
    /** PRF-12: actores que pidieron que les avisemos. */
    boostNotify: ReadonlySet<DemoActorId>;
}

let state: ProfileEdits = { tabs: new Map(), boostNotify: new Set() };
const listeners = new Set<() => void>();

function set(next: Partial<ProfileEdits>): void {
    state = { ...state, ...next };
    listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

const snapshot = () => state;

/** Jorge recién registrado tiene su propio perfil (el del onboarding): sus cambios van aparte. */
export function profileKey(actorId: DemoActorId, recienRegistrado: boolean): string {
    return recienRegistrado ? `${actorId}:nuevo` : actorId;
}

/** Los perfiles editados en la sesión, o `undefined` si aún no cambia nada. */
export function useEditedTabs(key: string): readonly DemoProfileTab[] | undefined {
    return useSyncExternalStore(subscribe, snapshot, snapshot).tabs.get(key);
}

export function saveProfileTabs(key: string, tabs: readonly DemoProfileTab[]): void {
    const next = new Map(state.tabs);
    next.set(key, tabs);
    set({ tabs: next });
}

/** PRF-12: ¿ya pidió que le avisemos? */
export function useBoostNotify(actorId: DemoActorId): [boolean, () => void] {
    const on = useSyncExternalStore(subscribe, snapshot, snapshot).boostNotify.has(actorId);
    const turnOn = useCallback(() => {
        if (state.boostNotify.has(actorId)) return;
        set({ boostNotify: new Set([...state.boostNotify, actorId]) });
    }, [actorId]);
    return [on, turnOn];
}

/** Solo para pruebas: vuelve al estado inicial. */
export function resetProfileEdits(): void {
    set({ tabs: new Map(), boostNotify: new Set() });
}
