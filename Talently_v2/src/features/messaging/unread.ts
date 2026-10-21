// No leídos reales de Mensajes, con lo leído en esta sesión: para el badge de
// la pestaña Mensajes en la BottomTabBar (AppShell hoy lo lee de la demo y no
// baja al abrir una conversación; pedido en requests).
import { getConversations } from '../demo/data';
import type { DemoViewerId } from '../demo/types';
import { useConversationStates } from './store';

export function useUnreadMessages(viewerId: DemoViewerId): number {
    const states = useConversationStates();
    return getConversations(viewerId).reduce((total, c) => total + (states.get(c.id)?.read ? 0 : c.sinLeer), 0);
}
