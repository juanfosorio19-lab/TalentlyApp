// Lo que Mensajes necesita y features/demo todavía no trae (pedido en
// «requests»). Cuando la demo lo tenga, o cuando vuelva Supabase, este
// archivo se borra sin tocar las pantallas.
import type { DemoViewerId } from '../demo/types';

/**
 * Hora de la demo (índice del prototipo F1: «jue 10 dic 2026, 13:00»; la
 * barra de estado de MSG-02 dice 13:00). Un mensaje enviado ahora lleva esta
 * hora («13:00 · Enviado»), igual que el prototipo.
 */
export const DEMO_NOW_TIME = '13:00';

/** Lo que tarda el envío simulado («Enviando…» → «Enviado»). */
export const SEND_DELAY_MS = 700;

/** Duración de la entrevista en el calendario (.ics): no está en el prototipo. */
export const INTERVIEW_MINUTES = 60;

/**
 * Flujo 10: Marta Huanca solo existe como quien mira (DemoViewerId 'marta'),
 * no como actor de la sesión, así que `?demo=marta` hoy cae en Matías. Mientras
 * la demo no la sume como actor (pedido en requests), Mensajes la lee de la URL
 * con la misma regla que session.tsx (antes o después del #).
 */
function viewerFromUrl(): DemoViewerId | null {
    if (typeof window === 'undefined') return null;
    const demo =
        new URLSearchParams(window.location.search).get('demo') ??
        new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('demo');
    return demo === 'marta' ? 'marta' : null;
}

export const VIEWER_OVERRIDE: DemoViewerId | null = viewerFromUrl();
