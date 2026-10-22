// El perfil del actor tal como se ve ahora (PRF-01 y PRF-02): los datos de
// la demostración, la variante de Jorge recién registrado, lo verificado en
// la sesión (demo/sessionStore) y lo que la persona editó (store.ts).
import { useCallback, useMemo } from 'react';
import { getProfile } from '../demo/data';
import { useDemoSession } from '../demo/session';
import { phonePendingAtStart, useSessionState } from '../demo/sessionStore';
import type { DemoProfile, DemoProfileTab } from '../demo/types';
import { identityPendingAtStart } from './mock';
import { composeProfile, recienRegistradoProfile, verificationDetails, withoutSessionTips, withPrototypeData } from './model';
import { profileKey, saveProfileTabs, useProfileTabs } from './store';

export interface ProfileState {
    profile: DemoProfile;
    /** Hoja «Verificación de …»: insignia → cómo y cuándo se verificó. */
    verificationDetails: Readonly<Record<string, string>>;
    /** Guarda un perfil (Trabajo, Hogar…) con sus cambios. */
    saveTab: (tab: DemoProfileTab) => void;
}

export function useProfile(): ProfileState {
    const { actor, recienRegistrado } = useDemoSession();
    const { phoneVerified } = useSessionState();
    const key = profileKey(actor.id, recienRegistrado);
    const tabs = useProfileTabs(key);
    const phoneVerifiedInSession = phoneVerified.has(actor.id);

    const profile = useMemo(() => {
        const data = withPrototypeData(getProfile(actor.id));
        const base = recienRegistrado ? recienRegistradoProfile(data) : data;
        return composeProfile(base, {
            phoneVerifiedInSession,
            phonePendingAtStart: phonePendingAtStart(actor.id),
            identityPendingAtStart: !recienRegistrado && identityPendingAtStart(actor.id),
            // VER-02 guarda el envío en su propio feature: pedido en «requests» como
            // `useIdentityStatus(personId)` en demo/sessionStore. Mientras, el Perfil no lo ve.
            identitySubmitted: false,
            tabs,
        });
    }, [actor.id, recienRegistrado, phoneVerifiedInSession, tabs]);

    const details = useMemo(
        () => verificationDetails(actor.id, profile.asiTeVen.verificaciones, phoneVerifiedInSession),
        [actor.id, profile.asiTeVen.verificaciones, phoneVerifiedInSession],
    );

    const saveTab = useCallback(
        (tab: DemoProfileTab) => saveProfileTabs(key, withoutSessionTips(profile.perfiles.map((t) => (t.id === tab.id ? tab : t)))),
        [key, profile.perfiles],
    );

    return { profile, verificationDetails: details, saveTab };
}
