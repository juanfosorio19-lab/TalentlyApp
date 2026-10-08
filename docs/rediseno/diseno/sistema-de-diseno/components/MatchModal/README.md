# MatchModal

El aviso de match: cuando una organización o un hogar responde «Me interesa» a una postulación, aparece una vez sobre el velo (DET-03). Es el único modal que celebra; para confirmar se usa Dialog.

- Marcado: `.tl-scrim` + `.tl-match[role="dialog"][aria-modal="true"]` > `.tl-match__band` (`.tl-match__pair` con dos Avatar de 96) + `.tl-match__body` con `.tl-match__icon` (`IconMatchHeart` de 40), `h2.tl-match__title.display`, `p.tl-match__text.body-l` y `.tl-match__actions`.
- Tarjeta `color-surface-3`, `radius-xl`, `elev-brand`, márgenes laterales de 24 y centrada.
- Franja de 120 con `gradient-brand` y sin texto encima. Persona redonda a la izquierda, organización cuadrada a la derecha, con un aro de 4 del color de la tarjeta y 16 de solape.
- Texto literal: «¡Hicieron match!» en Display y «{Organización} quiere conversar contigo sobre {publicación}» en Body-L.
- Acciones: Button primary lg de ancho completo «Enviar mensaje» (abre la conversación, MSG-02) y ghost lg «Seguir explorando» (cierra). Tocar el velo o el botón atrás equivale a «Seguir explorando».
- Sin confeti ni animación en bucle: entra una vez con `duration-slow` y `ease-spring`.
