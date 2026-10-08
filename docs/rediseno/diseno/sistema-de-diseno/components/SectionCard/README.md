# SectionCard

Sección del Perfil («Así te ven») y de los detalles: Card con título H3 y, en la cabecera, un IconButton lápiz «Editar» o un Button sm «Agregar».

- Marcado: `section.tl-section` > `.tl-section__head` (`h2.tl-section__title.h3` + acción) + contenido; filas internas con `.tl-section__row`.
- Con datos: el contenido con el mismo formato que en las tarjetas y el detalle (mismo ícono, misma etiqueta).
- Vacía: texto de ayuda en `color-text-2` (`.tl-section__empty`) que dice para qué sirve, y un Button tonal con la acción real («Agregar experiencia»).
- El lápiz es el IconButton de siempre (40 visual, 48 táctil, `aria-label="Editar"`).
- Nada de «Perfil al 100 %» ni barras de completitud falsas.
