# ActionPair

El par de decisión: «No me interesa» (círculo outline de 56 con `IconClose`) y «Me interesa» (círculo `color-primary` de 64 con `IconLike`), con la etiqueta debajo. Es el mismo par, con la misma reacción, en el deck de empleos, el detalle y Personas sugeridas.

- Marcado: `.tl-actionpair` > dos `button.tl-ap` (el segundo `tl-ap--yes`) > `.tl-ap__btn` (ícono de 32) + etiqueta 14/500.
- En Personas sugeridas, «Me interesa» envía la invitación a postular y muestra el Snackbar «Invitaste a Jorge a postular · Deshacer».
- Nunca «LIKE» ni «NOPE»: siempre «Me interesa» / «No me interesa».
- Presionado: «Me interesa» pasa a `color-primary-pressed`; «No me interesa» suma una capa al 12 %. Cargando: spinner en el círculo.
- El swipe del deck usa `ease-spring`; los botones hacen lo mismo que el swipe.
