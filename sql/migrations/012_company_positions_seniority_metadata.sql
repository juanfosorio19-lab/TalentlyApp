-- =============================================
-- Talently — Migración 012: metadata visual para posiciones y seniority
-- Aplicada en Supabase: 2026-05-18
--
-- Mueve los mappings hardcodeados en Step7_PosicionesSeniority.jsx a la BD.
-- Después de esto, el JSX puede leer p.icon y s.years_range directamente.
-- =============================================

-- 1. Agregar columna icon a company_positions
ALTER TABLE public.company_positions ADD COLUMN IF NOT EXISTS icon TEXT;

-- 2. Popular icons (Material Symbols Rounded) con los nombres actuales en BD
UPDATE public.company_positions SET icon = 'code'              WHERE name = 'Desarrollo';
UPDATE public.company_positions SET icon = 'design_services'   WHERE name = 'Diseño UX/UI';
UPDATE public.company_positions SET icon = 'inventory'         WHERE name = 'Product Management';
UPDATE public.company_positions SET icon = 'campaign'          WHERE name = 'Marketing';
UPDATE public.company_positions SET icon = 'payments'          WHERE name = 'Ventas';
UPDATE public.company_positions SET icon = 'database'          WHERE name = 'Data/Analytics';
UPDATE public.company_positions SET icon = 'group'             WHERE name = 'RRHH';
UPDATE public.company_positions SET icon = 'account_balance'   WHERE name = 'Finanzas';
UPDATE public.company_positions SET icon = 'settings'          WHERE name = 'Operaciones';
UPDATE public.company_positions SET icon = 'gavel'             WHERE name = 'Legal';
UPDATE public.company_positions SET icon = 'support_agent'     WHERE name = 'Customer Success';
UPDATE public.company_positions SET icon = 'cloud'             WHERE name = 'DevOps';
UPDATE public.company_positions SET icon = 'bug_report'        WHERE name = 'QA/Testing';
UPDATE public.company_positions SET icon = 'shield'            WHERE name = 'Security';
UPDATE public.company_positions SET icon = 'edit_note'         WHERE name = 'Content/Comunicaciones';
-- Fallback genérico para cualquier posición sin mapear
UPDATE public.company_positions SET icon = 'work' WHERE icon IS NULL;

-- 3. Agregar columna years_range a seniority_levels
ALTER TABLE public.seniority_levels ADD COLUMN IF NOT EXISTS years_range TEXT;

-- 4. Popular years_range con los nombres actuales en BD
UPDATE public.seniority_levels SET years_range = '1-3 años'   WHERE name = 'Junior';
UPDATE public.seniority_levels SET years_range = '3-5 años'   WHERE name = 'Semi-Senior';
UPDATE public.seniority_levels SET years_range = '5-8 años'   WHERE name = 'Senior';
UPDATE public.seniority_levels SET years_range = '8+ años'    WHERE name IN ('Manager', 'Lead / Manager');
UPDATE public.seniority_levels SET years_range = 'Estratégico' WHERE name = 'Executive / C-Level';
