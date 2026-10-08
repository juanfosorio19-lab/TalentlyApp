# LegalDocument

Plantilla de los textos legales (LEG-01 Términos y LEG-02 Privacidad), agregada en M8. Es una pantalla apilada con AppBar standard.

- Marcado: `article.tl-legal` > `header` (H1 + `p.tl-legal__updated`, una sola fecha: «Actualizados el 1 dic 2026») + `nav.tl-legal__index` (Overline «En esta página» y `ul.tl-list` con un ListItem por sección, que baja a su ancla) + `section.tl-legal__section` (H2 numerado + párrafos y listas en Body-L 16/24 `color-text`).
- Las secciones dejan espacio para el AppBar al bajar (`scroll-margin-top: layout-appbar`).
- Lenguaje simple y frases cortas, como el resto de la app. Ancho máximo de lectura `layout-content-max`; la letra escala con el teléfono.
- Una sola fecha por documento: nada de «última modificación» por sección.
