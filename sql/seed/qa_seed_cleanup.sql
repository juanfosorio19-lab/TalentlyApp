-- =============================================
-- Talently — QA Seed cleanup
-- =============================================
-- Limpia los datos creados por qa_seed.sql.
-- NO borra los usuarios de auth.users — eso debe hacerse desde el dashboard.
-- =============================================

\set candidate_id '11111111-1111-1111-1111-111111111111'
\set company_id   '22222222-2222-2222-2222-222222222222'

DELETE FROM public.notifications    WHERE user_id    IN (:'candidate_id', :'company_id');
DELETE FROM public.messages         WHERE match_id   = 'bbbbbbbb-2222-2222-2222-222222222222';
DELETE FROM public.matches          WHERE id         = 'bbbbbbbb-2222-2222-2222-222222222222';
DELETE FROM public.swipes           WHERE swiper_id  IN (:'candidate_id', :'company_id');
DELETE FROM public.offers           WHERE user_id    = :'company_id';
DELETE FROM public.companies        WHERE user_id    = :'company_id';
DELETE FROM public.user_statistics  WHERE user_id    IN (:'candidate_id', :'company_id');
DELETE FROM public.profiles         WHERE id         IN (:'candidate_id', :'company_id');

-- Verificación
SELECT 'profiles'  AS table, COUNT(*) FROM public.profiles  WHERE id      IN (:'candidate_id', :'company_id')
UNION ALL SELECT 'companies', COUNT(*) FROM public.companies WHERE user_id = :'company_id'
UNION ALL SELECT 'offers',    COUNT(*) FROM public.offers    WHERE user_id = :'company_id'
UNION ALL SELECT 'matches',   COUNT(*) FROM public.matches   WHERE id      = 'bbbbbbbb-2222-2222-2222-222222222222';
