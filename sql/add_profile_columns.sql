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
