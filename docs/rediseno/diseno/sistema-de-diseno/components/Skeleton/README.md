# Skeleton

El estado de carga de toda lista, tarjeta o perfil: bloques con la forma del contenido que viene. Nunca un spinner suelto.

- Marcado: bloques `.tl-skel` con `--line` (12), `--title` (16), `--chip` (28, pill), `--tag` (28, radio sm, como InfoTag), `--circle` (avatar de persona) o `--square` (avatar de organización, botones) dentro del contenedor real, con `aria-busy="true"` y el texto oculto «Cargando…» (`.tl-vh`).
- Color: `color-border` con un brillo `color-surface-2` que recorre en 1,4 s; con «reducir movimiento» queda quieto.
- La forma imita el contenido: lista = avatar + 2 líneas; tarjeta = la estructura de PublicationCard completa (cabecera, título, InfoTag, monto, lugar y CTA); perfil = avatar de 96, nombre y secciones.
- Si tarda más de 10 s o falla, se reemplaza por ErrorState.
