// DET-03 · ¡Hicieron match! sobre cualquier pantalla. El detalle programa el
// match al postular (scheduleMatch de demo/sessionStore) y este host, montado
// una sola vez en RootLayout, lo muestra cuando vence aunque la persona ya
// haya vuelto al deck, a Inicio o a otra pestaña. «Enviar mensaje» abre la
// conversación (MSG-02); «Seguir explorando», Escape, el velo y el atrás solo
// cierran el modal: la persona sigue donde estaba.
import { useEffect, useMemo, useState } from 'react';
import { MatchModal } from '../../ui/MatchModal';
import { useOpenPath } from '../../app/navigation/useOpenPath';
import { paths } from '../../app/paths';
import { useDemoSession } from '../demo/session';
import { markMatchSeen, useSessionState } from '../demo/sessionStore';
import { matchView, nextMatch, type MatchView } from './match';

export const screenId = 'DET-03';

export function MatchHost() {
    const { actor } = useDemoSession();
    const { pendingMatches } = useSessionState();
    const { open: openPath } = useOpenPath();
    // Lo que muestra el modal se queda mientras sale (su animación de cierre).
    const [view, setView] = useState<MatchView | null>(null);
    const [open, setOpen] = useState(false);

    const next = useMemo(() => nextMatch(pendingMatches, actor.id), [pendingMatches, actor.id]);

    // Un match a la vez: el siguiente espera a que se cierre el que está a la vista.
    useEffect(() => {
        if (!next || open) return;
        const timer = window.setTimeout(
            () => {
                markMatchSeen(next.actorId, next.publicationId);
                const shown = matchView(next, actor);
                if (!shown) return;
                setView(shown);
                setOpen(true);
            },
            Math.max(0, next.dueAt - Date.now()),
        );
        return () => window.clearTimeout(timer);
    }, [next, open, actor]);

    if (!view) return null;
    return (
        <MatchModal
            open={open}
            onClose={() => setOpen(false)}
            onMessage={() => {
                setOpen(false);
                openPath(paths.conversacion(view.conversationId));
            }}
            person={{ name: view.person }}
            org={view.org}
            publication={view.publication}
        />
    );
}
