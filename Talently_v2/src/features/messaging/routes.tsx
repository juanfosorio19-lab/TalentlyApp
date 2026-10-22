// Rutas del feature Mensajes (las compone src/app/router.tsx).
// Pestaña: /mensajes (MSG-01 · bandeja, con ?tipo=empleo|turno para una
// persona o ?pub=<publicación> para una organización).
// Apilada: /mensajes/:conversationId (MSG-02 · conversación). Sus capas van
// en la URL: ?sheet=adjuntar, ?sheet=certificado (MSG-02b), ?sheet=opciones
// (menú ⋯), ?sheet=reportar (SHT-REPORTE) y ?sheet=bloquear (Dialog).
import type { RouteObject } from 'react-router-dom';
import { ConversationScreen } from './screens/ConversationScreen';
import { InboxScreen } from './screens/InboxScreen';

export const tabRoutes: RouteObject[] = [{ path: 'mensajes', element: <InboxScreen /> }];

export const stackRoutes: RouteObject[] = [{ path: 'mensajes/:conversationId', element: <ConversationScreen /> }];
