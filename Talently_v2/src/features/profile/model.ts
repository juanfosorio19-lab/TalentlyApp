// Reglas puras del feature Perfil y configuración: qué perfil se muestra
// (con lo que cambió en la sesión), qué accesos aplican, a dónde lleva cada
// acción y cómo se nombra una sección en la URL (?sheet=editar&s=…). Sin
// React: lo prueban model.test.ts y lo usan las pantallas.
import { paths } from '../../app/paths';
import type { DemoActor } from '../demo/session';
import type { DemoProfile, DemoProfileSection, DemoProfileTab, DemoProfileTip, DemoRow, DemoVerification } from '../demo/types';

// ─── Quién trabaja ──────────────────────────────────────────────────────────

/** PRF-12 es para quien trabaja (spec §5.4, actor T): sin empleo ni turnos no hay oficio que destacar. */
export function trabaja(actor: DemoActor): boolean {
    return actor.capabilities.some((c) => c === 'empleo' || c === 'turnos');
}

// ─── Perfil con lo que pasó en la sesión ────────────────────────────────────

const TELEFONO_VERIFICADO = 'Teléfono verificado';
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
    /**
     * ¿Tiene el teléfono verificado en esta sesión? Matías lo verifica en
     * AUTH-08 al tomar su primer turno (flujo 2): antes, su perfil no muestra
     * la insignia (demo/sessionStore: `phonePendingAtStart`, `verifyPhone`).
     */
    phoneVerified: boolean;
    /** Los perfiles (Trabajo, Hogar…) con lo que la persona editó en esta sesión. */
    tabs?: readonly DemoProfileTab[];
}

/** El perfil tal como se ve ahora: datos de la demostración + lo que cambió en la sesión. */
export function composeProfile(base: DemoProfile, session: SessionProfileState): DemoProfile {
    let profile = base;
    if (!session.phoneVerified && base.asiTeVen.verificaciones.some((v) => v.label === TELEFONO_VERIFICADO)) {
        profile = withVerifications(
            profile,
            base.asiTeVen.verificaciones.filter((v) => v.label !== TELEFONO_VERIFICADO),
        );
    }
    return session.tabs ? { ...profile, perfiles: [...session.tabs] } : profile;
}

// ─── Jorge recién registrado (INI-01-jorge-nuevo) ───────────────────────────

const sectionOf = (tab: DemoProfileTab | undefined, titulo: string) => tab?.secciones.find((s) => s.titulo === titulo);

/**
 * El perfil de Jorge al terminar el onboarding (flujo 1): solo lo que capturó
 * (ONB-03 y ONB-T1 a ONB-T5, resumido en ONB-99). Sin insignias (el teléfono
 * fue opcional y la credencial SPD quedó para «Después»), sin reseñas, sin
 * perfil Hogar, sin «Sobre mí» ni idiomas, y con la credencial SPD como lo
 * que le falta (la misma tarjeta de su Inicio). Pedido en «requests» como
 * `getProfile(actorId, { recienRegistrado })` en demo/data.
 */
export function recienRegistradoProfile(base: DemoProfile): DemoProfile {
    const trabajo = base.perfiles.find((t) => t.id === 'trabajo');
    const pretension = sectionOf(trabajo, 'Pretensión'); // ONB-T3: $650.000 al mes y $40.000 por turno
    const cv = sectionOf(trabajo, 'CV'); // ONB-T5: no subió su CV
    const credenciales = sectionOf(trabajo, 'Credenciales');
    const antecedentes: DemoRow[] =
        credenciales?.tipo === 'filas' ? credenciales.filas.filter((r) => r.label.startsWith('Certificado de antecedentes')) : [];

    const secciones: DemoProfileSection[] = [
        {
            tipo: 'filas', titulo: 'Oficios y experiencia', editable: true,
            filas: [
                // ONB-T1.
                { label: 'Guardia de seguridad', value: '5 a 10 años de experiencia', badge: 'Principal' },
                { label: 'Guardia de eventos', value: '3 a 5 años de experiencia' },
                // ONB-T5: Condominio Los Peumos, de 03/2021 a 10/2026.
                { label: 'Último trabajo', value: 'Guardia de seguridad en Condominio Los Peumos · 2021 a 2026' },
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
                { label: 'Hasta dónde te mueves', value: `20 km desde ${base.asiTeVen.comuna}` },
            ],
        },
        ...(pretension ? [pretension] : []),
        {
            tipo: 'filas', titulo: 'Credenciales', editable: true,
            filas: [
                // ONB-T4: «Sin credencial SPD vigente no podrás ser confirmado en turnos de guardia.»
                {
                    label: 'Credencial SPD (ex OS-10)', badge: 'Obligatoria',
                    detalle: 'Sin credencial SPD vigente no podrás ser confirmado en turnos de guardia.',
                },
                ...antecedentes,
            ],
        },
        ...(cv ? [cv] : []),
    ];

    const tab: DemoProfileTab = {
        id: 'trabajo', nombre: 'Trabajo',
        // INI-01-jorge-nuevo y ONB-99.
        completitud: {
            titulo: 'Te falta la credencial SPD', badge: 'Obligatoria',
            texto: 'Sin ella no podrás ser confirmado en turnos de guardia.', accion: 'Subir credencial',
            destino: { pantalla: 'verificacion' },
        },
        secciones,
    };

    const sinInsignias = withVerifications(base, []);
    return {
        ...sinInsignias,
        asiTeVen: { ...sinInsignias.asiTeVen, notas: [{ rol: 'Trabajo', nota: null }] },
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
