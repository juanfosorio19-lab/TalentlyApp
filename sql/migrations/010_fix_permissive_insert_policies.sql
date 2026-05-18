-- =============================================
-- Talently — Migración 010: eliminar policies permisivas
-- Aplicada en Supabase: 2026-05-18
-- =============================================

-- 1. support_tickets: tickets_insert_any (WITH CHECK true) permite a cualquier
--    cliente (incluso anon) insertar tickets con CUALQUIER user_id (spoofing).
--    Se mantienen las otras dos policies que validan auth.uid().
DROP POLICY IF EXISTS "tickets_insert_any" ON public.support_tickets;

-- 2. notifications: "Service role can insert notifications" tenía WITH CHECK true,
--    permitiendo que cualquier authenticated insertara notificaciones a otros
--    usuarios. El service_role bypasea RLS de todos modos, así que esta policy
--    era una puerta abierta innecesaria.
--    Se mantiene "notifications_insert_authenticated" (auth.uid() IS NOT NULL).
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
