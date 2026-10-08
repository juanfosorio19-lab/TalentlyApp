# Checkbox

Casilla de 20 px para elegir varias opciones o aceptar algo, con toda la fila tocable (mínimo 48).

- Marcado: `label.tl-choice` > `.tl-checkbox` > `input[type=checkbox]` + `.tl-checkbox__box` (con `IconCheck` de 16) + `.tl-choice__text`. En grupo, `fieldset.tl-group` con `legend.tl-group__label`.
- Sin marcar: borde 1,5 `color-border-strong` sobre `color-surface`, esquinas `radius-xs`. Marcado: relleno `color-primary`, anillo `color-primary-text` y check en `color-on-primary`.
- Presionado: halo de 40 al 12 %. Foco: contorno 2 px `color-primary-text` + halo. Error: borde `color-danger-text` + mensaje con ícono alerta. Deshabilitado: `color-surface-2`, borde `color-border`, texto `color-text-disabled`.
- Para una opción excluyente se usa Radio; para encender o apagar algo, Switch.
- Enlaces dentro de la etiqueta: `a.tl-link` (Términos, Política de privacidad), `color-primary-text` 600 subrayado. Abren el texto sin marcar la casilla.
