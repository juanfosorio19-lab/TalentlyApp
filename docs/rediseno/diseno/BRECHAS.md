# Brechas del sistema de diseño (para Claude Design)

Al construir los componentes en código (`Talently_v2/src/ui`) aparecieron
cosas que `bundle.css` o la documentación del sistema no cubren. Las que la
app necesita ya están resueltas de forma provisoria en
`Talently_v2/src/ui/styles/app.css` (sección «Brechas», solo con tokens). La
idea es pedirlas a Claude Design para que queden en el sistema y, al llegar
la entrega nueva (`npm run ds:sync`), borrarlas de `app.css`.

Prompt sugerido para Claude Design: «Incorpora al sistema de diseño Talently
estas brechas encontradas al implementarlo, con sus estados y en claro y
oscuro, y actualiza bundle.css, el README del componente y decisiones.md».

## Resueltas de forma provisoria en app.css

| # | Componente | Qué falta | Regla provisoria |
|---|---|---|---|
| B1 | SearchField | El WebView de Android (Chromium) dibuja su propia X de borrar junto a «Borrar búsqueda»: con texto y foco se ven dos X. | `.tl-search__input::-webkit-search-cancel-button, ::-webkit-search-decoration { appearance: none }` |
| B2 | LegalDocument | El preview quita en línea el margen del H1 y el margen y color del rótulo «En esta página». | `.tl-legal > header > h1 { margin: 0 }` · `.tl-legal__index > .overline { margin: 0; color: color-text-2 }` |
| B3 | ListItem | Lista sin borde ni fondo dentro de una hoja («Verificación de …»). El preview lo hace en línea. | `.tl-list--flat` |
| B4 | RatingStars | Nota bajo las estrellas al calificar («4 de 5 · Muy bien») y ayuda de deshabilitado. | `.tl-stars__note` (12/16 500, margin-top space-1, color-text-2) |
| B5 | OptionCard | La leyenda del grupo queda a 4 px de la primera tarjeta; el preview la separa 12 en línea. | `.tl-optgroup > .tl-group__label { margin-bottom: space-3 }` |
| B6 | Bienvenida (AUTH-01) | No hay clase para el hero: gradient-brand en claro y gradient-hero-dark en oscuro. | `.tl-hero` con `--tl-hero-bg` por tema |
| B7 | Capas | `.tl-scrim`, `.tl-sheet`, `.tl-dialog`, `.tl-match` y `.tl-snackbar` usan `position: absolute` pensando en el marco del mockup. En la app van en un portal en `<body>`: se abrían fuera de la pantalla después de hacer scroll, y un Dialog sobre una hoja no la oscurecía. | `body > .tl-…{ position: fixed }`, sin scroll bajo el velo y el velo de la segunda capa al nivel `z-modal` |
| B8 | BottomSheet | Con navegación de 3 botones (o en el navegador) el safe area inferior es 0 y las acciones del pie quedan pegadas al borde. | `padding-bottom: max(barra de gestos, space-3)` |
| B9 | Snackbar | El Snackbar fijo (`--static`) dentro de una hoja con pie va de borde a borde. | `.tl-sheet > .tl-snackbar--static { margin: 0 space-4 space-3 }` |
| B10 | Capas | Sin transiciones de apertura y cierre ni estado de arrastre. | Velo y diálogo con fundido, hoja que sube y baja con `duration-slow`, `.is-closing`, `.is-dragging` sin transición, `touch-action: none` en el asa, y MatchModal que entra con `ease-spring` desde escala .92 (confirmar la escala) |
| B11 | MediaUploader | Una foto real (`img`) en la galería o la cámara queda a su tamaño natural; solo existe la regla para `.tl-avatar > img`. Bloquea PUBL-06, SRV-01 y VER-02 con fotos reales. | `.tl-gallery__item > img, .tl-capture__shot > img { position: absolute; inset: 0; object-fit: cover }` |
| B12 | MediaUploader | La galería deshabilitada (mientras guarda) se ve igual que la activa. | `[disabled]` con `color-surface-2` y `color-text-disabled` |
| B13 | Agenda (`.tl-event`) | El evento es un botón sin estado presionado. | Capa al 8 % como las filas de lista |
| B14 | AppBar transparente | Queda en `position: absolute`: en la app se va con el scroll y nunca muestra `is-scrolled`. | En la pantalla de la app, `sticky` con margen negativo para que la cabecera pase por debajo |
| B15 | Deck | Falta el estado de arrastre: la tarjeta debe seguir al dedo sin transición y sin la capa de presionado. | `.tl-deck__card.is-dragging` |
| B16 | StepLayout | El H1 del paso recibe el foco por código y muestra el contorno del navegador. | `.tl-steplayout__title:focus { outline: 0 }` |
| B17 | Card | Una Card tocable que es enlace (`a.tl-card--action`) queda subrayada. | `text-decoration: none` |
| B18 | Tema | Los controles nativos (calendario de `input[type=date]`, barras de scroll) no siguen el tema: en oscuro el ícono del calendario queda oscuro sobre oscuro. | `color-scheme` por tema |

## Pendientes en el sistema (sin regla provisoria)

- **Cambiar de semana en la Agenda**: CalendarWeek no trae cabecera para ir a la semana anterior o siguiente, y el set no tiene IconChevronLeft (IconArrowLeft es solo Volver). Pedir `.tl-week__nav` e IconChevronLeft/Right; mientras tanto la Agenda muestra solo la semana actual.
- **Vista Día con eventos que se cruzan**: falta una forma de poner dos bloques en el mismo horario (por ejemplo `.tl-dayview__event--half`); hoy los que se cruzan se listan bajo la grilla.
- **Chip de acción**: un chip que navega (sin `aria-pressed` ni check), como los horarios de «Ver más» en SlotPicker.
- **ARIA de los preview de SlotPicker**: `role="radiogroup"` con botones `aria-pressed` y `role="list"` con enlaces sin `listitem` no son válidos; en código se usó `role="group"`.
- **Deck que llena el alto**: falta una regla para que `.tl-deck` estire la tarjeta entre el SegmentedControl y el ActionPair (hoy `cardMinHeight` en línea, como el preview).
- **Skeleton sobre superficies elevadas**: en oscuro el brillo de `.tl-skel` sobre `color-surface-3` (tarjeta del deck) se ve manchado; falta una variante, y la forma de la tarjeta del deck sin CTA.
- **Interior de Card y SectionCard**: `.cardhead`, `.cardmeta`, `.kv` y `.chips` son clases locales del preview; falta el título 16/24 600 de filas y tarjetas, el chip de solo lectura sin X y el nombre-enlace del postulante (GES-02).
- **Cabecera de detalle**: la cabecera `color-surface-2` bajo el AppBar transparente (`.dhead` del preview) no tiene clase.
- **ActionPair «No me interesa»**: el README dice IconClose; se usa IconClose (confirmar contra el preview del deck).
- **Filas de SheetPicker**: falta la capa de presionado al 8 % y el anillo de foco en toda la fila `.tl-choice--row`, el estilo de la coincidencia resaltada, una ranura de ícono inicial y la casilla a la derecha para elección múltiple.
- **«Sin resultados» compacto**: variante de `tl-empty` sin círculo (ícono de 40 en `color-text-3`) con «Borrar búsqueda» ghost sm.
- **ChipGroup de elección única**: `role="radiogroup"` con chips `role="radio"` (el preview usa botones con `aria-pressed`, que no es válido) y «(opcional)» con `tl-field__opt`.
- **Nuevos matches**: margen del título y la fila con espacio para que el contorno de foco no se recorte.
- **Composer**: cómo se apilan dos avisos en `.tl-composer__notice` (seguridad y «Compartirlo es voluntario.»).
- **SystemCard**: variante del certificado verificado por Talently.
- **SegmentedControl como control de formulario**: hoy es `tablist`; los campos de turno (día/noche, vestimenta) se dibujan como chips de elección única.
- **Hoja expandida**: falta una clase para la hoja abierta a todo el alto (hoy se fija el alto en línea al arrastrar hacia arriba).
- **Radio con avatar**: la fila `tl-choice--row` de «Usar Talently como» necesita un Avatar antes del texto.
- **Logo con id de gradiente únicos**: decisiones.md (M1 · L2 punto 2) dice que varias copias del logo pueden compartir sus id de gradiente. En Chromium no es así: si la primera copia queda oculta (`display: none`), todas las demás desaparecen. En código, BrandLogo vuelve únicos los id por copia; conviene corregir la decisión.
- **ActionPair al arrastrar el deck**: el estado presionado solo existe como `.is-pressed`. Un selector propio (por ejemplo `.tl-ap[data-dragging]`) evitaría forzar la clase desde la lógica.
- **Esqueletos**: las plantillas del preview usan clases locales (`.skrow`, `.skcol`, `.skcard`, `.skchips`, `.skprof`). Conviene llevarlas al sistema (`.tl-skel-row`, `.tl-skel-stack`, `.tl-skel-profile`).
- **Timeline con cierre negativo**: falta el punto del paso que cierra un proceso en negativo («No seleccionado», «Cancelado por la organización»). Hoy se usa el de paso hecho y el estado lo dice la etiqueta.
- **Checkbox suelto con error**: no hay regla para mostrar el error de un Checkbox fuera de un grupo (Términos y Privacidad en AUTH-02).
- **Selectores nativos para deshabilitado**: `.tl-choice:has(input:disabled)`, `.tl-chip[disabled] .tl-icon` y `[aria-disabled="true"]` en OptionCard «Pronto» evitarían poner `is-disabled` a mano.
- **Cuerpo de hoja**: `.tl-sheet__body` no tiene padding superior y recorta el contorno de foco del primer hijo (por ejemplo CategoryGrid en SHT-OFICIO).
- **TextArea al máximo**: el README pide que la ayuda también pase a warning en `is-max`, pero bundle.css solo colorea el contador.
- **Amount**: falta precio «Gratis» y la unidad de vigencia de un plan («por 30 días») para PUBL-08 y PRF-12.
- **Nombre en la tarjeta de Personas sugeridas**: no hay clase para el nombre 16/24 600.
- **Etiquetas de estado de los prototipos**: «Verificado» (success) y «Principal» (primary) aparecen en los prototipos pero no en el diccionario de Badge del README (ya están en el diccionario del código).

## Fuera del alcance de la app móvil

- FlaggedText y los componentes del backoffice web (WebShell, SideNav, DataTable, ReviewPanel) son de `admin.talently.app` (M11) y no se construyen en esta app.
