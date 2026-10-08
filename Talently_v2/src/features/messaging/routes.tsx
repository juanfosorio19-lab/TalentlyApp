// Rutas del feature (las compone src/app/router.tsx).
// STUB: lo reemplaza la construcción de las pantallas; conserva tabRoutes y stackRoutes.
import type { RouteObject } from 'react-router-dom';
import { PlaceholderScreen } from '../../app/system/PlaceholderScreen';

export const tabRoutes: RouteObject[] = [{ path: 'mensajes', element: <PlaceholderScreen tab title="Mensajes" screenId="MSG-01" /> }];

export const stackRoutes: RouteObject[] = [
    { path: 'mensajes/:conversationId', element: <PlaceholderScreen title="Conversación" screenId="MSG-02" /> },
];
