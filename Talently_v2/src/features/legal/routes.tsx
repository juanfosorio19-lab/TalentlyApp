// Rutas del feature Legal (las compone src/app/router.tsx): LEG-01 Términos y
// LEG-02 Privacidad, apiladas fuera del AppShell (sin TabBar). Se abren
// también fuera de la sesión (AUTH-02).
import type { RouteObject } from 'react-router-dom';
import { LegalScreen } from './screens/LegalScreen';

export const tabRoutes: RouteObject[] = [];

export const stackRoutes: RouteObject[] = [
    { path: 'terminos', element: <LegalScreen key="terminos" doc="terminos" /> },
    { path: 'privacidad', element: <LegalScreen key="privacidad" doc="privacidad" /> },
];
