// Rutas del feature «Inicio y notificaciones» (las compone src/app/router.tsx).
// Pestaña: /inicio (INI-01 persona · INI-02 organización, con las hojas
// SHT-ACTOR y PUBL-01). Apilada: /notificaciones (NOT-01).
import type { RouteObject } from 'react-router-dom';
import { HomeScreen } from './screens/HomeScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';

export const tabRoutes: RouteObject[] = [{ path: 'inicio', element: <HomeScreen /> }];

export const stackRoutes: RouteObject[] = [{ path: 'notificaciones', element: <NotificationsScreen /> }];
