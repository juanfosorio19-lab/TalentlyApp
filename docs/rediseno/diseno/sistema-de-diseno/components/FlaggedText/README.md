# FlaggedText

Las señales de moderación resaltadas dentro del texto de una publicación, en ADM-03 (M11).

- Marcado: `mark.tl-flag` alrededor de la palabra o el dato, con `span.tl-flag__n` (su número, 11/600 sobre `color-warning` con `color-on-warning`). Fondo `color-warning-subtle`, subrayado de 2 px en `color-warning`; el texto sigue en `color-text`.
- En el ReviewPanel, «Señales encontradas (n)»: un ListItem por señal con el mismo número en `.tl-listitem__tile--warning`, el nombre («buena presencia», Teléfono, Enlace) y por qué no se permite, en una línea.
- Señales: pedir apariencia, edad, sexo, nacionalidad o estado civil («buena presencia», «menores de 30 años»); pedir dinero a quien postula («depósito»); teléfonos o enlaces para contactar fuera de Talently (el mismo criterio del aviso «Por tu seguridad…» del Composer).
- El color no es la única señal: va el número y la lista.
