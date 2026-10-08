// Rutas del feature Actividad (las compone src/app/router.tsx).
// Pestaña: /actividad?seg=agenda|postulaciones|publicaciones (ACT-01, ACT-02, ACT-03).
// Apilada: /turnos/:assignmentId (TUR-01 · Mi turno).
import type { RouteObject } from 'react-router-dom';
import { ActivityScreen } from './screens/ActivityScreen';
import { MyShiftScreen } from './screens/MyShiftScreen';

export const tabRoutes: RouteObject[] = [{ path: 'actividad', element: <ActivityScreen /> }];

export const stackRoutes: RouteObject[] = [{ path: 'turnos/:assignmentId', element: <MyShiftScreen /> }];
