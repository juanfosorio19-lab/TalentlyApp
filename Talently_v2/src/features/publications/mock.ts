// Lo que el detalle necesita y los datos de demostración (src/features/demo)
// aún no traen. Todo sale del prototipo F1; lo que no está en él lleva
// «// no está en el prototipo». Pedido en «requests» para que viva en demo/.
import { getApplications, getExplore, getHomeFeed, getPerson, getProfile } from '../demo/data';
import type { DemoActorId } from '../demo/session';

/**
 * ¿Los datos traen el celular del actor verificado? Es lo de antes de la
 * sesión: si además lo verificó en AUTH-08 (o si el prototipo lo hace
 * verificar en su flujo) lo decide isPhoneVerified de demo/sessionStore.
 */
export function phoneVerifiedInData(actorId: DemoActorId): boolean {
    return getPerson(actorId)?.verificaciones.some((v) => v.label === 'Teléfono verificado' && v.status === 'verified') ?? false;
}

export interface CvFile {
    nombre: string;
    /** «180 KB». */
    detalle: string;
}

/**
 * DET-02 muestra «CV Jorge Muñoz.pdf · Del perfil · 180 KB», pero PRF-01 de
 * Jorge todavía dice «Sube tu CV» (son dos momentos del prototipo).
 */
const CV_FROM_DET02: Partial<Record<DemoActorId, CvFile>> = {
    jorge: { nombre: 'CV Jorge Muñoz.pdf', detalle: '180 KB' },
};

/** El CV del perfil de trabajo del actor, si lo tiene. */
export function profileCv(actorId: DemoActorId): CvFile | undefined {
    try {
        for (const tab of getProfile(actorId).perfiles) {
            for (const s of tab.secciones) {
                if (s.tipo === 'archivo' && s.titulo === 'CV') return { nombre: s.nombre, detalle: s.detalle };
            }
        }
    } catch {
        // Sin perfil de demostración (una organización): no tiene CV.
    }
    return CV_FROM_DET02[actorId];
}

/** Ejemplo del campo «Mensaje (opcional)» de DET-02, por oferta. */
const MESSAGE_EXAMPLE: Record<string, string> = {
    'empleo-guardia-4x4': 'Ej.: tengo 8 años como guardia y vivo cerca',
    'empleo-mecanico-automotriz': 'Ej.: tengo 8 años como mecánico y vivo en Macul',
};

export function messageExample(publicationId: string): string {
    return MESSAGE_EXAMPLE[publicationId] ?? 'Ej.: cuéntales tu experiencia y por qué te interesa'; // no está en el prototipo
}

/** Lo que se verificó detrás de cada insignia (hoja «Verificación de …»), igual que en Actividad. */
export const VERIFICATION_DETAIL: Record<string, string> = {
    'Organización verificada': 'RUT y documentos de la organización revisados',
    'Teléfono verificado': 'Código por SMS',
    'Identidad verificada': 'Cédula y selfie revisadas',
    'Credencial SPD verificada': 'Credencial revisada con su vencimiento',
};

/**
 * «Requisitos · para ti» (Tienes tu credencial SPD vigente, Tu nota es 4,8)
 * está escrito para quien mira la publicación en el prototipo. Solo se
 * muestra a ese actor: la publicación está en su Explorar, en su Inicio o en
 * sus postulaciones. A otro actor le diría algo que no es cierto.
 */
export function isWrittenFor(actorId: DemoActorId, publicationId: string): boolean {
    if (getApplications(actorId).some((a) => a.publicationId === publicationId)) return true;
    try {
        const explore = getExplore(actorId);
        if (explore.empleos.publicaciones.includes(publicationId)) return true;
        if (explore.turnos.dias.some((d) => d.publicaciones.includes(publicationId))) return true;
    } catch {
        // Sin Explorar de demostración para este actor.
    }
    return getHomeFeed(actorId).bloques.some(
        (b) => (b.tipo === 'turnos' || b.tipo === 'empleos') && b.publicaciones.includes(publicationId),
    );
}

/** Esperas simuladas mientras Supabase está pausado: enviar el código, verificarlo, postular. */
export const DEMO_LATENCY_MS = 600;
