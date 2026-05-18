# 📋 Talently — Error Log (Aprendizaje Continuo)

> Cada error encontrado y resuelto se documenta aquí para no repetirlo.

---

## Error #1 — Chart is not defined

- **ERROR:** `Chart is not defined`
- **SÍNTOMA:** `ReferenceError` al entrar a `companyStatsView`
- **CONTEXTO:** Vista de estadísticas de empresa
- **CAUSA RAÍZ:** CDN de Chart.js cargaba después de que el código intentaba usarlo
- **SOLUCIÓN APLICADA:** Importar Chart.js como módulo npm con `import`, no CDN
- **PATRÓN A EVITAR:** Nunca usar CDN para librerías que se instancian en JS. Siempre npm.

---

## Error #2 — Dark mode no aplica en modales nuevos

- **ERROR:** Dark mode no aplica en modales nuevos
- **SÍNTOMA:** Bordes y fondos claros en Drawers en modo oscuro
- **CONTEXTO:** Modales / Drawers generados con Stitch u otros componentes nuevos
- **CAUSA RAÍZ:** Colores hardcodeados (`#ffffff`, `border: 1px solid #e2e8f0`) en lugar de variables CSS
- **SOLUCIÓN APLICADA:** Reemplazar todos los colores hardcodeados por `var(--bg)`, `var(--surface)`, `var(--border)`
- **PATRÓN A EVITAR:** Nunca escribir colores hex directamente en componentes. Solo variables CSS.

---

## Error #3 — Canvas reutilizado en Chart.js

- **ERROR:** Canvas reutilizado en Chart.js
- **SÍNTOMA:** Error `"Canvas is already in use"` al navegar de vuelta a la vista de stats
- **CONTEXTO:** Componente de gráficas con `<canvas>`
- **CAUSA RAÍZ:** La instancia de Chart no se destruye al desmontar el componente
- **SOLUCIÓN APLICADA:** Llamar `chart.destroy()` en el `return` del `useEffect`
- **PATRÓN A EVITAR:** Cualquier instancia imperativa (Chart, mapas, players) debe destruirse en el cleanup de `useEffect`.

---

## Error #4 — Estado global obsoleto entre sesiones

- **ERROR:** Estado global obsoleto entre sesiones
- **SÍNTOMA:** Matches con IDs incorrectos tras recarga
- **CONTEXTO:** Sistema de matching / `localStorage.talently_matches`
- **CAUSA RAÍZ:** `localStorage.talently_matches` guardaba cache sin invalidación
- **SOLUCIÓN APLICADA:** Versionar el cache (`v=56`) y limpiar en cada versión nueva. En React, no cachear matches en localStorage — usar Supabase como fuente de verdad.
- **PATRÓN A EVITAR:** Nunca usar localStorage como fuente de verdad para datos relacionales. Solo para preferencias de UI.

---

## Error #5 — Placeholder views sin lógica real

- **ERROR:** Vistas auth (Welcome, Login) solo renderizan un placeholder genérico
- **SÍNTOMA:** Al navegar a `/` o `/login` se muestra "TODO: Vista Welcome" sin funcionalidad
- **CONTEXTO:** Migración de vistas auth de Vanilla JS a React
- **CAUSA RAÍZ:** Las vistas se crearon como stubs con `ViewPlaceholder` y nunca se implementaron
- **SOLUCIÓN APLICADA:** Reemplazar con componentes reales: `WelcomeView` (logo + CTAs), `LoginView` (form + `supabase.auth.signInWithPassword` + dispatch `SET_USER` + redirect por `profileType`)
- **PATRÓN A EVITAR:** No dejar stubs indefinidamente. Cada vista stub debe tener un TODO con fecha límite.

---

## Error #6 — Hook de auth duplicado (AuthContext vs useAuthListener)

- **ERROR:** Dos listeners de `onAuthStateChange` compitiendo
- **SÍNTOMA:** Dispatch duplicados de `SET_USER` / `SET_PROFILE` al hacer login; posible race condition
- **CONTEXTO:** `AuthContext.jsx` ya tiene `onAuthStateChange` + `useAuth()`. Se creó `useAuthListener.js` para sincronizar con `AppContext`.
- **CAUSA RAÍZ:** Migración incremental: el AuthContext escucha auth y expone `useAuth()`, pero `AppContext` necesita la misma info vía `dispatch`. Ambos escuchan el mismo evento.
- **SOLUCIÓN APLICADA:** `useAuthListener` creado como hook dedicado para `AppContext`. Nombrado `useAuthListener` (no `useAuth`) para evitar conflicto con `AuthContext.useAuth()`. Integrar gradualmente y eventualmente unificar en un solo listener.
- **PATRÓN A EVITAR:** Nunca tener dos suscripciones a `onAuthStateChange` que disparen la misma lógica. Centralizar en un solo punto de escucha.

---

## Error #7 — Pasos fantasma inflando el contador de onboarding

- **ERROR:** El onboarding muestra "Paso X de 16" pero solo 12 pasos son funcionales
- **SÍNTOMA:** 4 pasos (5, 7, 10, 13 originales) muestran avisos de redirección y un botón "Continuar" sin validación
- **CONTEXTO:** Onboarding candidato con 16 divs en `index.html` original
- **CAUSA RAÍZ:** Un rediseño movió contenido (experiencia→paso 8, salario→paso 2, área→paso 4, educación→paso 6) pero los divs originales quedaron como residuos con avisos "ya se completó en paso X"
- **SOLUCIÓN APLICADA:** En la migración React se eliminaron completamente los 4 pasos fantasma. El nuevo flujo tiene exactamente 12 steps renumerados del 1 al 12.
- **PATRÓN A EVITAR:** Al reorganizar pasos de un wizard, eliminar los divs/componentes originales. No dejar residuos con mensajes de redirección.

---

## Error #8 — Pasos fantasma en onboarding empresa (companyStep9, companyStep11)

- **ERROR:** Onboarding empresa tiene 2 pasos con `display: none` y bypass hardcodeado
- **SÍNTOMA:** `nextCompanyStep(10)` y `nextCompanyStep(12)` en los onclick de paso 8 y 10 respectivamente, saltando pasos 9 y 11
- **CONTEXTO:** Onboarding empresa con divs `companyStep9` (Seniority) y `companyStep11` (Beneficios)
- **CAUSA RAÍZ:** Seniority fue absorbido por el Paso 8 (Posiciones). Beneficios fueron consolidados en Paso 7 (Modalidades). Los divs originales quedaron con `display: none` y comentarios `(SKIPPED)`.
- **SOLUCIÓN APLICADA:** En la migración React: Paso 7 consolida Posiciones + Seniority. Paso 6 consolida Modalidades + Beneficios. No existen Step9_legacy ni Step11_legacy.
- **PATRÓN A EVITAR:** Nunca usar `display: none` + bypass de `onclick` para "eliminar" pasos. Eliminar el div/componente y renumerar.

---

<!-- AGREGAR NUEVOS ERRORES DEBAJO DE ESTA LÍNEA -->

## Error #12 — RPC `delete_account` no existe en Supabase

- **ERROR:** `supabase.rpc('delete_account')` retorna error porque la función no está creada
- **SÍNTOMA:** Al intentar eliminar cuenta en `DeleteAccountView`, el RPC falla con `function delete_account does not exist`
- **CONTEXTO:** `src/views/public/DeleteAccountView.jsx` — flujo de eliminación de cuenta
- **CAUSA RAÍZ:** La función PostgreSQL `delete_account` no fue incluida en el schema inicial del proyecto
- **SOLUCIÓN APLICADA:** `DeleteAccountView` captura el error del RPC, hace `signOut()` de todas formas, y muestra un estado alternativo con instrucciones para contactar `soporte@talently.app`
- **PATRÓN A EVITAR:** Antes de usar `supabase.rpc('nombre_funcion')`, verificar que la función existe en Supabase → Database → Functions. SQL para crear la función cuando esté lista:
  ```sql
  CREATE OR REPLACE FUNCTION delete_account()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  BEGIN
    DELETE FROM profiles WHERE user_id = auth.uid();
    DELETE FROM auth.users WHERE id = auth.uid();
  END;
  $$;
  ```

## Error #11 — Query cruda en OfferDetailsView en lugar de db.*

- **ERROR:** `supabase.from('offers')` usado directamente en `OfferDetailsView.jsx`
- **SÍNTOMA:** Funciona, pero rompe el patrón `db.*` del proyecto
- **CONTEXTO:** `src/views/candidate/OfferDetailsView.jsx` — query en línea al montar
- **CAUSA RAÍZ:** La vista fue implementada antes de que `db.offers.getById()` existiera en `supabase.js`
- **SOLUCIÓN APLICADA:** Migrar a `db.offers.getById(offerId)` con join a companies via `select('*, companies(...)')`. El componente ahora extrae `offerData.companies` en lugar de hacer un segundo fetch.
- **PATRÓN A EVITAR:** Nunca usar `supabase.from()` directamente en vistas/hooks. Toda query va en `src/lib/supabase.js` bajo `db.*`. Si el método no existe, agregarlo primero.

---

## Error #10 — Tabla notifications no existe en Supabase

- **ERROR:** Tabla `notifications` no existe en Supabase
- **SÍNTOMA:** `NotificationsView` no puede mostrar notificaciones reales
- **CONTEXTO:** `NotificationsView.jsx` y `CompanyNotificationsView.jsx` intentarían consultar `from('notifications')`
- **CAUSA RAÍZ:** La tabla no fue incluida en el schema inicial del proyecto
- **SOLUCIÓN APLICADA:** Implementar vistas como placeholder con diseño real (ícono + mensaje + botón Volver) en lugar del placeholder genérico
- **PATRÓN A EVITAR:** Verificar existencia de tablas en Supabase antes de implementar vistas que las consumen. SQL para crear la tabla cuando esté lista:
  ```sql
  CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "users_own_notifications" ON notifications FOR ALL USING (user_id = auth.uid());
  ```

## Error #9 — Google OAuth redirect no llega a la app

- **ERROR:** Google OAuth redirect no llega a la app
- **SÍNTOMA:** Pantalla en blanco o redirect a `/` después de autenticar con Google
- **CONTEXTO:** Flujo de login/registro con Google OAuth via Supabase
- **CAUSA RAÍZ:** Ruta `/auth/callback` no registrada en App.jsx o URL incorrecta en Supabase Dashboard
- **SOLUCIÓN APLICADA:** Registrar `<Route path="/auth/callback" element={<AuthCallbackView />} />` fuera de `<PrivateRoute>`. Verificar que la Redirect URL en Supabase Dashboard → Authentication → URL Configuration coincide con `window.location.origin + '/auth/callback'`
- **PATRÓN A EVITAR:** Nunca hardcodear la `redirectTo` URL. Usar `window.location.origin` para que funcione tanto en desarrollo (`localhost:5173`) como en producción.
