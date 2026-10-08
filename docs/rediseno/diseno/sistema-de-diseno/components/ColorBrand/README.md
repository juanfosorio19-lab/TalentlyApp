# ColorBrand

El morado de marca, sus derivados, los dos gradientes y el foco, en claro y oscuro con contraste medido.

- `color-primary` (#6D4AFF) es el único primario; el azul #1392EC no existe. Rellena el Button primary, el Switch encendido, Checkbox y Radio marcados y la burbuja propia, siempre con `color-on-primary` encima (5,15:1).
- Texto, íconos y links morados: `color-primary-text`. Es también el borde de selección de OptionCard y Chip: en oscuro #A78BFA sobre #2A2148 da 5,47:1, mientras que #6D4AFF daría 2,89:1.
- Sobre `color-primary-subtle` el texto es siempre `color-on-primary-subtle`.
- `gradient-brand` y `gradient-hero-dark` son solo decorativos (logo, hero de Bienvenida, franja del modal de match). Nunca de fondo en un botón y nunca con texto encima: blanco sobre #B48CFF da 2,58:1.
- `focus-ring` no llega a 3:1 por sí solo (1,67:1 claro, 2,35:1 oscuro). Todo foco = contorno sólido de 2 px en `color-primary-text` más el halo (clase `tl-focus`).
- `color-primary-hover` existe pero no se usa: la app es táctil y no se diseña hover.
