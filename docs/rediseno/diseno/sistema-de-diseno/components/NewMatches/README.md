# NewMatches

La fila «Nuevos matches (n)» arriba de Mensajes (MSG-01). Muestra solo los matches que todavía no tienen mensajes; con el primer mensaje, el match pasa a la lista de conversaciones.

- Marcado: título H2 «Nuevos matches (n)» + `ul.tl-newmatches` > `li` > `a.tl-newmatch` con Avatar de 56, `.tl-newmatch__name` (14/600, dos líneas como máximo) y `.tl-newmatch__ctx` (ícono del tipo de 16 + «tipo · título · fecha» en 12/500 `color-text-2`).
- Tarjeta de 144 de ancho, `color-surface`, borde `color-border`, `radius-lg`, padding 12, separadas por 12. La fila se desliza de lado y llega al borde de la pantalla.
- Organización cuadrada, persona redonda, igual que en todas las vistas. El tipo se distingue por ícono y etiqueta, como en ContextChip.
- El número entre paréntesis es real. Sin matches nuevos la sección no se muestra.
- Presionado: capa `color-text` al 8 %. Foco: contorno 2 px `color-primary-text` + halo.
