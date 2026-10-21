// Rutas del feature (las compone src/app/router.tsx).
// STUB: lo reemplaza la construcción de las pantallas; conserva tabRoutes y stackRoutes.
import type { RouteObject } from 'react-router-dom';
import { PlaceholderScreen } from '../../app/system/PlaceholderScreen';

export const tabRoutes: RouteObject[] = [];

export const stackRoutes: RouteObject[] = [
    { path: 'procesos/:engagementId', element: <PlaceholderScreen title="Tu postulación" screenId="PRC-01" /> },
    { path: 'resena/:engagementId', element: <PlaceholderScreen title="Dejar reseña" screenId="REV-01" /> },
];
