// Foco al cambiar de pantalla (accesibilidad, spec §5.3): cuando el control
// tocado desaparece con la navegación, el foco cae al <body> y el lector de
// pantalla no anuncia la pantalla nueva. RootLayout monta <FocusRescue/> una
// sola vez: después de cada cambio de entrada del historial, si el foco quedó
// en el body,
//   1. al volver (POP), lo devuelve al control que lo tenía al salir de esa
//      entrada (la tarjeta de EXP-02 que abrió DET-01), si sigue en pantalla;
//   2. si no, al título de la pantalla: el h1 que la pantalla ya dejó
//      enfocable (`main h1[tabindex="-1"]`, GES-01, GES-04, DET-01) o el
//      primer h1 visible (el del AppBar; en MSG-02, el h1 oculto del AppBar chat).
// Nada se mueve antes de que la persona toque, teclee o use el atrás de
// Android (BackButtonManager llama a markInteraction): al abrir la app el foco
// es del navegador. Las pantallas que mueven el foco por su cuenta
// (StepLayout, ResultScreen, las capas) no se tocan: el foco ya no está en el body.
import { useEffect, useLayoutEffect, useRef } from 'react';

/** ¿Ya tocó, tecleó o usó el atrás de Android? Antes de eso (la app recién abierta, en cualquier ruta) el foco no se mueve. */
let interacted = false;

/**
 * La persona hizo algo. Toques y teclas se cuentan solos; el atrás de Android
 * (Capacitor `backButton`) no pasa por el DOM: BackButtonManager lo avisa aquí
 * antes de navegar, así la app abierta por un enlace en /mensajes que vuelve a
 * Inicio con el atrás deja el foco en el título de Inicio y no en el body.
 */
export function markInteraction(): void {
    interacted = true;
}

if (typeof window !== 'undefined') {
    window.addEventListener('pointerdown', markInteraction, { capture: true, once: true });
    window.addEventListener('keydown', markInteraction, { capture: true, once: true });
}

/** Solo pruebas: simula que la persona ya interactuó (o no). */
export function setInteractedForTests(value: boolean): void {
    interacted = value;
}

export const hasInteracted = (): boolean => interacted;

/** Se ve y se puede enfocar: tiene caja, no está oculto con `visibility` ni dentro de algo `inert` o de una capa. */
function isShown(el: HTMLElement): boolean {
    if (!el.isConnected || el.closest('[inert], [role="dialog"], [aria-hidden="true"]')) return false;
    if (el.getClientRects().length === 0) return false;
    return typeof window.getComputedStyle !== 'function' || window.getComputedStyle(el).visibility !== 'hidden';
}

/** ¿El foco se perdió? En el body, en ninguna parte o en un nodo que ya no está. */
export function focusIsLost(): boolean {
    const active = document.activeElement;
    return !active || active === document.body || active === document.documentElement || !active.isConnected;
}

/**
 * Los títulos posibles de la pantalla, en orden: el h1 que la pantalla dejó
 * enfocable en su contenido y después cualquier h1 visible (AppBar, contenido).
 */
function titleCandidates(): HTMLElement[] {
    const lists = [
        '.tl-app-screen main h1[tabindex="-1"], main h1[tabindex="-1"]',
        '.tl-app-screen h1.tl-appbar__title, .tl-app-screen main h1, .tl-app-screen h1',
        'main h1, h1',
    ];
    const seen = new Set<HTMLElement>();
    const out: HTMLElement[] = [];
    for (const selector of lists) {
        for (const el of document.querySelectorAll<HTMLElement>(selector)) {
            if (seen.has(el)) continue;
            seen.add(el);
            if (isShown(el)) out.push(el);
        }
    }
    return out;
}

/**
 * Lleva el foco al título de la pantalla (sin mover el scroll). Le pone
 * tabindex -1 si no lo tiene y el anillo del sistema (`tl-focus`). Devuelve
 * true si lo logró.
 */
export function focusScreenTitle(): boolean {
    for (const title of titleCandidates()) {
        if (!title.hasAttribute('tabindex')) title.setAttribute('tabindex', '-1');
        title.classList.add('tl-focus');
        title.focus({ preventScroll: true });
        if (document.activeElement === title) return true;
    }
    return false;
}

// ─── El control que tenía el foco en cada entrada (para volver a él) ────────

/** Cómo reconocer el control al volver a la entrada: el DOM es otro (la pantalla se montó de nuevo). */
export interface FocusMark {
    tag: string;
    /** `href` de un enlace (la tarjeta de una publicación). */
    href?: string;
    /** Nombre visible: aria-label o el texto. */
    label: string;
}

const MAX_LABEL = 160;

function labelOf(el: HTMLElement): string {
    return (el.getAttribute('aria-label') ?? el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_LABEL);
}

/** La marca de un control enfocado; null si no vale la pena recordarlo (el body, un título). */
export function markOf(el: Element | null): FocusMark | null {
    if (!(el instanceof HTMLElement) || el === document.body || el.tagName === 'H1') return null;
    if (el.closest('[role="dialog"]')) return null;
    const href = el.tagName === 'A' ? (el.getAttribute('href') ?? undefined) : undefined;
    const label = labelOf(el);
    if (!href && !label) return null;
    return { tag: el.tagName, href, label };
}

/** El control de la pantalla que calza con la marca (mismo enlace o mismo nombre), si está a la vista. */
export function findMarked(mark: FocusMark): HTMLElement | null {
    const all = Array.from(document.querySelectorAll<HTMLElement>(mark.tag.toLowerCase())).filter(isShown);
    const byHref = mark.href ? all.filter((el) => el.getAttribute('href') === mark.href) : [];
    const pool = byHref.length ? byHref : mark.href ? [] : all;
    return pool.find((el) => labelOf(el) === mark.label) ?? byHref[0] ?? null;
}

const marks = new Map<string, FocusMark>();

/** Recuerda el control enfocado en la entrada `key` (lo llama FocusRescue en cada `focusin`). */
export function rememberFocus(key: string, el: Element | null): void {
    const mark = markOf(el);
    if (mark) marks.set(key, mark);
}

/** Devuelve el foco al control que lo tenía al salir de la entrada `key`. true si lo logró. */
export function restoreFocus(key: string): boolean {
    const mark = marks.get(key);
    const el = mark ? findMarked(mark) : null;
    if (!el) return false;
    el.focus({ preventScroll: true });
    return document.activeElement === el;
}

/**
 * Después de cambiar de entrada (`key`): si la persona ya interactuó y el foco
 * quedó en el body, al volver (`pop`) lo devuelve al control de antes y, si
 * no, al título de la pantalla.
 */
export function rescueFocus(key: string, pop: boolean): void {
    if (!interacted || !focusIsLost()) return;
    if (pop && restoreFocus(key)) return;
    focusScreenTitle();
}

/** Solo pruebas. */
export function resetFocusMarks(): void {
    marks.clear();
}

// ─── El hook de RootLayout ──────────────────────────────────────────────────

/**
 * Una sola vez, en RootLayout: recuerda el control enfocado en cada entrada y,
 * en cada cambio de entrada (`key`), rescata el foco perdido en el cuadro
 * siguiente, cuando la pantalla nueva ya está montada y ScrollRestoration
 * terminó.
 */
export function useFocusRescue(key: string, pop: boolean): void {
    const keyRef = useRef(key);
    useLayoutEffect(() => {
        keyRef.current = key;
    }, [key]);
    useEffect(() => {
        const onFocusIn = (e: FocusEvent) => rememberFocus(keyRef.current, e.target instanceof Element ? e.target : null);
        document.addEventListener('focusin', onFocusIn);
        return () => document.removeEventListener('focusin', onFocusIn);
    }, []);
    useEffect(() => {
        const frame = window.requestAnimationFrame(() => rescueFocus(key, pop));
        return () => window.cancelAnimationFrame(frame);
    }, [key, pop]);
}
