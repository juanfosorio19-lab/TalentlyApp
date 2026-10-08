// Rutas del feature (las compone src/app/router.tsx).
// STUB: lo reemplaza la construcción de las pantallas; conserva tabRoutes y stackRoutes.
import type { RouteObject } from 'react-router-dom';
import { PlaceholderScreen } from '../../app/system/PlaceholderScreen';

export const tabRoutes: RouteObject[] = [{ path: 'explorar', element: <PlaceholderScreen tab title="Explorar" screenId="EXP-01" /> }];

export const stackRoutes: RouteObject[] = [];
