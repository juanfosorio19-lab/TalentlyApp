// Qué está verificado del actor de la sesión, en UN solo lugar para VER-01 y
// VER-02: los datos de demostración, lo que pasó en la sesión (teléfono en
// demo/sessionStore, identidad enviada en store.ts) y la variante de Jorge
// recién registrado (INI-01-jorge-nuevo: teléfono pendiente y credencial SPD
// por subir).
import { useMemo } from 'react';
import { getHomeFeed, getPerson, getProfile } from '../demo/data';
import { useDemoSession, type DemoActor, type DemoActorId } from '../demo/session';
import { phonePendingAtStart, useSessionState } from '../demo/sessionStore';
import { COPY } from './copy';
import { IDENTITY_PENDING_AT_START, NEW_ACCOUNT_DATE, SPD_LABEL, VERIFICATION_DATES } from './mock';
import {
    credentialSlug,
    credentialsFromRows,
    identityStatusOf,
    organizationLevels,
    personLevels,
    phoneVerifiedOf,
    type Credential,
    type IdentityStatus,
    type Level,
} from './model';
import { useIdentitySubmissions } from './store';

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

const has = (personId: DemoActorId, label: string) =>
    getPerson(personId)?.verificaciones.some((v) => v.label === label) ?? false;

/** Credenciales de la persona: las de su perfil o, recién registrado, la SPD que le falta (INI-01-jorge-nuevo). */
function credentialsOf(personId: DemoActorId, recienRegistrado: boolean): Credential[] {
    if (recienRegistrado) {
        const tip = getHomeFeed(personId, { recienRegistrado }).bloques.find((b) => b.tipo === 'completar');
        if (!tip || tip.tipo !== 'completar') return [];
        return [
            { tipo: credentialSlug(SPD_LABEL), label: SPD_LABEL, badge: tip.aviso.badge, detalle: tip.aviso.texto, upload: true },
        ];
    }
    const rows = getProfile(personId).perfiles.flatMap((p) =>
        p.secciones.flatMap((s) => (s.tipo === 'filas' && s.titulo === COPY.ver01.credenciales ? s.filas : [])),
    );
    return credentialsFromRows(rows);
}

export function useVerification(): VerificationState {
    const { actor, recienRegistrado } = useDemoSession();
    const { phoneVerified: phonesInSession } = useSessionState();
    const submissions = useIdentitySubmissions();
    const personId = actor.owner ?? actor.id;

    return useMemo(() => {
        const dates = VERIFICATION_DATES[personId];
        const identityInData = !recienRegistrado && has(personId, COPY.ver01.identidad);
        const identity = identityStatusOf({
            inData: identityInData,
            pendingAtStart: IDENTITY_PENDING_AT_START.includes(personId),
            submitted: submissions.has(personId),
        });
        const phoneInData = !recienRegistrado && (has(personId, COPY.ver01.telefono) || identityInData);
        const verifiedInSession = phonesInSession.has(personId);
        const phoneVerified = phoneVerifiedOf({
            inData: phoneInData,
            pendingAtStart: phonePendingAtStart(personId),
            verifiedInSession,
        });
        const hogar = !recienRegistrado && actor.capabilities.includes('hogar');
        const isOrganization = actor.kind === 'organizacion';
        const levels = isOrganization
            ? organizationLevels(VERIFICATION_DATES[actor.id].organizacion)
            : personLevels({
                  cuentaDesde: recienRegistrado ? NEW_ACCOUNT_DATE : (dates.cuenta ?? NEW_ACCOUNT_DATE),
                  // Verificado en esta sesión (AUTH-08) = hoy.
                  phone: { verified: phoneVerified, fecha: verifiedInSession ? 'hoy' : (dates.telefono ?? 'hoy') },
                  identity: { status: identity, fecha: dates.identidad ?? 'hoy' },
                  hogar,
              });
        return {
            actor,
            personId,
            isOrganization,
            levels,
            credentials: isOrganization ? [] : credentialsOf(personId, recienRegistrado),
            identity,
            phoneVerified,
            hogar,
        };
    }, [actor, personId, recienRegistrado, phonesInSession, submissions]);
}
