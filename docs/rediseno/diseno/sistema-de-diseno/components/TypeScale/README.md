# TypeScale

La escala tipográfica de Talently en Inter, con un ejemplo real por estilo, en claro y oscuro.

- Aplica los estilos con sus clases de `tokens.css`: `.display`, `.h1`, `.h2`, `.h3`, `.body-l`, `.body`, `.label`, `.caption`, `.overline`, `.tab-label`, `.button-lg`, `.button-md`.
- Display solo en Bienvenida y en «¡Hicieron match!». H1 es el título de pestaña y de paso; H2 el de hoja inferior y sección; H3 el del AppBar standard y de tarjeta principal.
- Body-L para texto principal y valores de campo; como subtítulo de paso va en `color-text-2`.
- Label (13/600) es la etiqueta de campo, arriba del campo, en minúsculas salvo la primera letra.
- Overline siempre en mayúsculas (lo pone `bundle.css`). La etiqueta de pestaña es 11/500 sin mayúsculas.
- Solo pesos 400, 500, 600 y 700; nada bajo 11 px; el texto escala hasta 200 % sin cortarse.
