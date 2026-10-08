# TextArea

Campo de varias líneas con contador. Misma estructura que TextField con `tl-field__control--area` y un `textarea` (mínimo 4 líneas, sin redimensionar).

- El contador va al pie a la derecha (`.tl-field__count`, «120/300», cifras tabulares) y cuenta caracteres reales.
- Al llegar al máximo (`is-max`), el contador y la ayuda pasan a `color-warning-text`: un límite alcanzado nunca es danger. El `maxlength` impide seguir escribiendo.
- Error (`is-error`): igual que TextField, con el mensaje en lugar de la ayuda («Escribe al menos 20 caracteres»); el contador se mantiene.
- Foco, deshabilitado y opcional: igual que TextField.
