# Elevation

Los niveles de elevación y el foco, en claro y oscuro.

- `elev-0`: sin sombra, borde 1 px `color-border`. Tarjetas en listas.
- `elev-1`: thumb del Switch y segmento activo del SegmentedControl.
- `elev-2`: AppBar al hacer scroll y BottomTabBar.
- `elev-3`: BottomSheet, Dialog y tarjeta del deck de empleos, sobre `color-surface-3`.
- `elev-brand`: solo el modal de match y como máximo un CTA flotante por pantalla.
- En oscuro las sombras son negras (.40, .50, .60) y la jerarquía la marcan las superficies: `color-bg` → `color-surface` → `color-surface-2` → `color-surface-3`.
- Foco: clase `tl-focus` (contorno 2 px `color-primary-text` a 3 px del control + halo `focus-ring`).
