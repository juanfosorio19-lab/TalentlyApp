-- =============================================
-- Tablas de referencia para empresas (CLEAN VERSION)
-- Ejecutar una sola vez - Sin errores si ya existe
-- =============================================

-- Tabla: company_sizes
CREATE TABLE IF NOT EXISTS public.company_sizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0
);

-- Tabla: company_sectors
CREATE TABLE IF NOT EXISTS public.company_sectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- Tabla: company_stages
CREATE TABLE IF NOT EXISTS public.company_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0
);

-- Tabla: company_culture_values
CREATE TABLE IF NOT EXISTS public.company_culture_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- Tabla: company_positions
CREATE TABLE IF NOT EXISTS public.company_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- Tabla: seniority_levels
CREATE TABLE IF NOT EXISTS public.seniority_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0
);

-- Tabla: company_benefits
CREATE TABLE IF NOT EXISTS public.company_benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- Tabla: selection_durations
CREATE TABLE IF NOT EXISTS public.selection_durations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- Habilitar RLS
ALTER TABLE public.company_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_culture_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seniority_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selection_durations ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow public read" ON public.company_sizes;
DROP POLICY IF EXISTS "Allow public read" ON public.company_sectors;
DROP POLICY IF EXISTS "Allow public read" ON public.company_stages;
DROP POLICY IF EXISTS "Allow public read" ON public.company_culture_values;
DROP POLICY IF EXISTS "Allow public read" ON public.company_positions;
DROP POLICY IF EXISTS "Allow public read" ON public.seniority_levels;
DROP POLICY IF EXISTS "Allow public read" ON public.company_benefits;
DROP POLICY IF EXISTS "Allow public read" ON public.selection_durations;

-- Políticas de lectura pública
CREATE POLICY "Allow public read" ON public.company_sizes FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.company_sectors FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.company_stages FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.company_culture_values FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.company_positions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.seniority_levels FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.company_benefits FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON public.selection_durations FOR SELECT USING (true);

-- =============================================
-- POBLAR: company_sizes
-- =============================================
INSERT INTO public.company_sizes (slug, name, description, display_order) VALUES
('startup', 'Startup', '1-10 empleados', 1),
('pequena', 'Pequeña empresa', '11-50 empleados', 2),
('mediana', 'Mediana empresa', '51-200 empleados', 3),
('grande', 'Gran empresa', '201-1000 empleados', 4),
('corporacion', 'Corporación', '1000+ empleados', 5)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- POBLAR: company_sectors
-- =============================================
INSERT INTO public.company_sectors (slug, name, display_order) VALUES
('tecnologia', 'Tecnología/Software', 1),
('fintech', 'FinTech/Banca', 2),
('ecommerce', 'E-commerce/Retail', 3),
('salud', 'Salud/Healthcare', 4),
('educacion', 'Educación/EdTech', 5),
('marketing', 'Marketing/Publicidad', 6),
('consultoria', 'Consultoría', 7),
('manufactura', 'Manufactura/Producción', 8),
('logistica', 'Logística/Supply Chain', 9),
('energia', 'Energía/Sustentabilidad', 10),
('media', 'Media/Entretenimiento', 11),
('telecomunicaciones', 'Telecomunicaciones', 12),
('biotecnologia', 'Biotecnología', 13),
('agroindustria', 'Agroindustria', 14),
('turismo', 'Turismo/Hospitalidad', 15),
('otro', 'Otro', 16)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- POBLAR: company_stages
-- =============================================
INSERT INTO public.company_stages (slug, name, description, display_order) VALUES
('pre-seed', 'Pre-seed', 'Idea stage', 1),
('seed', 'Seed', 'Recién fundada (0-2 años)', 2),
('early', 'Early stage', 'En crecimiento (2-5 años)', 3),
('growth', 'Growth stage', 'Escalando (5-10 años)', 4),
('mature', 'Mature', 'Establecida (10+ años)', 5)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- POBLAR: company_culture_values (16 valores)
-- =============================================
INSERT INTO public.company_culture_values (slug, name, display_order) VALUES
('innovacion', 'Innovación constante', 1),
('equipo', 'Trabajo en equipo', 2),
('autonomia', 'Autonomía y confianza', 3),
('diversidad', 'Diversidad e inclusión', 4),
('balance', 'Balance vida-trabajo', 5),
('crecimiento', 'Crecimiento rápido', 6),
('resultados', 'Orientación a resultados', 7),
('aprendizaje', 'Aprendizaje continuo', 8),
('informal', 'Ambiente informal', 9),
('formal', 'Ambiente profesional', 10),
('agil', 'Decisiones ágiles', 11),
('data-driven', 'Data-driven', 12),
('impacto', 'Impacto social', 13),
('sustentabilidad', 'Sustentabilidad', 14),
('customer', 'Customer-centric', 15),
('transparencia', 'Transparencia', 16)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- POBLAR: company_positions (15 posiciones)
-- =============================================
INSERT INTO public.company_positions (slug, name, display_order) VALUES
('desarrollo', 'Desarrollo', 1),
('diseno', 'Diseño UX/UI', 2),
('producto', 'Product Management', 3),
('marketing', 'Marketing', 4),
('ventas', 'Ventas', 5),
('data', 'Data/Analytics', 6),
('rrhh', 'RRHH', 7),
('finanzas', 'Finanzas', 8),
('operaciones', 'Operaciones', 9),
('legal', 'Legal', 10),
('soporte', 'Customer Success', 11),
('devops', 'DevOps', 12),
('qa', 'QA/Testing', 13),
('security', 'Security', 14),
('contenido', 'Content/Comunicaciones', 15)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- POBLAR: seniority_levels (5 niveles)
-- =============================================
INSERT INTO public.seniority_levels (slug, name, description, display_order) VALUES
('junior', 'Junior', '0-2 años de experiencia', 1),
('semi-senior', 'Semi-Senior', '2-5 años de experiencia', 2),
('senior', 'Senior', '5-10 años de experiencia', 3),
('lead', 'Lead / Manager', '10+ años de experiencia', 4),
('executive', 'Executive / C-Level', 'Nivel ejecutivo', 5)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- POBLAR: company_benefits (38 beneficios)
-- =============================================
INSERT INTO public.company_benefits (slug, name, category, display_order) VALUES
-- Compensación (5)
('bonos-desempeno', 'Bonos por desempeño', 'compensacion', 1),
('stock-options', 'Stock options / Equity', 'compensacion', 2),
('bono-bienvenida', 'Bono de bienvenida', 'compensacion', 3),
('bono-anual', 'Bono anual/aguinaldo', 'compensacion', 4),
('incrementos', 'Incrementos frecuentes', 'compensacion', 5),
-- Salud y bienestar (6)
('seguro-medico', 'Seguro médico privado', 'salud', 6),
('seguro-dental', 'Seguro dental', 'salud', 7),
('seguro-vida', 'Seguro de vida', 'salud', 8),
('salud-mental', 'Apoyo salud mental', 'salud', 9),
('gimnasio', 'Gimnasio / Wellness', 'salud', 10),
('dias-salud', 'Días de salud mental', 'salud', 11),
-- Tiempo y flexibilidad (7)
('vacaciones-extra', 'Vacaciones sobre lo legal', 'tiempo', 12),
('dia-cumpleanos', 'Día libre en cumpleaños', 'tiempo', 13),
('flexibilidad', 'Flexibilidad horaria', 'tiempo', 14),
('viernes-cortos', 'Viernes cortos', 'tiempo', 15),
('semana-4-dias', 'Semana de 4 días', 'tiempo', 16),
('unlimited-pto', 'Unlimited PTO', 'tiempo', 17),
('licencias-parentales', 'Licencias parentales extendidas', 'tiempo', 18),
-- Desarrollo (5)
('presupuesto-cursos', 'Presupuesto para cursos', 'desarrollo', 19),
('conferencias', 'Conferencias pagadas', 'desarrollo', 20),
('certificaciones', 'Certificaciones pagadas', 'desarrollo', 21),
('mentoring', 'Programas de mentoring', 'desarrollo', 22),
('career-path', 'Career path claro', 'desarrollo', 23),
-- Equipamiento (4)
('laptop-ultima', 'Laptop de última generación', 'equipamiento', 24),
('setup-home', 'Setup para home office', 'equipamiento', 25),
('upgrade-equipo', 'Upgrade de equipo regular', 'equipamiento', 26),
('software-pagado', 'Software y herramientas pagadas', 'equipamiento', 27),
-- Día a día (5)
('snacks-gratis', 'Snacks y bebidas gratis', 'dia-a-dia', 28),
('almuerzos', 'Almuerzos subsidiados', 'dia-a-dia', 29),
('coffee-breakfast', 'Coffee & breakfast', 'dia-a-dia', 30),
('team-buildings', 'Team buildings / Eventos', 'dia-a-dia', 31),
('espacios-recreacion', 'Espacios de recreación', 'dia-a-dia', 32),
-- Otros (6)
('remoto-internacional', 'Trabajo remoto internacional', 'otros', 33),
('visa-sponsorship', 'Visa sponsorship', 'otros', 34),
('apoyo-relocacion', 'Apoyo para relocación', 'otros', 35),
('mascotas', 'Mascotas en la oficina', 'otros', 36),
('transporte', 'Transporte subsidiado', 'otros', 37),
('estacionamiento', 'Estacionamiento gratuito', 'otros', 38)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- POBLAR: selection_durations
-- =============================================
INSERT INTO public.selection_durations (slug, name, display_order) VALUES
('menos-1-semana', 'Menos de 1 semana', 1),
('1-2-semanas', '1-2 semanas', 2),
('2-4-semanas', '2-4 semanas', 3),
('1-2-meses', '1-2 meses', 4),
('mas-2-meses', 'Más de 2 meses', 5)
ON CONFLICT (slug) DO NOTHING;
