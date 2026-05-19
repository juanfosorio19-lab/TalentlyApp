-- =============================================
-- Talently — QA Seed
-- =============================================
-- Poblar la BD con datos mínimos para que el agente qa-e2e pueda ejecutar
-- las suites 2/3/4/5 (onboarding, swipe, mensajes, crear oferta).
--
-- PRE-REQUISITO: crear primero los dos usuarios en Supabase Dashboard
-- (Auth → Users → "Add user") y reemplazar los UUIDs abajo. Ver SEED.md.
--
-- Para LIMPIAR: ejecutar primero qa_seed_cleanup.sql.
-- =============================================

-- ⬇️ REEMPLAZAR ESTOS UUIDs CON LOS DE TUS USUARIOS DE TEST ⬇️
\set candidate_id  'e4c2d401-663e-410c-8d70-028ce5c2bc63'
\set company_id    'd8bfe862-f4fb-4ce4-a1a9-cd849f81be5f'

-- Si tu cliente SQL no soporta \set, copia los UUIDs y reemplaza
-- :candidate_id y :company_id en el resto del archivo manualmente.

-- ─────────────────────────────────────────────
-- 1. Profile CANDIDATO
-- ─────────────────────────────────────────────
INSERT INTO public.profiles (
    id, user_type, full_name, name, headline, bio,
    role, title, current_position, professional_area, experience_years,
    skills, soft_skills, languages, interests,
    modality, work_modality, availability,
    country, city,
    currency, salary_min, salary_max, expected_salary,
    education_level, experience_level,
    onboarding_completed
) VALUES (
    :'candidate_id', 'candidate', 'QA Test Candidato', 'QA Candidato',
    'Senior Frontend Engineer',
    'Perfil de prueba creado por el seed de QA. Buscando proyectos remote con stack moderno.',
    'Frontend Engineer', 'Senior Frontend Engineer', 'Frontend Engineer',
    'Desarrollo', 5,
    ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    ARRAY['Comunicación', 'Trabajo en equipo', 'Proactividad'],
    ARRAY['Español', 'Inglés'],
    ARRAY['Gaming', 'Fotografía'],
    'Remoto', 'Remoto', 'immediate',
    'Chile', 'Santiago',
    'USD', 3500, 5500, 4500,
    'university', 'senior',
    true
) ON CONFLICT (id) DO UPDATE SET
    user_type = EXCLUDED.user_type,
    full_name = EXCLUDED.full_name,
    onboarding_completed = true,
    updated_at = NOW();

-- ─────────────────────────────────────────────
-- 2. Profile EMPRESA
-- ─────────────────────────────────────────────
INSERT INTO public.profiles (
    id, user_type, full_name, name,
    company_name, company_sector, company_size, company_stage,
    company_description, company_logo_url,
    country, city, modality,
    onboarding_completed
) VALUES (
    :'company_id', 'company', 'QA Test Empresa', 'QA Empresa',
    'QA Test Empresa', 'tech', '11-50', 'serie-a',
    'Empresa de prueba creada por el seed de QA. Trabajamos 100% remoto en producto SaaS.',
    NULL,
    'Chile', 'Santiago', 'Remoto',
    true
) ON CONFLICT (id) DO UPDATE SET
    user_type = 'company',
    onboarding_completed = true,
    updated_at = NOW();

-- ─────────────────────────────────────────────
-- 3. Row en companies (tabla satélite del empresa)
-- ─────────────────────────────────────────────
INSERT INTO public.companies (
    user_id, name, sector, company_size, company_stage,
    country, city, work_model, fully_remote,
    value_proposition, selection_stages, selection_duration,
    benefits, culture_values, positions_looking, seniority_levels, tech_stack, tags
) VALUES (
    :'company_id', 'QA Test Empresa', 'tech', '11-50', 'serie-a',
    'Chile', 'Santiago', 'Remoto', true,
    'Construimos producto SaaS con stack moderno. 100% remoto, sin presencialidad obligatoria.',
    3, '2_4_weeks',
    '["Seguro médico privado", "Flexibilidad horaria", "Presupuesto para cursos"]'::jsonb,
    '["Innovación constante", "Autonomía y confianza", "Aprendizaje continuo"]'::jsonb,
    '["Desarrollo", "Diseño UX/UI"]'::jsonb,
    '["Senior", "Semi-Senior"]'::jsonb,
    '["React", "TypeScript", "Node.js", "PostgreSQL"]'::jsonb,
    '["Remote-first", "Producto", "Latam"]'::jsonb
) ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- 4. Una OFFER publicada por la empresa
-- ─────────────────────────────────────────────
INSERT INTO public.offers (
    id, user_id, title, professional_title, description,
    professional_area, seniority, work_modality, modality,
    country, city,
    salary_min, salary_max, salary_currency, currency,
    experience_years,
    skills, soft_skills, tech_stack, benefits,
    process_stages, process_duration,
    status
) VALUES (
    'aaaaaaaa-1111-1111-1111-111111111111',
    :'company_id',
    'Senior Frontend Engineer (Remote)',
    'Senior Frontend Engineer',
    'Buscamos a alguien con 5+ años en React/TypeScript para liderar el módulo de matching. Cultura remote-first, stack moderno, decisiones ágiles.',
    'Desarrollo', 'Senior', 'Remoto', 'Remoto',
    'Chile', 'Santiago',
    3500, 5500, 'USD', 'USD',
    5,
    ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    ARRAY['Comunicación', 'Liderazgo técnico'],
    '["React", "TypeScript", "Node.js", "PostgreSQL"]'::jsonb,
    '["Seguro médico privado", "Flexibilidad horaria", "Presupuesto para cursos"]'::jsonb,
    3, '2_4_weeks',
    'active'
) ON CONFLICT (id) DO UPDATE SET
    status = 'active',
    updated_at = NOW();

-- ─────────────────────────────────────────────
-- 5. Swipes mutuos (right ambos) para generar match
-- ─────────────────────────────────────────────
INSERT INTO public.swipes (swiper_id, target_id, offer_id, direction) VALUES
    (:'candidate_id', :'company_id', 'aaaaaaaa-1111-1111-1111-111111111111', 'right'),
    (:'company_id',   :'candidate_id', NULL,                                'right')
ON CONFLICT (swiper_id, target_id) DO NOTHING;

-- ─────────────────────────────────────────────
-- 6. Match entre los dos
-- ─────────────────────────────────────────────
INSERT INTO public.matches (id, user_id_1, user_id_2, status) VALUES
    ('bbbbbbbb-2222-2222-2222-222222222222', :'candidate_id', :'company_id', 'active')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- 7. Cinco mensajes históricos en el match
-- ─────────────────────────────────────────────
INSERT INTO public.messages (match_id, sender_id, content, read, created_at) VALUES
    ('bbbbbbbb-2222-2222-2222-222222222222', :'company_id',   '¡Hola! Vi tu perfil y nos encantaría conversar.', true,  NOW() - INTERVAL '3 days'),
    ('bbbbbbbb-2222-2222-2222-222222222222', :'candidate_id', '¡Gracias por el match! Cuéntame más del rol.',   true,  NOW() - INTERVAL '3 days' + INTERVAL '15 minutes'),
    ('bbbbbbbb-2222-2222-2222-222222222222', :'company_id',   'Buscamos alguien que lidere el módulo de matching. Stack React/TS, equipo remoto.', true, NOW() - INTERVAL '2 days'),
    ('bbbbbbbb-2222-2222-2222-222222222222', :'candidate_id', 'Suena interesante. ¿Cuál es el rango salarial?', true, NOW() - INTERVAL '1 day'),
    ('bbbbbbbb-2222-2222-2222-222222222222', :'company_id',   'USD 3500-5500 según experiencia. ¿Te calza?', false, NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- 8. Notificaciones para ambos lados
-- ─────────────────────────────────────────────
INSERT INTO public.notifications (user_id, type, title, message, related_id, read) VALUES
    (:'candidate_id', 'match',   '¡Nuevo Match!',           'QA Test Empresa también está interesada en ti.',          'bbbbbbbb-2222-2222-2222-222222222222', false),
    (:'company_id',   'match',   '¡Nuevo Match!',           'QA Test Candidato también está interesado en ti.',         'bbbbbbbb-2222-2222-2222-222222222222', false),
    (:'candidate_id', 'message', 'Nuevo mensaje',           'QA Test Empresa te envió un mensaje.',                     'bbbbbbbb-2222-2222-2222-222222222222', false),
    (:'company_id',   'offer',   'Tu oferta tuvo movimiento','QA Test Candidato hizo swipe a tu oferta.',                'aaaaaaaa-1111-1111-1111-111111111111', true)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- 9. user_statistics inicializadas
-- ─────────────────────────────────────────────
INSERT INTO public.user_statistics (
    user_id, profile_views, matches_count, swipes_given, swipes_received, messages_sent, messages_received
) VALUES
    (:'candidate_id', 12, 1, 8,  5, 3, 2),
    (:'company_id',    8, 1, 5, 12, 2, 3)
ON CONFLICT (user_id) DO UPDATE SET
    profile_views = EXCLUDED.profile_views,
    matches_count = EXCLUDED.matches_count,
    swipes_given = EXCLUDED.swipes_given,
    swipes_received = EXCLUDED.swipes_received,
    messages_sent = EXCLUDED.messages_sent,
    messages_received = EXCLUDED.messages_received,
    updated_at = NOW();

-- ─────────────────────────────────────────────
-- Verificación
-- ─────────────────────────────────────────────
SELECT 'profiles'        AS table, COUNT(*) FROM public.profiles        WHERE id        IN (:'candidate_id', :'company_id')
UNION ALL SELECT 'companies',         COUNT(*) FROM public.companies         WHERE user_id   = :'company_id'
UNION ALL SELECT 'offers',            COUNT(*) FROM public.offers            WHERE user_id   = :'company_id'
UNION ALL SELECT 'swipes',            COUNT(*) FROM public.swipes            WHERE swiper_id IN (:'candidate_id', :'company_id')
UNION ALL SELECT 'matches',           COUNT(*) FROM public.matches           WHERE user_id_1 = :'candidate_id'
UNION ALL SELECT 'messages',          COUNT(*) FROM public.messages          WHERE sender_id IN (:'candidate_id', :'company_id')
UNION ALL SELECT 'notifications',     COUNT(*) FROM public.notifications     WHERE user_id   IN (:'candidate_id', :'company_id')
UNION ALL SELECT 'user_statistics',   COUNT(*) FROM public.user_statistics   WHERE user_id   IN (:'candidate_id', :'company_id');
