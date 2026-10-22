// Datos que el feature necesita y que src/features/demo aún no trae (pedidos
// en «requests»). Todo esto: no está en el prototipo, salvo que se diga.
import type { BadgeStatus, DemoActorId, DemoProfileTip } from '../demo/types';

/**
 * Hoja «Verificación de …» (catálogo de VerificationBadge): cómo y cuándo se
 * verificó cada insignia del actor, con las mismas fechas de VER-01 y NOT-01
 * (pedido en «requests» como una sola fuente en demo). Nunca RUT, fecha de
 * nacimiento ni fotos. Lo verificado en esta sesión (el teléfono en AUTH-08 o
 * VER-01) dice «hoy»: lo resuelve `verificationDetails` (model.ts).
 */
export const VERIFICATION_DETAIL: Partial<Record<DemoActorId, Record<string, string>>> = {
    jorge: {
        'Teléfono verificado': 'Código SMS · 2 dic 2026',
        // La fecha de vencimiento sí está en el prototipo (PRF-01 · Credenciales).
        'Credencial SPD verificada': 'Credencial revisada · vence 03/2028',
    },
    // Flujo 2: Matías verifica su teléfono hoy, al tomar su primer turno (AUTH-08): «Código SMS · hoy».
    pedro: { 'Teléfono verificado': 'Código SMS · 4 dic 2026' },
    // VER-01: «Teléfono verificado · Verificado el 1 dic 2026». Su identidad la verifica en el flujo 5 (VER-02).
    carolina: { 'Teléfono verificado': 'Código SMS · 1 dic 2026' },
    // VER-01 «Verificado hoy» y NOT-01 «Verificamos tu identidad · hace 3 h».
    rosa: { 'Identidad verificada': 'Cédula y selfie revisadas · hoy' },
    // VER-01 «Verificada el 28 nov 2026» y NOT-01 «Verificamos Banquetería Rosa SpA · 28 nov».
    banqueteria: { 'Organización verificada': 'RUT y documentos revisados · 28 nov 2026' },
};

/** Lo verificado en esta sesión (AUTH-08 o VER-01). no está en el prototipo. */
export const PHONE_DETAIL_TODAY = 'Código SMS · hoy';
/** Identidad enviada en VER-02 (VER-01: «En revisión · te avisamos en menos de 24 h»). */
export const IDENTITY_DETAIL_REVIEW = 'En revisión · te avisamos en menos de 24 h';

/**
 * Flujo 5: Carolina verifica su identidad en VER-02 antes de publicar su aviso
 * (PUBL-04-identidad). Los datos traen el «después» (Identidad verificada);
 * como `phonePendingAtStart`, parte sin verificar. La MISMA lista de VER-01 y
 * PUBL-04: pedida en «requests» como `identityPendingAtStart` en
 * demo/sessionStore; ese día esto se borra.
 */
const IDENTITY_PENDING_AT_START: readonly DemoActorId[] = ['carolina'];

export function identityPendingAtStart(actorId: DemoActorId): boolean {
    return IDENTITY_PENDING_AT_START.includes(actorId);
}

/**
 * PUBL-04-identidad («Tu teléfono está verificado») y VER-01 dicen que
 * Carolina tiene el teléfono verificado; demo/data aún no lo trae (pedido en
 * «requests»: `PERSONS.carolina.verificaciones` con `V.telefono`).
 */
export const PHONE_VERIFIED_IN_PROTOTYPE: readonly DemoActorId[] = ['carolina'];

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

/** Las 52 comunas de la Región Metropolitana, en orden alfabético (es-CL). */
export const COMUNAS_RM: readonly string[] = [
    'Alhué', 'Buin', 'Calera de Tango', 'Cerrillos', 'Cerro Navia', 'Colina', 'Conchalí', 'Curacaví',
    'El Bosque', 'El Monte', 'Estación Central', 'Huechuraba', 'Independencia', 'Isla de Maipo',
    'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Lampa', 'Las Condes',
    'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'María Pinto', 'Melipilla', 'Ñuñoa',
    'Padre Hurtado', 'Paine', 'Pedro Aguirre Cerda', 'Peñaflor', 'Peñalolén', 'Pirque', 'Providencia',
    'Pudahuel', 'Puente Alto', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Bernardo',
    'San Joaquín', 'San José de Maipo', 'San Miguel', 'San Pedro', 'San Ramón', 'Santiago', 'Talagante',
    'Tiltil', 'Vitacura',
];
