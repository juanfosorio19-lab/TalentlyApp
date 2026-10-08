# MessageBubble

Burbuja de mensaje de chat: propia a la derecha en `color-primary` con texto `color-on-primary`; ajena a la izquierda en `color-surface-2` con `color-text`. `radius-lg`, texto 16, ancho máximo 80 %.

- Marcado: `.tl-msg` (+ `--own`, `--error`) > `.tl-bubble` + `.tl-msg__meta` (Caption bajo la burbuja).
- Meta con la hora y, en los mensajes propios, el estado real: «Enviando…», «Enviado», «Leído». Nunca un «Leído» sin lectura ni un punto «en línea».
- No se envió: borde `color-danger-text`, «No se envió» con `IconAlert` y «Reintentar».
- Separador de día (`.tl-chat__day`): «Hoy», «Ayer», «12 dic».
- En cola (`tl-msg--queued`, M5): sin conexión, la burbuja propia pasa a `color-primary-subtle` con `color-on-primary-subtle` y la meta dice «Se enviará cuando vuelva la conexión» con `IconClock`. Al volver la señal se envía sola.
- Arriba de la conversación, fijo bajo el AppBar de conversación, va el ContextChip de la publicación. El Banner warning «Por tu seguridad, mantén la conversación en Talently.» aparece sobre el Composer al escribir un teléfono o un enlace (ver Composer).
