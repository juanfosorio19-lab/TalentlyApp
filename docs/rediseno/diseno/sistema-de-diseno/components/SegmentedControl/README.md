# SegmentedControl

Selector de vista dentro de una pantalla: alto 40, pill, fondo `color-surface-2`. Lo usa Explorar para cambiar entre tipos de publicación.

- Marcado: `.tl-seg[role="tablist"]` con `button.tl-seg__opt[role="tab"]`; el activo lleva `is-selected` y `aria-selected="true"`.
- Activo: fondo `color-surface-3` con `elev-1`, texto 14/600 `color-text`. En claro `color-surface-3` es igual a `color-surface`; en oscuro es la superficie más alta, así que el segmento activo se ve elevado.
- Inactivo: texto `color-text-2`. Presionado: capa al 8 %. Foco: contorno 2 px `color-primary-text` + halo. Área táctil de 48.
- Una variante por fase: F1 «Empleos · Turnos»; F2 «Empleos · Turnos · Clases». Lo no lanzado nunca aparece como segmento.
- Empleos se explora en deck (con alternativa de lista); Turnos siempre en lista agrupada por fecha.
