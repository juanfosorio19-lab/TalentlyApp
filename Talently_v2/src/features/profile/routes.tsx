// Rutas del feature Perfil y configuración (las compone src/app/router.tsx).
// Pestaña: /perfil (PRF-01 persona o PRF-02 organización). Apiladas:
// /configuracion (CFG-01) y /perfil/impulsar (PRF-12).
import type { RouteObject } from 'react-router-dom';
import { useDemoSession } from '../demo/session';
import { BoostScreen } from './screens/BoostScreen';
import { OrgProfileScreen } from './screens/OrgProfileScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';

/** La pestaña Perfil según el actor: al cambiar de actor, parte de cero (key). */
function ProfileTab() {
    const { actor } = useDemoSession();
    return actor.kind === 'organizacion' ? <OrgProfileScreen key={actor.id} /> : <ProfileScreen key={actor.id} />;
}

export const tabRoutes: RouteObject[] = [{ path: 'perfil', element: <ProfileTab /> }];

export const stackRoutes: RouteObject[] = [
    { path: 'configuracion', element: <SettingsScreen /> },
    { path: 'perfil/impulsar', element: <BoostScreen /> },
];
