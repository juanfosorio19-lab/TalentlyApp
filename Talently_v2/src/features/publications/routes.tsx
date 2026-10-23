// Rutas del feature «Detalle de publicación» (las compone src/app/router.tsx).
// Apilada: /p/:id (DET-01). DET-02 (Postular) y AUTH-08 (Verificar teléfono)
// son hojas en la URL del detalle (?sheet=postular, ?sheet=telefono). DET-03
// (¡Hicieron match!) no tiene ruta: lo muestra MatchHost, montado en
// RootLayout, sobre cualquier pantalla, como capa en la URL (?sheet=match).
import type { RouteObject } from 'react-router-dom';
import { PublicationDetailScreen } from './screens/PublicationDetailScreen';

export const tabRoutes: RouteObject[] = [];

export const stackRoutes: RouteObject[] = [{ path: 'p/:id', element: <PublicationDetailScreen /> }];
