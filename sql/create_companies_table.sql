-- =============================================
-- Crear tabla companies (si no existe)
-- =============================================

-- Tabla principal: companies
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Política: Las empresas pueden leer su propia información
CREATE POLICY "Companies can view own data" ON public.companies
FOR SELECT USING (auth.uid() = user_id);

-- Política: Las empresas pueden actualizar su propia información
CREATE POLICY "Companies can update own data" ON public.companies
FOR UPDATE USING (auth.uid() = user_id);

-- Política: Las empresas pueden insertar su propia información
CREATE POLICY "Companies can insert own data" ON public.companies
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: Lectura pública de perfiles de empresas (para matching)
CREATE POLICY "Public can view company profiles" ON public.companies
FOR SELECT USING (true);

-- Índice para búsquedas por user_id
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);

-- Comentarios
COMMENT ON TABLE public.companies IS 'Tabla principal de perfiles de empresas';
COMMENT ON COLUMN public.companies.user_id IS 'ID del usuario auth asociado a esta empresa';
