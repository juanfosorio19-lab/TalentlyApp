// Rutas del feature (las compone src/app/router.tsx).
// STUB: lo reemplaza la construcción de las pantallas; conserva tabRoutes y stackRoutes.
import type { RouteObject } from 'react-router-dom';
import { PlaceholderScreen } from '../../app/system/PlaceholderScreen';

export const tabRoutes: RouteObject[] = [];

export const stackRoutes: RouteObject[] = [
    { path: 'publicar/:tipo/:paso', element: <PlaceholderScreen title="Publicar" screenId="PUBL-03" /> },
    { path: 'publicar/:tipo/listo', element: <PlaceholderScreen title="Publicación enviada" screenId="PUBL-07" /> },
];
