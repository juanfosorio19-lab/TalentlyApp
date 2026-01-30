-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Countries Table
CREATE TABLE IF NOT EXISTS public.countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    code TEXT
);

-- 2. Cities Table
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    UNIQUE(country_id, name)
);

-- 3. Professional Areas Table
CREATE TABLE IF NOT EXISTS public.professional_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE
);

-- 4. Skills Table (Technical Skills linked to Areas)
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_id UUID REFERENCES public.professional_areas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    UNIQUE(area_id, name)
);

-- 5. Interests Table (General/Soft interests)
CREATE TABLE IF NOT EXISTS public.interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL, -- e.g., 'Deportes y Bienestar', 'Desarrollo Personal' or specific professional area interests
    name TEXT NOT NULL,
    UNIQUE(category, name)
);

-- 6. Languages Table
CREATE TABLE IF NOT EXISTS public.languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    code TEXT
);

-- 7. RLS Policies (Enable Read Access for Authenticated Users)
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.professional_areas FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.interests FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.languages FOR SELECT USING (true);

-- DATA POPULATION

-- Countries
INSERT INTO public.countries (name, code) VALUES
('Chile', 'cl'),
('Argentina', 'ar'),
('Colombia', 'co'),
('México', 'mx'),
('Perú', 'pe'),
('España', 'es')
ON CONFLICT (name) DO NOTHING;

-- Professional Areas
INSERT INTO public.professional_areas (name, slug) VALUES
('Desarrollo', 'desarrollo'),
('Diseño UX/UI', 'diseno-ux'),
('Producto', 'producto'),
('Marketing', 'marketing'),
('Data', 'data'),
('Ventas', 'ventas'),
('Recursos Humanos', 'rrhh'),
('Finanzas', 'finanzas'),
('Operaciones', 'operaciones'),
('Otro', 'other')
ON CONFLICT (slug) DO NOTHING;

-- Languages
INSERT INTO public.languages (name, code) VALUES
('Español', 'es'),
('Inglés', 'en'),
('Portugués', 'pt'),
('Francés', 'fr'),
('Alemán', 'de'),
('Italiano', 'it')
ON CONFLICT (name) DO NOTHING;

-- Helper function to insert city (Dynamic PL/PGSQL block)
DO $$
DECLARE
    country_id UUID;
    area_id UUID;
BEGIN
    -- Cities for Chile
    SELECT id INTO country_id FROM public.countries WHERE code = 'cl';
    IF FOUND THEN
        INSERT INTO public.cities (country_id, name) VALUES
        (country_id, 'Santiago'), (country_id, 'Valparaíso'), (country_id, 'Concepción'), (country_id, 'La Serena'), (country_id, 'Antofagasta')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Cities for Argentina
    SELECT id INTO country_id FROM public.countries WHERE code = 'ar';
    IF FOUND THEN
        INSERT INTO public.cities (country_id, name) VALUES
        (country_id, 'Buenos Aires'), (country_id, 'Córdoba'), (country_id, 'Rosario'), (country_id, 'Mendoza'), (country_id, 'La Plata')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Cities for Colombia
    SELECT id INTO country_id FROM public.countries WHERE code = 'co';
    IF FOUND THEN
        INSERT INTO public.cities (country_id, name) VALUES
        (country_id, 'Bogotá'), (country_id, 'Medellín'), (country_id, 'Cali'), (country_id, 'Barranquilla'), (country_id, 'Cartagena')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Cities for Mexico
    SELECT id INTO country_id FROM public.countries WHERE code = 'mx';
    IF FOUND THEN
        INSERT INTO public.cities (country_id, name) VALUES
        (country_id, 'Ciudad de México'), (country_id, 'Guadalajara'), (country_id, 'Monterrey'), (country_id, 'Puebla'), (country_id, 'Cancún')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Cities for Peru
    SELECT id INTO country_id FROM public.countries WHERE code = 'pe';
    IF FOUND THEN
        INSERT INTO public.cities (country_id, name) VALUES
        (country_id, 'Lima'), (country_id, 'Arequipa'), (country_id, 'Trujillo'), (country_id, 'Cusco'), (country_id, 'Chiclayo')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Cities for Spain
    SELECT id INTO country_id FROM public.countries WHERE code = 'es';
    IF FOUND THEN
        INSERT INTO public.cities (country_id, name) VALUES
        (country_id, 'Madrid'), (country_id, 'Barcelona'), (country_id, 'Valencia'), (country_id, 'Sevilla'), (country_id, 'Bilbao')
        ON CONFLICT DO NOTHING;
    END IF;

    
    -- SKILLS (By Area)
    
    -- Desarrollo
    SELECT id INTO area_id FROM public.professional_areas WHERE slug = 'desarrollo';
    IF FOUND THEN
        INSERT INTO public.skills (area_id, name) VALUES
        (area_id, 'JavaScript'), (area_id, 'Python'), (area_id, 'Java'), (area_id, 'React'), (area_id, 'Node.js'), 
        (area_id, 'AWS'), (area_id, 'Docker'), (area_id, 'SQL'), (area_id, 'Git'), (area_id, 'TypeScript'),
        (area_id, 'C#'), (area_id, 'Go'), (area_id, 'PHP'), (area_id, 'Ruby'), (area_id, 'Rust'),
        (area_id, 'Kubernetes'), (area_id, 'GraphQL'), (area_id, 'MongoDB'), (area_id, 'Redis'), (area_id, 'CI/CD')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Diseño UX
    SELECT id INTO area_id FROM public.professional_areas WHERE slug = 'diseno-ux';
    IF FOUND THEN
        INSERT INTO public.skills (area_id, name) VALUES
        (area_id, 'Figma'), (area_id, 'Sketch'), (area_id, 'Adobe XD'), (area_id, 'Prototyping'), (area_id, 'User Research'),
        (area_id, 'Wireframing'), (area_id, 'UI Design'), (area_id, 'Design Systems'), (area_id, 'HTML/CSS'), (area_id, 'InVision'),
        (area_id, 'Zeplin'), (area_id, 'Usability Testing'), (area_id, 'Information Architecture'), (area_id, 'Interaction Design'), (area_id, 'Miro')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Producto
    SELECT id INTO area_id FROM public.professional_areas WHERE slug = 'producto';
    IF FOUND THEN
        INSERT INTO public.skills (area_id, name) VALUES
        (area_id, 'Roadmapping'), (area_id, 'Agile'), (area_id, 'Scrum'), (area_id, 'User Stories'), (area_id, 'Jira'),
        (area_id, 'Data Analysis'), (area_id, 'A/B Testing'), (area_id, 'Stakeholder Management'), (area_id, 'Product Strategy'), (area_id, 'KPIs'),
        (area_id, 'Market Research'), (area_id, 'Prioritization'), (area_id, 'Product Discovery'), (area_id, 'MVP')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Marketing
    SELECT id INTO area_id FROM public.professional_areas WHERE slug = 'marketing';
    IF FOUND THEN
        INSERT INTO public.skills (area_id, name) VALUES
        (area_id, 'SEO'), (area_id, 'SEM'), (area_id, 'Social Media'), (area_id, 'Content Marketing'), (area_id, 'Google Analytics'),
        (area_id, 'Email Marketing'), (area_id, 'Copywriting'), (area_id, 'Branding'), (area_id, 'CRM'), (area_id, 'Google Ads'),
        (area_id, 'Facebook Ads'), (area_id, 'Marketing Automation'), (area_id, 'Growth Hacking'), (area_id, 'PR'), (area_id, 'HubSpot')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Data
    SELECT id INTO area_id FROM public.professional_areas WHERE slug = 'data';
    IF FOUND THEN
        INSERT INTO public.skills (area_id, name) VALUES
        (area_id, 'Python'), (area_id, 'R'), (area_id, 'SQL'), (area_id, 'Tableau'), (area_id, 'Power BI'),
        (area_id, 'Machine Learning'), (area_id, 'Big Data'), (area_id, 'Statistics'), (area_id, 'Excel'), (area_id, 'Data Mining'),
        (area_id, 'TensorFlow'), (area_id, 'Spark'), (area_id, 'Pandas'), (area_id, 'Data Visualization'), (area_id, 'ETL')
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Ventas
    SELECT id INTO area_id FROM public.professional_areas WHERE slug = 'ventas';
    IF FOUND THEN
        INSERT INTO public.skills (area_id, name) VALUES
        (area_id, 'CRM'), (area_id, 'Salesforce'), (area_id, 'Negotiation'), (area_id, 'Lead Generation'), (area_id, 'B2B Sales'),
        (area_id, 'Key Account Management'), (area_id, 'Cold Calling'), (area_id, 'Presentation'), (area_id, 'Closing'), (area_id, 'Pipeline Management'),
        (area_id, 'Customer Relationship'), (area_id, 'Sales Strategy'), (area_id, 'Business Development'), (area_id, 'Prospecting')
        ON CONFLICT DO NOTHING;
    END IF;

    -- RRHH
    SELECT id INTO area_id FROM public.professional_areas WHERE slug = 'rrhh';
    IF FOUND THEN
        INSERT INTO public.skills (area_id, name) VALUES
        (area_id, 'Recruiting'), (area_id, 'Talent Acquisition'), (area_id, 'Onboarding'), (area_id, 'Employee Relations'), (area_id, 'Performance Management'),
        (area_id, 'Labor Law'), (area_id, 'HRIS'), (area_id, 'Compensation & Benefits'), (area_id, 'Training & Development'), (area_id, 'Organizational Culture'),
        (area_id, 'Diversity & Inclusion'), (area_id, 'Employee Engagement'), (area_id, 'Workday')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Finanzas
    SELECT id INTO area_id FROM public.professional_areas WHERE slug = 'finanzas';
    IF FOUND THEN
        INSERT INTO public.skills (area_id, name) VALUES
        (area_id, 'Excel'), (area_id, 'Financial Analysis'), (area_id, 'Accounting'), (area_id, 'Budgeting'), (area_id, 'Forecasting'),
        (area_id, 'SAP'), (area_id, 'Audit'), (area_id, 'Taxation'), (area_id, 'Corporate Finance'), (area_id, 'Valuation'),
        (area_id, 'Risk Management'), (area_id, 'Financial Reporting'), (area_id, 'Payroll'), (area_id, 'QuickBooks'), (area_id, 'Investment')
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Operaciones (Not in main list but appeared in interests, careful here, adding generic skills if area exists)
    SELECT id INTO area_id FROM public.professional_areas WHERE slug = 'operaciones';
    IF FOUND THEN
        INSERT INTO public.skills (area_id, name) VALUES
        (area_id, 'Logística'), (area_id, 'Supply Chain'), (area_id, 'Mejora Continua'), (area_id, 'Lean Six Sigma'), (area_id, 'Gestión de Proyectos'),
        (area_id, 'Distribución'), (area_id, 'Inventarios'), (area_id, 'Calidad'), (area_id, 'Seguridad Industrial'), (area_id, 'Planificación')
        ON CONFLICT DO NOTHING;
    END IF;

    -- INTERESTS (General / Soft)
    -- Deportes y Bienestar
    INSERT INTO public.interests (category, name) VALUES
    ('Deportes y Bienestar', 'Fútbol'), ('Deportes y Bienestar', 'Running'), ('Deportes y Bienestar', 'Yoga'), ('Deportes y Bienestar', 'Trekking'),
    ('Deportes y Bienestar', 'Ciclismo'), ('Deportes y Bienestar', 'Natación'), ('Deportes y Bienestar', 'Crossfit'), ('Deportes y Bienestar', 'Tenis'),
    ('Deportes y Bienestar', 'Meditación')
    ON CONFLICT DO NOTHING;

    -- Arte y Creatividad
    INSERT INTO public.interests (category, name) VALUES
    ('Arte y Creatividad', 'Música'), ('Arte y Creatividad', 'Fotografía'), ('Arte y Creatividad', 'Cine'), ('Arte y Creatividad', 'Diseño'),
    ('Arte y Creatividad', 'Pintura'), ('Arte y Creatividad', 'Escritura'), ('Arte y Creatividad', 'Lectura'), ('Arte y Creatividad', 'Cocina'),
    ('Arte y Creatividad', 'Viajes')
    ON CONFLICT DO NOTHING;

    -- Tecnología y Ciencia
    INSERT INTO public.interests (category, name) VALUES
    ('Tecnología y Ciencia', 'Gadgets'), ('Tecnología y Ciencia', 'Gaming'), ('Tecnología y Ciencia', 'Inteligencia Artificial'),
    ('Tecnología y Ciencia', 'Astronomía'), ('Tecnología y Ciencia', 'Robótica'), ('Tecnología y Ciencia', 'Hackathons'),
    ('Tecnología y Ciencia', 'Criptomonedas')
    ON CONFLICT DO NOTHING;

    -- Desarrollo Personal
    INSERT INTO public.interests (category, name) VALUES
    ('Desarrollo Personal', 'Idiomas'), ('Desarrollo Personal', 'Voluntariado'), ('Desarrollo Personal', 'Mentoring'),
    ('Desarrollo Personal', 'Networking'), ('Desarrollo Personal', 'Emprendimiento'), ('Desarrollo Personal', 'Inversiones')
    ON CONFLICT DO NOTHING;

END $$;
