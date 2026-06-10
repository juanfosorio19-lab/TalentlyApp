-- =============================================
-- Talently — Migración 019: columnas de profiles que usa el onboarding
-- Aplicada en Supabase: 2026-06-10
--
-- BUG CRÍTICO (reportado 2x en QA del APK): al terminar el onboarding la app
-- volvía al paso 1 (¿candidato o empresa?). Causa raíz: los hooks
-- useOnboardingCandidate/useOnboardingCompany upsertean columnas que NO
-- existían en profiles → el upsert fallaba con 42703 EN CADA PASO, en
-- silencio (el error no se chequeaba). Nunca se creó la fila del perfil:
-- por eso client_logs mostraba "fetch:ok profile=none" siempre, y el guard
-- OnboardingGate (sin perfil) mandaba de vuelta al wizard.
--
-- Columnas faltantes + tipos incompatibles:
--   onboarding_step / company_onboarding_step  → no existían
--   professional_areas (array de nombres)      → no existía
--   company_type, selection_process            → no existían (hook empresa)
--   experience: era text, el hook guarda array de objetos
--   languages: era text[], el hook guarda array de {name, level}
-- =============================================

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS onboarding_step integer,
    ADD COLUMN IF NOT EXISTS company_onboarding_step integer,
    ADD COLUMN IF NOT EXISTS professional_areas jsonb,
    ADD COLUMN IF NOT EXISTS company_type text,
    ADD COLUMN IF NOT EXISTS selection_process text;

-- experience: text → jsonb. El único valor existente es un JSON válido
-- guardado como string (perfil de juanf, escrito por la app v1), así que el
-- cast directo lo convierte en array real (y de paso ProfileView lo mostrará:
-- antes lo ignoraba porque Array.isArray(string) es false).
ALTER TABLE public.profiles
    ALTER COLUMN experience TYPE jsonb USING NULLIF(experience, '')::jsonb;

-- languages: text[] → jsonb (array)
ALTER TABLE public.profiles
    ALTER COLUMN languages TYPE jsonb USING to_jsonb(languages);

-- Entradas legacy que eran strings → objetos {name, level} (formato del hook)
UPDATE public.profiles
SET languages = (
    SELECT jsonb_agg(jsonb_build_object('name', el, 'level', ''))
    FROM jsonb_array_elements_text(languages) el
)
WHERE languages IS NOT NULL
  AND jsonb_typeof(languages) = 'array'
  AND jsonb_array_length(languages) > 0
  AND jsonb_typeof(languages->0) = 'string';
