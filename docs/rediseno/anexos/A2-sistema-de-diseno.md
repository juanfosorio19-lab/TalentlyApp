# Anexo A2 · Sistema de diseño actual y propuesto

Inventario de tokens de `src/styles/variables.css` y `global.css`, desvíos medidos con grep y propuesta de sistema unificado alineado a la marca.

---

# Sistema de diseño de Talently: auditoría y propuesta unificada

Revisé `Talently_v2/src`: 38 archivos CSS y 84 JSX. Los tokens viven en `src/styles/variables.css` (622 líneas), y el reset y el layout en `src/styles/base.css` y `src/styles/global.css`. Calculé los contrastes con la fórmula WCAG 2.x.

## 0. Resumen en cifras

| Métrica | Valor medido | Lectura |
|---|---|---|
| Tokens únicos en `:root` | **164**. 3 están duplicados (`--shadow-sm/md/lg`, definidos 2 veces; gana la versión neutra de la línea 74) | Demasiados tokens |
| Bloque `[data-theme='dark']` | **136 tokens, de los que solo 17 cambian de valor**. Los otros 119 son copia del bloque claro | Se duplica sin necesidad |
| Bloque legacy `.dark-mode` | 133 tokens, tercera copia. Le faltan los 3 tokens de gráficos | Frágil |
| Tokens de opacidad (`--primary-03` … `--primary-75`, `--white-*`, `--shadow-black-*`, etc.) | **91**. Se usan 62, con 214 apariciones | Hay que reducirlos a unos 6 |
| Tokens definidos y nunca usados | **33**. Entre ellos está **toda la escala tipográfica**: 9 tamaños, 5 pesos y 3 interlineados | La escala existe pero nadie la usa |
| Token usado sin definir | **`--text`: 53 usos en 8 archivos** | Funciona por casualidad |
| Hex y rgba sueltos fuera de `variables.css` | 41 hex y 5 rgba en **10 archivos**. Además, 3 `color:'white'` | La mayoría son válidos |
| `font-size` | **686 declaraciones literales, 69 valores distintos, 0 usan token** | Es el mayor desvío |
| `font-weight` | 351 literales, 0 tokens. Hay **38 reglas con 800 y 1 con 900, pero Inter solo se carga en 400–700** (`main.jsx`) | El navegador simula la negrita |
| `border-radius` | **325 literales (37 valores distintos)** contra 33 con token | — |
| `box-shadow` | **82 literales (54 distintos)** contra 38 con token | — |
| `transition` | 129 literales (50 distintos) contra 33 con token | — |
| `z-index` | 52 literales, 12 valores distintos (0 a 1000), sin escala | — |
| `line-height` / `letter-spacing` | 100 literales (15 distintos) / 61 literales (21 distintos) | — |
| Espaciado (padding, margin, gap) | 1.067 valores, 35 distintos, **340 (32%) fuera de la grilla de 4** | No hay tokens de espaciado |
| Estilos inline `style={{}}` | **183**. **132 están en el onboarding de empresa (10 archivos) y 0 en el de candidato (12 archivos)** | Explica por qué los dos onboardings se ven distintos |
| Botones | **57 clases raíz de botón en 26 CSS**. Hay **14 CTA primarios** con 5 radios, 5 tamaños de texto y 7 sombras distintas | — |
| Inputs | unos 10 inputs, 5 selects y 2 textareas, cada uno con su propia clase | — |
| Toggles | **3 implementaciones distintas** | — |
| Iconos | Material Symbols: **362 usos en 65 JSX** más 76 nombres pasados como string (79 glifos). Set oficial: 13 iconos y 2 logos, usados en **solo 4 archivos** | Conviven dos familias de iconos |

---

## 1. Inventario de tokens actuales

### 1.1 Estructura de `variables.css`
| Bloque | Líneas | Tokens | Observación |
|---|---|---|---|
| `:root` | 7–249 | 164 únicos | Mezcla tokens semánticos, alfas, una paleta Tailwind suelta y tokens por vista (`--welcome-*`) |
| `[data-theme='dark']` | 255–440 | 136 | Solo 17 cambian: bg, surface, surface-elevated, surface-overlay, text-primary, text-secondary, text-muted, text-inverse, border, divider, shadow-sm, shadow-md, shadow-lg, shadow-xl y los 3 de chart |
| `.dark-mode` | 443–622 | 133 | Copia del bloque anterior. Le faltan los tokens de chart |

### 1.2 Colores (claro / oscuro)
| Token | Claro | Oscuro | Usos | Nota |
|---|---|---|---|---|
| `--primary` | **#1392EC** (azul) | igual | 267 | No es el color de marca |
| `--primary-dark` / `--primary-light` | #0F7ACC / #60BDFF | igual | 1 / 4 | — |
| `--primary-rgb` | 19,146,236 | igual | 10 | Se usa en `rgba(var(--primary-rgb),x)` |
| `--secondary` | #00D9C0 (teal) | igual | 8 | No existe en la marca |
| `--success` | #00D084 | igual | 32 | 2.03:1 como texto: falla |
| `--danger` | #FF6B9D (rosado) | igual | 53 | 2.68:1 con blanco: falla |
| `--warning` | #FDCB6E | igual | — | 1.51:1 como texto |
| `--info` | #74B9FF | igual | 0 | Sin uso |
| `--danger-red` / `--danger-alt` | #EF4444 / #F43F5E | igual | 3 / 3 | Ya son 3 rojos distintos |
| `--bg` | #FAFBFC | #1A1B1E | 111 | — |
| `--surface` | #FFFFFF | #25262B | 159 | — |
| `--surface-elevated` | #FFFFFF | #2C2D32 | **0** | Como no se usa, en oscuro no hay jerarquía de superficies |
| `--surface-overlay` | rgba(0,0,0,.5) | rgba(0,0,0,.7) | — | Hay además 6 tokens `--overlay-*` redundantes |
| `--text-primary` | #2D3436 | #FFFFFF | 140 | — |
| `--text-secondary` | #636E72 | #A0A0A0 | 162 | 5.24 y 5.77: pasa AA |
| `--text-muted` | #B2BEC3 | #6E6E6E | 162 | **1.90:1 en claro y 2.96:1 en oscuro: falla AA**. Se usa en placeholders y en los tabs inactivos |
| `--text-inverse` | #FFFFFF | #1A1B1E | 2 | — |
| `--text-on-primary` / `--text-on-dark` | #FFFFFF | igual | 69 / 6 | — |
| `--border` / `--divider` | #E8ECEF / #F0F2F5 | #2C2E33 | 234 | En oscuro el borde contra la superficie da 1.11:1 |
| Paleta suelta | `--violet #8B5CF6`, `--violet-700 #7C3AED`, `--pink #EC4899`, `--blue-300/600/700`, `--green-200/400/500/700/900`, `--yellow-400`, `--purple-10`, `--indigo-06`, `--particle-*` | igual | 1–3 cada uno | Colores Tailwind sueltos, sin significado |

### 1.3 Tipografía
| Elemento | Valor | Uso real |
|---|---|---|
| Familia | `'Inter', -apple-system, …` (`global.css:25`). Inter 400/500/600/700 se cargan con @fontsource | Bien |
| Íconos | `Material Symbols Rounded Variable`, 24px por defecto (`global.css:84`) | — |
| Escala | `--text-h1` 36, `h2` 30, `h3` 24, `h4` 20, `lg` 18, `base` 16, `sm` 14, `xs` 12, `micro` 10 | **0 usos** |
| Pesos | `--weight-regular` 400 … `--weight-extrabold` 800 | **0 usos**. Además el 800 no se carga |
| Interlineado | `--leading-tight` 1.25, `normal` 1.5, `relaxed` 1.75. `body` usa 1.6 | **0 usos** |

### 1.4 Espaciado, radios, sombras, gradientes, transiciones, z-index
| Tipo | Tokens | Uso |
|---|---|---|
| Espaciado | **No existe.** El comentario "Spacing (consistent scale)" solo agrupa radios | — |
| Radios | `--radius-sm` 8, `md` 12, `lg` 16, `xl` 20, `full` 9999 | 33 usos contra 325 literales |
| Sombras | Primera versión con tinte azul (`0 2px 8px rgba(19,146,236,.08)`…), **pisada** en la línea 74 por `--shadow-sm` 0 1px 3px .12, `md` 0 4px 6px .15, `lg` 0 10px 25px .2 y `xl` 0 20px 40px .25. A eso se suman 11 `--shadow-black-NN` | 38 usos con token contra 82 literales |
| Gradientes | `--gradient-primary` #1392EC→#60BDFF (24 usos en 13 archivos), `--gradient-success` #00D084→#00D9C0, `--gradient-danger` #FF6B9D→#FF8E53 (sin uso) | — |
| Transiciones | `--transition-fast` .15s, `normal` .25s, `slow` .4s (sin uso) | 33 usos contra 129 literales |
| z-index | No hay tokens | 52 literales |
| Layout | `--max-width` 480px. `--app-height` y `--safe-area-inset-*` en `global.css` (bien resueltos para Android 15 edge-to-edge) | — |

### 1.5 `base.css` y `global.css`
- `button:disabled { opacity:.5 }` es un estado deshabilitado genérico y no se diseñó un estilo propio.
- `input:focus-visible { outline:none }` delega el foco a cada vista, así que cada una lo marca a su manera. Además, `@media (hover:none) *:focus { outline:none }` elimina todo indicador de foco en táctil.
- `.app-container`: ancho máximo 480px, `box-shadow: 0 0 80px var(--indigo-06)` (otro morado). Hay 4 keyframes: `fadeIn`, `fadeInUp`, `fadeInDown` y `slideUp`.

---

## 2. Desvío medido

### 2.1 Colores hardcodeados por archivo
Solo 10 archivos tienen alguno, así que no hay un top 15. Los muestro todos.

| # | Archivo | hex | rgba | Problema |
|---|---|---|---|---|
| 1 | `components/ui/icons.jsx` | 9 | 0 | Ninguno: es el gradiente del logo y 3 fallbacks `var(--surface,#fff)` |
| 2 | `lib/errorLogger.js` | 7 | 1 | Ninguno: es el overlay de debug |
| 3 | `components/charts/LineChart.jsx` | 7 | 0 | Los valores de respaldo son **azules** (#1392EC, #60BDFF) |
| 4 | `components/charts/BarChart.jsx` | 6 | 0 | Igual que el anterior |
| 5 | `views/public/LoginView.jsx` | 4 | 1 | El logo de Google está bien. El problema es `drop-shadow(rgba(124,58,237,.35))` (#7C3AED, otro morado), en la línea 129 |
| 6 | `views/public/RegisterView.jsx` | 4 | 0 | Ninguno: logo de Google |
| 7 | `views/company/CompanyDashboard.css` | 2 | 1 | Sí: thumb `#fff` (721), fallback `#22c55e` (712) y una sombra rgba (722) |
| 8 | `lib/capacitorInit.js` | 2 | 0 | Sí: la StatusBar usa `#0F172A`/`#FFFFFF`, que no coincide con `--bg` |
| 9 | `views/onboarding/company/Step12_Multimedia.jsx` | 0 | 1 | Sí: `rgba(255,255,255,.9)` rompe el modo oscuro (188) |
| 10 | `views/candidate/MainApp.jsx` | 0 | 1 | Sí: `drop-shadow(rgba(109,74,255,.3))` (89) |
| + | Step7 (171), Step11 (132) y Step12 (129) del onboarding de empresa | `color:'white'` | — | Sí |

**Conclusión:** el desvío de color no está en los hex sino en la cantidad de tokens (91 de opacidad, 12 colores Tailwind sueltos y 3 rojos). Fuera del color, casi todo está escrito a mano.

### 2.2 Valores de tipografía reales
| Valor | Usos | | Valor | Usos |
|---|---|---|---|---|
| 14px | 69 | | 0.875rem | 43 |
| 20px | 50 | | 0.75rem | 19 |
| 15px | 48 | | 1rem | 18 |
| 12px | 39 | | 0.9375rem | 13 |
| 18px | 36 | | 0.9rem | 11 |
| 22px | 35 | | 1.0625rem | 9 |
| 13px | 34 | | 10px | 9 (por debajo del mínimo legible) |
| 11px | 25 | | JSX `fontSize: 11–14` | 35 |

En total hay 69 valores distintos, mezclando px, rem y números en JSX. Los archivos con más casos son `onboarding.css` (98), `auth.css` (62), `CreateOffer.css` (42), `CompanyDashboard.css` (38), `CompanySettingsView.css` (33) y `ProfileView.css` (30).

**Títulos de cabecera de pantalla** (deberían ser un solo estilo):

| Tamaño y peso | Vistas |
|---|---|
| 15px / 600 | `recovery-header-title` |
| 17px / 700 | `csv__header-title`, `od__header-title`, `fv__title`, `nv__title`, `sv__title` |
| 18px / 700 | `co__header-title`, `cvv__title`, `cd__tab-title`, y `prv`, `terms`, `faqv` (1.125rem) |
| 20px / 800 | `pv__header-title` |
| 24px / 800 | `mv__title` |

### 2.3 Radios, sombras y espaciado
| Propiedad | Valores más usados | Comentario |
|---|---|---|
| `border-radius` | 50% (113), 14px (28), 12px (27), 99px (19), 16px (18), 10px (14), 0.75rem (13), 8px (12), 18px (8), 9999px (6), 999px (2) | Hay 3 formas de escribir "pill" y un 14px que no es ningún token |
| `box-shadow` | 54 combinaciones. Ejemplos: `0 4px 16px primary-30`, `0 4px 12px primary-25`, `0 4px 14px primary-40`, `0 8px 24px primary-25` | Cada CTA tiene su propio resplandor |
| Espaciado | 16 (137), 8 (131), 12 (120), **14 (107)**, 20 (93), 4 (87), **10 (77)**, **6 (67)**, 24 (63), **2 (33)** | 340 valores fuera de la grilla de 4: 14, 10, 6, 2, 3, 18, 11, 7, 5 |

### 2.4 Botones: 57 clases raíz en 26 CSS
Clases por archivo:
- `auth.css`: auth-btn, auth-back-btn, auth-link-btn, register-continue-btn, register-nav-btn, register-skip-btn
- `onboarding.css`: ob-nav-btn, ob-back-btn, ob-add-btn, ob-final-cta, ob-avatar-camera-btn, ob-avatar-change-btn, ob-interest-add-btn
- `CompanyDashboard.css`: cd__cta-btn, cd__new-btn, cd__header-btn, cd__empty-btn, cd__profile-edit-btn
- `DeleteAccountView.css`: dav__cancel-btn, dav__delete-btn, dav__rpc-email-btn, dav__rpc-home-btn
- `CandidatePublicProfileView.css`: cpp-action-btn, cpp-back-btn-plain, cpp-close-btn, cpp-cv-btn
- `SupportView.css`: supp__send-btn, supp__resource-btn, supp__success-btn
- `FAQView.css`: faqv-back-btn, faqv-contact-btn, faqv-empty-btn
- `CompanySettingsView.css`: csv__edit-btn, csv__header-btn, csv__signout-btn
- `CompanyProfileCreatedView.css`: cpv-btn-primary, cpv-btn-secondary
- `FiltersView.css`: fv__btn-apply, fv__btn-clear
- `OfferDetailsView.css`: od__cta-btn, od__cta-bar, od__error-btn
- Una clase cada uno: co__btn, cvv__btn, match-modal__btn, mv__explore-btn, pv__action-btn, sv__signout-btn, swipe-stack__btn, ui-empty__btn, welcome-btn, main-app__header-btn, chat-view__profile-btn, cs__period-btn, cpv-action-btn, prv-back-btn y terms-back-btn

Hay **8 botones "atrás" distintos**: auth, ob, faqv, prv, terms, cpp, cpv-nav y supp/dav.

**Comparación de los CTA primarios:**

| Clase | Alto / padding | Radio | Texto | Fondo | Sombra |
|---|---|---|---|---|---|
| `auth-btn--primary` | pad 16 | 14px | 16/600 | **gradiente** | shadow-sm |
| `welcome-btn--primary` | pad 16×24 | 16 (token) | 16/700 | sólido | shadow-lg |
| `ob-nav-btn--primary` | pad 16 | 14px | 16/600 | **gradiente** | shadow-sm |
| `co__btn--primary` | alto 50 | 14px | 15/700 | **gradiente** | 0 4 14 primary-40 |
| `cd__cta-btn` | pad 15 | 16px | 16/700 | **gradiente** | 0 4 14 primary-30 |
| `cd__new-btn` | pad 8×14 | 10px | 13/600 | **gradiente** | — |
| `match-modal__btn--primary` | pad 15×24 | 14px | 15/700 | sólido | 0 4 16 primary-40 |
| `fv__btn-apply` | pad 14 | 14px | 15/700 | sólido | 0 4 12 primary-25 |
| `od__cta-btn` | pad 15 | 14px | 16/700 | sólido | 0 4 16 primary-30 |
| `cpv-btn-primary` | alto 56 | 16px | 18/700 | sólido | 0 8 24 primary-25 |
| `supp__send-btn` | alto 52 | 14px | 16/700 | sólido | 0 4 16 primary-30 |
| `mv__explore-btn` | pad 12×24 | 14px | 15/700 | sólido | — |
| `ui-empty__btn` | pad 10×20 | pill | 14/600 | sólido | — |
| `dav__delete-btn` | alto 56 | 14px | 16/700 | danger | — |

### 2.5 Inputs, selects y toggles
- **Inputs:** auth-input, ob-input, co__input, co__search-input, pv-edit-input, sem-input, supp__input, fv__salary-input, dav__confirm-input, faqv-search-input y chat-view__input.
- **Selects:** ob-select, ob-currency-select, pv-edit-select, fv__select y cs__select.
- **Textareas:** co__textarea y supp__textarea.

| Toggle | `sv__toggle` (Ajustes candidato) | `csv__toggle` (Ajustes empresa) | `cd-switch` (Dashboard empresa) |
|---|---|---|---|
| Riel | 46×26, radio 13px | 46×26, radio 99px | 46×28, radio 999px |
| Thumb | 20px, `--surface` | 20px, `--surface` | 22px, `#fff` hardcodeado |
| Color encendido | `--primary` (azul) | `--primary` | **`--success` (verde)** |
| Desplazamiento | 20px | 20px | 18px |
| Oscuro, apagado | **thumb #25262B sobre #2C2E33 = 1.11:1, invisible** | igual | se ve bien |
| Nomenclatura | `__toggle__thumb` | `__toggle-thumb` | `__thumb` |

### 2.6 Navegación y nomenclatura
- **Tab bars:** la del candidato (`main-app__tab`) tiene etiqueta de 11px y clase `.is-active`. La de empresa (`cd__tab`) tiene etiqueta de **10px** y clase `--active`. El tab inactivo usa `--text-muted`, con contraste 1.90:1.
- **Choque de clases globales:** `.cpv-wrapper` y `.cpv-company-name` están definidas **a la vez** en `CompanyProfileCreatedView.css` y en `CompanyPublicProfileView.css`. El CSS es global, así que gana el último archivo que se carga y una vista puede heredar estilos de la otra.
- **Dos convenciones de nombres:** BEM (`cd__tab--active`) y kebab (`cpp-action-btn`, `.is-active`).

### 2.7 Iconos: Material Symbols contra el set oficial
| | Material Symbols Rounded | Set oficial (`icons.jsx`) |
|---|---|---|
| Ocurrencias | 362 `className="material-symbols-rounded"` y 76 nombres pasados como string (`icon: '…'`) | unas 30 referencias |
| Archivos | 65 JSX | 4 (MainApp, CompanyDashboard, SwipeStack y LoginView) |
| Glifos | 79. Los más usados: arrow_back 25, arrow_forward 23, close 20, error 17, chevron_right 15, check_circle 13, edit 12 | 13 iconos y 2 logos |
| Estilo | Fuente variable con peso 400 por defecto. El tamaño va por `font-size`: 15 inline y 27 CSS lo redefinen | Outline de 24px, trazo 1.8, `currentColor` |
| **Conceptos dibujados con las dos familias** | close 20, person 9, search 7, work 5, favorite 4, chat 1, settings 1 | IconClose, IconPerson, IconExplore, IconOffers, IconHeart, IconChat e IconGear |

---

## 3. Modo oscuro

### 3.1 Cómo se aplica
1. `AppContext.jsx:67` lee `localStorage.talently_dark_mode`. **No consulta `prefers-color-scheme`**, así que en el primer arranque siempre parte en claro.
2. `AppContext.jsx:243-260` pone `data-theme="dark"` y la clase `.dark-mode` en `<html>`, más `.dark-mode` en `<body>`. Luego llama a `setStatusBarTheme(isDark)`.
3. `hooks/useDarkMode.js` duplica esa lógica y sí respeta la preferencia del sistema, pero **nadie lo usa** (es código muerto).
4. `[data-theme='dark']` y `.dark-mode` tienen la misma especificidad. Gana `.dark-mode`, que está más abajo en el archivo, y para los tokens de chart (que no están en `.dark-mode`) rige el otro bloque.
5. Los toggles de `SettingsView` y `CompanySettingsView` despachan el cambio.

### 3.2 Dónde se rompe
| # | Ubicación | Síntoma | Causa | Arreglo |
|---|---|---|---|---|
| 1 | `SettingsView.css:204-227` y `CompanySettingsView.css:418-441` | El thumb del toggle apagado no se ve | thumb `--surface` #25262B sobre riel `--border` #2C2E33 = 1.11:1 | Riel apagado `--color-border-strong`, thumb siempre #FFF |
| 2 | `CompanyPublicProfileView.css:26` | La cabecera sticky queda blanca | `--bg-85` depende de `--bg-rgb`, que **no está definido** (cae en 255,255,255) | Usar `--color-bg` con alfa, o definir `--bg-rgb` en cada tema |
| 3 | `CandidatePublicProfileView.css:422` | Banda blanca en el degradado inferior | Mismo problema con `--bg-90` | Igual que el 2 |
| 4 | `CandidatePublicProfileView.css:136` | Chip verde claro sobre fondo oscuro | `--success-bg-90` es rgba(236,253,245,.9) en ambos temas | `--color-success-subtle` por tema |
| 5 | `Step12_Multimedia.jsx:188-192` | La X para borrar foto no se ve | fondo `rgba(255,255,255,.9)` con `color: var(--text-primary)`, que en oscuro es blanco | Componente IconButton con tokens |
| 6 | `Step7:171`, `Step11:132`, `Step12:129` (onboarding de empresa) | `color:'white'` hardcodeado | Estilos inline | `--color-on-primary` |
| 7 | `Step5_EtapaTamano.jsx:105` y `Step6_ModalidadesBeneficios.jsx:173` | El ícono seleccionado sale oscuro en oscuro y blanco en claro, distinto al resto | Usa `--text-inverse` en vez de `--text-on-primary` | `--color-on-primary` |
| 8 | 8 CSS (CandidatePublicProfile 9, CompanyPublicProfile 9, DeleteAccount 8, Support 7, FAQ 6, Privacy 5, CompanyProfileCreated 5, Terms 4) | El color se hereda del padre | `var(--text)` **no existe** (53 usos) | Renombrar a `--color-text` |
| 9 | `--text-muted` (162 usos) | Placeholders, hints y tabs inactivos ilegibles | 1.90:1 en claro y 2.96:1 en oscuro | `--color-text-3` (5.19 y 5.83) |
| 10 | Todas las tarjetas y modales | En oscuro no se distingue un nivel de superficie de otro | `--surface-elevated` no se usa. Las sombras negras no se ven sobre fondo oscuro | Capas surface-1, surface-2 y surface-3 |
| 11 | `capacitorInit.js:17` | La franja de la StatusBar no coincide con la app | oscuro #0F172A contra `--bg` #1A1B1E; claro #FFFFFF contra #FAFBFC | Usar los mismos valores que `--color-bg` |
| 12 | `CompanyDashboard.css:712,721` | Un toggle verde y otros azules | `--success` con fallback hex y thumb `#fff` | Un solo componente Switch |

Además, el bloque `.dark-mode` no tiene los tokens de chart. Hoy no se nota porque `data-theme` también está puesto, pero es frágil.

---

## 4. Brecha entre la marca (morado) y el tema actual (azul)

| Lugar | Hoy | Marca |
|---|---|---|
| `--primary` / `-dark` / `-light` | #1392EC / #0F7ACC / #60BDFF | #6D4AFF / #4A2BD1 / #A78BFA |
| `--primary-rgb` y 20 alfas `--primary-NN` | 19,146,236 | 109,74,255 |
| `--gradient-primary` (24 usos en 13 archivos, 6 de ellos en CTA) | #1392EC→#60BDFF | #6D4AFF→#B48CFF, solo decorativo |
| `--secondary` (8 usos) | #00D9C0 teal | No es de la marca. Se elimina |
| Logo e ícono de la app (`assets/logo.svg`, `TalentlyLogo`) | #6D4AFF→#B48CFF | Ya están bien |
| Iconos oficiales (`currentColor`) | Se pintan **azules** en el tab activo | Deben ser morados |
| Splash (`capacitor.config.json:14`) | #1392EC | #6D4AFF o #35256F |
| `<meta theme-color>` (`index.html`) | #1392EC, y además `lang="en"` | `--color-bg`, y `lang="es-CL"` |
| StatusBar (`capacitorInit.js:17`) | #0F172A / #FFFFFF | #0F0D16 / #F7F6FB |
| Fondo de Welcome (`WelcomeView.css:15`) | primary-dark azul → #0A1628 → negro | #35256F → #0F0D16 |
| Sombras del logo (`MainApp.jsx:89`, `LoginView.jsx:129`) | rgba(109,74,255) y rgba(124,58,237), dos morados escritos a mano | `--elev-brand` |
| Morados sueltos | #8B5CF6, #7C3AED, rgba(168,85,247), rgba(108,92,231), rgba(99,102,241) | 5 morados, ninguno es el de marca |
| Fallbacks de gráficos | #1392EC / #60BDFF | Tokens nuevos |
| **Contraste del CTA** | blanco sobre #1392EC = **3.31: falla AA**. Blanco sobre #60BDFF (fin del gradiente) = 2.05 | blanco sobre #6D4AFF = **5.15: pasa AA** |

---

## 5. Propuesta: sistema de diseño unificado

### 5.1 Reglas
1. **Un solo archivo de tokens.** `:root` define la paleta base y los tokens semánticos, y `[data-theme='dark']` sobrescribe **solo los tokens semánticos** (unos 25). Se eliminan el bloque `.dark-mode`, los 91 tokens de opacidad y la paleta Tailwind suelta.
2. **Los rellenos no cambian con el tema y los textos sí.** `--color-primary`, `--color-danger`, `--color-success` y `--color-info` son iguales en claro y oscuro, siempre con texto blanco encima. Las variantes `*-text` (links, íconos activos, texto de estado) se aclaran en oscuro.
3. **El gradiente de marca es solo decorativo:** logo, hero de Welcome y modal de match. Nunca va de fondo en un botón con texto, porque el blanco sobre #B48CFF da 2.58:1.
4. En los CSS de componentes no se escriben valores a mano para color, font-size, radius, shadow, z-index ni transition. Conviene imponerlo con stylelint (`color-no-hex` y `stylelint-declaration-strict-value`).
5. La StatusBar, el splash, `theme-color` y los fallbacks de gráficos leen los mismos valores. `lang="es-CL"`. El arranque respeta `prefers-color-scheme`, y luego queda la preferencia guardada.
6. Los componentes base van en `src/components/ui` con un prefijo único (`t-`) o con CSS Modules, para evitar choques como el de `.cpv-*`.

### 5.2 Paleta base (no se usa directo en componentes)
| Morado | Hex | | Neutro (con leve tinte morado) | Hex |
|---|---|---|---|---|
| violet-50 | #F5F2FF | | neutral-0 | #FFFFFF |
| violet-100 | #F0ECFF | | neutral-50 | #F7F6FB |
| violet-200 | #E1D9FF | | neutral-100 | #F1EFF7 |
| violet-300 | #C9BAFF | | neutral-200 | #E4E1EE |
| violet-400 | **#A78BFA** (marca claro) | | neutral-400 | #86819C |
| violet-500 | #8C70FF | | neutral-500 | #6E6A82 |
| violet-600 | **#6D4AFF** (marca) | | neutral-600 | #55516A |
| violet-700 | #5B38F0 | | neutral-900 | #1C1830 |
| violet-800 | #4A2BD1 | | dark-0 / 1 / 2 / 3 | #0F0D16 / #17141F / #211D2C / #2A2536 |
| violet-900 | **#35256F** (marca oscuro) | | dark-border | #2E2A3B / #6F6985 |
| Gradiente de marca | `linear-gradient(135deg,#6D4AFF 0%,#B48CFF 100%)` | | | |

### 5.3 Tokens semánticos con contraste verificado
Leyenda: AA significa al menos 4.5:1 para texto; UI significa al menos 3:1 para bordes y controles (WCAG 1.4.11).

| Token | Claro | Oscuro | Contraste claro | Contraste oscuro | Uso |
|---|---|---|---|---|---|
| `--color-bg` | #F7F6FB | #0F0D16 | — | — | Fondo de pantalla |
| `--color-surface` | #FFFFFF | #17141F | — | — | Tarjetas, AppBar, TabBar |
| `--color-surface-2` | #F1EFF7 | #211D2C | — | — | Campos deshabilitados, segmentos, fondos de sección |
| `--color-surface-3` | #FFFFFF | #2A2536 | — | — | Sheets, diálogos y menús (elevados) |
| `--color-scrim` | rgba(15,13,22,.48) | rgba(0,0,0,.64) | — | — | Fondo detrás de modales |
| `--color-text` | #1C1830 | #F3F1F9 | 17.17 (surface) / 15.97 (bg) | 16.23 / 17.22 | Texto principal |
| `--color-text-2` | #55516A | #B9B4C8 | 7.58 / 7.05 | 9.02 / 9.57 | Texto secundario |
| `--color-text-3` | #6E6A82 | #948FA6 | 5.19 / 4.83 / 4.55 (surface-2) | 5.83 / 6.19 / 4.76 (surface-3) | Placeholders, hints, tabs inactivos |
| `--color-text-disabled` | #A9A5B8 | #5E596F | exento | exento | Solo para deshabilitados |
| `--color-border` | #E4E1EE | #2E2A3B | decorativo | decorativo | Divisores, bordes de tarjetas |
| `--color-border-strong` | #86819C | #6F6985 | 3.73 / 3.27 (surface-2) UI | 3.49 / 3.16 UI | Bordes de input, riel de switch apagado |
| `--color-primary` | **#6D4AFF** | **#6D4AFF** | 5.15 con blanco | 5.15 con blanco; 3.52 contra surface (UI) | Relleno de CTA, switch encendido, chip seleccionado |
| `--color-primary-hover` | #5B38F0 | #5B38F0 | 6.42 | 6.42 | Hover |
| `--color-primary-pressed` | #4A2BD1 | #4A2BD1 | 8.21 | 8.21 | Presionado |
| `--color-on-primary` | #FFFFFF | #FFFFFF | — | — | Texto sobre primario |
| `--color-primary-text` | #5B38F0 | **#A78BFA** | 6.42 / 5.97 | 6.67 / 7.08 | Links, ícono de tab activo, botón ghost |
| `--color-primary-subtle` | #F0ECFF | #2A2148 | — | — | Fondo de chip o tab activo, botón tonal |
| `--color-on-primary-subtle` | #4A2BD1 | #C9BAFF | 7.10 | 8.48 | Texto sobre primary-subtle |
| `--color-success` | #0B7A50 | #0B7A50 | 5.37 con blanco | 5.37 con blanco | Relleno de éxito |
| `--color-success-text` / `-subtle` | #0B7A50 / #E5F6EE | #3DD68C / #10291F | 5.37 / 4.79 | 9.68 / 8.24 | Badge "Disponible", "Match" |
| `--color-warning` | #F5A524 | #F5A524 | 8.42 con `--color-on-warning` #1C1830 | 8.42 | Relleno de advertencia (siempre con texto oscuro) |
| `--color-warning-text` / `-subtle` | #A85B00 / #FFF3DF | #F5B547 / #2E2210 | 5.05 / 4.60 | 10.02 / 8.56 | Avisos |
| `--color-danger` | #C42343 | #C42343 | 5.72 con blanco | 5.72 con blanco | Eliminar cuenta, rechazar |
| `--color-danger-text` / `-subtle` | #C42343 / #FDECEF | #FF6B85 / #33141C | 5.72 / 5.02 | 6.65 / 6.12 | Errores de formulario |
| `--color-info` | #1769C2 | #1769C2 | 5.47 con blanco | 5.47 | Relleno informativo (aquí se reutiliza el azul) |
| `--color-info-text` / `-subtle` | #1769C2 / #E8F1FC | #6CB2FF / #122339 | 5.47 / 4.80 | 8.17 / 7.13 | Tips, avisos neutros |
| `--color-primary-a12` / `-a24` | rgba(109,74,255,.12) / .24 | igual | — | — | Overlay de presionado, resplandor |
| `--focus-ring` | 0 0 0 3px rgba(109,74,255,.35) | 0 0 0 3px rgba(167,139,250,.45) | — | — | Foco visible (también en táctil) |

Combinaciones a evitar: `--color-text-3` sobre `primary-subtle` (4.48:1) y `--color-primary` como texto sobre `primary-subtle` en claro (4.45:1). Para texto sobre `primary-subtle` se usa `--color-on-primary-subtle`.

### 5.4 Escala tipográfica
Fuente Inter. Pesos **400, 500, 600 y 700**: el 800 y el 900 pasan a 700, o se importa `@fontsource/inter/800.css` si se quiere mantener. No va texto bajo 11px.

| Token | Tamaño / interlineado | Peso | Tracking | Uso | Reemplaza a |
|---|---|---|---|---|---|
| `--font-display` | 32/40 | 700 | -0.02em | Welcome, "¡Es un match!" | 30, 32, 36px, 2.25rem |
| `--font-h1` | 24/32 | 700 | -0.01em | Título de pantalla (Matches, Perfil, Inicio) | 22, 24, 26, 28px |
| `--font-h2` | 20/28 | 700 | 0 | Secciones, título de sheet o diálogo | 20px, 1.25, 1.375rem |
| `--font-h3` | 18/24 | 600 | 0 | **Título de AppBar (único)**, título de tarjeta | 15, 17, 18px, 1.0625, 1.125rem |
| `--font-body-lg` | 16/24 | 400 (500 en listas, 600 en botón lg) | 0 | Texto principal, valor de input | 15, 16px, 1rem |
| `--font-body` | 14/20 | 400 (600 en botón md) | 0 | Texto secundario, filas | 13, 14px, 0.8125, 0.875rem |
| `--font-caption` | 12/16 | 500 | 0 | Helper, metadatos, badges | 11, 12px |
| `--font-overline` | 11/16 | 600 | +0.06em, mayúsculas | Eyebrows. Las etiquetas de la TabBar usan 11/16 a 500, sin mayúsculas | 10, 11px |

### 5.5 Espaciado (grilla 4/8)
| Token | px | Uso |
|---|---|---|
| `--space-0-5` | 2 | Solo ajustes ópticos (badge sobre ícono) |
| `--space-1` | 4 | Separación entre ícono y texto pequeño |
| `--space-2` | 8 | Separación dentro de un componente, entre chips |
| `--space-3` | 12 | Padding de chips y filas, separación entre tarjetas |
| `--space-4` | 16 | **Margen lateral de pantalla**, padding de tarjeta |
| `--space-5` | 20 | Padding de botón lg |
| `--space-6` | 24 | Separación entre secciones |
| `--space-8` | 32 | Bloques grandes |
| `--space-10` / `-12` / `-16` | 40 / 48 / 64 | Héroes, estados vacíos |

Cómo migrar los valores fuera de grilla: 6 pasa a 4 u 8; 10 a 8 o 12; 14 a 12 o 16; 18 a 16 o 20; 3 a 4; 28 a 24 o 32. El área táctil mínima es de 48×48 (44 como mínimo absoluto).

### 5.6 Radios
| Token | px | Uso | Reemplaza a |
|---|---|---|---|
| `--radius-xs` | 4 | Barra de progreso, indicadores | 3px |
| `--radius-sm` | 8 | Tags, miniaturas | 6, 8, 10px |
| `--radius-md` | 12 | **Botones, inputs, selects, tiles de ícono** | 12, 14px, 0.75 y 0.875rem |
| `--radius-lg` | 16 | Tarjetas, tarjetas seleccionables, swipe card | 16, 18px, 1rem |
| `--radius-xl` | 24 | Bottom sheets (bordes superiores), diálogos | 20, 24, 28px |
| `--radius-full` | 9999 | Pills, chips, avatar de persona, switch | 50%, 99, 999, 9999px |

El avatar de una persona es redondo y el logo de una empresa es cuadrado con `--radius-md`. Así se distinguen los tipos de perfil a primera vista.

### 5.7 Elevación
| Token | Claro | Oscuro (sombra + superficie) | Uso |
|---|---|---|---|
| `--elev-0` | none, con borde `--color-border` | none, con borde | Tarjetas en listas |
| `--elev-1` | 0 1px 2px rgba(28,24,48,.06), 0 1px 3px rgba(28,24,48,.10) | 0 1px 2px rgba(0,0,0,.40), sobre surface-2 | Tarjeta destacada, thumb del switch |
| `--elev-2` | 0 4px 12px rgba(28,24,48,.10) | 0 4px 12px rgba(0,0,0,.50), sobre surface-2 | AppBar al hacer scroll, TabBar, dropdowns |
| `--elev-3` | 0 12px 32px rgba(28,24,48,.16) | 0 12px 32px rgba(0,0,0,.60), sobre surface-3 | Bottom sheet, diálogo, swipe card |
| `--elev-brand` | 0 8px 24px rgba(109,74,255,.28) | 0 8px 24px rgba(109,74,255,.40) | Solo un CTA flotante por pantalla y el match |

### 5.8 z-index, movimiento y foco
| z-index | Valor | | Movimiento | Valor |
|---|---|---|---|---|
| `--z-base` | 0 | | `--dur-fast` | 120ms (presionado, color) |
| `--z-raised` | 1 | | `--dur-base` | 200ms (switch, chips, tabs) |
| `--z-sticky` | 10 (AppBar) | | `--dur-slow` | 320ms (sheets, transiciones de pantalla) |
| `--z-tabbar` | 20 | | `--ease-standard` | cubic-bezier(.2,0,0,1) |
| `--z-dropdown` | 30 | | `--ease-out` | cubic-bezier(0,0,0,1) |
| `--z-overlay` | 40 (scrim) | | `--ease-spring` | cubic-bezier(.175,.885,.32,1.275), solo en swipe y match |
| `--z-modal` | 50 | | Accesibilidad | respetar `prefers-reduced-motion` |
| `--z-toast` | 60 | | Foco | `--focus-ring` en todo control, incluso en táctil |
| `--z-debug` | 1000 (solo errorLogger) | | Deshabilitado | fondo surface-2 y texto text-disabled (no `opacity:.5`) |

### 5.9 Componentes base mínimos
| # | Componente | Variantes y tamaños | Especificación | Reemplaza a |
|---|---|---|---|---|
| 1 | **Button** | primary, tonal (subtle), outline, ghost, danger. lg 52, md 44, sm 36 | Radio md. lg: 16/600 con padding de 20; md: 14/600. Relleno sólido, sin gradiente y sin sombra. Estados hover, pressed, disabled y loading (spinner sin cambiar el ancho). Ícono opcional a la izquierda o derecha. Ancho completo opcional | 57 clases, 14 CTA |
| 2 | **IconButton** | ghost, tonal. 40 de visual con 48 de área táctil | Ícono de 24, radio full. **BackButton** = IconButton con arrow_back | 8 botones "atrás" y los botones de header |
| 3 | **TextField** y **TextArea** | default, focus, error, disabled. Prefijo y sufijo opcionales | Alto 48, radio md, borde 1px border-strong, fondo surface. Foco: borde de 2px primary más focus-ring. Etiqueta arriba en 14/500, helper en 12 text-3, error en danger-text. Valor a 16px | unos 10 inputs y 2 textareas |
| 4 | **Select / Picker** | — | Se ve como un TextField con chevron y abre un BottomSheet con la lista (búsqueda opcional) | 5 selects |
| 5 | **SearchField** | — | Alto 44, radio full, fondo surface-2, ícono de búsqueda | faqv y co search |
| 6 | **Chip** | filtro (seleccionable), input (con X), sugerencia (+) | Alto 32, radio full, 14/500. Seleccionado: fondo primary-subtle, borde primary, texto on-primary-subtle y check de 16 | ob-chip, sem-tag, cpv-tag… |
| 7 | **Badge / Tag** | neutral, primary, success, warning, danger, info. Contador o punto | Alto 24, 12/600. Tonos `*-subtle` con texto `*-text` | unas 15 clases de badge o tag |
| 8 | **Switch** | on, off, disabled | Riel 48×28 con radio full. Apagado: border-strong. Encendido: primary. Thumb de 24, blanco en ambos temas, con elev-1. Transición dur-base | 3 toggles |
| 9 | **Checkbox / Radio** | — | 20px, color de acento primary, área táctil de 48 | inputs nativos |
| 10 | **SelectableCard** (radio-card) | single, multi | Padding 16, radio lg, borde 1px border. Seleccionada: borde de 2px primary y fondo primary-subtle. Tile de ícono de 40, título 16/600, descripción 14 text-2 | ob-card, ob-radio-card, auth-type-card, register-type-card y los inline del onboarding de empresa |
| 11 | **SegmentedControl** | 2 a 4 segmentos | Alto 40, radio full, fondo surface-2. El segmento activo va en surface con elev-1, texto 14/600 | cs__period-toggle, el selector de tipo |
| 12 | **AppBar** | con o sin atrás, con acciones | 56 más el safe-area superior, fondo surface, título h3 18/600 alineado a la izquierda, borde inferior al hacer scroll | 37 cabeceras |
| 13 | **BottomTabBar** | 4 a 5 ítems, con badge | 64 más el safe-area inferior. Ícono oficial de 24 y etiqueta 11/500. Inactivo: text-3. Activo: primary-text con indicador de 56×32 en primary-subtle | main-app__tab y cd__tab |
| 14 | **Card** y **SectionCard** | plana, elevada, interactiva | Fondo surface, radio lg, padding 16, elev-0 o elev-1 | ui-card y más de 50 bloques de tarjeta |
| 15 | **ListItem** | con ícono, avatar, switch, chevron o badge | Alto mínimo 56, padding 12×16. Ícono en tile de 40 con radio md sobre primary-subtle. Título 16/500, subtítulo 14 text-2 | Filas de Ajustes (sv, csv) |
| 16 | **Avatar** | persona (redondo) y empresa (radio md). Tamaños 32, 40, 56 y 96 | Iniciales como respaldo, indicador de verificado opcional | cpp-hero, cpv-company |
| 17 | **BottomSheet / Dialog** | sheet, diálogo de confirmación destructiva | Radio xl, fondo surface-3, elev-3, scrim, asa de 32×4, título h2 | sem-modal, pv-edit-modal |
| 18 | **Toast / Snackbar** | info, success, error | Sobre la TabBar, fondo `--color-text` con texto `--color-surface`, radio md | — |
| 19 | **Feedback** | EmptyState, Skeleton, Spinner, ProgressStepper | Stepper del onboarding: barra de 4px, radio full, primary sobre surface-2, más "Paso X de N" en caption | ui-empty, Spinner, el progreso del onboarding |
| 20 | **Icon** | 16, 20 y 24 | `<Icon name>` busca primero en el set oficial (home, offers, search, chat, person, matches, heart, bell, gear, close, like, more). Si no está, usa Material Symbols Rounded con `'FILL' 0, 'wght' 400, 'opsz' 24`. Sin `font-size` inline | 362 usos de Material y 15 inline |

Componentes de dominio que se arman con los anteriores: SwipeCard con sus botones de acción, MatchModal, OfferCard, ProfileHeader, ChatBubble con la barra de escritura (Composer) y StatTile/Chart.

### 5.10 Migración de tokens
| Token actual | Token nuevo |
|---|---|
| `--primary` / `--border-focus` | `--color-primary` (#6D4AFF) |
| `--primary-dark` | `--color-primary-pressed` |
| `--primary-light`, `--gradient-primary` | `--gradient-brand` (solo decorativo). En CTA pasa a `--color-primary` sólido |
| `--primary-03` … `--primary-75`, `--primary-subtle`, `--primary-soft` (22 tokens) | `--color-primary-subtle`, `--color-primary-a12`, `--color-primary-a24` |
| `--secondary`, `--secondary-NN` | Se eliminan (pasa a `--color-info` o `--color-primary-text` según el caso) |
| `--success`, `--success-NN`, `--success-bg-90`, `--green-*` | `--color-success`, `--color-success-text`, `--color-success-subtle` |
| `--danger`, `--danger-red`, `--danger-alt`, `--error-*`, `--red-*`, `--danger-ef-*` | `--color-danger`, `--color-danger-text`, `--color-danger-subtle` |
| `--warning`, `--warning-NN`, `--yellow-400` | `--color-warning`, `--color-warning-text`, `--color-warning-subtle` |
| `--bg` / `--surface` / `--surface-elevated` | `--color-bg` / `--color-surface` / `--color-surface-3` |
| `--text` (sin definir) y `--text-primary` | `--color-text` |
| `--text-secondary` | `--color-text-2` |
| `--text-muted` | `--color-text-3` (o `--color-text-disabled` si es un deshabilitado) |
| `--text-on-primary`, `--text-inverse` sobre primario, `'white'` | `--color-on-primary` |
| `--border` / `--divider` | `--color-border` |
| `--surface-overlay`, `--overlay-*` (6), `--welcome-overlay-*` | `--color-scrim` |
| `--shadow-sm/md/lg/xl`, `--shadow-black-*` (11), sombras con resplandor primary | `--elev-1`, `--elev-2`, `--elev-3`, `--elev-brand` |
| `--violet*`, `--pink`, `--blue-*`, `--purple-10`, `--indigo-06`, `--particle-*` | Se eliminan |
| `--text-h1` … `--text-micro`, `--weight-*`, `--leading-*` | `--font-display` … `--font-overline` (en atajo `font:`) y pesos 400–700 |
| `--radius-sm/md/lg/xl/full` | Se mantienen, salvo `xl`, que pasa de 20 a 24. Se agrega `xs` |
| `--transition-fast/normal/slow` | `--dur-fast/base/slow` más `--ease-*` |

### 5.11 Bloque CSS de referencia, para pegar en el prompt de Claude Design o en `variables.css`
```css
:root{
  --color-bg:#F7F6FB;--color-surface:#FFFFFF;--color-surface-2:#F1EFF7;--color-surface-3:#FFFFFF;--color-scrim:rgba(15,13,22,.48);
  --color-text:#1C1830;--color-text-2:#55516A;--color-text-3:#6E6A82;--color-text-disabled:#A9A5B8;
  --color-border:#E4E1EE;--color-border-strong:#86819C;
  --color-primary:#6D4AFF;--color-primary-hover:#5B38F0;--color-primary-pressed:#4A2BD1;--color-on-primary:#FFFFFF;
  --color-primary-text:#5B38F0;--color-primary-subtle:#F0ECFF;--color-on-primary-subtle:#4A2BD1;
  --color-success:#0B7A50;--color-success-text:#0B7A50;--color-success-subtle:#E5F6EE;
  --color-warning:#F5A524;--color-on-warning:#1C1830;--color-warning-text:#A85B00;--color-warning-subtle:#FFF3DF;
  --color-danger:#C42343;--color-danger-text:#C42343;--color-danger-subtle:#FDECEF;
  --color-info:#1769C2;--color-info-text:#1769C2;--color-info-subtle:#E8F1FC;
  --gradient-brand:linear-gradient(135deg,#6D4AFF 0%,#B48CFF 100%);
  --focus-ring:0 0 0 3px rgba(109,74,255,.35);
}
[data-theme='dark']{
  --color-bg:#0F0D16;--color-surface:#17141F;--color-surface-2:#211D2C;--color-surface-3:#2A2536;--color-scrim:rgba(0,0,0,.64);
  --color-text:#F3F1F9;--color-text-2:#B9B4C8;--color-text-3:#948FA6;--color-text-disabled:#5E596F;
  --color-border:#2E2A3B;--color-border-strong:#6F6985;
  --color-primary-text:#A78BFA;--color-primary-subtle:#2A2148;--color-on-primary-subtle:#C9BAFF;
  --color-success-text:#3DD68C;--color-success-subtle:#10291F;
  --color-warning-text:#F5B547;--color-warning-subtle:#2E2210;
  --color-danger-text:#FF6B85;--color-danger-subtle:#33141C;
  --color-info-text:#6CB2FF;--color-info-subtle:#122339;
  --focus-ring:0 0 0 3px rgba(167,139,250,.45);
}
```

### 5.12 Archivos que hay que tocar al migrar
- `src/styles/variables.css`: se reescribe con unas 25 sobrescrituras en oscuro, contra las 136 de hoy.
- `src/styles/base.css`: foco visible y estilo de deshabilitado.
- `src/styles/global.css`: color de `.app-container`.
- `src/lib/capacitorInit.js:17` (StatusBar), `capacitor.config.json:14` (splash) e `index.html` (`theme-color` y `lang`).
- `src/components/charts/LineChart.jsx` y `BarChart.jsx`: fallbacks.
- `src/context/AppContext.jsx:67`: usar `prefers-color-scheme` en el primer arranque.
- `src/hooks/useDarkMode.js`: eliminar, o usarlo como única fuente.
- Los 10 pasos de `views/onboarding/company/`: pasar los 132 estilos inline a componentes.
- `views/company/CompanyProfileCreatedView.css` y `views/candidate/CompanyPublicProfileView.css`: resolver el choque de `.cpv-wrapper` y `.cpv-company-name`.

