# Spinner

Indicador de espera dentro de un control: 16, 24 o 40, con el color del contenido al que reemplaza.

- Marcado: `span.tl-spinner` (24), `--16` o `--40`; anillo de `currentColor` con una abertura, girando en 800 ms.
- 16: campos, botones sm, SearchField, Switch. 24: botones lg y md, IconButton, enviar del Composer. 40: subida de la foto de perfil.
- El control que espera lleva `aria-busy="true"` y un texto que dice qué pasa («Validando RUT…», «Guardando…»).
- Nunca suelto en una pantalla: una lista o tarjeta que carga usa Skeleton.
