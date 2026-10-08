# ColorNeutral

Superficies, texto y bordes en claro y oscuro, con su hex y el contraste medido en vivo desde `tokens.css`.

- Pantalla en `color-bg`; tarjetas, campos y barras en `color-surface`; fondos secundarios (SearchField, SegmentedControl, burbuja ajena, deshabilitado) en `color-surface-2`; hojas y diálogos en `color-surface-3`.
- Texto: `color-text` principal, `color-text-2` secundario, `color-text-3` para ayudas y pestaña inactiva. `color-text-3` cumple justo (4,55:1 sobre `color-surface-2` en claro, 4,76:1 sobre `color-surface-3` en oscuro): nunca por debajo de 12 px.
- `color-text-disabled` solo sobre `color-surface-2` en controles deshabilitados; nunca baja la opacidad de un control.
- `color-border` es decorativo (tarjetas elev-0, divisores). Todo control usa `color-border-strong`.
- En oscuro `color-border-strong` sobre `color-surface-3` mide 2,85:1: un campo dentro de una hoja conserva su relleno `color-surface` (borde contra relleno 3,49:1).
