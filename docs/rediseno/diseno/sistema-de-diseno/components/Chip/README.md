# Chip

Chip de 36 px, pill, 14/500, con área táctil de 48. Tres tipos y un solo estilo de seleccionado.

- **filter** (`button.tl-chip[aria-pressed]`): para filtrar o elegir. Default `color-surface` con borde 1,5 `color-border-strong`. Seleccionado: `color-primary-subtle` + borde `color-primary-text` + check de 16 + texto `color-on-primary-subtle`. Es el único estilo de chip seleccionado de la app.
- **input** (`.tl-chip--input` + `button.tl-chip__remove`): un valor ya elegido, en `color-surface-2`, con X (`IconClose`, `color-text-2`) para quitarlo; la X tiene `aria-label` «Quitar …» y área táctil de 44.
- **suggestion** (`.tl-chip--suggestion`): una opción para agregar, con `IconAdd` en `color-primary-text`; al tocarla pasa a ser un chip input.
- Presionado: capa al 12 %. Foco: contorno 2 px `color-primary-text` + halo. Deshabilitado: `color-surface-2` con `color-text-disabled`.
- **con menú** (`.tl-chip--menu`, M6): un valor que se cambia en una hoja, como la comuna en EXP-02. Ícono de 16 al inicio en `color-text-2`, el valor y `IconChevronDown` de 16; `aria-haspopup="dialog"`. No tiene seleccionado: siempre muestra un valor.
- **con ícono de categoría** (`.tl-chip--lead` + `.tl-chip__lead`, M9): en EXP-03 (Escolar, PAES, Idiomas…). El ícono de 16 va al inicio en `color-text-2`; al elegir el chip, el check lo reemplaza: un solo indicador.
- Entre chips, `space-2`. Se agrupan con ChipGroup cuando hay contador o máximo.
