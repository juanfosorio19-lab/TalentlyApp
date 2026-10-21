// La bandeja con lo ya leído: la campana del AppBar y el punto «Tiene novedades
// sin leer» de SHT-ACTOR leen la misma de Inicio y NOT-01, así marcar leídas
// baja el contador en todas partes (spec §5.1: el badge solo cuenta no leídos
// reales). Vive en home/inbox.ts hasta que suba a un lugar común
// (features/demo, pedido en «requests»); ese día solo cambian estas líneas.
export { useInbox } from '../home/inbox';
export type { NotificationsEntryState } from '../home/components/HomeAppBar';
