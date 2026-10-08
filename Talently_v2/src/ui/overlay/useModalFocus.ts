// Foco de las capas modales (BottomSheet, Dialog, SheetPicker, MatchModal).
// Vive en overlay/ junto a useOverlay: es infraestructura de todas las capas.
import { useEffect, type RefObject } from 'react';

const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
].join(',');

// Capas con el foco atrapado, en orden de apertura: solo la de arriba actúa
// (un Dialog abierto desde una hoja se queda con el foco).
const traps: HTMLElement[] = [];
// Lo que este módulo dejó `inert` (las capas de abajo y sus velos), para
// devolverlo tal cual y no tocar un `inert` que haya puesto otro.
const madeInert = new Set<HTMLElement>();
// Capas que ya soltaron el foco y siguen montadas mientras salen, con el
// elemento que las abrió: el foco nunca vuelve a algo que se está yendo.
const released = new Map<HTMLElement, HTMLElement | null>();

function focusables(root: HTMLElement): HTMLElement[] {
    return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.closest('[inert]') && el.getClientRects().length > 0,
    );
}

/** La capa y su velo (`.tl-scrim`, el hermano anterior en el marcado del sistema). */
function layerOf(root: HTMLElement): HTMLElement[] {
    const scrim = root.previousElementSibling;
    return scrim instanceof HTMLElement && scrim.classList.contains('tl-scrim') ? [scrim, root] : [root];
}

function isLeaving(el: HTMLElement): boolean {
    for (const root of released.keys()) if (layerOf(root).includes(el)) return true;
    return false;
}

/**
 * Con capas apiladas (un Dialog sobre una hoja), todas las de abajo quedan
 * `inert`: el velo de arriba (z-scrim) queda bajo la hoja de abajo (z-modal) y
 * sin esto sus botones se podrían tocar con el Dialog abierto. Una capa que
 * está saliendo se queda `inert` (la propia capa lo pide mientras cierra).
 */
function syncInert(): void {
    const top = traps[traps.length - 1];
    const below = new Set<HTMLElement>();
    for (const root of traps) if (root !== top) layerOf(root).forEach((el) => below.add(el));
    madeInert.forEach((el) => {
        if (below.has(el)) return;
        if (!isLeaving(el)) el.inert = false;
        madeInert.delete(el);
    });
    below.forEach((el) => {
        if (el.inert) return;
        el.inert = true;
        madeInert.add(el);
    });
}

/**
 * A dónde vuelve el foco: al que abrió la capa o, si ese está en una capa que
 * también se va (hoja y Dialog que cierran juntos), al que abrió esa otra.
 */
function returnTarget(opener: HTMLElement | null): HTMLElement | null {
    let target = opener;
    for (let hops = 0; target && hops < 8; hops++) {
        const owner = [...released.keys()].find((root) => root.contains(target));
        if (!owner) break;
        target = released.get(owner) ?? null;
    }
    return target;
}

/**
 * Mientras `active` sea true: al empezar lleva el foco a `initialRef` (o al
 * primer control de la capa), lo mantiene dentro (Tab y Mayús+Tab dan la
 * vuelta; si se escapa, vuelve), deja `inert` las capas de abajo y al
 * terminar lo devuelve al elemento que tenía el foco antes de abrir.
 */
export function useModalFocus(
    active: boolean,
    containerRef: RefObject<HTMLElement | null>,
    initialRef?: RefObject<HTMLElement | null>,
): void {
    useEffect(() => {
        const root = containerRef.current;
        if (!active || !root) return;
        const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        released.delete(root);
        traps.push(root);
        syncInert();
        const isTop = () => traps[traps.length - 1] === root;

        (initialRef?.current ?? focusables(root)[0] ?? root).focus({ preventScroll: true });

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab' || !isTop()) return;
            const list = focusables(root);
            const first = list[0];
            const last = list[list.length - 1];
            if (!first || !last) {
                e.preventDefault();
                return;
            }
            const current = document.activeElement;
            const inside = current instanceof Node && root.contains(current);
            const index = current instanceof HTMLElement ? list.indexOf(current) : -1;
            if (e.shiftKey && (!inside || index <= 0)) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && (!inside || current === last)) {
                e.preventDefault();
                first.focus();
            }
        };
        const onFocusIn = (e: FocusEvent) => {
            if (!isTop() || (e.target instanceof Node && root.contains(e.target))) return;
            (focusables(root)[0] ?? root).focus({ preventScroll: true });
        };
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('focusin', onFocusIn);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('focusin', onFocusIn);
            const i = traps.indexOf(root);
            if (i !== -1) traps.splice(i, 1);
            released.forEach((_, r) => {
                if (!r.isConnected) released.delete(r);
            });
            if (root.isConnected) released.set(root, opener);
            // Primero se libera la capa de abajo: el que abrió suele estar en ella.
            syncInert();
            const target = returnTarget(opener);
            if (target?.isConnected) target.focus({ preventScroll: true });
        };
    }, [active, containerRef, initialRef]);
}
