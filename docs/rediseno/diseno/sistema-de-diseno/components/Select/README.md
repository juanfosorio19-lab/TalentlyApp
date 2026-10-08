# Select

Campo de elección: se ve como un TextField con `IconChevronDown` y, al tocarlo, abre un SheetPicker. Las listas largas (comuna, oficio, materia) siempre se eligen en una hoja con buscador.

- Marcado: `.tl-field.tl-select` con `button.tl-field__control.tl-select__control` (`aria-haspopup="dialog"`), `.tl-select__value` (o `.is-placeholder`) e `IconChevronDown` en `color-text-2`.
- Placeholder en imperativo («Elige tu comuna»). Presionado: capa al 8 % sobre el control. Foco, error y deshabilitado: igual que TextField.
- Cargando: «Cargando comunas…» con spinner de 16 en lugar del chevron.
