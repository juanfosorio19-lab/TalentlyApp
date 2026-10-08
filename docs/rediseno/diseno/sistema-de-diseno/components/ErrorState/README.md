# ErrorState

Lo que se ve cuando una pantalla no pudo cargar y no hay nada guardado. Dice qué pasó con palabras humanas y ofrece «Reintentar».

- Misma estructura que EmptyState con `tl-empty--error`: círculo `color-danger-subtle` con `IconAlert` en `color-danger-text`.
- Título que dice qué falló («No pudimos cargar los turnos») y cuerpo que dice qué hacer («Revisa tu conexión e intenta de nuevo»). Nunca un error técnico ni un código.
- «Reintentar» es un Button primary que pasa a cargando mientras reintenta.
- Si hay datos guardados, la pantalla los muestra con el Banner info «Sin conexión. Mostramos lo último que cargaste».
