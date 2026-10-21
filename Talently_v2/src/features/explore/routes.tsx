// Rutas del feature Explorar (las compone src/app/router.tsx).
// Pestaña: /explorar?tipo=empleo|turno|personas (EXP-01, EXP-02, EXP-05; la
// hoja de filtros EXP-06 vive dentro). Apilada: /buscar?q= (EXP-07).
import type { RouteObject } from 'react-router-dom';
import { ExploreScreen } from './screens/ExploreScreen';
import { SearchScreen } from './screens/SearchScreen';

export const tabRoutes: RouteObject[] = [{ path: 'explorar', element: <ExploreScreen /> }];

export const stackRoutes: RouteObject[] = [{ path: 'buscar', element: <SearchScreen /> }];
