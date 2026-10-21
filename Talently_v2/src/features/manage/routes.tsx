// Rutas del feature (las compone src/app/router.tsx).
// STUB: lo reemplaza la construcción de las pantallas; conserva tabRoutes y stackRoutes.
import type { RouteObject } from 'react-router-dom';
import { PlaceholderScreen } from '../../app/system/PlaceholderScreen';

export const tabRoutes: RouteObject[] = [];

export const stackRoutes: RouteObject[] = [
    { path: 'publicaciones/:id', element: <PlaceholderScreen title="Gestionar publicación" screenId="GES-01" /> },
    { path: 'publicaciones/:id/postulantes', element: <PlaceholderScreen title="Postulantes" screenId="GES-02" /> },
    { path: 'publicaciones/:id/turnos/:shiftId', element: <PlaceholderScreen title="Cupos del turno" screenId="GES-04" /> },
];
