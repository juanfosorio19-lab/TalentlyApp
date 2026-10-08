// Datos que el feature necesita y que src/features/demo aún no trae (pedidos
// en «requests»). Todo esto: no está en el prototipo, salvo que se diga.
import type { BadgeStatus, DemoActorId } from '../demo/types';

/**
 * Hoja «Verificación de …» (catálogo de VerificationBadge): cómo y cuándo se
 * verificó cada insignia del actor. Nunca RUT, fecha de nacimiento ni fotos.
 */
export const VERIFICATION_DETAIL: Partial<Record<DemoActorId, Record<string, string>>> = {
    jorge: {
        'Teléfono verificado': 'Código SMS · 2 dic 2026',
        // La fecha de vencimiento sí está en el prototipo (PRF-01 · Credenciales).
        'Credencial SPD verificada': 'Credencial revisada · vence 03/2028',
    },
    // Flujo 2: Matías verifica su teléfono hoy, al tomar su primer turno (AUTH-08).
    matias: { 'Teléfono verificado': 'Código SMS · 10 dic 2026' },
    pedro: { 'Teléfono verificado': 'Código SMS · 4 dic 2026' },
    // Flujo 5: Carolina verifica su identidad hoy, antes de publicar su aviso (VER-02).
    carolina: { 'Identidad verificada': 'Cédula y selfie revisadas · 10 dic 2026' },
    rosa: { 'Identidad verificada': 'Cédula y selfie revisadas · 9 dic 2026' },
    banqueteria: { 'Organización verificada': 'RUT y documentos revisados · 20 nov 2026' },
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
