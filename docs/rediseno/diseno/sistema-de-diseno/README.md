Talently es una app Android chilena: trabajo, turnos, servicios y clases cerca de ti, con gente verificada. Este sistema es la única fuente de estilos de la app. Ninguna pantalla inventa un componente, un color, un tamaño, un radio ni una sombra; si falta algo, se agrega primero aquí, con todos sus estados, y después se usa.

## Cómo usar este sistema

- Carga `tokens.css` y después `components/bundle.css`. Todo valor sale de una variable: `--color-*`, `--space-*`, `--radius-*`, `--elev-*`, `--focus-ring`, `--gradient-*`, `--duration-*`, `--ease-*`, `--z-*`, `--layout-*`, más las clases de texto `.display`, `.h1`, `.h2`, `.h3`, `.body-l`, `.body`, `.label`, `.caption`, `.overline`, `.tab-label`, `.button-lg` y `.button-md`.
- El tema se elige con `data-theme="light"` o `data-theme="dark"` en `<html>` o en cualquier contenedor. Cada pantalla se entrega en claro y en oscuro; en el sistema de diseño se muestran lado a lado.
- En oscuro nada es blanco fijo: el único blanco literal es `color-on-primary` sobre un relleno.
- Las tarjetas del grupo «L1 · Tokens» muestran cada token en ambos temas con su hex y el contraste medido en vivo.

## Voz y textos

- Español de Chile, tuteo neutro y cercano. Instrucciones en imperativo («Elige tu comuna»); CTAs en infinitivo («Continuar», «Postular», «Tomar turno», «Reservar clase», «Solicitar cotización»).
- Mayúscula solo en la primera palabra («Mi perfil», «Cerrar sesión»). Sin emojis. Puntos suspensivos con «…».
- Solo se marca lo opcional, con «(opcional)»; nunca asteriscos.
- «correo», no email. «Me interesa» / «No me interesa», nunca LIKE/NOPE. Anglicismos permitidos: match, Part time, Online, Premium y el oficio Bartender.
- Oficios en forma digna e inclusiva: «Asesor/a del hogar», «Cuidador/a infantil», «Cuidador/a de adulto mayor», «Camarero/a de pisos». Nunca «nana», «empleada», «mucama», «niñera» ni «babysitter» en la interfaz.
- Ningún texto en inglés, ningún código crudo («part_time») y ningún error técnico: «No pudimos guardar. Revisa tu conexión e intenta de nuevo».
- Dinero en CLP con punto de miles y siempre con unidad: «$650.000 líquidos al mes», «$35.000 líquidos por turno», «$18.000 por clase de 60 min».
- Fechas relativas en una sola forma: «hace 5 min», «hace 3 h», «ayer», «12 dic», «sáb 12 dic · 19:00». Distancia como texto: «a 3 km · Ñuñoa». La edad nunca se muestra.

## Color

- Primario único: `color-primary` (#6D4AFF), relleno sólido con `color-on-primary` encima (5,15:1). El azul #1392EC no existe; `color-info` es solo para avisos informativos.
- Texto e íconos morados, links y pestaña activa: `color-primary-text`. Sobre `color-primary-subtle`, el texto es siempre `color-on-primary-subtle`.
- Borde de selección de OptionCard y Chip: `color-primary-text` (en oscuro #A78BFA sobre #2A2148, 5,47:1; #6D4AFF daría 2,89:1).
- Superficies: pantalla `color-bg`; tarjetas, campos, AppBar y TabBar `color-surface`; fondos secundarios `color-surface-2`; hojas, diálogos y menús `color-surface-3`. En oscuro la jerarquía la marcan estas superficies, no las sombras.
- Texto: `color-text` principal, `color-text-2` secundario, `color-text-3` ayudas y pestaña inactiva (nunca bajo 12 px), `color-text-disabled` solo en controles deshabilitados sobre `color-surface-2`.
- Bordes: `color-border` decorativo (tarjetas y divisores); `color-border-strong` en todo control (3,73:1 claro, 3,49:1 oscuro).
- Estados: rellenos `color-success`, `color-danger`, `color-info` con `color-on-primary`; `color-warning` con `color-on-warning`. Texto e íconos de estado siempre en la variante `-text`, sobre superficie o sobre su `-subtle`.
- Un solo rojo: `color-danger`, solo para errores y acciones destructivas. Un límite alcanzado es warning o neutro.
- `gradient-brand` y `gradient-hero-dark` son solo decorativos: logo, hero de Bienvenida y franja superior del modal de match. Nunca de fondo en un botón y nunca con texto encima (blanco sobre #B48CFF da 2,58:1).
- Contraste mínimo AA: 4,5:1 en texto, 3:1 en bordes, íconos y controles. El estado nunca se comunica solo con color.

## Tipografía

- Una sola familia: Inter (archivos en `fonts/`), pesos 400, 500, 600 y 700. Nunca 800 ni 900; nada bajo 11 px; escalable hasta 200 %.
- `display` 32/40 700: Bienvenida y «¡Hicieron match!». `h1` 24/32 700: título de pestaña y de paso. `h2` 20/28 700: título de hoja y de sección. `h3` 18/24 600: título del AppBar standard y de tarjeta principal.
- `body-l` 16/24: texto principal y valor de campo (subtítulo de paso en `color-text-2`). `body` 14/20: texto secundario y filas. `label` 13/18 600: etiqueta de campo. `caption` 12/16 500: ayuda, error, metadatos, badges. `overline` 11/16 600 en mayúsculas: rótulos de sección. `tab-label` 11/16 500: pestañas.
- Botones: `button-lg` 16/600 (lg) y `button-md` 14/600 (md y sm).

## Espaciado y layout

- Grilla de 4: `space-1` 4 … `space-16` 64. Margen lateral de pantalla y padding de tarjeta `space-4`; entre secciones `space-6`.
- Frame Android 390 × 844 (`layout-frame-width`, `layout-frame-height`), status bar 24, AppBar 56, TabBar 64, barra de gestos 24, contenido máximo 480. Solo el AppBar compensa el safe area superior; solo la TabBar o el CTA fijo, el inferior.
- Áreas táctiles de 48 × 48 (`layout-touch`), mínimo absoluto 44. Todo lo tocable es un botón real.
- Se diseña a 390 y se verifica a 360 y 412 sin scroll horizontal.
- Backoffice web (M11, admin.talently.app): frame de escritorio 1280 × 800 (`layout-web-width`, `layout-web-height`) con SideNav de 256 (`layout-sidenav`; riel de 104 bajo 1200 px, `layout-sidenav-rail`), AppBar web de 80 (`layout-webbar`), ReviewPanel de 448 (`layout-review`) y margen lateral `space-8`. Se verifica a 1024 y 1440. Sin hover propio: con mouse, al hacer clic se ve el estado presionado; el foco con teclado es obligatorio.

## Radios

- `radius-xs` barra de progreso · `radius-sm` tags y miniaturas · `radius-md` botones, inputs, tiles de ícono, Banner y logo de organización · `radius-lg` tarjetas y OptionCard · `radius-xl` hojas y diálogos · `radius-full` chips, pills, Badge, Switch y avatar de persona.
- Persona = redondo; organización (incluida «Familia en …») = cuadrado `radius-md`. En todas las vistas.

## Elevación

- `elev-0` sin sombra y borde `color-border` (tarjetas en lista) · `elev-1` thumb del Switch y segmento activo · `elev-2` AppBar con scroll y TabBar · `elev-3` hoja, diálogo y tarjeta del deck · `elev-brand` solo el modal de match y como máximo un CTA flotante.
- En oscuro las sombras son negras (.40, .50, .60).

## Foco

- El foco es siempre un contorno sólido de 2 px en `color-primary-text`, separado 3 px del control, más el halo `focus-ring` (clase `tl-focus`). El halo solo no cumple 3:1 (1,67:1 claro, 2,35:1 oscuro); el contorno sí (6,42:1 y 6,67:1).
- En los campos de texto el borde pasa a `color-primary-text` y se suma el halo.

## Movimiento

- `duration-fast` 120 ms presionado · `duration-base` 200 ms Switch, chips, tabs · `duration-slow` 320 ms hojas y transiciones.
- `ease-standard` en todo. `ease-spring` solo en el swipe del deck de empleos y en el modal de match.
- Con «reducir movimiento» las transiciones pasan a 0 ms (`bundle.css`).

## Capas

- `z-sticky` 10 · `z-tabbar` 20 · `z-dropdown` 30 · `z-scrim` 40 · `z-modal` 50 · `z-toast` 60. Ningún componente usa otro valor.

## Iconografía

- Un solo set: outline de 24 px, trazo 1,8, puntas y uniones redondeadas, color `currentColor` (toma el color del texto). Algunos íconos llevan un acento de relleno del mismo color entre 18 % y 55 % de opacidad.
- Prohibido Material Symbols, Font Awesome, emojis o cualquier otro set; prohibido mezclar estilos rellenos con outline.
- Íconos siempre con etiqueta. Un ícono por acción: Cerrar = IconClose, Quitar ítem = basurero en `color-text-2`, Me interesa = IconLike, Volver = flecha izquierda, Ajustes = IconGear (rueda), Filtros = IconFilter (sliders), Buscar y pestaña Explorar = IconSearch.
- Inter no trae flechas ni checks: esos signos se dibujan siempre con un ícono del set, nunca con un carácter.
- Fuente de los íconos: `assets/Iconos/icons.json` (nombre → SVG completo, grupo y uso) y un SVG por ícono en `assets/Iconos/`, `assets/Oficios/` y `assets/Clases/`. Se insertan inline dentro de `<span class="tl-icon">` (24 px; `tl-icon--20` en Banner, `tl-icon--16` en el check del Chip) para que tomen `currentColor`.
- Los 14 oficiales de la sección 10.3 son copia exacta. IconSearch reemplaza a IconExplore; IconFilter (antes «IconGear») son los sliders; IconGear nuevo es la rueda dentada.
- Pestañas: Inicio IconHome · Explorar IconSearch · Actividad IconCalendar · Mensajes IconChat · Perfil IconPerson.
- Tipos de publicación, sin color propio: Empleo IconOffers · Turno IconClock · Servicio IconTool · Clase IconBook.
- Datos de una publicación (InfoTag y filas de la tarjeta), un ícono por tipo de dato: jornada IconClock · contrato IconDocument · fecha u horario IconCalendar · modalidad IconLocation · clase de prueba IconBook · cupos IconPeople · distancia, comuna o cobertura IconLocation · «Por qué ves esto» IconInfo.
- Verificación = IconShield. Lo pagado = IconBoost, solo en PromotedBadge «Destacado» y en «Impulsa tu perfil»; nunca junto a IconShield.
- IconFilter rellena sus perillas con `var(--color-surface)`: va solo sobre `color-surface` (AppBar de Explorar).
- Categorías: un ícono por oficio (`IconJob…`, 16) y por categoría de clase (`IconClass…`); la clase Tecnología reutiliza `IconJobTech`. Hogar y cuidados no usa la casa, Seguridad no usa el escudo y Profesionales no usa el maletín.

## Marca

- El logo oficial es la «T» de Talently, en tile con `gradient-brand` o sin tile; se usa exactamente desde sus SVG oficiales (`assets/Logo/talently-logo-tile.svg` y `assets/Logo/talently-logo.svg`), nunca redibujado ni reemplazado por un ícono genérico.
- BrandLogo: `tl-logo tl-logo--sm` (32), `--md` (56) y `--lg` (72), con el SVG oficial inline.
- Sobre `color-bg` o `color-surface` va cualquiera de las dos variantes. Sobre un gradiente (hero de Bienvenida) solo la variante con tile: la sin tile desaparece sobre `gradient-brand` y queda en 2,47:1 sobre `gradient-hero-dark`.
- Ilustración solo en el hero de Bienvenida: plana, trazo redondeado, en blanco, #E6DBFF y morados de marca, personas sin rostro detallado. Nunca fotos de stock ni emojis.

## Controles

- Todo control tiene 7 estados: default, presionado, foco, seleccionado, deshabilitado, error y cargando; el que no aplica se declara con su motivo. En mockups se fuerzan con `is-pressed`, `is-focus`, `is-selected`, `is-disabled`, `is-error` e `is-loading`; en la app salen de `:active`, `:focus-visible`, `disabled` y los atributos `aria-*`.
- Presionado: capa del color del contenido al 12 % (8 % en Select y filas de lista); el Button primary pasa a `color-primary-pressed`.
- Deshabilitado: `color-surface-2` con `color-text-disabled` en todas las variantes; nunca opacidad. El texto que explica por qué (ayuda o descripción) sigue legible en `color-text-2`.
- Lo marcado lleva `color-primary-text` en borde o anillo (Chip, Checkbox, Radio, Switch), para cumplir 3:1 también sobre `color-surface-3` en oscuro.
- Campos y casillas conservan su relleno `color-surface`, también dentro de una hoja.
- Button: `tl-btn` + `--primary|--tonal|--outline|--ghost|--danger` + `--lg|--sm` (md por defecto) + `--block`; etiqueta en `.tl-btn__label`; cargando con `.tl-btn__spinner`. Una sola acción principal por pantalla.
- IconButton `tl-iconbtn` (ghost o `--tonal`, siempre con `aria-label`); BackButton = IconButton con `IconArrowLeft`. Contador `tl-iconbtn__badge` (desde M2) solo con un número real: notificaciones sin leer en la campana y filtros activos en Filtros; desde 10, «9+».
- Campos: `tl-field` (TextField, TextArea con contador, MoneyField `tl-money`, Select `tl-select`) y SearchField `tl-search`. Etiqueta arriba, ayuda o error abajo; error con ícono alerta y mensaje humano. Validación en vivo: `is-valid` con check en success (M3).
- Contraseña: PasswordField (`tl-field` con `tl-field__toggle` y reglas `tl-rules`). Enlace en texto: `a.tl-link`. Separador «o»: `p.tl-divider`. Logo de un servicio externo en un Button: `tl-btn__logo` (M3). Grilla de las 16 categorías de oficio: CategoryGrid `tl-catgrid` (M3).
- Listas largas (comuna, oficio, materia, unidad): Select + SheetPicker con buscador.
- Chip `tl-chip` (filter, `--input` con X, `--suggestion` con +, `--menu` con un valor que se cambia en una hoja, como la comuna en EXP-02; `--lead` con el ícono de la categoría, que el check reemplaza al elegirlo, en EXP-03) y ChipGroup `tl-chipgroup` con contador «2 de 3»; el límite es warning.
- Badge `tl-badge` + tono; cada etiqueta del diccionario siempre con el mismo tono.
- Switch `tl-switch`, Checkbox `tl-checkbox` y Radio `tl-radio`, dentro de una fila `label.tl-choice` tocable de 48; en grupo, `fieldset.tl-group`.
- Áreas táctiles: Button sm, Chip e IconButton extienden su área a 48; la X de un chip input, a 44.
- Cargando: spinner dentro del control que espera; una lista que carga usa Skeleton, nunca un spinner suelto.

## Estructura

- AppBar `tl-appbar`, uno por pantalla:
  - Large en pestañas (H1 a la izquierda): campana siempre, IconFilter solo en Explorar, IconGear solo en Perfil, y selector de actor `tl-actor` solo en Inicio y Perfil si la persona pertenece a una organización que no es su hogar. Bajo 375 px de ancho, el selector baja de 168 a 144 px de máximo.
  - Standard en pantallas apiladas (`--standard`): BackButton, H3 centrado y hasta 2 acciones.
  - Conversación (`--chat`, M5): BackButton, avatar y nombre tocables (abren el perfil público) y ⋯.
  - Transparente (`--transparent`) sobre foto o cabecera `color-surface-2`, con íconos en círculo `color-surface` al 90 %.
  - Con `is-scrolled` gana `color-surface` y `elev-2`.
- BottomTabBar `tl-tabbar`: Inicio, Explorar, Actividad, Mensajes, Perfil, siempre en ese orden. La pestaña activa lleva la píldora `color-primary-subtle` y `color-primary-text`. Badge de no leídos en `color-primary`, solo con no leídos reales.
- OptionCard `tl-option` en `tl-optgroup` (lista) o `--grid` (2 columnas), single o multi, con un solo indicador: círculo de 22 a la derecha. Plan (`--plan`, M7, PUBL-08): Clásica y Premium lado a lado, con precio o «Pronto» (`.tl-option__price`) y lo que incluye con viñetas (`.tl-option__list`).
- SegmentedControl `tl-seg`, una variante por fase: F1 «Empleos · Turnos», F2 «Empleos · Turnos · Clases». Segmento activo en `color-surface-3` con `elev-1`.
- Card `tl-card` (elev-0; `--action` si se toca) y SectionCard `tl-section` (H3 + lápiz «Editar» o Button sm «Agregar»; vacía = ayuda + Button tonal).
- ListItem `tl-listitem` en `ul.tl-list`: tile, avatar, valor, chevron, switch, badge, punto de no leído `tl-unread` (desde M2, con «Sin leer» oculto), conversación `--chat` (Mensajes, M5), persona `--person` (GES-04 y GES-05, M6; postulante con `.tl-listitem__badges` en GES-02, M7), desplegable `--expand` (AYU-01, M8), Button al final (CFG-04, M8), dos canales `.tl-listitem__end--cols` (CFG-03, M8), bloques horarios con InfoTag bajo el título (ACT-04, M9), quitar (basurero `color-text-2`) y danger (abre un Dialog o, con confirmación escrita, su pantalla).
- Avatar `tl-avatar`: persona redondo, organización cuadrado (`--org`); 32, 40, 56 y 96; iniciales sobre `color-primary-subtle`; escudo de verificación solo con verificación real; con foto `--photo` (prestadores de servicios, M10: en los mockups, el rayado de la galería).
- BottomSheet `tl-sheet` sobre `tl-scrim`: asa que arrastra, H2, botón Cerrar, cuerpo y pie con hasta 2 acciones. Dialog `tl-dialog` solo para confirmar.
- Toast y Snackbar `tl-snackbar`: sobre la TabBar, de a uno; en una pantalla apilada sin TabBar ni CTA fijo, `--no-tabbar` lo baja sobre la barra de gestos. Toast sin acción (4 s); Snackbar con «Deshacer» o «Reintentar» (8 s).
- Backoffice web (M11): WebShell `tl-web` con SideNav `tl-sidenav` (las 5 secciones, siempre las mismas para todos los roles: Verificaciones · Organizaciones · Publicaciones · Reportes · Usuarios y auditoría; contador real; riel `--rail` bajo 1200 px), AppBar web `tl-appbar--web`, DataTable `tl-table` (colas y registro de auditoría, con `.tl-filterbar` de Chips), ReviewPanel `tl-review` (datos, checklist y acciones al lado del documento), Dialog web `tl-dialog--web` (560, confirma una acción con su motivo) y Snackbar web `tl-snackbar--web`.

## Estados de pantalla

- Cargando: Skeleton `tl-skel` con la forma del contenido (lista, tarjeta, perfil), `aria-busy` y «Cargando…» oculto. El Spinner (16, 24, 40) va solo dentro del control que espera.
- Vacío: EmptyState `tl-empty` con un ícono del set, un título, una explicación y una acción real o una sugerencia útil.
- Error: ErrorState `tl-empty--error` con «Reintentar». Si hay datos guardados, se muestran con el Banner info «Sin conexión. Mostramos lo último que cargaste».
- Resultado de una acción importante: ResultScreen `tl-result--success|info|error`, con un solo mensaje y el CTA fijo `tl-ctabar`.
- Todo aviso que se queda en pantalla es un Banner `tl-banner` (info, success, warning, danger; `--fixed` bajo el AppBar). Lo temporal es un Snackbar.

## Componentes de dominio

- Chat: MessageBubble `tl-msg` (propia en `color-primary`, ajena en `color-surface-2`, hora y estado real abajo; en cola `--queued` sin conexión), Composer `tl-composer` (con el aviso «Por tu seguridad…» en `tl-composer__notice` al escribir un teléfono o un enlace), SystemCard `tl-syscard` (nunca una burbuja; `--off` cuando un documento compartido ya no está disponible; cotización con `.tl-syscard__amount`, M10) y ContextChip `tl-ctxchip` («Turno · Garzón · sáb 12 dic»; fijo bajo el AppBar en `tl-chat__context`).
- Match (M5): MatchModal `tl-match` («¡Hicieron match!», franja `gradient-brand` sin texto) y NewMatches `tl-newmatches` («Nuevos matches (n)» en Mensajes, solo matches sin mensajes).
- Timeline `tl-timeline`: hechos en `color-success-text`, actual en `color-primary-text`, pendientes en `color-text-3`. Niveles de verificación (`--levels`, M8, VER-01): cada nivel con su estado, qué permite y su acción; en revisión (`--review`) y rechazada (`--error`, con el motivo).
- Contratar (M7): PUBL-08 usa OptionCard de plan; GES-02, ListItem de postulante; GES-03 y EXP-05, el Deck con la tarjeta de persona; GES-01 e INI-02, la Card de estado de verificación de la organización.
- Turnos (M6): ShiftBlock `tl-shift` en `tl-shifts` (fecha y horario grandes; un bloque por día en una serie) y la barra de cupos `tl-cupos` («Confirmados 5/8»). La tarjeta de turno lleva «Tomar turno» como Button tonal sm a la derecha (`tl-pub__cta--end`).
- CodeInput `tl-code`: 6 casillas de 48 y un solo campo real con `autocomplete="one-time-code"`.
- StepLayout `tl-steplayout`: AppBar standard «Paso X de N» + menú ⋯, barra `tl-progress` de 4 px, H1 + subtítulo, contenido y CTA fijo «Continuar» («Omitir» como ghost aparte).
- MediaUploader: avatar `tl-upload-avatar` (logo cuadrado: `tl-upload-avatar--org`, M3), documento `tl-doc`, galería `tl-gallery` (hasta 8), cámara `tl-capture` con guía de encuadre (VER-02, M8) y ejemplo visual `tl-docsample` (esquema del documento, M8), con «Tomar foto» y «Elegir de la galería».
- Perfil y cuenta (M8): PRF-01 y PRF-02 usan SectionCard y la Card de completitud («Te falta 1 cosa»); VER-01, el Timeline de niveles; CFG-01 a CFG-06, ListItem (Button al final y dos canales); AYU-01, ListItem desplegable; LEG-01 y LEG-02, LegalDocument `tl-legal` (fecha única, índice y Body-L).
- DynamicFields `tl-dyn`: los campos del oficio, iguales en onboarding, publicar, filtros y detalle.
- AvailabilityGrid `tl-avail` (7 días × 4 franjas), SlotPicker `tl-slots` (14 días + horas libres; adelanto `--peek` en DET-01 Clase y «sin horarios» `.tl-slots__empty` con «Avisarme», M9) y CalendarWeek `tl-week` (Día y Semana).
- Clases (M9): EXP-03 y DET-01 Clase usan PublicationCard, SectionCard y el adelanto del SlotPicker; RES-01, el SlotPicker; RES-02 en F3, el Banner con contador `.tl-banner__timer`; RES-03, Timeline y Badge de estado de reserva; ACT-04, ListItem con bloques horarios (no el AvailabilityGrid, que es por franjas).
- Servicios (M10, F3): EXP-04 y DET-01 Servicio usan PublicationCard y Avatar con foto (`tl-avatar--photo`); los paquetes, la OptionCard de plan; SRV-02, la SystemCard de cotización y el certificado de antecedentes que comparte el prestador (nunca una insignia); RES-02, el desglose de pago `tl-breakdown` con el cargo de servicio de Talently en su propia línea; RES-03, Timeline de la visita (Llegué · Terminé · Servicio realizado) y «Ayuda · 133 · 131».
- Backoffice web (M11): DocumentViewer `tl-viewer` (foto o PDF con caras, páginas y zoom; marcador rayado en los mockups; siempre con el Banner «El archivo se borra 30 días después de revisado.») y FlaggedText `mark.tl-flag` (señales de moderación resaltadas y numeradas, con su lista en ListItem `.tl-listitem__tile--warning`). Plazos con InfoTag («Vence en 6 h hábiles»), Badge warning con 1 h o menos y danger si venció.
- Confianza: VerificationBadge `tl-verify` (sin verificar, en revisión, verificado, vencido; se toca), RatingStars `tl-rating` («4,8 (23)», o «Sin reseñas aún») y ReliabilityMeter `tl-reliab` («Confiabilidad 96 % · 25 turnos cumplidos», desde 3 turnos). Para calificar, `tl-stars` (y `--lg` en REV-01).
- Lo pagado: PromotedBadge `tl-promoted` «Destacado», neutro, con borde y flecha que sube; nunca pegado a una insignia de verificación. Antes de F3, «Pronto».
- ActionPair `tl-actionpair`: «No me interesa» (56) y «Me interesa» (64), el mismo par en deck, detalle y Personas sugeridas.
- Amount `tl-amount`: monto + líquidos/brutos (sueldos y tarifas) + unidad, en sm, md o lg. Desglose de pago `tl-breakdown` (M10): conceptos, cargo de servicio de Talently en su línea y total.

## Publicaciones

- PublicationCard `tl-pub`: una estructura para Empleo, Turno, Servicio y Clase. Orden fijo: cabecera (Avatar + nombre + VerificationBadge) · título H3 · InfoTag · Amount · dato del tipo (cupos o nota) · lugar · «Por qué ves esto» · CTA. Si falta un dato, esa parte no aparece; nada cambia de lugar.
- Toda la tarjeta abre DET-01 (enlace del título estirado); la VerificationBadge y el CTA se tocan aparte.
- Variantes: completa (EXP-02, EXP-03, EXP-04 y vista previa al publicar), compacta `tl-pub--compact` (INI-01, EXP-01 en lista, EXP-07, PRF-02, PRF-11: título 16, hasta 2 InfoTag, sin «Por qué ves esto» ni CTA) y deck.
- CTA: Button tonal md a lo ancho («Tomar turno», «Solicitar cotización», «Ver horarios»). Empleo no lleva CTA: se postula desde DET-01 con el ActionPair.
- Turno: «Quedan 3 de 8 cupos» en texto; con 2 o menos, Badge warning; sin cupos, Badge neutral «Cupos completos» y CTA «Unirme a la lista de espera».
- Premium (F3): la misma tarjeta con PromotedBadge «Destacado» arriba a la derecha. No cambian colores, borde, sombra, tamaño ni orden; si el nombre no cabe junto a «Destacado», se corta con …
- Deck `tl-deck` + `tl-deck__card`: la tarjeta completa en `color-surface-3` con `elev-3`, avatar 56 y bloque «Requisitos» con el estado para la persona; la siguiente asoma 12 px; ActionPair debajo. Al arrastrar, sello «Me interesa» (`color-primary-subtle`) o «No me interesa» (`color-surface-2`), giro de 4° y vuelta con `ease-spring`. Sirve también para Personas sugeridas con una Card de persona.
- InfoTag `tl-tag` (nuevo en L6): dato con ícono de 16, alto 28, radio sm, `color-surface-2`, Body 14 en `color-text-2`. No se toca: no es Chip ni Badge.

## Reglas de consistencia

- Un solo Button primary (sólido `color-primary`, `radius-md`, 600), un solo BackButton, un solo AppBar por pantalla, un solo indicador de selección en tarjetas (círculo de 22 a la derecha), un solo Switch, un solo estilo de chip seleccionado, un solo Badge y un solo BottomSheet.
- El mismo dato se ve igual en tarjeta, detalle y perfil: mismo ícono, misma etiqueta, mismo formato de monto.
- Deshabilitado = fondo `color-surface-2` con texto `color-text-disabled`; nunca bajar la opacidad.
- Cada pantalla tiene sus estados: cargando (Skeleton), vacío (EmptyState con CTA real), error («Reintentar»), sin conexión (Banner) y éxito o error de cada acción (Snackbar).
- Ningún dato falso: sin punto «en línea», sin «Verificado» sin verificación, sin «Perfil al 100 %», sin «Leído» si no se leyó.
- Lo pagado se marca con «Destacado» (PromotedBadge), que nunca se parece a una insignia de verificación.
- Una sola PublicationCard para los 4 tipos y una sola tarjeta de deck; por tipo solo cambia el contenido.

## Dónde se usa cada componente

IDs canónicos de los módulos M2 a M11 (índice en la tarjeta ScreenIndex). Si una pantalla necesita algo que no está aquí, se agrega primero a la librería, con sus estados.

| Lote | Componente | Pantallas |
|---|---|---|
| L2 | BrandLogo | AUTH-01, AUTH-07, SideNav del backoffice (ADM-01 a ADM-05) |
| L2 | Íconos (set único) | Todas las pantallas |
| L3 | Button | Todas. Por ejemplo: AUTH-01 (lg primary y outline), AUTH-02 y AUTH-04 («Continuar con Google» y separador «o»), CTA «Continuar» de StepLayout, DET-03, PUBL-07, RES-02, CFG-06; backoffice: Aprobar, Verificar y Suspender preventivamente al pie del ReviewPanel (ADM-01 a ADM-04) |
| L3 | IconButton | Acciones del AppBar (campana, Filtros, IconGear) en INI-01, EXP-01 a EXP-05, ACT-01 a ACT-03, MSG-01, PRF-01; lápiz «Editar» en PRF-01 y PRF-02; Composer en MSG-02; estrellas en REV-01; Anterior y Siguiente de la cola y Cerrar sesión en el backoffice (ADM-01 a ADM-05) |
| L3 | BackButton | Toda pantalla apilada: DET-01, PRC-01, MSG-02, TUR-01, NOT-01, RES-01, RES-03, SRV-02, GES-01 a GES-05, PRF-10, PRF-11, VER-01 a VER-04, CFG-01 a CFG-06, LEG-01, LEG-02, AYU-01, AYU-02 y todos los pasos de StepLayout; detalles del backoffice (ADM-01 a ADM-05) |
| L3 | TextField | AUTH-02, AUTH-04, AUTH-05, AUTH-06, ONB-03, ONB-O1 (RUT), ONB-O2, ONB-A1, PUBL-02, VER-03, VER-04, CFG-02, CFG-06, PRF-03 (Tomás) |
| L3 | PasswordField | AUTH-02 y AUTH-06 (con reglas), AUTH-04 (solo el ojo) |
| L3 | TextArea | DET-02, ONB-O3 («0/300»), PUBL-02 (paso 4, «0/3000»), PRF-03, REV-01, SRV-01, AYU-02, ADM-01 a ADM-04 (mensaje para la persona o el autor y nota interna) |
| L3 | MoneyField | ONB-T3, ONB-K3, ONB-S3, EXP-06, PUBL-02, PUBL-03, PUBL-04, PUBL-05, PUBL-06 |
| L3 | SearchField | EXP-07, SHT-COMUNA, SHT-OFICIO, AYU-01, AppBar web del backoffice (ADM-01 a ADM-05: nombre, RUT o correo) |
| L3 | Select | ONB-03 (Comuna), ONB-O1 (Rubro), ONB-O2, ONB-A1 y PRF-03 (Nivel de Tomás), EXP-06, PUBL-02, ACT-04 (horas, anticipación y descanso), AYU-02, ADM-04 («Hasta», al suspender preventivamente) |
| L3 | SheetPicker | SHT-COMUNA y SHT-OFICIO (desde ONB-03, ONB-T1, EXP-06 y PUBL-02); rubro en ONB-O1 |
| L3 | CategoryGrid | SHT-OFICIO sin texto escrito (desde ONB-T1, EXP-06 y PUBL-02); rubro en ONB-O1 |
| L3 | Chip | Filter: EXP-02, EXP-03 (categorías con ícono), EXP-04 (oficios), EXP-06, SRV-01 (urgencia y franja), PUBL-06, MSG-01, ONB-T2, ONB-T3, PUBL-03, PUBL-05, REV-01, RES-01 («¿Para quién es?», hora, duración y modalidad), ACT-04. Con menú: EXP-02 y EXP-04 (comuna), EXP-03 («Para Tomás» y comuna). Input: ONB-T1 (oficios elegidos). Suggestion: ONB-T1 (oficios populares). Filter en el backoffice: barra de filtros sobre la tabla (ADM-01 a ADM-05) |
| L3 | ChipGroup | ONB-T1 («2 de 3»), ONB-T2, ONB-T3, ONB-K1, PRF-03 |
| L3 | Badge | ACT-02, TUR-01, GES-01, GES-02, RES-03, SRV-02 (solicitud de servicio y pago: Pendiente de pago, Pagado, Reembolsado), RES-02, VER-01, ONB-01 («Reservas desde…»), ONB-T4 («Obligatoria»), PUBL-08 y PRF-12 («Pronto»), ADM-01 a ADM-05 (riesgo, gravedad, plazo por vencer o vencido, verificación y cuenta suspendida) |
| L3 | Switch | ONB-T2 («Tengo movilización propia»), EXP-06 («Solo organizaciones verificadas»), PUBL-03 («Pedir identidad verificada»), PRF-05 («Visible»), CFG-03, CFG-05, ACT-04 («Confirmo cada reserva»), RES-01 («Clase de prueba gratis»), EXP-06 de Clases («Disponible esta semana», «Clase de prueba») y de Servicios («Solo identidad verificada»), PUBL-06 («Emito boleta») |
| L3 | Checkbox | AUTH-02 (Términos), ONB-H1 (Hay niños · Hay adulto mayor · Hay mascotas), PUBL-04 (tareas y contexto), PRC-01 («Para contratar como corresponde»), ADM-01 y ADM-02 (checklist), ADM-04 («Suspender preventivamente mientras tanto») |
| L3 | Radio | ONB-T2 («Disponible desde»), ONB-K5, ONB-A1, DET-02 (preguntas filtro), ACT-04 y PUBL-05 (política de cancelación), RES-03 (motivo al rechazar; «Hubo un problema»; compartir la visita), RES-01 (servicio de precio fijo), SRV-02 (motivo al rechazar una cotización), CFG-05 (tema), SHT-REPORTE, ADM-01 a ADM-04 (motivo en el Dialog web) |
| L4 | AppBar | Large: INI-01, INI-02, EXP-01 a EXP-05, ACT-01 a ACT-03, MSG-01, PRF-01, PRF-02. Standard: pantallas apiladas (PRF-10, PRF-11, VER, CFG, LEG, AYU) y StepLayout. Conversación: MSG-02, MSG-02b. Transparente: DET-01. Selector de actor: INI-02, PRF-02 (y SHT-ACTOR) |
| L4 | BottomTabBar | INI-01, INI-02, EXP-01 a EXP-05, ACT-01 a ACT-03, MSG-01, PRF-01, PRF-02 |
| L4 | OptionCard | ONB-01, ONB-O1, ONB-O4, ONB-H1, INI-01 (hogar, «¿Qué necesitas?»), PUBL-01, PUBL-04 (tipo de trabajo), PUBL-08 (plan: Clásica y Premium lado a lado), PRF-04, PRF-12, DET-01 Servicio (paquetes Básico, Completo y Plus, con la OptionCard de plan) |
| L4 | SegmentedControl | EXP-01 a EXP-04 (Empleos · Turnos, y Clases en F2; solo los que aplican: Carolina ve Personas · Clases en EXP-03), ACT-01 a ACT-03 (y Día · Semana en ACT-01), GES-04, PRF-10, DocumentViewer en ADM-01 y ADM-02 (caras y zoom) |
| L4 | Card | INI-01 («Hoy en tu agenda», completitud), INI-02 (KPIs), ACT-03 y GES-01 (publicación propia con Badge de estado y métricas), GES-01 e INI-02 (estado de verificación de la organización), TUR-01 |
| L4 | SectionCard | PRF-01, PRF-02, PRF-10, PRF-11, DET-01 (Descripción, Requisitos, Beneficios; en Clase: materias, modalidades, paquetes, cancelación, formación y reseñas; en Servicio: servicios, paquetes, cobertura y horario, portafolio, credenciales y reseñas), RES-03, SRV-02, VER-01, ADM-01 y ADM-02 (Datos declarados, Lo que declaró), ADM-03 (Descripción y Requisitos), ADM-04 (el reporte y dónde pasó), ADM-05 (perfiles, verificaciones, reportes y registro) |
| L4 | ListItem | NOT-01, MSG-01 (conversación), GES-04 y GES-05 (persona), TUR-01, SHT-ACTOR, INI-02 («Requiere tu atención»), ACT-02 («Impulsa tu perfil»), PRC-01 («Retirar postulación», danger), GES-01 («Cerrar publicación», danger), GES-02 (postulante), GES-04, GES-05, PRF-06 (equipo), PRF-01 y PRF-02 (accesos), PRF-05 (Switch «Visible» y danger), VER-04, CFG-01 (danger: Cerrar sesión, Eliminar cuenta), CFG-02 y CFG-04 (Button al final), CFG-03 (dos canales), CFG-05, LEG-01 y LEG-02 (índice), AYU-01 (desplegable), ACT-04 (bloques horarios y excepciones), RES-03 (calendario y videollamada; en la visita: compartir, mensaje y Ayuda), PRF-01 de Carolina (Tomás), DET-01 Servicio (cada servicio con su forma de precio), INI-01 de Luis (solicitudes por cotizar), ADM-03 (señales de moderación, con su número), ADM-05 (perfiles, verificaciones, reportes y registro de la cuenta) |
| L4 | Avatar | PublicationCard, DET-01, DET-03, MSG-01, MSG-02, SHT-ACTOR, ONB-03, PRF-01 (96), PRF-10, PRF-11, GES-02 a GES-05. Con foto (prestadores): EXP-04, DET-01 Servicio, SRV-01, SRV-02, RES-03, PUBL-06, DataTable y ReviewPanel del backoffice (ADM-01 a ADM-05) |
| L4 | BottomSheet | SHT-ACTOR, SHT-COMUNA, SHT-OFICIO, SHT-REPORTE, EXP-06, DET-02, AUTH-08, ONB-02, PUBL-01, PUBL-04 (verificar identidad al publicar), GES-01 (cerrar con motivo), GES-02 (no seleccionar), PRC-01 (agendar entrevista), PRF-10 (cambiar estado), PRF-03 (también Tomás), RES-02, RES-03 (rechazar con motivo), ACT-04 (bloques del día y excepción), EXP-06 de Clases, AUTH-08 (primera reserva), RES-02 de Servicios (confirmar y pagar), RES-03 (compartir la visita, Ayuda · 133 · 131, «Hubo un problema»), SRV-02 (enviar y rechazar cotización), EXP-06 de Servicios, MSG-02b, menú de opciones de MSG-02 y del onboarding |
| L4 | Dialog | PRF-03 («¿Descartar cambios?»), PRC-01 («Retirar postulación»), PRF-05 («Eliminar este perfil»), CFG-01 («Cerrar sesión»), RES-03 («¿Cancelar la clase?»), pasos del onboarding («¿Salir del registro?»). Web (`tl-dialog--web`): ADM-01 (rechazar con motivo, pedir otro documento), ADM-02 (rechazar la verificación), ADM-03 (rechazar con motivo para el autor), ADM-04 (escalar, suspender preventivamente, descartar) |
| L4 | Toast y Snackbar | DET-01 y DET-02 («Postulaste…»), MSG-02 («Recibimos tu reporte…»), GES-01 («Publicación pausada · Deshacer»), GES-03, PUBL-08 y PRF-12 («Te avisaremos…»), PRF-03, NOT-01 («Cambiaste a…», «Marcaste todas como leídas»), INI-01 (toast de salida), RES-01 («Este horario se acaba de ocupar. Elige otro», «Te avisaremos…»), RES-03 y ACT-04, SRV-02 («Le enviamos tu solicitud a Luis», «Pagaste $89.250…»), RES-03 de Servicios («Le avisamos a Rosa que llegaste»). Web: ADM-01 («Aprobaste la credencial SPD de Andrés Carrasco · Deshacer»), ADM-02 («Verificaste Eventos del Valle SpA»; error con «Reintentar») |
| L5 | EmptyState | MSG-01, NOT-01, ACT-01, EXP-01 (deck vacío: «Viste todas las ofertas cerca»), EXP-02, EXP-03, EXP-04 («No hay prestadores de Refrigeración en San Miguel», con comunas vecinas), EXP-07, GES-02, SYS-404. En RES-01, el SlotPicker trae su propio «sin horarios», ADM-01 (cola vacía), ADM-04 (sección sin permiso para el rol), ADM-05 (búsqueda sin resultados), DocumentViewer (la cara que falta) |
| L5 | ErrorState | Lote de estados de cada módulo; por ejemplo INI-01, EXP-01, EXP-02, MSG-01, ADM-01. El pago rechazado de RES-02 (F3) usa un Banner danger dentro de la hoja; en el backoffice, DocumentViewer de ADM-01 (no cargó el documento) |
| L5 | Skeleton | INI-01, EXP-01, EXP-02, EXP-04, MSG-01, PRF-10, SHT-OFICIO y el AppShell, ADM-01 (filas de la tabla) y DocumentViewer |
| L5 | Spinner | AUTH-07, Button y ActionPair en carga, MediaUploader al subir |
| L5 | ResultScreen | PUBL-07 («Publicada», también la clase y el servicio; «En revisión» con el motivo; en F3, «Publicada como Premium»), AUTH-05, VER-02 («En revisión»), SYS-UPD |
| L5 | Banner | «Sin conexión» en todas; DET-01, MSG-02, MSG-02b, PUBL-02, PUBL-03, PUBL-04, ONB-O4, EXP-03, RES-01, RES-02 (con contador en F3; pago rechazado en danger), SRV-01, SRV-02 (disputa, reembolso), RES-03 (Llegué), PUBL-06 (sin licencia SEC), REV-01 (ambos confirmaron), PRF-12, GES-01, ADM-01 y ADM-02 («El archivo se borra 30 días después de revisado.»; otra persona del equipo ya la revisa), ADM-03 (sin conexión), ADM-05 (cuenta suspendida preventivamente) |
| L5 | MessageBubble | MSG-02, MSG-02b (en cola: MSG-02 sin conexión), ADM-04 (mensajes reportados) |
| L5 | Composer | MSG-02 (con el aviso «Por tu seguridad…» al escribir un teléfono o un enlace), MSG-02b |
| L5 | SystemCard | MSG-02 y PRC-01 (entrevista), MSG-02b y SRV-02 (certificado de antecedentes: compartido, antiguo y ya no disponible), SRV-02 (cotización: abierta, aceptada y vencida; la solicitud de servicio) |
| L5 | ContextChip | MSG-01 (filas), MSG-02 y SRV-02 (fijo bajo el AppBar: «Servicio · Gasfitería · San Miguel»), ADM-04 (mensajes reportados) |
| L5 | Timeline | PRC-01 (vista del trabajador y del empleador), TUR-01, RES-03 (estados de la reserva; en Servicios, la visita: Pagado · Llegué · Terminé · Servicio realizado), SRV-02 (Solicitado → Cotizado → Aceptado → Realizado → Cerrado); niveles de verificación en VER-01 |
| L5 | ShiftBlock | DET-01 Turno (un bloque por día en una serie), TUR-01, PUBL-03 (pasos 2 y 4); barra de cupos en GES-04 |
| L5 | MatchModal | DET-03 |
| L5 | NewMatches | MSG-01 («Nuevos matches (n)») |
| L5 | CodeInput | AUTH-03, AUTH-08 |
| L5 | StepLayout y ProgressStepper | ONB-03 a ONB-T5, ONB-O1 a ONB-O4, ONB-H1, ONB-K1 a ONB-K5, ONB-S1 a ONB-S5, ONB-A1, ONB-A2, PUBL-02 a PUBL-06, VER-02, SRV-01 (3 pasos) |
| L5 | MediaUploader | Avatar: ONB-03, ONB-O3 (logo). Documento: ONB-T4, ONB-T5 (CV), VER-03, VER-04 (SII), MSG-02b, AYU-02 (adjunto). Galería: ONB-S5, PUBL-06 (hasta 8), SRV-01 (hasta 5), RES-03 («Hubo un problema»); foto de perfil obligatoria en PUBL-06. Cámara y ejemplo visual: VER-02, VER-03 |
| L5 | DynamicFields | ONB-T4, PUBL-02 (paso 3), EXP-06, DET-01 (Requisitos), PRF-03 |
| L5 | AvailabilityGrid | ONB-T2, PRF-03 (Disponibilidad), ONB-K4, ONB-S4. ACT-04 no lo usa: las clases se reservan por hora, así que se edita por bloques horarios (ListItem). En PRF-01 y PRF-10 la disponibilidad se lee en filas: «Vie noche · Sáb tarde y noche · Dom tarde» |
| L5 | SlotPicker | RES-01 (14 días; sin horarios, con «Avisarme»; en Servicios, «Reservar» un servicio de precio fijo), DET-01 Clase (adelanto: próximos 3 horarios) |
| L5 | CalendarWeek | ACT-01 |
| L5 | VerificationBadge | PublicationCard, DET-01 (Servicio: «Identidad verificada» y «SEC gas clase 3»), PRC-01, MSG-02b, GES-02, PRF-01, PRF-10, PRF-11, VER-01, ReviewPanel del backoffice y ADM-05 |
| L5 | PromotedBadge | PublicationCard Premium (EXP-01 a EXP-04, F3), PUBL-08, PUBL-07 (F3), PRF-12 (F3), GES-03 y EXP-05 (F3) |
| L5 | RatingStars | PublicationCard (Servicio y Clase), DET-01, PRF-10, PRF-11, GES-02, GES-04, GES-05, REV-01 (calificar, estrellas grandes; mutua en Servicios) |
| L5 | ReliabilityMeter | PRF-10, GES-04, GES-05, GES-03 y EXP-05 (compacto) |
| L5 | ActionPair | EXP-01 (deck), DET-01 (Empleo, pie fijo; deshabilitado en la vista previa de PUBL-02), GES-03 y EXP-05 |
| L5 | Amount | PublicationCard, DET-01, GES-02 (pretensión), PRF-10, RES-01, RES-02 (desglose de pago), RES-03, PUBL-05, PUBL-06, SRV-02 (cotización y desglose), PUBL-08, PRF-12 |
| L6 | PublicationCard · completa | EXP-02, EXP-03, EXP-04 (servicio con foto) y vista previa en PUBL-02 a PUBL-06, ADM-03 (cómo se verá, al moderar) |
| L6 | PublicationCard · compacta | INI-01, EXP-01 (vista lista), EXP-07, PRF-02 y PRF-11 (publicaciones activas) |
| L6 | PublicationCard · deck y Deck | EXP-01; el Deck con la tarjeta de persona en GES-03 y EXP-05 (M7) |
| L6 | PublicationCard · Premium | EXP-01 a EXP-04 y Buscar (EXP-07), solo en F3 |
| L6 | InfoTag | PublicationCard, DET-01 (datos y forma de contratación), PRF-01 y PRF-10 (qué necesita el hogar), PRF-02 y PRF-11 (beneficios), DataTable del backoffice (plazos «Vence en 6 h hábiles», señales y cambios en ADM-03), ADM-03 (requisitos) |
| L4 | LegalDocument | LEG-01 Términos, LEG-02 Privacidad (M8) |
| L4 | WebShell (SideNav y AppBar web) | ADM-01 a ADM-05: las 5 secciones del backoffice, iguales para todos los roles; riel bajo 1200 px (ADM-01 a 1024) |
| L4 | DataTable | ADM-01 (cola de verificaciones), ADM-02 (organizaciones), ADM-03 (publicaciones en revisión), ADM-04 (reportes), ADM-05 (registro de auditoría) |
| L4 | ReviewPanel | ADM-01 (credencial SPD y certificado de inhabilidades), ADM-02 (organización), ADM-03 (publicación), ADM-04 (reporte); el Dialog web sale de su pie |
| L5 | DocumentViewer | ADM-01 (foto con anverso y reverso; PDF), ADM-02 (carpeta tributaria) |
| L5 | FlaggedText | ADM-03 («buena presencia»; «depósito», teléfono y enlace) |
