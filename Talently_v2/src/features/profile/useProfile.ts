// El perfil del actor tal como se ve ahora (PRF-01 y PRF-02): los datos de
// la demostración, la variante de Jorge recién registrado (lo que dejó su
// onboarding, demo/session), lo verificado en la sesión (demo/sessionStore) y
// lo que la persona editó o subió (demo/profileState, que Inicio y DET-02
// también leen).
import { useCallback, useMemo } from 'react';
import { getProfile } from '../demo/data';
import { useDemoSession } from '../demo/session';
import { phonePendingAtStart, useIdentityStatus, useSessionState } from '../demo/sessionStore';
import type { DemoProfile, DemoProfileTab } from '../demo/types';
import { identityPendingAtStart } from '../demo/verifications';
import { composeProfile, recienRegistradoProfile, verificationDetails, withoutSessionTips } from './model';
import { profileKey, saveProfileTabs, useCv, useProfileTabs } from '../demo/profileState';

export interface ProfileState {
    profile: DemoProfile;
    /** Hoja «Verificación de …»: insignia → cómo y cuándo se verificó. */
    verificationDetails: Readonly<Record<string, string>>;
    /** Guarda un perfil (Trabajo, Hogar…) con sus cambios. */
    saveTab: (tab: DemoProfileTab) => void;
}

export function useProfile(): ProfileState {
    const { actor, recienRegistrado, onboarding } = useDemoSession();
    const { phoneVerified } = useSessionState();
    const key = profileKey(actor.id, recienRegistrado);
    const tabs = useProfileTabs(key);
    const cv = useCv(actor.id, recienRegistrado);
    const phoneVerifiedInSession = phoneVerified.has(actor.id);
    // La identidad enviada en VER-02 (desde VER-01 o desde PUBL-04): la misma de VER-01 y PUBL-04.
    const identitySubmitted = useIdentityStatus(actor.id) === 'review';

    const profile = useMemo(() => {
        const data = getProfile(actor.id);
        const base = recienRegistrado ? recienRegistradoProfile(data, onboarding) : data;
        return composeProfile(base, {
            phoneVerifiedInSession,
            phonePendingAtStart: phonePendingAtStart(actor.id),
            identityPendingAtStart: !recienRegistrado && identityPendingAtStart(actor.id),
            identitySubmitted,
            tabs,
            cv,
        });
    }, [actor.id, recienRegistrado, onboarding, phoneVerifiedInSession, identitySubmitted, tabs, cv]);

    const details = useMemo(
        () => verificationDetails(profile.asiTeVen.verificaciones, phoneVerifiedInSession),
        [profile.asiTeVen.verificaciones, phoneVerifiedInSession],
    );

    const saveTab = useCallback(
        (tab: DemoProfileTab) => saveProfileTabs(key, withoutSessionTips(profile.perfiles.map((t) => (t.id === tab.id ? tab : t)))),
        [key, profile.perfiles],
    );

    return { profile, verificationDetails: details, saveTab };
}
