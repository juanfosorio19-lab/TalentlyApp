// Lo que solo usan las pantallas de Gestionar (GES-01, GES-02, GES-04):
// motivos de cierre, mensajes de «No seleccionar» y los filtros de GES-02.
// Las cifras y estados de una publicación (publicationView, rosterView,
// applicantsOf, metricsOf…) salen de demo/manageSelectors, para que Inicio,
// Actividad y Explorar digan lo mismo.
import type { BadgeStatus } from '../../ui/Badge';
import { isInProcess, isNew } from '../demo/manageSelectors';

/** Motivos de «Cerrar publicación». */
export const CLOSE_REASONS = {
    turno: ['Ya completé los cupos', 'El evento se canceló', 'Encontré personas por otro medio', 'Otro motivo'],
    empleo: ['Ya contraté a alguien', 'Contraté por otro medio', 'Ya no necesito a alguien', 'Otro motivo'],
} as const;

/** Mensajes amables de «No seleccionar» (la persona recibe este texto, sin más detalles). */
export const REJECT_MESSAGES = [
    'Gracias por postular. Esta vez buscamos otro perfil.',
    'Gracias por postular. Ya avanzamos con otras personas.',
    'Gracias por postular. El horario o la comuna no calzan esta vez.',
] as const;

/** «Todos» → todos, «En proceso» → en-proceso (para la URL). */
export function filterSlug(label: string): string {
    return label
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .toLowerCase()
        .replace(/\s+/g, '-');
}

/** ¿La persona va en el filtro? Los filtros son los de los datos («Todos», «Nuevos», «En proceso», «No seleccionados»). */
export function matchesFilter(estado: BadgeStatus | undefined, filter: string): boolean {
    switch (filterSlug(filter)) {
        case 'nuevos':
            return isNew(estado);
        case 'en-proceso':
            return isInProcess(estado);
        case 'no-seleccionados':
            return estado === 'No seleccionado';
        default:
            return true;
    }
}
