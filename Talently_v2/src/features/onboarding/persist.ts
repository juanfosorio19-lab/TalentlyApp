// El borrador guardado en el teléfono (localStorage), para que «Guardar y
// salir» cumpla lo que promete: aunque Android cierre la app o se recargue la
// página, al volver aparece «Retomar tu registro». Lógica pura: qué se guarda
// y cómo se lee de vuelta (lo prueba persist.test.ts); store.ts escribe y lee.
//
// Nunca se guarda la contraseña (no está en el borrador), ni la foto (es un
// object URL que muere con la app), ni una subida a medias.
import { INTENCIONES_CONTRATAR, INTENCIONES_TRABAJAR, borradorInicial, type Intencion, type OnboardingDraft } from './model';

export const STORAGE_KEY = 'talently.onboarding.borrador';

/** Sube cuando cambia la forma del borrador: uno de otra versión se descarta. */
const VERSION = 1;

/** El borrador sin lo que no sobrevive a cerrar la app: la foto y las subidas en curso. */
export function sinVolatiles(draft: OnboardingDraft): OnboardingDraft {
    const { credencial } = draft.trabajo;
    return {
        ...draft,
        datos: { ...draft.datos, foto: null, fotoSubiendo: false },
        trabajo: {
            ...draft.trabajo,
            credencial: credencial.estado === 'subiendo' ? { estado: 'pendiente', progreso: 0, archivo: null } : credencial,
        },
    };
}

export function serializarBorrador(draft: OnboardingDraft): string {
    return JSON.stringify({ v: VERSION, draft: sinVolatiles(draft) });
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Campos del borrador que pueden quedar sin elegir (null): la comuna, el
 * oficio principal, el bloque, los montos de ONB-T3 (vacíos o «Prefiero no
 * decir»), el archivo de la credencial… Un null guardado en ellos se respeta.
 */
const NULLABLES: ReadonlySet<string> = new Set([
    'bloque',
    'retomar',
    'comuna',
    'foto',
    'principal',
    'desde',
    'radio',
    'sueldo',
    'tarifa',
    'sistema',
    'archivo',
]);

/**
 * Copia de `raw` solo los campos que existen en `base` y tienen su mismo tipo
 * (o null, si el campo puede quedar sin elegir; los objetos se revisan por
 * dentro). Lo que falta o no calza queda como en `base`.
 */
function mezclar<T>(base: T, raw: unknown): T {
    if (!isRecord(base) || !isRecord(raw)) return base;
    const out: Record<string, unknown> = { ...base };
    for (const [key, actual] of Object.entries(base)) {
        if (!(key in raw)) continue;
        const valor = raw[key];
        if (valor === null) {
            if (actual === null || NULLABLES.has(key)) out[key] = null;
        } else if (Array.isArray(actual)) {
            if (Array.isArray(valor)) out[key] = valor;
        } else if (isRecord(actual)) {
            out[key] = mezclar(actual, valor);
        } else if (actual === null) {
            // Sin valor de partida (bloque, retomar, archivo): un texto o un objeto.
            if (typeof valor === 'string' || isRecord(valor)) out[key] = valor;
        } else if (typeof valor === typeof actual) {
            out[key] = valor;
        }
    }
    return out as T;
}

const INTENCIONES: readonly Intencion[] = [...INTENCIONES_TRABAJAR, ...INTENCIONES_CONTRATAR];

/** Lee lo guardado; null si no hay nada, está dañado o es de otra versión. */
export function leerBorrador(texto: string | null): OnboardingDraft | null {
    if (!texto) return null;
    let parsed: unknown;
    try {
        parsed = JSON.parse(texto);
    } catch {
        return null;
    }
    if (!isRecord(parsed) || parsed.v !== VERSION || !isRecord(parsed.draft)) return null;
    const draft = sinVolatiles(mezclar(borradorInicial(), parsed.draft));
    return { ...draft, intenciones: draft.intenciones.filter((i) => INTENCIONES.includes(i)) };
}
