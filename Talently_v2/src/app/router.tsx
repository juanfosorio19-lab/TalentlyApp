// Rutas del rediseño (spec §5.4, en español). Las raíces de pestaña van dentro
// del AppShell (con TabBar); las pantallas apiladas, fuera. Mientras v3 se
// previsualiza en v3.html se usa HashRouter (v3.html#/inicio): no necesita
// reescrituras del servidor y no choca con las rutas de la app actual.
import { Navigate, createHashRouter, type RouteObject } from 'react-router-dom';
import * as activity from '../features/activity/routes';
import * as explore from '../features/explore/routes';
import * as home from '../features/home/routes';
import * as messaging from '../features/messaging/routes';
import * as profile from '../features/profile/routes';
import * as publications from '../features/publications/routes';
import { AppShell } from './AppShell';
import { RootLayout } from './RootLayout';
import { UiCatalog } from './dev/UiCatalog';
import { NotFoundScreen } from './system/NotFoundScreen';

const features = [home, explore, activity, messaging, profile, publications];

export const routes: RouteObject[] = [
    {
        element: <RootLayout />,
        children: [
            { index: true, element: <Navigate to="/inicio" replace /> },
            { element: <AppShell />, children: features.flatMap((f) => f.tabRoutes) },
            ...features.flatMap((f) => f.stackRoutes),
            { path: 'dev/ui', element: <UiCatalog /> },
            { path: '*', element: <NotFoundScreen /> },
        ],
    },
];

export function createAppRouter() {
    return createHashRouter(routes);
}
