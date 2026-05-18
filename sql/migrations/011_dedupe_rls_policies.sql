-- =============================================
-- Talently — Migración 011: eliminar políticas RLS duplicadas
-- Aplicada en Supabase: 2026-05-18
--
-- Antes: 8 tablas críticas tenían 6 políticas donde deberían tener 2-3.
-- Vienen de aplicar el schema en distintos momentos con nombres distintos.
-- No es vulnerabilidad (OR-eadas), pero degrada performance (PostgreSQL
-- evalúa todas las policies en cada query).
--
-- Estrategia: conservar la versión moderna con nomenclatura *_read_*/*_write_*
-- y dropear las legacy en español y en inglés viejo.
-- =============================================

-- ─── companies ───
-- Conservar: companies_write_own (ALL), companies_read_all (SELECT true)
DROP POLICY IF EXISTS "Companies can insert own data" ON public.companies;
DROP POLICY IF EXISTS "Companies can view own data" ON public.companies;
DROP POLICY IF EXISTS "Companies can update own data" ON public.companies;
DROP POLICY IF EXISTS "Public can view company profiles" ON public.companies;

-- ─── matches ───
-- Conservar: matches_write_involved (INSERT), matches_read_involved (SELECT)
DROP POLICY IF EXISTS "Crear matches" ON public.matches;
DROP POLICY IF EXISTS "Users can insert matches" ON public.matches;
DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;
DROP POLICY IF EXISTS "Ver mis matches" ON public.matches;

-- ─── messages ───
-- Conservar: messages_write_participants (INSERT), messages_read_participants (SELECT)
DROP POLICY IF EXISTS "Enviar mensajes" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their matches" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in their matches" ON public.messages;
DROP POLICY IF EXISTS "Ver mensajes" ON public.messages;

-- ─── offers ───
-- Conservar: offers_write_own (ALL), offers_read_all (SELECT true)
DROP POLICY IF EXISTS "Companies can delete their own offers" ON public.offers;
DROP POLICY IF EXISTS "Companies can insert their own offers" ON public.offers;
DROP POLICY IF EXISTS "Companies can update their own offers" ON public.offers;
DROP POLICY IF EXISTS "Public offers are viewable by everyone" ON public.offers;

-- ─── profiles ───
-- Conservar: profiles_write_own (ALL), profiles_read_all (SELECT true)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can read profiles" ON public.profiles;

-- ─── swipes ───
-- Conservar: swipes_write_own (INSERT), swipes_read_involved (SELECT), swipes_update_own (UPDATE)
DROP POLICY IF EXISTS "Users can create their own swipes" ON public.swipes;
DROP POLICY IF EXISTS "Users can read relevant swipes" ON public.swipes;
DROP POLICY IF EXISTS "Users can update their own swipes" ON public.swipes;

-- ─── notifications ───
-- Conservar: notifications_insert_authenticated (INSERT), notifications_read_own,
--           notifications_update_own
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- ─── support_tickets ───
-- Conservar: "Users can create tickets" (permite user_id NULL → tickets anónimos)
--           y tickets_read_own (lectura propia).
DROP POLICY IF EXISTS "Users can create their own support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view their own support tickets" ON public.support_tickets;

-- ─── tech_stack ───
DROP POLICY IF EXISTS "tech_stack_public_read" ON public.tech_stack;

-- ─── tablas de referencia (catálogos públicos) ───
-- Patrón: dos policies SELECT idénticas con USING (true).
-- Conservar "public_read_*", dropear las verbosas.
DROP POLICY IF EXISTS "Allow public read access" ON public.cities;
DROP POLICY IF EXISTS "Allow public read access" ON public.countries;
DROP POLICY IF EXISTS "Allow public read access" ON public.interests;
DROP POLICY IF EXISTS "Allow public read access" ON public.languages;
DROP POLICY IF EXISTS "Allow public read access" ON public.professional_areas;
DROP POLICY IF EXISTS "Allow public read access" ON public.skills;
DROP POLICY IF EXISTS "Allow public read" ON public.company_benefits;
DROP POLICY IF EXISTS "Allow public read" ON public.company_benefits_offered;
DROP POLICY IF EXISTS "Allow public read" ON public.company_culture_selected;
DROP POLICY IF EXISTS "Allow public read" ON public.company_culture_values;
DROP POLICY IF EXISTS "Allow public read" ON public.company_photos;
DROP POLICY IF EXISTS "Allow public read" ON public.company_positions;
DROP POLICY IF EXISTS "Allow public read" ON public.company_positions_looking;
DROP POLICY IF EXISTS "Allow public read" ON public.company_sectors;
DROP POLICY IF EXISTS "Allow public read" ON public.company_seniority_looking;
DROP POLICY IF EXISTS "Allow public read" ON public.company_sizes;
DROP POLICY IF EXISTS "Allow public read" ON public.company_stages;
DROP POLICY IF EXISTS "Allow public read" ON public.company_tags;
DROP POLICY IF EXISTS "Allow public read" ON public.company_tech_stack;
DROP POLICY IF EXISTS "Allow public read" ON public.education_levels;
DROP POLICY IF EXISTS "Allow public read" ON public.experience_ranges;
DROP POLICY IF EXISTS "Allow public read" ON public.selection_durations;
DROP POLICY IF EXISTS "Allow public read" ON public.seniority_levels;
DROP POLICY IF EXISTS "Allow public read" ON public.work_modalities;
DROP POLICY IF EXISTS "Allow public read access on faqs" ON public.faqs;
