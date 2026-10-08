# MediaUploader

Para subir fotos y documentos, en 3 variantes. Siempre con botones reales «Tomar foto» y «Elegir de la galería» (o «Elegir archivo» para documentos).

- **Avatar** (`.tl-upload-avatar`): círculo de 96 con IconButton tonal de cámara. Subiendo: velo `color-scrim` con spinner de 40.
- **Logo** (`.tl-upload-avatar--org`, agregado en M3): el mismo control, cuadrado de 96 con `radius-md` como todo lo de una organización. Sin logo muestra el Avatar de organización con sus iniciales, que es lo que verán los demás.
- **Documento** (`.tl-doc`): vacío con borde punteado, nombre de la credencial, Badge de exigencia («Obligatoria» warning, «Recomendado» neutral) y formatos admitidos.
  - Subiendo: barra de 4 px con el porcentaje real y la opción de cancelar.
  - Subido: nombre, peso y Badge del diccionario («En revisión», «Verificada», «Vencida»), más el basurero para quitar.
  - Error: el motivo en danger y «Elegir otro».
- **Galería** (`.tl-gallery`): grilla de 4 columnas, hasta 8 fotos, contador «3 de 8» y casilla «Agregar» con borde punteado. Llena: sin «Agregar» y contador en warning. Tocar una foto abre una hoja con Ver, Cambiar y Quitar.
- Una foto real nunca es de stock: en los mockups es un recuadro rotulado.
- **Cámara** (`.tl-capture`, M8, VER-02): vista de la cámara con la guía de encuadre `.tl-capture__guide` (rectángulo de cédula, 85,6 × 54; o óvalo `--face` para la selfie), velo `color-scrim` alrededor y una indicación en una píldora (`.tl-capture__hint`). Estados: lista (guía `color-primary-text`), bien encuadrada (`is-ok`, `color-success-text`) y con problema (`is-error`, `color-danger-text`, con el motivo: «La foto salió borrosa»). La foto tomada es un recuadro rotulado (`.tl-capture__shot`). Abajo, siempre Buttons reales: «Tomar foto» (o «Tomar selfie») y «Elegir de la galería».
- **Ejemplo visual** (`.tl-docsample`, M8, VER-02 y VER-03): esquema del documento hecho con tokens (cédula por delante, por detrás con QR y las tres líneas, credencial con banda, y selfie con la silueta del ícono de persona). Lo que debe leerse se marca con `i.is-mark`. Nunca una foto ni datos de verdad. Tres juntos en `.tl-docsamples` con su rótulo.
