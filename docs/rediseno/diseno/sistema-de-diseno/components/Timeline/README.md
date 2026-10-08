# Timeline

Pasos de un proceso en vertical: punto, línea, etiqueta del diccionario y fecha en Caption. Se usa en PRC-01 (proceso de postulación) y SRV-02 (solicitud de servicio).

- Marcado: `ol.tl-timeline` > `li.tl-tstep` (`--done`, `--current` con `aria-current="step"`, o pendiente) > `.tl-tstep__dot` + `.tl-tstep__label` + `.tl-tstep__date`.
- Hechos: punto relleno `color-success` con check y etiqueta `color-success-text`. Actual: anillo y etiqueta `color-primary-text`. Pendientes: anillo y etiqueta `color-text-3`. La fecha va siempre en `color-text-3`.
- Etiquetas literales del diccionario (Postulado, Visto, En proceso, Entrevista, Oferta, Contratado…) y fechas en el formato único («7 dic · 21:14», «hoy · 11:30»). La entrevista lleva su fecha agendada («mar 15 dic · 10:00»).
- Los pasos pendientes van sin fecha (M5): nada que todavía no pasó lleva una fecha.
- **Niveles de verificación** (`tl-timeline--levels`, M8): la escalera de VER-01 (Cuenta básica · Teléfono verificado · Identidad verificada). Cada nivel lleva su estado en la línea de fecha («Verificado el 14 mar 2025», «Pendiente»), qué permite (`.tl-tstep__desc`) y, si falta, su acción real (`.tl-tstep__action`). Dos estados más: en revisión (`--review`, punto info con reloj) y rechazada (`--error`, punto danger con alerta, el motivo e «Intentar de nuevo»).
