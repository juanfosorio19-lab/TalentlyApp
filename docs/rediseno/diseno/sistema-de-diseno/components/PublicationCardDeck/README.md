# PublicationCard · Deck (EXP-01)

La tarjeta del deck de empleos: la PublicationCard completa, más grande, sobre una pila.

- Marcado: `.tl-deck` > `article.tl-pub.tl-deck__card` + `.tl-actionpair` debajo. `.tl-deck::before` deja ver 12 px de la tarjeta siguiente.
- `color-surface-3` con `elev-3` y sin borde (es la única tarjeta con elev-3). Avatar de 56, nombre en 16, alto que llena el espacio entre el SegmentedControl y el ActionPair.
- Suma el bloque «Requisitos» con el estado para esta persona («Tienes tu credencial SPD vigente», en success). «Por qué ves esto» queda al pie.
- Sin CTA: decide el ActionPair. Tocar la tarjeta abre DET-01.
- Arrastre: a la derecha, sello «Me interesa» (`color-primary-subtle`, borde `color-primary-text`); a la izquierda, «No me interesa» (`color-surface-2`, borde `color-border-strong`). Nunca LIKE ni NOPE. La tarjeta gira 4° y vuelve con `ease-spring`.
- Personas sugeridas (M7, GES-03 y EXP-05): el mismo Deck, la misma tarjeta y el mismo ActionPair con contenido de persona. Avatar redondo, nombre y su nivel de verificación; el oficio principal como título; años de experiencia y datos del oficio en InfoTag; «Pretensión: $650.000 líquidos al mes» (o «A convenir»); nota y Confiabilidad; comuna y distancia; los requisitos de la oferta con su estado para esta persona y «Por qué ves esto». Nunca la edad. «Me interesa» invita a postular (Snackbar «Invitaste a Jorge a postular · Deshacer»). En F3, un perfil impulsado sale primero con «Destacado» arriba a la derecha; en Postulantes el impulso no cambia el orden ni muestra la etiqueta.
- Siguiente tarjeta (M5): mientras se arrastra, la oferta que viene queda debajo, completa y quieta (`.tl-deck__card--next`: absoluta, sin sombra, 96 % de tamaño y 12 px más abajo, oculta para el lector). Así se ve qué sigue antes de soltar.
- Atajo al deck (M4, INI-01 «Empleos para ti»): la PublicationCard compacta de la primera oferta dentro de `.tl-deck`, con la pila de 12 px debajo. Tocarla abre EXP-01 con esa tarjeta arriba (no DET-01). En Inicio no va el ActionPair: se decide en el deck o en el detalle.
