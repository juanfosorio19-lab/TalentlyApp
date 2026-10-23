// Datos que el feature necesita y que src/features/demo aún no trae (pedidos
// en «requests»). Todo esto: no está en el prototipo, salvo que se diga.
import type { BadgeStatus, DemoProfileTip } from '../demo/types';

/** Identidad enviada en VER-02 (VER-01: «En revisión · te avisamos en menos de 24 h»). */
export const IDENTITY_DETAIL_REVIEW = 'En revisión · te avisamos en menos de 24 h';

/**
 * «Te falta 1 cosa» del Hogar mientras la identidad está pendiente: la misma
 * tarjeta del Hogar de Jorge (PRF-01 · Hogar).
 */
export const IDENTITY_TIP: DemoProfileTip = {
    titulo: 'Te falta 1 cosa',
    texto: 'Verifica tu identidad para recibir a alguien en tu casa. Es una foto de tu cédula y una selfie, y es gratis.',
    accion: 'Verificar identidad',
    destino: { pantalla: 'verificacion' },
};

/** Accesos extra del perfil de la organización (spec §5.2: Equipo y Trabajadores favoritos). */
export interface OrgExtraLink {
    id: 'equipo' | 'favoritos';
    titulo: string;
    detalle: string;
    badge?: BadgeStatus;
}

export const ORG_EXTRA_LINKS: readonly OrgExtraLink[] = [
    // PRF-06 es de Fase 3: lleva «Pronto».
    { id: 'equipo', titulo: 'Equipo', detalle: 'Miembros y roles', badge: 'Pronto' },
    // GES-05 (spec §5.4: «Volver a convocar»).
    { id: 'favoritos', titulo: 'Trabajadores favoritos', detalle: 'Vuelve a convocar a quienes ya trabajaron contigo' },
];

/** Opciones de «Qué necesitas» al editar el perfil Hogar (grilla «¿Qué necesitas?» de la spec §5.2). */
export const HOGAR_NECESIDADES: readonly string[] = [
    'Asesor/a del hogar',
    'Cuidador/a infantil',
    'Cuidador/a de adulto mayor',
    'Banquetero/a para un evento',
];

// ─── Diccionarios de la edición (PRF-03): los mismos controles del onboarding ───
// Salen tal cual del prototipo (ONB-T2, PUBL-04 paso 3). Cuando vuelva Supabase,
// vienen de los diccionarios de la base (pedidos en «requests»).

/** ONB-T2 · Jornada. */
export const JORNADAS: readonly string[] = ['Jornada completa', 'Part time', 'Part time estudiante', 'Temporada', 'Por obra'];

/** ONB-T2 · Disponible desde. */
export const DISPONIBLE_DESDE: readonly string[] = ['Inmediata', 'En 15 días', 'En 1 mes', 'A convenir'];

/** ONB-T2 · ¿Hasta dónde te mueves? «Toda la región» va sin «desde». */
export const DISTANCIAS: readonly string[] = ['5 km', '10 km', '20 km', 'Toda la región'];
export const TODA_LA_REGION = 'Toda la región';

/** PUBL-04 paso 3 · Contexto del hogar. */
export const CONTEXTO_HOGAR: readonly string[] = ['Hay niños', 'Hay adulto mayor', 'Hay mascotas'];

/** Nivel de un idioma. no está en el prototipo (PRF-01 muestra «Nativo» y «Básico»). */
export const NIVELES_IDIOMA: readonly string[] = ['Básico', 'Intermedio', 'Avanzado', 'Nativo'];

/** Tamaño de la organización («50 a 199 trabajadores», DET-01). no está en el prototipo como lista. */
export const TAMANOS_ORGANIZACION: readonly string[] = [
    '1 a 9 trabajadores',
    '10 a 49 trabajadores',
    '50 a 199 trabajadores',
    '200 o más trabajadores',
];

