-- =============================================
-- Talently — Migración 016: columnas de perfil de empresa faltantes
-- Aplicada en Supabase: 2026-05-19
--
-- El código (useOnboardingCompany, CompanySettingsView editor, PROFILE_PUBLIC_COLS
-- y CompanyPublicProfileView) referencia estas columnas, pero NO existían en la
-- tabla profiles. Resultado: el onboarding de empresa fallaba al guardarlas y un
-- select() explícito que las pidiera rompía getPublicById/getDiscovery.
--
-- Detectado por qa-auditor (schema integrity) antes de regenerar el APK.
-- =============================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_uniqueness TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url        TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_photos      JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_positions   JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seniority_levels    JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_tags        JSONB DEFAULT '[]'::jsonb;
