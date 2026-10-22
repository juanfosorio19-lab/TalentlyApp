// El perfil del actor tal como se ve ahora (PRF-01 y PRF-02): los datos de
// la demostración, la variante de Jorge recién registrado, lo verificado en
// la sesión (demo/sessionStore) y lo que la persona editó (store.ts).
import { useCallback, useMemo } from 'react';
import { getProfile } from '../demo/data';
import { useDemoSession } from '../demo/session';
import { phonePendingAtStart, useSessionState } from '../demo/sessionStore';
import type { DemoProfile, DemoProfileTab } from '../demo/types';
import { composeProfile, recienRegistradoProfile } from './model';
import { profileKey, saveProfileTabs, useEditedTabs } from './store';

export interface ProfileState {
    profile: DemoProfile;
    /** Guarda un perfil (Trabajo, Hogar…) con sus cambios. */
    saveTab: (tab: DemoProfileTab) => void;
}

export function useProfile(): ProfileState {
    const { actor, recienRegistrado } = useDemoSession();
    const { phoneVerified } = useSessionState();
    const key = profileKey(actor.id, recienRegistrado);
    const tabs = useEditedTabs(key);
    const phoneOk = phoneVerified.has(actor.id) || !phonePendingAtStart(actor.id);

    const profile = useMemo(() => {
        const base = recienRegistrado ? recienRegistradoProfile(getProfile(actor.id)) : getProfile(actor.id);
        return composeProfile(base, { phoneVerified: phoneOk, tabs });
    }, [actor.id, recienRegistrado, phoneOk, tabs]);

    const saveTab = useCallback(
        (tab: DemoProfileTab) => saveProfileTabs(key, profile.perfiles.map((t) => (t.id === tab.id ? tab : t))),
        [key, profile.perfiles],
    );

    return { profile, saveTab };
}
