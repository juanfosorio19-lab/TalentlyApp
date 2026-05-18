-- =============================================
-- Talently — Tablas faltantes detectadas en app_fixed.js
-- Ejecutar en Supabase SQL Editor
-- Fecha: Marzo 2026
-- =============================================

-- =============================================
-- 1. TABLA: interviews
-- Permite agendar entrevistas desde el chat
-- =============================================
CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    -- status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'
    scheduled_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;

-- Empresa puede ver y gestionar entrevistas de sus matches
CREATE POLICY "Company can manage their interviews" ON public.interviews
    FOR ALL USING (auth.uid() = company_id);

-- Candidato puede ver sus entrevistas
CREATE POLICY "Candidate can view their interviews" ON public.interviews
    FOR SELECT USING (auth.uid() = candidate_id);

CREATE INDEX IF NOT EXISTS idx_interviews_match ON public.interviews(match_id);
CREATE INDEX IF NOT EXISTS idx_interviews_company ON public.interviews(company_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate ON public.interviews(candidate_id);

-- =============================================
-- 2. TABLA: job_types
-- Tipos de jornada disponibles para filtros y ofertas
-- =============================================
CREATE TABLE IF NOT EXISTS public.job_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    display_order INTEGER DEFAULT 0
);

ALTER TABLE public.job_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read job_types" ON public.job_types
    FOR SELECT USING (true);

-- Datos iniciales (consistentes con los hardcodeados en app_fixed.js como fallback)
INSERT INTO public.job_types (name, slug, display_order) VALUES
    ('Full-time', 'full-time', 1),
    ('Part-time', 'part-time', 2),
    ('Freelance', 'freelance', 3),
    ('Contrata', 'contract', 4),
    ('Práctica', 'internship', 5)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- 3. TABLA: support_tickets
-- Tickets de soporte enviados desde la app
-- =============================================
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    -- status: 'open' | 'in_progress' | 'resolved' | 'closed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Usuario solo puede ver sus propios tickets
CREATE POLICY "Users can view own tickets" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id);

-- Usuario puede crear tickets
CREATE POLICY "Users can create tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id);

-- =============================================
-- 4. TABLA: user_settings
-- Configuración y preferencias por usuario
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Preferencias de interfaz
    dark_mode BOOLEAN DEFAULT FALSE,
    language TEXT DEFAULT 'es',
    region TEXT DEFAULT 'CL',

    -- Preferencias de notificaciones
    notifications_matches BOOLEAN DEFAULT TRUE,
    notifications_messages BOOLEAN DEFAULT TRUE,
    notifications_views BOOLEAN DEFAULT TRUE,
    notifications_email BOOLEAN DEFAULT TRUE,

    -- Preferencias de privacidad
    profile_visible BOOLEAN DEFAULT TRUE,
    show_salary BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_user_settings UNIQUE(user_id)
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_settings_user ON public.user_settings(user_id);
