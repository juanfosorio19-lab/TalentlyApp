# Badge

Etiqueta de estado: alto 24, 12/600, `radius-full`, fondo `-subtle` del tono y texto `-text` del mismo tono. Siempre con texto en español del diccionario; nunca un código («part_time»).

- Tonos: neutral (`color-surface-2` + `color-text-2`), primary, info, success, warning, danger (`tl-badge--…`).
- Cada etiqueta usa siempre el mismo tono (tarjeta se ve en la tarjeta): Postulado e Invitado en info; En proceso, Entrevista y Oferta en primary; Confirmado, Contratado y Verificada en success; En lista de espera, Pausada, Pendiente de pago y Vence en 30 días en warning; Rechazada, Vencida y No asististe en danger; Visto, Cerrada y Expirada en neutral.
- «Nuevo» (algo que aún no se ha visto) va en primary. Solicitud de servicio, que el maestro no tonifica: Solicitado info · Cotizado y Aceptado primary · Reservado y Realizado success · Cerrado y Cancelado neutral · En disputa warning.
- Estado de pago (M10, F3): Pendiente de pago warning · Pagado success · Reembolsado neutral. Va junto al monto (sección «Pago» y desglose), nunca en lugar del estado de la solicitud.
- No es interactivo y no se parece a VerificationBadge ni a PromotedBadge «Destacado».
- El estado nunca depende solo del color: la palabra siempre está.
