// Rutas de Procesos y reseñas (las compone src/app/router.tsx).
// Apiladas: /procesos/:engagementId (PRC-01 · Proceso de empleo) y
// /resena/:engagementId (REV-01 · Dejar reseña).
import type { RouteObject } from 'react-router-dom';
import { ProcessScreen } from './screens/ProcessScreen';
import { ReviewScreen } from './screens/ReviewScreen';

export const tabRoutes: RouteObject[] = [];

export const stackRoutes: RouteObject[] = [
    { path: 'procesos/:engagementId', element: <ProcessScreen /> },
    { path: 'resena/:engagementId', element: <ReviewScreen /> },
];
