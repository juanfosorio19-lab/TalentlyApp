// Ayudas de Explorar sobre la base compartida: la URL como estado de la
// pestaña, navegar con useOpenPath y lo decidido en el deck (demo/sessionStore).
import { useCallback, useEffect, useRef, type MouseEvent } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useOpenPath } from '../../../app/navigation/useOpenPath';
import { getExplore } from '../../demo/data';
import { useDemoSession, type DemoActorId } from '../../demo/session';
import { useDecided } from '../../demo/sessionStore';
import { withParams } from '../filters';
import { homeComunaOf, replacesFrom, type CardHandlers, type Decided, type HomeComuna } from '../model';

/**
 * Los parámetros de /explorar y cómo cambiarlos: con replace (no apila
 * historial) y sin mover el scroll. Así los filtros, los chips y la vista
 * sobreviven a ir al detalle y volver, y la memoria de pestañas los guarda.
 */
export function useExploreParams(): [URLSearchParams, (edit: (next: URLSearchParams) => void) => void] {
    const [params, setParams] = useSearchParams();
    const update = useCallback(
        (edit: (next: URLSearchParams) => void) =>
            setParams((prev) => withParams(prev, edit), { replace: true, preventScrollReset: true }),
        [setParams],
    );
    return [params, update];
}

/**
 * Navegar desde Explorar: una pantalla apilada con push (spec §5.3 regla 2);
 * la raíz de otra pestaña con replace (regla 1). Si la pantalla todavía no
 * existe, useOpenPath muestra «Disponible pronto». `replace` explícito para
 * los atrás que navegan (Buscar sin historial vuelve a Explorar).
 */
export function useGo() {
    const { open, linkProps } = useOpenPath();
    const { pathname } = useLocation();
    const go = useCallback(
        (path: string, options?: { replace?: boolean }) => open(path, { replace: options?.replace ?? replacesFrom(pathname, path) }),
        [open, pathname],
    );
    /** href y onClick de una tarjeta (el enlace del título que se estira sobre toda la tarjeta). */
    const cardLink = useCallback(
        (path: string): Pick<CardHandlers, 'href' | 'onOpen'> => {
            const link = linkProps(path, { replace: replacesFrom(pathname, path) });
            return {
                // Sin pantalla todavía: sin destino real; el toque muestra «Disponible pronto».
                href: link.href ?? '#',
                onOpen: (e: MouseEvent<HTMLAnchorElement>) => link.onClick(e),
            };
        },
        [linkProps, pathname],
    );
    return { go, cardLink };
}

/**
 * Lo ya decidido por el actor (demo/sessionStore.useDecided): postuló, «Me
 * interesa» o «No me interesa» en el deck o en el detalle. Jorge recién
 * registrado (INI-01-jorge-nuevo) solo cuenta lo que hizo en esta sesión, y
 * una postulación retirada en PRC-01 ya no cuenta.
 */
export function useDecisions(actorId: DemoActorId, recienRegistrado: boolean): (publicationId: string) => Decided {
    return useDecided(actorId, recienRegistrado);
}

/**
 * La comuna desde la que mira el actor (model.homeComunaOf): la de ONB-03 si
 * se acaba de registrar (la misma de Perfil y de ONB-T2), si no la de la demo.
 * Con otra comuna que la de la demo, las tarjetas no muestran «a N km».
 */
export function useHomeComuna(): HomeComuna {
    const { actor, onboarding } = useDemoSession();
    return homeComunaOf(getExplore(actor.id), onboarding?.comuna);
}

/** Ejecuta algo un rato después (la latencia de la demo); se cancela si la pantalla se desmonta. */
export function useLater(): (fn: () => void, ms: number) => void {
    const timers = useRef(new Set<number>());
    useEffect(() => {
        const pending = timers.current;
        return () => {
            pending.forEach((id) => window.clearTimeout(id));
            pending.clear();
        };
    }, []);
    return useCallback((fn: () => void, ms: number) => {
        const id = window.setTimeout(() => {
            timers.current.delete(id);
            fn();
        }, ms);
        timers.current.add(id);
    }, []);
}
