// Navegación de Mensajes: enlaces reales (href del HashRouter + navigate),
// el actor que mira y lo que todavía no tiene pantalla (pending.ts: tocarlo
// muestra el Snackbar honesto «Disponible pronto»). Toda ruta sale de
// src/app/paths.ts.
import { useCallback, type MouseEvent } from 'react';
import { useHref, useNavigate, type NavigateOptions } from 'react-router-dom';
import { isTabRoot } from '../../app/paths';
import { useSnackbar, type ShowSnackbarOptions } from '../../ui/Snackbar';
import { useDemoSession } from '../demo/session';
import type { DemoViewerId } from '../demo/types';
import { copy } from './copy';
import { VIEWER_OVERRIDE } from './mock';
import { isPendingRoute } from './pending';

/** Abrir en otra pestaña (Ctrl, Cmd, rueda) sigue siendo del navegador. */
const isPlainClick = (e: MouseEvent<HTMLElement>) =>
    !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

/** Quién mira la bandeja: el actor de la sesión o, en el flujo 10, Marta (mock.ts). */
export function useViewerId(): DemoViewerId {
    const { actor } = useDemoSession();
    return VIEWER_OVERRIDE ?? actor.id;
}

export interface LinkProps {
    href: string;
    onClick: (event: MouseEvent<HTMLElement>) => void;
}

export function useLinks() {
    const navigate = useNavigate();
    const snackbar = useSnackbar();
    const root = useHref('/');
    const base = root.endsWith('/') ? root.slice(0, -1) : root;

    const soon = useCallback(
        (placement?: ShowSnackbarOptions['placement']) => snackbar.show({ message: copy.soon, placement }),
        [snackbar],
    );

    /**
     * La raíz de una pestaña reemplaza (spec §5.3 regla 1); una pantalla
     * apilada se abre con push (regla 2). Lo que aún no tiene pantalla avisa.
     */
    const go = useCallback(
        (to: string, options?: NavigateOptions & { placement?: ShowSnackbarOptions['placement'] }) => {
            if (isPendingRoute(to)) {
                soon(options?.placement);
                return;
            }
            const pathname = to.split('?')[0] ?? to;
            navigate(to, { replace: isTabRoot(pathname), ...options });
        },
        [navigate, soon],
    );

    /** Props de un `a` o un ListItem con `href`: enlace real que navega sin recargar. */
    const linkProps = useCallback(
        (to: string): LinkProps => ({
            href: `${base}${to}`,
            onClick: (e) => {
                if (!isPlainClick(e)) return;
                e.preventDefault();
                go(to);
            },
        }),
        [base, go],
    );

    return { go, linkProps, soon };
}
