// A dónde lleva un destino de los datos de demostración (DemoTarget → ruta de
// paths.ts). Un solo lugar para Inicio, NOT-01, Actividad, Mensajes y
// Explorar. La ruta puede no estar construida todavía: quien navega usa
// useOpenPath() (src/app/navigation), que muestra «Disponible pronto».
import { paths } from '../../app/paths';
import { getManagedPublication, getProcess } from './data';
import type { DemoActorId } from './session';
import type { DemoTarget } from './types';

export function targetPath(target: DemoTarget, actorId: DemoActorId): string {
    switch (target.pantalla) {
        case 'inicio':
            return paths.inicio();
        case 'explorar':
            return paths.explorar(target.tipo);
        case 'publicacion':
            return paths.publicacion(target.publicationId);
        case 'gestion':
            return paths.gestionarPublicacion(target.publicationId);
        case 'postulantes':
            return paths.postulantes(target.publicationId);
        case 'cupos':
            return paths.cuposTurno(target.publicationId, target.bloqueId);
        case 'evaluar': {
            // Quien publicó evalúa en los cupos del turno (GES-04); quien trabajó, en REV-01.
            const managed = getManagedPublication(target.publicationId);
            if (managed?.ownerId === actorId) {
                const shiftId = managed.cupos?.[0]?.id;
                return shiftId ? paths.cuposTurno(target.publicationId, shiftId) : paths.gestionarPublicacion(target.publicationId);
            }
            return paths.resena(target.publicationId);
        }
        case 'conversacion':
            return paths.conversacion(target.conversationId);
        case 'proceso':
            return paths.proceso(target.processId);
        case 'mi-turno':
            return paths.miTurno(target.applicationId);
        case 'perfil':
            return paths.perfil();
        case 'verificacion':
            return paths.verificacion();
    }
}

/** La publicación de un proceso (PRC-01), para mostrar su detalle mientras PRC-01 no exista. */
export function processPublicationId(processId: string): string | undefined {
    return getProcess(processId)?.publicationId;
}
