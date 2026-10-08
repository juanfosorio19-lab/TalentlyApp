# Card

El contenedor base: `color-surface`, borde 1 px `color-border`, `radius-lg`, padding 16 y sin sombra (elev-0). Así van las tarjetas en listas.

- Marcado: `div.tl-card` (informativa) o `button.tl-card.tl-card--action` (tocable, abre un detalle; con `IconChevronRight` cuando lleva a otra pantalla).
- Presionado: capa `color-text` al 8 %. Foco: contorno 2 px `color-primary-text` + halo.
- Para publicaciones se usa PublicationCard (Lote 6), que es una Card con estructura fija. Para elegir, OptionCard. La tarjeta del deck es la única con `elev-3`.
- Organización con avatar cuadrado, persona con avatar redondo; los datos con el mismo ícono y formato que en el detalle.
- Estado de verificación de la organización (M7, GES-01 e INI-02): Card informativa con tile `IconShield`, «Verificación de tu organización», VerificationBadge del estado, lo que habilita («Hasta verificar: 1 publicación activa; los turnos se publican cuando te verifiquemos») y Button tonal sm a VER-04. Solo mientras no está verificada.
