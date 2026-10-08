# SlotPicker

Para elegir día y hora de una reserva (Clases en F2; Servicios en F3): tira horizontal de 14 días y, debajo, las horas libres de ese día en chips.

- Marcado: `.tl-slots` > `.tl-slots__days` (scroll horizontal con imán) con `button.tl-day[aria-pressed]` (día de la semana + número; «hoy» en el primero) + `.tl-slots__times` con Chips filter de elección única.
- Día: 56 × 72, `radius-md`, borde `color-border-strong`. Elegido: `color-primary-subtle` + borde `color-primary-text`. Sin horas: `color-surface-2` y `color-text-disabled`, sin poder elegirse. Hoy queda sin horas si la anticipación mínima de quien enseña no alcanza.
- Solo muestra horas realmente libres: descuenta las clases ya reservadas y el descanso entre clases. Si una se ocupa mientras reservas, vuelves a RES-01 con el Snackbar «Este horario se acaba de ocupar. Elige otro» y la hora ya no está.
- **Adelanto** (`tl-slots--peek`, M9): en DET-01 Clase, bajo el detalle. «Próximos horarios libres» con «Ver 14 días», el día (`.tl-day` elegido, informativo) y sus 3 próximas horas en chips que abren RES-01 con esa hora elegida.
- **Sin horas en 14 días** (`.tl-slots__empty`, M9): todos los días en gris y, debajo, ícono, «Camila no tiene horarios libres en los próximos 14 días», «Te avisamos cuando abra horas nuevas.» y Button tonal «Avisarme» (luego, Snackbar «Te avisaremos cuando Camila abra horarios»).
- Debajo, el resumen de lo elegido («jue 11 mar · 17:00–18:00 · Online») con Amount y el CTA fijo.
