# Pendientes — Talently

Registro vivo de todo lo que queda pendiente. **Regla**: cada vez que algo se
posterga en una sesión, se anota aquí con fecha y qué lo bloquea; al retomarlo
se marca y se mueve a "Resueltos". (Pedido del dueño, 2026-06-11.)

## Abiertos

| # | Pendiente | Bloqueado por | Desde | Referencia |
|---|---|---|---|---|
| 1 | 🔐 **Google OAuth en el APK**: agregar `com.talently.app://auth/callback` en Supabase Dashboard → Authentication → URL Configuration → Redirect URLs. Es lo ÚNICO que falta; el código está listo. | Acceso del dueño al Dashboard (no existe tool MCP de auth config) | 2026-06-11 | `docs/MOBILE.md` §2 |
| 2 | ⚖️ **Reescribir Términos y Privacidad**: contienen datos inventados con riesgo legal — dirección falsa en Madrid (te sitúa bajo RGPD europeo), promesa de privacidad que la app no cumple (los perfiles de candidatos son visibles a empresas SIN swipe previo), región AWS errónea (dice us-east-1, es us-west-2), "auditorías periódicas" inexistentes, "planes de pago" inexistentes, recolección de teléfono que no ocurre, sin edad mínima ni jurisdicción ni razón social, fechas de 2024 inventadas, no menciona Google OAuth ni Supabase como encargado. | Datos del dueño: razón social, jurisdicción (¿Chile? Ley 21.719 vige 01-12-2026), email de contacto real; verificar dominio talently.app y buzones soporte@/legal@/privacidad@ | 2026-06-11 | Informe completo en la sesión del 2026-06-11 |
| 3 | 🧹 **Limpieza pre-release**: credenciales QA versionadas en git (`QaTest2026!` en docs/qa/) y ~13 cuentas de prueba en la BD (`*@talently-test.com`, `test@talently.com`, etc.). Rotar/borrar antes de salir a público. | Decisión de cuándo (no antes del QA final) | 2026-06-11 | `docs/qa/SEED.md` |
| 4 | 🔔 **Notificaciones de match fuera del deck**: al postular a una oferta o swipear desde un perfil público el match SE CREA, pero no se envían las notificaciones "¡Nuevo Match!" a ambos usuarios (el deck sí las envía). Extraer helper compartido. | — (mejora menor) | 2026-06-11 | commit `2994036` |
| 5 | ⚪ **AuthCallbackView** navega directo a `/app/swipe`/`/company/dashboard` sin chequear onboarding → redirect doble (OnboardingGate lo atrapa). Navegar a `/dashboard` (RoleRedirect). | — (cosmético) | 2026-06-10 | QA report 2026-06-10, hallazgo ⚪ #10 |
| 6 | 🎨 **Iconos y splash** del APK siguen siendo los genéricos de Capacitor. | Assets del dueño (logo en alta) | 2026-06-11 | `docs/MOBILE.md` §3 |
| 7 | 📦 **Release firmado para Google Play**: crear keystore de release + generar AAB firmado. | Decisión de publicar + keystore del dueño | 2026-06-11 | `docs/MOBILE.md` §4 |
| 8 | 🤖 **Google Sign-In nativo (One Tap)**: solo si se quiere mejorar el flujo OAuth actual (in-app browser). Requiere OAuth client Android + SHA-1 en Google Cloud Console. | Opcional — decidir si vale la pena | 2026-06-11 | `docs/MOBILE.md` §2.2 |

## Resueltos

| Pendiente | Resuelto | Commit/OTA |
|---|---|---|
| Áreas profesionales invisibles para empresas | 2026-06-11 | `91cc11b` |
| `key={index}` en listas editables del onboarding | 2026-06-11 | `91cc11b` |
| Botón "Explorar" fantasma en Matches | 2026-06-11 | `650307f` |
| Ajustes del candidato inaccesible (ruta fantasma) → soporte/FAQ/eliminar cuenta sin entrada | 2026-06-11 | `cff00d1` |
| Login desbordaba la pantalla (scroll + espacio en blanco) | 2026-06-11 | `2be51d9` |
| Hallazgos 🔴/🟠 del QA audit (tickets de soporte, postulación, swipes, CV, matches mudos) | 2026-06-11 | `2994036` |
