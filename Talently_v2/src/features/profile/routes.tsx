// Rutas del feature (las compone src/app/router.tsx).
// STUB: lo reemplaza la construcción de las pantallas; conserva tabRoutes y stackRoutes.
import type { RouteObject } from 'react-router-dom';
import { PlaceholderScreen } from '../../app/system/PlaceholderScreen';

export const tabRoutes: RouteObject[] = [{ path: 'perfil', element: <PlaceholderScreen tab title="Perfil" screenId="PRF-01" /> }];

export const stackRoutes: RouteObject[] = [
    { path: 'configuracion', element: <PlaceholderScreen title="Configuración" screenId="CFG-01" /> },
    { path: 'perfil/impulsar', element: <PlaceholderScreen title="Impulsa tu perfil" screenId="PRF-12" /> },
];
