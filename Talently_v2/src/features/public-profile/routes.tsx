// Rutas del feature Perfil público (las compone src/app/router.tsx): PRF-10
// /u/:id y PRF-11 /o/:id, apiladas fuera del AppShell (sin TabBar).
import type { RouteObject } from 'react-router-dom';
import { OrgPublicScreen } from './screens/OrgPublicScreen';
import { PersonPublicScreen } from './screens/PersonPublicScreen';

export const tabRoutes: RouteObject[] = [];

export const stackRoutes: RouteObject[] = [
    { path: 'u/:id', element: <PersonPublicScreen /> },
    { path: 'o/:id', element: <OrgPublicScreen /> },
];
