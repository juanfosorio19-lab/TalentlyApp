# ChipGroup

Grupo de chips con etiqueta, contador y máximo («2 de 3»).

- Marcado: `.tl-chipgroup[role="group"]` > `.tl-chipgroup__head` (`.tl-chipgroup__label` + `.tl-chipgroup__count` con `aria-live`) + `.tl-chipgroup__chips` + notas `--max` y `--error`.
- Al llegar al máximo (`is-max`): el contador y la nota pasan a `color-warning-text` con `IconAlert` («Máximo 3 oficios. Quita uno para elegir otro.») y los chips no elegidos quedan deshabilitados. Nunca danger.
- Error (`is-error`): nota en `color-danger-text` («Elige al menos 1 oficio») al intentar continuar sin elegir.
- Puede mezclar chips input (lo elegido) y suggestion (lo sugerido).
- Las opciones dependen del oficio o la materia: a un guardia nunca se le muestran tecnologías.
