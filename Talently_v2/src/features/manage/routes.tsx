// Rutas del feature Gestionar publicaciones (las compone src/app/router.tsx).
// Apiladas (sin TabBar): GES-01 /publicaciones/:id, GES-02 /publicaciones/:id/postulantes
// y GES-04 /publicaciones/:id/turnos/:shiftId (spec §5.4).
import type { RouteObject } from 'react-router-dom';
import { ApplicantsScreen } from './screens/ApplicantsScreen';
import { ManagePublicationScreen } from './screens/ManagePublicationScreen';
import { ShiftRosterScreen } from './screens/ShiftRosterScreen';

export const tabRoutes: RouteObject[] = [];

export const stackRoutes: RouteObject[] = [
    { path: 'publicaciones/:id', element: <ManagePublicationScreen /> },
    { path: 'publicaciones/:id/postulantes', element: <ApplicantsScreen /> },
    { path: 'publicaciones/:id/turnos/:shiftId', element: <ShiftRosterScreen /> },
];
