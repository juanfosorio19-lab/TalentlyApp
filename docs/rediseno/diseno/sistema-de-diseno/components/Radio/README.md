# Radio

Botón de opción de 20 px para elegir una sola opción de una lista corta, con toda la fila tocable (mínimo 48). Las listas largas van en un SheetPicker, que usa el mismo Radio.

- Marcado: `fieldset.tl-group[role="radiogroup"]` con `legend.tl-group__label` y filas `label.tl-choice` > `.tl-radio` > `input[type=radio]` + `.tl-radio__box`.
- Sin elegir: anillo 1,5 `color-border-strong`. Elegido: anillo y punto de 10 en `color-primary-text` (5,45:1 también sobre `color-surface-3` en oscuro).
- Presionado: halo de 40 al 12 %. Foco: contorno 2 px `color-primary-text` + halo. Error (`is-error` en el grupo): anillos `color-danger-text` + mensaje al pie. Deshabilitado: `color-surface-2`, borde `color-border`, texto `color-text-disabled`.
- Opciones con el texto literal del diccionario («Inmediata · En 15 días · En 1 mes · A convenir»).
