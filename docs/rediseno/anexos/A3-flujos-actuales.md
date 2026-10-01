# Anexo A3 · Flujos y navegación actuales

Rutas de `src/App.jsx`, guards, tab bars, onboarding actual campo por campo y flujos núcleo.

---

# Arquitectura de información y flujos actuales — Talently v2

Las rutas de archivo son relativas a `Talently_v2/src/` salvo que se indique otra cosa. Este es el estado del código a octubre de 2026. La BD está pausada, así que la parte de datos se reconstruyó desde `lib/supabase.js`, los hooks y `sql/migrations`.

## 0. Lo esencial en 8 puntos

1. **37 rutas declaradas**: 10 públicas, 1 hub de redirección, 2 de onboarding, 12 de candidato, 10 de empresa, 1 compartida y 1 comodín `*`.
   - 4 están **huérfanas** (sin entrada desde la UI).
   - 1 es una redirección inútil.
   - 8 son wrappers `*View` que no agregan nada.
2. **El match es usuario↔usuario, no oferta↔candidato.**
   - El candidato swipea **perfiles de empresa** y la empresa swipea perfiles de candidato.
   - Las ofertas no entran al deck.
   - La única pantalla con "Postularme ahora" (`/app/offer/:id`) no tiene ningún enlace válido.
3. **Cada rol tiene una navegación distinta.**
   - Candidato: 3 tabs (Explorar / Matches / Perfil).
   - Empresa: 5 tabs (Inicio / Ofertas / Explorar / Mensajes / Perfil), y su "Explorar" es otra pantalla, sin tab bar.
4. **El "volver" tiene 3 implementaciones y no hay manejador del botón atrás de Android.**
   - Las implementaciones son `navigate(-1)`, una ruta fija o un `setStep` interno.
   - Varias flechas mandan a una ruta fija y pierden la pestaña de origen.
5. **Hay 4 enlaces a rutas inexistentes.** Caen en `*` (WelcomeView), que redirige a `/dashboard` y deja al usuario en Inicio sin aviso. Es el "me devolvió al inicio" que reportó el dueño.
6. **Onboarding.**
   - Candidato: 12 pasos, 6 se pueden omitir. Empresa: 10 pasos.
   - Los pasos no viven en la URL.
   - Ambos escriben todo en `profiles`, una tabla única que mezcla columnas de candidato y empresa.
   - No hay "cerrar sesión" en ningún paso.
7. **`user_type` solo admite `'candidate' | 'company'`.** Tiene 4 fuentes de verdad y, si ninguna responde, se asume `'candidate'` sin avisar.
8. **Sesgo TI y textos mezclados en inglés** en el onboarding de empresa, en filtros, etiquetas y textos de pantalla.

---

## 1. Rutas (`App.jsx`)

### 1.1 Guards

| Guard | Archivo | Qué valida | Si falla |
|---|---|---|---|
| `PrivateRoute` | `components/PrivateRoute.jsx` | `authReady` (sesión + perfil ya resuelto) e `isAuthenticated` | Spinner mientras carga; sin sesión → `/login` |
| `RoleRedirect` (en `/dashboard`) | `components/RoleRedirect.jsx` | Tipo = `profile.user_type` → `user_metadata.user_type` → `'candidate'`; sin perfil u onboarding incompleto → wizard | Ver §5 |
| `OnboardingGate` | `components/OnboardingGate.jsx` | `profile.onboarding_completed` | → `/onboarding/{tipo}` |
| `RoleGate type=` | `components/RoleGate.jsx` | `userType === type` (usa `loading`, no `authReady`) | → `/dashboard`, que vuelve a decidir |

Anidamiento: `PrivateRoute > [ /dashboard, /onboarding/*, OnboardingGate > (RoleGate candidate | RoleGate company | /delete-account) ]`.

### 1.2 Tabla completa de rutas

| # | Path | Componente efectivo | Guard / rol | Entrada actual en la UI | Estado |
|---|---|---|---|---|---|
| 1 | `/` | `views/public/WelcomeView.jsx` | Pública. Con sesión → `/dashboard` | Arranque; comodín | Vivo. Usa el ícono Material `work_outline` en vez del logo oficial |
| 2 | `/login` | `LoginView.jsx` | Pública. Con sesión → `/dashboard` | Welcome, Register | Vivo |
| 3 | `/register` | `RegisterView.jsx` (2 sub-pasos internos: tipo → formulario) | Pública | Welcome, Login | Vivo. Muestra 3 puntos de progreso para 2 pasos (l.183-185) |
| 4 | `/recovery` | `RecoveryView.jsx` | Pública | Login | Vivo |
| 5 | `/new-password` | `NewPasswordView.jsx` | Pública | Correo de recuperación | Vivo |
| 6 | `/auth/callback` | `AuthCallbackView.jsx` | Pública | Retorno de OAuth en web. También, por error, el correo de "Cambiar contraseña" | Vivo |
| 7 | `/terms` | `TermsView.jsx` | Pública | Welcome, Register | Vivo. **No se enlaza desde Ajustes** |
| 8 | `/privacy` | `PrivacyView.jsx` | Pública | Welcome, Register, Ajustes | Vivo |
| 9 | `/faq` | `FAQView.jsx` | Pública | Ajustes, Soporte | Vivo. El texto dice "para el sector tecnológico" |
| 10 | `/support` | `SupportView.jsx` | Pública | Ajustes | Vivo |
| 11 | `/dashboard` | `RoleRedirect` | PrivateRoute | Login, Register, Welcome, rebotes de RoleGate | Hub sin UI |
| 12 | `/onboarding/candidate` | `views/onboarding/CandidateOnboarding.jsx` | PrivateRoute (sin OnboardingGate) | RoleRedirect, Register, Ajustes del candidato, flecha del paso 1 de empresa | Vivo |
| 13 | `/onboarding/company` | `CompanyOnboarding.jsx` | PrivateRoute | RoleRedirect, Register, paso 1 del candidato si elige "Empresa" | Vivo. El modo edición (`isEditing`) no tiene entrada en la UI |
| 14 | `/app` | `views/candidate/MainApp.jsx` (tabs en `?tab=`) | candidate | Home del candidato | Vivo |
| 15 | `/app/swipe` | `SwipeView.jsx` → `<Navigate to="/app">` | candidate | AuthCallbackView, fin del onboarding | **Redirección inútil** |
| 16 | `/app/matches` | `MatchesView.jsx` (independiente) | candidate | Ninguna (solo se usa como tab dentro de `/app`) | **Huérfana** |
| 17 | `/app/messages` | `MessagesListView.jsx` → `MessagesList` | candidate | Ninguna (no hay tab Mensajes) | **Huérfana** |
| 18 | `/app/messages/:matchId` | `MessagesChatView.jsx` → `Chat backPath="/app"` | candidate | Matches, MatchModal, notificación | Vivo |
| 19 | `/app/profile` | `ProfileView.jsx` (independiente, con header) | candidate | Ajustes → "Mi perfil" | **Duplica el tab Perfil** |
| 20 | `/app/filters` | `FiltersView.jsx` | candidate | Header de MainApp, Ajustes | Vivo |
| 21 | `/app/cv` | `CvView.jsx` | candidate | Perfil, Ajustes | Vivo |
| 22 | `/app/notifications` | `NotificationsView.jsx` | candidate | Campana | Vivo |
| 23 | `/app/settings` | `SettingsView.jsx` | candidate | Engranaje dentro de Perfil | Vivo |
| 24 | `/app/offer/:offerId` | `OfferDetailsView.jsx` | candidate | Ninguna válida (la notificación usa `/app/offers/`, en plural) | **Huérfana**. Es la única pantalla con "Postularme" |
| 25 | `/app/company/:companyUserId` | `CompanyPublicProfileView.jsx` | candidate | Tap en una tarjeta del deck | Vivo |
| 26 | `/company/dashboard` | `CompanyDashboardView` → `CompanyDashboard.jsx` (tabs en `?tab=`) | company | Home de la empresa | Vivo |
| 27 | `/company/create-offer` | `CreateOfferView` → `CreateOffer.jsx` | company | 5 entradas (CTA de Inicio, "Nueva" en Ofertas, estado vacío, Ajustes, profile-created) | Vivo |
| 28 | `/company/swipe` | `CompanySwipeView` → `CompanySwipe.jsx` | company | Tab "Explorar", que navega fuera del dashboard | Vivo. Sin tab bar y con estilos inline |
| 29 | `/company/filters` | `CompanyFiltersView.jsx` | company | Header de CompanySwipe | Vivo, pero **sus filtros no se aplican** |
| 30 | `/company/chat/:matchId` | `CompanyChatView` → `candidate/Chat backPath="/company/dashboard"` | company | Tab Mensajes, notificación | Vivo |
| 31 | `/company/stats` | `CompanyStatsView` → `CompanyStats.jsx` | company | Ninguna | **Huérfana**. `CompanyDashboard.jsx:7` la importa sin usarla |
| 32 | `/company/notifications` | `CompanyNotificationsView.jsx` | company | Campana | Vivo |
| 33 | `/company/settings` | `CompanySettingsView.jsx` | company | Engranaje del header | Vivo |
| 34 | `/company/profile-created` | `CompanyProfileCreatedView.jsx` | company | Fin del onboarding de empresa | Vivo. Muestra un badge "Cuenta verificada" falso |
| 35 | `/company/candidate/:profileId` | `CandidatePublicProfileView.jsx` | company | Tap en una tarjeta de CompanySwipe | Vivo |
| 36 | `/delete-account` | `public/DeleteAccountView.jsx` | Cualquier rol, con OnboardingGate | Ajustes (ambos roles) | Vivo. **No se puede usar durante el onboarding** |
| 37 | `*` | `WelcomeView` | — | Cualquier ruta inexistente | **Enmascara errores**: redirige a `/dashboard` |

### 1.3 Wrappers `*View` duplicados

| Wrapper | Envuelve | Qué agrega | Veredicto |
|---|---|---|---|
| `company/CompanyDashboardView.jsx` | `CompanyDashboard.jsx` | Nada | Eliminar |
| `company/CompanyStatsView.jsx` | `CompanyStats.jsx` | Nada | La ruta está huérfana |
| `company/CompanySwipeView.jsx` | `CompanySwipe.jsx` | Nada | Eliminar |
| `company/CreateOfferView.jsx` | `CreateOffer.jsx` | Nada | Eliminar |
| `candidate/MessagesListView.jsx` | `MessagesList basePath="/app/messages"` | Una prop | La ruta está huérfana |
| `candidate/MessagesChatView.jsx` | `Chat backPath="/app"` | Una prop (con un destino de vuelta malo) | — |
| `company/CompanyChatView.jsx` | `../candidate/Chat` | Una prop. La empresa importa una vista de la carpeta candidate | — |
| `candidate/SwipeView.jsx` | `<Navigate to="/app">` | Solo redirige | Eliminar |

Los componentes que sí se usan son `CompanyDashboard`, `CompanySwipe`, `CreateOffer`, `MessagesList` (solo en el tab Mensajes de empresa) y `Chat` (ambos roles). `MatchesView` y `ProfileView` funcionan en dos modos (`isTab` y página independiente).

### 1.4 Enlaces rotos

| Origen | Navega a | Debía ir a | Qué pasa |
|---|---|---|---|
| `views/candidate/NotificationsView.jsx:95` (tipo `offer`) | `/app/offers/:id` | `/app/offer/:id` | `*` → Welcome → `/dashboard` → `/app` |
| `views/candidate/Chat.jsx:197` (avatar del header, ambos roles) | `/app/profile/:id` | Candidato: `/app/company/:id`. Empresa: `/company/candidate/:id` | Vuelve a Inicio |
| `components/swipe/MatchModal.jsx:18` cuando lo usa la empresa (CompanySwipe reutiliza SwipeStack) | `/app/messages/:matchId` | `/company/chat/:matchId` | RoleGate rebota → Inicio de empresa. "Enviar mensaje" tras el match no abre el chat |
| `SettingsView.jsx:24` y `CompanySettingsView.jsx:24` ("Cambiar contraseña") | redirectTo `/auth/callback` | `/new-password` (como `RecoveryView.jsx:28`) | El enlace del correo inicia sesión y nunca pide la nueva clave. En el APK, además, `window.location.origin` es localhost |

### 1.5 Código muerto relacionado con navegación y datos

- `hooks/useAuthListener.js` nunca se monta (ver ERROR_LOG #6). Es el único lugar, aparte de AuthCallbackView, que lee `talently_pending_user_type`.
- `hooks/useDarkMode.js` y `components/ViewPlaceholder.jsx` no se usan.
- En `MainApp.jsx`, el `case 'messages'` es inalcanzable porque `TABS` no tiene Mensajes.
- Funciones de `lib/supabase.js` sin uso: `db.companies.*`, `offers.getAllActive`, `offers.delete`, `swipes.getInterestedCandidates`, `profiles.getCandidatesForExplore`.
- `state.companyFilters` se guarda en AppContext, pero `useSwipeProfiles` no lo aplica.
- Hay dos archivos de constantes, `lib/constants.js` y `data/constants.js`, con `AVAILABILITY_LABELS` incompatibles:
  - `lib/constants.js` usa `immediate`, `15_days`…
  - `data/constants.js` usa `open`, `open_to_offers`…
  - Resultado: `CandidatePublicProfileView` le muestra a la empresa el valor crudo `immediate`, en inglés.
- Hay choque de CSS global: `.cpv-company-name` y `.cpv-wrapper` están definidas en `CompanyPublicProfileView.css` y también en `CompanyProfileCreatedView.css`.

---

## 2. Navegación por rol

### 2.1 Candidato — `views/candidate/MainApp.jsx`

**Header fijo**
- Logo `TalentlyLogo` y el texto "Talently".
- Botón **filtros** (ícono Material `tune`, con un punto si hay filtros activos) → `/app/filters`.
- Botón **campana** (`IconBell`, badge "9+") → `/app/notifications`.
- Ambos botones se ven en las 3 pestañas, aunque los filtros solo afectan a Explorar.

**Tabs** (la pestaña vive en `?tab=`, con `replace:true`)

| Tab | Ícono | Contenido |
|---|---|---|
| Explorar (por defecto) | `IconMatches` | `SwipeStack` con perfiles de **empresa**. Tap → `/app/company/:id` |
| Matches | `IconHeart` | `MatchesView isTab`: carrusel de matches nuevos + lista → `/app/messages/:id`. **Hace de bandeja de chats** |
| Perfil | `IconPerson` | `ProfileView isTab`: secciones editables con modales. Su header tiene "Editar" y "Ajustes" (→ `/app/settings`) y abajo "Cerrar sesión" |

### 2.2 Empresa — `views/company/CompanyDashboard.jsx`

**Header**
- Muestra el logo y el nombre **de la empresa**, no la marca Talently.
- Campana → `/company/notifications`.
- Engranaje (`IconGear`) → `/company/settings`.
- Se ve en todas las pestañas.

**Tabs**

| Tab | Ícono | Contenido |
|---|---|---|
| Inicio | `IconHome` | Saludo; 3 métricas (ofertas activas, matches totales, "vistas de perfil"); CTA "Crear nueva oferta"; 3 ofertas activas con switch |
| Ofertas | `IconOffers` | Lista con switch activa/inactiva. **No se puede editar, borrar, ver el detalle ni ver postulantes** |
| Explorar | `IconExplore` | **No cambia de tab**: navega a `/company/swipe`, una pantalla completa sin tab bar |
| Mensajes | `IconChat` | `MessagesList` → `/company/chat/:id`. El buscador dice "Buscar candidatos o roles..." |
| Perfil | `IconPerson` | `components/profile/CompanyProfileSections.jsx`: hero, Sobre Nosotros, Valores, **Tech Stack (para todas las empresas)** y Beneficios. Reutiliza `CompanySettingsView.css` |

La métrica "Vistas de perfil" siempre vale 0: `profile_views` nunca se incrementa en ningún lugar del código. No hay tab Matches ni acceso a Estadísticas.

### 2.3 Comparación entre roles

| Aspecto | Candidato | Empresa |
|---|---|---|
| Número de tabs | 3 | 5 |
| Explorar | Tab interno, el primero | Ruta aparte sin tab bar, el tercero |
| Ícono de "Explorar" | `IconMatches` | `IconExplore` (mismo nombre, otro ícono) |
| Conversaciones | Dentro de Matches | Tab Mensajes |
| Lista de matches | Tab Matches | No existe |
| Marca en el header | Logo Talently | Logo de la empresa |
| Filtros | Ícono en el header global | Ícono en el header de `/company/swipe` |
| Ajustes | Engranaje dentro de Perfil | Engranaje en el header global |
| Cerrar sesión | En Perfil **y** en Ajustes | Solo en Ajustes |
| Ícono de tab | 24 px con píldora activa (estilos inline) | 22 px sin píldora |
| Prefijo CSS | `main-app__*` | `cd__*` |

### 2.4 Cómo se vuelve atrás

| Vista | Control | Implementación | Destino real | Problema |
|---|---|---|---|---|
| Chat (ambos roles) | Flecha | `navigate(backPath)` (`Chat.jsx:166`) | Candidato: `/app` (Explorar). Empresa: `/company/dashboard` (Inicio) | Pierde la pestaña de origen (Matches o Mensajes) y apila historial |
| `CompanySwipe` | Flecha | `navigate('/company/dashboard')` | Inicio | Igual que el chat |
| `SettingsView` (candidato) | Flecha | `navigate('/app')` | Explorar | El usuario venía de Perfil |
| `CompanySettingsView` | Flecha | `navigate(-1)` | Pantalla anterior | Correcto, pero distinto al del candidato |
| `FiltersView` (candidato) | **X "Cerrar"** | `navigate(-1)` | Anterior | Usa otro control que el de empresa |
| `CompanyFiltersView` | **Flecha "Volver"** | `navigate(-1)` | Anterior | — |
| Notificaciones, OfferDetails, perfiles públicos, CV, Términos, Privacidad, FAQ, Soporte, DeleteAccount | Flecha | `navigate(-1)` | Anterior | — |
| Perfiles públicos después de dar like o descartar | Automático | `navigate(-1)` | Deck | No muestra modal de match |
| `CreateOffer` | Flecha | Paso anterior; en el paso 1, `navigate(-1)` | — | Pasos en estado interno |
| Onboarding | Flecha | `goBack()` interno | — | Paso 1 del candidato sin flecha; paso 1 de empresa → `/onboarding/candidate`; **paso 12 del candidato sin flecha** |
| Register | Flecha | Paso 1 → `/`; paso 2 → `setStep(1)` | — | — |

**Botón atrás físico de Android**: el código no registra `App.addListener('backButton')`, así que Capacitor usa el historial del WebView. Consecuencias:

1. Los pasos internos no están en la URL: Register (tipo/formulario), los 12 y 10 pasos del onboarding y los 3 de CreateOffer. El atrás físico **sale del wizard completo**, y en CreateOffer se pierde el borrador.
2. Los modales (MatchModal, SectionEditModal, edición de perfil) no se cierran con atrás: la navegación ocurre por debajo de ellos.
3. Los tabs usan `replace:true`, así que atrás desde cualquier pestaña sale de `/app`. Si en el historial quedó `/`, Welcome redirige otra vez a `/dashboard` → `/app`. La app rebota y no se puede cerrar con el botón atrás.
4. Las flechas con ruta fija agregan entradas al historial: el atrás físico vuelve a la pantalla de la que el usuario "salió".
5. Los enlaces rotos caen en `*` → `/dashboard` → Inicio.

**Headers y botones atrás**: hay más de 15 variantes con nombres de clase propios (`nv__back`, `sv__back`, `od__back`, `cvv__back`, `fv__close`, `supp__back`, `dav__back`, `terms-back-btn`, `register-nav-btn`, `ob-back-btn`, `cpp-back-btn-plain`, `cpv-back-plain`, el estilo inline de CompanySwipe…). Hay **3 implementaciones de toggle**: `sv__toggle`, `csv__toggle` y `cd-switch`. En total son 33 archivos CSS, y `global.css` no tiene clases compartidas de botón, card o header.

---

## 3. Onboarding

### 3.1 Persistencia (común a ambos wizards)

- Cada paso hace `db.profiles.create()`, que es un **upsert en `profiles`** con todo el `formData` acumulado más `id = auth.uid` (`lib/supabase.js`). Los valores `''` en columnas numéricas o de fecha se convierten a `null`.
- El progreso se guarda en `onboarding_step` (candidato) o `company_onboarding_step` (empresa). Al terminar se marca `onboarding_completed=true`, columna que comparten ambos roles.
- Si el upsert falla, el paso no avanza y se muestra `saveError`.
- Los pasos son estado del hook, **no URL**.
- Al terminar: el candidato va a `/app/swipe` → `/app`; la empresa va a `/company/profile-created`.
- **No hay "Cerrar sesión" ni "Salir" en ningún paso** (no hay `signOut` en `views/onboarding`). Tampoco se puede llegar a `/delete-account`.
- El nombre que se ingresó al registrarse (`user_metadata.full_name`) **no se precarga**: el hook arma `formData = { user_type }`, así que el usuario lo vuelve a escribir.

### 3.2 Candidato — `CandidateOnboarding.jsx` + `hooks/useOnboardingCandidate.js` (12 pasos)

| Paso | Archivo | Título | Campos | Validación | Columnas que escribe |
|---|---|---|---|---|---|
| 1 | `Step1_TipoPerfil.jsx` | "¡Hola! 👋 ¿Quién eres?" | Tarjeta Candidato o Empresa | Obligatorio | `user_type`. Si elige Empresa, guarda `onboarding_step=1` y salta a `/onboarding/company`. Este paso se omite si el perfil o `user_metadata` ya dicen 'candidate' |
| 2 | `Step2_DatosPersonales.jsx` | "Información personal" | Nombre completo\*, Cargo actual/deseado, País (select `countries`), Ciudad (select `cities`, solo si hay datos), Pretensión salarial (miles es-CL) + moneda CLP/USD | Solo el nombre | `full_name`, `headline`, `country`, `city`, `salary_expectation`, `currency` |
| 3 | `Step3_Modalidad.jsx` | "¿Cómo prefieres trabajar?" | 1 tarjeta: Remoto, Híbrido o Presencial (`work_modalities`) | Obligatorio | `work_modality` (texto) |
| 4 | `Step4_CampoProfesional.jsx` | "Encuentra tu área." | Chips de `professional_areas` (selección múltiple) con buscador, agrupados por `category` | Al menos 1 | `professional_areas` (array de nombres) |
| 5 | `Step5_Educacion.jsx` | "¿Dónde estudiaste?" | Lista de entradas: Tipo (9 opciones), Título\*, Institución\*, Año de egreso | Se puede omitir | `education` (jsonb `{id, level, degree, institution, year}`) |
| 6 | `Step6_Experiencia.jsx` | "¿Cuál es tu experiencia?" | Empresa\*, Cargo\*, Inicio y Fin (mes), "Trabajo actualmente aquí" | Se puede omitir | `experience` (`{company, position, start, end\|'Actual', current, id}`) |
| 7 | `Step7_Disponibilidad.jsx` | "¿Cuándo puedes empezar?" | Opción única: Inmediata, 15 días, 1 mes, 2 meses o Negociable | Obligatorio | `availability` (`immediate`, `15_days`, `1_month`, `2_months`, `negotiable`) |
| 8 | `Step8_Habilidades.jsx` | "¿Cuáles son tus habilidades?" | Sugerencias de `skills` según las áreas elegidas + texto libre (Enter) | Se puede omitir, aunque el subtítulo dice "al menos una" | `skills` |
| 9 | `Step9_Idiomas.jsx` | "¿Qué idiomas manejas?" | Idioma (10 opciones) + nivel (Básico a Nativo) | Se puede omitir | `languages` (`{name, level}`) |
| 10 | `Step10_Multimedia.jsx` | "Dale cara a tu talento" | Foto (bucket `avatars`) y CV en PDF o DOCX de hasta 10 MB (bucket `documents`) | Se puede omitir | `avatar_url`, `cv_url` |
| 11 | `Step11_Intereses.jsx` | "¿Qué te apasiona fuera del trabajo?" | Chips de `interests` + texto libre. El botón dice "Siguiente paso" | Se puede omitir | `interests` |
| 12 | `Step12_Final.jsx` | "¡Tu perfil está listo!" | Resumen con el badge "Perfil al 100%" | — | `onboarding_completed=true`, `onboarding_step=12` |

En el paso 12 la barra de progreso y la flecha están ocultas (`CandidateOnboarding.jsx:80`).

### 3.3 Empresa — `CompanyOnboarding.jsx` + `hooks/useOnboardingCompany.js` (10 pasos)

Los archivos conservan una numeración vieja; el número real del paso es la key de `STEP_COMPONENTS`.

| Paso | Archivo | Título | Campos | Validación | Columnas |
|---|---|---|---|---|---|
| 1 | `Step2_InfoBasica.jsx` | "Cuéntanos sobre tu empresa" | Nombre\*, Sector\* (`company_sectors`), País\*, Ciudad\* (select por país), Sitio web, LinkedIn | Los 4 obligatorios; las URL deben empezar con https | `company_name`, `company_sector`, `country`, `city`, `website`, `linkedin_url` |
| 2 | `Step3_Detalles.jsx` | "Detalles de tu empresa" | Descripción\* (hasta 500), Tipo (B2B, B2C, B2B2C, Sin fines de lucro) | Descripción obligatoria | `company_description`, `company_type` |
| 3 | `Step4_Cultura.jsx` | "¿Qué valores definen a tu empresa?" | Chips de `company_culture_values` | Entre 1 y 5 | `culture_values` |
| 4 | `Step5_EtapaTamano.jsx` | "Etapa y tamaño" | Etapa\* (`company_stages`: Pre-seed, Seed, Serie A…, cada una con descripción) y Tamaño\* (`company_sizes`: 1-10 a 500+) | Ambos obligatorios | `company_stage`, `company_size` |
| 5 | `Step6_ModalidadesBeneficios.jsx` | "Modalidad y beneficios" | Modalidad única + beneficios en selección múltiple (`company_benefits`) | Opcional | `work_modalities` (`[x]`), `company_benefits` |
| 6 | `Step7_PosicionesSeniority.jsx` | "Necesidades de contratación" | Posiciones (`company_positions`: Desarrollo, Diseño UX/UI, Product Management, …, DevOps, QA/Testing, Security) con "seleccionar todo" + Seniority (Junior, Semi-senior, Senior, Lead) | Opcional | `company_positions`, `seniority_levels` |
| 7 | `Step9_ProcesoSeleccion.jsx` | "¿Qué debe esperar el candidato en tu proceso?" | Texto libre (hasta 500) | Opcional | `selection_process` |
| 8 | `Step10_Unicidad.jsx` | "¿Qué hace única a tu empresa?" | Texto libre (hasta 500) | Opcional | `company_uniqueness` |
| 9 | `Step11_Tags.jsx` | Tags | Hasta 10. Los sugeridos están en inglés (Fast-paced, Data-driven, SaaS, AI/ML, Open Source…) | Opcional | `company_tags` |
| 10 | `Step12_Multimedia.jsx` | Logo y fotos | Logo + hasta 5 fotos (bucket `images`, hasta 5 MB). Botón "Finalizar" | Opcional | `company_logo`, `company_photos`, `onboarding_completed=true`, `company_onboarding_step=10` |

`company_tech_stack` se carga en `formData` pero no se pregunta. Aun así, la sección "Tech Stack" aparece en el Perfil de **todas** las empresas. El banner no se pide. El comentario del container dice "11 pasos", pero son 10.

### 3.4 Problemas del onboarding

- **La selección de tipo existe dos veces**: en el paso 1 de Register y en el paso 1 del wizard de candidato.
  - Con email, `user_metadata` evita la segunda pregunta.
  - Con Google en el APK, el tipo que se eligió antes del OAuth (`talently_pending_user_type`) solo lo leen `AuthCallbackView` (web) y `useAuthListener` (código muerto). Por eso **en el APK siempre se vuelve a preguntar**.
- **El wizard de empresa depende del de candidato**: la flecha del paso 1 de empresa navega a `/onboarding/candidate`.
- **Sesgo TI**:
  - Ejemplos de los campos: "Desarrolladora Full Stack", "Google", "Frontend Developer", "Buscar áreas (ej: Product Manager)".
  - Posiciones y seniority pensados para TI; etapas de financiamiento de startup.
  - Tags en inglés.
  - Copy final del candidato: "oportunidades tecnológicas". Copy de empresa en Register: "talento tecnológico".
- **No existen pasos para los nuevos casos de uso**:
  - Tipo de jornada: part-time, turnos, por evento.
  - Horarios disponibles, comuna y radio de desplazamiento.
  - Licencias y certificaciones: licencia de conducir, OS-10, SEC.
  - Referencias, tarifa por hora o por servicio.
  - Un perfil de "persona que contrata", por ejemplo una familia que busca nana.
  - La oferta de clases particulares.
- El badge **"Perfil al 100%"** aparece aunque se hayan omitido 6 pasos.
- **"Completar / editar onboarding"** en Ajustes del candidato (`SettingsView.jsx:157`) abre el wizard en el paso 12 (el `onboarding_step` guardado). Ahí no hay flecha atrás, y el único botón vuelve a completar el onboarding y manda a `/app`. Es un callejón sin salida.
- El modo edición del wizard de empresa no tiene entrada en la UI.
- "Términos" y "Privacidad" en el paso 1 son `<span>` sin enlace (`Step1_TipoPerfil.jsx:105-107`).
- **Estilos distintos entre wizards**:
  - Candidato: `h1.ob-step-title` con palabras destacadas en color.
  - Empresa: `h2.ob-title`.
  - El paso 1 del candidato no tiene flecha; el de empresa siempre la tiene.

---

## 4. Flujos núcleo

### 4.1 Registro con email
1. `/` → "Regístrate" → `/register`.
2. Sub-paso 1: tarjetas "Soy Candidato" / "Soy Empresa" (o Google).
3. Sub-paso 2: nombre, email y contraseña (al menos 8 caracteres, 1 mayúscula y 1 número o símbolo).
   - Llama a `signUp` con `options.data = { user_type, full_name }`.
   - Guarda `talently_user_type` en localStorage.
4. `navigate(replace)` → `/onboarding/{tipo}`.

No hay pantalla de "revisa tu correo". Si Supabase exigiera confirmar el email, no habría sesión y `PrivateRoute` mandaría a `/login` sin explicar por qué.

### 4.2 Login con email
1. `/login` → `signInWithPassword`.
2. → `/dashboard`. `RoleRedirect` espera `authReady`: el perfil se carga de forma diferida, con un timeout de 8 s.
3. Destino según §5.

Solo el error "Invalid login credentials" está traducido; los demás se muestran tal como los entrega Supabase, en inglés.

### 4.3 Google
- **Web**:
  - `signInWithOAuth` redirige a `/auth/callback`.
  - `AuthCallbackView` resuelve el destino:
    - Con perfil: empresa → `/company/dashboard`; cualquier otro → `/app/swipe`. No revisa `onboarding_completed`; lo corrige después `OnboardingGate` (PENDIENTES #5).
    - Sin perfil: toma el tipo de `metadata` o de `pending` → `/onboarding/{tipo}`.
    - Sin tipo: `/onboarding/candidate`, paso 1.
- **APK**:
  - Se abre el navegador in-app y vuelve por el deep link `com.talently.app://auth/callback`.
  - `AuthContext` hace `exchangeCodeForSession` → `onAuthStateChange` → el `useEffect` de Login o Register → `/dashboard`.
  - El tipo queda en `'candidate'` por defecto.
  - La redirect URL todavía no está registrada en Supabase (PENDIENTES #1).
- Google desde Login crea una cuenta nueva **sin tipo** si el usuario no tenía cuenta.

### 4.4 Recuperar y cambiar contraseña
- `/recovery` → `resetPasswordForEmail` (redirect a `/new-password`) → `/new-password` espera el evento `PASSWORD_RECOVERY` → `updateUser` → `/login`.
- Desde Ajustes, en ambos roles, el redirect apunta a `/auth/callback`. Está roto (ver §1.4).

### 4.5 Swipe → match → chat
1. **Deck** (`hooks/useSwipeProfiles.js`):
   - `db.profiles.getDiscovery(userType)` trae 20 perfiles del tipo opuesto, sin filtrar por `onboarding_completed` y sin orden ni relevancia.
   - Se descartan los ya swipeados y el propio.
   - Al candidato se le aplican filtros en el cliente; a la empresa, ninguno.
2. **Swipe**:
   - `swipes` hace upsert con `onConflict (swiper_id, target_id)`: hay un solo swipe por par de usuarios.
   - Un like ("right") busca el swipe inverso. Si existe: `matches.create` (sin duplicar el par) + estadísticas + **2 notificaciones 'match', creadas desde el cliente y solo desde el deck**.
   - Aparece `MatchModal` ("¡Es un Match!") → "Enviar mensaje" → `/app/messages/:id`, que está roto para la empresa.
3. **Tap en una tarjeta** → perfil público con botones X y ♥.
   - Esos botones hacen swipe y crean el match, pero **sin modal ni notificaciones** (PENDIENTES #4).
   - Luego vuelven con `navigate(-1)`.
4. **Chat** (`hooks/useMessages.js`):
   - Carga los últimos 100 mensajes y se suscribe por Realtime a los INSERT del `match_id`.
   - Límite de 2000 caracteres; suma `messages_sent` en estadísticas.
   - No hay leído/no leído, ni notificación de mensaje nuevo, ni push. La métrica `unreadMessages` está fija en 0.
5. **Entrada a los chats**: el candidato entra desde el tab Matches; la empresa, desde el tab Mensajes o la notificación de match.

### 4.6 Crear oferta (`views/company/CreateOffer.jsx`)
- **5 puntos de entrada**: Inicio, Ofertas, estado vacío, Ajustes y profile-created.
- **Pasos** (estado interno):
  1. Información básica: Título\*, Área\* (`professional_areas`), Descripción, Modalidad, Rango salarial opcional (CLP/USD con miles), Ubicación opcional en texto libre ("Ej: Santiago, Chile / Latam / Global").
  2. Stack tecnológico: **solo** si el área es Desarrollo, Data o Diseño UX/UI.
  3. Vista previa → "Publicar oferta".
- El formulario no marca la Descripción como obligatoria, pero `db.offers.create` la rechaza si viene vacía. El usuario recién se entera al publicar, con un error genérico.
- Columnas: `title`, `professional_area`, `description`, `modality`, `city`, `currency`, `salary_min`, `salary_max`, `tech_stack`, `status='active'`, `user_id`.
- Después de publicar: pantalla de éxito → `/company/dashboard`.
- No existe editar, duplicar, cerrar con motivo, ver postulantes ni swipear candidatos **por oferta**.

### 4.7 Postular
- `OfferDetailsView` → "Postularme ahora" equivale a `swipes.create(empresa, 'right', offer.id)` más un match si es mutuo. No existe una tabla de postulaciones.
- **La vista no es alcanzable** (ver §1.4).
- Como el swipe es único por par, una segunda postulación a otra oferta de la misma empresa **pisa** el `offer_id`.
- El perfil público de empresa muestra solo la **primera** oferta activa, sin enlace al detalle, con el sueldo en formato "$Xk USD".

### 4.8 Notificaciones
- Solo se crean de tipo `match`, y solo desde el deck.
- La vista del candidato enruta según el tipo:
  - `match` y `message` → chat.
  - `offer` → ruta rota.
  - `system` → sin acción.
- La vista de empresa solo maneja `match`.
- Ambas tienen "marcar todas como leídas". El contador de no leídas se calcula en cada dashboard, con una query propia.
- No hay push. Las preferencias de notificación de la tabla de settings (migración 007) no aparecen en la UI.

### 4.9 Filtros
- **Candidato** (`FiltersView.jsx`): modalidad, área profesional, país, rango salarial **"USD / mes"** (l.134) y etapa de empresa. Se aplican en el cliente sobre perfiles de **empresa**:
  - El filtro de área compara `p.professional_area`, que las empresas no tienen, así que **vacía el deck**.
  - El filtro de sueldo compara `salary_min` y `salary_max`, que tampoco existen en el perfil de empresa.
- **Empresa** (`CompanyFiltersView.jsx`): modalidad, área, disponibilidad (compara etiquetas, no valores), seniority (el candidato nunca lo informa) y país. **Se guardan, pero no se aplican.**

### 4.10 Perfil y configuración
- **Candidato**:
  - El Perfil (tab) tiene secciones editables (Sobre mí, Experiencia, Educación, Habilidades, Idiomas, Intereses, CV) y "Cerrar sesión".
  - Ajustes tiene 5 secciones:
    - Cuenta: email, cambiar contraseña, Mi perfil → `/app/profile` (duplicado), Mi CV.
    - Apariencia: modo oscuro.
    - Explorar: filtros, editar onboarding (callejón sin salida).
    - Zona de peligro: eliminar cuenta, y debajo el botón Cerrar sesión.
    - Acerca de: soporte, FAQ, privacidad, y la versión al pie.
- **Empresa**:
  - El Perfil (tab) usa `CompanyProfileSections`, con un modal de datos básicos y modales por sección.
  - Ajustes:
    - Cuenta: email, cambiar contraseña.
    - Empresa: nombre de la empresa (solo lectura) y **"Nueva oferta"** (una acción metida en Configuración).
    - Preferencias: modo oscuro.
    - Sobre Talently: soporte, FAQ, privacidad, versión.
    - Zona de peligro, y Cerrar sesión. La versión se repite en el pie.
- **Diferencias entre ambos Ajustes**:
  - Las secciones están en otro orden y con otros nombres ("Apariencia" vs "Preferencias", "Acerca de" vs "Sobre Talently").
  - En la fila del email, el candidato muestra la etiqueta debajo del valor; la empresa, al revés.
  - Ninguno enlaza a Términos.

### 4.11 Cerrar sesión y eliminar cuenta
- Cerrar sesión: `supabase.auth.signOut` + `LOGOUT` → `/`.
- Eliminar cuenta (`DeleteAccountView.jsx`):
  - Hay que escribir "ELIMINAR" → RPC `delete_account`.
  - Si el RPC falla, cierra la sesión y muestra "Solicitud recibida" con un mailto a soporte@talently.app. El usuario cree que la cuenta se borró, aunque no sea así.
  - Esta pantalla no se puede abrir durante el onboarding.

---

## 5. `user_type` y destino después del login

**Valores posibles**: `'candidate'` y `'company'`. No hay otros roles ni multi-rol. `AuthContext` expone `userType = profile?.user_type || null`.

### 5.1 Fuentes de verdad, por orden de prioridad según el lugar

| Fuente | Quién la escribe | Quién la lee |
|---|---|---|
| `profiles.user_type` | Los wizards (upsert) | AuthContext, RoleGate, OnboardingGate, RoleRedirect, useSwipeProfiles |
| `auth.user_metadata.user_type` | `RegisterView` (signUp con email) | RoleRedirect, OnboardingGate, `useOnboardingCandidate` |
| localStorage `talently_pending_user_type` | `lib/oauth.js` antes de Google | Solo AuthCallbackView (web) y useAuthListener (código muerto) |
| localStorage `talently_user_type` | RegisterView, AppContext | Solo useAuthListener (código muerto) |
| Valor por defecto | — | `'candidate'` (RoleRedirect y OnboardingGate) |

Riesgo: el tipo se puede cambiar en el paso 1 del wizard después de haberlo elegido en Register, con lo que `metadata` y `profiles` pueden quedar distintos.

### 5.2 Matriz de destino

| Situación | Destino |
|---|---|
| Sesión activa y se abre `/`, `/login` o `/register` | `/dashboard` |
| Sin perfil, o `onboarding_completed=false`, y tipo = company | `/onboarding/company` (retoma `company_onboarding_step`) |
| Sin perfil, o incompleto, y tipo = candidate o desconocido | `/onboarding/candidate` (retoma `onboarding_step`; salta el paso 1 si ya es candidato) |
| Completo + company | `/company/dashboard` |
| Completo + candidate | `/app` |
| Ruta de otro rol | RoleGate → `/dashboard` |
| Fin del onboarding | Candidato → `/app/swipe` → `/app`. Empresa → `/company/profile-created` |
| Callback de Google en web con perfil | Directo al dashboard, sin pasar por RoleRedirect |

---

## 6. Problemas de IA y navegación (priorizados)

Leyenda: 🔴 bloquea o rompe · 🟠 confunde o inconsistente · 🟡 deuda o pulido. La marca **[D]** indica que el dueño ya lo había reportado.

### 🔴 Bloquean o rompen

| # | Problema | Evidencia |
|---|---|---|
| 1 | Flujo de postulación inalcanzable: no hay entrada válida al detalle de oferta, así que no hay forma de postular | `NotificationsView.jsx:95`; `CompanyPublicProfileView.jsx` (la oferta no es clicable) |
| 2 | **[D]** Atrás que vuelve al inicio: flechas con ruta fija en Chat, CompanySwipe y Ajustes del candidato; enlaces rotos que caen en `*`; sin manejador del atrás de Android | `Chat.jsx:166`, `CompanySwipe.jsx:29`, `SettingsView.jsx:44`, `App.jsx:123` |
| 3 | La empresa no puede abrir el chat desde el modal de match | `MatchModal.jsx:18` |
| 4 | El avatar del chat lleva a una ruta inexistente (ambos roles) | `Chat.jsx:197` |
| 5 | "Cambiar contraseña" desde Ajustes no lleva a la pantalla de nueva clave | `SettingsView.jsx:24`, `CompanySettingsView.jsx:24` |
| 6 | El filtro de área del candidato vacía el deck; los filtros de empresa no se aplican | `useSwipeProfiles.js` |
| 7 | "Editar onboarding" deja al candidato atrapado en el paso final | `SettingsView.jsx:157` + `CandidateOnboarding.jsx:80` |
| 8 | Sin "Cerrar sesión" ni "Eliminar cuenta" durante el onboarding | `views/onboarding/*`, `App.jsx:118` |

### 🟠 Confunden o son inconsistentes

| # | Problema | Evidencia |
|---|---|---|
| 9 | **[D]** Selección de tipo duplicada (Register + paso 1), y en el APK siempre se repite | `RegisterView.jsx`, `Step1_TipoPerfil.jsx`, `oauth.js` |
| 10 | Mapas de navegación distintos por rol: 3 vs 5 tabs, Explorar como tab vs como ruta, Matches vs Mensajes, mismo nombre con otro ícono | `MainApp.jsx`, `CompanyDashboard.jsx` |
| 11 | Las ofertas no participan del match: el deck es de perfiles, el swipe es único por par y no hay postulantes por oferta | `supabase.js` (swipes, getDiscovery) |
| 12 | **[D]** Perfil y configuración de empresa siguen mezclados: "Nueva oferta" está en Ajustes; "Tech Stack" se muestra a todas las empresas | `CompanySettingsView.jsx:100`, `CompanyProfileSections.jsx` |
| 13 | **[D]** Stack y campos TI para empresas que no son TI: posiciones DevOps/QA/Security, seniority, etapas de startup | `Step7_PosicionesSeniority`, `Step5_EtapaTamano`, migración 004 |
| 14 | **[D]** Campos de oferta que no aplican: solo área, modalidad, sueldo, ubicación libre y stack. No hay jornada, turno, fecha, duración ni requisitos para oficios | `CreateOffer.jsx` |
| 15 | La descripción de la oferta parece opcional, pero es obligatoria al publicar | `CreateOffer.jsx` vs `supabase.js` |
| 16 | **[D]** Textos mezclados en inglés: Matches, Swipe, Tech Stack, tags, Product Management, Customer Success, `immediate` crudo, errores de Supabase sin traducir | Varios |
| 17 | Moneda inconsistente: el onboarding y las ofertas usan CLP; el filtro dice "USD / mes"; SwipeCard muestra "$Xk"; el perfil de empresa muestra "$Xk USD" | `FiltersView.jsx:134`, `SwipeCard.jsx:112`, `CompanyPublicProfileView.jsx` |
| 18 | **[D]** Toggles: 3 implementaciones distintas | `sv__toggle`, `csv__toggle`, `cd-switch` |
| 19 | **[D]** Botones y headers: más de 15 variantes de botón atrás; X vs flecha en Filtros; títulos h1 vs h2 | §2.4 |
| 20 | Marca inconsistente: Welcome usa un ícono Material, AuthCallback una "T" de texto, Login el `TalentlyLogo`; el header de empresa muestra el logo de la empresa | `WelcomeView.jsx`, `AuthCallbackView.jsx`, `LoginView.jsx` |
| 21 | Color primario azul `#1392EC` frente a la marca morada (las sombras del logo ya están en morado) | `styles/variables.css:9` |
| 22 | Íconos: el set oficial convive con Material Symbols (91 archivos usan Material; 4 usan `ui/icons`) | `components/ui/icons.jsx` |
| 23 | Pasos internos fuera de la URL: el atrás físico sale del wizard o de CreateOffer y se pierde lo ingresado | §2.4 |
| 24 | Los modales no se cierran con el atrás físico | `MatchModal`, `SectionEditModal`, modales de Perfil |
| 25 | Match creado desde un perfil público: sin modal ni notificaciones | `CompanyPublicProfileView.jsx:70-90`, `CandidatePublicProfileView.jsx:91-113` |
| 26 | Métricas falsas o en cero: "Vistas de perfil" nunca se incrementa; mensajes no leídos fijo en 0 | `CompanyDashboard.jsx:82` |
| 27 | Badges engañosos: "Cuenta verificada" y "Perfil al 100%" | `CompanyProfileCreatedView.jsx`, `Step12_Final.jsx` |
| 28 | El nombre del registro no se precarga en el onboarding (se escribe dos veces) | `useOnboardingCandidate.js` |
| 29 | El header del candidato muestra el botón de filtros en Matches y Perfil, donde no aplica | `MainApp.jsx` |
| 30 | "Cerrar sesión" duplicado en Perfil y en Ajustes del candidato; solo en Ajustes para la empresa | `ProfileView.jsx`, `SettingsView.jsx` |

### 🟡 Deuda o pulido

| # | Problema | Evidencia |
|---|---|---|
| 31 | Rutas huérfanas y duplicadas: `/app/matches`, `/app/messages`, `/app/profile`, `/app/swipe`, `/company/stats` | §1.2 |
| 32 | 8 wrappers `*View` vacíos; la empresa importa `Chat` desde la carpeta candidate | §1.3 |
| 33 | Datos de empresa en dos lugares: `profiles.company_*` (se escribe) y la tabla `companies` (solo se lee, en `getWithProfiles` y `offers.getById`) | `supabase.js` |
| 34 | `profiles` es una mega-tabla con columnas sinónimas | `name`/`full_name`, `modality`/`work_modality`/`work_modalities`, `salary_*`/`expected_salary`/`salary_expectation`/`salary_range`, `company_logo`/`company_logo_url`, `benefits`/`company_benefits`, `company_values`/`culture_values`, `size`/`company_size`, `description`/`company_description`, `industry`/`company_sector` |
| 35 | Dos archivos de constantes con valores en conflicto | `lib/constants.js`, `data/constants.js` |
| 36 | Choque de clases CSS globales | `.cpv-company-name`, `.cpv-wrapper` |
| 37 | Copy de Ajustes distinto entre roles, sin enlace a Términos y con la versión duplicada en empresa | `SettingsView.jsx`, `CompanySettingsView.jsx` |
| 38 | Register muestra 3 puntos de progreso para 2 pasos; Términos no clicables en el paso 1 | `RegisterView.jsx:183`, `Step1_TipoPerfil.jsx:105` |
| 39 | `AuthCallbackView` salta RoleRedirect (redirección doble) | PENDIENTES #5 |
| 40 | Discovery sin relevancia: 20 perfiles sin orden y sin excluir perfiles incompletos | `supabase.js` (`getDiscovery`) |

---

## 7. Lo que el rediseño tendría que resolver en IA

- **Un solo modelo de navegación** para todos los perfiles: misma barra inferior, header y Ajustes, con contenido según el rol. Explorar siempre como tab. Una bandeja unificada de "Conversaciones". Ajustes separado del Perfil.
- **Pasar de 2 roles fijos a una cuenta con uno o más perfiles.** Por ejemplo: busco trabajo, ofrezco un servicio u oficio, ofrezco clases, contrato como empresa, contrato como persona u hogar. El tipo se elige **una sola vez**, en el onboarding, y se guarda en un solo lugar.
- **Que el objeto del match sea una publicación**, no la persona. Las publicaciones serían ofertas de empleo, servicios o clases. Postular, dar like y agendar tendrían que quedar ligados a esa publicación, con postulantes visibles por oferta.
- **Todos los pasos y estados en la URL.** Un manejador global del botón atrás de Android (cerrar modal → paso anterior → tab anterior → salir), una página 404 real en vez del comodín y nada de flechas con ruta fija.
- **Onboarding por bifurcación**:
  1. Qué quieres hacer.
  2. Datos comunes: nombre precargado, comuna, foto.
  3. Bloque específico del perfil: oficio, jornada, licencias, tarifa, materias…
  4. Lo opcional se completa después, con un indicador de completitud honesto.
  - "Cerrar sesión" disponible en todo momento.
- **Un sistema de componentes único**: botón atrás, header, switch, chip, tarjeta y estado vacío. Textos 100 % en español de Chile, CLP con separador de miles y la paleta morada de marca.
