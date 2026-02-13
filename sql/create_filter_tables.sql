-- =============================================
-- Tablas de referencia para filtros
-- =============================================

-- Tabla: work_modalities
CREATE TABLE IF NOT EXISTS public.work_modalities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 0
);

-- Tabla: education_levels
CREATE TABLE IF NOT EXISTS public.education_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    display_order INTEGER DEFAULT 0
);

-- Tabla: experience_ranges
CREATE TABLE IF NOT EXISTS public.experience_ranges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    min_years INTEGER,
    max_years INTEGER,
    display_order INTEGER DEFAULT 0
);

-- Habilitar RLS
ALTER TABLE public.work_modalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_ranges ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
CREATE POLICY "Allow public read" ON public.work_modalities FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.education_levels FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.experience_ranges FOR SELECT USING (true);

-- Poblar work_modalities (sincronizado con onboarding)
INSERT INTO public.work_modalities (name, slug, description, display_order) VALUES
('100% Remoto', '100-remoto', 'Desde cualquier lugar', 1),
('Remote-first', 'remote-first', 'Remoto con oficinas opcionales', 2),
('Híbrido flexible', 'hibrido-flexible', 'El equipo elige sus días', 3),
('Híbrido con días fijos', 'hibrido-fijo', 'Ej: 3 días oficina, 2 casa', 4),
('100% Presencial', 'presencial', 'En la oficina', 5)
ON CONFLICT (slug) DO NOTHING;

-- Poblar education_levels
INSERT INTO public.education_levels (name, slug, display_order) VALUES
('Técnico / Tecnólogo', 'tecnico', 1),
('Universitario incompleto', 'universitario-incompleto', 2),
('Universitario completo', 'universitario-completo', 3),
('Postgrado / Diplomado', 'postgrado', 4),
('MBA', 'mba', 5),
('Doctorado / PhD', 'doctorado', 6)
ON CONFLICT (slug) DO NOTHING;

-- Poblar experience_ranges
INSERT INTO public.experience_ranges (name, slug, min_years, max_years, display_order) VALUES
('0-1 año', '0-1', 0, 1, 1),
('1-3 años', '1-3', 1, 3, 2),
('3-5 años', '3-5', 3, 5, 3),
('5-10 años', '5-10', 5, 10, 4),
('10+ años', '10-plus', 10, NULL, 5)
ON CONFLICT (slug) DO NOTHING;
