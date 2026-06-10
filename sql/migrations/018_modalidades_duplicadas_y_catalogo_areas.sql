-- =============================================
-- Talently — Migración 018: modalidades duplicadas + catálogo de áreas
-- Aplicada en Supabase: 2026-06-10
--
-- Bug reportado en QA del APK (onboarding candidato):
-- 1. El paso "Modalidad" mostraba 7 opciones semánticamente duplicadas
--    (Remoto / 100% Remoto / Remote-first / Híbrido / Híbrido flexible /
--    Híbrido con días fijos / 100% Presencial). El formato canónico del
--    proyecto es 'Remoto' | 'Híbrido' | 'Presencial' (ver migración 014).
--    Ningún perfil/oferta referencia los nombres duplicados (verificado).
-- 2. El paso "Encuentra tu área" solo tenía 10 áreas tech. Se agregan
--    áreas generales (Ingeniería, Administración, Arquitectura, Legal,
--    Educación, etc.). Las áreas sin skills asociadas no rompen el paso 8:
--    Step8_Habilidades filtra grupos vacíos y permite skills custom.
-- =============================================

-- ── 1. work_modalities: dejar solo las 3 canónicas ──
DELETE FROM public.work_modalities
WHERE name IN ('100% Remoto', 'Remote-first', 'Híbrido flexible', 'Híbrido con días fijos');

UPDATE public.work_modalities SET name = 'Presencial' WHERE name = '100% Presencial';

UPDATE public.work_modalities SET display_order = 1, icon = 'public'     WHERE name = 'Remoto';
UPDATE public.work_modalities SET display_order = 2, icon = 'domain_add' WHERE name = 'Híbrido';
UPDATE public.work_modalities SET display_order = 3, icon = 'apartment'  WHERE name = 'Presencial';

-- ── 2. professional_areas: ampliar el catálogo más allá de tech ──
INSERT INTO public.professional_areas (name, slug)
SELECT v.name, v.slug
FROM (VALUES
    ('Ingeniería',               'ingenieria'),
    ('Administración',           'administracion'),
    ('Arquitectura',             'arquitectura'),
    ('Legal',                    'legal'),
    ('Educación',                'educacion'),
    ('Salud',                    'salud'),
    ('Construcción',             'construccion'),
    ('Logística y Transporte',   'logistica-transporte'),
    ('Manufactura y Producción', 'manufactura-produccion'),
    ('Minería y Energía',        'mineria-energia'),
    ('Agro y Medio Ambiente',    'agro-medioambiente'),
    ('Turismo y Gastronomía',    'turismo-gastronomia'),
    ('Retail y Comercio',        'retail-comercio'),
    ('Comunicaciones y Medios',  'comunicaciones-medios'),
    ('Ciencia e Investigación',  'ciencia-investigacion'),
    ('Atención al Cliente',      'atencion-cliente'),
    ('Banca y Seguros',          'banca-seguros'),
    ('Gobierno y ONG',           'gobierno-ong'),
    ('Arte y Entretenimiento',   'arte-entretenimiento'),
    ('Deporte y Bienestar',      'deporte-bienestar'),
    ('Seguridad y Prevención',   'seguridad-prevencion'),
    ('Inmobiliaria',             'inmobiliaria')
) AS v(name, slug)
WHERE NOT EXISTS (
    SELECT 1 FROM public.professional_areas pa WHERE pa.slug = v.slug
);
