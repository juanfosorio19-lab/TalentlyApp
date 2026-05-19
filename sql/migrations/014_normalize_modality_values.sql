-- =============================================
-- Talently — Migración 014: normalizar values de modalidad
-- Aplicada en Supabase: 2026-05-18
--
-- La app no maneja i18n todavía y los chips de UI son strings en español.
-- Antes coexistían 'remote'/'hybrid'/'onsite' (lowercase inglés, legacy del
-- wizard React) con 'Remoto'/'Híbrido'/'Presencial' (capitalizado, formato
-- canónico usado en perfiles y companies). Esta migración unifica todo al
-- formato capitalizado en español.
--
-- Cierra issue B3 del audit 2026-05-18.
-- =============================================

-- companies.work_model
UPDATE public.companies SET work_model = 'Remoto'     WHERE work_model IN ('remote', 'remoto');
UPDATE public.companies SET work_model = 'Híbrido'    WHERE work_model IN ('hybrid', 'hibrido', 'híbrido');
UPDATE public.companies SET work_model = 'Presencial' WHERE work_model IN ('onsite', 'presencial');

-- offers.modality
UPDATE public.offers SET modality = 'Remoto'     WHERE modality IN ('remote', 'remoto');
UPDATE public.offers SET modality = 'Híbrido'    WHERE modality IN ('hybrid', 'hibrido', 'híbrido');
UPDATE public.offers SET modality = 'Presencial' WHERE modality IN ('onsite', 'presencial');

-- offers.work_modality
UPDATE public.offers SET work_modality = 'Remoto'     WHERE work_modality IN ('remote', 'remoto');
UPDATE public.offers SET work_modality = 'Híbrido'    WHERE work_modality IN ('hybrid', 'hibrido', 'híbrido');
UPDATE public.offers SET work_modality = 'Presencial' WHERE work_modality IN ('onsite', 'presencial');

-- profiles.modality
UPDATE public.profiles SET modality = 'Remoto'     WHERE modality IN ('remote', 'remoto');
UPDATE public.profiles SET modality = 'Híbrido'    WHERE modality IN ('hybrid', 'hibrido', 'híbrido');
UPDATE public.profiles SET modality = 'Presencial' WHERE modality IN ('onsite', 'presencial');

-- profiles.work_modality
UPDATE public.profiles SET work_modality = 'Remoto'     WHERE work_modality IN ('remote', 'remoto');
UPDATE public.profiles SET work_modality = 'Híbrido'    WHERE work_modality IN ('hybrid', 'hibrido', 'híbrido');
UPDATE public.profiles SET work_modality = 'Presencial' WHERE work_modality IN ('onsite', 'presencial');
