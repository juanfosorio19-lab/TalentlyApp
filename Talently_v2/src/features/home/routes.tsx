// Rutas del feature (las compone src/app/router.tsx).
// STUB: lo reemplaza la construcción de las pantallas; conserva tabRoutes y stackRoutes.
import type { RouteObject } from 'react-router-dom';
import { PlaceholderScreen } from '../../app/system/PlaceholderScreen';

export const tabRoutes: RouteObject[] = [{ path: 'inicio', element: <PlaceholderScreen tab title="Inicio" screenId="INI-01" /> }];

export const stackRoutes: RouteObject[] = [
    { path: 'notificaciones', element: <PlaceholderScreen title="Notificaciones" screenId="NOT-01" /> },
];
