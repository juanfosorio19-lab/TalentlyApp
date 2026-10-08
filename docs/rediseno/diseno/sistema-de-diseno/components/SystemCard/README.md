# SystemCard

Tarjeta de sistema dentro del chat, de ancho completo y nunca una burbuja: muestra un hecho de la plataforma (entrevista agendada, documento compartido, cotización).

- Marcado: `.tl-syscard[role="group"]` > `.tl-syscard__tile` (ícono de 40 en `color-primary-subtle`) + `.tl-syscard__body` con `.tl-syscard__title` (16/600), líneas `.tl-syscard__meta` con ícono de 16 y `.tl-syscard__actions` (Buttons sm).
- `color-surface`, borde `color-border`, `radius-lg`, padding 16.
- Cuando se resuelve, un Badge del diccionario («Confirmado») reemplaza a las acciones.
- Un documento compartido dice quién lo compartió, cuándo, qué es y quién lo ve. No muestra «Verificado» si Talently no lo verificó.
- La entrevista agendada se ve igual en la conversación (MSG-02) y en el proceso de la postulación (PRC-01), con «Agregar al calendario» (M5).
- Certificado de antecedentes (MSG-02b, M5): `IconDocument`, «Certificado de antecedentes», «Emitido el 30-11-2026» (con más de 30 días, `.tl-syscard__meta--warning`: «Emitido hace 45 días»), «Documento subido por la persona, sin verificar» o el VerificationBadge si Talently lo verificó, y hasta cuándo está disponible (7 días). La otra parte ve «Ver»; quien lo compartió ve «Visto por Familia en Ñuñoa · hace 2 h» y «Dejar de compartir».
- **Cotización** (M10, SRV-02): `IconMoney`, «Cotización», el total en Amount lg (`.tl-syscard__amount`) con «Total, con materiales» (`.tl-syscard__note`), qué incluye, día y hora, y «Válida hasta el dom 20 jun»; acciones «Rechazar» (outline sm) y «Aceptar» (primary sm, abre el pago). Aceptada: Badge «Aceptado». Vencida: la vigencia pasa a `.tl-syscard__meta--warning` («Venció el dom 20 jun») y la acción es «Pedir nueva cotización».
- Ya no disponible (`tl-syscard--off`): vencido, revocado o cortado por bloqueo o eliminación de la cuenta. `color-surface-2` y `color-text-disabled` con «Ya no está disponible», sin acciones y sin bajar la opacidad.
