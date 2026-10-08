# ColorStatus

Los cuatro tonos semánticos (relleno, texto y fondo suave) en claro y oscuro, con contraste medido.

- Los rellenos `color-success`, `color-danger` y `color-info` son iguales en ambos temas y llevan `color-on-primary`. `color-warning` lleva `color-on-warning`.
- Texto e íconos de estado: siempre la variante `-text` (`color-success-text`, `color-warning-text`, `color-danger-text`, `color-info-text`). `color-warning` nunca va como texto o ícono sobre una superficie clara (2,04:1).
- Badge y Banner usan el fondo `-subtle` con el texto `-text` del mismo tono.
- Un solo rojo: `color-danger`. Un límite alcanzado («Máximo 3 oficios») es warning o neutro, nunca danger.
- `color-info` es solo para avisos informativos; no reemplaza al morado de marca.
- El estado nunca se comunica solo con color: Badge y Banner llevan siempre texto, y el Banner un ícono.
