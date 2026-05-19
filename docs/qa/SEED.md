# QA Seed — Datos de prueba para qa-e2e

El agente `qa-e2e` puede ejecutar 4 de 8 suites sin auth (welcome, validaciones, dark, responsive). Para correr las 4 restantes (onboarding, swipe, mensajes, crear oferta) necesita **2 cuentas con datos relacionales**.

Este doc explica cómo poblar Supabase en 5 minutos.

## Datos que se crean

| Tabla | Filas | Descripción |
|---|---|---|
| `auth.users` | 2 | candidato + empresa (manual, desde dashboard) |
| `profiles` | 2 | onboarding completo para ambos |
| `companies` | 1 | tabla satélite del empresa |
| `offers` | 1 | oferta activa "Senior Frontend Engineer (Remote)" |
| `swipes` | 2 | right mutuo entre los dos users |
| `matches` | 1 | match generado de los swipes |
| `messages` | 5 | conversación histórica de 3 días |
| `notifications` | 4 | match + mensaje para ambos |
| `user_statistics` | 2 | métricas iniciales para que el dashboard tenga qué mostrar |

## Paso 1 — Crear los 2 usuarios manualmente

Los inserts directos a `auth.users` son complicados (passwords hasheados, triggers, columnas internas). Lo más limpio es crearlos desde el dashboard de Supabase.

1. Abrir [Supabase Dashboard → Authentication → Users](https://supabase.com/dashboard/project/femlqgaqqmkeqtjeruqn/auth/users)
2. Click **Add user → Create new user**
3. Crear el **candidato**:
   - Email: `qa-candidato@talently-test.com`
   - Password: `QaTest2026!`
   - **Auto Confirm User**: ✅ (para saltar verificación de email)
4. **Anotar el UUID** que se genera (columna "User UID"). Ejemplo: `97eb8d41-2a11-47a1-af81-787bd588ed30`.
5. Repetir para la **empresa**:
   - Email: `qa-empresa@talently-test.com`
   - Password: `QaTest2026!`
   - Auto Confirm: ✅
6. Anotar también el UUID de la empresa.

## Paso 2 — Reemplazar UUIDs en el seed SQL

Editar `sql/seed/qa_seed.sql` y reemplazar las primeras dos líneas:

```sql
\set candidate_id  '<UUID-DEL-CANDIDATO>'
\set company_id    '<UUID-DE-LA-EMPRESA>'
```

Si tu cliente SQL no soporta `\set` (ej. Supabase SQL Editor web), reemplazá manualmente todos los `:candidate_id` y `:company_id` por los UUIDs.

> **Tip**: si vas a correr el SQL desde el editor web, podés convertir el archivo a una versión inline con búsqueda y reemplazo (Ctrl+H): reemplazá `:'candidate_id'` por `'<UUID>'` (con comillas) y lo mismo con `:'company_id'`.

## Paso 3 — Ejecutar el seed

Tres opciones:

### A. Via Supabase MCP (recomendado, automático)

Desde Claude Code, pide: `aplica el seed de QA con candidate=<UUID> y company=<UUID>`. El agente puede usar `execute_sql` para correrlo en una transacción.

### B. Via dashboard SQL Editor

1. [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard/project/femlqgaqqmkeqtjeruqn/sql/new)
2. Pegar el contenido de `sql/seed/qa_seed.sql` (con UUIDs reemplazados)
3. Click "Run"
4. Verificar que el SELECT final retorna 8 filas con counts > 0

### C. Via psql local

```bash
psql "postgresql://postgres:<password>@db.femlqgaqqmkeqtjeruqn.supabase.co:5432/postgres" \
  -v candidate_id="'<UUID>'" \
  -v company_id="'<UUID>'" \
  -f sql/seed/qa_seed.sql
```

## Paso 4 — Correr qa-e2e completo

Con los datos en BD y el dev server arriba:

```
corre qa-e2e
```

El agente ahora puede:
- Login como `qa-candidato@talently-test.com` / `QaTest2026!`
- Navegar `/app/swipe` y ver perfiles disponibles
- Login como `qa-empresa@talently-test.com` y probar create-offer
- Verificar el match existente y los mensajes históricos

## Limpieza después de QA

Si querés borrar todos los datos del seed:

1. Ejecutar `sql/seed/qa_seed_cleanup.sql` (mismo proceso que el seed)
2. Borrar los 2 users desde Dashboard → Authentication → Users → ⋮ → Delete user

Nota: el `cleanup.sql` solo borra las filas de `public.*`. Los users de `auth.users` se borran desde el dashboard. CASCADE limpiará lo que reste.

## Idempotencia

Tanto `qa_seed.sql` como `qa_seed_cleanup.sql` son **idempotentes** — podés correrlos varias veces. El seed usa `ON CONFLICT DO UPDATE` o `DO NOTHING` para no duplicar.

## Seguridad

⚠️ **Estos UUIDs y passwords son públicos** (están versionados en git). Solo usar en el proyecto de DEV/QA, **nunca en producción**. Si vas a hacer demo a clientes, considerá rotar las credenciales o usar otros UUIDs.
