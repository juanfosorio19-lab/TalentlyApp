# StepLayout

La plantilla de todo asistente (onboarding, publicar, reservar): un paso por pantalla con AppBar standard, ProgressStepper, título, contenido y CTA fijo abajo.

- Marcado: `.tl-steplayout` > AppBar standard (BackButton, «Paso X de N», IconButton ⋯) + `.tl-progress[role="progressbar"]` > `.tl-progress__bar` + `.tl-steplayout__body` (`h1.tl-steplayout__title.h1` + `p.tl-steplayout__sub` en Body-L `color-text-2` + contenido) + `.tl-ctabar` con «Continuar» (primary lg).
- ProgressStepper: barra de 4 px con `radius-xs`, riel `color-border`, avance `color-primary` (ancho = paso ÷ total).
- Pasos opcionales: «Omitir» como Button ghost aparte, debajo de «Continuar».
- Volver = paso anterior. Salir de un asistente de publicación pide «¿Descartar cambios?»; salir del onboarding pide «¿Salir del registro? Guardaremos lo que llevas» con «Seguir» / «Guardar y salir», porque ahí nada se pierde.
- El menú ⋯ abre una hoja con «Guardar y salir» y «Ayuda»; solo en el onboarding suma «Cerrar sesión» y «Eliminar cuenta» (en danger, con su confirmación).
- La verificación se pide cuando una acción la necesita, no en el onboarding.
- Contenido y CTA hasta 480 (`layout-content-max`), centrados en pantallas más anchas.
- Acceso (AUTH-02 a AUTH-06, agregado en M3): la misma plantilla sin ProgressStepper ni menú ⋯. El AppBar standard lleva solo el BackButton y el título va en el H1 del cuerpo.
