// /inicio: la pestaña Inicio del actor actual (spec §5.2). Una persona ve su
// feed «Para ti» (INI-01: Matías, Carolina, Jorge recién registrado, Rosa sin
// perfiles); una organización, su panel (INI-02). El AppBar (saludo,
// selector de actor y campana) y las hojas de la pestaña viven en la URL
// (spec §5.4): SHT-ACTOR `?sheet=actor`, PUBL-01 `?sheet=publicar&tipo=` y
// «Verificación de …» `?sheet=verificacion&pub=`. Siguen montadas al cambiar
// de actor, así «Usar Talently como» se cierra con su animación.
import { useEffect, useMemo, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { flowOriginState } from '../../../app/navigation/history';
import { paths } from '../../../app/paths';
import { useSheet } from '../../../app/sheets';
import { getHomeFeed, getPublication } from '../../demo/data';
import { useUnansweredConversations } from '../../demo/conversationState';
import { useManageSession, useOrgDashboard } from '../../demo/manageHooks';
import { avisoBlockView } from '../../demo/manageSelectors';
import { useCv } from '../../demo/profileState';
import { useDemoSession } from '../../demo/session';
import { useApplications } from '../../demo/sessionStore';
import type { DemoHomeBlock } from '../../demo/types';
import { HomeAppBar } from '../components/HomeAppBar';
import { PublishSheet } from '../components/PublishSheet';
import { VerificationSheet } from '../components/VerificationSheet';
import { publisherName } from '../mock';
import { useFocusTitleIfLost, useHomeNavigation } from '../navigation';
import { homeBlocks, selectedKind, wizardOf, type PublishKind, type Publisher } from '../selectors';
import { OrgHomeScreen } from './OrgHomeScreen';
import { PersonHomeScreen } from './PersonHomeScreen';
import '../home.css';

/** INI-01 (persona) o INI-02 (organización), según el actor. */
export const screenId = 'INI-01';

/** ¿Este Inicio tiene «Publicar»? La organización siempre; la persona, si su feed lo trae (hogar). */
function canPublish(blocks: readonly DemoHomeBlock[], isOrg: boolean): boolean {
    return isOrg || blocks.some((b) => b.tipo === 'publicar' || b.tipo === 'que-necesitas');
}

/** `/inicio?sheet=publicar&tipo=hogar`: el `href` de lo que abre PUBL-01 con una opción marcada. */
const publishPath = (kind: PublishKind) => `${paths.inicio()}?${new URLSearchParams({ sheet: 'publicar', tipo: kind })}`;

export function HomeScreen() {
    const { actor, recienRegistrado, onboarding } = useDemoSession();
    const applications = useApplications(actor.id, recienRegistrado);
    // Recién registrado: «Hola, <nombre>» y la tarjeta de la credencial según lo que dejó el onboarding.
    const feed = getHomeFeed(actor.id, { recienRegistrado, onboarding });
    // El CV subido en Perfil (demo/profileState): «Te falta 1 cosa · Subir CV» ya no aplica.
    const cvSubido = useCv(actor.id, recienRegistrado) !== undefined;
    // «Tu aviso · N postulantes nuevos» y su estado: la misma cuenta que GES-01 y GES-02.
    const { manage, applications: sessionApplications } = useManageSession();
    const blocks = homeBlocks(feed.bloques, { applications, cvSubido }).map((b) =>
        avisoBlockView(b, manage, sessionApplications),
    );
    const isOrg = actor.kind === 'organizacion';
    // INI-02: KPIs y «Requiere tu atención» al día con GES-01, GES-02 y GES-04; «Conversaciones sin
    // responder», con Mensajes (demo/conversationState: baja al responder).
    const unanswered = useUnansweredConversations(actor.id, recienRegistrado);
    const kpiOverrides = useMemo(() => ({ conversaciones: String(unanswered) }), [unanswered]);
    const panel = useOrgDashboard(actor.id, kpiOverrides);
    const { go, link } = useHomeNavigation();
    const location = useLocation();
    const [, setParams] = useSearchParams();
    // Volver de NOT-01 con otro actor (flujo 7) desmonta la fila tocada: el foco va a «Hola, …», no al body.
    useFocusTitleIfLost(location.key);

    // PUBL-01: la opción marcada vive en la URL (`tipo`), así sigue marcada al volver del asistente.
    const publish = useSheet('publicar', ['tipo']);
    const as: Publisher = isOrg ? 'organizacion' : 'hogar';
    const kind = selectedKind(as, publish.param('tipo'));
    const showPublish = (next?: PublishKind) => publish.show({ tipo: next ?? selectedKind(as, null) });
    const choose = (next: PublishKind) =>
        setParams(
            (prev) => {
                const params = new URLSearchParams(prev);
                params.set('tipo', next);
                return params;
            },
            // Mismo estado de la entrada: cerrar la hoja sigue siendo volver atrás.
            { replace: true, preventScrollReset: true, state: location.state },
        );
    // «Continuar» apila el asistente: su atrás en el paso 1 vuelve a esta hoja (como el prototipo).
    // Al publicar, PUBL-07 vuelve a la entrada de debajo de la hoja (flowOriginState), no a la hoja.
    const onContinue = () => go(paths.publicar(wizardOf(kind)), { state: flowOriginState() });

    // «Publicas como …»: la organización, o el hogar de la persona («Familia en Ñuñoa», autor de su aviso).
    const aviso = blocks.find((b) => b.tipo === 'tu-aviso');
    const publisher = publisherName(actor, aviso?.tipo === 'tu-aviso' ? aviso.publicationId : undefined);

    // «Verificación de …»: quien publica la tarjeta, según la URL (`pub`).
    const verify = useSheet('verificacion', ['pub']);
    const verifyId = verify.param('pub');
    const author = (verifyId && getPublication(verifyId)?.autor) || null;
    const showVerify = (pub: string) => verify.show({ pub });

    // Otro actor es otro Inicio: parte arriba (la pestaña conserva su scroll solo entre pestañas).
    // Si se eligió en SHT-ACTOR, se espera a que cerrarla vuelva a /inicio: esa vuelta
    // restaura el scroll de antes de abrir la hoja, y este efecto va después.
    const actorSheetOpen = useSheet('actor').open;
    const shownActor = useRef(actor.id);
    useEffect(() => {
        if (actorSheetOpen || shownActor.current === actor.id) return;
        shownActor.current = actor.id;
        window.scrollTo({ top: 0 });
    }, [actor.id, actorSheetOpen]);

    return (
        <>
            <HomeAppBar title={feed.saludo} />
            {isOrg ? (
                <OrgHomeScreen panel={panel} onPublish={() => showPublish()} />
            ) : (
                <PersonHomeScreen
                    blocks={blocks}
                    onVerify={showVerify}
                    onPublish={showPublish}
                    publishHref={(k) => link(publishPath(k)).href ?? ''}
                />
            )}
            <PublishSheet
                open={publish.open && canPublish(blocks, isOrg)}
                onClose={publish.hide}
                as={as}
                publisher={publisher}
                value={kind}
                onChange={choose}
                onContinue={onContinue}
            />
            <VerificationSheet author={author} onClose={verify.hide} />
        </>
    );
}
