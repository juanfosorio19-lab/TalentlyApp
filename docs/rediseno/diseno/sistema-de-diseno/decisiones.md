# Decisiones tomadas

Lo que el prompt maestro no definía y se resolvió aquí. Cada módulo siguiente las respeta.

## M1 · L1 · Tokens

1. **Nombres.** Los tokens de color, sombra y gradiente conservan los nombres del maestro (`--color-bg`, `--elev-2`, `--focus-ring`, `--gradient-brand`). Espaciado `space-N` con N = valor ÷ 4 (`space-4` = 16). Capas `z-sticky` … `z-toast`. Duraciones `duration-fast`, `duration-base`, `duration-slow`.
2. **Estilos de texto.** `display`, `h1`, `h2`, `h3`, `body-l`, `body`, `label`, `caption`, `overline`, `tab-label`, más `button-lg` (16/24 600) y `button-md` (14/20 600) para las etiquetas de Button que el maestro define en 4.2.
3. **Foco.** El halo `--focus-ring` mide 1,67:1 en claro y 2,35:1 en oscuro y no cumple 3:1 solo. Todo foco = contorno sólido de 2 px en `color-primary-text` a 3 px del control + el halo (clase `tl-focus`). En campos, el «borde primario» del foco es `color-primary-text`, porque #6D4AFF sobre `color-surface-3` oscuro da 2,88:1.
4. **Campos dentro de hojas en oscuro.** `color-border-strong` sobre `color-surface-3` da 2,85:1. Todo campo conserva su relleno `color-surface`, contra el que su borde mide 3,49:1.
5. **Sombras en oscuro.** `elev-1` .40, `elev-2` .50 y `elev-3` .60 en negro. `elev-brand` conserva el morado al 28 % en ambos temas: es el único brillo de marca y el maestro no lo listó entre las sombras negras.
6. **Advertencia.** `color-warning` es solo relleno (con `color-on-warning`). Como ícono o texto sobre superficie clara da 2,04:1: va siempre `color-warning-text`.
7. **`color-primary-hover`** se conserva como token, pero no se usa: la app es táctil y no se diseña hover.
8. **`color-text-3`** cumple justo en su peor fondo (4,55:1 sobre `color-surface-2` en claro): nunca bajo 12 px.
9. **Inter como archivo.** Se sirven los cuatro pesos (subset latino, licencia OFL). Incluye tildes, ñ, ¡ ¿, « », «…» y «·»; no incluye flechas ni checks, que se dibujan siempre como íconos del set.
10. **Overline en mayúsculas** lo aplica `bundle.css`: un estilo de texto en tokens no puede llevar `text-transform`.
11. **Reducir movimiento.** Con `prefers-reduced-motion`, `bundle.css` lleva transiciones y animaciones a 0 ms.
12. **Layout como tokens.** Los valores de 4.8 quedan como `layout-*` (frame, status bar, gestos, AppBar, TabBar, contenido máximo y área táctil de 48).
13. **Hex.** El sistema guarda los colores en minúsculas; las tarjetas los muestran en mayúsculas, como en el maestro.

## M1 · L2 · Marca e íconos

1. **Logo sobre gradiente.** En el hero de Bienvenida solo va BrandLogo con tile. La variante sin tile desaparece sobre `gradient-brand` y queda en 2,47:1 sobre `gradient-hero-dark`.
2. **Logo inline.** Los dos SVG oficiales se insertan tal cual dentro de `.tl-logo` (también quedan como assets). Varias copias en una misma pantalla comparten sus id de gradiente sin problema, porque todas son la misma definición.
3. **IconCloseCircle.** La variante con círculo de la sección 10.3 queda como ícono propio, para no armarla a mano en cada uso.
4. **Íconos agregados** que el maestro no listaba y que necesitan módulos siguientes: IconChevronDown (Select y SheetPicker), IconSend e IconAttach (Composer).
5. **Nombres.** Íconos de interfaz `Icon…` en inglés por función; oficios `IconJob…` y categorías de clase `IconClass…`.
6. **Turno = IconClock.** Los 4 tipos de publicación se distinguen por ícono: Empleo IconOffers, Turno IconClock, Servicio IconTool, Clase IconBook. Turno no usa IconCalendar para no confundirse con la pestaña Actividad.
7. **Teléfono = celular.** IconPhone es un teléfono móvil, porque se usa para el número y el OTP.
8. **Impulso = flecha de tendencia.** IconBoost es una flecha que sube en zigzag; no se parece al escudo ni al check de la verificación.
9. **Categorías sin duplicados.** Hogar y cuidados = mano con corazón (la casa es Inicio); Seguridad = radio de guardia (el escudo es verificación); Profesionales = corbata (el maletín es Empleo); Agro y minería = pala; Gastronomía y eventos = campana de servir; Construcción = casco con nervio central, para distinguirlo de la campana.
10. **Clase Tecnología** reutiliza IconJobTech: mismo concepto, mismo ícono. Clase Oficios = martillo, para no confundirse con IconTool (tipo Servicio).
11. **Tamaños de ícono.** 24 px por defecto; 20 px en Banner (`tl-icon--20`) y 16 px en el check del Chip (`tl-icon--16`), con el mismo trazo escalado.
12. **Vista de assets.** Los íconos usan `currentColor`, así que la vista de assets del sistema los muestra en negro; en la app siempre van inline.

## M1 · L3 · Controles

1. **Estados forzables.** En los mockups, los estados se fuerzan con `is-pressed`, `is-focus`, `is-selected`, `is-disabled`, `is-error` e `is-loading`; en la app salen de `:active`, `:focus-visible`, `disabled` y `aria-*`. Cada estado que no existe para un control se declara «No aplica» con su motivo.
2. **Presionado.** Capa del color del contenido al 12 % (8 % en Select y filas de lista). El Button primary usa `color-primary-pressed`. El danger presionado se aclara y mantiene 4,82:1 con blanco.
3. **Deshabilitado único.** `color-surface-2` + `color-text-disabled` en todas las variantes, también ghost y outline (sin borde). La etiqueta de un campo deshabilitado queda en `color-text-2` y la ayuda explica el porqué; en filas de Checkbox, Radio y Switch el texto va en `color-text-disabled`, pero la descripción sigue en `color-text-2`.
4. **Medidas que el maestro no fijaba.** Padding lateral md 16 y sm 12. Ícono de 20 en botones lg y md, 16 en sm. Spinner de 24 en lg y md, 16 en sm.
5. **Selección con anillo `color-primary-text`.** Checkbox marcado = relleno `color-primary` + anillo `color-primary-text`; Radio = anillo y punto `color-primary-text`; Switch encendido = riel `color-primary` + anillo interior `color-primary-text`. Motivo: #6D4AFF sobre `color-surface-3` oscuro da 2,88:1.
6. **Checkbox con `radius-xs` (4).** El token pasa a cubrir también la esquina de la casilla.
7. **Relleno `color-surface` siempre.** Campos, Checkbox y Radio conservan su relleno dentro de hojas, para que su borde mida 3,49:1 contra él.
8. **Chip input.** Fondo `color-surface-2` y X (`IconClose`, `color-text-2`) en un botón de 28 con área táctil de 44: el maestro pide X; el basurero queda para quitar ítems de lista.
9. **Chip suggestion.** Mismo borde que filter y `IconAdd` en `color-primary-text`.
10. **SheetPicker.** Lista con Radio a la derecha; en elección única, elegir cierra la hoja. Buscador fijo que resalta la coincidencia en negrita. Se cierra con X, velo, asa o atrás. El asa va en `color-text-3` (`color-border-strong` da 2,85:1 sobre `color-surface-3` oscuro).
11. **Adelantados.** BottomSheet base y Spinner se crean en este lote porque SheetPicker y Button los usan; se documentan en los Lotes 4 y 5.
12. **Badge.** «Nuevo» va en primary. «En revisión» queda en info, como dice el diccionario; el tono neutral se muestra con «Visto». Los estados de solicitud de servicio, que el maestro no tonifica, quedan así: Solicitado info · Cotizado y Aceptado primary · Reservado y Realizado success · Cerrado y Cancelado neutral · En disputa warning.
13. **MoneyField.** La unidad es un botón dentro del campo que abre un SheetPicker; el separador de miles se pone mientras se escribe.
14. **SearchField sin borde.** Lo identifican la lupa y el placeholder; el foco suma un borde interior `color-primary-text` y el halo.
15. **Textos fijados.** «Ingresa un RUT válido», «Validando RUT…», «Escribe al menos 20 caracteres», «Ingresa el sueldo líquido», «Elige una comuna», «Elige al menos 1 oficio», «Máximo 3 oficios. Quita uno para elegir otro.», «Para continuar, acepta los Términos y la Política de privacidad», «Elige cuándo puedes empezar».

## M1 · L4 · Estructura

1. **AppBar en reposo sobre `color-bg`.** Así se funde con la pantalla; al hacer scroll gana `color-surface` + `elev-2`. Incluye la status bar simulada (24 px, «13:00»), que solo existe en mockups.
2. **Selector de actor.** Chip de 40 con borde `color-border-strong`, Avatar de 32 (redondo persona, cuadrado organización), nombre corto con «…» y `IconChevronDown`. Abre la hoja «Usar Talently como», donde el hogar no aparece. Va a la derecha del título, antes de la campana.
3. **AppBar transparente.** Sin título hasta el scroll, luego pasa a standard. El círculo de los íconos es `color-surface` al 90 % (`color-mix`); la status bar sobre una foto lleva el mismo velo. Una foto real nunca es de stock: en el mockup es un recuadro rotulado.
4. **Badge de no leídos en `color-primary`**, no en rojo: el rojo queda para errores. Máximo «99+», con anillo `color-surface`.
5. **Segmento activo en `color-surface-3`.** En claro es igual a `color-surface`, como pide el maestro; en oscuro es la superficie más alta y el segmento se ve elevado (con `color-surface` se vería hundido).
6. **OptionCard.** Borde en reposo `color-border` (el círculo indicador en `color-border-strong` marca el control). Elegida: título y ejemplo en `color-on-primary-subtle` y tile en `color-surface`. El círculo relleno lleva el anillo `color-primary-text` de los controles marcados.
7. **SectionCard.** El lápiz es el IconButton único (40 visual, 48 táctil), no uno de 44, para no crear un segundo tamaño.
8. **ListItem.** Dentro de una lista, el foco es un borde interior de 2 px `color-primary-text`, porque la lista recorta el halo. Variante «quitar» con basurero en `color-text-2`.
9. **Avatar de organización de 32** con `radius-sm`: con `radius-md` (12) se leería casi redondo. Tamaños de iniciales: 12, 14, 20 y 32. El escudo de verificación va en `color-success-text` sobre un círculo `color-surface`.
10. **Snackbar** en `color-surface-3` con borde e `elev-3`, más el ícono del tono. Una barra invertida obligaría a un color de acción que no existe en los tokens claros. Duración: 4 s sin acción, 8 s con acción.
11. **Dialog.** La acción que no destruye va en ghost y recibe el foco al abrir; la destructiva va en danger y la no destructiva en primary.
12. **BottomSheet de filtros.** El filtro se aplica solo con el botón del pie, que dice el resultado («Ver 12 turnos»); cerrar sin aplicar no pierde la selección.
13. **«4x4».** Inter muestra «4x4» como «4×4» (alternativa contextual); el texto guardado sigue siendo «4x4».
14. **Anchos.** AppBar (Perfil con selector, campana y Ajustes), AppBar standard con título largo, SearchField, SegmentedControl F2 y TabBar con badge, verificados a 360, 390 y 412 sin scroll horizontal.

## M1 · L5 · Estados y componentes de dominio

1. **EmptyState y ErrorState** usan un círculo de 72 con un ícono de 40, el mismo tamaño que ResultScreen. ErrorState es la variante danger con «Reintentar» en primary.
2. **Skeleton** en `color-border` con brillo `color-surface-2` (1,4 s, quieto con «reducir movimiento»). Con `color-surface-2` solo, no se vería sobre una tarjeta blanca.
3. **Banner.** Ícono `IconInfo` en info y éxito, `IconAlert` en warning y danger, como pide el maestro («ícono info o alerta»). «Sin conexión…» va en warning, con «Reintentar».
4. **Burbujas.** Texto en 16 para leer bien; la hora y el estado van debajo de la burbuja en Caption, no dentro, para no poner texto de 12 sobre morado. «No se envió» suma un borde `color-danger-text`.
5. **Composer.** «Enviar» en `color-primary` (IconButton con relleno de marca); deshabilitado con el campo vacío.
6. **CodeInput.** Casillas de 48 × 56; 6 casillas con 5 espacios de 8 miden 328, justo el ancho útil a 360. Se verifica solo al completar, sin botón.
7. **Barras de progreso en `color-primary-text`** (ProgressStepper, subida de archivos). #6D4AFF sobre el riel oscuro da 2,6:1; `color-primary-text` da 5,1:1. ReliabilityMeter usa `color-success-text` por la misma razón.
8. **AvailabilityGrid con días en filas y franjas en columnas.** Con 7 columnas de 48 no cabe en 360; así las celdas mantienen 48 de alto.
9. **SlotPicker.** Días de 56 × 72 con scroll horizontal; los días sin horas libres se ven deshabilitados y no se ocultan, para que la tira siga siendo de 14 días seguidos.
10. **CalendarWeek.** Semana = tira de 7 días con un punto en los días con algo + agenda en lista. Día = horas de 48 px con bloques. Una grilla de 7 columnas con horas sería ilegible a 390.
11. **VerificationBadge.** Ícono por estado: sin verificar `IconInfo`, en revisión `IconClock`, verificado `IconShield` (el único que usa el escudo), vencido `IconAlert`. La hoja que abre nunca muestra RUT, fecha de nacimiento ni fotos de la cédula.
12. **RatingStars.** Estrella en `color-warning-text` (ámbar), por convención; no significa advertencia. Para calificar se usan IconButtons de 44 y el texto «4 de 5 · Muy bien», para no depender solo del color.
13. **ReliabilityMeter** = turnos asistidos ÷ turnos confirmados, con la cantidad al lado. Se muestra desde 3 turnos; antes: «Aún sin turnos suficientes».
14. **ActionPair.** Íconos de 32 dentro de los círculos (con 24, la X de IconClose se vería de 6 px). Las etiquetas quedan alineadas porque el círculo de 56 lleva 4 px de margen.
15. **Menú ⋯ del asistente** = BottomSheet con ListItems («Guardar y salir», «Ayuda», «Cerrar sesión»), para no crear un menú desplegable nuevo.
16. **MediaUploader.** Documentos con «Tomar foto» y «Elegir archivo» (pueden ser PDF). En la galería, tocar una foto abre una hoja con Ver, Cambiar y Quitar, en vez de poner un botón pequeño sobre cada miniatura.

## M1 · L6 · PublicationCard por tipo

1. **Una estructura con orden fijo**: cabecera · título · InfoTag · Amount · dato del tipo · lugar · «Por qué ves esto» · CTA. Si un tipo no tiene un dato, esa parte no aparece; nada cambia de lugar.
2. **Completa y compacta.** Completa en las listas principales de Explorar (EXP-02, EXP-03, EXP-04) y en la vista previa al publicar. Compacta en listas secundarias: INI-01, EXP-01 en vista lista (como pide M5), EXP-07, PRF-02 y PRF-11. La compacta conserva la cabecera con sus insignias (la confianza no se recorta), muestra hasta 2 InfoTag y no lleva «Por qué ves esto» ni CTA.
3. **CTA tonal md a lo ancho.** No primary, porque una lista tendría varios primarios; no sm al lado del monto, porque a 360 el monto se corta en dos líneas. M6 pedía «CTA sm»: queda anotado para confirmar.
4. **Empleo sin CTA.** Se postula desde DET-01 con el ActionPair y DET-02. Un «Postular» en la lista sería una segunda vía que se salta las preguntas filtro.
5. **Toda la tarjeta abre DET-01** con el enlace del título estirado. La VerificationBadge y el CTA se tocan aparte; orden de foco: insignia, título, CTA.
6. **InfoTag, componente nuevo.** Los «chips de info» no podían ser Chip (se toca) ni Badge (es un estado). Un ícono por tipo de dato: jornada IconClock, contrato IconDocument, fecha u horario IconCalendar, modalidad IconLocation (también «Online»), clase de prueba IconBook. Actualicé esos usos en `icons.json` y en la hoja de íconos.
7. **«Turno de noche» va con IconCalendar** (cuándo) y no con IconClock (jornada), para no repetir el reloj en la misma tarjeta.
8. **Cupos.** Texto con 3 o más; Badge warning con 2 o menos (M6); sin cupos, Badge neutral «Cupos completos» y CTA «Unirme a la lista de espera». Un turno lleno no se deshabilita.
9. **Clase sin línea de lugar**: la modalidad ya dice dónde, y el ejemplo no trae comuna ni distancia. **Servicio sin InfoTag**: el ejemplo no trae jornada ni fecha.
10. **«SEC gas», «Titulada» y «Apta para trabajar con menores» son VerificationBadge verificadas**: Talently revisó el documento. Si no caben en una línea, bajan a una segunda.
11. **Premium.** «Destacado» va en la primera fila de la cabecera, a la derecha, y la VerificationBadge en la segunda, así nunca quedan pegadas. Si el nombre no cabe junto a «Destacado» (a 360, «Seguridad Andes Ltda.» y «Banquetería Rosa SpA»), se corta con … en vez de bajar de línea. Alto medido igual en Clásica y Premium a 360, 390 y 412.
12. **Sin «Destacado» en F1 y F2**: Premium no se puede comprar hasta F3, así que ninguna tarjeta de esas fases lo lleva.
13. **Deck.** `color-surface-3` con `elev-3` y sin borde, como hojas y diálogos; avatar 56; título H3 (el maestro lo define como título de tarjeta principal); bloque «Requisitos» con el estado para la persona; la siguiente tarjeta asoma 12 px.
14. **Arrastre.** Sellos «Me interesa» (`color-primary-subtle`, borde `color-primary-text`) y «No me interesa» (`color-surface-2`, borde `color-border-strong`) sobre el borde superior, giro de 4° y vuelta con `ease-spring`; el botón del mismo lado del ActionPair se ve presionado. Deck queda como componente propio para Personas sugeridas (GES-03, EXP-05), así no se crea otro después.
15. **Tabla de uso a todo el ancho y en un solo panel**: es documentación, no un componente. Va con un índice de IDs aparte (ScreenIndex). La disponibilidad de profesores y prestadores (ONB-K4, ONB-S4, ACT-04) usa AvailabilityGrid; si hace falta una hora exacta dentro de una franja, se elige en una BottomSheet con Select, sin componente nuevo.
16. **Correcciones a lotes anteriores.**
    - EmptyState (L5): quité el ejemplo «Actividad · Guardados». Guardar publicaciones no existe en el maestro; lo reemplacé por la Agenda vacía de M4.
    - Skeleton de tarjeta (L5): las píldoras pasan a `tl-skel--tag` (radio sm), con la forma de InfoTag.
    - Card (L4): la fecha del turno usa IconCalendar e íconos de 16, como en PublicationCard.
    - README de ActionPair: el ícono es de 32, no de 28.

## M2 · Cambios a la librería

1. **IconButton con contador** (`tl-iconbtn__badge`). M2 pide la campana con badge y Filtros con contador, y la librería solo tenía el contador de la TabBar. Es el mismo: 18 de alto, `color-primary` con número `color-on-primary` (5,15:1) y un aro del color del fondo (`color-bg`; `color-surface` con el AppBar en scroll). Solo con un número real; desde 10, «9+». El `aria-label` lo lee: «Notificaciones, 2 sin leer», «Filtros, 2 activos».
2. **Punto de no leído** (`tl-unread`). NOT-01 y «Usar Talently como» piden un punto de no leído y la librería no tenía uno. Círculo de 10 en `color-primary-text` (6,4:1 en claro y 5,5:1 sobre `color-surface-3` en oscuro), al final de la fila y siempre con el texto oculto «Sin leer». Solo con algo realmente sin leer.
3. **Tonos de dos avisos, alineados con los módulos.** «Sin conexión. Mostramos lo último que cargaste» pasa a Banner info, como pide M2 (en L5 lo había dejado en warning). «Por tu seguridad, mantén la conversación en Talently» pasa a warning, como pide M5 (aparece al escribir un teléfono o un enlace). Cambian las tarjetas Banner y MessageBubble.
4. **Snackbar en pantallas sin TabBar** (`tl-snackbar--no-tabbar`). El Snackbar se ubicaba siempre sobre la TabBar; en una pantalla apilada sin TabBar ni CTA fijo (NOT-01 al marcar todas como leídas) quedaba flotando a 96 px del borde. El modificador lo baja a 8 px sobre la barra de gestos. Mismo componente, mismos tonos y duración.
5. **AppBar a 360: cede primero el selector de actor.** En la revisión de anchos, «Hola, Rosa» se cortaba en «Hola, R…» a 360, porque el selector con «Banquetería Rosa SpA» no cedía espacio. Ahora, bajo 375 px de ancho, el selector tiene un máximo de 144 px en vez de 168 (sigue con «…»), y el saludo cabe entero. A 390 y 412 no cambia nada. El AppBar mide su propio ancho (`container-type: inline-size`), así la regla funciona igual en la app, en el lienzo y en la librería.

## M3 · Cambios a la librería

1. **PasswordField, componente nuevo.** AUTH-02 y AUTH-06 piden una contraseña con ojo y checklist en vivo, y la librería no tenía uno. Es un TextField con un IconButton ojo dentro (activo en tonal, con `aria-pressed`, un solo ícono) y las 3 reglas siempre en el mismo orden: pendiente en `color-text-2` con un círculo, cumplida en `color-success-text` con check, y la que falta al enviar en `color-danger-text` con alerta. En AUTH-04 va sin reglas.
2. **Enlace en texto (`tl-link`).** Hacía falta para «Términos» y «Política de privacidad» dentro del Checkbox y para «Iniciar sesión» dentro del error de correo. `color-primary-text` 600 subrayado; dentro de un error toma el color del error.
3. **Botón con el logo de otro servicio y separador «o».** «Continuar con Google» es un Button outline lg con un espacio de 20 px para el logo oficial, que se usa tal como lo entrega Google: en los mockups queda un recuadro rotulado, sin redibujarlo. Deshabilitado, el logo pasa a gris. El separador «o» va solo entre ese botón y el formulario.
4. **StepLayout también para el acceso.** AUTH-02 a AUTH-06 usan la misma plantilla sin barra de progreso ni menú ⋯, con el título en el H1. Contenido y CTA quedan en 480 como máximo y centrados, como pide el maestro.
5. **CategoryGrid, componente nuevo.** SHT-OFICIO pide, sin texto escrito, la grilla de las 16 categorías con su ícono. Ni OptionCard (elige, no navega) ni una lista de 16 filas servían: son 3 columnas de tarjetas de 96 con el ícono en tile de 40 y el nombre en 13/600. Tocar una abre sus oficios en la misma hoja; la que ya tiene oficios elegidos se marca y dice cuántos.
6. **TextField válido (`is-valid`).** El RUT de ONB-O1 se valida mientras se escribe y la librería solo sabía mostrar el error. Válido suma un check de 20 en `color-success-text` al final del control y deja la ayuda en success («RUT válido»). Se usa solo en datos con validación en vivo, nunca en texto libre.
7. **MediaUploader: logo de organización.** ONB-O3 pide un uploader cuadrado. Es el mismo control del avatar con `radius-md`, como todo lo de una organización; sin logo muestra el Avatar de organización con iniciales («BR»), que es justo lo que verán los demás.
8. **CategoryGrid como selector de rubro.** En la hoja «Rubro» de ONB-O1, tocar una categoría la elige y cierra la hoja; la elegida queda marcada, sin contador.
9. **StepLayout en el onboarding: menú ⋯ y salida.** El M3 pide «Eliminar cuenta» en el menú ⋯ del registro y un diálogo propio al salir: «¿Salir del registro? Guardaremos lo que llevas» con «Seguir» / «Guardar y salir». En el registro nada se descarta (se guarda lo que lleva); «¿Descartar cambios?» queda para los asistentes de publicación.
10. **Snackbar sobre un CTA fijo.** En un paso del onboarding y en una hoja con pie, el Snackbar («No pudimos guardar este paso · Reintentar», «Gracias. Revisaremos…») va estático justo encima del botón, dentro de la barra del CTA o sobre el pie de la hoja, para no tapar nunca el CTA. Usa `tl-snackbar--static`, que ya existía.
11. **CategoryGrid cargando y sin resultados.** Mientras carga el catálogo, Skeleton de chips y una tarjeta Skeleton de 96 por categoría; sin resultados, EmptyState con «Sugerir este oficio».

## M4 · Cambios a la librería

1. **Ícono del tipo en la Agenda (CalendarWeek).** M4 pide que cada compromiso de la Agenda lleve su ícono. Cada `.tl-event` lleva, antes del título, el ícono de la publicación de donde viene: Turno IconClock, Entrevista de un empleo IconOffers, Clase IconBook (desde F2) y Visita de un servicio IconTool (desde F3). Va a 20 px en `color-text-2`; en la vista Día, a 16 px dentro del bloque (`.tl-dayview__title`). El mismo `.tl-event` muestra los compromisos en Inicio («Hoy en tu agenda», «Tus próximas clases»), así un turno se ve igual en Inicio y en la Agenda.
2. **Atajo al deck en Inicio.** «Empleos para ti» muestra la primera oferta del deck como PublicationCard compacta sobre la pila de `.tl-deck` (12 px de la siguiente). Tocarla abre EXP-01 con esa oferta arriba, no DET-01: es la única excepción a «toda la tarjeta abre DET-01», porque el módulo la pide como atajo al deck. En Inicio no va el ActionPair.
3. **OptionCard como atajo (`tl-option--link`).** La grilla «¿Qué necesitas?» del Inicio del hogar pide OptionCard, pero ahí tocar una tarjeta no elige: abre Publicar con esa necesidad ya puesta (aviso del hogar o turno para un evento) y, desde F2, «Clases» abre Explorar · Clases. Un círculo que nunca se rellena sería un control fantasma, así que el atajo es un enlace sin input ni círculo, con el mismo tile, título, borde, presionado y foco. No tiene seleccionado ni deshabilitado.
4. **ListItem con el estado bajo el texto.** En Postulaciones (ACT-02) los estados largos («En lista de espera», «No seleccionado») al final de la fila dejaban el título y la línea secundaria en tres líneas. En las listas de estados el Badge pasa dentro del cuerpo, bajo la línea secundaria, y al final queda solo el chevron. Se usa igual en Publicaciones (ACT-03), en «Postulaciones con novedades» y «Tu aviso» de Inicio y en las publicaciones del Perfil de la organización (PRF-02), para que el mismo dato se vea igual en todas partes.

## M5 · Cambios a la librería

1. **Deck: la siguiente oferta bajo la que se arrastra (`tl-deck__card--next`).** M5 pide mostrar la tarjeta arrastrándose a cada lado. Con solo la pila de 12 px, al moverla quedaba un hueco vacío. Ahora la siguiente oferta queda debajo, completa y quieta: sin sombra, al 96 % y 12 px más abajo, oculta para el lector de pantalla. Así se ve qué viene antes de soltar, y el deck de Pedro muestra sus tres ofertas en orden.
2. **MatchModal, componente nuevo.** DET-03 pide el aviso «¡Hicieron match!» y la librería solo tenía Dialog, que es para confirmar. Tarjeta `color-surface-3`, `radius-xl` y `elev-brand` sobre el velo, con una franja de 120 en `gradient-brand` que solo lleva los dos avatares de 96 (persona redonda, organización cuadrada, aro de 4 y 16 de solape): nada de texto sobre el gradiente. Debajo, `IconMatchHeart` de 40, «¡Hicieron match!» en Display, el texto en Body-L y los botones «Enviar mensaje» (primary lg) y «Seguir explorando» (ghost lg).
3. **NewMatches, componente nuevo.** MSG-01 pide «Nuevos matches (2)» solo con los matches sin mensajes. Tarjetas de 144 con Avatar de 56, nombre en dos líneas y el contexto en texto (ícono del tipo + «tipo · título · fecha»), en una fila que se desliza. Sin matches nuevos la sección no aparece.
4. **ListItem de conversación (`tl-listitem--chat`).** La fila de Mensajes de M2 estaba armada con estilos sueltos. Ahora es una variante: avatar arriba, nombre, ContextChip sin chevron, último mensaje en una línea («Tú:» si es propio), hora relativa y el número real de no leídos; con no leídos, nombre en 600 y mensaje en `color-text`. MSG-01 de Matías pasa a usarla, sin cambios visibles.
5. **AppBar de conversación (`tl-appbar--chat`).** MSG-02 pide avatar y nombre tocables que abren el perfil público. BackButton, Avatar de 40 (con el punto de verificación solo si es real), nombre 16/600 y «Organización verificada» en 12/500, y ⋯.
6. **ContextChip fijo bajo el AppBar (`tl-chat__context`)**, con `color-bg` y borde inferior. Antes cada pantalla lo ponía a su manera.
7. **Mensaje en cola (`tl-msg--queued`).** Sin conexión, la burbuja propia pasa a `color-primary-subtle` y la meta dice «Se enviará cuando vuelva la conexión» con `IconClock`. Así no se confunde con uno enviado.
8. **Aviso sobre el Composer (`tl-composer__notice`).** «Por tu seguridad, mantén la conversación en Talently» aparece como Banner warning sobre el Composer al escribir un teléfono o un enlace. Avisa y no bloquea. Ya no va fijo arriba de la conversación.
9. **Entrevista y Timeline alineados con M5.** La entrevista de Jorge es el mar 15 dic a las 10:00 en Av. Concha y Toro 1234, Puente Alto, en SystemCard, ListItem, ACT-02 y PRC-01. La misma SystemCard se usa en el chat y en PRC-01. En Timeline, los pasos pendientes van sin fecha.
10. **Certificado de antecedentes en SystemCard (MSG-02b).** Dos variantes nuevas: la fecha antigua en warning (`.tl-syscard__meta--warning`, «Emitido hace 45 días») y la tarjeta que ya no está disponible (`tl-syscard--off`: `color-surface-2` y `color-text-disabled` con «Ya no está disponible», sin acciones y sin bajar la opacidad). Cada tarjeta dice además hasta cuándo se puede ver («Disponible hasta el jue 17 dic»). Los íconos de las líneas quedan alineados con la primera línea cuando el texto ocupa dos.
11. **Menú ⋯ de la conversación y Reportar, en BottomSheet.** El menú usa ListItems con «Ver publicación», «Reportar» y «Bloquear» (danger, con su confirmación), igual que el menú del registro. SHT-REPORTE muestra Radio con los 7 motivos en el orden del módulo, un TextArea opcional y «Enviar reporte», que se habilita al elegir un motivo.
12. **Adjuntar y «Compartirlo es voluntario».** Para quien trabaja, la hoja de adjuntar suma primero «Compartir certificado de antecedentes». La otra parte nunca tiene esa opción ni un botón para pedirlo. Si la pide por texto, aparece sobre el Composer el Banner info «Compartirlo es voluntario.», en el mismo lugar que el aviso de seguridad.
13. **Snackbar en el chat.** Va sobre el Composer a la misma altura que sobre la TabBar, porque los dos miden lo mismo con la barra de gestos. No necesita una variante nueva.

## M6 · Cambios a la librería

1. **ShiftBlock, componente nuevo.** DET-01 Turno pide la fecha y el horario grandes y varios bloques si es una serie. Cada bloque lleva la fecha en un recuadro `color-primary-subtle` (día de la semana, número de 24/700 y mes), el horario en 20/700 y debajo la duración y los cupos con el mismo formato de la tarjeta. Una serie lleva un bloque por día y se postula a todos. El mismo bloque está en TUR-01 y en los pasos 2 y 4 de PUBL-03.
2. **Barra de cupos (`tl-cupos`).** GES-04 pide la cabecera con barra de progreso. Muestra «Confirmados 5/8» y una barra de 8 con `role="meter"`; completa pasa a `color-success-text`. Siempre con el número al lado.
3. **Tarjeta de turno con CTA sm.** M6 pide «Tomar turno» sm en la tarjeta. Pasa de tonal md a lo ancho a tonal sm a la derecha (`tl-pub__cta--end`). El matrimonio de Banquetería Rosa SpA es en una casona en Las Condes, así que el lugar de la tarjeta de referencia pasa a «a 21 km · Las Condes» (también en INI-01 y en la Agenda de Rosa).
4. **Chip con menú (`tl-chip--menu`).** EXP-02 pide chips de oficio y de comuna. La comuna no se filtra con sí o no: siempre tiene un valor y se cambia en SHT-COMUNA. Es el mismo chip con ícono de ubicación al inicio, el valor y un chevron, sin estado seleccionado.
5. **ListItem de persona (`tl-listitem--person`).** GES-04 y GES-05 piden nota, Confiabilidad y acciones por persona. La fila es un `div` con el nombre, el corazón de favorito (con su texto oculto) y la nota y la Confiabilidad abajo. La acción va al final («Confirmar», Button tonal sm) o bajo el texto («Asistió» / «No asistió» y «Evaluar»; «Invitar a un turno»). Así no hay botones dentro de un botón.
6. **Estrellas grandes (`tl-stars--lg`).** REV-01 pide estrellas grandes: botones de 56 con estrellas de 40, que caben a 360 de ancho.
7. **Confiabilidad con los turnos cumplidos.** M6 pide «Confiabilidad 96 % · 25 turnos cumplidos». Para que la cuenta cierre, la nota dice «asistió a 25 de 26 turnos confirmados» (antes decía 24 de 25). Solo la alimenta «Asistió» / «No asistió», que marca quien publica. Un turno cancelado por la organización no cuenta.
8. **Ejemplos alineados con M6.** En Timeline, el turno de Matías es el cóctel corporativo de hoy (postulado el 6 dic y confirmado el 8 dic). En Card, «tu próximo turno» es ese mismo cóctel en Providencia.

## M7 · Cambios a la librería

1. **OptionCard de plan (`tl-option--plan`).** PUBL-08 pide Clásica y Premium lado a lado con precio y lo que incluye. Es la OptionCard en grilla de 2 con dos piezas nuevas: `.tl-option__price` (Amount: «Gratis», «$14.990 por 30 días», «$9.990 por turno»; en F3 la Clásica dice «Gratis: 1 empleo activo y 3 turnos al mes») y `.tl-option__list` con viñetas, nunca con checks, para no sumar un segundo indicador de selección. La primera línea de Premium muestra el PromotedBadge que llevará la tarjeta. Seleccionada, el precio y la lista pasan a `color-on-primary-subtle`.
2. **Premium «Pronto» (F1 y F2).** Se ve deshabilitada (`is-disabled`, `color-surface-2`, título en `color-text-disabled`), pero con `aria-disabled` en vez de `disabled`: se puede tocar y muestra el Snackbar «Te avisaremos cuando puedas destacar tus publicaciones». Lo que incluye sigue en `color-text-2`, porque explica qué hará, y el Badge «Pronto» pasa a `color-surface` para no perderse sobre `color-surface-2`.
3. **ListItem de postulante.** GES-02 pide por persona oficio, años, comuna, pretensión, insignias, nota, estado y acciones rápidas. Es la fila de persona de M6 con el Badge de estado bajo las líneas de texto (la misma regla de toda lista de estados), `.tl-listitem__badges` (insignias y nota) y, en `.tl-listitem__actions`, «Avanzar» / «No seleccionar». Así las dos acciones caben en una línea a 360. Sin edad.
4. **Insignia larga con su vencimiento al lado.** «Apto para trabajar con menores · vence 11/2027» no cabe en una VerificationBadge de una línea dentro de una fila de 272 px. La insignia lleva «Apto/Apta para trabajar con menores» y el vencimiento va al lado como texto, igual que «Credencial SPD · Verificada · Vence 03/2028» en M6. La insignia concuerda con la persona, como ya hacía «Apta para trabajar con menores» en la tarjeta de Clase de Camila.
5. **Tarjeta de persona en el Deck.** GES-03 y EXP-05 piden el mismo deck y el mismo ActionPair. No hay componente nuevo: es la tarjeta del deck con contenido de persona (avatar redondo, oficio como título, pretensión con Amount, nota y Confiabilidad, requisitos de la oferta con su estado y «Por qué ves esto»). En F3, el perfil impulsado lleva «Destacado» arriba a la derecha.
6. **Card de estado de verificación de la organización.** GES-01 e INI-02 piden decir qué habilita la verificación. Es una Card informativa con tile, VerificationBadge del estado, «Hasta verificar: 1 publicación activa; los turnos se publican cuando te verifiquemos» y Button tonal sm a VER-04.

## M8 · Cambios a la librería

1. **Timeline de niveles (`tl-timeline--levels`).** VER-01 pide una escalera Cuenta básica · Teléfono verificado · Identidad verificada con el estado de cada nivel. No es un componente nuevo: es el Timeline, con lo que permite cada nivel (`.tl-tstep__desc`), su acción real (`.tl-tstep__action`, «Verificar identidad») y dos estados más: en revisión (`--review`, punto info con reloj) y rechazada (`--error`, punto danger con alerta, el motivo e «Intentar de nuevo»).
2. **MediaUploader · Cámara (`tl-capture`).** VER-02 pide fotos de la cédula y una selfie con guía de encuadre. Es la vista de la cámara con un marco (rectángulo de cédula o óvalo para la cara), velo `color-scrim` alrededor y una indicación en píldora; bien encuadrada pasa a `color-success-text` y con problema a `color-danger-text` con el motivo. La foto se toma siempre con Buttons reales: «Tomar foto» y «Elegir de la galería».
3. **MediaUploader · Ejemplo visual (`tl-docsample`).** VER-02 y VER-03 piden ejemplos del documento. Es un esquema hecho con tokens (cédula por delante y por detrás, credencial y selfie con la silueta del ícono de persona), nunca una foto ni datos de verdad. Lo que debe leerse se marca en `color-primary-subtle` con borde `color-primary-text`.
4. **ListItem desplegable (`tl-listitem--expand`).** AYU-01 pide preguntas frecuentes. La pregunta abre la respuesta en el lugar (`aria-expanded`), con el mismo chevron hacia abajo girado, sin un componente de acordeón aparte.
5. **ListItem con Button al final.** CFG-04 pide «Revocar» en cada consentimiento. La fila es un `div` con un Button ghost sm al final, para no meter un botón dentro de otro. `--multiline` alinea arriba cuando el texto ocupa varias líneas.
6. **ListItem de dos canales.** CFG-03 pide un Switch por tipo y por canal. Cada tipo es una fila con dos Switch en columnas de 64 bajo el encabezado «Teléfono» · «Correo»; cada Switch lleva su nombre completo para el lector de pantalla. Se dice «Teléfono», no «push».
7. **LegalDocument (`tl-legal`), componente nuevo.** LEG-01 y LEG-02 piden índice de secciones, Body-L y una sola fecha. Es la plantilla de los textos legales: H1, la fecha («Actualizados el 1 dic 2026»), el índice con ListItems que bajan a cada sección y secciones con H2 y Body-L.
8. **ListItem danger con pantalla.** «Eliminar cuenta» es danger pero no abre un Dialog: abre CFG-06, porque pide confirmación escrita («ELIMINAR»). La regla queda: danger abre un Dialog o, si necesita confirmación escrita, su pantalla.
9. **Dónde se usa, corregido.** PRF-10 y PRF-11 usan el AppBar standard, como en M6 y M7 (no el transparente). La disponibilidad se lee en filas en PRF-01 y PRF-10; el AvailabilityGrid es para editarla (ONB-T2 y PRF-03).

10. **«Cédula», no «carnet».** El prompt de M8 dice «cédula»; la librería, M6 y M7 decían «carnet». Se usa «cédula» en todas partes (VerificationBadge, ListItem, la hoja de identidad de DET-01 y la de PUBL-04, y VER-02).

## M9 · Cambios a la librería

1. **SlotPicker · adelanto (`tl-slots--peek`).** DET-01 Clase pide, bajo el detalle, los próximos 3 horarios libres. Es el mismo SlotPicker en una fila: «Próximos horarios libres» con «Ver 14 días», el día como `.tl-day` elegido (informativo) y sus horas en chips que abren RES-01 con esa hora elegida.
2. **SlotPicker · sin horarios (`.tl-slots__empty`).** RES-01 pide «Camila no tiene horarios libres en los próximos 14 días · Avisarme». Los 14 días quedan en gris y, debajo, un bloque en `color-surface-2` con ícono, el texto y Button tonal «Avisarme» (luego, Snackbar «Te avisaremos cuando Camila abra horarios»). No es un EmptyState de pantalla completa, porque el resto de RES-01 sigue ahí.
3. **SlotPicker · ejemplo alineado con la agenda de Camila.** Hoy (mié 10 mar) queda sin horas: Camila pide 24 h de anticipación. El jue 11 las horas son 16:00, 17:00 y 18:00: a las 19:30 ya tiene una clase con Diego y entre clases deja 30 min. Antes mostraba hoy disponible y 19:30 libre.
4. **Banner con contador (`.tl-banner__timer`).** RES-02 en F3 pide el horario retenido «por 10 minutos» con contador. Es el Banner warning con el tiempo que queda a la derecha («09:42», 16/600, cifras tabulares, `role="timer"`). No hay componente de cuenta regresiva aparte.
5. **ListItem con bloques horarios.** ACT-04 pide un editor semanal por bloques. Las clases se reservan por hora, así que las franjas del AvailabilityGrid (Mañana 07–13…) no alcanzan: cada día es una fila con sus bloques en InfoTag («16:00–21:00») y abre una hoja con «Desde» y «Hasta». Un día sin bloques dice «Sin horario». Las excepciones son filas con el basurero al final.
6. **Dónde se usa, al día.** La tabla del README y el mapa de uso vuelven a coincidir fila por fila (algunas filas del README venían atrasadas desde M6 y M7), con las pantallas de M9.
7. **Chip con ícono de categoría (`.tl-chip--lead`).** EXP-03 pide chips de categoría (Escolar, PAES, Idiomas…). El ícono de la categoría va al inicio en `color-text-2`; al elegir el chip, el check lo reemplaza. Así el chip elegido tiene un solo indicador, como pide la regla de Chip.

## M10 · Cambios a la librería

1. **Avatar con foto (`tl-avatar--photo`).** En servicios la foto del prestador es obligatoria. En la app es la foto real (`img`); en los mockups se marca con el mismo rayado de las fotos de la galería, para no confundirla con el avatar sin foto (iniciales) ni con «Agregar foto» del MediaUploader (silueta). La usan EXP-04, DET-01 Servicio, la conversación, SRV-01, SRV-02, RES-03 y PUBL-06.
2. **SystemCard · Cotización.** SRV-02 pide una tarjeta de cotización estructurada dentro del chat. Es la SystemCard con el total en Amount lg (`.tl-syscard__amount`, con «Total, con materiales» en `.tl-syscard__note`), qué incluye, día y hora, y hasta cuándo vale, con «Rechazar» / «Aceptar». Aceptada: Badge «Aceptado». Vencida: la vigencia pasa a warning («Venció el dom 20 jun») y queda «Pedir nueva cotización»; la tarjeta no se apaga, porque el monto sigue siendo información útil.
3. **Desglose de pago (`tl-breakdown`).** El pago en la app pide el monto y, si se cobra al cliente, el cargo de servicio de Talently como línea separada. Es una lista concepto / monto con cifras tabulares y el total separado por un divisor. Se usa al pagar (RES-02) y en el detalle de la solicitud (Pagado, Reembolsado con «Te devolvimos»).
4. **Estado de pago en Badge.** Pendiente de pago (warning, del diccionario), Pagado (success) y Reembolsado (neutral). Va junto al monto, nunca en lugar del estado de la solicitud de servicio.
5. **PublicationCard · Servicio al día.** El ejemplo de la librería decía «SEC gas»; DET-01 dice «SEC gas clase 3». Se usa «SEC gas clase 3» en tarjeta, detalle y perfil (el mismo dato se ve igual), y la cabecera lleva la foto del prestador.
6. **Dónde se usa.** Mapa de uso y README con las pantallas de M10.


## M11 · Cambios a la librería

1. **Tokens de layout web.** El backoffice (admin.talently.app) es una app de escritorio: `layout-web-width` 1280 y `layout-web-height` 800, `layout-sidenav` 256, `layout-sidenav-rail` 104, `layout-webbar` 80 y `layout-review` 448. Los colores, la tipografía, los radios y las sombras son los mismos de la app.
2. **WebShell y SideNav.** Navegación lateral con las 5 secciones (Verificaciones · Organizaciones · Publicaciones · Reportes · Usuarios y auditoría), iguales y en el mismo orden para verificadores, moderadores y administradores, como las 5 pestañas de la app. Lo que cambia por rol es lo que se puede hacer: una sección fuera del rol lo dice al abrirla. Indicador único: la píldora `color-primary-subtle`. Bajo 1200 px pasa a riel (104), con la píldora de la BottomTabBar detrás del ícono. Organizaciones usa IconPeople, como «Crear organización» en la app; no se dibujó un ícono nuevo.
3. **AppBar web (`tl-appbar--web`).** Título H1 de la sección con su resumen («14 pendientes · ordenadas por inicio del turno y por riesgo») y el buscador por nombre, RUT o correo; en un detalle, BackButton, H2 y la posición en la cola. Sin status bar.
4. **DataTable (`tl-table`).** En la app, una lista es ListItem; en escritorio, las colas y el registro de auditoría necesitan columnas. Filas de 64 con dato y sub-línea, columna que ordena con `aria-sort`, pie con páginas y columnas opcionales que se ocultan en tablas angostas. Plazo: InfoTag; con 1 h o menos, Badge warning; vencido, Badge danger.
5. **ReviewPanel (`tl-review`) y Dialog web (`tl-dialog--web`).** El panel de 448 junto al documento junta quién, para qué, el checklist y las acciones; Aprobar y Verificar se habilitan con el checklist completo. Las acciones con motivo (rechazar, pedir otro documento, escalar, suspender, descartar) abren un Dialog centrado de 560: en escritorio no hay hojas inferiores.
6. **DocumentViewer (`tl-viewer`).** Foto con anverso y reverso, o PDF por páginas, con zoom. En los mockups, el marcador rayado de la galería con una etiqueta de qué es; nunca un documento dibujado. Siempre con el Banner «El archivo se borra 30 días después de revisado.».
7. **FlaggedText (`mark.tl-flag`).** Las señales de moderación se resaltan en `color-warning-subtle` con subrayado y un número, y se listan con el mismo número en un ListItem con tile warning (`.tl-listitem__tile--warning`). No es solo color: van el número y la lista.
8. **Snackbar web (`tl-snackbar--web`).** Abajo a la izquierda del contenido, nunca sobre la SideNav.
9. **Sin hover.** El backoffice se usa con mouse, pero la librería no suma un estado nuevo: al pasar el puntero no cambia nada, al hacer clic se ve el presionado y el foco con teclado es obligatorio.
10. **Dónde se usa.** Mapa de uso y README con las pantallas de M11 y las 5 tarjetas nuevas (WebShell, DataTable, ReviewPanel, DocumentViewer y FlaggedText).
