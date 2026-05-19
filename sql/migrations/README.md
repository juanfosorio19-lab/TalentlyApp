# Talently — Migraciones SQL

## Estado de migraciones en Supabase (actualizar manualmente)

| Archivo | Descripción | Aplicado en Supabase |
|---------|-------------|----------------------|
| 001_reference_tables.sql | Países, ciudades, áreas, skills, idiomas | ✅ Sí |
| 002_filter_tables.sql | Modalidades, educación, experiencia | ✅ Sí |
| 003_company_tables.sql | Tabla companies + 7 tablas satélite | ✅ Sí |
| 004_company_reference_tables.sql | Catálogos de empresa | ✅ Sí |
| 005_user_statistics.sql | Métricas de usuario + función increment_stat | ✅ Sí |
| 006_profile_columns.sql | Columnas adicionales de profiles | ✅ Sí |
| 007_missing_tables.sql | interviews, job_types, support_tickets, user_settings | ✅ Sí |
| 008_faqs.sql | faq_categories y faqs | ✅ Sí |
| 009_secure_agent_tables_and_storage.sql | RLS en agent_memory/agent_user_context + storage policies path-based para documents y videos | ✅ Sí (2026-05-18) |
| 010_fix_permissive_insert_policies.sql | Drop policies permisivas en support_tickets y notifications | ✅ Sí (2026-05-18) |
| 011_dedupe_rls_policies.sql | Eliminar ~35 políticas RLS duplicadas en companies/matches/messages/offers/profiles/swipes/notifications/support_tickets y tablas de referencia | ✅ Sí (2026-05-18) |
| 012_company_positions_seniority_metadata.sql | Agregar columnas `icon` a company_positions y `years_range` a seniority_levels + populación | ✅ Sí (2026-05-18) |
| 013_culture_benefits_tech_metadata.sql | Popular `icon` en company_culture_values y company_benefits + nueva columna `abbreviation` en tech_stack | ✅ Sí (2026-05-18) |
| 014_normalize_modality_values.sql | Normalizar `modality`/`work_modality`/`work_model` a 'Remoto'/'Híbrido'/'Presencial' (sin i18n por ahora) | ✅ Sí (2026-05-18) |

## Cómo aplicar una migración nueva
1. Ejecutar el script en Supabase SQL Editor (app.supabase.com > SQL Editor)
2. Marcar como ✅ en esta tabla
3. Hacer commit con mensaje: `sql: apply migration 00X_nombre`

## Reglas
- Cada script debe ser idempotente (usar IF NOT EXISTS, ON CONFLICT DO NOTHING)
- Nunca modificar migraciones ya aplicadas — siempre crear una nueva
- Numeración continua: siguiente sería 015_...

## Archivos legacy (eliminados del directorio sql/)
Los siguientes archivos fueron consolidados en las migraciones numeradas:
- `create_companies_table.sql` → incluido en 003
- `create_company_reference_tables.sql` → incluido en 004
- `create_company_relational_tables.sql` → incluido en 003
- `update_companies_table.sql` → incluido en 003
- `verify_profiles_structure.sql` → incluido en 006
