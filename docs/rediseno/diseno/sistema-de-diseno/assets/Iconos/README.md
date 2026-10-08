# Iconos

Set único de Talently: outline de 24 px, trazo 1,8, puntas y uniones redondeadas. Tinta: `currentColor`, por eso esta vista de assets los muestra en negro; en la app se insertan inline y toman el color del texto (`color-text`, `color-text-2`, `color-text-3` o `color-primary-text`).

- Los 14 oficiales (IconHome, IconOffers, IconSearch, IconChat, IconPerson, IconMatches, IconHeart, IconMatchHeart, IconBell, IconFilter, IconClose, IconCloseCircle, IconLike, IconMore) son copia exacta de la sección 10.3 del maestro.
- Los demás son nuevos, en el mismo estilo; algunos llevan un acento de relleno del mismo color entre 18 % y 55 %.
- `icons.json` reúne todos los íconos (también Oficios y Clases) con su SVG completo, su grupo y su uso: es la fuente para insertarlos inline.
- IconFilter rellena sus perillas con `var(--color-surface)`: se usa solo sobre `color-surface` (AppBar de Explorar).
- IconGear (rueda dentada) = Ajustes, solo en el AppBar de Perfil. IconFilter (sliders) = Filtros, solo en Explorar.
