// Rutas del feature Perfil y configuración (las compone src/app/router.tsx).
// Pestaña: /perfil (PRF-01 persona o PRF-02 organización). Apiladas:
// /configuracion (CFG-01) y /perfil/impulsar (PRF-12, paths.impulsar).
import type { RouteObject } from 'react-router-dom';
import { useDemoSession } from '../demo/session';
import { ProfileAppBar } from './components/ProfileAppBar';
import { BoostScreen } from './screens/BoostScreen';
import { OrgProfileScreen } from './screens/OrgProfileScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';

/**
 * La pestaña Perfil según el actor. El AppBar (con SHT-ACTOR) es uno solo
 * para las dos pantallas: al cambiar entre la persona y su organización no se
 * vuelve a montar, así el foco vuelve al selector que abrió la hoja.
 */
function ProfileTab() {
    const { actor } = useDemoSession();
    return (
        <>
            <ProfileAppBar />
            {actor.kind === 'organizacion' ? <OrgProfileScreen /> : <ProfileScreen />}
        </>
    );
}

export const tabRoutes: RouteObject[] = [{ path: 'perfil', element: <ProfileTab /> }];

export const stackRoutes: RouteObject[] = [
    { path: 'configuracion', element: <SettingsScreen /> },
    { path: 'perfil/impulsar', element: <BoostScreen /> },
];
