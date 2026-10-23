// DET-03 · ¡Hicieron match! sobre cualquier pantalla. El detalle programa el
// match al postular (scheduleMatch de demo/sessionStore) y este host, montado
// una sola vez en RootLayout, lo muestra cuando vence aunque la persona ya
// haya vuelto al deck, a Inicio o a otra pestaña. Como toda capa (spec §5.3
// regla 3), vive en la URL: al aparecer empuja `?sheet=match` sobre la
// pantalla de abajo (con su mismo estado), y se ve solo mientras la URL lo
// tenga: el atrás del navegador lo cierra y deja a la persona donde estaba.
// - «Enviar mensaje» abre la conversación (MSG-02) en lugar de la entrada del
//   match; si ya está en esa conversación, solo cierra.
// - «Seguir explorando», Escape, el velo y el atrás de Android cierran.
// - Si el match es de la publicación que la persona está mirando (DET-01),
//   como en el prototipo (DET-03-pedro: rCerrar = EXP-01; MSG-02-pedro:
//   rVolver = EXP-01), el detalle también sale: cerrar vuelve a la pantalla
//   de debajo (Explorar) y la conversación se abre sobre ella.
// Jorge recién registrado no tiene conversaciones: su match se da por visto
// sin abrir el modal.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MatchModal } from '../../ui/MatchModal';
import { historyIndex, returnToEntry } from '../../app/navigation/history';
import { useOpenPath } from '../../app/navigation/useOpenPath';
import { paths } from '../../app/paths';
import { isSheetEntry, useSheet, withoutSheet } from '../../app/sheets';
import { useDemoSession } from '../demo/session';
import { markMatchSeen, useSessionState } from '../demo/sessionStore';
import { matchView, nextMatch, type MatchView } from './match';

export const screenId = 'DET-03';

/** `?sheet=match`: la capa del match en la URL. */
const MATCH_SHEET = 'match';

/**
 * El modal devuelve el foco a lo que lo tenía antes de abrir. Si el match
 * llegó después de que la persona tocara «Volver», o cerrar llevó a otra
 * pantalla, eso ya no existe y el foco cae al body: va al título de la
 * pantalla que quedó.
 */
function focusScreenTitleIfLost(): void {
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== document.body && active.isConnected && !active.closest('[inert]')) return;
    const title = document.querySelector<HTMLElement>('main h1') ?? document.querySelector<HTMLElement>('h1');
    if (!title) return;
    if (!title.hasAttribute('tabindex')) title.tabIndex = -1;
    title.focus({ preventScroll: true });
}

export function MatchHost() {
    const { actor, recienRegistrado } = useDemoSession();
    const { pendingMatches } = useSessionState();
    const { open: openPath } = useOpenPath();
    const navigate = useNavigate();
    const location = useLocation();
    const sheet = useSheet(MATCH_SHEET);
    // Lo que muestra el modal se queda mientras sale (su animación de cierre).
    const [view, setView] = useState<MatchView | null>(null);
    const open = view !== null && sheet.open;

    const next = useMemo(() => nextMatch(pendingMatches, actor.id), [pendingMatches, actor.id]);

    // Un match a la vez: el siguiente espera a que se cierre el que está a la vista. El temporizador se
    // vuelve a armar si la persona navega (con lo que falta): la entrada del match va sobre la pantalla de ahora.
    useEffect(() => {
        if (!next || open) return;
        const timer = window.setTimeout(
            () => {
                markMatchSeen(next.actorId, next.publicationId);
                const shown = matchView(next, actor, recienRegistrado);
                if (!shown) return;
                setView(shown);
                // La entrada del match lleva el estado de la pantalla de abajo (su origen, de dónde vino NOT-01…).
                const below = typeof location.state === 'object' && location.state !== null ? location.state : {};
                const search = new URLSearchParams(withoutSheet(location.search, location.state));
                search.set('sheet', MATCH_SHEET);
                void navigate(
                    { pathname: location.pathname, search: `?${search}` },
                    { state: { ...below, sheet: MATCH_SHEET, sheetParams: [] }, preventScrollReset: true },
                );
            },
            Math.max(0, next.dueAt - Date.now()),
        );
        return () => window.clearTimeout(timer);
    }, [next, open, actor, recienRegistrado, location, navigate]);

    // `?sheet=match` sin un match que mostrar (se recargó la página): sale de la URL, una vez por entrada.
    const stripped = useRef<string | null>(null);
    const hide = sheet.hide;
    useEffect(() => {
        if (!sheet.open || view || stripped.current === location.key) return;
        stripped.current = location.key;
        hide();
    }, [sheet.open, view, location.key, hide]);

    // Al cerrarse (con un botón o con el atrás del navegador), después de que el modal devuelve el foco.
    const wasOpen = useRef(open);
    useEffect(() => {
        const closed = wasOpen.current && !open;
        wasOpen.current = open;
        if (!closed) return;
        const frame = window.requestAnimationFrame(focusScreenTitleIfLost);
        return () => window.cancelAnimationFrame(frame);
    }, [open]);

    if (!view) return null;

    /** ¿La persona está en el detalle de la publicación del match? Entonces cerrar también sale de él. */
    const onPublication = location.pathname === paths.publicacion(view.publicationId);
    /** La entrada de debajo del detalle (la de Explorar en el flujo 3); < 0 si se llegó al detalle por un enlace. */
    const belowDetail = () => historyIndex() - (isSheetEntry(location.state, MATCH_SHEET) ? 2 : 1);
    const go = (delta: number) => void navigate(delta);

    const close = () => {
        if (!onPublication) {
            sheet.hide();
            return;
        }
        const below = belowDetail();
        if (below >= 0) returnToEntry(below, go, () => undefined);
        // Sin nada debajo del detalle: Explorar en su lugar.
        else returnToEntry(0, go, () => void navigate(paths.explorar('empleo'), { replace: true }));
    };

    const message = () => {
        const conversation = paths.conversacion(view.conversationId);
        // Ya está en esa conversación (llegó a ella antes que el match): solo se cierra el modal.
        if (location.pathname === conversation) {
            sheet.hide();
            return;
        }
        if (onPublication) {
            // La conversación va sobre la pantalla de debajo del detalle: su «Volver» lleva a Explorar.
            const below = belowDetail();
            if (below >= 0) returnToEntry(below, go, () => openPath(conversation));
            else returnToEntry(0, go, () => openPath(conversation, { replace: true }));
            return;
        }
        // En lugar de la entrada del match: volver desde la conversación lleva a la pantalla de abajo.
        openPath(conversation, { replace: isSheetEntry(location.state, MATCH_SHEET) });
    };

    return (
        <MatchModal
            open={open}
            onClose={close}
            onMessage={message}
            person={{ name: view.person }}
            org={view.org}
            publication={view.publication}
        />
    );
}
