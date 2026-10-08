// Rutas del feature (las compone src/app/router.tsx).
// STUB: lo reemplaza la construcción de las pantallas; conserva tabRoutes y stackRoutes.
import type { RouteObject } from 'react-router-dom';
import { PlaceholderScreen } from '../../app/system/PlaceholderScreen';

export const tabRoutes: RouteObject[] = [];

export const stackRoutes: RouteObject[] = [
    { path: 'p/:id', element: <PlaceholderScreen title="Detalle" screenId="DET-01" /> },
];
