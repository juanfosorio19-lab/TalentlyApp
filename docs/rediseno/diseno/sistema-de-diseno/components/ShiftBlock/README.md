# ShiftBlock

El bloque de un turno con la fecha y el horario grandes. Un turno de un día lleva un bloque; una serie (sáb 12 y dom 13 dic) lleva un bloque por día, cada uno con sus cupos.

- Marcado: `ul.tl-shifts` > `li.tl-shift` > `.tl-shift__date` (día de la semana, número de 24/700 y mes, en `color-primary-subtle`) + `.tl-shift__body` con `.tl-shift__time` (20/700, cifras tabulares) y `.tl-shift__meta` (duración y cupos).
- `color-surface`, borde `color-border`, `radius-lg`. La fecha tiene un texto oculto para el lector de pantalla.
- Cupos con el mismo formato de la tarjeta: «Quedan 3 de 8 cupos»; con 2 o menos, Badge warning; sin cupos, Badge «Cupos completos».
- Se usa en DET-01 Turno, TUR-01 Mi turno y en el paso de vista previa de PUBL-03.
- Barra de cupos (`.tl-cupos`, GES-04): «Confirmados 5/8» y una barra de 8 con `role="meter"`; completa pasa a `color-success-text`. Siempre con el número al lado.
