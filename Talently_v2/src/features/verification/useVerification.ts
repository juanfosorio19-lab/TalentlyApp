// Qué está verificado del actor de la sesión, en UN solo lugar para VER-01 y
// VER-02: los datos de demostración (con la fecha de cada verificación, la
// misma de NOT-01 y de la hoja «Verificación de …»), lo que pasó en la sesión
// (teléfono e identidad en demo/sessionStore, que también leen PUBL-04,
// PUBL-07 y Perfil) y la variante de Jorge recién registrado
// (INI-01-jorge-nuevo: teléfono pendiente y credencial SPD en revisión o por
// subir, según lo que dejó el onboarding).
import { useMemo } from 'react';
import { defaultOnboardingResult, getHomeFeed, getProfile } from '../demo/data';
import { useDemoSession, type DemoActor, type DemoActorId } from '../demo/session';
import type { DemoOnboardingResult } from '../demo/types';
import { phonePendingAtStart, useIdentityStatus, useSessionState } from '../demo/sessionStore';
import {
    IDENTIDAD_VERIFICADA,
    ORGANIZACION_VERIFICADA,
    TELEFONO_VERIFICADO,
    accountSince,
    identityInData,
    phoneInData,
    verificationOf,
} from '../demo/verifications';
import { NEW_ACCOUNT_DATE, SPD_LABEL } from './mock';
import {
    credentialSlug,
    credentialsFromRows,
    organizationLevels,
    personLevels,
    phoneVerifiedOf,
    type Credential,
    type IdentityStatus,
    type Level,
} from './model';
import { COPY } from './copy';

export interface VerificationState {
    actor: DemoActor;
    /** La persona detrás del actor (una organización: quien la administra). */
    personId: DemoActorId;
    isOrganization: boolean;
    levels: Level[];
    credentials: Credential[];
    identity: IdentityStatus;
    phoneVerified: boolean;
    /** Tiene perfil Hogar: la identidad sirve para recibir a alguien en su casa. */
    hogar: boolean;
}

/**
 * Credenciales de la persona: las de su perfil o, recién registrado, la SPD
 * según lo que dejó el onboarding (ONB-T4): «En revisión» si la subió; si no,
 * la que le falta (la misma tarjeta de INI-01-jorge-nuevo).
 */
function credentialsOf(personId: DemoActorId, recienRegistrado: boolean, onboarding?: DemoOnboardingResult): Credential[] {
    if (recienRegistrado) {
        const result = onboarding ?? defaultOnboardingResult();
        if (result.credencial === null) return [];
        const tipo = credentialSlug(SPD_LABEL);
        if (result.credencial === 'revision') return [{ tipo, label: SPD_LABEL, badge: 'En revisión', upload: false }];
        const tip = getHomeFeed(personId, { recienRegistrado, onboarding: result }).bloques.find((b) => b.tipo === 'completar');
        if (!tip || tip.tipo !== 'completar') return [];
        return [{ tipo, label: SPD_LABEL, badge: tip.aviso.badge, detalle: tip.aviso.texto, upload: true }];
    }
    const rows = getProfile(personId).perfiles.flatMap((p) =>
        p.secciones.flatMap((s) => (s.tipo === 'filas' && s.titulo === COPY.ver01.credenciales ? s.filas : [])),
    );
    return credentialsFromRows(rows);
}

export function useVerification(): VerificationState {
    const { actor, recienRegistrado, onboarding } = useDemoSession();
    const { phoneVerified: phonesInSession } = useSessionState();
    const personId = actor.owner ?? actor.id;
    const identityFromData = identityInData(personId, recienRegistrado);
    const identity = useIdentityStatus(personId, identityFromData);

    return useMemo(() => {
        const verifiedInSession = phonesInSession.has(personId);
        const phoneVerified = phoneVerifiedOf({
            inData: phoneInData(personId, recienRegistrado),
            pendingAtStart: phonePendingAtStart(personId),
            verifiedInSession,
        });
        const hogar = !recienRegistrado && actor.capabilities.includes('hogar');
        const isOrganization = actor.kind === 'organizacion';
        // Una sola fecha por verificación: la de los datos (DemoVerification.fecha); lo de esta sesión, «hoy».
        const fechaDe = (id: string, label: string) => verificationOf(id, label)?.fecha ?? 'hoy';
        const levels = isOrganization
            ? organizationLevels(verificationOf(actor.id, ORGANIZACION_VERIFICADA)?.fecha)
            : personLevels({
                  cuentaDesde: recienRegistrado ? NEW_ACCOUNT_DATE : (accountSince(personId) ?? NEW_ACCOUNT_DATE),
                  // Sin insignia propia (la identidad lo supone): desde que existe la cuenta.
                  phone: {
                      verified: phoneVerified,
                      fecha: verifiedInSession
                          ? 'hoy'
                          : (verificationOf(personId, TELEFONO_VERIFICADO)?.fecha ?? accountSince(personId) ?? 'hoy'),
                  },
                  identity: { status: identity, fecha: fechaDe(personId, IDENTIDAD_VERIFICADA) },
                  hogar,
              });
        return {
            actor,
            personId,
            isOrganization,
            levels,
            credentials: isOrganization ? [] : credentialsOf(personId, recienRegistrado, onboarding),
            identity,
            phoneVerified,
            hogar,
        };
    }, [actor, personId, recienRegistrado, onboarding, phonesInSession, identity]);
}
