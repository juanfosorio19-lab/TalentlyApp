// Rutas del feature (las compone src/app/router.tsx).
// STUB: lo reemplaza la construcción de las pantallas; conserva tabRoutes y stackRoutes.
import type { RouteObject } from 'react-router-dom';
import { PlaceholderScreen } from '../../app/system/PlaceholderScreen';

export const tabRoutes: RouteObject[] = [];

export const stackRoutes: RouteObject[] = [
    { path: 'bienvenida', element: <PlaceholderScreen title="Bienvenida" screenId="AUTH-01" /> },
    { path: 'registro', element: <PlaceholderScreen title="Crear cuenta" screenId="AUTH-02" /> },
    { path: 'registro/verificar', element: <PlaceholderScreen title="Revisa tu correo" screenId="AUTH-03" /> },
    { path: 'onboarding/intencion', element: <PlaceholderScreen title="¿Qué quieres hacer en Talently?" screenId="ONB-01" /> },
    { path: 'onboarding/datos', element: <PlaceholderScreen title="Tus datos" screenId="ONB-03" /> },
    { path: 'onboarding/trabajo/:paso', element: <PlaceholderScreen title="Trabajo" screenId="ONB-T1" /> },
    { path: 'onboarding/listo', element: <PlaceholderScreen title="Listo" screenId="ONB-99" /> },
];
