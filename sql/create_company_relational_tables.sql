-- =============================================
-- Tablas relacionales para empresas (many-to-many)
-- =============================================

-- Tabla: company_culture_selected
-- Relaciona empresas con los valores culturales que seleccionaron
CREATE TABLE IF NOT EXISTS public.company_culture_selected (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    culture_value_slug TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, culture_value_slug)
);

-- Tabla: company_positions_looking
-- Posiciones que la empresa está buscando
CREATE TABLE IF NOT EXISTS public.company_positions_looking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    position_slug TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, position_slug)
);

-- Tabla: company_seniority_looking
-- Niveles de seniority que la empresa busca
CREATE TABLE IF NOT EXISTS public.company_seniority_looking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    seniority_slug TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, seniority_slug)
);

-- Tabla: company_benefits_offered
-- Beneficios que ofrece la empresa
CREATE TABLE IF NOT EXISTS public.company_benefits_offered (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    benefit_slug TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, benefit_slug)
);

-- Tabla: company_tech_stack
-- Tech stack de la empresa
CREATE TABLE IF NOT EXISTS public.company_tech_stack (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    technology TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: company_tags
-- Tags de la empresa
CREATE TABLE IF NOT EXISTS public.company_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: company_photos
-- Fotos del equipo/oficina de la empresa
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
