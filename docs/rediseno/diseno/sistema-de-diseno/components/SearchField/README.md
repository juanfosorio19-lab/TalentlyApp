# SearchField

Buscador: alto 44, pill (`radius-full`), fondo `color-surface-2`, lupa `IconSearch` a la izquierda en `color-text-2`, texto en 16.

- Marcado: `.tl-search[role="search"]` con `IconSearch`, `input.tl-search__input` y, si hay texto, un IconButton «Borrar búsqueda» con `IconClose`.
- Placeholder con ejemplos de lo que se puede buscar («Buscar oficio, empresa o comuna»), en `color-text-3`.
- Foco: borde interior 1,5 `color-primary-text` + halo. Cargando: spinner de 16 donde va el botón borrar.
- Sin resultados no es un error: la lista muestra un EmptyState con una sugerencia útil («No hay turnos en Ñuñoa; hay 8 a menos de 10 km»).
- Busca también por sinónimos («nana» encuentra Asesor/a del hogar), pero la interfaz muestra siempre el nombre digno del oficio.
