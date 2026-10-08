# AppBar

La barra superior: un solo AppBar por pantalla, nunca dos barras apiladas. Alto 56 (`layout-appbar`) más el safe area superior (`layout-status-bar`), que solo compensa el AppBar.

- **Large** (pestañas): `header.tl-appbar` > `.tl-statusbar` + `.tl-appbar__row` con `h1.tl-appbar__title.h1` a la izquierda y `.tl-appbar__actions` a la derecha.
  - Campana en todas las pestañas.
  - IconFilter solo en Explorar e IconGear solo en Perfil.
  - Selector de actor (`.tl-actor`) solo en Inicio y Perfil, y solo si la persona pertenece a una organización que no es su hogar.
  - Bajo 375 px de ancho (360), el selector baja de 168 a 144 px de máximo, para que «Hola, Rosa» no se corte (M2).
- **Standard** (pantallas apiladas): `tl-appbar--standard` con BackButton a la izquierda, título H3 centrado (se corta con «…») y máximo 2 acciones.
- **Conversación** (`tl-appbar--chat`, M5): BackButton, `a.tl-appbar__who` con Avatar de 40 (punto de verificación solo si es real), nombre 16/600 y una línea 12/500 en `color-text-2` («Organización verificada»), y ⋯ (Ver publicación · Reportar · Bloquear). Tocar el nombre abre el perfil público. Nombre y línea se cortan con «…».
- **Transparente** (`tl-appbar--transparent`), sobre una foto o sobre la cabecera `color-surface-2` de un detalle: sin título, con los IconButton sobre un círculo `color-surface` al 90 %, nunca blanco fijo. Con `is-scrolled` pasa a standard con título.
- En reposo el fondo es `color-bg`; al hacer scroll (`is-scrolled`) gana `color-surface` y `elev-2`. Capa `z-sticky`.
- **Selector de actor**: chip de 40 con borde `color-border-strong`, Avatar de 32 (redondo = persona, cuadrado = organización), nombre corto y chevron. Abre una hoja «Usar Talently como». El hogar nunca aparece en el selector.
- La status bar simulada (`.tl-statusbar`, «13:00») es solo para mockups.
- **Web** (`tl-appbar--web`, M11): en el backoffice de escritorio, 80 px (`layout-webbar`), sin status bar, con el título H1 de la sección y su resumen, y el SearchField a la derecha; en un detalle, BackButton, H2 y la posición en la cola. Ver la tarjeta WebShell.
