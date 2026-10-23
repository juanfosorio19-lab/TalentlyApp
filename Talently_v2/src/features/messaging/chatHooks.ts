// Comportamiento de MSG-02 que no es dibujo: las capas en la URL una detrás
// de otra (spec §5.3 regla 3) y el scroll de la conversación.
import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import type { UrlSheet } from '../../app/sheets';

/**
 * El foco no está en la pantalla: en <body>, en algo que ya salió del DOM o
 * dentro de la capa que está saliendo (queda `inert` y el navegador lo suelta
 * al body en el cuadro siguiente).
 */
function focusLost(): boolean {
    const active = document.activeElement;
    return !active || active === document.body || !active.isConnected || active.closest('[inert]') !== null;
}

/**
 * Las hojas y el Dialog de la conversación viven en la URL (?sheet=…), de a
 * una. `after(sheet, action)` cierra la que está abierta y corre `action`
 * recién cuando ya cerró: así la siguiente (Adjuntar → certificado, ⋯ →
 * Reportar o Bloquear) guarda como origen el botón que abrió la primera, el
 * foco vuelve ahí, y el atrás no reabre la anterior (el historial queda
 * conversación → siguiente hoja).
 *
 * `current` es el nombre de la capa abierta (o `null`). Al cerrarse todas, si
 * el foco no volvió a la pantalla (la hoja se abrió desde un enlace y nadie la
 * abrió en pantalla; el AppBar del chat no tiene un h1 al que volver), pasa a
 * `fallback(laQueCerró)`, un control que sigue ahí.
 */
export function useLayerSequence(current: string | null, fallback: (closed: string) => HTMLElement | null) {
    const pending = useRef<(() => void) | null>(null);
    const previous = useRef(current);
    const fallbackRef = useRef(fallback);
    useEffect(() => {
        fallbackRef.current = fallback;
    });

    // Corre después de que la capa devolvió el foco (useModalFocus lo hace al limpiar su efecto).
    useEffect(() => {
        const closed = current === null ? previous.current : null;
        previous.current = current;
        if (closed === null) return;
        if (focusLost()) fallbackRef.current(closed)?.focus({ preventScroll: true });
        const run = pending.current;
        pending.current = null;
        run?.();
    }, [current]);

    return useCallback((sheet: UrlSheet, action: () => void) => {
        if (!sheet.open) {
            action();
            return;
        }
        pending.current = action;
        sheet.hide();
    }, []);
}

/** scrollTop de cada entrada del historial de una conversación (en memoria: al recargar parte abajo). */
const savedScroll = new Map<string, number>();

const nearBottom = (el: HTMLElement) => el.scrollHeight - el.scrollTop - el.clientHeight < 24;

/**
 * La conversación queda pegada abajo, como un chat: la primera vez que se
 * abre esa entrada del historial, al llegar o enviar un mensaje, y cuando
 * cambia el alto (aparece el aviso del Composer o se abre el teclado) si la
 * persona ya estaba abajo. Al volver a la misma entrada (atrás desde PRC-01 o
 * DET-01), queda donde estaba («Atrás vuelve al origen con su scroll»).
 * `entryKey` identifica la entrada: id de la conversación + location.key.
 */
export function useChatScroll(ref: RefObject<HTMLElement | null>, count: number, entryKey: string) {
    const atBottom = useRef(true);
    const lastCount = useRef<number | null>(null);
    const keyRef = useRef(entryKey);

    useLayoutEffect(() => {
        keyRef.current = entryKey;
    }, [entryKey]);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const onScroll = () => {
            atBottom.current = nearBottom(el);
            savedScroll.set(keyRef.current, el.scrollTop);
        };
        const observer = new ResizeObserver(() => {
            if (atBottom.current) el.scrollTop = el.scrollHeight;
        });
        observer.observe(el);
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            observer.disconnect();
            el.removeEventListener('scroll', onScroll);
        };
    }, [ref]);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el || lastCount.current === count) return;
        const first = lastCount.current === null;
        lastCount.current = count;
        const saved = first ? savedScroll.get(entryKey) : undefined;
        if (saved !== undefined) {
            el.scrollTop = saved;
            atBottom.current = nearBottom(el);
            return;
        }
        el.scrollTop = el.scrollHeight;
        atBottom.current = true;
    }, [ref, count, entryKey]);
}
