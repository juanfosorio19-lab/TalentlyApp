# Dialog

Ventana de confirmación, solo para confirmaciones («¿Descartar cambios?»). Para elegir o filtrar se usa BottomSheet.

- Marcado: `.tl-scrim` + `.tl-dialog[role="alertdialog"][aria-modal="true"]` > `h2.tl-dialog__title` + `p.tl-dialog__body` + `.tl-dialog__actions`.
- `color-surface-3`, `radius-xl`, `elev-3`, padding 24, márgenes laterales de 24, centrado; velo `color-scrim`.
- Título en pregunta, cuerpo en una o dos frases que dicen la consecuencia, y dos acciones a la derecha: la que no destruye en ghost («Seguir editando», «Cancelar») y la que confirma en danger si destruye («Descartar», «Eliminar») o en primary si no («Pausar»).
- El botón atrás de Android y tocar el velo equivalen a la acción que no destruye.
- **Web** (`tl-dialog--web`, M11): en el backoffice de escritorio, un Dialog centrado de 560 con cabecera (H2 + Cerrar), contenido que se desplaza y acciones a la derecha. Ahí también confirma acciones con motivo («Rechazar con motivo», «Pedir otro documento», «Escalar», «Suspender preventivamente», «Descartar»), lo que en el teléfono sería una hoja. Ver la tarjeta ReviewPanel.
