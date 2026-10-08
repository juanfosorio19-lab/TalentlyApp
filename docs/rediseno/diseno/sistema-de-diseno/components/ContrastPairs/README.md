# ContrastPairs

Los pares de color que fijan reglas del sistema, medidos en vivo en claro y oscuro.

- Button primary: blanco sobre `color-primary`, 5,15:1 en ambos temas.
- Borde de selección: `color-primary-text` sobre `color-primary-subtle` (5,55:1 claro, 5,47:1 oscuro). `color-primary` como borde daría 2,89:1 en oscuro y queda descartado.
- Ningún texto sobre `gradient-brand`: blanco sobre su extremo #B48CFF da 2,58:1.
- Foco: el halo `focus-ring` solo no cumple 3:1; el contorno sólido `color-primary-text` sí (6,42:1 y 6,67:1). Por eso el foco usa ambos.
- Campo dentro de una hoja en oscuro: el borde contra `color-surface-3` da 2,85:1; el campo conserva relleno `color-surface` y su borde mide 3,49:1 contra él.
- `color-text-3` cumple justo en su peor fondo; no se usa bajo 12 px.
- Advertencia como texto o ícono: siempre `color-warning-text`, nunca el relleno `color-warning`.
