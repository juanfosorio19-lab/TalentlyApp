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
| B7 | Capas | `.tl-scrim`, `.tl-sheet`, `.tl-dialog` y `.tl-snackbar` usan `position: absolute` pensando en el marco del mockup. En la app van en un portal y deben anclarse a la pantalla; además, un Dialog sobre una hoja abierta debe oscurecer la hoja. | Contenedor `.tl-layer` (fijo, a pantalla completa, un contexto de apilamiento por capa) |

## Pendientes en el sistema (sin regla provisoria)

- **Movimiento de capas**: transiciones de apertura y cierre de BottomSheet, Dialog y velo (`duration-slow`, `ease-standard`), estado de arrastre sin transición (`.tl-sheet.is-dragging`), `touch-action: none` en el asa y la cabecera, y la hoja expandida.
- **Pie de la hoja sin barra de gestos**: con navegación de 3 botones de Android el safe area inferior es 0 y las acciones del pie quedan pegadas al borde. Definir un mínimo.
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
