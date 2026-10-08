# RatingStars

La nota de reseñas: estrella + nota con coma + cantidad entre paréntesis, siempre visible («4,8 (23)»).

- Marcado: `.tl-rating[role="img"]` con `aria-label` («Nota 4,8 de 5, 23 reseñas») > `IconStar` + nota + `.tl-rating__count`. `tl-rating--lg` en el perfil.
- La estrella va en `color-warning-text` (ámbar); no es un aviso, es la convención de estrellas.
- Sin reseñas: «Sin reseñas aún», nunca «0,0» ni una nota inventada.
- Las reseñas solo existen después de una transacción real (turno asistido, clase o servicio realizado).
- Para calificar (`.tl-stars`): 5 IconButtons de 44 con `role="radio"`; las elegidas en ámbar y las demás en `color-text-3`, más el texto «4 de 5 · Muy bien», para no depender solo del color.
- Grandes (`.tl-stars--lg`, M6): botones de 56 con estrellas de 40, en la evaluación al cerrar el turno (REV-01).
