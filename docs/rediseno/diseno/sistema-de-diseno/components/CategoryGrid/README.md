# CategoryGrid

Grilla de 3 columnas con las 16 categorías del catálogo de oficios, cada una con su ícono. Se ve dentro de SHT-OFICIO cuando el buscador está vacío, debajo de «Oficios populares». Agregado en M3.

- Marcado: `ul.tl-catgrid` > `li` > `button.tl-cat` con `.tl-cat__tile` (ícono de categoría de 24 en un tile de 40, `color-primary-subtle`) y el nombre en 13/600, centrado, hasta 2 líneas.
- Tarjeta de alto mínimo 96, borde 1 `color-border`, `radius-lg`, fondo `color-surface`.
- Presionado: capa al 8 %. Foco: contorno 2 px `color-primary-text` + halo.
- Con oficios elegidos (`is-selected`): borde `color-primary-text`, fondo `color-primary-subtle` y «2 elegidos» en `.tl-cat__count`.
- Orden fijo del catálogo; Tecnología es una categoría más.
- Tocar una categoría abre la lista de sus oficios en la misma hoja, con el BackButton para volver a la grilla.
- Como selector de rubro (ONB-O1, hoja «Rubro»): tocar una categoría la elige y cierra la hoja. La elegida queda marcada (`is-selected`, `aria-pressed="true"`) sin contador.
- Cargando el catálogo: la misma grilla con un Skeleton de 96 y `radius-lg` por tarjeta, bajo Skeleton de chips para «Oficios populares». Sin resultados de búsqueda: EmptyState «No encontramos «…»» con «Sugerir este oficio».
