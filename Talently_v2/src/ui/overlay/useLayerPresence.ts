// Montaje de las capas (BottomSheet, Dialog): al cerrar se quedan montadas
// mientras dura su salida, para que bundle.css pueda animarla.
import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';

/**
 * `mounted`: la capa debe estar en el DOM (abierta o cerrándose).
 * `exited`: la capa avisa que terminó de salir y se desmonta.
 */
export function useLayerPresence(open: boolean): { mounted: boolean; exited: () => void } {
    const [mounted, setMounted] = useState(open);
    // Estado derivado durante el render (patrón de React): al abrir se monta de inmediato.
    if (open && !mounted) setMounted(true);
    const exited = useCallback(() => setMounted(false), []);
    return { mounted: mounted || open, exited };
}

/** Milisegundos de la transición o animación más larga que tiene el elemento ahora. */
function motionMs(el: Element): number {
    const cs = getComputedStyle(el);
    const ms = (list: string) => list.split(',').map((v) => (v.trim().endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000) || 0);
    const longest = (durations: number[], delays: number[], skip?: (i: number) => boolean) =>
        durations.reduce((max, d, i) => (skip?.(i) ? max : Math.max(max, d + (delays[i % delays.length] ?? 0))), 0);
    const names = cs.animationName.split(',').map((n) => n.trim());
    return Math.max(
        longest(ms(cs.transitionDuration), ms(cs.transitionDelay)),
        // Reducir movimiento deja `animation-duration: 1ms` en todo: solo cuentan las animaciones con nombre.
        longest(ms(cs.animationDuration), ms(cs.animationDelay), (i) => (names[i % names.length] ?? 'none') === 'none'),
    );
}

/**
 * Con `closing` en true, espera a que la capa (y su velo, el `.tl-scrim`
 * anterior) terminen su transición o animación de salida y llama a
 * `onExited`. Si bundle.css no define ninguna (o con reducir movimiento),
 * la desmonta antes de pintar.
 */
export function useLayerExit(closing: boolean, layerRef: RefObject<HTMLElement | null>, onExited: () => void): void {
    useLayoutEffect(() => {
        if (!closing) return;
        const layer = layerRef.current;
        if (!layer) {
            onExited();
            return;
        }
        const scrim = layer.previousElementSibling?.classList.contains('tl-scrim') ? layer.previousElementSibling : null;
        const parts = [layer, scrim].filter((el): el is Element => el !== null).map((el) => ({ el, ms: motionMs(el) }));
        const last = parts.reduce((a, b) => (b.ms > a.ms ? b : a));
        if (last.ms <= 0) {
            onExited();
            return;
        }
        let done = false;
        const finish = () => {
            if (done) return;
            done = true;
            onExited();
        };
        const onEnd = (e: Event) => {
            if (e.target === last.el) finish();
        };
        last.el.addEventListener('transitionend', onEnd);
        last.el.addEventListener('animationend', onEnd);
        // Si el evento no llega (transición cortada), el tiempo manda.
        const timer = window.setTimeout(finish, last.ms + 50);
        return () => {
            done = true;
            window.clearTimeout(timer);
            last.el.removeEventListener('transitionend', onEnd);
            last.el.removeEventListener('animationend', onEnd);
        };
    }, [closing, layerRef, onExited]);
}
