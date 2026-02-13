-- =============================================
-- Actualizar tabla companies con campos del onboarding
-- =============================================

-- Agregar columnas faltantes si no existen
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS name TEXT;

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS tax_id TEXT;

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS website TEXT;

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS company_size TEXT;

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS sector TEXT;

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS country TEXT;

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS city TEXT;

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS fully_remote BOOLEAN DEFAULT false;

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS multiple_locations BOOLEAN DEFAULT false;

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS company_stage TEXT;

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS work_model TEXT;

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS value_proposition TEXT;

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS logo_url TEXT;

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Proceso de selección
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS selection_stages INTEGER DEFAULT 3;

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS selection_duration TEXT;

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS technical_test TEXT DEFAULT 'depende';

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS paid_test TEXT DEFAULT 'a-veces';

-- Comentarios descriptivos
COMMENT ON COLUMN public.companies.name IS 'Nombre de la empresa';
COMMENT ON COLUMN public.companies.tax_id IS 'RUT o Tax ID de la empresa';
COMMENT ON COLUMN public.companies.website IS 'Sitio web de la empresa';
COMMENT ON COLUMN public.companies.linkedin_url IS 'Perfil de LinkedIn de la empresa';
COMMENT ON COLUMN public.companies.company_size IS 'Tamaño de la empresa (slug de company_sizes)';
COMMENT ON COLUMN public.companies.sector IS 'Sector/industria (slug de company_sectors)';
COMMENT ON COLUMN public.companies.country IS 'País sede principal';
COMMENT ON COLUMN public.companies.city IS 'Ciudad sede principal';
COMMENT ON COLUMN public.companies.fully_remote IS '¿Es 100% remota?';
COMMENT ON COLUMN public.companies.multiple_locations IS '¿Tiene múltiples oficinas?';
COMMENT ON COLUMN public.companies.company_stage IS 'Etapa de la empresa (slug de company_stages)';
COMMENT ON COLUMN public.companies.work_model IS 'Modelo de trabajo (slug de work_modalities)';
COMMENT ON COLUMN public.companies.value_proposition IS 'Propuesta de valor única (máx. 500 caracteres)';
COMMENT ON COLUMN public.companies.logo_url IS 'URL del logo en Supabase Storage';
COMMENT ON COLUMN public.companies.banner_url IS 'URL del banner/portada en Supabase Storage';
COMMENT ON COLUMN public.companies.selection_stages IS 'Número de etapas del proceso de selección';
COMMENT ON COLUMN public.companies.selection_duration IS 'Duración estimada del proceso (slug de selection_durations)';
COMMENT ON COLUMN public.companies.technical_test IS '¿Hacen prueba técnica? (si/no/depende)';
COMMENT ON COLUMN public.companies.paid_test IS '¿La prueba técnica es pagada? (si/no/a-veces)';
