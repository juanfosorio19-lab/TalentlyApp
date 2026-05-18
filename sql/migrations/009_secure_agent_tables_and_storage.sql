-- =============================================
-- Talently — Migración 009: endurecer RLS y storage policies
-- Aplicada en Supabase: 2026-05-18
-- =============================================

-- 1. Tablas del agente sin RLS → habilitar sin policies
--    (bloquea anon/authenticated; service_role siempre bypasea RLS)
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_user_context ENABLE ROW LEVEL SECURITY;

-- 2. Storage bucket 'documents' (CV) — reemplazar policies permisivas.
--    Pattern: archivos en /{user_id}/... — solo el owner puede mutar.
DROP POLICY IF EXISTS "Subida Permitida" ON storage.objects;
DROP POLICY IF EXISTS "Actualizacion Permitida" ON storage.objects;
DROP POLICY IF EXISTS "Borrado Permitido" ON storage.objects;

CREATE POLICY "documents_insert_own" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = (auth.uid())::text
    );

CREATE POLICY "documents_update_own" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = (auth.uid())::text
    );

CREATE POLICY "documents_delete_own" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = (auth.uid())::text
    );

-- 3. Storage bucket 'videos' — endurecer INSERT path-based
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;

CREATE POLICY "videos_insert_own" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'videos'
        AND (storage.foldername(name))[1] = (auth.uid())::text
    );
