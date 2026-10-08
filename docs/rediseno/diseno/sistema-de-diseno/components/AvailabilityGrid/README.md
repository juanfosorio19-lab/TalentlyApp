# AvailabilityGrid

Grilla de disponibilidad: 7 días × 4 franjas, con celdas tocables de 48 de alto.

- Franjas del diccionario: Mañana (07–13), Tarde (13–19), Noche (19–01), Madrugada (01–07). Los días van en filas (Lun a Dom) y las franjas en columnas, para que quepa en 360 sin achicar las celdas.
- Marcado: `.tl-avail[role="group"]` con encabezados `.tl-avail__colh` / `.tl-avail__rowh` y celdas `button.tl-avail__cell[aria-pressed]` con `aria-label` («Sáb, Noche»).
- Celda libre: `color-surface` con borde `color-border-strong`. Elegida: `color-primary-subtle`, borde `color-primary-text` y check de 16.
- Contador arriba («5 franjas»). Error: «Elige al menos una franja».
- Se usa en onboarding (Trabajo), Perfil y filtros, siempre igual.
