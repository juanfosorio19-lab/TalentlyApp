// Rutas del feature «Publicar» (las compone src/app/router.tsx). Apiladas:
// /publicar/:tipo/:paso (PUBL-02 a PUBL-06, con PUBL-08 como paso 5) y
// /publicar/:tipo/listo (PUBL-07). PUBL-01 «¿Qué quieres publicar?» es la hoja
// de Inicio (?sheet=publicar) que abre estos asistentes.
import { Navigate, useParams, type RouteObject } from 'react-router-dom';
import { paths } from '../../app/paths';
import { NotFoundScreen } from '../../app/system/NotFoundScreen';
import { useDemoSession } from '../demo/session';
import { WIZARD_STEPS, canPublish, isPublishTipo } from './model/publisher';
import { HogarWizardScreen } from './screens/HogarWizardScreen';
import { EmpleoScreen, NoPublisherScreen, SoonScreen } from './screens/PublishInfoScreens';
import { PublishResultScreen } from './screens/PublishResultScreen';
import { TurnoWizardScreen } from './screens/TurnoWizardScreen';

function PublishRoute() {
    const { tipo, paso } = useParams();
    const { actor } = useDemoSession();
    if (!isPublishTipo(tipo)) return <NotFoundScreen />;
    if (tipo === 'clase' || tipo === 'servicio') return <SoonScreen tipo={tipo} />;
    if (!canPublish(actor, tipo)) return <NoPublisherScreen tipo={tipo} />;
    if (tipo === 'empleo') return <EmpleoScreen />;
    const step = Number(paso);
    if (!Number.isInteger(step) || step < 1 || step > WIZARD_STEPS) return <Navigate to={paths.publicar(tipo, 1)} replace />;
    // Otro actor es otro borrador: el asistente parte de cero.
    return tipo === 'turno' ? <TurnoWizardScreen key={actor.id} step={step} /> : <HogarWizardScreen key={actor.id} step={step} />;
}

export const tabRoutes: RouteObject[] = [];

export const stackRoutes: RouteObject[] = [
    { path: 'publicar/:tipo/:paso', element: <PublishRoute /> },
    // Segmento fijo: gana a :paso (pedido en paths.ts como `paths.publicado(tipo)`).
    { path: 'publicar/:tipo/listo', element: <PublishResultScreen /> },
];
