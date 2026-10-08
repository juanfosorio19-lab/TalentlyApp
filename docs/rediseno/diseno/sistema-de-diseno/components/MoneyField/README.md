# MoneyField

Campo de monto en CLP: prefijo «$», separador de miles mientras se escribe (650.000) y selector de unidad al final.

- Marcado: `.tl-field.tl-money` con `.tl-field__affix` («$»), `input.tl-field__input` (`inputmode="numeric"`) y `button.tl-money__unit` con la unidad e `IconChevronDown`.
- La unidad abre un SheetPicker con el diccionario: al mes · por día · por hora · por turno · por evento · por visita · por clase · por proyecto · A convenir.
- La etiqueta dice si el monto es líquido o bruto («Sueldo líquido», «Tarifa por turno»); el monto se muestra después en el formato único de Amount («$650.000 líquidos al mes»).
- Presionado aplica al selector de unidad (capa al 12 %). Foco, error y deshabilitado: igual que TextField.
- Referencias: sueldo de guardia 4x4 $650.000 líquidos al mes; turno de garzón $35.000 líquidos por turno; clase de matemática $18.000 por clase de 60 min.
