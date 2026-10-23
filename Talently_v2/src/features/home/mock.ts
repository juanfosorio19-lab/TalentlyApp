// Lo que «Inicio y notificaciones» necesita y src/features/demo aún no trae.
// Solo deriva o completa los datos de demostración (Supabase pausado); cuando
// vuelva la base de datos, cada función se reemplaza por su consulta real.
import { getOrg, getPerson, getPublication } from '../demo/data';
import type { DemoActor } from '../demo/session';

/** Escudo del Avatar en «Usar Talently como»: solo con verificación real. */
export function actorVerified(actor: DemoActor): boolean {
    return actor.kind === 'organizacion'
        ? Boolean(getOrg(actor.id)?.verificada)
        : (getPerson(actor.id)?.verificaciones.length ?? 0) > 0;
}

/**
 * Nombre con el que se publica (PUBL-01 «Publicas como …»): la organización,
 * o el hogar de la persona («Familia en Ñuñoa», el autor de su aviso).
 */
export function publisherName(actor: DemoActor, avisoId: string | undefined): string {
    if (actor.kind === 'organizacion') return actor.fullName;
    return (avisoId && getPublication(avisoId)?.autor.nombre) || actor.fullName;
}

/** «jue 10 dic» → «2026-12-10» (AgendaEvent pide el día civil). El año es el de la demo. */
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

export function isoOf(fecha: string, year: number): string {
    const [, day = '1', month = 'ene'] = fecha.split(' ');
    const m = MESES.indexOf(month === 'sep' ? 'sept' : month) + 1;
    return `${year}-${String(m).padStart(2, '0')}-${day.padStart(2, '0')}`;
}
