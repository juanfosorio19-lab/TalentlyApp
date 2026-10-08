# IconButton

Botón de solo ícono, circular: 40 px visual y 48 px de área táctil. Variantes ghost (por defecto) y tonal.

- Marcado: `<button class="tl-iconbtn" aria-label="Notificaciones"><span class="tl-icon">…</span></button>`; tonal con `tl-iconbtn--tonal`. Siempre con `aria-label` en español: el ícono solo no basta.
- ghost: transparente con ícono `color-text`. tonal: `color-primary-subtle` con `color-on-primary-subtle`.
- Seleccionado (`is-selected` + `aria-pressed="true"`), para alternar como Guardar: ghost pasa a `color-primary-text`; tonal pasa a relleno `color-primary`.
- Presionado: capa del color del ícono al 12 %. Foco: contorno 2 px `color-primary-text` + halo. Deshabilitado: `color-surface-2` con `color-text-disabled`. Cargando: spinner de 24 en lugar del ícono.
- En el AppBar: campana en todas las pestañas, IconFilter solo en Explorar, IconGear solo en Perfil, máximo 2 acciones en el AppBar standard.
- Contador (`span.tl-iconbtn__badge`, agregado en M2): el mismo del Badge de la TabBar, 18 de alto, `color-primary` con número `color-on-primary`, aro del color del fondo. Solo con un número real (campana: notificaciones sin leer; Filtros: filtros activos); desde 10, «9+». El `aria-label` lo dice: «Notificaciones, 2 sin leer».
