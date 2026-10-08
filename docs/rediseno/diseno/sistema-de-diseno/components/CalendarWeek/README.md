# CalendarWeek

La Agenda de Actividad en dos vistas: Semana (tira de 7 días con la agenda debajo) y Día (horas con los bloques del día). Se cambia con un SegmentedControl «Día · Semana».

- Marcado: `.tl-week` con 7 `button.tl-week__day` (día de la semana, número y punto `.tl-week__dot` si hay algo). Hoy lleva `aria-current="date"` y anillo `color-primary-text`; el elegido, `color-primary-subtle`.
- Semana: bajo la tira, cada día con su fecha en Overline y sus eventos `.tl-event` (hora de inicio y fin, título «Turno · Garzón», organización y comuna, Badge del diccionario).
- Día: `.tl-dayview`, horas de 48 px con divisores `color-border` y bloques `.tl-dayview__event` en `color-primary-subtle` con borde `color-primary-text`. Sin bordes de acento de color.
- Muestra solo compromisos reales (Confirmado) y lo pendiente con su estado (Postulado).
- Ícono del tipo (M4): cada evento lleva antes del título el ícono de la publicación de donde viene, a 20 px en `color-text-2` (16 px en el bloque de la vista Día, `.tl-dayview__title`): Turno IconClock, Entrevista de un empleo IconOffers, Clase IconBook (desde F2), Visita de un servicio IconTool (desde F3). En F1 solo hay turnos y entrevistas.
- El mismo `.tl-event` se usa fuera de la Agenda cuando se muestra un compromiso: «Hoy en tu agenda» y «Tus próximas clases» en INI-01.
