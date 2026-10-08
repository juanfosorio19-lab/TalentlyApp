# BottomTabBar

La navegación principal: 5 pestañas fijas en este orden, con el mismo ícono y el mismo comportamiento para cualquier perfil. Cambia el contenido, nunca la estructura.

- Inicio (IconHome) · Explorar (IconSearch) · Actividad (IconCalendar) · Mensajes (IconChat) · Perfil (IconPerson). La app siempre abre en Inicio.
- Marcado: `nav.tl-tabbar` con 5 `a.tl-tab` > `.tl-tab__pill` (ícono 24) + `.tab-label` (11/500, sin mayúsculas). La activa lleva `aria-current="page"`.
- Inactiva en `color-text-3`; activa en `color-primary-text` con un solo indicador: la píldora de 56×32 en `color-primary-subtle` detrás del ícono.
- Badge numérico (`.tl-tab__badge`) solo con no leídos reales: relleno `color-primary` con `color-on-primary`, anillo `color-surface`, «99+» como máximo. El rojo queda para errores.
- Alto 64 (`layout-tabbar`) más la barra de gestos; solo la TabBar (o el CTA fijo inferior) compensa el safe area inferior. Fondo `color-surface`, `elev-2`, capa `z-tabbar`.
- Desde otra pestaña, el botón atrás de Android lleva a Inicio; en Inicio, «Presiona atrás otra vez para salir».
