# 🧪 QA Checklist Talently — 2026-05-18

> Marca `[x]` si pasa, `[!]` si hay bug, `[~]` si funciona con observaciones.
> Espacio para notas al final de cada sección.

**Entorno de prueba**:
- [ ] `npm run dev` arranca sin errores
- [ ] Navegador: ______________ / Versión: ______________
- [ ] Resolución: ______________
- [ ] Usuario test candidato: ______________
- [ ] Usuario test empresa: ______________

---

## 🎨 1. Visuales globales

### 1.1 Light mode
- [ ] Colores y contrastes correctos en TODAS las vistas
- [ ] Sin elementos invisibles (texto blanco sobre blanco, etc.)
- [ ] Tipografía consistente (Inter por defecto, según `variables.css`)
- [ ] Iconos Material Symbols cargan (no se ven como texto plano)

### 1.2 Dark mode (toggle desde Settings)
- [ ] Switch funciona y aplica `[data-theme='dark']` al `<html>`
- [ ] Persiste tras refrescar la página
- [ ] **Sin colores hex/rgb hardcoded** que rompan dark (revisar especialmente):
  - [ ] Charts (BarChart, LineChart) — tooltips invertidos correctamente
  - [ ] Modales y drawers
  - [ ] Onboarding (chips, steps)
  - [ ] FiltersView (candidato y empresa)
  - [ ] Notificaciones
- [ ] Bordes y separadores visibles
- [ ] Texto secundario legible (>4.5:1 contraste)

### 1.3 Responsive
- [ ] **Mobile (375px)** — diseño principal, todo cabe
- [ ] **Tablet (768px)** — la app sigue centrada con `max-width: 480px`
- [ ] **Desktop (1280px)** — comportamiento aceptable (queda centrada con espacio a los lados)
- [ ] Sin scroll horizontal en ningún tamaño
- [ ] Touch targets ≥ 44×44px en mobile

**Notas:**
```


```

---

## 🚪 2. Auth (camino feliz)

### 2.1 Welcome / Landing
- [ ] `/` carga la WelcomeView con CTAs "Crear cuenta" / "Iniciar sesión"
- [ ] Links a `/terms`, `/privacy`, `/faq`, `/support` funcionan

### 2.2 Registro email/password
- [ ] `/register` muestra primero el selector de tipo (candidato/empresa)
- [ ] Tras seleccionar tipo, aparece el form (name, email, password)
- [ ] Crea la cuenta y redirige al onboarding correspondiente
- [ ] Tras registro, perfil queda con `user_type` correcto

### 2.3 Login email/password
- [ ] `/login` con credenciales válidas redirige a `/dashboard` y de ahí al área correspondiente
- [ ] Sesión persiste tras refrescar

### 2.4 Google OAuth
- [ ] Botón "Continuar con Google" en `/register` y `/login`
- [ ] Tras autenticar, redirige a `/auth/callback` y de ahí al área correcta
- [ ] Si es primera vez, redirige a onboarding; si ya existe, va al app

### 2.5 Recovery password
- [ ] `/recovery` envía email de recuperación
- [ ] El link del email lleva a `/new-password`
- [ ] Después de cambiar password, se puede hacer login con la nueva

### 2.6 Logout
- [ ] Botón logout limpia sesión y redirige a `/`
- [ ] Refrescar después de logout NO restaura la sesión

**Notas:**
```


```

---

## 🚫 3. Auth (camino NO feliz)

- [ ] Login con email inexistente → muestra "Credenciales incorrectas" (no leak)
- [ ] Login con password incorrecto → mismo mensaje genérico
- [ ] Registro con email ya usado → "Este email ya está registrado..."
- [ ] Password < 8 chars → "La contraseña debe tener al menos 8 caracteres"
- [ ] **Password sin mayúscula o sin número/símbolo** → "La contraseña debe incluir al menos una mayúscula y un número o símbolo" (validación nueva)
- [ ] Campos vacíos → "Completa todos los campos"
- [ ] Recovery con email inexistente → no leak (mismo mensaje que si existe)
- [ ] OAuth cancelado → vuelve sin romper, sin sesión

**Notas:**
```


```

---

## 📋 4. Onboarding candidato (12 pasos)

Recorrer desde `/onboarding/candidate`, validar cada paso:

- [ ] **Step 1**: TipoPerfil — chip activo correctamente
- [ ] **Step 2**: DatosPersonales — name, birthday, gender, country, city; back/next funciona
- [ ] **Step 3**: Modalidad — chips de Remoto/Híbrido/Presencial
- [ ] **Step 4**: CampoProfesional — fetch de `professional_areas`
- [ ] **Step 5**: Educación — niveles desde BD; agregar/editar/borrar
- [ ] **Step 6**: Experiencia — agregar/editar; sin años negativos
- [ ] **Step 7**: Disponibilidad — opciones de constants
- [ ] **Step 8**: Habilidades — fetch de skills por área seleccionada en Step 4
- [ ] **Step 9**: Idiomas — multi-select con nivel
- [ ] **Step 10**: Multimedia — upload de avatar (max 5MB) y video opcional
  - [ ] Tipo no permitido → muestra error
  - [ ] Tamaño excedido → muestra error
- [ ] **Step 11**: Intereses — fetch de `interests`
- [ ] **Step 12**: Final — confirmación + redirige a `/app`

### Camino NO feliz onboarding candidato
- [ ] Saltar campos obligatorios → bloqueado
- [ ] Recargar a mitad → se conserva progreso en `useApp()` o BD
- [ ] Back desde step 1 → no rompe nav

**Notas:**
```


```

---

## 🏢 5. Onboarding empresa (12 pasos)

Recorrer desde `/onboarding/company`:

- [ ] **Step 1**: TipoPerfil empresa
- [ ] **Step 2**: InfoBasica — name, sector (fetch), país, ciudad
- [ ] **Step 3**: Detalles — tamaño, etapa, descripción (max chars?)
- [ ] **Step 4**: Cultura — chips con **iconos desde BD** (verificar que aparecen 16 valores con icon correcto, no `?` ni "star" en todos)
  - [ ] Máximo 5 valores
  - [ ] Counter "Seleccionados: X" actualiza
- [ ] **Step 5**: EtapaTamano
- [ ] **Step 6**: ModalidadesBeneficios — fetch de `company_benefits` (debe traer iconos)
- [ ] **Step 7**: Posiciones/Seniority — **iconos desde BD** en posiciones; **years_range desde BD** en seniority (verificar visualmente):
  - [ ] "Desarrollo" → icono `code`
  - [ ] "Diseño UX/UI" → `design_services`
  - [ ] "DevOps" → `cloud`
  - [ ] Seniority "Junior" → "1-3 años"
  - [ ] Seniority "Senior" → "5-8 años"
- [ ] **Step 8**: Stack — abreviaturas correctas:
  - [ ] React → "RE"
  - [ ] Node.js → "NO"
  - [ ] TypeScript → "TS"
  - [ ] PostgreSQL → "PG"
  - [ ] Agregar tech custom con input → aparece chip con abreviatura de 2 letras (fallback)
- [ ] **Step 9**: ProcesoSeleccion
- [ ] **Step 10**: Unicidad
- [ ] **Step 11**: Tags
- [ ] **Step 12**: Multimedia — logo + banner + gallery
- [ ] Al final redirige a `/company/profile-created` y luego `/company/dashboard`

**Notas:**
```


```

---

## 💚 6. Swipe (candidato)

`/app/swipe`:
- [ ] Carga perfiles de empresas (`db.profiles.getDiscovery('candidate')`)
- [ ] Solo trae perfiles del tipo opuesto
- [ ] **Excluye perfiles ya swipeados** (verificar que no aparecen 2 veces)
- [ ] Swipe derecha → registra en `swipes`
- [ ] Swipe izquierda → idem
- [ ] Si hay match mutuo → aparece `<MatchModal />`
- [ ] Botones de like/dislike funcionan igual que swipe táctil
- [ ] Cuando se acaban los perfiles → empty state ("No hay más perfiles")
- [ ] **Sin email/birthday del otro user expuestos** en Network tab (verificar con DevTools que la response solo tiene PROFILE_PUBLIC_COLS)

### Camino NO feliz
- [ ] Sin conexión durante swipe → muestra error, no rompe
- [ ] Con 0 perfiles desde el inicio → empty state

**Notas:**
```


```

---

## 💼 7. Swipe (empresa)

`/company/swipe`:
- [ ] Carga candidatos
- [ ] Mismo flujo de swipe
- [ ] Match mutuo abre modal
- [ ] `CandidatePublicProfileView` (al click en candidato) usa `getPublicById` — verificar en Network que NO viene email/birthday

**Notas:**
```


```

---

## 🎉 8. Match flow

- [ ] Al hacer match mutuo, ambos usuarios reciben notificación
- [ ] `<MatchModal />` muestra ambos avatares
- [ ] CTA "Enviar mensaje" lleva a `/app/messages/:matchId`
- [ ] CTA "Seguir explorando" cierra modal
- [ ] Match aparece en lista de matches

**Notas:**
```


```

---

## 💬 9. Mensajes

### 9.1 Lista (`/app/messages`)
- [ ] Muestra todas las conversaciones
- [ ] Avatares con `loading="lazy"` (verificar en DevTools → Elements)
- [ ] Búsqueda funciona
- [ ] EmptyState cuando no hay mensajes
- [ ] **Error UI**: si la query falla (simular con DevTools → offline), aparece "Error al cargar" con icono

### 9.2 Chat individual (`/app/messages/:matchId`)
- [ ] Carga perfil del otro user (sin email/birthday — verificar Network)
- [ ] Historial de mensajes carga
- [ ] Enviar mensaje:
  - [ ] Aparece inmediatamente (optimistic update)
  - [ ] Se confirma o se revierte si falla
- [ ] **Realtime**: abrir 2 ventanas con mismo match, escribir en una, el mensaje aparece en la otra sin refresh
- [ ] Salir del chat → suscripción se limpia (`unsubscribe`)
- [ ] Stats `messages_sent` se incrementa (verificar en CompanyStats)

### 9.3 Validaciones de mensaje
- [ ] Mensaje vacío o solo espacios → no se envía
- [ ] Mensaje > 2000 chars → muestra error y no se envía
- [ ] Caracteres especiales/emojis funcionan
- [ ] Enter envía, Shift+Enter hace salto de línea

**Notas:**
```


```

---

## 👤 10. Perfil candidato

`/app/profile`:
- [ ] Carga todos los datos del usuario actual
- [ ] Editar campos y guardar persiste
- [ ] Upload de avatar funciona (max 5MB)
- [ ] CV upload funciona (PDF/DOCX, max 10MB)
- [ ] CV existente se descarga al click
- [ ] Avatar y video preview correctos

### 10.1 ProfileView pública (candidato visto por empresa)
- [ ] `/company/candidate/:profileId` muestra perfil del candidato
- [ ] **NO muestra email ni birthday** (verificar en DevTools Network tab)

**Notas:**
```


```

---

## 🏭 11. Perfil empresa

`/app/company/:companyUserId` (candidato viendo empresa):
- [ ] Carga datos de empresa con logo, banner, descripción, beneficios, cultura, tech stack
- [ ] **NO muestra `tax_id` ni coords** (verificar Network)
- [ ] Lista ofertas activas de esa empresa
- [ ] Botones de swipe funcionan desde esta vista

**Notas:**
```


```

---

## 🔍 12. Filtros

### 12.1 Filtros candidato (`/app/filters`)
- [ ] Carga con `fv__*` classnames bien estilados (verificar visualmente que no hay vista sin estilo)
- [ ] Modalidad, área, país, salario, etapa empresa
- [ ] "Aplicar filtros" persiste y filtra el swipe
- [ ] "Limpiar" resetea
- [ ] Counter de filtros activos en header

### 12.2 Filtros empresa (`/company/filters`)
- [ ] **Visualmente igual al de candidato** (parity fix #4)
- [ ] Modalidad, área, disponibilidad, seniority, país
- [ ] "Aplicar" filtra el swipe de empresa

**Notas:**
```


```

---

## 🏠 13. Dashboard empresa

`/company/dashboard`:
- [ ] KPIs cargan con valores reales (matches, vistas, ofertas activas)
- [ ] Tabs: Resumen / Ofertas / Stats
- [ ] **EmptyState cuando no hay ofertas todavía**
- [ ] Click en oferta → detalle
- [ ] Cambiar status oferta (active/paused/closed) funciona

**Notas:**
```


```

---

## 📊 14. Stats empresa

`/company/stats`:
- [ ] **BarChart** matches por oferta — tooltip se ve correcto en light y **dark** (no fondo blanco sobre blanco)
- [ ] **LineChart** actividad por período — gradiente y point border correctos en dark
- [ ] **FunnelChart** vistas → likes → matches
- [ ] Toggle Semana/Mes funciona
- [ ] Selector de oferta funciona
- [ ] Con 0 datos → labels placeholder y values en 0 (no crash)
- [ ] Navegación a stats y volver no rompe charts (cleanup `chart.destroy()`)

**Notas:**
```


```

---

## 📝 15. Crear / editar oferta

`/company/create-offer`:
- [ ] Wizard de 4 pasos: Basic / Stack / Conditions / Review
- [ ] **Step Stack**: chips con abreviaturas correctas (RE, NO, TS, etc.) — confirmar viene de BD
- [ ] **Step Conditions**: chips de beneficios con iconos desde BD (no todos `check_circle`)
- [ ] **Step Review**: preview correcto
- [ ] "Publicar" crea la oferta y redirige a dashboard
- [ ] Validaciones:
  - [ ] Title vacío → error
  - [ ] Title > 120 chars → error
  - [ ] Description vacía → error
  - [ ] Description > 5000 chars → error
- [ ] Cancelar a mitad → no guarda

**Notas:**
```


```

---

## 🔔 16. Notificaciones

`/app/notifications` y `/company/notifications`:
- [ ] Lista notificaciones agrupadas por fecha (Hoy / Ayer / Esta semana / Antes)
- [ ] Icono y color por tipo (match/message/offer/system)
- [ ] Click en notificación → marca como leída + navega
- [ ] "Leer todas" funciona
- [ ] EmptyState cuando no hay
- [ ] **Error UI con botón "Reintentar"**: simular offline, debe aparecer el error con retry
- [ ] Notificación de match aparece al hacer match mutuo

**Notas:**
```


```

---

## ⚙️ 17. Settings

### 17.1 Candidato (`/app/settings`)
- [ ] Toggle dark mode persiste tras refresh
- [ ] Toggles de notificaciones (matches/messages/views/email)
- [ ] Cambiar idioma (si está implementado)
- [ ] Link a "Eliminar cuenta" funciona

### 17.2 Empresa (`/company/settings`)
- [ ] Mismo set de toggles
- [ ] Datos de la empresa editables

### 17.3 Delete account
`/delete-account`:
- [ ] Confirmación doble antes de borrar
- [ ] Tras confirmar, llama a RPC `delete_account()` y hace logout
- [ ] Redirige a `/`
- [ ] El usuario ya no puede hacer login con esas credenciales
- [ ] Datos en `profiles`/`companies` borrados (CASCADE desde `auth.users`)

**Notas:**
```


```

---

## 📄 18. Páginas públicas

- [ ] `/terms` — texto se renderiza, scroll funciona
- [ ] `/privacy` — idem
- [ ] `/faq` — categorías y preguntas cargan desde BD (`faq_categories`, `faqs`)
- [ ] `/support` — formulario funciona; envía a `support_tickets`
  - [ ] Subject vacío → error
  - [ ] Subject > 200 chars → error
  - [ ] Message vacío → error
  - [ ] Message > 5000 chars → error

**Notas:**
```


```

---

## 🐛 19. Possible bug spots (basado en cambios recientes)

### 19.1 Race conditions
- [ ] **Logout rápido durante carga inicial** (Fix #7 AuthContext): hacer login → navegar a swipe → inmediatamente logout. No debe haber error de React "state update on unmounted"
- [ ] **Sin perfiles en swipe** (Fix #1 useSwipeProfiles): forzar 0 perfiles, no debe crashear

### 19.2 Errores silenciosos
- [ ] Stats fallan → no rompe envío de mensaje (Fix #6)
- [ ] Carga de matches en Chat falla → muestra "Usuario" fallback en lugar de quedar en blanco (Fix #2)

### 19.3 Privacidad
- [ ] **Verificar con DevTools → Network → JSON response**: cuando ves perfil de OTRO usuario (Chat, CompanyPublicProfileView, CandidatePublicProfileView, SwipeView), los siguientes campos NO deben aparecer:
  - [ ] `email`
  - [ ] `birthday` / `birth_date`
  - [ ] `latitude` / `longitude`
  - [ ] `notification_prefs`
- [ ] En tu propio perfil (ProfileView) sí deben aparecer (necesarios para editar)

### 19.4 Storage seguridad
- [ ] Intentar subir avatar/CV de OTRO usuario via DevTools (cambiar el path): debe fallar con RLS error (no permitido borrar/sobrescribir CV ajeno) — migración 009
- [ ] Subir CV con tipo no permitido (.exe, .zip) → debe rechazar
- [ ] Subir CV > 10MB → debe rechazar

### 19.5 Validaciones nuevas
- [ ] sendMessage con string solo de espacios → bloqueado
- [ ] sendMessage con 2001 chars → bloqueado
- [ ] offers.create con title de 121 chars → bloqueado
- [ ] support ticket sin subject → bloqueado

### 19.6 Dark mode en cambios visuales nuevos
- [ ] BarChart tooltip → fondo claro con texto oscuro en dark
- [ ] LineChart point border → no se ve blanco sobre blanco en dark
- [ ] Step4 cultura — chips se ven en dark
- [ ] Step7 posiciones — iconos visibles en dark

### 19.7 RLS y dedupe (migración 011)
- [ ] Login → puedes ver tus propios matches/mensajes/notifs
- [ ] NO puedes ver matches de otro usuario (intenta con SQL directo si tienes acceso)
- [ ] Reference data carga sin issue (la dedupe no debe haber roto queries públicas)

**Notas:**
```


```

---

## ⚡ 20. Performance y UX

- [ ] **First load**: tiempo razonable (< 3s en conexión normal)
- [ ] Skeleton/Spinner en TODA vista que carga datos asíncronos
- [ ] EmptyState en cada lista que puede tener 0 items
- [ ] Imágenes con `loading="lazy"` (matches, messages)
- [ ] Sin requests duplicados a la misma tabla en una sola pantalla (Network tab)
- [ ] Navegar entre vistas no recarga datos ya cacheados de referenceData

**Notas:**
```


```

---

## 🌐 21. Edge cases

- [ ] Sesión expirada mientras navegas → redirige a login
- [ ] Token refresh transparente (no debe interrumpir)
- [ ] Conexión inestable: loaders y reintentos visibles
- [ ] Permisos de geolocalización denegados (si la app pide) — sigue funcionando sin coords
- [ ] Cuenta con onboarding incompleto → redirige al step donde quedó
- [ ] Usuario con onboarding completo + datos nuevos en BD (reference data cambió) → no rompe

**Notas:**
```


```

---

## 📋 Resumen final

- Total checks: **~200**
- Pasaron: ____
- Bugs detectados: ____
- Observaciones: ____

### Bugs prioritarios encontrados
1. ____________
2. ____________
3. ____________

### Issues de UX
1. ____________
2. ____________

### Próximos pasos sugeridos
- ____________
