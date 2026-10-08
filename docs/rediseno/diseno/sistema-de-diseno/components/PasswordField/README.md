# PasswordField

TextField de contraseña con el botón para mostrarla y, al crearla, las 3 reglas que se marcan en vivo. Agregado en M3.

- Marcado: `.tl-field` > `label` + `.tl-field__control` con `input[type=password]` y `button.tl-iconbtn.tl-field__toggle` (IconEye) + `ul.tl-rules` con 3 `li.tl-rules__item`.
- Ojo: IconButton de 40 dentro del campo, «Mostrar contraseña» / «Ocultar contraseña» con `aria-pressed`. Activo, la contraseña se ve como texto y el botón queda en tonal (`color-primary-subtle`). Un solo ícono: el estado lo dice el fondo y la etiqueta.
- Reglas, siempre las mismas y en este orden: «8 caracteres o más · Una mayúscula · Un número o símbolo».
  - Pendiente: círculo 1,5 `color-border-strong` y texto `color-text-2`.
  - Cumplida (`is-met`): IconCheck de 16 y texto en `color-success-text`.
  - Falta al enviar (`is-missing`): IconAlert de 16 y texto en `color-danger-text`, más el borde del campo en danger.
  - Nunca solo el color: cambia el ícono y cada regla lleva el texto oculto «cumplido», «pendiente» o «falta» (`aria-live="polite"`).
- Al iniciar sesión (AUTH-04) va sin reglas y con el error de siempre: «El correo o la contraseña no coinciden».
- `autocomplete="new-password"` al crear y `current-password` al ingresar.
