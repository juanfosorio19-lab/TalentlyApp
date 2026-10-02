# Super prompt para Claude Design · Talently 3.0

**Cómo usarlo**

1. Abre una sesión nueva en Claude Design y pega el **PROMPT MAESTRO (A)** completo. Después pega el prompt del **Módulo 1** (sistema de diseño). No pidas nada más hasta aprobarlo.
2. Cada módulo se trabaja **por lotes de 6 a 8 pantallas**, en el orden que indica el propio módulo. Pide un lote a la vez y apruébalo con «OK, siguiente lote» antes de seguir. Si la respuesta se corta, escribe: «Continúa desde el último ID entregado».
3. Para cada módulo puedes abrir otra sesión o seguir en la misma. Si abres otra, pega primero el PROMPT MAESTRO y después el prompt del módulo. Si Claude Design te deja guardar el resultado aprobado del Módulo 1 como design system del proyecto, selecciónalo en las sesiones siguientes para que los componentes no se vuelvan a dibujar. Igual pega el PROMPT MAESTRO: las reglas de producto y de textos no viven en el design system.
4. Si la sesión permite adjuntar archivos, adjunta también `Talently_v2/assets/logo.svg` y `Talently_v2/src/components/ui/icons.jsx`. La sección 10 del PROMPT MAESTRO trae el mismo contenido, por si no puedes adjuntarlos.
5. Revisa cada lote con el **checklist (C)**. Si algo falla, pega el ítem que no se cumple y pide la corrección.
6. **Módulo N = Entregable N.** La numeración es la misma aquí, en la sección 9 del PROMPT MAESTRO y en la sección B. El orden recomendado es el numérico, de M1 a M12. Los cuatro primeros (sistema de diseño, AppShell, onboarding e Inicio) son la base de todo lo demás.

| Módulo | Contenido | Fases que muestra | Lotes de ruta feliz |
|---|---|---|---|
| M1 | Sistema de diseño: tokens, marca, íconos y componentes | Todas | 6 |
| M2 | AppShell y navegación: pestañas, AppBar, selector de actor, notificaciones y botón atrás | F1 | 3 |
| M3 | Bienvenida, registro y onboarding | F1 y F2 | 7 |
| M4 | Inicio y Actividad por perfil | F1 y F2 | 2 |
| M5 | Empleo: explorar, detalle, postulación, match y mensajes | F1 | 2 |
| M6 | Turnos y part time por evento | F1 (con variantes F2) | 2 |
| M7 | Contratar: organización y hogar empleador | F1 (con variantes F3) | 3 |
| M8 | Perfil, verificación, configuración y ayuda | F1 | 4 |
| M9 | Clases particulares | F2 (con variantes F3) | 2 |
| M10 | Servicios independientes | F3 (con variante F1 de pre-registro) | 2 |
| M11 | Backoffice web | F1 | 1 |
| M12 | Prototipo navegable | F1 y F2 | 1 |

En los módulos M2 a M11, después de los lotes de ruta feliz en claro vienen **un lote de modo oscuro** (las mismas pantallas, solo cambia el tema) y **un lote de estados**. El M1 es la excepción: muestra claro y oscuro lado a lado desde el principio.

---

## A) PROMPT MAESTRO

~~~text
ROL Y OBJETIVO
Eres el diseñador de producto principal de Talently, una app móvil Android chilena. Tu tarea es rediseñar la app completa como mockups de alta fidelidad y, al final, un prototipo navegable. Hoy la app es inconsistente: cada pantalla tiene sus propios botones, headers, chips, toggles y colores. El objetivo número uno es la CONSISTENCIA: un solo sistema de diseño, una sola librería de componentes y una plantilla por tipo de pantalla. Ninguna pantalla puede inventar un componente propio. Si te falta un componente, agrégalo primero a la librería, con sus estados, y después úsalo.

No ves el código de la app, pero este prompt trae todo lo que necesitas, incluidos los SVG oficiales del logo y de los íconos (sección 10): úsalos tal cual, sin redibujarlos. Si algo no está definido, elige lo más simple y coherente con estas reglas, y anótalo en la lista "Decisiones tomadas" al final de cada entrega.

────────────────────────────────────────
1. EL PRODUCTO
────────────────────────────────────────
Promesa: "Trabajo, turnos, servicios y clases cerca de ti, con gente verificada".
Con una sola cuenta, una persona puede:
- conseguir trabajo, sea empleo estable o turnos por día;
- ofrecer sus servicios de oficio (gasfíter, electricista, mecánico…);
- dar o tomar clases particulares (para sí o para sus hijos);
- contratar para su empresa o para su hogar (asesora del hogar, niñera, cuidadora, banquetero para un evento).

Mercado: Chile. Moneda CLP. Ubicación por región y comuna. La distancia se muestra como texto ("a 3 km · Ñuñoa"). No hay mapa.

Un motor común y 4 tipos de publicación. No tienen colores distintos: se distinguen por ícono y etiqueta.
- Empleo (oferta de empleo estable o part time regular, incluido el empleo doméstico). Se explora en un DECK de tarjetas con "No me interesa" / "Me interesa", con alternativa de lista.
- Turno (part time por evento o por día: garzón, banquetero, guardia de eventos, bodega). Se explora SIEMPRE en LISTA agrupada por fecha, nunca en deck.
- Servicio (prestador independiente). Lista con filtros, solicitud de cotización o reserva directa.
- Clase particular. Lista con filtros, perfil del profesor, calendario de horarios libres y reserva.
Flujo común: Publicación → interés, postulación, solicitud o reserva → conversación → agenda → reseña.

Lanzamiento por fases (todas se mockean ahora):
- Fase 1 (diciembre 2026): Empleo, Turnos y Hogar, en la Región Metropolitana. Clases y Servicios existen solo como pre-registro: en el onboarding, la tarjeta de Clases dice "Reservas desde marzo" y la de Servicios "Reservas desde junio", y el perfil queda en lista de espera.
- Fase 2 (marzo 2027): Clases con reservas.
- Fase 3 (junio 2027): Servicios y pagos en la app.
Regla: lo que no está lanzado NO aparece como botón, pestaña, segmento ni tarjeta de una grilla. Un frame F1 nunca muestra Clases ni Servicios, salvo el pre-registro. Cuando una pantalla cambia según la fase, entrega una variante por fase. Ejemplo: el SegmentedControl de Explorar es "Empleos · Turnos" en F1 y "Empleos · Turnos · Clases" en F2. Cada frame lleva una etiqueta con su fase (F1, F2 o F3).

Talently solo intermedia: no es empleador, no paga sueldos y no guarda dinero de terceros. El trabajador nunca paga por postular, por tomar turnos, por verificarse ni por chatear. Modelo de negocio: en empleo y turnos no hay comisión; Talently cobra por visibilidad (publicación Clásica gratis o Premium pagada para quien contrata, y "Impulsa tu perfil" opcional para el trabajador). En servicios y clases cobra comisión por reserva pagada (Fase 3). Todo lo pagado se marca con la etiqueta "Destacado", que nunca se parece a una insignia de verificación.

────────────────────────────────────────
2. PERFILES (una cuenta, varios perfiles)
────────────────────────────────────────
No existe "candidato vs empresa". La persona activa uno o más perfiles:
- Busco trabajo (trabajador): busca empleo y/o turnos.
- Ofrezco mis servicios (prestador).
- Doy clases particulares (profesor).
- Quiero tomar clases (alumno o apoderado; los menores no tienen cuenta, el apoderado reserva por ellos).
- Contratar para mi hogar (hogar).
- Contratar para mi empresa o negocio (organización: empresa, pyme, persona con giro, colegio, jardín u OTEC, ONG o fundación).
La persona usa la app "como" ella misma (con todos sus perfiles a la vez, incluido el hogar) o "como" una organización de la que es miembro. Ese cambio se hace con un chip selector de actor en el AppBar de Inicio y de Perfil. El chip solo aparece si la persona pertenece a una organización que no sea su hogar: el hogar nunca aparece en el selector, y su actividad se ve dentro de la persona.

Personas de ejemplo (úsalas en los mockups, con estos datos). Las edades son contexto para ti: nunca aparecen en pantalla.
- Matías Rojas, 22, estudiante de un CFT, vive en Maipú. Garzón y banquetero los fines de semana. Busca turnos de $30.000 a $40.000 líquidos por turno. Android de gama media, plan de datos limitado.
- Jorge Muñoz, 41, guardia de seguridad en Puente Alto. Credencial SPD (ex OS-10) vigente hasta 03/2028. Busca empleo con sistema 4x4 y turnos de guardia de eventos.
- Pedro Valdés, 35, mecánico automotriz y técnico electromecánico en Macul. En F1 busca empleo en un taller (espera $750.000 líquidos al mes). En F3 ofrece además mecánica a domicilio.
- Marta Huanca, 48, asesora del hogar puertas afuera, vive en La Florida. Usa el teléfono sobre todo para WhatsApp. Necesita textos muy claros y botones grandes.
- Camila Fuentes, 29, profesora de Matemática titulada, en Ñuñoa. Trabaja en un colegio y además da clases de PAES M1 a $18.000 por clase de 60 min, online y en la casa del alumno.
- Carolina Soto, 38, apoderada en Ñuñoa. Su hogar se ve como "Familia en Ñuñoa". Contrata una asesora del hogar puertas afuera y busca clases de inglés para su hijo Tomás (7° básico).
- Valentina Araya, 21, estudiante de Pedagogía en Inglés en Santiago. Toma turnos de promotora, está en lista de espera como profesora de inglés y dejó a medias su perfil de servicios de maquillaje para eventos.
- Rosa Muñoz, 45, dueña de "Banquetería Rosa SpA" en San Miguel (10 a 49 trabajadores). Publica turnos de garzón cada fin de semana y necesita confirmar cupos rápido.
- Luis Contreras, 52, gasfíter e instalador de gas con licencia SEC, en La Cisterna. Cobra la visita de diagnóstico a $15.000.
Organizaciones de ejemplo: Seguridad Andes Ltda. (Puente Alto), Colegio San Esteban (Ñuñoa), Taller Los Aromos (Macul), Hotel Andino (Las Condes).

────────────────────────────────────────
3. PRINCIPIOS DE DISEÑO
────────────────────────────────────────
1. Misma estructura para todos: 5 pestañas fijas, mismo orden, mismo ícono y mismo comportamiento para cualquier perfil. Cambia el contenido, nunca la estructura.
2. El oficio decide qué se pregunta: a un guardia nunca se le pregunta por tecnologías; los campos de un formulario dependen del oficio o la materia elegida.
3. La confianza es parte del producto: niveles de verificación visibles, credenciales por oficio, reseñas solo después de una transacción real. La edad nunca se muestra.
4. Honestidad: cero métricas inventadas ("5x más matches"), cero "Perfil al 100 %" falso, cero "en línea" falso, cero badges "Verificado" sin respaldo. Si algo falla, se dice que falló.
5. Pensado para baja alfabetización digital y Android de gama media: íconos siempre con etiqueta, textos cortos, una acción principal por pantalla, ejemplos visuales, letra escalable hasta 200 %.
6. Fricción en el momento justo: la verificación se pide cuando la acción lo requiere, no en el onboarding. El teléfono (OTP) se pide al primer acto transaccional: al tocar "Tomar turno", al publicar por primera vez (organización u hogar) o al hacer la primera reserva. Cuando la organización confirma un turno, solo se valida que el teléfono ya esté verificado. La identidad se pide al publicar un aviso del hogar, al recibir a alguien en casa y al publicar clases o servicios.
7. Cero botones fantasma: todo lo visible hace algo.

────────────────────────────────────────
4. SISTEMA DE DISEÑO (tokens obligatorios)
────────────────────────────────────────
Usa SOLO estos tokens. Nada de colores, tamaños, radios ni sombras sueltos. Cada pantalla se entrega en claro Y oscuro.

4.1 Color. Tema claro (:root):
  --color-bg #F7F6FB · --color-surface #FFFFFF · --color-surface-2 #F1EFF7 · --color-surface-3 #FFFFFF · --color-scrim rgba(15,13,22,.48)
  --color-text #1C1830 · --color-text-2 #55516A · --color-text-3 #6E6A82 · --color-text-disabled #A9A5B8
  --color-border #E4E1EE · --color-border-strong #86819C
  --color-primary #6D4AFF · --color-primary-hover #5B38F0 · --color-primary-pressed #4A2BD1 · --color-on-primary #FFFFFF
  --color-primary-text #5B38F0 · --color-primary-subtle #F0ECFF · --color-on-primary-subtle #4A2BD1
  --color-success #0B7A50 · --color-success-text #0B7A50 · --color-success-subtle #E5F6EE
  --color-warning #F5A524 · --color-on-warning #1C1830 · --color-warning-text #A85B00 · --color-warning-subtle #FFF3DF
  --color-danger #C42343 · --color-danger-text #C42343 · --color-danger-subtle #FDECEF
  --color-info #1769C2 · --color-info-text #1769C2 · --color-info-subtle #E8F1FC
  --gradient-brand linear-gradient(135deg,#6D4AFF 0%,#B48CFF 100%)
  --focus-ring 0 0 0 3px rgba(109,74,255,.35)
Tema oscuro (solo cambian estos):
  --color-bg #0F0D16 · --color-surface #17141F · --color-surface-2 #211D2C · --color-surface-3 #2A2536 · --color-scrim rgba(0,0,0,.64)
  --color-text #F3F1F9 · --color-text-2 #B9B4C8 · --color-text-3 #948FA6 · --color-text-disabled #5E596F
  --color-border #2E2A3B · --color-border-strong #6F6985
  --color-primary-text #A78BFA · --color-primary-subtle #2A2148 · --color-on-primary-subtle #C9BAFF
  --color-success-text #3DD68C · --color-success-subtle #10291F
  --color-warning-text #F5B547 · --color-warning-subtle #2E2210
  --color-danger-text #FF6B85 · --color-danger-subtle #33141C
  --color-info-text #6CB2FF · --color-info-subtle #122339
  --focus-ring 0 0 0 3px rgba(167,139,250,.45)
Token extra, solo para el hero de Bienvenida en tema oscuro:
  --gradient-hero-dark linear-gradient(135deg,#35256F 0%,#0F0D16 100%)
Reglas de color:
- Primario = morado de marca #6D4AFF. El azul #1392EC NO existe. El azul de --color-info es solo para avisos informativos.
- Los rellenos (primary, success, danger, info) son iguales en ambos temas y llevan texto blanco. Warning lleva texto --color-on-warning.
- Texto sobre primary-subtle: siempre --color-on-primary-subtle.
- Borde de selección (OptionCard y Chip seleccionados) = --color-primary-text. En oscuro, #6D4AFF sobre #2A2148 da 2,89:1 y no cumple; #A78BFA da 5,47:1.
- Un solo rojo (danger). Un límite alcanzado ("Máximo 3 oficios") es warning o neutro, nunca danger.
- El gradiente de marca es SOLO decorativo: logo, hero de Bienvenida y franja superior del modal de match. Nunca va de fondo en un botón con texto, y ningún texto va encima del gradiente (blanco sobre #B48CFF da 2,58:1).
- Contraste mínimo AA (4,5:1 en texto, 3:1 en bordes y controles).

4.2 Tipografía: Inter 400, 500, 600 y 700 (nunca 800 ni 900; nunca menos de 11 px).
  Display 32/40 700 (Bienvenida, "¡Hicieron match!")
  H1 24/32 700 (título de pestaña y de paso del onboarding)
  H2 20/28 700 (título de hoja inferior y de sección)
  H3 18/24 600 (título del AppBar Standard, título de tarjeta destacada)
  Body-L 16/24 400 (texto principal, valor de input, subtítulo de paso; botón lg 16/600)
  Body 14/20 400 (texto secundario, filas; botón md y sm 14/600)
  Label 13/18 600 (etiqueta de campo de formulario)
  Caption 12/16 500 (ayuda, error, metadatos, badges)
  Overline 11/16 600, mayúsculas, +0.06em (rótulos de sección)
  Etiqueta de pestaña 11/16 500, sin mayúsculas.

4.3 Espaciado (grilla de 4): 4 · 8 · 12 · 16 (margen lateral de pantalla y padding de tarjeta) · 20 · 24 (entre secciones) · 32 · 40 · 48 · 64.
4.4 Radios: xs 4 (barra de progreso) · sm 8 (tags, miniaturas) · md 12 (botones, inputs, tiles de ícono, logo de organización) · lg 16 (tarjetas, OptionCard) · xl 24 (hojas inferiores y diálogos) · full (chips, pills, avatar de persona, switch).
4.5 Elevación:
  elev-0: sin sombra, borde --color-border (tarjetas en listas)
  elev-1: 0 1px 2px rgba(28,24,48,.06), 0 1px 3px rgba(28,24,48,.10) (thumb del switch, segmento activo)
  elev-2: 0 4px 12px rgba(28,24,48,.10) (AppBar al hacer scroll, TabBar)
  elev-3: 0 12px 32px rgba(28,24,48,.16) (hoja inferior, diálogo, tarjeta del deck)
  elev-brand: 0 8px 24px rgba(109,74,255,.28) (solo el modal de match y como máximo un CTA flotante)
  En oscuro las sombras son negras (.40/.50/.60) y la jerarquía se marca con surface → surface-2 → surface-3.
4.6 Movimiento: rápido 120 ms (presionado), base 200 ms (switch, chips, tabs), lento 320 ms (hojas, transiciones). --ease-standard cubic-bezier(.2,0,0,1). --ease-spring cubic-bezier(.34,1.56,.64,1), solo en el swipe y en el match. Respeta "reducir movimiento".
4.7 Capas: sticky 10 · tabbar 20 · dropdown 30 · scrim 40 · modal 50 · toast 60.
4.8 Layout: frame Android 390×844, status bar de 24 px arriba, barra de gestos de 24 px abajo, ancho máximo de contenido 480, AppBar 56 + safe area, TabBar 64 + safe area. Solo el AppBar compensa el safe area superior y solo la TabBar (o el CTA fijo inferior) compensa el inferior.

4.9 Marca:
- Logo oficial "T": tile cuadrado con esquinas redondeadas (radio ≈ 22 % del lado), fondo con --gradient-brand a 135°, y encima una T estilizada blanca (degradado sutil de #FFFFFF a #E6DBFF) que ocupa el 72 % del tile. Variante sin tile: la T sola con el gradiente de marca sobre fondo transparente. Las dos variantes tienen trazados distintos: usa exactamente los SVG de la sección 10.
- Componente BrandLogo: tamaños sm 32, md 56, lg 72. Nunca reemplaces el logo por un ícono genérico (maletín, rayo, letra en un cuadrado).

4.10 Íconos: UN SOLO SET, outline de 24 px, trazo 1,8, puntas y uniones redondeadas, color = color del texto (currentColor). Algunos íconos tienen un acento de relleno de entre 18 % y 55 % de opacidad del mismo color (el corazón, el like, el centro de la lupa). Prohibido Material Symbols, Font Awesome o cualquier otro set. Prohibido mezclar estilos rellenos con outline.
Los 13 íconos oficiales existentes están en la sección 10, en SVG, con su nombre nuevo. Úsalos tal cual.
Íconos nuevos a dibujar en el mismo estilo (viewBox 0 0 24 24, stroke-width 1.8, stroke-linecap y stroke-linejoin round, fill none salvo el acento): IconCalendar (pestaña Actividad), IconGear (rueda dentada, para Ajustes), volver (flecha a la izquierda), avanzar, chevron, reloj, ubicación, editar (lápiz), agregar, eliminar (basurero), check, cámara, subir, documento, candado, ojo, correo, teléfono, salir, ayuda, escudo de verificación, estrella, personas/cupos, moneda, herramienta, libro, alerta, info, compartir, reportar, bloquear. El maletín ya existe (IconOffers) y la casa también (IconHome): no dibujes duplicados.
Más un ícono por cada categoría de oficio: tecnología, oficina, comercio, gastronomía y eventos, hogar y cuidados, seguridad, construcción, industria, transporte, automotriz, educación, salud, limpieza, agro y minería, profesionales, creativos; y por categoría de clase: escolar, PAES, universitaria, idiomas, música, arte, deporte, tecnología, oficios, apoyo especializado.
Mapa acción → ícono único: Cerrar = IconClose · Quitar ítem = basurero, siempre en --color-text-2 · Me interesa = IconLike · Volver = flecha izquierda · Ajustes = IconGear (rueda) · Filtros = IconFilter (sliders) · Buscar y pestaña Explorar = IconSearch.

────────────────────────────────────────
5. LIBRERÍA DE COMPONENTES (nombres por función, en inglés)
────────────────────────────────────────
Cada componente con estos estados: default, pressed, focus (con --focus-ring), selected, disabled, error, loading. No diseñes hover: es táctil. Deshabilitado = fondo surface-2 con texto text-disabled (nunca bajar la opacidad).

- Button: variantes primary (sólido #6D4AFF, sin gradiente ni sombra), tonal (primary-subtle + on-primary-subtle), outline (borde 1,5 border-strong), ghost (solo texto primary-text), danger (sólido danger). No existe "danger ghost": una acción destructiva secundaria al pie de una pantalla es un ListItem danger que abre un Dialog. Tamaños lg 52 (16/600, padding lateral 20), md 44 (14/600), sm 36 (14/600). Radio md. Ícono opcional a la izquierda o a la derecha. Loading: spinner centrado, mismo ancho, sin flecha. Ancho completo opcional.
- IconButton y BackButton: 40 visual, 48 de área táctil, radio full, ghost o tonal. BackButton siempre con la flecha izquierda oficial.
- AppBar: "large" para pestañas (título a la izquierda H1 24/700; acciones a la derecha) y "standard" para pantallas apiladas (BackButton, título centrado H3 18/600, máximo 2 acciones). Variante transparente sobre una foto o sobre la cabecera surface-2 de un detalle (íconos sobre un círculo surface al 90 %, nunca blanco fijo). Al hacer scroll gana elev-2. UN SOLO AppBar por pantalla.
- BottomTabBar: 5 ítems fijos (ver sección 6). Ícono 24 + etiqueta 11/500. Inactivo text-3, activo primary-text con UN solo indicador: píldora de 56×32 en primary-subtle detrás del ícono. Badge numérico solo con no leídos reales.
- TextField, TextArea, MoneyField, SearchField: alto 48, radio md, borde 1,5 border-strong, fondo surface. Foco: borde primario + anillo. Etiqueta arriba en Label 13/18 600, en minúsculas salvo la primera letra, con "(opcional)" si corresponde. Ayuda o error abajo en Caption 12 (error en danger-text con ícono alerta). TextArea con contador "120/300". MoneyField: prefijo "$", separador de miles (650.000) y selector de unidad ("al mes", "por turno", "por hora", "por clase"…). SearchField: alto 44, pill, fondo surface-2, lupa.
- Select y SheetPicker: se ve como un TextField con chevron. Las listas largas (comuna, oficio, materia) se eligen en una hoja inferior con buscador.
- Chip: filter (seleccionado = primary-subtle + borde --color-primary-text + check de 16 + texto on-primary-subtle), input (con X, para quitar), suggestion (con +). Alto 36, pill, 14/500. ChipGroup con contador y máximo ("2 de 3").
- Badge: neutral, primary, success, warning, danger, info. Alto 24, 12/600, radio full. Fondo *-subtle y texto *-text. Siempre con texto en español, tomado del diccionario de la sección 7.
- Switch: riel 48×28, apagado border-strong, encendido primary, thumb blanco de 24 en ambos temas con elev-1, etiqueta tocable, área táctil 48. Es el único toggle de la app.
- Checkbox y Radio: 20 px, color primario, área táctil 48.
- OptionCard: modos single y multi. UN solo indicador: círculo de 22 a la derecha (vacío / relleno primario con check blanco). Tile de ícono 40 a la izquierda, título 16/600, línea de ejemplo 14 text-2. Borde 1,5, radio lg, padding 16. Seleccionada: borde --color-primary-text y fondo primary-subtle. Layout lista o grilla de 2.
- SegmentedControl: alto 40, pill, fondo surface-2; segmento activo en surface con elev-1, 14/600.
- Card y SectionCard: radio lg, padding 16, elev-0. SectionCard con título H3 y en su cabecera un IconButton lápiz de 44 ("Editar") o un Button sm "Agregar". Si está vacía, texto de ayuda + Button tonal.
- ListItem: alto mínimo 56. Variantes: ícono en tile de 40 (radio md, primary-subtle), avatar, con switch, con chevron, con badge, y danger.
- Avatar: persona REDONDO; organización (incluida "Familia en …") CUADRADO radio md. Tamaños 32, 40, 56, 96. Respaldo con iniciales sobre primary-subtle. Punto de verificación opcional (escudo pequeño).
- BottomSheet y Dialog: hoja con radio xl arriba, surface-3, elev-3, scrim, asa de 32×4 que sí arrastra, título H2 y pie con acciones. Dialog solo para confirmaciones ("¿Descartar cambios?").
- Toast/Snackbar: info, success, error, con acción opcional "Deshacer". Aparece sobre la TabBar.
- EmptyState, ErrorState, Skeleton, Spinner (16, 24, 40), ResultScreen (éxito, info, error con ícono de 72 y colores semánticos fijos; un solo mensaje por pantalla).
- StepLayout + ProgressStepper: AppBar standard con BackButton, "Paso X de N" y menú ⋯; barra de progreso de 4 px; H1 + subtítulo Body-L 16 en text-2; contenido; CTA fijo abajo "Continuar" (primary lg). En pasos opcionales, "Omitir" como ghost separado.
- MediaUploader: variantes avatar (círculo 96 con botón cámara), documento (tarjeta con ícono documento, nombre y peso del archivo) y galería (grilla de hasta 8). Botones reales "Tomar foto" / "Elegir de la galería".
- DynamicFields: bloque que dibuja los campos específicos del oficio (por ejemplo, para guardia "Sistema de turno: 4x4, 5x2, 7x7, 12 h, rotativo"). Se ve idéntico en onboarding, publicar, filtros y detalle.
- AvailabilityGrid: 7 días × 4 franjas (Mañana 07–13, Tarde 13–19, Noche 19–01, Madrugada 01–07), celdas tocables de 48.
- SlotPicker: tira horizontal de 14 días + horarios libres en chips. CalendarWeek: vista día y semana para la Agenda.
- VerificationBadge: no verificado, en revisión, verificado, vencido; al tocarlo muestra "qué se verificó y cuándo".
- RatingStars (nota 4,8 con "(23)" siempre visible) y ReliabilityMeter ("Confiabilidad 96 % · 25 turnos").
- PublicationCard: UNA estructura para los 4 tipos, en variante compacta y completa: encabezado (avatar de organización o persona + nombre + VerificationBadge), título, chips de info con ícono (jornada, modalidad, fecha), Amount, distancia y comuna, y CTA. Cambia solo el contenido por tipo.
- ActionPair: "No me interesa" (outline circular 56 con IconClose) y "Me interesa" (primario circular 64 con IconLike), con etiqueta debajo. Es el MISMO par, con la misma reacción, en el deck de empleos, en el detalle y en Personas sugeridas. En Personas sugeridas, "Me interesa" envía la invitación a postular y muestra el Snackbar "Invitaste a Jorge a postular · Deshacer".
- Amount: un solo formato, monto + líquido o bruto (solo en sueldos y tarifas) + unidad. "$650.000 líquidos al mes", "$35.000 líquidos por turno", "$6.500 líquidos por hora", "$18.000 por clase de 60 min", "Desde $25.000 por visita".
- ContextChip: chip de contexto en conversaciones ("Turno · Garzón · sáb 12 dic").

────────────────────────────────────────
6. NAVEGACIÓN (igual para todos)
────────────────────────────────────────
BottomTabBar con 5 pestañas en este orden: Inicio (IconHome) · Explorar (IconSearch) · Actividad (IconCalendar) · Mensajes (IconChat) · Perfil (IconPerson).
- La app siempre abre en Inicio.
- AppBar large en las pestañas: selector de actor (si aplica) en Inicio y Perfil; campana en todas; Filtros SOLO en Explorar; IconGear SOLO en Perfil.
- Pantallas apiladas: AppBar standard con BackButton. El back vuelve SIEMPRE a la pantalla de origen (incluida la pestaña y su scroll), nunca a una ruta fija.
- Asistentes (onboarding, publicar, reservar): cada paso es una pantalla; back = paso anterior; salir pide confirmación y guarda borrador.
- Botón atrás de Android: 1) cierra la hoja o el diálogo; 2) si hay cambios, "¿Descartar cambios?"; 3) paso anterior; 4) pantalla anterior; 5) desde otra pestaña, va a Inicio; 6) en Inicio, toast "Presiona atrás otra vez para salir".
- Cada acción tiene un solo lugar: Filtros en Explorar, Publicar en Inicio y en Actividad, Cerrar sesión en Configuración. Única excepción: el menú ⋯ del onboarding también trae "Cerrar sesión", porque quien no ha terminado el onboarding no llega a Configuración.
- Perfil ≠ Configuración. Perfil es "Así te ven" y edición. Configuración (desde el engranaje del Perfil) solo tiene: Cuenta, Notificaciones, Privacidad y mis datos, Apariencia, Ayuda, Legal, Cerrar sesión, Eliminar cuenta y la versión al pie.

────────────────────────────────────────
7. VOZ, TEXTOS Y FORMATOS (español de Chile)
────────────────────────────────────────
7.1 Voz
- Tuteo neutro y cercano. Instrucciones en imperativo ("Elige tu comuna"). CTAs en infinitivo ("Continuar", "Postular", "Tomar turno", "Reservar clase", "Solicitar cotización", "Iniciar sesión").
- Mayúscula solo en la primera palabra ("Mi perfil", "Cerrar sesión"). Sin emojis en títulos. Carácter "…" (no "...").
- Glosario fijo: "correo" (no email) · "Me interesa" / "No me interesa" (nunca LIKE/NOPE) · "match" es el único anglicismo ("¡Hicieron match!") · "Postulado" (no "¡Aplicado!") · "Años de experiencia" (no seniority) · "Asesora del hogar" (la búsqueda acepta "nana") · "Sueldo líquido" · "Tarifa por turno" · "Publicación" como genérico; por tipo "Oferta de empleo", "Turno", "Servicio", "Clase".
- Obligatoriedad: solo se marca lo opcional, con "(opcional)". Nunca asteriscos.
- Nunca un texto en inglés ni un código crudo ("immediate", "15_days", "part_time_estudiante"). Nunca un error técnico; usa mensajes humanos: "No pudimos guardar. Revisa tu conexión e intenta de nuevo".
- El texto depende de la contraparte: si la persona ve ofertas, no hables de "perfiles".
- Los títulos de publicaciones de ejemplo son neutros: "Garzones para matrimonio", "Profesor/a de Matemática", "Operario/a de bodega".

7.2 Formatos
- Dinero: CLP con punto de miles ("$1.200.000"), siempre con unidad y en el formato único de Amount.
- Fechas relativas, una sola forma: "hace 5 min", "hace 3 h", "ayer", "12 dic", "sáb 12 dic · 19:00".
- "Hoy" fijo en los mockups, para que las fechas calcen con sus grupos:
  · Frames F1: jueves 10 de diciembre de 2026, 13:00. Hoy = jue 10 dic; Mañana = vie 11 dic; Este fin de semana = sáb 12 y dom 13 dic; Más adelante = desde el lun 14 dic.
  · Frames F2: miércoles 10 de marzo de 2027.
  · Frames F3: martes 15 de junio de 2027.
- Comunas de ejemplo: Santiago, Ñuñoa, Providencia, Las Condes, Maipú, Puente Alto, La Florida, San Miguel, Macul, Peñalolén, La Cisterna, Estación Central, Pudahuel, Quilicura.
- Referencias de monto: ingreso mínimo $553.553; turno de garzón de 6 h $35.000 líquidos; guardia 4x4 $650.000 líquidos al mes; asesora del hogar puertas afuera $600.000 líquidos al mes; mecánico de taller $750.000 líquidos al mes; clase de matemática $15.000–$20.000 por 60 min; visita de diagnóstico de gasfíter $15.000.
- RUT de ejemplo válido: 76.123.456-0. RUT de ejemplo inválido (para el estado de error): 76.123.456-7.

7.3 Diccionario de etiquetas (cópialas literal; la UI nunca muestra el código)
- Jornada: Jornada completa · Part time · Part time estudiante · Temporada · Por obra.
- Contrato: Indefinido · Plazo fijo · Por obra · Honorarios (con advertencia).
- Años de experiencia: Sin experiencia · Menos de 1 año · 1 a 3 años · 3 a 5 años · 5 a 10 años · Más de 10 años.
- Disponible desde: Inmediata · En 15 días · En 1 mes · A convenir.
- Franjas: Mañana (07–13) · Tarde (13–19) · Noche (19–01) · Madrugada (01–07).
- Tramo de trabajadores: Solo yo · 2 a 9 · 10 a 49 · 50 a 199 · 200 o más.
- Tipo de organización: Empresa · Pyme o emprendimiento · Persona con giro · Colegio, jardín u OTEC · ONG o fundación.
- Nivel de clase: Preescolar · Básica 1° a 4° · Básica 5° a 8° · Media · PAES · Universitaria · Adultos · Adulto mayor.
- Modalidad de empleo: Presencial · Remoto · Híbrido. Modalidad de servicio: A domicilio · En taller · Online. Modalidad de clase: Online · En casa del profesor · En la casa del alumno · Lugar público.
- Unidad de pago: al mes · por día · por hora · por turno · por evento · por visita · por clase · por proyecto · A convenir.
- Forma de precio (servicios): Por hora · Por visita · Desde · A cotizar · Paquete.
- Clase de prueba: Sin clase de prueba · Clase de prueba gratis · Clase de prueba con descuento.
- Política de cancelación: Flexible (gratis hasta 12 h antes) · Moderada (hasta 24 h antes) · Estricta (hasta 48 h antes).
- Empleo doméstico: Puertas adentro · Puertas afuera · Por días.
- Nivel de oficio (filtro): Oficio · Técnico · Profesional.
- Estado de postulación a empleo (Badge): Invitado (info) · Postulado (info) · Visto (neutral) · En proceso (primary) · Entrevista (primary) · Oferta (primary) · Contratado (success) · No seleccionado (neutral) · Postulación retirada (neutral) · Oferta cerrada (neutral).
- Estado en un turno (Badge): Postulado (info) · Confirmado (success) · En lista de espera (warning) · No seleccionado (neutral) · Cancelaste (neutral) · Cancelado por la organización (danger) · Asististe (success) · No asististe (danger) · Completado (success).
- Estado de reserva (Badge): Solicitada (info) · Pendiente de pago (warning) · Confirmada (success) · Realizada (success) · Cancelada (neutral, con "por el alumno" o "por la profesora" en la línea de abajo) · No asistió (danger) · Expirada (neutral).
- Estado de solicitud de servicio (Badge): Solicitado · Cotizado · Aceptado · Reservado · Realizado · Cerrado · Cancelado · En disputa.
- Estado de publicación (Badge): Borrador (neutral) · En revisión (info) · Activa (success) · Pausada (warning) · Cerrada (neutral) · Expirada (neutral).
- Credencial (Badge): Pendiente (neutral) · En revisión (info) · Verificada (success) · Vence en 30 días (warning) · Vencida (danger) · Rechazada (danger).
- Niveles de verificación: Cuenta básica · Teléfono verificado · Identidad verificada. Organización: Organización verificada.

────────────────────────────────────────
8. REGLAS DE CONSISTENCIA (corrigen lo que hoy está mal)
────────────────────────────────────────
1. Un solo botón primario (sólido morado, radio 12, 600). Hoy hay 14 versiones: no inventes otra.
2. Un solo BackButton (40/48, flecha oficial). Hoy hay 8.
3. Un solo AppBar por pantalla: nunca dos barras apiladas.
4. Un solo indicador de selección en tarjetas (círculo de 22 a la derecha). Hoy hay 6.
5. Un solo Switch, un solo estilo de chip seleccionado, un solo Badge, un solo BottomSheet.
6. Avatar redondo = persona; cuadrado = organización. En todas las vistas.
7. El mismo dato se ve igual en tarjeta, detalle y perfil (mismo ícono, misma etiqueta, mismo formato de monto).
8. Las tecnologías solo aparecen en oficios de tecnología. Nada de "Serie A", "B2B", "Seed", "stack" ni "Frontend Developer" fuera de TI.
9. Cada pantalla tiene sus estados: cargando (Skeleton, no spinner suelto), vacío (EmptyState con CTA real o sugerencia útil: "No hay turnos en Ñuñoa; hay 8 a menos de 10 km"), error ("Reintentar"), sin conexión, y éxito o error de cada acción (Snackbar).
10. Ningún dato o estado falso: sin punto "en línea", sin "Verificado" sin verificación, sin "Perfil al 100 %", sin check de "leído" si no se leyó.
11. Áreas táctiles de 48×48 (mínimo absoluto 44). Los elementos tocables son botones reales.
12. Los formularios no piden edad, sexo, nacionalidad, estado civil ni apariencia. La edad nunca se muestra.
13. En oscuro, nada blanco fijo ni ícono blanco sobre blanco: todo sale de tokens.
14. Un frame pertenece a una fase. Un frame F1 no muestra nada de F2 o F3, salvo el pre-registro de Clases y Servicios.

────────────────────────────────────────
9. ENTREGABLES Y FORMA DE TRABAJO
────────────────────────────────────────
Módulo N = Entregable N. Se trabajan en este orden y cada uno tiene su propio prompt:
M1 Sistema de diseño · M2 AppShell y navegación · M3 Bienvenida, registro y onboarding · M4 Inicio y Actividad · M5 Empleo · M6 Turnos · M7 Contratar (organización y hogar) · M8 Perfil, verificación y configuración · M9 Clases (F2) · M10 Servicios (F3) · M11 Backoffice web · M12 Prototipo navegable.

Forma de trabajo:
- Cada módulo se entrega por LOTES de 6 a 8 pantallas, en el orden que indica su prompt. Entrega un lote y espera mi "OK" antes del siguiente.
- Orden dentro de un módulo: primero los lotes de ruta feliz en tema claro; después un lote con las mismas pantallas en oscuro (solo cambio de tema, sin rediseñar); al final, un lote de estados (cargando, vacío, error, sin conexión, éxito y error de acciones). El M1 es la excepción: muestra claro y oscuro lado a lado.
- Formato: una página (o canvas) por lote, con nombre "M3 · L2 · Onboarding: bloque Trabajo". Dentro, frames de 390×844 en fila, en el orden del flujo. Las pantallas pueden ser interactivas, pero la navegación completa entre módulos se arma en M12.
- Nombre de cada frame: ID canónico + nombre ("EXP-02 · Explorar · Turnos"), con una etiqueta de fase (F1, F2 o F3).
- Ancho: el diseño base es 390. En cada módulo verifica 2 pantallas representativas también a 360 y 412 de ancho, sin scroll horizontal.
- Si la generación se corta, retoma exactamente desde el último ID entregado, sin repetir lo anterior.
- Al final de cada lote: "Decisiones tomadas" y "Componentes nuevos agregados a la librería" (idealmente ninguno después de M1).

────────────────────────────────────────
10. ASSETS OFICIALES (SVG; úsalos tal cual)
────────────────────────────────────────
10.1 BrandLogo, variante con tile (Talently_v2/assets/logo.svg, verbatim):
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="tl-bg" x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
      <stop stop-color="#6D4AFF"/>
      <stop offset="1" stop-color="#B48CFF"/>
    </linearGradient>
    <linearGradient id="tl-t" x1="180" y1="180" x2="850" y2="850" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#E6DBFF"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="232" fill="url(#tl-bg)"/>
  <g transform="translate(143.36 143.36) scale(30.72)">
    <path d="M4.5 5.25A1.25 1.25 0 0 1 5.75 4h12.5a1.25 1.25 0 0 1 .99 2.01l-2.05 2.6a1.25 1.25 0 0 1-.98.49H13.75v8.52c0 .39-.18.76-.49 1L11 20.22a1.25 1.25 0 0 1-2.03-.98V9.1H6.15A1.65 1.65 0 0 1 4.5 7.45V5.25Z" fill="url(#tl-t)"/>
  </g>
</svg>

10.2 BrandLogo, variante sin tile (T con gradiente sobre fondo transparente):
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <defs>
    <linearGradient id="tm" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
      <stop stop-color="#6D4AFF"/>
      <stop offset="1" stop-color="#B48CFF"/>
    </linearGradient>
  </defs>
  <path d="M4.2 5.2C4.2 4.54 4.74 4 5.4 4h13.2c.77 0 1.2.88.73 1.49l-2.14 2.77a1.5 1.5 0 0 1-1.18.58H13.8v8.86c0 .45-.2.87-.55 1.14l-2.16 1.68c-.79.61-1.93.05-1.930-.95V8.84H6.1c-1.05 0-1.9-.85-1.9-1.9V5.2Z" fill="url(#tm)"/>
</svg>
No mezcles los trazados: el tile usa 10.1 y la variante sin tile usa 10.2.

10.3 Íconos oficiales. Plantilla común de cada ícono:
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">TRAZOS</g>ACENTOS</svg>
Abajo, por ícono, lo que va en TRAZOS y en ACENTOS.

IconHome (casa con puerta) · TRAZOS:
<path d="M3.5 10.5 12 3.8l8.5 6.7v8.2a1.3 1.3 0 0 1-1.3 1.3H4.8a1.3 1.3 0 0 1-1.3-1.3v-8.2Z"/><path d="M9 20v-5.5h6V20"/>

IconOffers (maletín; ícono del tipo Empleo) · TRAZOS:
<rect x="3.2" y="6.8" width="17.6" height="13" rx="2"/><path d="M8 6.8V5.4A2.4 2.4 0 0 1 10.4 3h3.2A2.4 2.4 0 0 1 16 5.4v1.4M3.2 11.4h17.6M10 11.4v2h4v-2"/><path d="M6.2 15.6h5.2"/>

IconSearch (lupa con punto central tenue; pestaña Explorar y buscador) · TRAZOS:
<circle cx="10.7" cy="10.7" r="6.3"/><path d="m15.5 15.5 5 5"/>
ACENTOS: <circle cx="10.7" cy="10.7" r="2.4" fill="currentColor" fill-opacity=".35"/>

IconChat (dos globos de diálogo) · TRAZOS:
<path d="M4.1 5.2h11.8a2.1 2.1 0 0 1 2.1 2.1v6.1a2.1 2.1 0 0 1-2.1 2.1H9.4l-3.9 3v-3H4.1A2.1 2.1 0 0 1 2 13.4V7.3a2.1 2.1 0 0 1 2.1-2.1Z"/><path stroke-width="2.6" d="M8.1 9.9h.01M11.9 9.9h.01M15.7 9.9h.01"/><path d="M13.5 17.1h5.1a2.1 2.1 0 0 1 2.1 2.1v2.1l-2.4-1.7h-4.8"/>

IconPerson (busto) · TRAZOS:
<circle cx="12" cy="7.4" r="3.4"/><path d="M5 20c.75-4 3.1-6 7-6s6.25 2 7 6"/>
ACENTOS: <circle cx="12" cy="7.4" r="1.15" fill="currentColor" fill-opacity=".5"/>

IconMatches (dos tarjetas de perfil con estrella; carrusel "Nuevos matches") · TRAZOS:
<rect x="3.4" y="4.2" width="8.6" height="11.8" rx="1.8"/><rect x="12" y="7.2" width="8.6" height="11.8" rx="1.8"/><path d="M5.5 12.4c.65-1.15 3.7-1.15 4.35 0"/><path d="M14.1 15.4c.65-1.15 3.7-1.15 4.35 0"/>
ACENTOS: <circle cx="7.7" cy="8.1" r="1.45" fill="currentColor"/><circle cx="16.3" cy="11.1" r="1.45" fill="currentColor" fill-opacity=".55"/><path d="m15.9 5.8.45.9.99.14-.72.7.17.99-.89-.47-.89.47.17-.99-.72-.7.99-.14.45-.9Z" fill="currentColor" fill-opacity=".55"/>

IconHeart (corazón con relleno tenue; guardar y favoritos) · TRAZOS:
<path fill="currentColor" fill-opacity=".22" d="M12 20.2s-7.5-4.5-7.5-10A4.1 4.1 0 0 1 8.6 6a4.4 4.4 0 0 1 3.4 1.7A4.4 4.4 0 0 1 15.4 6a4.1 4.1 0 0 1 4.1 4.2c0 5.5-7.5 10-7.5 10Z"/>

IconMatchHeart (corazón con check; modal "¡Hicieron match!") · TRAZOS:
<path fill="currentColor" fill-opacity=".18" d="M12 20.2s-7.1-4.2-7.1-9.2A3.9 3.9 0 0 1 8.8 7a4.1 4.1 0 0 1 3.2 1.6A4.1 4.1 0 0 1 15.2 7a3.9 3.9 0 0 1 3.9 4c0 5-7.1 9.2-7.1 9.2Z"/><path d="m9.3 12.1 1.7 1.7 3.7-3.8"/>

IconBell (campana con punto) · TRAZOS:
<path d="M6.1 16.8h11.8l-1.5-2.2V10a4.4 4.4 0 0 0-8.8 0v4.6l-1.5 2.2Z"/><path d="M9.8 19.2a2.4 2.4 0 0 0 4.4 0"/>
ACENTOS: <circle cx="18.7" cy="5.3" r="2.3" fill="currentColor" fill-opacity=".45"/><path stroke="currentColor" stroke-width="1.2" stroke-linecap="round" d="M18.7 4v1.6M17.9 4.8h1.6"/>

IconFilter (sliders; Filtros) · TRAZOS:
<path d="M4 7h7M15 7h5M4 12h3M11 12h9M4 17h7M15 17h5"/><circle cx="13" cy="7" r="2" fill="var(--color-surface)"/><circle cx="9" cy="12" r="2" fill="var(--color-surface)"/><circle cx="13" cy="17" r="2" fill="var(--color-surface)"/>

IconClose (X) · TRAZOS:
<path d="m9 9 6 6M15 9l-6 6"/>
Variante con círculo: agrega <circle cx="12" cy="12" r="8.5"/> a los TRAZOS.

IconLike (pulgar arriba con relleno tenue; "Me interesa") · TRAZOS:
<path fill="currentColor" fill-opacity=".2" d="M7.4 10.2v9.1h9.1c1.1 0 1.9-.6 2.2-1.6l1.2-4.6a2 2 0 0 0-1.9-2.5h-3.1l.7-3.1c.3-1.4-.8-2.7-2.2-2.7L9.1 10.2H7.4Z"/><path d="M4 10.2h3.4v9.1H4z"/>

IconMore (tres puntos; menú ⋯) · solo ACENTOS:
<circle cx="6" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="18" cy="12" r="1.7" fill="currentColor"/>

10.4 Cambios de nombre (código actual → sistema nuevo)
- IconExplore → IconSearch (misma lupa).
- IconGear actual (sliders) → IconFilter. Se usa solo para Filtros.
- IconGear nuevo = rueda dentada que tú dibujas, en el mismo estilo. Se usa solo para Ajustes, en el AppBar de Perfil.
- Sin cambios: IconHome, IconOffers, IconChat, IconPerson, IconMatches, IconHeart, IconMatchHeart, IconBell, IconClose, IconLike, IconMore.
~~~

---

## B) PROMPTS POR MÓDULO

### Módulo 1 · Sistema de diseño y componentes

~~~text
Usa el PROMPT MAESTRO de Talently. En esta sesión entrega SOLO el sistema de diseño, en 6 lotes. En este módulo, cada elemento se muestra en claro y oscuro lado a lado.

LOTE 1 · Tokens
- Muestras de color de todos los tokens en claro y oscuro, con su hex y el contraste medido (por ejemplo "Blanco sobre #6D4AFF 5,15:1 AA"; "#A78BFA sobre #2A2148 5,47:1", que es el borde de selección en oscuro).
- Escala tipográfica con un ejemplo real por estilo: Display "¡Hicieron match!", H1 "Turnos para ti", H2 "Filtros", H3 "Garzones para matrimonio", Body-L, Body, Label "Comuna", Caption "hace 5 min", Overline "REQUISITOS".
- Espaciado, radios, elevación (en claro y oscuro), movimiento (incluida --ease-spring) y capas.

LOTE 2 · Marca e íconos
- BrandLogo en 32, 56 y 72, en sus dos variantes (sección 10.1 y 10.2), sobre fondo claro, oscuro y sobre el hero de Bienvenida (--gradient-brand en claro y --gradient-hero-dark en oscuro).
- Hoja de íconos: los 13 oficiales de la sección 10.3 (copiados tal cual), los nuevos y los de categoría, todos en 24 px y trazo 1,8, en grilla, con su nombre. Marca la diferencia entre IconGear (rueda) e IconFilter (sliders). Muestra cada ícono en text, text-3 y primary-text, en ambos temas.

LOTE 3 · Controles (cada uno con default, pressed, focus, selected, disabled, error y loading)
Button (5 variantes × 3 tamaños, con y sin ícono, loading), IconButton, BackButton, TextField (vacío, con valor, foco, error "Ingresa un RUT válido" con el valor "76.123.456-7", deshabilitado), TextArea con contador, MoneyField ("$ 650.000" + "al mes"), SearchField, Select y SheetPicker (hoja de comunas con buscador), Chip (filter, input, suggestion) y ChipGroup ("2 de 3"), Badge (6 tonos: "Nuevo", "Postulado", "Confirmado", "Vence en 30 días", "Rechazada", "En revisión"), Switch, Checkbox, Radio.

LOTE 4 · Estructura
AppBar large y standard (y transparente sobre foto y sobre cabecera surface-2), BottomTabBar (con badge "3" en Mensajes), OptionCard (single, multi, lista y grilla; con el borde de selección en primary-text), SegmentedControl en dos variantes de fase (F1 "Empleos · Turnos"; F2 "Empleos · Turnos · Clases"), Card, SectionCard (con datos y vacía), ListItem (todas sus variantes, incluida danger), Avatar (persona y organización, 4 tamaños, con iniciales y con punto de verificación), BottomSheet, Dialog ("¿Descartar cambios?" · "Seguir editando" / "Descartar"), Toast y Snackbar ("Publicación pausada · Deshacer").

LOTE 5 · Estados y componentes de dominio
EmptyState, ErrorState, Skeleton (lista, tarjeta, perfil), Spinner, ResultScreen (éxito, info, error), StepLayout con ProgressStepper ("Paso 2 de 5"), MediaUploader (3 variantes), DynamicFields (ejemplo guardia), AvailabilityGrid, SlotPicker, CalendarWeek, VerificationBadge (4 estados), RatingStars ("4,8 (23)"), ReliabilityMeter ("96 % · 25 turnos"), ActionPair, Amount (los 5 ejemplos del maestro), ContextChip.

LOTE 6 · PublicationCard por tipo (compacta y completa)
- Empleo (F1): logo "Seguridad Andes Ltda." + "Organización verificada" · "Guardia de seguridad 4x4" · chips "Jornada completa", "Plazo fijo", "Turno de noche" · "$650.000 líquidos al mes" · "a 4 km · Puente Alto" · línea "Por qué ves esto: calza con tu oficio y está a 4 km".
- Turno (F1): logo "Banquetería Rosa SpA" · "Garzones para matrimonio" · "sáb 12 dic · 18:00–00:00 (6 h)" · "$35.000 líquidos por turno" · "Quedan 3 de 8 cupos" · "a 6 km · San Miguel" · CTA "Tomar turno".
- Servicio (F3): avatar "Luis Contreras" + "Identidad verificada" + insignia "SEC gas" · "Gasfitería e instalación de gas" · "Desde $25.000 por visita" · "4,9 (41)" · "Atiende La Cisterna y 6 comunas más" · CTA "Solicitar cotización".
- Clase (F2): avatar "Camila Fuentes" + "Titulada" + "Apta para trabajar con menores" · "Matemática y PAES M1" · chips "Online", "En la casa del alumno", "Clase de prueba gratis" · "$18.000 por clase de 60 min" · "4,8 (23)" · CTA "Ver horarios".
Muestra también la tarjeta del deck de empleos (grande, elev-3) con el ActionPair debajo.
Cierra con una tabla "componente → dónde se usa" (IDs de pantalla).
~~~

### Módulo 2 · AppShell y navegación

~~~text
Usa el PROMPT MAESTRO de Talently. Diseña el marco común de la app: pestañas, AppBars, selector de actor, notificaciones y el comportamiento del botón atrás. El contenido de cada pestaña se diseña en M4 a M8; aquí usa contenido de muestra simple con componentes de la librería. La TabBar y los AppBar son idénticos en todas las variantes.

LOTE 1 · Shell de persona (Matías, F1)
- Las 5 pestañas, cada una con su AppBar large: Inicio ("Hola, Matías" + campana con badge), Explorar ("Explorar" + Filtros con contador + campana), Actividad ("Actividad" + campana), Mensajes ("Mensajes" + campana), Perfil ("Perfil" + campana + IconGear). TabBar con la pestaña activa correspondiente y badge "3" en Mensajes.
- Una pantalla apilada de ejemplo (DET-01, solo estructura) con AppBar standard: BackButton, título centrado y 2 acciones como máximo. Muestra también el AppBar al hacer scroll (elev-2).

LOTE 2 · Shell de organización y cambio de actor (Rosa, F1)
- Inicio y Perfil con el chip de actor "Banquetería Rosa SpA" (avatar cuadrado + chevron) en el AppBar.
- SHT-ACTOR "Usar Talently como" (Rosa): "Rosa Muñoz" · "Banquetería Rosa SpA" (con punto de no leídos en el actor que no está activo) · "+ Crear organización".
- Variante de Matías sin chip de actor (no pertenece a ninguna organización).
- NOT-01 Notificaciones: agrupadas Hoy · Ayer · Esta semana · Antes; ítems con ícono del tipo, texto, hora relativa y punto de no leído; "Marcar todas como leídas" solo si hay al menos una sin leer. Al tocar una notificación de otro actor, la app cambia de actor sola: muestra el Snackbar "Cambiaste a Banquetería Rosa SpA".

LOTE 3 · Sistema y navegación
- SYS-404 "No encontramos esta página" + "Ir a Inicio". SYS-UPD "Actualiza Talently para seguir" (pantalla bloqueante con botón a la tienda).
- Banner sin conexión (info): "Sin conexión. Mostramos lo último que cargaste".
- Toast "Presiona atrás otra vez para salir" sobre Inicio.
- Mapa de navegación: pestañas, pantallas apiladas y hojas, con sus IDs.
- Diagrama del botón atrás con los 6 pasos y un ejemplo real de cada uno: hoja de Filtros abierta en Explorar (se cierra); PRF-03 con cambios ("¿Descartar cambios?"); ONB-T3 (vuelve a ONB-T2); DET-01 abierto desde EXP-02 (vuelve a EXP-02 en el mismo scroll); pestaña Mensajes (va a Inicio); Inicio (toast y salida).

Después: lote de modo oscuro y lote de estados (Skeleton del shell, sin conexión, notificaciones vacías "No tienes notificaciones").
~~~

### Módulo 3 · Bienvenida, registro y onboarding

~~~text
Usa el PROMPT MAESTRO de Talently. Diseña el acceso y el onboarding completo, con todas sus ramas. Todas las pantallas del onboarding usan StepLayout. Meta: el bloque principal en 6 pantallas o menos y menos de 3 minutos después de crear la cuenta.

LOTE 1 · Acceso
- AUTH-01 Bienvenida (/): la mitad superior es un hero con una ilustración de personas de distintos oficios (garzona con bandeja, guardia, profesora con cuaderno, gasfíter con llave, asesora del hogar) sobre --gradient-brand (en oscuro, --gradient-hero-dark), con el BrandLogo lg. Debajo, sobre --color-bg y nunca encima del gradiente: título Display "Trabajo, turnos, servicios y clases cerca de ti", subtítulo "Con gente verificada en tu comuna", y los botones "Crear cuenta" (primary lg) y "Ya tengo cuenta" (outline lg). Aquí NO se elige tipo de cuenta.
- AUTH-02 Crear cuenta (/registro): ARRIBA, un único checkbox "Acepto los Términos y la Política de privacidad" con enlaces reales. Debajo, "Continuar con Google" (outline con logo de Google), separador "o", y los campos Nombre y apellido, Correo y Contraseña (con ojo y checklist en vivo: 8 caracteres o más · una mayúscula · un número o símbolo). Al final, el CTA "Crear cuenta". Mientras el checkbox no esté marcado, "Continuar con Google" y "Crear cuenta" se ven deshabilitados (surface-2 con text-disabled). Estados: error de campo, correo ya registrado ("Ya existe una cuenta con este correo. Iniciar sesión"), loading.
- AUTH-03 Revisa tu correo: código de 6 dígitos en 6 casillas, "Reenviar código (en 0:45)".
- AUTH-04 Iniciar sesión. AUTH-05 Recuperar contraseña (un solo mensaje de éxito). AUTH-06 Nueva contraseña (misma checklist que AUTH-02). AUTH-07 Procesando ingreso (BrandLogo + Spinner).
- AUTH-08 Verificar teléfono (hoja): "+56 9" + número, OTP por SMS o WhatsApp. No es parte del onboarding: aparece la primera vez que la persona toca "Tomar turno", publica por primera vez o hace su primera reserva. Muéstrala sobre el DET-01 de un turno.
Todas con el mismo layout: AppBar standard (salvo Bienvenida), contenido centrado en 480, CTA abajo.

LOTE 2 · Onboarding común y bloque Trabajo con Jorge (guardia: empleo y turnos)
- ONB-01 ¿Qué quieres hacer en Talently? (selección múltiple con OptionCard, sin barra de progreso todavía)
  Grupo "Quiero trabajar":
  · Buscar empleo — "Estable o part time: profesor, operario, técnico, administrativo…"
  · Tomar turnos o trabajos por día — "Garzón, banquetero, guardia de eventos, bodega…"
  · Ofrecer mis servicios — "Gasfíter, electricista, mecánico…" + Badge info "Reservas desde junio"
  · Dar clases particulares — "Matemática, inglés, PAES, música…" + Badge info "Reservas desde marzo"
  Grupo "Quiero contratar o aprender":
  · Contratar para mi empresa o negocio — "Empleos y turnos"
  · Contratar para mi hogar — "Asesora del hogar, niñera, cuidadora"
  · Tomar clases — "Para mí o para mis hijos" (solo en la variante F2)
  Pie: "Puedes agregar más perfiles después". CTA "Continuar" deshabilitado hasta elegir una. Entrega la variante F1 y la F2.
- ONB-02 ¿Con cuál empiezas? (hoja): aparece si eligió más de una. Lista de las elegidas; "Las demás quedan guardadas para después".
- ONB-03 Tus datos: Nombre y Apellido (dos campos, precargados desde el registro o Google), Comuna (SheetPicker con buscador, o "Usar mi ubicación"), Foto (opcional; si eligió Clases o Servicios, ayuda "La necesitarás para publicar"), Fecha de nacimiento (solo si eligió algo de "Quiero trabajar"; ayuda "Es privada, no se muestra"; error si es menor de 18: "Debes tener 18 años o más para ofrecer trabajo, servicios o clases"), Teléfono (opcional; ayuda "Te lo pediremos verificado cuando tomes tu primer turno o publiques").
- Desde ONB-03, la barra muestra "Paso X de N" y N ya no cambia. Menú ⋯ en el AppBar: Guardar y salir · Ayuda · Cerrar sesión · Eliminar cuenta.
- ONB-T1 ¿En qué quieres trabajar?: SheetPicker de oficios con sinónimos (busca "nana", "chasquilla", "OS10"), 1 a 3 oficios, uno marcado "Principal", y por cada uno "Años de experiencia" con las etiquetas del diccionario.
- ONB-T2 ¿Qué tipo de trabajo buscas?: jornadas en chips (Jornada completa, Part time, Part time estudiante, Temporada, Por obra), solo si busca empleo y precargadas según la tarjeta elegida; modalidad, solo si algún oficio admite remoto; "Disponible desde" (Inmediata, En 15 días, En 1 mes, A convenir); radio de desplazamiento (5 km, 10 km, 20 km, Toda la región); "Tengo movilización propia" (Switch). Si busca turnos: AvailabilityGrid.
- ONB-T3 ¿Cuánto esperas ganar? (opcional): MoneyField con unidad según lo que busca (sueldo líquido al mes para empleo; tarifa mínima por turno o por hora para turnos; si busca ambos, los dos campos) y "Prefiero no decir". Si busca turnos: "Tengo vestimenta propia" (chips: Camisa blanca, Pantalón negro, Zapatos negros, Corbata humita).
- ONB-T4 Requisitos de tu oficio (solo si el oficio tiene reglas): DynamicFields de guardia (Sistema de turno: 4x4, 5x2, 7x7, 12 h, rotativo; Turno de día o de noche) + tarjeta de credencial "Credencial de guardia SPD (ex OS-10)" con Badge warning "Obligatoria", texto "Sin credencial SPD vigente no podrás ser confirmado en turnos de guardia", botones "Subir ahora" / "Después".
- ONB-T5 Experiencia y CV (opcional, solo si busca empleo): plantilla oficio = "Tu último trabajo" (empleador, cargo, desde, hasta); plantilla profesional = MediaUploader documento "Subir CV en PDF".

LOTE 3 · Bloque Trabajo con Matías (garzón, solo turnos) y cierre
- ONB-T1 a ONB-T4 de Matías, solo donde cambian: T2 sin jornadas y con AvailabilityGrid; T3 con tarifa mínima por turno y vestimenta; T4 con "Curso de manipulación de alimentos" y Badge "Recomendada", más DynamicFields de gastronomía (tipo de evento: matrimonio, corporativo, cóctel; experiencia en bandeja o vinos).
- ONB-99 Listo (Jorge y Matías): resumen por perfil con completitud real ("Perfil de trabajo: te falta la credencial SPD"), CTAs a lo que falta, UNA acción sugerida ("Ver empleos cerca" / "Ver turnos de este fin de semana") e "Ir a Inicio". Sin confeti ni "Perfil al 100 %".

LOTE 4 · Bloque Organización (Rosa) y bloque Hogar (Carolina)
- ONB-O1 Tu organización: tipo (OptionCard: Empresa · Pyme o emprendimiento · Persona con giro · Colegio, jardín u OTEC · ONG o fundación), nombre de fantasía, RUT con validación en vivo (válido "76.123.456-0"; error "Ingresa un RUT válido" con "76.123.456-7"), rubro (SheetPicker).
- ONB-O2 Tamaño y ubicación: tramo de trabajadores (Solo yo · 2 a 9 · 10 a 49 · 50 a 199 · 200 o más), comuna de la sede principal, sitio web (opcional).
- ONB-O3 Cómo te verán (opcional): logo (MediaUploader cuadrado) y descripción con contador "0/300".
- ONB-O4 ¿Qué quieres publicar primero?: Empleo · Turno · Más tarde. Aviso info: "Revisaremos tu organización con tu primera publicación (hasta 24 h hábiles)". Empleo y Turno abren el asistente de publicación (M7 y M6); "Más tarde" lleva a ONB-99.
  Nada de etapa de inversión, B2B/B2C, seniority, LinkedIn ni tags en inglés: la cultura, los beneficios, LinkedIn y las tecnologías (solo si el rubro es TI) se completan después en el Perfil de la organización.
- ONB-H1 ¿Qué necesitas?: OptionCard con Asesora del hogar (puertas adentro, puertas afuera o por días) · Niñera · Cuidado de adulto mayor · Chofer · Banquetero o garzón para un evento · Arreglo puntual ("Te avisaremos cuando abramos Servicios"). Contexto del hogar con 3 Checkbox: Hay niños · Hay adulto mayor · Hay mascotas. Texto: "Te pediremos verificar tu identidad cuando publiques tu aviso".
- ONB-99 Listo del hogar, con la acción sugerida "Publicar aviso para tu hogar" (o "Publicar turno para tu evento").

LOTE 5 · Bloque Clases (Camila) · ONB-K1 a K5
- K1 Materias y niveles (Preescolar · Básica 1° a 4° · Básica 5° a 8° · Media · PAES · Universitaria · Adultos · Adulto mayor).
- K2 Modalidad (Online · En casa del profesor · En la casa del alumno · Lugar público) y comunas.
- K3 Duración, precio por clase ("$18.000 por clase de 60 min"), clase de prueba (Sin clase de prueba · Clase de prueba gratis · Clase de prueba con descuento), paquetes de 4 u 8 (opcional).
- K4 Disponibilidad semanal, anticipación mínima y política de cancelación (Flexible · Moderada · Estricta, con la explicación de cada una).
- K5 Menores de edad:
  · Si en K1 eligió algún nivel escolar (preescolar, básica o media), la respuesta viene fija: "Sí, porque elegiste niveles escolares", sin pregunta.
  · Si no, la pregunta "¿Enseñas a menores de edad?" (Sí / No).
  · Si la respuesta es sí: paso obligatorio del certificado de inhabilidades (qué es, enlace a registrocivil.cl, consentimiento en contexto, subir). Salida: "Subirlo después: por ahora, solo alumnos adultos" (los niveles escolares quedan ocultos hasta verificarlo).
  · Formación (opcional).
- Cierre en ONB-99, variante lista de espera (F1): "Tu perfil de profesora se publicará en marzo" con Badge info "Lista de espera". Variante F2: vista previa y "Publicar", que pide identidad verificada.

LOTE 6 · Bloque Servicios (Luis) y bloque Aprendo (Carolina, F2)
- ONB-S1 Oficios y servicios · S2 Cobertura (comunas o radio; a domicilio o en taller) · S3 Precio (Por hora · Por visita · Desde · A cotizar · Paquete), visita de diagnóstico, "Emito boleta" · S4 Horario semanal · S5 Credenciales (SEC obligatoria si es gas o electricidad: "Sin licencia SEC solo podrás ofrecerte como ayudante") y portafolio de hasta 8 fotos (opcional).
- Cierre en ONB-99, variante lista de espera: "Tu perfil de servicios se publicará en junio".
- ONB-A1 ¿Para quién? (Para mí · Para mi hijo/a: nombre de pila, nivel y año de nacimiento). ONB-A2 Materias, modalidad y presupuesto (opcional).
- Cierre en ONB-99 con la acción sugerida "Ver profesores de inglés para Tomás", que abre Explorar · Clases con esos filtros aplicados.

LOTE 7 · Extras
- SHT-MIGRA "Confirma tu comuna y tu oficio" (usuarios de la versión anterior): una sola hoja, no repite el onboarding.
- Menú ⋯ abierto sobre un paso. Dialog al salir de un paso: "¿Salir del registro? Guardaremos lo que llevas" · "Seguir" / "Guardar y salir".
- Diagrama de flujo de todas las ramas con su largo. Pantallas desde Crear cuenta, sin contar Revisa tu correo: guardia que solo busca turnos 8 (AUTH-02, ONB-01, ONB-03, T1 a T4, ONB-99); empresa 7 (AUTH-02, ONB-01, ONB-03, O1 a O4, y termina publicando); hogar 5 (AUTH-02, ONB-01, ONB-03, H1, ONB-99). La barra "Paso X de N" cuenta desde ONB-03: N = 5, 5 y 2. Jorge, que además busca empleo, suma T5 (N = 6).

Después: lote de modo oscuro y lote de estados: cargando el catálogo de oficios (Skeleton de chips), sin resultados ("No encontramos 'soldadora TIG'. Sugerir este oficio"), error al guardar (Snackbar con "Reintentar").
~~~

### Módulo 4 · Inicio y Actividad por perfil

~~~text
Usa el PROMPT MAESTRO de Talently. Diseña las pestañas Inicio y Actividad para cada perfil, sobre el AppShell aprobado en M2. "Hoy" es jue 10 dic 2026 en F1 y mié 10 mar 2027 en F2.

LOTE 1 · INI-01 Inicio (persona). AppBar large "Hola, <nombre>" + campana con badge. Los bloques aparecen solo si su perfil está activo.
1a. Trabajador de turnos (Matías, F1): "Hoy en tu agenda" (Turno de garzón · hoy 19:00–00:00 · Banquetería Rosa SpA · cóctel corporativo en Providencia), "Turnos para ti" (3 PublicationCard compactas ordenadas por fecha y distancia + "Ver todos"), "Postulaciones con novedades" ("Hotel Andino vio tu postulación"), tarjeta de completitud honesta ("Agrega tu curso de manipulación de alimentos para destacar").
1b. Trabajador que busca empleo (Pedro, mecánico, F1): "Empleos para ti" (atajo al deck con la primera tarjeta: "Mecánico/a automotriz · Taller Los Aromos · Macul"), "Postulaciones con novedades" ("Taller Los Aromos vio tu postulación"), tarjeta de completitud ("Agrega tu título técnico o tu certificación ChileValora para destacar").
2. Profesora (Camila, F2): "Reservas por confirmar" (2), "Tus próximas clases", acceso "Mi disponibilidad", CTA "Publicar".
3. Hogar (Carolina, F1): grilla "¿Qué necesitas?" con OptionCard en grilla de 2 (Asesora del hogar, Niñera, Cuidado de adulto mayor, Banquetero para un evento); "Tu aviso: Asesora del hogar puertas afuera · 6 postulantes nuevos"; CTA "Publicar". Entrega también la variante F2, donde la grilla suma "Clases".
4. Apoderada (Carolina con el perfil Aprendo, F2): "Próxima clase de Tomás: Inglés · mañana jue 11 mar · 17:00 · online".
5. Multi-perfil (Valentina, F1): "Turnos para ti" (promotora), tarjeta "Completa tu perfil de servicios" y tarjeta "Tu perfil de profesora se publicará en marzo".

LOTE 2 · Inicio de la organización y Actividad
- INI-02 Inicio (organización, Rosa): chip de actor "Banquetería Rosa SpA". KPIs reales en Cards (Postulantes nuevos 12 · Turnos de la semana 4/6 cubiertos · Conversaciones sin responder 3 · Respondes en promedio en 2 h). CTA "Publicar" (abre la hoja Empleo / Turno). Lista "Requiere tu atención": "Turno vie 11 dic · 12:00: faltan 2 garzones (en 23 h)", "5 postulantes sin revisar en Bartender", "Evalúa a 6 personas del turno del sáb 5 dic".
- Actividad (persona): SegmentedControl solo con los segmentos que aplican.
  · ACT-01 Agenda (Matías): CalendarWeek (día y semana) con turnos confirmados, entrevistas, clases y visitas, cada uno con su ícono. En la variante de Camila (F2), acceso "Mi disponibilidad" (la pantalla ACT-04 se diseña en M9).
  · ACT-02 Postulaciones (Jorge): empleos y turnos con Badge de estado (Postulado, Visto, En proceso, Entrevista, Confirmado, En lista de espera, No seleccionado).
  · ACT-03 Mis publicaciones (Carolina): su aviso del hogar con el número de postulantes.
- Actividad (organización, Rosa): Publicaciones (Activas · Pausadas · Cerradas) y Agenda (turnos por fecha con "4/6 cupos").

Después: lote de modo oscuro y lote de estados: Skeleton de Inicio, Inicio vacío de una cuenta nueva, Agenda vacía ("Aún no tienes nada agendado · Ver turnos de esta semana"), sin conexión.
~~~

### Módulo 5 · Empleo: explorar, detalle, postulación, match y mensajes

~~~text
Usa el PROMPT MAESTRO de Talently. Diseña el flujo completo de empleo para el trabajador y la conversación. Todo es F1; "hoy" es jue 10 dic 2026.

LOTE 1 · Explorar y detalle
- EXP-01 Explorar · Empleos (Pedro): AppBar large "Explorar" + Filtros (con contador "2") + campana. SegmentedControl F1 "Empleos · Turnos". Deck de PUBLICACIONES (no de personas): tarjeta grande con logo de la organización, título, Amount, chips de jornada, contrato y modalidad, distancia, requisitos clave y la línea "Por qué ves esto". ActionPair debajo. Botón "Ver lista" arriba a la derecha del deck. Tocar la tarjeta abre DET-01. Muestra la tarjeta arrastrándose a la derecha (sello "Me interesa" en primary-subtle) y a la izquierda ("No me interesa" en surface-2), nunca LIKE/NOPE.
  Tarjetas del deck de Pedro: "Mecánico/a automotriz · Taller Los Aromos · Jornada completa · Indefinido · $750.000 líquidos al mes · a 2 km · Macul"; "Técnico/a electromecánico/a · Plazo fijo · $900.000 líquidos al mes · Pudahuel"; "Mecánico/a diésel · Jornada completa · San Bernardo".
- EXP-01 vista lista (Jorge): las publicaciones en PublicationCard compacta ("Guardia de seguridad 4x4 · Seguridad Andes Ltda.", "Conserje · Edificio en Puente Alto", "Supervisor/a de seguridad · La Florida").
- EXP-06 Filtros (hoja), una variante por segmento:
  · Empleos: oficio, comuna y radio, nivel (chips Oficio · Técnico · Profesional), jornada, contrato, sueldo mínimo (MoneyField), "Solo organizaciones verificadas".
  · Turnos: oficio, comuna y radio, cuándo (Hoy · Mañana · Este fin de semana), franja, tarifa mínima, "Solo organizaciones verificadas".
  Pie: "Limpiar" (ghost) y "Ver 24 resultados" (primary).
- EXP-07 Buscar: SearchField con sugerencias por sinónimo ("nana" → Asesora del hogar, Niñera) y resultados agrupados por tipo. Ejemplos: "Operario/a de bodega · Jornada completa · $620.000 líquidos al mes · a 7 km · Quilicura"; "Profesor/a de Matemática media · 30 h semanales · Colegio San Esteban · Ñuñoa".
- DET-01 Detalle · plantilla Empleo (Jorge ve "Guardia de seguridad 4x4"): AppBar standard transparente sobre una cabecera surface-2 con el logo de la organización (avatar cuadrado 56), su nombre y "Organización verificada"; título; Amount grande; chips; secciones Descripción, Requisitos (credenciales con su estado para esta persona: "Tienes tu credencial SPD vigente"), Beneficios (Colación, Movilización, Bono de asistencia), Sobre la organización (enlace a PRF-11); aviso fijo "Talently nunca te pedirá pagar para postular". Pie fijo con el MISMO ActionPair del deck.
- DET-02 Postular (hoja): mensaje opcional, preguntas filtro de la organización ("¿Tienes disponibilidad para turnos de noche?" Sí/No), CV si se exige. CTA "Postular". Éxito: Snackbar "Postulaste a Guardia de seguridad 4x4". No pide teléfono: postular a un empleo no lo exige.

LOTE 2 · Match, proceso y mensajes
- DET-03 ¡Hicieron match! (modal): se muestra cuando la organización avanza tu postulación o cuando aceptas una invitación, igual venga del deck o del detalle. Modal sobre scrim: tarjeta surface-3, radio xl, elev-brand. Franja superior de 120 px con --gradient-brand, con el avatar redondo de la persona y el logo cuadrado de la organización (sin texto encima del gradiente). Debajo, sobre la superficie: IconMatchHeart, Display "¡Hicieron match!", texto Body-L "Seguridad Andes quiere conversar contigo sobre Guardia de seguridad 4x4", Button primary lg de ancho completo "Enviar mensaje" y Button ghost "Seguir explorando".
- PRC-01 Proceso de empleo (vista del trabajador): timeline que ven ambos lados (Postulado → Visto → En proceso → Entrevista → Oferta → Contratado), con fechas, la entrevista agendada y, al final, ListItem danger "Retirar postulación" que abre un Dialog.
- MSG-01 Mensajes: AppBar large "Mensajes". Carrusel "Nuevos matches (2)" solo con los que no tienen mensajes. Chips de filtro: Todos · Empleo · Turno (en F2 suma Clase; en F3, Servicio). Filas con avatar (redondo persona, cuadrado organización), nombre, ContextChip ("Empleo · Guardia 4x4"), último mensaje, hora relativa y contador real de no leídos. Vacío: "Cuando hagas match, tus conversaciones aparecerán aquí · Explorar empleos".
- MSG-02 Conversación: AppBar standard con avatar y nombre (tocable, abre el perfil público), ContextChip fijo bajo el AppBar con acceso a la publicación, burbujas (propias en primary con texto blanco, ajenas en surface-2), estados reales "Enviado" / "Leído", tarjeta de sistema de la entrevista ("Entrevista · mar 15 dic · 10:00 · Av. Concha y Toro 1234, Puente Alto · Agregar al calendario"), aviso warning al escribir un teléfono o un enlace externo ("Por tu seguridad, mantén la conversación en Talently"), menú ⋯ con Ver publicación · Reportar · Bloquear. Composer con adjuntar y enviar; mensaje en cola si no hay conexión ("Se enviará cuando vuelva la conexión").
- MSG-02b Compartir certificado de antecedentes (solo lado trabajador, después del match): en el menú "+" del composer, opción "Compartir certificado de antecedentes" → BottomSheet "Compartirlo es voluntario. Solo esta persona podrá verlo durante 7 días y puedes dejar de compartirlo cuando quieras." con "Usar el que ya subí (emitido el 12-09-2026)" o "Subir uno nuevo" y botón "Compartir". En la conversación aparece una tarjeta de sistema (no una burbuja de archivo): ícono de documento, "Certificado de antecedentes", "Emitido el 12-09-2026", VerificationBadge si fue verificado por Talently o el texto "Subido por la persona, sin verificar", botón "Ver" para la contraparte, y para el trabajador "Visto por Familia en Ñuñoa · hace 2 h" + acción "Dejar de compartir". Estado vencido o revocado: tarjeta atenuada "Ya no está disponible". El lado empleador NO tiene botón para pedirlo.
- SHT-REPORTE: motivos tipificados (Acoso, Estafa o cobro, Discriminación, Suplantación, Menor en riesgo, Agresión, Otro).

Después: lote de modo oscuro y lote de estados: deck vacío ("Viste todas las ofertas cerca. Amplía tu radio a 20 km"), cargando (Skeleton de tarjeta), error de red, publicación cerrada ("Esta oferta ya no recibe postulaciones").
~~~

### Módulo 6 · Turnos y part time por evento

~~~text
Usa el PROMPT MAESTRO de Talently. Diseña el flujo de turnos para el trabajador (Matías, Jorge) y la gestión de cupos de la organización (Rosa). F1, con "hoy" = jue 10 dic 2026, 13:00.

LOTE 1 · Trabajador
- EXP-02 Explorar · Turnos (Matías, chip de oficio en "Todos"): SIEMPRE lista agrupada por fecha con encabezados Overline: "HOY", "MAÑANA", "ESTE FIN DE SEMANA", "MÁS ADELANTE". Chips de oficio (Garzón, Bartender, Guardia de eventos, Bodega) y comuna. Cada PublicationCard de turno: logo + "Organización verificada", oficio, fecha y horario, Amount, "Quedan 3 de 8 cupos" (Badge warning si quedan 2 o menos), distancia y CTA sm "Tomar turno".
  · HOY: "Operario/a de bodega · Turno noche · hoy 22:00–06:00 · Pudahuel · $6.500 líquidos por hora".
  · MAÑANA: "Guardia de eventos · Concierto en Parque O'Higgins · vie 11 dic · 17:00–01:00 · $40.000 líquidos por turno".
  · ESTE FIN DE SEMANA: "Garzones para matrimonio · Casona en Las Condes · sáb 12 dic · 18:00–00:00 · $35.000 líquidos por turno".
  · MÁS ADELANTE: "Bartender · Fiesta de Año Nuevo · jue 31 dic · 21:00–04:00 · $60.000 líquidos por turno".
- DET-01 Detalle · plantilla Turno: fecha y horario grandes, varios bloques si es una serie (sáb 12 y dom 13 dic), cupos restantes, tarifa, punto de encuentro aproximado ("Metro Los Dominicos · la dirección exacta se muestra al confirmar"), vestimenta ("Camisa blanca, pantalón y zapatos negros"), requisitos con su estado para esta persona, nota mínima ("Nota mínima 4,5"), nota de la organización y aviso "Talently no contrata ni paga: la organización te contrata directamente (plazo fijo o por obra)". CTA fijo "Tomar turno".
- Al tocar "Tomar turno": si falta el teléfono verificado, primero AUTH-08 (hoja); si falta una credencial obligatoria, hoja "Te falta la credencial SPD para este turno · Subir ahora". Si todo está bien: Snackbar "Postulaste al turno. Te avisaremos cuando te confirmen".
- TUR-01 Mi turno: estados Postulado · Confirmado · En lista de espera (con posición "Estás en el lugar 2 de la lista de espera") · No seleccionado · Cancelado por la organización. Confirmado muestra: dirección exacta, nombre del encargado, "Conversación con la organización" (1:1 en F1; en la variante F2, "Chat del turno" grupal), "Agregar al calendario", recordatorio "Confirmo asistencia" (24 h y 2 h antes), "Cancelar turno" con la regla visible ("Si cancelas con menos de 12 h, baja tu Confiabilidad") y "Compartir mi turno con alguien de confianza".
- REV-01 Evaluación mutua al cerrar el turno: nota de 1 a 5 con estrellas grandes, etiquetas (al evaluar al trabajador: Puntualidad, Presentación, Desempeño; al evaluar a la organización: Pago a tiempo) y comentario opcional. Se pide antes de postular al siguiente turno. Texto: "Tu evaluación se publicará cuando ambos evalúen o en 7 días".

LOTE 2 · Organización (Rosa) y hogar (Carolina)
- PUBL-03 Publicar turno (asistente de 4 pasos): 1 Oficio y plantilla ("Usar plantilla: Garzones fin de semana") · 2 Fechas y bloques (agregar fecha, horario y cupos; "+ Agregar otro bloque") · 3 Tarifa (MoneyField "por turno" o "por hora", líquido o bruto) y forma de contratación (Plazo fijo · Por obra · Part time · "Boleta de honorarios" · "Boleta de terceros"; al elegir una boleta aparece el aviso warning "Sin subordinación ni dependencia: no puede haber horario fijo impuesto, supervisión directa ni exclusividad"), vestimenta, punto de encuentro, requisitos y nota mínima · 4 Vista previa con la PublicationCard real.
  · Si la organización no está verificada: aviso "Los turnos se habilitan cuando verifiquemos tu organización".
  · Variante hogar (Carolina publica un turno para un evento en casa): aviso "Verifica tu identidad para publicar el turno de tu evento", con acceso a VER-02.
  · Al publicar por primera vez, AUTH-08 si falta el teléfono.
- GES-04 Cupos del turno: cabecera "Garzones · sáb 12 dic · 5/8 confirmados" con barra de progreso y SegmentedControl Confirmados · Postulados · Lista de espera. Cada persona en ListItem con avatar, nota, Confiabilidad y botón "Confirmar" (un toque); acción masiva "Confirmar a mis favoritos". Después del turno: "Asistió" / "No asistió" y "Evaluar".
- GES-05 Trabajadores favoritos: lista con "Invitar a un turno".
- Perfil del trabajador visto por la organización (PRF-10 ?ver=trabajo): ReliabilityMeter "Confiabilidad 96 % · 25 turnos cumplidos" y nota "4,9 (25)".

Después: lote de modo oscuro y lote de estados: sin turnos cerca ("No hay turnos en Maipú esta semana; hay 8 a menos de 10 km · Ver"), turno lleno ("Cupos completos · Unirme a la lista de espera"), turno cancelado por la organización (Badge danger + aviso).
~~~

### Módulo 7 · Contratar: organización y hogar empleador

~~~text
Usa el PROMPT MAESTRO de Talently. Diseña lo que hace quien contrata: Rosa (Banquetería Rosa SpA, San Miguel), el Colegio San Esteban (Ñuñoa), que publica un empleo de profesor, Seguridad Andes Ltda. (Puente Alto) y Carolina (hogar, Ñuñoa). PUBL-03, GES-04 y GES-05 ya se diseñaron en M6, INI-02 en M4 y VER-04 se diseña en M8.

LOTE 1 · Publicar empleo
- PUBL-01 ¿Qué quieres publicar? (hoja): OptionCard solo con lo que aplica al actor activo. Rosa: Empleo · Turno. Carolina (persona con hogar): Aviso para mi hogar · Turno para un evento. Camila (F2): Clase. Luis (F3): Servicio.
- PUBL-02 Publicar empleo (5 pasos, Colegio San Esteban): 1 Oficio, título y vacantes · 2 Contrato (Indefinido, Plazo fijo, Por obra; "Honorarios" con la advertencia "Con honorarios no puede haber jefatura ni horario fijo; si los hay, corresponde un contrato de trabajo"), jornada, horas semanales, modalidad (solo si el oficio admite remoto), sueldo (MoneyField, líquido o bruto), comuna o sede · 3 Requisitos del oficio con DynamicFields y credenciales (profesor: nivel, asignatura, horas cronológicas, y Título + inhabilidades obligatorios; variante de Seguridad Andes para guardia: sistema de turno y credencial SPD) · 4 Descripción con contador "0/3000" y aviso "No pidas edad, sexo, nacionalidad, estado civil ni 'buena presencia'" (si la escribe, aviso educativo warning en línea) · 5 Vista previa con la PublicationCard y el DET-01 reales.
- PUBL-08 Elegir tipo de publicación (último paso de PUBL-02, PUBL-03 y PUBL-04, antes de la vista previa): dos OptionCard lado a lado, "Clásica · Gratis" (orden normal, 30 días) y "Premium · $14.990" (etiqueta Destacado, primera en su oficio y comuna, llega a más personas, aviso a candidatos que calzan, estadísticas); en F1 y F2 la Premium dice "Pronto" y no se puede elegir.
- PRF-12 Impulsa tu perfil (trabajador, desde Perfil y desde Postulaciones): explica en 3 viñetas qué hace ("Más empresas de tu oficio verán tu perfil primero", "Durante 7 días", "No cambia cómo te evalúan"), precios "7 días · $2.990" y "30 días · $7.990", y aclara "Postular siempre es gratis". Variante F1/F2 con "Pronto". Estado activo: "Destacado hasta el 18 dic · 12 empresas vieron tu perfil".
- PUBL-07 Publicación enviada (ResultScreen): "Publicada" (éxito) o "En revisión · hasta 24 h hábiles" (info, con el motivo). CTAs "Ver publicación" e "Ir a Inicio".

LOTE 2 · Aviso del hogar y gestión
- PUBL-04 Aviso para mi hogar (Carolina, 4 pasos, plantilla legal): 1 tipo (Puertas adentro, Puertas afuera, Por días) · 2 días y horario (aviso si supera 42 h semanales puertas afuera) · 3 tareas y contexto (aseo, cocina, lavado, niños, adulto mayor, mascotas). Si marcó "Hay niños": aviso info "Como hay niños, solo podrán postular personas con certificado de inhabilidades vigente" · 4 sueldo (validación "El sueldo no puede ser menor al ingreso mínimo de $553.553 en jornada completa (proporcional si es parcial)") y vista previa. Al publicar pide identidad verificada (entrada a VER-02). Sin campos de edad, sexo ni nacionalidad.
- GES-01 Gestionar publicación: resumen con estado (Badge), métricas reales (vistas, postulantes), acciones Editar · Pausar (Snackbar "Publicación pausada · Deshacer") · Cerrar con motivo · Renovar (expira a los 30 días). Modo edición: reutiliza los pasos del asistente con los datos cargados; si el cambio toca título, descripción, sueldo o requisitos, muestra un aviso info de revisión ("Revisaremos los cambios antes de publicarlos (hasta 24 h hábiles)") y anota esa regla en "Decisiones tomadas" para confirmarla.
- GES-02 Postulantes: lista ordenada por afinidad; cada persona en ListItem con avatar, oficio principal, años de experiencia, comuna, insignias, nota y Badge de estado; acciones rápidas "Avanzar" / "No seleccionar" (con motivo amable). Al abrir una: PRF-10 con barra inferior de acciones de estado (En proceso, Agendar entrevista, Hacer oferta, Contratado).
  Variante hogar (Carolina): chip de filtro "Solo con antecedentes verificados" y, en cada fila, VerificationBadge "Apto para trabajar con menores · vence 11/2027".

LOTE 3 · Personas sugeridas, proceso y equipo
- GES-03 Personas sugeridas / EXP-05 Explorar · Personas: selector de publicación arriba, vista lista o deck de personas con el MISMO ActionPair ("No me interesa" / "Me interesa"). Aquí "Me interesa" envía la invitación a postular: Snackbar "Invitaste a Jorge a postular · Deshacer". Nunca se muestra la edad.
- PRC-01 Proceso (vista del empleador): timeline compartida, agendar entrevista (fecha, hora, lugar u online) y, al marcar "Contratado" en un aviso del hogar, checklist legal: "Firma el contrato por escrito" · "Regístralo en la Dirección del Trabajo dentro de 15 días (enlace)".
- PRC-01 vista de la trabajadora en un hogar (Marta postula a "Familia en Ñuñoa"): encabezado con avatar cuadrado "Familia en Ñuñoa" e "Identidad verificada"; antes de confirmar la entrevista, "La dirección se mostrará cuando confirmen la entrevista"; después, la dirección exacta, "Compartir mi visita con alguien de confianza", "Llegué" / "Terminé" y el botón "Ayuda · 133 · 131".
- PRF-06 Equipo (F3): miembros con rol Dueño/a · Administrador/a · Reclutador/a, "Invitar a alguien".
- Tarjeta de estado de verificación de la organización en GES-01 e INI-02, con lo que habilita ("Hasta verificar: 1 publicación activa y sin turnos") y acceso a VER-04.

Después: lote de modo oscuro y lote de estados: primera publicación en revisión, publicación rechazada por moderación con motivo y "Editar y reenviar", sin postulantes aún ("Aún no hay postulantes · Compartir tu publicación"; un consejo como "las publicaciones con sueldo visible reciben más interés" solo si hay datos que lo respalden), límite del plan gratuito (F3).
~~~

### Módulo 8 · Perfil, verificación, configuración y ayuda

~~~text
Usa el PROMPT MAESTRO de Talently. Separa claramente Perfil (lo que muestras) de Configuración (ajustes de la cuenta). NOT-01 ya se diseñó en M2.

LOTE 1 · Perfil
- PRF-01 Mi perfil (Jorge, con perfiles Trabajo y Hogar): AppBar large "Perfil" con campana e IconGear (sin chip de actor: Jorge no pertenece a una organización). Encabezado "Así te ven": foto 96, nombre, comuna, insignias reales, nota por rol. Chips "Mis perfiles": Trabajo · Hogar (con completitud real, "Te falta 1 cosa") y "Ver como me ven". SectionCards editables, cada una con lápiz de 44: Sobre mí, Oficios y experiencia, Disponibilidad, Pretensión, Credenciales, Idiomas, CV (solo si busca empleo). Más "Agregar un perfil", "Verificación y credenciales" y "Mis perfiles" (pausar o eliminar). NO incluye Cerrar sesión ni ajustes.
- PRF-03 Editar sección (hoja): usa EXACTAMENTE los mismos controles del onboarding (por ejemplo, Disponibilidad abre el AvailabilityGrid). Pie "Cancelar" / "Guardar". Snackbar de éxito o error.
- PRF-04 Agregar un perfil: OptionCard con los perfiles que aún no tiene + "Crear organización". Corre solo ese bloque.
- PRF-05 Mis perfiles: cada perfil con Switch "Visible" (pausar) y "Eliminar este perfil" (ListItem danger, con Dialog).
- PRF-10 Perfil público de persona (/u/:id?ver=trabajo): lo que ve un tercero, separado por perfil con SegmentedControl si tiene varios. Sin edad, sin teléfono, sin dirección.
- PRF-02 y PRF-11 Perfil de organización (propio y público, Rosa): logo cuadrado, "Organización verificada", rubro, comuna, tramo, descripción, beneficios, proceso de selección, LinkedIn y sitio web (una sola vez), publicaciones activas tocables, nota como empleador. Solo si ocurrió, la línea "Canceló 2 turnos con menos de 24 h de aviso"; si nunca pasó, no se muestra.

LOTE 2 · Verificación
- VER-01 Verificación y credenciales: escalera de niveles (Cuenta básica · Teléfono verificado · Identidad verificada) con el estado de cada uno, credenciales con VerificationBadge y vencimiento ("Credencial SPD · Verificada · vence 03/2028"), y lo que falta y para qué sirve ("Verifica tu identidad para recibir a alguien en tu casa").
- VER-02 Verificar identidad (asistente de 3 o 4 pantallas): ejemplos visuales (cédula por delante y por detrás con guía de encuadre, selfie), reintento guiado, "Pedir ayuda por WhatsApp", estado final "En revisión · te avisamos en menos de 24 h". "Verificarte es gratis".
- VER-03 Subir credencial: ejemplo visual del documento, número, fecha de vencimiento, archivo y consentimiento en contexto ("Usaremos este documento solo para verificarlo y lo borraremos en 30 días").
- VER-04 Verificar organización: RUT, documentos del SII, dominio del correo.

LOTE 3 · Configuración
- CFG-01 Configuración: ListItems agrupados: Cuenta · Notificaciones · Privacidad y mis datos · Apariencia · Ayuda · Términos y Privacidad · "Cerrar sesión" (ListItem danger, con Dialog) · "Eliminar cuenta" · versión al pie ("Talently 3.0.0").
- CFG-02 Cuenta: correo, teléfono, contraseña y métodos de ingreso (correo, Google).
- CFG-03 Notificaciones: Switch por tipo y canal (push, correo), horario de silencio 22:00–08:00 (salvo recordatorios).
- CFG-04 Privacidad y mis datos: visibilidad por perfil, quién ve mi teléfono, consentimientos con fecha y "Revocar", "Descargar mis datos", bloqueados.
- CFG-05 Apariencia: tema (Sistema · Claro · Oscuro) y Switch "Ahorro de datos" ("No cargamos imágenes en alta ni reproducimos videos solos"). Nota: "El tamaño de letra sigue al de tu teléfono".
- CFG-06 Eliminar cuenta: explicación honesta de lo que se borra, confirmación escrita "ELIMINAR" y error honesto si falla ("No pudimos eliminar tu cuenta. Escríbenos a soporte").

LOTE 4 · Legal y ayuda
- LEG-01 Términos y LEG-02 Privacidad: pantalla apilada con índice de secciones, texto Body-L legible y fecha de actualización única.
- AYU-01 Ayuda: preguntas frecuentes por categoría con buscador. AYU-02 Soporte: formulario de ticket (categoría, descripción, adjunto opcional) y "Escribir por WhatsApp".

Después: lote de modo oscuro y lote de estados: sección vacía con CTA ("Aún no agregas idiomas · Agregar idioma"), credencial vencida (Badge danger "Vencida" + "Tus turnos de guardia están pausados"), verificación rechazada con motivo e "Intentar de nuevo".
~~~

### Módulo 9 · Clases particulares (F2)

~~~text
Usa el PROMPT MAESTRO de Talently. Diseña Clases, que se lanza en Fase 2 (marzo 2027); marca los frames como F2 y "hoy" es mié 10 mar 2027. Ejemplos: Camila Fuentes (Matemática y PAES M1, Ñuñoa, $18.000 por clase de 60 min, clase de prueba gratis) y la apoderada Carolina Soto, que reserva para Tomás (7° básico).

LOTE 1 · Alumno o apoderado
- EXP-03 Explorar · Clases: SegmentedControl F2 "Empleos · Turnos · Clases" (o solo los que apliquen), chips de categoría (Escolar, PAES, Idiomas, Música, Deporte, Tecnología…), filtros (materia, nivel, modalidad, comuna u online, precio, nota, "Disponible esta semana", "Clase de prueba"). Si la búsqueda es para un menor (Tomás seleccionado), aviso info "Mostramos solo profesores con certificado de inhabilidades vigente".
- DET-01 Detalle · plantilla Clase / PRF-10 perfil del profesor (/u/:id?ver=clases): foto, nombre, insignias (Identidad verificada, Titulada, Apta para trabajar con menores · vigente hasta 02/2028), nota "4,8 (23)", materias y niveles, modalidades con su precio, clase de prueba, paquetes ("4 clases $64.000"), política de cancelación visible ("Moderada: cancela gratis hasta 24 h antes"), formación y reseñas. Bajo el detalle, adelanto del SlotPicker con los próximos 3 horarios libres. CTA fijo "Reservar clase".
- RES-01 Elegir horario: "¿Para quién es?" (Para mí · Tomás), SlotPicker de 14 días (días sin horario en text-disabled), horarios en chips ("16:00", "17:00", "18:30"), duración (60 / 90 min), modalidad. Aviso si es en la casa del alumno y falta verificación: "Para recibir a un profesor en casa necesitas verificar tu identidad".
- RES-02 Confirmar reserva (hoja): resumen (materia, para quién, fecha y hora "jue 11 mar · 17:00", modalidad, lugar aproximado o "Enlace por videollamada"), precio, política de cancelación y cómo se paga:
  · Variante F2: "Pagas directo al profesor" (info).
  · Variante F3: pago en la app con Mercado Pago, estado "Pendiente de pago" con el horario retenido "por 10 minutos" y contador.
  CTA "Confirmar reserva". Si es la primera reserva y falta el teléfono, AUTH-08 antes. Sugerencia para menores: "Para la primera clase te recomendamos modalidad online o un lugar público".
- RES-03 Detalle de reserva (vista alumno): estados Solicitada · Confirmada · Realizada · Cancelada · No asistió · Expirada, "Agregar al calendario", enlace de videollamada, "Reprogramar", "Cancelar" (muestra lo que aplica de la política) y, después de la hora, "¿Se realizó la clase?" Sí / No.
- REV-01 Reseña de la clase.
- Perfil del dependiente (Tomás): solo nombre de pila, nivel y año de nacimiento; sin foto ni chat propio.

LOTE 2 · Profesora
- ACT-04 Mi disponibilidad: editor semanal por bloques, excepciones ("No disponible del lun 12 al mié 14 abr"), anticipación mínima y buffer entre clases.
- PUBL-05 Publicar clase (pasos: materia y niveles · modalidad y precio · clase de prueba y paquetes · vista previa).
- Reserva entrante con "Aceptar" / "Rechazar" (expira en 12 h si tiene la confirmación manual).
- RES-03 Detalle de reserva (vista profesora): solo ve el nombre de pila y el nivel del alumno.

Después: lote de modo oscuro y lote de estados: sin horarios disponibles ("Camila no tiene horarios libres en los próximos 14 días · Avisarme"), horario tomado mientras reservabas ("Este horario se acaba de ocupar. Elige otro"), profesora en lista de espera (variante F1 de su Inicio, ya diseñada en M4).
~~~

### Módulo 10 · Servicios independientes (F3)

~~~text
Usa el PROMPT MAESTRO de Talently. Diseña Servicios, que se lanza en Fase 3 (junio 2027); marca los frames como F3 y "hoy" es mar 15 jun 2027. Ejemplos: Luis Contreras (gasfíter e instalador de gas SEC, La Cisterna) y Pedro Valdés (mecánico a domicilio, Macul).

LOTE 1 · Cliente
- EXP-04 Explorar · Servicios: lista con filtros por oficio (Gasfitería, Electricidad, Mecánica, Cerrajería, Pintura, Refrigeración), comuna, "Precio desde", nota y "Solo identidad verificada". PublicationCard de servicio.
- DET-01 Detalle · plantilla Servicio / PRF-10 perfil público del prestador (/u/:id?ver=servicios): foto obligatoria, nombre, comuna base, insignias reales (Identidad verificada, SEC gas clase 3, Antecedentes verificados), nota "4,9 (41)", servicios con su forma de precio ("Destape de cañerías · Desde $25.000", "Instalación de calefont · A cotizar", "Visita de diagnóstico · $15.000"), paquetes (Básico, Estándar, Premium), cobertura ("La Cisterna, San Miguel, El Bosque y 4 más"), horario, portafolio (galería) y reseñas. CTAs "Solicitar cotización" (primary) y "Reservar" si es de precio fijo.
- SRV-01 Solicitar servicio (asistente): 1 Describe lo que necesitas (texto + hasta 5 fotos) · 2 Comuna, fecha preferida y urgencia (Hoy · Esta semana · Sin apuro) · 3 Revisar y enviar. La dirección exacta NO se pide aquí.
- SRV-02 Solicitud y cotizaciones: estado (Solicitado → Cotizado → Aceptado → Realizado → Cerrado) y tarjeta de cotización estructurada dentro del chat ("$85.000 · Cambio de llave de paso y flexible · jue 17 jun · 10:00 · Válida hasta el dom 20 jun", con "Aceptar" / "Rechazar").

LOTE 2 · Visita, pago y prestador
- RES-03 Detalle de la visita: dirección exacta y teléfono visibles recién con la reserva confirmada; "Compartir mi visita con alguien de confianza"; "Llegué" y "Terminé" (ambas partes); botón "Ayuda · 133 · 131".
- Pago en la app: resumen con el monto y, si se cobra al cliente, el cargo de servicio de Talently como línea separada; "Pagar con Mercado Pago"; estados Pendiente de pago, Pagado, Reembolsado.
- REV-01 Reseña mutua cuando ambos confirman "Servicio realizado".
- PUBL-06 Publicar servicio (prestador): servicio, forma de precio, paquetes, fotos, vista previa.
- Variante F1 (pre-registro): tarjeta en Inicio "Tu perfil de servicios se publicará en junio".

Después: lote de modo oscuro y lote de estados: prestador sin credencial SEC ("Te falta tu licencia SEC para ofrecer instalación de gas. Puedes ofrecerte como ayudante"), sin prestadores en la comuna, cotización vencida, disputa abierta.
~~~

### Módulo 11 · Backoffice web

~~~text
Usa el PROMPT MAESTRO de Talently. Diseña el backoffice del equipo de Talently (admin.talently.app), que en F1 es crítico porque toda la verificación es manual. Es una app web de escritorio: frames de 1280×800, con la MISMA librería de componentes (tokens, Button, ListItem, Badge, Dialog, etc.) y navegación lateral con las 5 secciones. Solo lo usa el personal con rol de verificador, moderador o administrador.

LOTE 1
- ADM-01 Cola de verificaciones: tabla priorizada por inicio del turno y por riesgo, con SLA visible ("Vence en 6 h hábiles"). Detalle: visor del documento, datos declarados (número, vencimiento), checklist ("Folio validado en el Registro Civil", "Número contrastado en el registro público") y acciones Aprobar · Rechazar con motivo · Pedir otro documento. Aviso: "El archivo se borra 30 días después de revisado".
- ADM-02 Organizaciones: lista con RUT, giro, estado de verificación y primera publicación; detalle con acciones Verificar · Rechazar con motivo.
- ADM-03 Publicaciones en revisión: texto con las señales de moderación resaltadas ("buena presencia", "depósito", teléfonos o enlaces), y Aprobar · Rechazar con motivo para el autor.
- ADM-04 Reportes: lista por gravedad; "Menor en riesgo" y "Agresión" arriba con SLA de 4 h; acciones Suspender preventivamente · Descartar · Escalar.
- ADM-05 Usuario y auditoría: ficha del usuario (perfiles, verificaciones, reportes) y registro de auditoría de cada acción del personal.

Después: lote de modo oscuro y lote de estados (cola vacía, error al cargar el documento).
~~~

### Módulo 12 · Prototipo navegable

~~~text
Usa el PROMPT MAESTRO de Talently. Conecta en un prototipo navegable las pantallas ya aprobadas en M1 a M11, sin rediseñarlas. Si para un flujo falta una pantalla, avísame en vez de inventarla. Entrega un prototipo F1 y uno F2.

Flujos que deben poder recorrerse con clics:
1. Onboarding de Jorge (guardia): AUTH-01 → AUTH-02 → AUTH-03 → ONB-01 → ONB-03 → ONB-T1 a T5 → ONB-99 → INI-01.
2. Matías toma un turno: INI-01 → EXP-02 → DET-01 (turno) → AUTH-08 → Snackbar → ACT-02 → TUR-01 (confirmado) → REV-01.
3. Pedro postula a un empleo y hace match: EXP-01 (deck) → DET-01 (empleo) → DET-02 → DET-03 → MSG-02 → PRC-01.
4. Rosa publica un turno y confirma cupos: INI-02 → PUBL-01 → PUBL-03 (pasos 1 a 4) → PUBL-07 → GES-01 → GES-04.
5. Carolina publica su aviso del hogar: INI-01 (hogar) → PUBL-04 (pasos 1 a 4) → VER-02 → PUBL-07 → GES-02 → PRC-01 → checklist legal.
6. (F2) Carolina reserva una clase para Tomás: EXP-03 → DET-01 (clase) → RES-01 → RES-02 → RES-03.
7. Cambio de actor: Rosa abre SHT-ACTOR, pasa a su persona y vuelve a Banquetería Rosa SpA; una notificación de otro actor cambia de actor sola.
8. Perfil y configuración: PRF-01 → IconGear → CFG-01 → "Cerrar sesión" (Dialog).
9. Botón atrás: desde DET-01 abierto en EXP-02, el atrás vuelve a EXP-02 en el mismo scroll; desde Mensajes va a Inicio; en Inicio muestra el toast de salida.

Entrega también un índice con cada flujo y su pantalla de inicio.
~~~

---

## C) Checklist de revisión de consistencia

Revisa cada lote de Claude Design con esta lista. Un solo «no» basta para pedir corrección.

**Marca y color**
- [ ] El primario es morado #6D4AFF en todas las pantallas. No aparece el azul #1392EC.
- [ ] El gradiente de marca está solo en el logo, en el hero de Bienvenida y en la franja del modal de match. Ningún botón ni texto va sobre él.
- [ ] El logo es la T oficial copiada de la sección 10 (BrandLogo). No hay maletines, rayos ni letras sueltas en su lugar, y la T no cambia de forma entre sesiones.
- [ ] Hay un solo rojo (danger) y los límites alcanzados usan warning o neutro.
- [ ] Los bordes de selección (OptionCard, Chip) usan --color-primary-text y se distinguen en oscuro.
- [ ] Cada pantalla viene en claro y oscuro, y en oscuro no hay blancos fijos, íconos invisibles ni bandas blancas.

**Componentes**
- [ ] Un solo botón primario: sólido, radio 12, peso 600, alturas 52, 44 o 36. No hay variante «danger ghost».
- [ ] Un solo BackButton (40 visual, 48 táctil, flecha oficial) y un solo AppBar por pantalla.
- [ ] Los títulos de pestaña son 24/700 a la izquierda y los de pantalla apilada 18/600 centrados.
- [ ] Las tarjetas seleccionables usan un único indicador (círculo de 22 a la derecha).
- [ ] Hay un solo Switch (48×28, thumb blanco) y se ve apagado en modo oscuro.
- [ ] Chips, badges, hojas inferiores y toasts salen todos de la librería.
- [ ] El avatar de persona es redondo y el de organización (incluido «Familia en …») cuadrado, en todas las vistas.
- [ ] «Me interesa» / «No me interesa» es el mismo ActionPair en el deck, en el detalle y en Personas sugeridas (donde «Me interesa» invita a postular).
- [ ] La PublicationCard tiene la misma estructura en los 4 tipos.
- [ ] Amount usa un solo formato: monto + líquido o bruto (en sueldos y tarifas) + unidad.

**Íconos y tipografía**
- [ ] Los 13 íconos oficiales son los SVG de la sección 10, sin redibujar, y los nuevos son outline 24 px y trazo 1,8. No hay Material Symbols ni otro set.
- [ ] Ajustes usa la rueda (IconGear) y Filtros los sliders (IconFilter). La pestaña Explorar usa IconSearch.
- [ ] Solo Inter 400, 500, 600 o 700, y ningún texto mide menos de 11 px.
- [ ] Los tamaños de texto salen de la escala (incluida Label 13/18 para etiquetas de campo) y los espaciados y radios de la grilla de 4.

**Navegación**
- [ ] Las 5 pestañas son iguales para todos los perfiles: Inicio, Explorar, Actividad, Mensajes, Perfil.
- [ ] Filtros aparece solo en Explorar y el engranaje solo en Perfil. Cerrar sesión aparece solo en Configuración y, como única excepción, en el menú ⋯ del onboarding.
- [ ] El chip de actor solo aparece si la persona pertenece a una organización que no sea su hogar.
- [ ] Perfil no contiene ajustes y Configuración no contiene acciones de producto.
- [ ] Cada paso de un asistente es una pantalla con «Paso X de N», y N no cambia a mitad del flujo.
- [ ] Hay un diagrama del botón atrás y ninguna pantalla «vuelve al inicio» por error.
- [ ] Los turnos se ven en lista por fecha, nunca en deck.

**Fases**
- [ ] Cada frame tiene su etiqueta de fase y los frames F1 no muestran Clases ni Servicios (ni en el SegmentedControl, ni en la grilla del hogar, ni en los filtros de Mensajes), salvo el pre-registro «Reservas desde marzo» o «Reservas desde junio».
- [ ] Las fechas de ejemplo calzan con el «hoy» de su fase (F1: jue 10 dic 2026) y con sus grupos «Hoy», «Mañana», «Este fin de semana» y «Más adelante».

**Contenido**
- [ ] Todo está en español de Chile: sin LIKE/NOPE, email, seniority, Tech Stack, Dashboard ni «¡Aplicado!».
- [ ] Las etiquetas de catálogo y de estado son las del diccionario de la sección 7.3, idénticas en todas las pantallas.
- [ ] La mayúscula va solo en la primera palabra, no hay emojis en títulos y se usa el carácter «…».
- [ ] Los montos van en CLP con punto de miles y unidad («$35.000 líquidos por turno»).
- [ ] Las fechas relativas usan un solo formato («hace 5 min», «ayer», «12 dic»).
- [ ] Solo los campos opcionales se marcan, con «(opcional)», y no hay asteriscos.
- [ ] Ningún formulario de guardia, garzón, asesora, mecánico u operario pregunta por tecnologías, etapa de inversión ni B2B.
- [ ] No se muestra la edad y los formularios no piden sexo, nacionalidad ni apariencia.
- [ ] Los datos de ejemplo son chilenos, realistas y los mismos en todos los módulos (personas, comunas, montos, RUT válido 76.123.456-0).
- [ ] Los oficios que pidió el dueño aparecen en algún mockup: profesor, técnico, operario, guardia, banquetero o garzón, mecánico, asesora del hogar y clases particulares.

**Honestidad, confianza y estados**
- [ ] No hay métricas inventadas, «Perfil al 100 %», punto «en línea» ni «Verificado» sin respaldo.
- [ ] Cada pantalla trae sus estados: cargando (Skeleton), vacío con CTA útil, error con «Reintentar», sin conexión, y éxito o error de cada acción.
- [ ] Ningún botón visible queda sin acción, y lo que no está lanzado no se muestra (o se muestra como «Reservas desde…»).
- [ ] Las credenciales obligatorias se explican con su consecuencia («Sin credencial SPD no podrás ser confirmado»).
- [ ] El teléfono se pide al tocar «Tomar turno», al publicar por primera vez o en la primera reserva; nunca en el onboarding.
- [ ] En el hogar: el aviso con niños exige inhabilidades, la dirección se oculta hasta confirmar y la trabajadora tiene «Compartir mi visita», «Llegué», «Terminé» y «Ayuda · 133 · 131».

**Plataforma y accesibilidad**
- [ ] El frame es Android 390×844 con status bar y barra de gestos, y funciona también a 360 y 412 de ancho sin scroll horizontal.
- [ ] Las áreas táctiles miden 48×48 o más y el foco es visible.
- [ ] El contraste es AA en claro y oscuro (texto 4,5:1, controles 3:1).
- [ ] El layout no se rompe con la letra del sistema al 200 %.
- [ ] Cada frame lleva su ID canónico, su fase y la lista de «Decisiones tomadas».

**Problemas reportados por el dueño (cada uno debe quedar resuelto)**

| Problema reportado | Regla que lo corrige | Dónde se verifica |
|---|---|---|
| Inconsistencia visual entre vistas y botones | Librería única de M1; las pantallas solo componen componentes de la librería | Tabla «componente → dónde se usa» de M1 y cualquier lote |
| Perfil de empresa mezclado con Configuración | Perfil = «Así te ven» y edición; Configuración solo ajustes de cuenta | PRF-02 frente a CFG-01 (M8) |
| Toggles poco modernos | Un solo Switch 48×28 con thumb blanco, en vez de los 3 toggles actuales | CFG-03, CFG-05 y PRF-05 (M8), ONB-T2 (M3) |
| El botón atrás de Android volvía al inicio | Back a la pantalla de origen con su scroll; orden de 6 pasos del botón atrás | Diagrama de M2 y flujo 9 de M12 |
| Selección candidato/empresa duplicada | El tipo de cuenta no existe: la intención se elige una sola vez en ONB-01; AUTH-01 y AUTH-02 no preguntan tipo | AUTH-01, AUTH-02 y ONB-01 (M3) |
| Tamaño de equipo preguntado dos veces | El tramo de trabajadores se pide solo en ONB-O2 | ONB-O1 a O4 (M3) y PRF-02 (M8) |
| LinkedIn preguntado dos veces | LinkedIn no se pide en el onboarding; se agrega una sola vez en el Perfil de la organización | ONB-O1 a O4 (M3) y PRF-02 (M8) |
| Stack tecnológico preguntado a empresas no TI | Las tecnologías solo aparecen si el oficio o el rubro es de tecnología | ONB-O1 a O4 (M3), PUBL-02 de guardia y de profesor (M7) |
| Ofertas con campos que no aplican al área | DynamicFields según el oficio elegido | PUBL-02 paso 3 de profesor frente a guardia (M7) y DET-01 (M5) |
| Textos en inglés y español mezclados | Glosario y diccionario de etiquetas en español de Chile | Todas las pantallas; especialmente Badges y filtros |
