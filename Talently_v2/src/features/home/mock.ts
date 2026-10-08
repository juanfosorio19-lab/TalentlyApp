// Lo que «Inicio y notificaciones» necesita y src/features/demo aún no trae.
// Solo deriva o completa los datos de demostración (Supabase pausado); cuando
// vuelva la base de datos, cada función se reemplaza por su consulta real.
// Los pedidos para moverlo a src/features/demo van en el resultado del feature.
import { getHomeFeed, getManagedPublication, getNotifications, getOrg, getPerson, getPublication } from '../demo/data';
import type { DemoActor, DemoActorId } from '../demo/session';
import type { DemoNotification, DemoTarget, DemoVerification } from '../demo/types';
import { paths } from '../../app/paths';

/**
 * ¿Viene del final del onboarding? `?demo=jorge&nuevo=1` (antes del #) o
 * `#/inicio?nuevo=1`. Solo Jorge tiene esa variante (INI-01-jorge-nuevo).
 */
export function nuevoEnUrl(hashSearch: URLSearchParams): boolean {
    return new URLSearchParams(window.location.search).get('nuevo') === '1' || hashSearch.get('nuevo') === '1';
}

/**
 * Bandeja de NOT-01. Recién registrado (getHomeFeed solo tiene esa variante
 * para Jorge, con la campana sin contador) todavía no tiene notificaciones.
 */
export function getInbox(actorId: DemoActorId, recienRegistrado: boolean): DemoNotification[] {
    if (recienRegistrado && actorId === 'jorge') return [];
    return getNotifications(actorId);
}

/** El feed de Inicio del actor, con la variante recién registrado cuando aplica. */
export function getFeed(actorId: DemoActorId, recienRegistrado: boolean) {
    return getHomeFeed(actorId, { recienRegistrado });
}

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

/**
 * A dónde lleva un destino de los datos (spec §5.4). `null` si la pantalla
 * todavía no tiene ruta en paths.ts: quien llama muestra «Disponible pronto».
 */
export function targetPath(target: DemoTarget, actorId: DemoActorId): string | null {
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
            // Quien publicó evalúa en los cupos del turno (GES-04). Quien trabajó lo hace en
            // REV-01 (/resena/:engagementId), que aún no tiene ruta en paths.ts.
            const managed = getManagedPublication(target.publicationId);
            if (managed?.ownerId !== actorId) return null;
            const shiftId = managed.cupos?.[0]?.id;
            return shiftId ? paths.cuposTurno(target.publicationId, shiftId) : paths.gestionarPublicacion(target.publicationId);
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

/** «jue 10 dic» → «2026-12-10» (AgendaEvent pide el día civil). El año es el de la demo. */
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];

export function isoOf(fecha: string, year: number): string {
    const [, day = '1', month = 'ene'] = fecha.split(' ');
    const m = MESES.indexOf(month === 'sep' ? 'sept' : month) + 1;
    return `${year}-${String(m).padStart(2, '0')}-${day.padStart(2, '0')}`;
}
