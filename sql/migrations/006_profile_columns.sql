-- =============================================
-- Migration: Add experience & education columns to profiles table
-- These columns store arrays of objects as JSONB
-- Run this in your Supabase SQL Editor
-- =============================================

-- Add experience column (JSONB array)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]';

-- Add education column (JSONB array)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]';

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('experience', 'education');
-- =============================================
-- Verificar y actualizar estructura de profiles
-- =============================================

-- Agregar columnas faltantes si no existen
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]';

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]';

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS work_modality TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Comentarios descriptivos
COMMENT ON COLUMN public.profiles.experience IS 'Array JSONB con historial laboral: [{company, position, start_date, end_date, description}]';
COMMENT ON COLUMN public.profiles.education IS 'Array JSONB con historial educativo: [{institution, degree, field, start_date, end_date}]';
COMMENT ON COLUMN public.profiles.work_modality IS 'Modalidad de trabajo preferida (slug de work_modalities)';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL de la foto de perfil en Supabase Storage';
