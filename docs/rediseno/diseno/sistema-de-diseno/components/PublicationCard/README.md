# PublicationCard

La tarjeta de toda publicación: Empleo, Turno, Servicio y Clase. Una sola estructura; por tipo solo cambia el contenido.

- Marcado: `article.tl-pub` (+ `tl-pub--compact`) > `.tl-pub__head` (Avatar + `.tl-pub__by` + PromotedBadge opcional + `.tl-pub__trust` con VerificationBadge) · `h3.tl-pub__title > a.tl-pub__link` · `ul.tl-tags.tl-pub__tags` (InfoTag) · `p.tl-pub__amount` (Amount) · `ul.tl-pub__facts` (dato del tipo y lugar) · `p.tl-pub__why` · `.tl-pub__cta` (Button tonal md a lo ancho).
- Orden fijo: cabecera · título · InfoTag · Amount · dato del tipo · lugar · «Por qué ves esto» · CTA. Si un tipo no tiene un dato, la parte no aparece; nada cambia de lugar.
- Toda la tarjeta abre DET-01: el enlace del título se estira sobre la tarjeta. La VerificationBadge y el CTA quedan por encima y se tocan aparte.
- Variantes:
  - Completa: EXP-02, EXP-03, EXP-04 y la vista previa al publicar (PUBL-02 a PUBL-06).
  - Compacta: INI-01, EXP-01 (vista lista), EXP-07, PRF-02 y PRF-11. Título 16, hasta 2 InfoTag, sin «Por qué ves esto» ni CTA.
  - Deck: EXP-01. Ver PublicationCardDeck.
- Premium (F3): la misma tarjeta con PromotedBadge «Destacado» arriba a la derecha. No cambian colores, borde, sombra, tamaño ni orden. Ver PublicationCardPremium.
- CTA: Button tonal md a lo ancho. Tonal porque en una lista habría varios primarios; a lo ancho porque a 360 un botón sm al lado del monto lo corta en dos líneas. El primario está en el detalle (CTA fijo).
- Estados: presionado (capa 8 %), foco (contorno + halo), cargando (Skeleton de tarjeta; el CTA muestra su spinner). No se selecciona ni se deshabilita: una publicación cerrada sale de la lista y un turno lleno dice «Cupos completos» con «Unirme a la lista de espera».
- Organización con avatar cuadrado; persona con avatar redondo. Sin foto de stock: logo real o iniciales.
