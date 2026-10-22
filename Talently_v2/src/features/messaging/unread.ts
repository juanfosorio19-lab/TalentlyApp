// No leídos reales de Mensajes, con lo leído en esta sesión: el badge de la
// pestaña Mensajes en la BottomTabBar (AppShell). Cuenta las conversaciones
// de quien mira la bandeja: en el flujo 10 (?demo=marta) son las de Marta,
// no las del actor de la sesión, igual que MSG-01 (viewer.ts).
import { getConversations } from '../demo/data';
import type { DemoViewerId } from '../demo/types';
import { VIEWER_OVERRIDE } from './mock';
import { useConversationStates } from './store';

export function useUnreadMessages(actorId: DemoViewerId): number {
    const states = useConversationStates();
    const viewerId = VIEWER_OVERRIDE ?? actorId;
    return getConversations(viewerId).reduce((total, c) => total + (states.get(c.id)?.read ? 0 : c.sinLeer), 0);
}
