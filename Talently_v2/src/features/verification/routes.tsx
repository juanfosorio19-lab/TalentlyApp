// Rutas del feature Verificación (las compone src/app/router.tsx). Apiladas:
// /verificacion (VER-01) y /verificacion/identidad (VER-02, con `?paso=` y
// `?volver=`). VER-03 y VER-04 llegan después: hasta entonces, sus botones
// avisan «Disponible pronto» (useOpenPath).
import type { RouteObject } from 'react-router-dom';
import { useDemoSession } from '../demo/session';
import { IdentityScreen } from './screens/IdentityScreen';
import { VerificationScreen } from './screens/VerificationScreen';

/** Al cambiar de actor, cada pantalla parte de cero (las fotos de VER-02 no pasan de una persona a otra). */
function Verification() {
    const { actor } = useDemoSession();
    return <VerificationScreen key={actor.id} />;
}

function Identity() {
    const { actor } = useDemoSession();
    return <IdentityScreen key={actor.id} />;
}

export const tabRoutes: RouteObject[] = [];

export const stackRoutes: RouteObject[] = [
    { path: 'verificacion', element: <Verification /> },
    { path: 'verificacion/identidad', element: <Identity /> },
];
