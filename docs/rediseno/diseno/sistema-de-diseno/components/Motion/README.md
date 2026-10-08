# Motion

Duraciones y curvas de movimiento, reproducibles en claro y oscuro.

- `duration-fast` (120 ms) para el presionado; `duration-base` (200 ms) para Switch, chips, tabs y SegmentedControl; `duration-slow` (320 ms) para hojas y transiciones entre pantallas.
- `ease-standard` en toda transición. `ease-spring` (con rebote) solo en el swipe del deck de empleos y en el modal de match.
- Respeta «reducir movimiento»: `bundle.css` lleva las transiciones a 0 ms con `prefers-reduced-motion`.
