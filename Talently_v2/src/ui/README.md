# src/ui — librería de componentes de Talently 3.0

Implementación en React + TypeScript del sistema de diseño de Claude Design
(`docs/rediseno/diseno/sistema-de-diseno/`). Es la única fuente de estilos del
rediseño: ninguna pantalla inventa un componente, un color, un tamaño, un
radio ni una sombra.

## Cómo funciona

- **Estilos**: `styles/tokens.css` + `styles/bundle.css` son copia exacta de la
  entrega de Claude Design (`npm run ds:sync` los actualiza; nunca se editan a
  mano). `styles/app.css` solo adapta al dispositivo real (safe areas, alto de
  pantalla). Los componentes **renderizan el marcado `tl-*` exacto** de cada
  `components/<Nombre>/README.md` y `preview.html`; no tienen CSS propio.
  (Decisión: en vez de CSS Modules, como decía 02-arquitectura §4, se usa el
  bundle de Claude Design tal cual para que diseño y código no se separen.)
- **Íconos**: `icons/` (generado desde `icons.json`). Los componentes reciben el
  componente del ícono (`icon={IconSearch}`), nunca un string.
- **Logos**: `BrandLogo/logos.generated.ts` (los SVG oficiales, tal cual).

## Reglas para escribir un componente

1. Carpeta `src/ui/<Nombre>/` con `<Nombre>.tsx`, `index.ts` (exporta
   componente y tipos) y `<Nombre>.demo.tsx` (catálogo `/dev/ui`).
2. Componentes de función con nombre, props `interface <Nombre>Props`
   exportada. Si la raíz es un elemento nativo, las props extienden
   `ComponentPropsWithRef<'button' | 'input' | …>` y el resto se esparce en la
   raíz (React 19: `ref` es una prop más). `className` se une con `cx()`.
3. Variantes como uniones de strings con el mismo nombre que el modificador
   CSS (`variant: 'primary' | 'tonal'` → `tl-btn--tonal`).
4. **Estados**: en la app salen de `:active`, `:focus-visible`, `disabled` y
   `aria-*`. Las clases `is-*` se ponen solo cuando bundle.css no tiene
   selector nativo para ese estado (p. ej. `is-loading`, `is-error`,
   `is-selected` en IconButton). Nunca se fuerzan `is-pressed` ni `is-focus`
   desde la lógica: el catálogo los fuerza pasando `className`.
5. Accesibilidad: elementos nativos (`button`, `input`, `a`, `fieldset`),
   etiquetas asociadas con `useId`, `aria-invalid` + `aria-describedby` en
   errores, `aria-busy` al cargar, `aria-label` obligatorio en solo-ícono, y
   texto oculto con `.tl-vh` cuando el estado no se ve como texto.
6. Textos en español de Chile (ver README del sistema). Etiquetas por defecto
   del sistema («Volver», «Cerrar», «Reintentar»). Nada en inglés en la UI.
7. Sin colores, medidas ni sombras escritos a mano; sin `style` salvo valores
   calculados (ancho de una barra en %, posición del arrastre). Si falta un
   estilo en bundle.css, no se inventa: se anota como brecha.
8. Sin `<form>` (regla del proyecto): los envíos van con `onClick`.
9. Capas (BottomSheet, Dialog, MatchModal): `useOverlay(open, onClose)` de
   `overlay/` para que el atrás de Android y Escape cierren la de arriba; se
   renderizan con portal en `document.body` y aceptan `portal={false}` para el
   catálogo.
10. Controlados: los compuestos (ChipGroup, SegmentedControl, Select, …)
    reciben `value` + `onChange(next)`; los campos simples conservan el
    `onChange` nativo del input.
11. Datos de ejemplo de las demos: los de los mockups (Rosa, Jorge, Carolina,
    Matías, Pedro, Marta; comunas de la RM; montos en CLP con unidad).
