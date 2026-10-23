// El historial de la app (spec §5.3): volver a una entrada anterior sin pintar
// las de en medio y terminar un flujo con su destino natural.
//
// - Regla 2: una pantalla apilada se cierra con navigate(-1); nunca se vuelve
//   a una ruta fija.
// - Regla 6: al terminar un flujo (publicar, registrarse, cerrar sesión) se
//   hace replace hacia su destino, sin dejar sus pasos ni las hojas que lo
//   abrieron (PUBL-01 `?sheet=publicar`) en el historial.
//
// Quien abre un flujo guarda en el estado de la entrada la que hay que
// conservar debajo (`flowOriginState()`); al terminar, `useFinishFlow()`
// vuelve a ella de un salto (un solo history.go) y abre el destino encima.
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTabRoot } from '../paths';

/** Índice de la entrada actual en el historial de React Router (0 = la primera de la app). */
export function historyIndex(): number {
    const idx = (window.history.state as { idx?: unknown } | null)?.idx;
    return typeof idx === 'number' && idx > 0 ? idx : 0;
}

/** Estado de la entrada de un flujo: la entrada de abajo que se conserva al terminarlo (-1: ninguna). */
export interface FlowOriginState {
    flowOrigin: number;
}

/**
 * Para abrir un flujo desde una hoja (PUBL-01 → asistente): lo que se conserva
 * es la pantalla de debajo de la hoja, no la hoja.
 */
export const flowOriginState = (below = 1): FlowOriginState => ({ flowOrigin: historyIndex() - below });

export function flowOriginOf(state: unknown): number | null {
    if (typeof state !== 'object' || state === null || !('flowOrigin' in state)) return null;
    const n = state.flowOrigin;
    return typeof n === 'number' && Number.isInteger(n) && n >= -1 ? n : null;
}

/**
 * Vuelve a la entrada `index` de un salto (las de en medio no se pintan) y,
 * al llegar, llama a `then`. Si ya está ahí o más atrás, `then` de inmediato.
 */
export function returnToEntry(index: number, go: (delta: number) => void, then: () => void): void {
    const steps = historyIndex() - Math.max(index, 0);
    if (steps <= 0) {
        then();
        return;
    }
    const arrived = () => {
        window.removeEventListener('popstate', arrived);
        then();
    };
    window.addEventListener('popstate', arrived);
    go(-steps);
}

/**
 * Termina un flujo (spec §5.3 regla 6). `origin` es la entrada que se
 * conserva (de `flowOriginOf`); `null` si no se sabe: entonces reemplaza la
 * entrada actual, como antes. Un destino que es raíz de pestaña reemplaza la
 * entrada a la que vuelve (regla 1, cambiar de pestaña es replace); una
 * pantalla apilada se abre encima (regla 2: su atrás vuelve a esa entrada).
 * Sin entrada que conservar (origin -1), vuelve a la primera y la reemplaza.
 */
export function useFinishFlow(): (origin: number | null, dest: string) => void {
    const navigate = useNavigate();
    return useCallback(
        (origin, dest) => {
            if (origin === null || origin >= historyIndex()) {
                void navigate(dest, { replace: true });
                return;
            }
            const replace = origin < 0 || isTabRoot(dest.split(/[?#]/)[0] ?? dest);
            returnToEntry(origin, (d) => void navigate(d), () => void navigate(dest, { replace }));
        },
        [navigate],
    );
}

/**
 * Sale de la sesión (CFG-01 «Cerrar sesión» → AUTH-01): vuelve a la primera
 * entrada, la reemplaza por `dest` y descarta las de adelante (un push y un
 * atrás), así ni atrás ni adelante vuelven a las pantallas de la sesión.
 */
export function useLeaveSession(): (dest: string) => void {
    const navigate = useNavigate();
    return useCallback(
        (dest) => {
            returnToEntry(0, (d) => void navigate(d), () => {
                void (async () => {
                    await navigate(dest, { replace: true });
                    await navigate(dest);
                    await navigate(-1);
                })();
            });
        },
        [navigate],
    );
}
