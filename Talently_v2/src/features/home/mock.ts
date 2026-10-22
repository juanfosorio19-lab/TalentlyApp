// Lo que «Inicio y notificaciones» necesita y src/features/demo aún no trae.
// Solo deriva o completa los datos de demostración (Supabase pausado); cuando
// vuelva la base de datos, cada función se reemplaza por su consulta real.
import { getOrg, getPerson, getPublication } from '../demo/data';
import type { DemoActor } from '../demo/session';
import type { DemoVerification } from '../demo/types';

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

/**
 * Qué se verificó, para la hoja «Verificación de …». // no está en el prototipo:
 * los datos de demostración no traen la fecha de cada verificación.
 */
const QUE_SE_VERIFICO: Record<string, string> = {
    'Organización verificada': 'Revisamos el RUT y los documentos de la organización',
    'Identidad verificada': 'Revisamos su cédula y una selfie',
    'Teléfono verificado': 'Confirmó su número con un código SMS',
    'Credencial SPD verificada': 'Revisamos su credencial SPD (ex OS-10)',
};

export function verificationDetail(v: DemoVerification): string | undefined {
    const what = QUE_SE_VERIFICO[v.label];
    return [what, v.vence].filter(Boolean).join(' · ') || undefined;
}

/** «jue 10 dic» → «2026-12-10» (AgendaEvent pide el día civil). El año es el de la demo. */
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

export function isoOf(fecha: string, year: number): string {
    const [, day = '1', month = 'ene'] = fecha.split(' ');
    const m = MESES.indexOf(month === 'sep' ? 'sept' : month) + 1;
    return `${year}-${String(m).padStart(2, '0')}-${day.padStart(2, '0')}`;
}
