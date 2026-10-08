# Button

El único botón de Talently: 5 variantes, 3 tamaños, ícono opcional y ancho completo. Hoy hay 14 versiones en la app: esta las reemplaza a todas.

- Marcado: `<button class="tl-btn tl-btn--primary tl-btn--lg"><span class="tl-btn__label">Tomar turno</span></button>`. Variantes `--primary` (por defecto), `--tonal`, `--outline`, `--ghost`, `--danger`. Tamaños `--lg` (52, 16/600, padding 20), md por defecto (44, 14/600, padding 16), `--sm` (36, 14/600, padding 12, área táctil 48). `--block` para ancho completo.
- primary: sólido `color-primary` con `color-on-primary`, sin gradiente ni sombra. Una sola acción principal por pantalla.
- tonal: `color-primary-subtle` con `color-on-primary-subtle`. outline: borde 1,5 `color-border-strong`, texto `color-text`. ghost: solo texto `color-primary-text` («Omitir» en pasos opcionales). danger: sólido `color-danger`; siempre abre un Dialog antes de destruir.
- No existe «danger ghost»: una acción destructiva secundaria al pie de una pantalla es un ListItem danger que abre un Dialog.
- Ícono: `<span class="tl-icon">` antes o después de la etiqueta (20 px en lg y md, 16 px en sm). Radio `radius-md`.
- Presionado: primary pasa a `color-primary-pressed`; las otras variantes suman una capa de su color de texto al 12 %. Foco: contorno 2 px `color-primary-text` + halo. Deshabilitado (`disabled`): `color-surface-2` con `color-text-disabled`, nunca opacidad. Cargando (`is-loading` + `<span class="tl-btn__spinner tl-spinner">`): spinner centrado, mismo ancho, sin texto ni flecha.
- Quien consume provee la etiqueta en infinitivo («Continuar», «Postular», «Tomar turno»), el tipo de botón y su acción real: no hay botones fantasma.
- Ingreso con otro servicio (agregado en M3): Button outline lg de ancho completo con `<span class="tl-btn__logo">` de 20 a la izquierda. Ahí va el logo oficial del servicio tal como lo entrega (hoy solo «Continuar con Google»); en los mockups es un recuadro rotulado. Deshabilitado, el logo pasa a gris.
- Separador «o» (`p.tl-divider`): línea `color-border` a cada lado y la «o» en Caption `color-text-2`. Solo entre el ingreso con otro servicio y el formulario.
