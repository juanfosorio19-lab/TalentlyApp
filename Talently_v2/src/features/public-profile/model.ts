// Lo que ve un tercero de una persona (PRF-10) o de una organización
// (PRF-11), armado con los datos de demostración y el estado de la sesión.
// Solo datos publicables (spec §2.1: `persons` tiene nombre, foto, comuna y
// nivel de verificación): nada de RUT, teléfono, dirección ni pretensión.
import { DEMO_ACTORS, type DemoActorId } from '../demo/session';
import { getOrg, getPerson, getPublications } from '../demo/data';
import { isPublicationActive } from '../demo/manageSelectors';
import type { ManageState } from '../demo/manageState';
import { getIdentityStatus, isPhoneVerified } from '../demo/sessionStore';
import type { DemoOnboardingResult, DemoOrg, DemoPublication, DemoRating, DemoVerification } from '../demo/types';
import {
    IDENTIDAD_VERIFICADA,
    ORGANIZACION_VERIFICADA,
    TELEFONO_VERIFICADO,
    identityInData,
    phoneInData,
    verificationOf,
} from '../demo/verifications';

export type PublicView = 'trabajo' | 'servicios' | 'clases';

export const isPublicView = (v: string | null): v is PublicView => v === 'trabajo' || v === 'servicios' || v === 'clases';

const isActorId = (id: string): id is DemoActorId => id in DEMO_ACTORS;

export interface PublicOficio {
    nombre: string;
    experiencia: string | null;
}

export interface PublicPerson {
    id: string;
    nombre: string;
    iniciales: string;
    foto: string | null;
    comuna: string;
    verificaciones: readonly DemoVerification[];
    /** Perfil de trabajo; `null` si no tiene (Carolina, Rosa). */
    trabajo: {
        oficios: readonly PublicOficio[];
        nota: DemoRating | null;
        /** «Confiabilidad 97 %», si tiene turnos suficientes. */
        confiabilidad: string | null;
        ultimoTrabajo: string | null;
    } | null;
    /** Tiene hogar (Contratar para mi hogar): no tiene perfil público como hogar. */
    hogar: boolean;
}

/**
 * Las insignias como las ve un tercero en esta sesión: el teléfono y la
 * identidad de los actores de la demo siguen lo que pasó en la sesión
 * (AUTH-08, VER-02 en revisión no cuenta); las demás, las de los datos.
 */
export function sessionVerifications(id: string, fromData: readonly DemoVerification[], recienRegistrado = false): DemoVerification[] {
    if (!isActorId(id)) return [...fromData];
    const phone = isPhoneVerified(id, phoneInData(id, recienRegistrado));
    const identity = getIdentityStatus(id, identityInData(id, recienRegistrado)) === 'verified';
    const base = recienRegistrado ? [] : fromData;
    const kept = base.filter(
        (v) => (v.label !== TELEFONO_VERIFICADO || phone) && (v.label !== IDENTIDAD_VERIFICADA || identity),
    );
    // Verificó su teléfono en esta sesión y los datos no lo traían (Jorge recién registrado, AUTH-08).
    if (phone && !kept.some((v) => v.label === TELEFONO_VERIFICADO)) {
        kept.unshift({ label: TELEFONO_VERIFICADO, status: 'verified', fecha: 'hoy' });
    }
    return kept;
}

const initials = (nombre: string) =>
    nombre
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');

export interface PersonContext {
    /** Quien mira es el dueño del perfil y acaba de registrarse: solo lo que dejó el onboarding. */
    recienRegistrado?: boolean;
    onboarding?: DemoOnboardingResult;
}

/** PRF-10: la persona, o `null` si no existe en los datos. */
export function publicPerson(id: string, ctx: PersonContext = {}): PublicPerson | null {
    const person = getPerson(id);
    if (!person) return null;
    const hogar = isActorId(id) && DEMO_ACTORS[id].capabilities.includes('hogar');
    const nuevo = ctx.recienRegistrado ? ctx.onboarding : undefined;
    if (ctx.recienRegistrado) {
        const nombre = nuevo ? `${nuevo.nombre} ${nuevo.apellido}`.trim() : person.nombre;
        const oficios = (nuevo?.oficios ?? []).map((o) => ({ nombre: o.nombre, experiencia: o.experiencia }));
        return {
            id,
            nombre,
            iniciales: nuevo ? initials(nombre) : person.iniciales,
            foto: nuevo?.foto ?? null,
            comuna: nuevo?.comuna ?? person.comuna,
            verificaciones: sessionVerifications(id, person.verificaciones, true),
            // Recién registrado: sin reseñas ni confiabilidad todavía.
            trabajo: oficios.length ? { oficios, nota: null, confiabilidad: null, ultimoTrabajo: nuevo?.ultimoTrabajo ?? null } : null,
            hogar,
        };
    }
    return {
        id,
        nombre: person.nombre,
        iniciales: person.iniciales,
        foto: null,
        comuna: person.comuna,
        verificaciones: sessionVerifications(id, person.verificaciones),
        trabajo: person.oficio
            ? {
                  oficios: [{ nombre: person.oficio, experiencia: person.experiencia ?? null }],
                  nota: person.nota ?? null,
                  confiabilidad: person.confiabilidad ?? null,
                  ultimoTrabajo: null,
              }
            : null,
        hogar,
    };
}

export interface PublicOrg {
    org: DemoOrg;
    verificaciones: readonly DemoVerification[];
    /** «Gastronomía y eventos · 10 a 49 trabajadores». */
    sobre: string | null;
}

/**
 * PRF-11: la organización (o el hogar) con su insignia: la misma que muestra
 * DET-01 en sus publicaciones (organización verificada, o la identidad de
 * quien publica por un hogar).
 */
export function publicOrg(id: string): PublicOrg | null {
    const org = getOrg(id);
    if (!org) return null;
    const verificaciones: DemoVerification[] =
        org.tipo === 'hogar'
            ? org.verificada
                ? [{ label: IDENTIDAD_VERIFICADA, status: 'verified' }]
                : []
            : (() => {
                  const v = verificationOf(id, ORGANIZACION_VERIFICADA);
                  return v ? [v] : [];
              })();
    const sobre = [org.rubro, org.tamano].filter(Boolean).join(' · ') || null;
    return { org, verificaciones, sobre };
}

/** Lo que publica y recibe postulaciones en esta sesión (ni pausado ni cerrado en GES-01). */
export function activePublicationsOf(authorId: string, manage: ManageState): DemoPublication[] {
    return getPublications().filter((p) => p.autor.id === authorId && isPublicationActive(p.id, manage));
}
