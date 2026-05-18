CREATE TABLE IF NOT EXISTS public.faq_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    icon TEXT,
    subtitle TEXT,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.faq_categories(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active RLS
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Allow anon read access
CREATE POLICY "Allow public read access on faq_categories" ON public.faq_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on faqs" ON public.faqs FOR SELECT USING (true);

-- Insert dummy categories
INSERT INTO public.faq_categories (id, title, icon, subtitle, position)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Mi Perfil', 'person', 'Datos y CV', 1),
    ('22222222-2222-2222-2222-222222222222', 'Privacidad', 'lock', 'Seguridad', 2),
    ('33333333-3333-3333-3333-333333333333', 'Mensajes', 'chat_bubble', 'Matches', 3),
    ('44444444-4444-4444-4444-444444444444', 'Empresas', 'apartment', 'Info general', 4)
ON CONFLICT (id) DO NOTHING;

-- Insert dummy faqs
INSERT INTO public.faqs (id, category_id, question, answer, position)
VALUES
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '¿Cómo edito mi experiencia laboral?', 'Ve a tu perfil tocando el ícono en la esquina inferior derecha. Luego selecciona "Editar Perfil" y baja hasta la sección de Experiencia.', 1),
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '¿Cómo ocultar mi perfil?', 'Ve a Configuración -> Privacidad y desactiva "Perfil Público".', 1),
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'No recibo notificaciones de matches', 'Ve a Configuración y asegúrate de tener las notificaciones activadas. Verifica tu dispositivo.', 1),
    (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', '¿Qué información pueden ver las empresas?', 'Las empresas pueden ver tu biografía, experiencia y habilidades. No verán tu número telefónico o email a menos que hagas match.', 1)
;
