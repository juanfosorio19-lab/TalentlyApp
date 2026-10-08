# ResultScreen

Pantalla completa que confirma el resultado de una acción importante (postular, publicar, verificarse, pre-registrarse). Un solo mensaje por pantalla.

- Marcado: `.tl-result.tl-result--success|info|error` > `.tl-result__main` (`role="status"`) con `.tl-result__icon` (círculo de 72 con ícono de 40), `h1.tl-result__title.h1` y `p.tl-result__text` (Body-L en `color-text-2`) + `.tl-ctabar` con el CTA.
- Colores semánticos fijos: éxito `IconCheck` en `color-success-text` sobre `color-success-subtle`; información `IconInfo` en `color-info-text` sobre `color-info-subtle`; error `IconAlert` en `color-danger-text` sobre `color-danger-subtle`.
- Abajo, el CTA fijo (`.tl-ctabar`): un Button primary lg de ancho completo y, si hace falta, uno ghost. Solo el CTA fijo compensa la barra de gestos.
- El texto dice qué pasó y qué viene, sin métricas inventadas ni promesas.
