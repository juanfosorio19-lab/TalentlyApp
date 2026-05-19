-- =============================================
-- Talently — Migración 013: metadata visual para culture_values, benefits y tech_stack
-- Aplicada en Supabase: 2026-05-18
--
-- Mueve mappings hardcodeados de Step4_Cultura, Step8_Stack y CreateOffer a la BD.
-- Cierra issues #9 y #10 del audit dashboard.
-- =============================================

-- 1. company_culture_values.icon
UPDATE public.company_culture_values SET icon = 'lightbulb'         WHERE name = 'Innovación constante';
UPDATE public.company_culture_values SET icon = 'group'              WHERE name = 'Trabajo en equipo';
UPDATE public.company_culture_values SET icon = 'rocket_launch'      WHERE name = 'Autonomía y confianza';
UPDATE public.company_culture_values SET icon = 'diversity_3'        WHERE name = 'Diversidad e inclusión';
UPDATE public.company_culture_values SET icon = 'self_improvement'   WHERE name = 'Balance vida-trabajo';
UPDATE public.company_culture_values SET icon = 'trending_up'        WHERE name = 'Crecimiento rápido';
UPDATE public.company_culture_values SET icon = 'flag'               WHERE name = 'Orientación a resultados';
UPDATE public.company_culture_values SET icon = 'school'             WHERE name = 'Aprendizaje continuo';
UPDATE public.company_culture_values SET icon = 'mood'               WHERE name = 'Ambiente informal';
UPDATE public.company_culture_values SET icon = 'business'           WHERE name = 'Ambiente profesional';
UPDATE public.company_culture_values SET icon = 'bolt'               WHERE name = 'Decisiones ágiles';
UPDATE public.company_culture_values SET icon = 'analytics'          WHERE name = 'Data-driven';
UPDATE public.company_culture_values SET icon = 'public'             WHERE name = 'Impacto social';
UPDATE public.company_culture_values SET icon = 'eco'                WHERE name = 'Sustentabilidad';
UPDATE public.company_culture_values SET icon = 'support_agent'      WHERE name = 'Customer-centric';
UPDATE public.company_culture_values SET icon = 'handshake'          WHERE name = 'Transparencia';
UPDATE public.company_culture_values SET icon = 'star' WHERE icon IS NULL;

-- 2. company_benefits.icon (por nombre)
UPDATE public.company_benefits SET icon = 'monetization_on'    WHERE name = 'Bonos por desempeño';
UPDATE public.company_benefits SET icon = 'trending_up'        WHERE name = 'Stock options / Equity';
UPDATE public.company_benefits SET icon = 'redeem'             WHERE name = 'Bono de bienvenida';
UPDATE public.company_benefits SET icon = 'card_giftcard'      WHERE name = 'Bono anual/aguinaldo';
UPDATE public.company_benefits SET icon = 'paid'               WHERE name = 'Incrementos frecuentes';
UPDATE public.company_benefits SET icon = 'medical_services'   WHERE name = 'Seguro médico privado';
UPDATE public.company_benefits SET icon = 'dentistry'          WHERE name = 'Seguro dental';
UPDATE public.company_benefits SET icon = 'shield'             WHERE name = 'Seguro de vida';
UPDATE public.company_benefits SET icon = 'psychology'         WHERE name = 'Apoyo salud mental';
UPDATE public.company_benefits SET icon = 'fitness_center'     WHERE name = 'Gimnasio / Wellness';
UPDATE public.company_benefits SET icon = 'self_improvement'   WHERE name = 'Días de salud mental';
UPDATE public.company_benefits SET icon = 'beach_access'       WHERE name = 'Vacaciones sobre lo legal';
UPDATE public.company_benefits SET icon = 'cake'               WHERE name = 'Día libre en cumpleaños';
UPDATE public.company_benefits SET icon = 'schedule'           WHERE name = 'Flexibilidad horaria';
UPDATE public.company_benefits SET icon = 'weekend'            WHERE name = 'Viernes cortos';
UPDATE public.company_benefits SET icon = 'date_range'         WHERE name = 'Semana de 4 días';
UPDATE public.company_benefits SET icon = 'all_inclusive'      WHERE name = 'Unlimited PTO';
UPDATE public.company_benefits SET icon = 'family_restroom'    WHERE name = 'Licencias parentales extendidas';
UPDATE public.company_benefits SET icon = 'school'             WHERE name = 'Presupuesto para cursos';
UPDATE public.company_benefits SET icon = 'forum'              WHERE name = 'Conferencias pagadas';
UPDATE public.company_benefits SET icon = 'workspace_premium'  WHERE name = 'Certificaciones pagadas';
UPDATE public.company_benefits SET icon = 'supervisor_account' WHERE name = 'Programas de mentoring';
UPDATE public.company_benefits SET icon = 'route'              WHERE name = 'Career path claro';
UPDATE public.company_benefits SET icon = 'laptop_chromebook'  WHERE name = 'Laptop de última generación';
UPDATE public.company_benefits SET icon = 'desk'               WHERE name = 'Setup para home office';
UPDATE public.company_benefits SET icon = 'memory'             WHERE name = 'Upgrade de equipo regular';
UPDATE public.company_benefits SET icon = 'apps'               WHERE name = 'Software y herramientas pagadas';
UPDATE public.company_benefits SET icon = 'lunch_dining'       WHERE name = 'Snacks y bebidas gratis';
UPDATE public.company_benefits SET icon = 'restaurant'         WHERE name = 'Almuerzos subsidiados';
UPDATE public.company_benefits SET icon = 'coffee'             WHERE name = 'Coffee & breakfast';
UPDATE public.company_benefits SET icon = 'check_circle' WHERE icon IS NULL;

-- 3. tech_stack.abbreviation (nueva columna)
ALTER TABLE public.tech_stack ADD COLUMN IF NOT EXISTS abbreviation TEXT;

UPDATE public.tech_stack SET abbreviation = 'NO' WHERE name = 'Node.js';
UPDATE public.tech_stack SET abbreviation = 'PY' WHERE name = 'Python';
UPDATE public.tech_stack SET abbreviation = 'DJ' WHERE name = 'Django';
UPDATE public.tech_stack SET abbreviation = 'FA' WHERE name = 'FastAPI';
UPDATE public.tech_stack SET abbreviation = 'EX' WHERE name = 'Express';
UPDATE public.tech_stack SET abbreviation = 'NS' WHERE name = 'NestJS';
UPDATE public.tech_stack SET abbreviation = 'PP' WHERE name = 'PHP';
UPDATE public.tech_stack SET abbreviation = 'RR' WHERE name = 'Ruby on Rails';
UPDATE public.tech_stack SET abbreviation = 'JV' WHERE name = 'Java';
UPDATE public.tech_stack SET abbreviation = 'SP' WHERE name = 'Spring Boot';
UPDATE public.tech_stack SET abbreviation = 'GO' WHERE name = 'Go';
UPDATE public.tech_stack SET abbreviation = 'RS' WHERE name = 'Rust';
UPDATE public.tech_stack SET abbreviation = 'C#' WHERE name = 'C#';
UPDATE public.tech_stack SET abbreviation = 'NT' WHERE name = '.NET';
UPDATE public.tech_stack SET abbreviation = 'LV' WHERE name = 'Laravel';
UPDATE public.tech_stack SET abbreviation = 'GQ' WHERE name = 'GraphQL';
UPDATE public.tech_stack SET abbreviation = 'PG' WHERE name = 'PostgreSQL';
UPDATE public.tech_stack SET abbreviation = 'MY' WHERE name = 'MySQL';
UPDATE public.tech_stack SET abbreviation = 'MG' WHERE name = 'MongoDB';
UPDATE public.tech_stack SET abbreviation = 'RD' WHERE name = 'Redis';
UPDATE public.tech_stack SET abbreviation = 'TF' WHERE name = 'TensorFlow';
UPDATE public.tech_stack SET abbreviation = 'PT' WHERE name = 'PyTorch';
UPDATE public.tech_stack SET abbreviation = 'PD' WHERE name = 'Pandas';
UPDATE public.tech_stack SET abbreviation = 'AW' WHERE name = 'AWS';
UPDATE public.tech_stack SET abbreviation = 'GC' WHERE name = 'GCP';
UPDATE public.tech_stack SET abbreviation = 'AZ' WHERE name = 'Azure';
UPDATE public.tech_stack SET abbreviation = 'DK' WHERE name = 'Docker';
UPDATE public.tech_stack SET abbreviation = 'K8' WHERE name = 'Kubernetes';
UPDATE public.tech_stack SET abbreviation = 'TT' WHERE name = 'Terraform';
UPDATE public.tech_stack SET abbreviation = 'GA' WHERE name = 'GitHub Actions';
UPDATE public.tech_stack SET abbreviation = 'LX' WHERE name = 'Linux';
UPDATE public.tech_stack SET abbreviation = 'RE' WHERE name = 'React';
UPDATE public.tech_stack SET abbreviation = 'VU' WHERE name = 'Vue.js';
UPDATE public.tech_stack SET abbreviation = 'NG' WHERE name = 'Angular';
UPDATE public.tech_stack SET abbreviation = 'NX' WHERE name = 'Next.js';
UPDATE public.tech_stack SET abbreviation = 'TS' WHERE name = 'TypeScript';
UPDATE public.tech_stack SET abbreviation = 'JS' WHERE name = 'JavaScript';
UPDATE public.tech_stack SET abbreviation = 'HC' WHERE name = 'HTML/CSS';
UPDATE public.tech_stack SET abbreviation = 'TC' WHERE name = 'Tailwind CSS';
UPDATE public.tech_stack SET abbreviation = 'RN' WHERE name = 'React Native';
UPDATE public.tech_stack SET abbreviation = 'FL' WHERE name = 'Flutter';
UPDATE public.tech_stack SET abbreviation = 'SW' WHERE name = 'Swift';
UPDATE public.tech_stack SET abbreviation = 'KT' WHERE name = 'Kotlin';
UPDATE public.tech_stack SET abbreviation = 'FG' WHERE name = 'Figma';
UPDATE public.tech_stack SET abbreviation = 'NN' WHERE name = 'Notion';
UPDATE public.tech_stack SET abbreviation = 'JR' WHERE name = 'Jira';
