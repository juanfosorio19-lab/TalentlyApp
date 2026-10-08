// Rutas del feature (las compone src/app/router.tsx).
// STUB: lo reemplaza la construcción de las pantallas; conserva tabRoutes y stackRoutes.
import type { RouteObject } from 'react-router-dom';
import { PlaceholderScreen } from '../../app/system/PlaceholderScreen';

export const tabRoutes: RouteObject[] = [{ path: 'actividad', element: <PlaceholderScreen tab title="Actividad" screenId="ACT-01" /> }];

export const stackRoutes: RouteObject[] = [
    { path: 'turnos/:assignmentId', element: <PlaceholderScreen title="Mi turno" screenId="TUR-01" /> },
];
