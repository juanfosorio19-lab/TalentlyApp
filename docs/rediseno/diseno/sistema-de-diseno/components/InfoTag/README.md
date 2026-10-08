# InfoTag (nuevo en L6)

Un dato clave de una publicación con su ícono: jornada, contrato, fecha, modalidad. Son los «chips de info con ícono» que pide PublicationCard, y se ven igual en el detalle (DET-01).

- Marcado: `ul.tl-tags` > `li.tl-tag` (ícono de 16 + texto). Alto 28, radio sm (8), fondo `color-surface-2`, texto Body 14 en `color-text-2`, sin borde.
- No se toca: no es un Chip (pill de 36 con borde, para filtrar o elegir) ni un Badge (estado, 12/600 con tono).
- Un ícono por tipo de dato, no por valor:
  - Jornada: `IconClock`.
  - Contrato o forma de contratación: `IconDocument`.
  - Fecha, horario o sistema de turno: `IconCalendar`.
  - Modalidad: `IconLocation`.
  - Clase de prueba: `IconBook`.
- Textos del diccionario 7.3, literales. Nunca un código ni un texto en inglés.
- Se agregó porque los chips de datos no podían ser Chip (se tocan) ni Badge (son estados).
