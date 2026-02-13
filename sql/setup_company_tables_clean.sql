-- =============================================
-- Script completo para configurar tablas de empresa
-- Ejecutar una sola vez - Sin errores si ya existe
-- =============================================

-- =============================================
-- 1. Crear tabla companies (si no existe)
-- =============================================
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    name TEXT,
    tax_id TEXT,
    website TEXT,
    linkedin_url TEXT,
    company_size TEXT,
    sector TEXT,
    country TEXT,
    city TEXT,
    fully_remote BOOLEAN DEFAULT false,
    multiple_locations BOOLEAN DEFAULT false,
    company_stage TEXT,
    work_model TEXT,
    value_proposition TEXT,
    logo_url TEXT,
    banner_url TEXT,
    selection_stages INTEGER DEFAULT 3,
    selection_duration TEXT,
    technical_test TEXT DEFAULT 'depende',
    paid_test TEXT DEFAULT 'a-veces'
);

-- Habilitar RLS si no está habilitado
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Companies can view own data" ON public.companies;
DROP POLICY IF EXISTS "Companies can update own data" ON public.companies;
DROP POLICY IF EXISTS "Companies can insert own data" ON public.companies;
DROP POLICY IF EXISTS "Public can view company profiles" ON public.companies;

-- Crear políticas
CREATE POLICY "Companies can view own data" ON public.companies
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Companies can update own data" ON public.companies
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Companies can insert own data" ON public.companies
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view company profiles" ON public.companies
FOR SELECT USING (true);

-- Índice para búsquedas
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);

-- =============================================
-- 2. Crear tablas relacionales (many-to-many)
-- =============================================

-- Tabla: company_culture_selected
CREATE TABLE IF NOT EXISTS public.company_culture_selected (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    culture_value_slug TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, culture_value_slug)
);

-- Tabla: company_positions_looking
CREATE TABLE IF NOT EXISTS public.company_positions_looking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    position_slug TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, position_slug)
);

-- Tabla: company_seniority_looking
CREATE TABLE IF NOT EXISTS public.company_seniority_looking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    seniority_slug TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, seniority_slug)
);

-- Tabla: company_benefits_offered
CREATE TABLE IF NOT EXISTS public.company_benefits_offered (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    benefit_slug TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, benefit_slug)
);

-- Tabla: company_tech_stack
CREATE TABLE IF NOT EXISTS public.company_tech_stack (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    technology TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: company_tags
CREATE TABLE IF NOT EXISTS public.company_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: company_photos
CREATE TABLE IF NOT EXISTS public.company_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.company_culture_selected ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_positions_looking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_seniority_looking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_benefits_offered ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_photos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow public read" ON public.company_culture_selected;
DROP POLICY IF EXISTS "Allow public read" ON public.company_positions_looking;
DROP POLICY IF EXISTS "Allow public read" ON public.company_seniority_looking;
DROP POLICY IF EXISTS "Allow public read" ON public.company_benefits_offered;
DROP POLICY IF EXISTS "Allow public read" ON public.company_tech_stack;
DROP POLICY IF EXISTS "Allow public read" ON public.company_tags;
DROP POLICY IF EXISTS "Allow public read" ON public.company_photos;

DROP POLICY IF EXISTS "Companies can manage their culture" ON public.company_culture_selected;
DROP POLICY IF EXISTS "Companies can manage their positions" ON public.company_positions_looking;
DROP POLICY IF EXISTS "Companies can manage their seniority" ON public.company_seniority_looking;
DROP POLICY IF EXISTS "Companies can manage their benefits" ON public.company_benefits_offered;
DROP POLICY IF EXISTS "Companies can manage their tech stack" ON public.company_tech_stack;
DROP POLICY IF EXISTS "Companies can manage their tags" ON public.company_tags;
DROP POLICY IF EXISTS "Companies can manage their photos" ON public.company_photos;

-- Políticas de lectura pública
CREATE POLICY "Allow public read" ON public.company_culture_selected FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.company_positions_looking FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.company_seniority_looking FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.company_benefits_offered FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.company_tech_stack FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.company_tags FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.company_photos FOR SELECT USING (true);

-- Políticas para que las empresas puedan insertar/actualizar/eliminar sus propios datos
CREATE POLICY "Companies can manage their culture" ON public.company_culture_selected
FOR ALL USING (auth.uid() = (SELECT user_id FROM public.companies WHERE id = company_id));

CREATE POLICY "Companies can manage their positions" ON public.company_positions_looking
FOR ALL USING (auth.uid() = (SELECT user_id FROM public.companies WHERE id = company_id));

CREATE POLICY "Companies can manage their seniority" ON public.company_seniority_looking
FOR ALL USING (auth.uid() = (SELECT user_id FROM public.companies WHERE id = company_id));

CREATE POLICY "Companies can manage their benefits" ON public.company_benefits_offered
FOR ALL USING (auth.uid() = (SELECT user_id FROM public.companies WHERE id = company_id));

CREATE POLICY "Companies can manage their tech stack" ON public.company_tech_stack
FOR ALL USING (auth.uid() = (SELECT user_id FROM public.companies WHERE id = company_id));

CREATE POLICY "Companies can manage their tags" ON public.company_tags
FOR ALL USING (auth.uid() = (SELECT user_id FROM public.companies WHERE id = company_id));

CREATE POLICY "Companies can manage their photos" ON public.company_photos
FOR ALL USING (auth.uid() = (SELECT user_id FROM public.companies WHERE id = company_id));

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_company_culture_company ON public.company_culture_selected(company_id);
CREATE INDEX IF NOT EXISTS idx_company_positions_company ON public.company_positions_looking(company_id);
CREATE INDEX IF NOT EXISTS idx_company_seniority_company ON public.company_seniority_looking(company_id);
CREATE INDEX IF NOT EXISTS idx_company_benefits_company ON public.company_benefits_offered(company_id);
CREATE INDEX IF NOT EXISTS idx_company_tech_company ON public.company_tech_stack(company_id);
CREATE INDEX IF NOT EXISTS idx_company_tags_company ON public.company_tags(company_id);
CREATE INDEX IF NOT EXISTS idx_company_photos_company ON public.company_photos(company_id);

-- Comentarios
COMMENT ON TABLE public.companies IS 'Tabla principal de perfiles de empresas';
COMMENT ON COLUMN public.companies.name IS 'Nombre de la empresa';
COMMENT ON COLUMN public.companies.tax_id IS 'RUT o Tax ID de la empresa';
