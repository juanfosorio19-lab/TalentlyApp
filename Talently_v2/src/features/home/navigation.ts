// Navegación de «Inicio y notificaciones» sobre la base compartida: toda ruta
// sale de paths.ts o de demo/targets y se abre con useOpenPath (si la
// pantalla aún no existe, «Disponible pronto» en vez de SYS-404).
import { useCallback, useEffect } from 'react';
import type { NavigateOptions } from 'react-router-dom';
import { useOpenPath, type LinkTargetProps } from '../../app/navigation/useOpenPath';
import { paths } from '../../app/paths';
import { useDemoSession } from '../demo/session';
import { targetPath } from '../demo/targets';
import type { DemoTarget } from '../demo/types';

/** `/perfil?sheet=cv`: Perfil con la hoja «Subir CV» abierta (la tarjeta «Te falta 1 cosa · Subir CV en PDF» de Inicio). */
export const profileCvPath = () => paths.perfil('cv');

export function useHomeNavigation() {
    const { actor } = useDemoSession();
    const { open, linkProps, soon, canOpen } = useOpenPath();

    // Ir a la raíz de otra pestaña hace replace (spec §5.3 regla 1) y a una pantalla apilada, push
    // (regla 2): lo decide useOpenPath, que además deja Inicio debajo al salir de él (paso 5 en la web).
    const go = useCallback((path: string, options?: NavigateOptions) => open(path, options), [open]);
    const link = useCallback((path: string): LinkTargetProps => linkProps(path), [linkProps]);

    /** Un destino de los datos (DemoTarget) como enlace: `href` real o, si no tiene pantalla, «Disponible pronto». */
    const targetLink = useCallback(
        (target: DemoTarget | undefined): LinkTargetProps => (target ? link(targetPath(target, actor.id)) : { onClick: soon }),
        [actor.id, link, soon],
    );

    const openTarget = useCallback(
        (target: DemoTarget | undefined) => (target ? go(targetPath(target, actor.id)) : soon()),
        [actor.id, go, soon],
    );

    return { go, link, targetLink, openTarget, soon, canOpen };
}

/**
 * Lleva el foco al título de la pantalla (el h1 del AppBar) cuando el elemento
 * tocado ya no está y el foco cayó al body: la campana al abrir NOT-01, o la
 * fila de una notificación que cambió de actor y volvió a Inicio. AppBar no
 * deja pasar tabIndex al título: se lo pone como useModalFocus.screenFallback,
 * con el anillo del sistema (tl-focus). Pedido en «requests» que AppBar lo traiga.
 */
export function focusScreenTitle(): void {
    const title = document.querySelector<HTMLElement>('.tl-app-screen h1.tl-appbar__title') ?? document.querySelector<HTMLElement>('h1.tl-appbar__title');
    if (!title) return;
    if (!title.hasAttribute('tabindex')) title.setAttribute('tabindex', '-1');
    title.classList.add('tl-focus');
    title.focus({ preventScroll: true });
}

/**
 * ¿Ya tocó o tecleó algo? Antes de eso (la app recién abierta, en cualquier
 * ruta) el foco es del navegador y no se mueve.
 */
let interacted = false;
if (typeof window !== 'undefined') {
    const mark = () => {
        interacted = true;
    };
    window.addEventListener('pointerdown', mark, { capture: true, once: true });
    window.addEventListener('keydown', mark, { capture: true, once: true });
}

/**
 * Cada vez que cambia `trigger` (la entrada del historial), si el foco quedó
 * en el body, pasa al título de la pantalla.
 */
export function useFocusTitleIfLost(trigger: unknown): void {
    useEffect(() => {
        if (!interacted) return;
        const active = document.activeElement;
        if (active && active !== document.body) return;
        focusScreenTitle();
    }, [trigger]);
}
