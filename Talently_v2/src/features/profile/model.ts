// Reglas puras del feature Perfil y configuración: qué perfil se muestra
// (con lo que cambió en la sesión), qué accesos aplican, a dónde lleva cada
// acción y cómo se nombra una sección en la URL (?sheet=editar&s=…). Sin
// React: lo prueban model.test.ts y lo usan las pantallas.
import { paths } from '../../app/paths';
import type { DemoActor } from '../demo/session';
import type {
    DemoCv,
    DemoOnboardingResult,
    DemoProfile,
    DemoProfileSection,
    DemoProfileTab,
    DemoProfileTip,
    DemoRow,
    DemoVerification,
} from '../demo/types';
import { credentialMissing, defaultOnboardingResult } from '../demo/data';
import { IDENTIDAD_VERIFICADA, TELEFONO_VERIFICADO, verificationDetail as detailOf } from '../demo/verifications';
import { IDENTITY_DETAIL_REVIEW, IDENTITY_TIP } from './mock';

// ─── Quién trabaja ──────────────────────────────────────────────────────────

/** PRF-12 es para quien trabaja (spec §5.4, actor T): sin empleo ni turnos no hay oficio que destacar. */
export function trabaja(actor: DemoActor): boolean {
    return actor.capabilities.some((c) => c === 'empleo' || c === 'turnos');
}

// ─── Perfil con lo que pasó en la sesión ────────────────────────────────────

/** Insignia de la identidad enviada en VER-02 y aún sin respuesta. no está en el prototipo. */
export const IDENTIDAD_EN_REVISION = 'Identidad en revisión';
/** Detalle de «Verificación y credenciales» sin insignias (el mismo de demo/data). */
const SIN_VERIFICACIONES = 'Aún no verificas nada';

/** «Verificación y credenciales»: lo verificado, en una línea. */
export function verificationDetail(verificaciones: readonly DemoVerification[]): string {
    return verificaciones.length ? verificaciones.map((v) => v.label).join(' · ') : SIN_VERIFICACIONES;
}

/** El perfil con otras insignias: cambian «Así te ven» y el detalle de «Verificación y credenciales». */
function withVerifications(profile: DemoProfile, verificaciones: DemoVerification[]): DemoProfile {
    return {
        ...profile,
        asiTeVen: { ...profile.asiTeVen, verificaciones },
        enlaces: profile.enlaces.map((l) => (l.id === 'verificacion' ? { ...l, detalle: verificationDetail(verificaciones) } : l)),
    };
}

export interface SessionProfileState {
    /** Verificó el teléfono en esta sesión (AUTH-08 o VER-01; demo/sessionStore `verifyPhone`). */
    phoneVerifiedInSession: boolean;
    /**
     * Los datos traen el «después» y el actor parte sin teléfono verificado
     * (Matías lo verifica en AUTH-08, flujo 2; demo/sessionStore `phonePendingAtStart`).
     */
    phonePendingAtStart: boolean;
    /** Lo mismo con la identidad (Carolina la verifica en VER-02, flujo 5; demo/verifications `identityPendingAtStart`). */
    identityPendingAtStart: boolean;
    /** Envió VER-02 en esta sesión (demo/sessionStore `useIdentityStatus` = 'review'): la identidad queda en revisión. */
    identitySubmitted: boolean;
    /** Los perfiles (Trabajo, Hogar…) con lo que la persona editó en esta sesión. */
    tabs?: readonly DemoProfileTab[];
    /** El CV de la persona (demo/profileState `useCv`): el subido en la sesión o el de los datos. */
    cv?: DemoCv;
}

/** Las insignias con lo que pasó en la sesión (el mismo orden de VER-01: teléfono, identidad, el resto). */
function sessionVerifications(base: readonly DemoVerification[], session: SessionProfileState): DemoVerification[] {
    let out = [...base];
    const has = (label: string) => out.some((v) => v.label === label);
    if (session.phoneVerifiedInSession) {
        if (!has(TELEFONO_VERIFICADO)) out = [{ label: TELEFONO_VERIFICADO, status: 'verified', fecha: 'hoy' }, ...out];
    } else if (session.phonePendingAtStart) {
        out = out.filter((v) => v.label !== TELEFONO_VERIFICADO);
    }
    if (session.identityPendingAtStart) {
        out = out.filter((v) => v.label !== IDENTIDAD_VERIFICADA && v.label !== IDENTIDAD_EN_REVISION);
        if (session.identitySubmitted) {
            const at = out.findIndex((v) => v.label === TELEFONO_VERIFICADO) + 1;
            out.splice(at, 0, { label: IDENTIDAD_EN_REVISION, status: 'review' });
        }
    }
    return out;
}

const sameVerifications = (a: readonly DemoVerification[], b: readonly DemoVerification[]) =>
    a.length === b.length && a.every((v, i) => v.label === b[i]?.label && v.status === b[i]?.status);

const DATOS_ORGANIZACION = 'Datos de la organización';
const COMUNA = 'Comuna';

/** La comuna que dice «Datos de la organización» (PRF-02), si la hay. */
export function orgComuna(tabs: readonly DemoProfileTab[]): string | undefined {
    for (const tab of tabs) {
        for (const s of tab.secciones) {
            if (s.tipo !== 'filas' || s.titulo !== DATOS_ORGANIZACION) continue;
            const value = s.filas.find((r) => r.label === COMUNA)?.value;
            if (value) return value;
        }
    }
    return undefined;
}

/** El perfil tal como se ve ahora: datos de la demostración + lo que cambió en la sesión. */
export function composeProfile(base: DemoProfile, session: SessionProfileState): DemoProfile {
    const verificaciones = sessionVerifications(base.asiTeVen.verificaciones, session);
    let profile = sameVerifications(verificaciones, base.asiTeVen.verificaciones) ? base : withVerifications(base, verificaciones);

    if (session.tabs) {
        profile = { ...profile, perfiles: [...session.tabs] };
        // «Así te ven» dice la comuna que la organización guardó en sus datos.
        const comuna = orgComuna(session.tabs);
        if (comuna && comuna !== profile.asiTeVen.comuna) profile = { ...profile, asiTeVen: { ...profile.asiTeVen, comuna } };
    }

    // El CV de la sesión (el mismo que leen Inicio y DET-02): la sección CV lo muestra y «Te falta 1 cosa · Subir CV» ya no aplica.
    if (session.cv) profile = { ...profile, perfiles: profile.perfiles.map((t) => withCv(t, session.cv as DemoCv)) };

    // Identidad pendiente: el Hogar pide verificarla, igual que el de Jorge (VER-02).
    if (session.identityPendingAtStart && !session.identitySubmitted) {
        profile = {
            ...profile,
            perfiles: profile.perfiles.map((t) => (t.id === 'hogar' && !t.completitud ? { ...t, completitud: IDENTITY_TIP } : t)),
        };
    }

    // «Idiomas» está siempre en el perfil de Trabajo: vacía, pide agregarlos.
    if (profile.perfiles.some((t) => withLanguagesSection(t) !== t)) {
        profile = { ...profile, perfiles: profile.perfiles.map(withLanguagesSection) };
    }
    return profile;
}

const IDIOMAS = 'Idiomas';

/**
 * El perfil de Trabajo siempre tiene «Idiomas» (PRF-01, también en su variante
 * vacía `idiomas: 'vacia'`): sin idiomas, la sección dice «Aún no agregas
 * idiomas…» con «Agregar idioma», justo antes del CV, como en el prototipo.
 * Matías, Pedro, Marta y Jorge recién registrado parten así; Jorge trae
 * «Español · Nativo» e «Inglés · Básico». Al guardarla sin filas, vuelve a verse vacía.
 */
export function withLanguagesSection(tab: DemoProfileTab): DemoProfileTab {
    if (tab.id !== 'trabajo' || tab.secciones.some((s) => s.titulo === IDIOMAS)) return tab;
    const idiomas: DemoProfileSection = { tipo: 'filas', titulo: IDIOMAS, editable: true, filas: [] };
    const cv = tab.secciones.findIndex((s) => s.titulo === 'CV');
    const at = cv < 0 ? tab.secciones.length : cv;
    return { ...tab, secciones: [...tab.secciones.slice(0, at), idiomas, ...tab.secciones.slice(at)] };
}

/** El perfil con su CV: la sección «CV» con el archivo y sin la tarjeta que lo pide. */
function withCv(tab: DemoProfileTab, cv: DemoCv): DemoProfileTab {
    const index = tab.secciones.findIndex((s) => s.titulo === 'CV');
    if (index < 0) return tab;
    const current = tab.secciones[index];
    const same = current?.tipo === 'archivo' && current.nombre === cv.nombre && current.detalle === cv.detalle;
    const archivo: DemoProfileSection = { tipo: 'archivo', titulo: 'CV', nombre: cv.nombre, detalle: cv.detalle, editable: true };
    const secciones = same ? tab.secciones : tab.secciones.map((s, i) => (i === index ? archivo : s));
    const completitud = tab.completitud && isCvAction(tab.completitud.accion) ? undefined : tab.completitud;
    return secciones === tab.secciones && completitud === tab.completitud ? tab : { ...tab, secciones, completitud };
}

/**
 * Los perfiles tal como se guardan: sin la tarjeta que pone la sesión (la
 * identidad pendiente), que vuelve a decidirse cada vez que se arma el perfil.
 */
export function withoutSessionTips(tabs: readonly DemoProfileTab[]): DemoProfileTab[] {
    return tabs.map((t) => (t.completitud === IDENTITY_TIP ? { ...t, completitud: undefined } : t));
}

/**
 * Hoja «Verificación de …»: cómo y cuándo se verificó cada insignia, con la
 * única fecha de los datos (demo/verifications.verificationDetail, la misma
 * de VER-01 y NOT-01). Lo verificado en esta sesión dice «hoy» (VER-01:
 * «Verificado hoy») y la identidad enviada, que está en revisión.
 */
export function verificationDetails(
    verificaciones: readonly DemoVerification[],
    phoneVerifiedInSession: boolean,
): Record<string, string> {
    const out: Record<string, string> = {};
    for (const v of verificaciones) {
        let detalle: string | undefined;
        if (v.label === TELEFONO_VERIFICADO && phoneVerifiedInSession) detalle = detailOf({ ...v, fecha: 'hoy' });
        else if (v.label === IDENTIDAD_EN_REVISION) detalle = IDENTITY_DETAIL_REVIEW;
        else detalle = detailOf(v);
        if (detalle) out[v.label] = detalle;
    }
    return out;
}

// ─── Jorge recién registrado (INI-01-jorge-nuevo) ───────────────────────────

const sectionOf = (tab: DemoProfileTab | undefined, titulo: string) => tab?.secciones.find((s) => s.titulo === titulo);

/** La credencial que pide el oficio de guardia (ONB-T4). */
const SPD_LABEL = 'Credencial SPD (ex OS-10)';

/** «Jorge Muñoz» → «JM». */
const initialsOf = (nombre: string, apellido: string) =>
    [nombre, apellido].map((w) => w.trim().charAt(0).toLocaleUpperCase('es-CL')).join('') || '?';

/**
 * El perfil de Jorge al terminar el onboarding (flujo 1): SOLO lo que dejó el
 * registro (`result`, demo/session `onboarding`: nombre, comuna, foto,
 * oficios de ONB-T1, la credencial de ONB-T4 y el último trabajo de ONB-T5).
 * Sin insignias (el teléfono fue opcional), sin reseñas, sin perfil Hogar,
 * sin «Sobre mí» y sin idiomas (composeProfile agrega «Idiomas» vacía, que
 * pide agregarlos). La credencial SPD: «En revisión» si la subió;
 * si no, es lo que le falta (la misma tarjeta de su Inicio).
 */
export function recienRegistradoProfile(base: DemoProfile, result: DemoOnboardingResult = defaultOnboardingResult()): DemoProfile {
    const trabajo = base.perfiles.find((t) => t.id === 'trabajo');
    const pretension = sectionOf(trabajo, 'Pretensión'); // ONB-T3: $650.000 al mes y $40.000 por turno
    const cv = sectionOf(trabajo, 'CV'); // ONB-T5: no subió su CV
    const credenciales = sectionOf(trabajo, 'Credenciales');
    const antecedentes: DemoRow[] =
        credenciales?.tipo === 'filas' ? credenciales.filas.filter((r) => r.label.startsWith('Certificado de antecedentes')) : [];
    const comuna = result.comuna ?? base.asiTeVen.comuna;
    const varios = result.oficios.length > 1;
    const spd: DemoRow[] =
        result.credencial === null
            ? []
            : result.credencial === 'revision'
              ? [{ label: SPD_LABEL, badge: 'En revisión' }]
              : // ONB-T4: «Sin credencial SPD vigente no podrás ser confirmado en turnos de guardia.»
                [{ label: SPD_LABEL, badge: 'Obligatoria', detalle: 'Sin credencial SPD vigente no podrás ser confirmado en turnos de guardia.' }];

    const secciones: DemoProfileSection[] = [
        {
            tipo: 'filas', titulo: 'Oficios y experiencia', editable: true,
            filas: [
                // ONB-T1, el principal primero.
                ...result.oficios.map(
                    (o): DemoRow => ({
                        label: o.nombre,
                        value: o.experiencia ? `${o.experiencia} de experiencia` : undefined,
                        badge: o.principal && varios ? 'Principal' : undefined,
                    }),
                ),
                // ONB-T5.
                ...(result.ultimoTrabajo ? [{ label: 'Último trabajo', value: result.ultimoTrabajo }] : []),
            ],
        },
        {
            tipo: 'filas', titulo: 'Disponibilidad', editable: true,
            filas: [
                // ONB-T2.
                { label: 'Jornada', value: 'Jornada completa · Part time' },
                { label: 'Disponible desde', value: 'Inmediata' },
                // ONB-T4.
                { label: 'Sistema de turno', value: '4x4 · de día y de noche' },
                // ONB-99: «4 franjas, hasta 20 km».
                { label: 'Turnos por día', value: 'Vie noche · Sáb tarde y noche · Dom tarde' },
                { label: 'Hasta dónde te mueves', value: `20 km desde ${comuna}` },
            ],
        },
        ...(pretension ? [pretension] : []),
        ...(spd.length || antecedentes.length
            ? [{ tipo: 'filas' as const, titulo: 'Credenciales', editable: true, filas: [...spd, ...antecedentes] }]
            : []),
        ...(cv ? [cv] : []),
    ];

    const tab: DemoProfileTab = {
        id: 'trabajo', nombre: 'Trabajo',
        // INI-01-jorge-nuevo y ONB-99: lo que falta, solo si de verdad falta.
        completitud: credentialMissing(result)
            ? {
                  titulo: 'Te falta la credencial SPD', badge: 'Obligatoria',
                  texto: 'Sin ella no podrás ser confirmado en turnos de guardia.', accion: 'Subir credencial',
                  destino: { pantalla: 'verificacion' },
              }
            : undefined,
        secciones,
    };

    const sinInsignias = withVerifications(base, []);
    const nombre = [result.nombre, result.apellido].map((w) => w.trim()).filter(Boolean).join(' ');
    return {
        ...sinInsignias,
        asiTeVen: {
            ...sinInsignias.asiTeVen,
            nombre: nombre || sinInsignias.asiTeVen.nombre,
            iniciales: initialsOf(result.nombre, result.apellido),
            foto: result.foto ?? undefined,
            comuna,
            notas: [{ rol: 'Trabajo', nota: null }],
        },
        perfiles: [tab],
        vacio: undefined,
    };
}

// ─── Pestañas, accesos y acciones ───────────────────────────────────────────

/** El perfil elegido en «Mis perfiles» (`?perfil=` en la URL) o, si no aplica, el primero. */
export function resolveTab(perfiles: readonly DemoProfileTab[], requested: string | null): DemoProfileTab | undefined {
    return perfiles.find((t) => t.id === requested) ?? perfiles[0];
}

/**
 * Accesos del pie que aplican (PRF-01): Impulsa solo a quien trabaja (PRF-12,
 * spec §5.4); sin perfiles no hay «Mis perfiles» que pausar, y «Agregar un
 * perfil» queda solo como la acción del estado vacío.
 */
export function visibleLinks(profile: DemoProfile, actor: DemoActor): DemoProfile['enlaces'] {
    const sinPerfiles = profile.perfiles.length === 0;
    const agregarEnVacio = sinPerfiles && Boolean(profile.vacio?.accion);
    return profile.enlaces.filter(
        (l) =>
            (l.id !== 'impulsa' || trabaja(actor)) &&
            (l.id !== 'mis-perfiles' || !sinPerfiles) &&
            (l.id !== 'agregar' || !agregarEnVacio),
    );
}

export const isCvAction = (accion: string) => accion.includes('CV');

/**
 * A dónde lleva la tarjeta «Te falta 1 cosa»: el CV se sube aquí mismo (hoja
 * Subir CV); «Verificar identidad» abre VER-02; una credencial o un curso por
 * subir, Verificación y credenciales (VER-01, donde se suben).
 */
export function tipAction(tip: DemoProfileTip): { kind: 'cv' } | { kind: 'path'; path: string } {
    if (isCvAction(tip.accion)) return { kind: 'cv' };
    if (/identidad/iu.test(tip.accion)) return { kind: 'path', path: paths.verificarIdentidad() };
    return { kind: 'path', path: paths.verificacion() };
}

export type EditableSection = Extract<DemoProfileSection, { tipo: 'texto' | 'filas' | 'tags' }>;

/** Credenciales no se editan en una hoja: su lápiz lleva a Verificación y credenciales (prototipo). */
const CREDENCIALES = 'Credenciales';

export function isEditable(s: DemoProfileSection): s is EditableSection {
    return (s.tipo === 'texto' || s.tipo === 'filas' || s.tipo === 'tags') && s.editable && s.titulo !== CREDENCIALES;
}

/** Qué hace el lápiz de una sección. */
export function editAction(section: DemoProfileSection): 'cv' | 'verificacion' | 'editar' | null {
    if (section.tipo === 'archivo') return 'cv';
    if (section.titulo === CREDENCIALES) return 'verificacion';
    return isEditable(section) ? 'editar' : null;
}

/** Nombre de una sección en la URL: «Sobre mí» → `sobre-mi`, «Qué necesitas» → `que-necesitas`. */
export function sectionSlug(titulo: string): string {
    return titulo
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/** La sección editable que nombra `?s=` en el perfil abierto, con su posición. */
export function findEditable(tab: DemoProfileTab, slug: string | null): { index: number; section: EditableSection } | undefined {
    if (!slug) return undefined;
    const index = tab.secciones.findIndex((s) => sectionSlug(s.titulo) === slug);
    const section = tab.secciones[index];
    return section && isEditable(section) ? { index, section } : undefined;
}

// ─── Hojas en la URL ────────────────────────────────────────────────────────

const CV = 'CV';

/** ¿El perfil tiene la sección CV (vacía o con su archivo)? Solo ahí se sube un CV. */
export const hasCvSection = (tab: DemoProfileTab): boolean => tab.secciones.some((s) => s.titulo === CV);

export interface ProfileSheetContext {
    /** SHT-ACTOR solo si la persona pertenece a una organización. */
    canSwitch: boolean;
    /** El perfil abierto (Trabajo, Hogar, Organización), si hay. */
    tab: DemoProfileTab | undefined;
    /** Cuántas insignias tiene «Así te ven». */
    verificaciones: number;
}

/**
 * ¿La hoja que pide la URL (un enlace, una notificación, TabMemory) aplica a
 * este actor? Las del Perfil que no aplican no se abren y salen de la URL.
 * Una hoja que no es del Perfil (`?sheet=` de otra capa) no se toca.
 */
export function profileSheetApplies(sheet: string, s: string | null, ctx: ProfileSheetContext): boolean {
    switch (sheet) {
        case 'actor':
            return ctx.canSwitch;
        case 'editar':
            return ctx.tab !== undefined && findEditable(ctx.tab, s) !== undefined;
        case 'cv':
            return ctx.tab !== undefined && hasCvSection(ctx.tab);
        case 'verificacion':
            return ctx.verificaciones > 0;
        default:
            return true;
    }
}
