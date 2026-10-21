// Rutas del feature «Detalle de publicación» (las compone src/app/router.tsx).
// Apilada: /p/:id (DET-01). DET-02 (Postular), AUTH-08 (Verificar teléfono) y
// DET-03 (¡Hicieron match!) son hojas y un modal sobre el detalle, sin ruta.
import type { RouteObject } from 'react-router-dom';
import { PublicationDetailScreen } from './screens/PublicationDetailScreen';

export const tabRoutes: RouteObject[] = [];

export const stackRoutes: RouteObject[] = [{ path: 'p/:id', element: <PublicationDetailScreen /> }];
