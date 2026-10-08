# Layers

Las capas fijas (z-index) y el frame Android base, en claro y oscuro.

- Capas: `z-sticky` 10 (AppBar, cabeceras pegajosas), `z-tabbar` 20 (BottomTabBar, CTA fijo), `z-dropdown` 30 (menú de opciones), `z-scrim` 40 (velo `color-scrim`), `z-modal` 50 (BottomSheet, Dialog), `z-toast` 60 (Toast y Snackbar, sobre la TabBar). Ningún componente inventa otra.
- Frame 390 × 844 (`layout-frame-width`, `layout-frame-height`): status bar 24, AppBar 56 (`layout-appbar`), TabBar 64 (`layout-tabbar`), barra de gestos 24, margen lateral `space-4`, contenido máximo 480 (`layout-content-max`).
- Solo el AppBar compensa el safe area superior y solo la TabBar (o el CTA fijo inferior) compensa el inferior.
- Diseña a 390 y verifica a 360 y 412 sin scroll horizontal.
- Backoffice web (M11, admin.talently.app): frame de escritorio 1280 × 800 (`layout-web-width`, `layout-web-height`), SideNav de 256 (`layout-sidenav`) o riel de 104 bajo 1200 px (`layout-sidenav-rail`), AppBar web de 80 (`layout-webbar`), ReviewPanel de 448 (`layout-review`), margen lateral `space-8`. Se verifica a 1024 y 1440 sin scroll horizontal; sin status bar ni barra de gestos.
