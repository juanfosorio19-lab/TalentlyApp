# SheetPicker

Hoja inferior para elegir de una lista larga (comuna, oficio, materia, unidad): título H2, botón cerrar, SearchField fijo arriba y la lista con Radio a la derecha.

- Marcado: `.tl-scrim` + `.tl-sheet[role="dialog"]` con `.tl-sheet__handle` (asa de 32×4 que sí arrastra), `.tl-sheet__head` (H2 + IconButton Cerrar), `.tl-sheet__search` y `.tl-sheet__body` con filas `label.tl-choice.tl-choice--row` (alto 56, divisor `color-border`).
- Elegir una opción en una lista de elección única cierra la hoja y deja el valor en el Select. En elección múltiple (oficios), la hoja lleva pie con «Listo» y el contador «2 de 3».
- El buscador filtra mientras se escribe, resalta la coincidencia en negrita y acepta sinónimos; al abrir, la lista se desplaza hasta la opción elegida.
- Sin resultados: ícono del set, mensaje en dos líneas y «Borrar búsqueda» (Button ghost sm).
- Se cierra con Cerrar, tocando el velo, arrastrando el asa o con el botón atrás de Android.
- La hoja usa `color-surface-3`, `radius-xl` arriba y `elev-3`; el asa va en `color-text-3` (4,76:1 sobre `color-surface-3` oscuro).
