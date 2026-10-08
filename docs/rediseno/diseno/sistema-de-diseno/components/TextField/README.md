# TextField

Campo de texto de una línea: alto 48, radio `radius-md`, borde 1,5 `color-border-strong`, fondo `color-surface`, valor en Body-L 16.

- Marcado: `.tl-field` > `label.tl-field__label` + `.tl-field__control` (con `input.tl-field__input`) + `.tl-field__foot` (con `.tl-field__help` y `.tl-field__error`).
- Etiqueta arriba en Label 13/600, en minúsculas salvo la primera letra. Solo lo opcional se marca: `<span class="tl-field__opt">(opcional)</span>`. Nunca asteriscos.
- El placeholder es un ejemplo («Ej.: 76.123.456-0») en `color-text-3`, nunca la etiqueta.
- Foco: borde `color-primary-text` + halo `focus-ring`. Error (`is-error`, `aria-invalid`): borde `color-danger-text` y, en lugar de la ayuda, ícono alerta + mensaje humano en Caption («Ingresa un RUT válido»).
- Deshabilitado (`is-disabled` + `disabled`): control en `color-surface-2` con `color-text-disabled`; la etiqueta queda en `color-text-2` y la ayuda explica por qué.
- Cargando: spinner de 16 al final del control y la ayuda dice qué pasa («Validando RUT…»).
- Válido (`is-valid`, agregado en M3): IconCheck de 20 en `color-success-text` al final del control (`.tl-field__affix.tl-field__valid`) y la ayuda en success («RUT válido»). Solo donde el dato se valida en vivo, como el RUT de ONB-O1; nunca en campos de texto libre.
- Un error puede ofrecer la salida con un enlace en texto (`a.tl-link`, toma el color del error): «Ya existe una cuenta con este correo. Iniciar sesión».
- Los formularios no piden edad, sexo, nacionalidad, estado civil ni apariencia.
