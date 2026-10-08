# Avatar

Imagen de persona u organización en 4 tamaños: 32, 40 (por defecto), 56 y 96.

- **Persona = redondo** (`tl-avatar`). **Organización = cuadrado** (`tl-avatar tl-avatar--org`, `radius-md`; `radius-sm` en 32 para que se siga leyendo cuadrado). Incluye «Familia en …». En todas las vistas.
- Sin foto: iniciales en `color-on-primary-subtle` sobre `color-primary-subtle` (12, 14, 20 y 32 px). Con foto: `img` que llena el contenedor.
- **Con foto** (`tl-avatar--photo` > `.tl-avatar__ph`, M10): prestadores de servicios, donde la foto es obligatoria (DET-01 Servicio, PublicationCard de servicio, conversación). En la app es la foto real (`img`); en los mockups, el marcador rayado de la galería.
- Punto de verificación opcional (`.tl-avatar__verify`): escudo `IconShield` en `color-success-text` sobre un círculo `color-surface`. Solo con verificación real (teléfono, identidad u organización); nunca decorativo.
- No es interactivo por sí mismo. Siempre va acompañado del nombre; si va solo, lleva `role="img"` y `aria-label`.
- La edad, el sexo o la apariencia nunca se infieren ni se muestran.
