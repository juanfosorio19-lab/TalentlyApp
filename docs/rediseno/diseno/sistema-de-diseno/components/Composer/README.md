# Composer

La barra para escribir en el chat, fija abajo: IconButton adjuntar (`IconAttach`), campo pill en `color-surface-2` que crece hasta 4 líneas, e IconButton enviar (`IconSend`) en `color-primary`.

- Marcado: `.tl-composer` > `button.tl-iconbtn` + `label.tl-composer__field` > `textarea.tl-composer__input` + `button.tl-iconbtn.tl-composer__send`.
- «Enviar» está deshabilitado con el campo vacío y pasa a cargando mientras se envía.
- Foco: borde interior `color-primary-text` + halo. Compensa la barra de gestos porque reemplaza a la TabBar.
- Si la conversación se cierra, se reemplaza por una línea que explica por qué.
- Adjuntar abre una hoja con «Tomar foto», «Elegir de la galería» y «Compartir un documento». Para quien trabaja (o presta el servicio, F3), después del match suma primero «Compartir certificado de antecedentes» (M5); la otra parte nunca tiene esa opción ni un botón para pedirlo.
- Si la otra parte pide el certificado por texto, aparece sobre el Composer el Banner info «Compartirlo es voluntario.» (M5).
- Al escribir un teléfono o un enlace (M5), aparece sobre el Composer, en `.tl-composer__notice`, el Banner warning «Por tu seguridad, mantén la conversación en Talently.». Avisa y no bloquea; desaparece si se borra el número o el enlace.
