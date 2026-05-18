---
trigger: always_on
---

---
trigger: always_on
---

# TALENTLY - REGLAS DEL AGENTE (v2, basado en codigo real)

## CONTEXTO DE LA APP
Talently = app estilo Tinder para empleos. Candidatos hacen swipe a ofertas,
empresas hacen swipe a candidatos. Match mutuo -> chat habilitado.

## STACK TECNOLOGICO
- Frontend: HTML5 + Vanilla JS (ES6+) + CSS3
- Archivo JS principal: js/app_fixed.js (13,449 lineas)
- Backend: Supabase (Auth + PostgreSQL + Storage + Realtime)
- Cliente Supabase: js/supabase-client.js -> window.talentlyBackend
- Iconos: Google Material Icons

## TABLAS PRINCIPALES DE SUPABASE
- profiles           -> candidatos (id = auth.users.id)
- companies          -> empresas (user_id = auth.users.id)
- offers             -> ofertas de trabajo (user_id = empresa)
- swipes             -> swipe(swiper_id, target_id, direction, offer_id)
- matches            -> match(user_id_1, user_id_2)
- messages           -> chat(match_id, sender_id, content)
- user_statistics    -> metricas (profile_views, matches_count...)

## REGLAS DE CODIGO (NO NEGOCIABLES)
1. TODO acceso a Supabase usa window.talentlyBackend (db.*)
   NUNCA llames a supabaseInstance directamente desde app_fixed.js
2. NUNCA crear tablas nuevas sin consultar este documento primero
3. NUNCA usar estilos inline en HTML. Todo va a css/styles.css
4. NUNCA hardcodear colores. Usar variables CSS: --color-primary: #1392EC
5. Las vistas se controlan con this.showView("viewId")
6. Comentarios siempre en espanol
7. Todo try/catch en operaciones Supabase con mensaje claro al usuario
8. Modo oscuro: body.dark {...} + @media prefers-color-scheme
9. NO crear scripts de fix/patch/debug en la raiz del proyecto
10. Verificar diseno Stitch antes de codear cualquier vista nueva

## VISTAS EXISTENTES - NO DUPLICAR
Candidato: mainApp, filtersView, messagesListView, messagesChatView,
           cvView, notificationsView, settingsView, offerDetailsApp
Empresa:   companyApp, createOfferView, companySwipeView,
           companyFiltersView, companyChatView, companyStatsView,
           companyNotificationsView, companySettingsView

## PASOS DE ONBOARDING VACIOS A ELIMINAR
Candidato: onboardingStep5, onboardingStep7, onboardingStep10, onboardingStep13
Empresa: companyStep11

## REGLAS DE CONSISTENCIA VISUAL — NO NEGOCIABLES

### Tipografía
- ÚNICA fuente permitida: `Inter` (ya cargada en index.html)
- NUNCA usar `font-family` como estilo inline en index.html
- NUNCA usar `font-family: 'Sora'` o `font-family: 'Plus Jakarta Sans'`
- Los pesos válidos son: 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

### Layout y ancho
- La app vive dentro de `.app-container` que tiene `max-width: 480px`
- NUNCA usar `width: 100vw` dentro de `.app-container`
- NUNCA usar `position: fixed; left: 0; width: 100%` sin considerar el contenedor
- Todo nuevo contenedor debe usar `width: 100%` (relativo al padre)

### Vistas
- TODA sección principal de la app debe tener `class="view"` en su div raíz
- TODA navegación entre vistas usa `app.showView('id')` — nunca manipular `display` directamente
- NUNCA mostrar una vista manipulando `element.style.display = 'block'` desde fuera de `showView()`

### Colores
- Color primario: usar SIEMPRE `var(--primary)` — nunca `#1392EC` hardcodeado
- Fondo de tarjetas: `var(--surface)`
- Fondo general: `var(--bg)`
- Texto: `var(--text-primary)`, `var(--text-secondary)`, `var(--text-muted)`
- NUNCA usar colores de Tailwind (`bg-blue-500`, `text-slate-700`) para elementos de marca

### Iconos
- Librería única: Material Icons (`<span class="material-icons">nombre</span>`)
- Tamaños: usar clases `.icon-xs` `.icon-sm` `.icon-md` `.icon-lg` `.icon-xl`
- NUNCA usar `style="font-size: Xpx"` en iconos
- NUNCA mezclar con Font Awesome, Bootstrap Icons u otras librerías

### CSS
- Agregar estilos nuevos SIEMPRE en `css/styles.css`, nunca inline en el HTML
- NUNCA redefinir un selector que ya existe — modificar la definición existente
- Usar las variables de `:root` para todos los valores de color, sombra y radio
