# BottomSheet

Hoja inferior para filtros, elecciones y acciones contextuales: `color-surface-3`, `radius-xl` arriba, `elev-3`, sobre el velo `color-scrim`. Capas: velo `z-scrim`, hoja `z-modal`.

- Marcado: `.tl-scrim` + `.tl-sheet[role="dialog"][aria-modal="true"]` > `.tl-sheet__handle` + `.tl-sheet__head` (H2 + IconButton Cerrar) + `.tl-sheet__search` opcional + `.tl-sheet__body` (secciones `.tl-sheet__section` con etiqueta Label) + `.tl-sheet__foot` opcional.
- Asa de 32×4 en `color-text-3` que sí arrastra: hacia abajo cierra; hacia arriba expande hasta debajo del AppBar.
- Pie con hasta 2 acciones de igual ancho: secundaria ghost («Limpiar») y primaria con resultado concreto («Ver 12 turnos»).
- Se cierra con Cerrar, tocando el velo, arrastrando el asa o con el botón atrás de Android (paso 1 de su orden). Si hay cambios sin aplicar, no se pierden: el filtro se aplica solo con el botón del pie.
- Abre y cierra con `duration-slow` y `ease-standard`.
- Es el único BottomSheet de la app; SheetPicker es esta misma hoja con buscador y lista.
- Menú ⋯ de una conversación (M5): la misma hoja con ListItems «Ver publicación», «Reportar» y «Bloquear» (danger, abre un Dialog). Igual que el menú del registro (ONB-MENU).
- Reportar (SHT-REPORTE, M5): Radio con los motivos tipificados en este orden (Acoso, Estafa o cobro, Discriminación, Suplantación, Menor en riesgo, Agresión, Otro), TextArea opcional y «Enviar reporte», deshabilitado hasta elegir un motivo.
- Compartir certificado de antecedentes (MSG-02b, M5): texto «Compartirlo es voluntario…», OptionCard single «Usar el que ya subí (emitido el 30-11-2026)» / «Subir uno nuevo» y «Compartir».
