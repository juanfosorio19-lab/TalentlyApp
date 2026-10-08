# ReliabilityMeter

Cuánto cumple una persona con los turnos que le confirmaron: «Confiabilidad 96 % · 25 turnos cumplidos».

- Marcado completo: `.tl-reliab` > fila con «Confiabilidad» y el valor + barra `.tl-progress` (`role="meter"`) con avance `color-success` + nota que dice de dónde sale («Asistió a 25 de 26 turnos confirmados»).
- Compacto: `p.tl-reliab-inline` «Confiabilidad **96 %** · 25 turnos cumplidos».
- Lo alimenta solo «Asistió» / «No asistió», que marca quien publica después del turno (GES-04). No hay check-in, check-out ni marcaje con ubicación (M6). Un turno cancelado por la organización no cuenta.
- Se calcula con turnos confirmados: asistidos ÷ confirmados. Siempre con la cantidad al lado; nunca un porcentaje solo.
- Se muestra desde 3 turnos confirmados; antes dice «Aún sin turnos suficientes». Nunca un 100 % de partida.
