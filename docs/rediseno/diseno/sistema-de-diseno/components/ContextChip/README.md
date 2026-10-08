# ContextChip

Chip que dice de qué publicación habla una conversación: tipo · título corto · fecha («Turno · Garzón · sáb 12 dic»). Va arriba del chat y en la lista de Mensajes.

- Marcado: `button.tl-ctxchip` > ícono del tipo (16) + `.tl-ctxchip__text` + `IconChevronRight` (16). Pill de 36, `color-surface-2`, texto 13/600; se corta con «…».
- El tipo se distingue por ícono y etiqueta, sin color propio: Empleo `IconOffers`, Turno `IconClock`, Clase `IconBook` (F2), Servicio `IconTool` (F3).
- Al tocarlo abre el detalle de la publicación (presionado al 8 %, foco con contorno).
- Fechas en el formato único: «sáb 12 dic».
- En la conversación va fijo bajo el AppBar, en `.tl-chat__context` (padding 8 × 16, `color-bg`, borde inferior `color-border`). En Mensajes va dentro de la fila (`tl-listitem--chat`), sin chevron (M5).
