-- =============================================
-- Talently — Migración 017: manifest de actualizaciones OTA
-- Aplicada en Supabase: 2026-06-08
--
-- La app (con @capgo/capacitor-updater) lee la fila más reciente para saber si
-- hay un bundle web nuevo y auto-actualizarse. El .zip vive en GitHub Releases;
-- esta tabla solo guarda el puntero. INSERT solo service_role (anti-inyección).
-- =============================================

CREATE TABLE IF NOT EXISTS public.app_bundles (
    id          BIGSERIAL PRIMARY KEY,
    version     TEXT NOT NULL UNIQUE,
    url         TEXT NOT NULL,
    notes       TEXT,
    mandatory   BOOLEAN NOT NULL DEFAULT false,
    min_native  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_bundles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_bundles_read" ON public.app_bundles;
CREATE POLICY "app_bundles_read" ON public.app_bundles
    FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS app_bundles_created_idx ON public.app_bundles (created_at DESC);
