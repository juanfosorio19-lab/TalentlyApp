// Lo que el detalle necesita y los datos de demostración (src/features/demo)
// aún no traen. Todo sale del prototipo F1; lo que no está en él lleva
// «// no está en el prototipo». Pedido en «requests» para que viva en demo/.
import { getApplications, getExplore, getHomeFeed } from '../demo/data';
import type { DemoActorId } from '../demo/session';

/** Un archivo de CV («CV Jorge Muñoz.pdf» · «180 KB»): el de demo/profileState (useCv) o uno elegido en DET-02. */
export type { DemoCv as CvFile } from '../demo/types';

/** Ejemplo del campo «Mensaje (opcional)» de DET-02, por oferta. */
const MESSAGE_EXAMPLE: Record<string, string> = {
    'empleo-guardia-4x4': 'Ej.: tengo 8 años como guardia y vivo cerca',
    'empleo-mecanico-automotriz': 'Ej.: tengo 8 años como mecánico y vivo en Macul',
};

export function messageExample(publicationId: string): string {
    return MESSAGE_EXAMPLE[publicationId] ?? 'Ej.: cuéntales tu experiencia y por qué te interesa'; // no está en el prototipo
}


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
