// /inicio: la pestaña Inicio del actor actual (spec §5.2). Una persona ve su
// feed «Para ti» (INI-01: Matías, Carolina, Jorge recién registrado con
// `nuevo=1`, Rosa sin perfiles); una organización, su panel (INI-02). El
// AppBar (saludo, selector de actor y campana) y las hojas PUBL-01 y
// «Verificación de …» son de la pestaña: siguen montados al cambiar de actor,
// así la hoja «Usar Talently como» se cierra con su animación.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDemoSession } from '../../demo/session';
import type { DemoAuthor, DemoHomeFeed } from '../../demo/types';
import { HomeAppBar } from '../components/HomeAppBar';
import { PublishSheet, type PublishKind } from '../components/PublishSheet';
import { VerificationSheet } from '../components/VerificationSheet';
import { useRecienRegistrado } from '../inbox';
import { getFeed, publisherName } from '../mock';
import { useHomeSheet } from '../sheet';
import { OrgHomeScreen } from './OrgHomeScreen';
import { PersonHomeScreen } from './PersonHomeScreen';
import '../home.css';

/** INI-01 (persona) o INI-02 (organización), según el actor. */
export const screenId = 'INI-01';

const PUBLISH_KINDS: readonly PublishKind[] = ['empleo', 'turno', 'hogar', 'evento'];

/** ¿Este Inicio tiene «Publicar»? La organización siempre; la persona, si su feed lo trae (hogar). */
function canPublish(feed: DemoHomeFeed, isOrg: boolean): boolean {
    return isOrg || feed.bloques.some((b) => b.tipo === 'publicar' || b.tipo === 'que-necesitas');
}

/**
 * PUBL-01 vive en la URL como hoja (`?sheet=publicar&tipo=hogar`, spec §5.4):
 * abrirla hace push (atrás la cierra) y un enlace abierto en otra pestaña la
 * muestra abierta. PublishSheet descarta un `tipo` que no es del actor.
 */
function usePublishSheet(enabled: boolean) {
    const { open, show, close, params } = useHomeSheet('publicar');
    const tipo = params.get('tipo');
    const initial = PUBLISH_KINDS.find((k) => k === tipo);
    const showKind = useCallback((kind?: PublishKind) => show({ tipo: kind }), [show]);
    return { open: open && enabled, initial, show: showKind, close };
}

export function HomeScreen() {
    const { actor } = useDemoSession();
    const recienRegistrado = useRecienRegistrado();
    const feed = getFeed(actor.id, recienRegistrado);
    const isOrg = actor.kind === 'organizacion';
    const publish = usePublishSheet(canPublish(feed, isOrg));
    const actorSheetInUrl = useHomeSheet('actor').open;
    const [verifyAuthor, setVerifyAuthor] = useState<DemoAuthor | null>(null);

    // Otro actor es otro Inicio: parte arriba (la pestaña conserva su scroll solo entre pestañas).
    // Si se eligió en SHT-ACTOR, se espera a que cerrarla vuelva a /inicio: esa vuelta
    // restaura el scroll de antes de abrir la hoja, y este efecto va después.
    const shownActor = useRef(actor.id);
    useEffect(() => {
        if (actorSheetInUrl || shownActor.current === actor.id) return;
        shownActor.current = actor.id;
        window.scrollTo({ top: 0 });
    }, [actor.id, actorSheetInUrl]);

    // «Publicas como …»: la organización, o el hogar de la persona («Familia en Ñuñoa», autor de su aviso).
    const aviso = feed.bloques.find((b) => b.tipo === 'tu-aviso');
    const publisher = publisherName(actor, aviso?.tipo === 'tu-aviso' ? aviso.publicationId : undefined);

    return (
        <>
            <HomeAppBar title={feed.saludo} />
            {isOrg ? (
                <OrgHomeScreen feed={feed} onPublish={() => publish.show()} />
            ) : (
                <PersonHomeScreen feed={feed} onVerify={setVerifyAuthor} onPublish={publish.show} />
            )}
            <PublishSheet
                open={publish.open}
                onClose={publish.close}
                as={isOrg ? 'organizacion' : 'hogar'}
                publisher={publisher}
                initial={publish.initial}
            />
            <VerificationSheet author={verifyAuthor} onClose={() => setVerifyAuthor(null)} />
        </>
    );
}
