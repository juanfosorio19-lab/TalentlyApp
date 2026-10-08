# Banner

El único componente para todo aviso que se queda en pantalla (aviso info, warning, fijo o educativo), incluido «Sin conexión. Mostramos lo último que cargaste».

- Marcado: `.tl-banner` (+ `--success`, `--warning`, `--danger`) > `.tl-banner__icon` (ícono de 20) + `.tl-banner__text` + Button ghost sm opcional.
- Fondo `-subtle` del tono, texto Body 14 en `color-text`, ícono en el `-text` del tono: `IconInfo` en info y éxito, `IconAlert` en warning y danger. `radius-md`, padding 12, sin sombra.
- Aviso fijo (`--fixed`): de borde a borde, bajo el AppBar, sin radio.
- `role="status"` (info, éxito, warning) o `role="alert"` (danger).
- No se cierra solo: desaparece cuando la situación cambia. La respuesta temporal a una acción es un Snackbar, no un Banner.
- **Con contador** (`.tl-banner__timer`, M9): en RES-02 (F3) «Te guardamos el horario por 10 minutos…» con el tiempo que queda («09:42») a la derecha, en 16/600 con cifras tabulares y `role="timer"`.
