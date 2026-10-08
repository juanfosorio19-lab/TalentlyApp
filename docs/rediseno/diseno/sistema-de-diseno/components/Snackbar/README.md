# Snackbar

Respuesta temporal a una acción: Toast si es solo un mensaje, Snackbar si trae acción («Deshacer», «Reintentar»). Aparece sobre la TabBar (capa `z-toast`), de a uno.

- En una pantalla apilada sin TabBar ni CTA fijo (NOT-01, por ejemplo), `tl-snackbar--no-tabbar` lo baja al borde inferior, sobre la barra de gestos (agregado en M2).
- Con un CTA fijo (StepLayout) o dentro de una hoja con pie, va con `tl-snackbar--static` justo encima del botón: dentro de `.tl-ctabar` o sobre `.tl-sheet__foot`. Así nunca tapa el CTA (agregado en M3, ONB-T2 y SHT-OFICIO).
- En una conversación va sobre el Composer, a la misma altura que sobre la TabBar, porque ambos miden lo mismo con la barra de gestos («Recibimos tu reporte. Lo revisaremos.», M5).

- Marcado: `.tl-snackbar` (+ `--success` o `--error`) > `.tl-snackbar__icon` + `.tl-snackbar__text` + Button ghost sm opcional. `role="status"` (info y éxito) o `role="alert"` (error).
- `color-surface-3` con borde `color-border`, `radius-md` y `elev-3`. Ícono del tono: info `IconInfo` en `color-info-text`, éxito `IconCheck` en `color-success-text`, error `IconAlert` en `color-danger-text`.
- Texto en Body 14, una o dos líneas, humano: «Publicación pausada», «Invitaste a Jorge a postular», «No pudimos guardar. Revisa tu conexión e intenta de nuevo.».
- Duración: 4 s sin acción; 8 s con acción o hasta que se toque. No tapa la TabBar ni el CTA fijo.
- Es solo la respuesta temporal: un aviso que debe quedarse (sin conexión, verificación pendiente) es un Banner.
- **Web** (`tl-snackbar--web`, M11): en el backoffice de escritorio va abajo a la izquierda del contenido, nunca sobre la SideNav, con el mismo marcado y duración («Aprobaste la credencial SPD de Andrés Carrasco · Deshacer»).
