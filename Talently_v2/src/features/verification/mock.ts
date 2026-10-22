// Datos de Verificación que todavía no están en features/demo (pedidos en
// «requests»): desde cuándo existe la cuenta y cuándo se verificó cada nivel.
// Las fechas que sí están en la demo se copian de ahí (NOT-01 y la hoja
// «Verificación de …» del Perfil); el resto lleva `// no está en el prototipo`.
// Hoy en la demo es jue 10 dic 2026: «hoy» se muestra como «Verificado hoy».
import type { DemoActorId } from '../demo/session';

export interface VerificationDates {
    /** «Cuenta básica · Desde el …». */
    cuenta?: string;
    /** «Teléfono verificado · Verificado el …». */
    telefono?: string;
    /** «Identidad verificada · Verificado el …». */
    identidad?: string;
    /** «Organización verificada · Verificada el …». */
    organizacion?: string;
}

export const VERIFICATION_DATES: Record<DemoActorId, VerificationDates> = {
    jorge: {
        cuenta: '14 mar 2025', // Timeline «Niveles de verificación» del sistema de diseño
        telefono: '2 dic 2026', // hoja «Verificación de Jorge Muñoz» (PRF-01)
    },
    matias: {
        cuenta: '3 ago 2026', // no está en el prototipo
        // El teléfono lo verifica hoy, en AUTH-08 (flujo 2): «Verificado hoy».
    },
    pedro: {
        cuenta: '20 jul 2026', // no está en el prototipo
        telefono: '4 dic 2026', // hoja «Verificación de Pedro Valdés» (PRF-01)
    },
    carolina: {
        cuenta: '1 dic 2026', // no está en el prototipo
        telefono: '1 dic 2026', // no está en el prototipo (PUBL-04-identidad: «Tu teléfono está verificado»)
    },
    rosa: {
        cuenta: '5 mar 2026', // no está en el prototipo
        telefono: '5 mar 2026', // no está en el prototipo (nivel 1, necesario para administrar)
        identidad: 'hoy', // NOT-01: «Verificamos tu identidad · hace 3 h»
    },
    banqueteria: {
        organizacion: '28 nov 2026', // NOT-01: «Verificamos Banquetería Rosa SpA · 28 nov»
    },
};

/** Jorge recién registrado (INI-01-jorge-nuevo): la cuenta es de hoy. */
export const NEW_ACCOUNT_DATE = 'hoy';

/** Nombre de la credencial SPD tal como la nombran los requisitos de la demo. */
export const SPD_LABEL = 'Credencial SPD (ex OS-10)';

/** El certificado de antecedentes no se sube aquí: lo comparte la persona en el chat (spec §10.1.1). */
export const ANTECEDENTES_PREFIX = 'Certificado de antecedentes';
