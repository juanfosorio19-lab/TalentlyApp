# CodeInput

Campo para el código de 6 dígitos del correo (AUTH-03) y del teléfono (AUTH-08): 6 casillas de 48 × 56 con un solo campo real debajo.

- Marcado: `.tl-code` > 6 `span.tl-code__box` + un `input.tl-code__input` (`inputmode="numeric"`, `autocomplete="one-time-code"`, `maxlength="6"`) que cubre las casillas; debajo `.tl-code-foot` con ayuda, error o «Verificando…».
- Casillas como TextField: borde `color-border-strong`, `radius-md`, cifra 24/600 tabular. La activa: borde `color-primary-text`, halo y cursor.
- Al completar los 6 dígitos se verifica solo (spinner de 16 y «Verificando…»). Error: casillas en `color-danger-text` y «El código no es correcto. Te quedan 2 intentos.».
- «Reenviar» es un Button ghost sm con cuenta regresiva real («Reenviar en 0:45») hasta que se habilita.
- El destino se muestra enmascarado: «+56 9 •••• 5678».
