# Switch

El único toggle de Talently: riel 48×28, thumb de 24 en `color-on-primary` con `elev-1` en ambos temas, y toda la fila tocable (mínimo 48).

- Marcado: `label.tl-choice` > `.tl-choice__text` (+ `.tl-choice__desc`) + `.tl-switch` > `input[type=checkbox][role=switch]` + `.tl-switch__track` > `.tl-switch__thumb`.
- Apagado: riel `color-border-strong`. Encendido: riel `color-primary` con anillo interior 1,5 `color-primary-text` (cumple 3:1 también sobre `color-surface-3` en oscuro).
- Presionado: halo del thumb al 12 %. Foco: contorno 2 px `color-primary-text` en el riel. Deshabilitado: riel `color-surface-2` con borde `color-border`, thumb `color-text-disabled`, texto `color-text-disabled`, y la descripción explica cómo activarlo.
- Cargando: spinner de 16 dentro del thumb mientras se guarda; si falla, vuelve a su posición y aparece un Snackbar.
- Movimiento: `duration-base` con `ease-standard`.
