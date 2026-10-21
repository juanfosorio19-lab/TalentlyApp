// Rutas del feature Mensajes (las compone src/app/router.tsx).
// Pestaña: /mensajes (MSG-01 · bandeja, con ?tipo=empleo|turno).
// Apilada: /mensajes/:conversationId (MSG-02 · conversación, con MSG-02b en hoja).
import type { RouteObject } from 'react-router-dom';
import { ConversationScreen } from './screens/ConversationScreen';
import { InboxScreen } from './screens/InboxScreen';

export const tabRoutes: RouteObject[] = [{ path: 'mensajes', element: <InboxScreen /> }];

export const stackRoutes: RouteObject[] = [{ path: 'mensajes/:conversationId', element: <ConversationScreen /> }];
