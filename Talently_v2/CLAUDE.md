# Reglas de desarrollo — Talently React

## Stack del proyecto
- React + Vite
- react-router-dom v6
- Supabase (auth + database + storage + realtime)
- Context API + useReducer (sin Redux)
- CSS variables propias (--primary, --bg, --surface, --text, --border)
- SIN Tailwind, SIN colores hex hardcodeados en componentes

## Estructura de carpetas
src/

components/     → componentes reutilizables

views/          → pantallas completas

auth/         → Welcome, Login, Register, Recovery, NewPassword, AuthCallback

onboarding/   → candidate/ y company/

candidate/    → MainApp, Swipe, Messages, Chat, Profile

company/      → Dashboard, CreateOffer, CompanySwipe, Stats

hooks/          → custom hooks

context/        → AppContext.jsx + AppReducer.js

lib/            → supabase.js, errorLogger.js

data/           → diccionarios estáticos

styles/         → variables.css, base.css


## Reglas de código

1. **CSS**: Usar SOLO variables CSS del proyecto. Nunca colores hex, rgb ni clases de Tailwind.
2. **Estado global**: Todo pasa por `useApp()`. Nunca usar `window.app` ni estado local para datos compartidos.
3. **Supabase**: El cliente siempre viene de `src/lib/supabase.js`. Nunca inicializar Supabase en otro archivo.
4. **Columnas explícitas**: Antes de usar select con columnas explícitas, verificar que existen con `supabase.from('tabla').select('*').limit(1)`. Nunca asumir nombres de columnas.
5. **Chart.js**: Siempre destruir la instancia en el return del useEffect (`chart.destroy()`).
6. **Rutas**: Rutas públicas en `/`, candidato en `/app/`, empresa en `/company/`.
7. **Formularios**: Nunca usar la etiqueta HTML `<form>`. Usar handlers con onClick/onChange.
8. **Pasos de onboarding**: El onboarding de candidato tiene 12 pasos (no 16). El de empresa tiene 11 pasos (no 14 ni 12): la selección de tipo candidato/empresa existe UNA sola vez en toda la app — el paso 1 del wizard de candidato. El wizard de empresa NO tiene paso de tipo (pantalla duplicada eliminada 2026-06-11). Los pasos fantasma NO existen.

## Regla permanente — Bitácora de errores

Cada vez que encuentres o resuelvas un error, ANTES de continuar:

1. Documenta el error en `src/ERROR_LOG.md` con este formato:
ERROR: [descripción corta]

SÍNTOMA: [qué se ve o qué dice la consola]

CONTEXTO: [en qué componente / hook / vista ocurrió]

CAUSA RAÍZ: [por qué pasó]

SOLUCIÓN APLICADA: [qué cambio se hizo]

PATRÓN A EVITAR: [regla general para no repetirlo]


2. Si el mismo patrón ya está en `ERROR_LOG.md`, mencionarlo explícitamente.
3. Nunca repetir un error ya documentado.

## Errores ya conocidos (no repetir)

- **Chart is not defined**: Importar Chart.js como npm, no CDN. Usar `import { Chart, registerables } from 'chart.js'`.
- **Canvas reutilizado**: Llamar `chart.destroy()` en el return del useEffect.
- **Dark mode en modales**: Nunca colores hardcodeados. Siempre `var(--bg)`, `var(--surface)`, `var(--border)`.
- **localStorage como fuente de verdad**: Solo para preferencias UI (dark mode, user_type). Los datos relacionales siempre desde Supabase.
- **OAuth redirect en blanco**: La ruta `/auth/callback` debe estar registrada en App.jsx y la Redirect URL en Supabase Dashboard debe coincidir con el dominio.
- **redirectTo hardcodeado**: Usar `window.location.origin` para que funcione en dev y prod.
- **Escrituras mudas a Supabase (ERROR_LOG #15)**: supabase-js devuelve `{ data, error }`, NO lanza. TODA escritura debe chequear `error` y no avanzar el flujo si falla. Antes de escribir columnas nuevas, validar que existen y que el tipo calza (array de objetos → jsonb). Invocar schema-guardian.
- **Checkbox/radio invisibles**: base.css resetea `appearance: none` en todos los inputs; checkbox y radio tienen `appearance: auto` restaurado. No quitar ese restore.
- **StatusBar Style invertido**: `Style.Dark` = texto CLARO (fondos oscuros), `Style.Light` = texto OSCURO (fondos claros). Usar `setStatusBarTheme(isDark)` de capacitorInit, nunca el enum directo.
- **Safe areas APK (ERROR_LOG #14)**: todo `position: fixed` anclado arriba/abajo compensa con `var(--safe-area-inset-top/bottom, 0px)`.
- **Botones fantasma (ERROR_LOG #16)**: en vistas embebidas como TAB (MainApp `/app`, CompanyDashboard) los tabs son estado interno — `navigate()` a la ruta del contenedor es un no-op. El contenedor debe pasar un callback (patrón `onExplore`). Todo botón visible debe tener handler con efecto real; qa-auditor sección 13 / BR-S16 lo valida.

## Regla permanente — Registro de pendientes

Todo lo que se postergue ("lo veo después", "queda pendiente", bloqueado por
config externa o datos del dueño) se anota INMEDIATAMENTE en
`docs/PENDIENTES.md` con fecha, descripción y qué lo bloquea. Al resolver un
pendiente, moverlo a la sección "Resueltos" con commit/OTA. Revisar ese
archivo al inicio de cada sesión junto con ERROR_LOG.md.

## Regla — Control de versiones automático

Después de cada modificación que funcione correctamente:

git add -A

git commit -m "<tipo>(<scope>): <descripción en español>"

git push origin main


Tipos de commit: `feat`, `fix`, `refactor`, `style`, `chore`, `docs`

Ejemplos:
- `feat(auth): agregar login con Google OAuth`
- `fix(swipe): corregir índice fuera de rango al terminar el stack`
- `style(onboarding): corregir dark mode en step de habilidades`

NO hacer commit si el código tiene errores de sintaxis o la app no compila.

Regla — Implementar diseños de Stitch
Cuando el usuario pegue un bloque de HTML que comience con <!DOCTYPE html> o <html,
trátalo como un export de Stitch y aplica estas reglas automáticamente. No pidas
confirmación — procede directo.
Paso 1 — Identificar el componente
Analiza el contenido del HTML para determinar a qué vista corresponde.
Confirma la ruta real del archivo antes de modificar.
Paso 2 — Convertir HTML a JSX

class → className
Eventos onclick → handlers de React
Etiquetas <img> con cierre />
Eliminar <script> de Tailwind CDN
Eliminar <style> con body { min-height... } (artefacto de Stitch)
URLs lh3.googleusercontent.com de imágenes de fondo: descargar una imagen
equivalente de Unsplash, guardar en src/assets/[nombre-vista]-bg.jpg y
referenciarla en CSS. NUNCA reemplazar por solo un gradiente.

Paso 3 — Convertir Tailwind a CSS variables
bg-primary → background: var(--primary)
text-primary → color: var(--primary)
bg-background-light / dark:bg-background-dark → background: var(--bg)
bg-surface-light / dark:bg-surface-dark → background: var(--surface)
text-gray-900 / dark:text-white → color: var(--text)
text-gray-600 / dark:text-gray-300 → color: var(--text-secondary)
border-gray-200 / dark:border-gray-700 → border-color: var(--border)
bg-blue-600 hover → background: var(--primary-hover)
focus:ring-blue-500/50 → outline: 2px solid var(--primary); outline-offset: 2px
rounded-2xl → border-radius: 1rem
rounded-xl → border-radius: 0.75rem
shadow-lg → box-shadow: var(--shadow-lg)
font-bold / font-extrabold → font-weight: 700 / 800
text-4xl → font-size: 2.25rem
text-3xl → font-size: 1.875rem
text-lg → font-size: 1.125rem
text-sm → font-size: 0.875rem
text-xs → font-size: 0.75rem
Clases de layout (flex, grid, gap, padding, margin): convertir a CSS normal
en el archivo .css del componente. No dejar ninguna clase Tailwind.
Paso 4 — Agregar variables CSS faltantes
Si el diseño usa un token que no existe en src/styles/variables.css,
agregarlo al bloque :root Y al bloque [data-theme='dark'].
Paso 5 — Conectar lógica existente
NO eliminar handlers, hooks ni llamadas a Supabase existentes.
Solo reemplazar el JSX de retorno con el nuevo diseño.
Si el componente era un placeholder, implementar la lógica también.
Paso 6 — Estilos
Actualizar o crear el archivo CSS del componente.
Nunca colores hex directos. Solo variables CSS.
Paso 7 — Verificar dark mode
Todos los tokens usados deben tener su equivalente en [data-theme='dark']
en variables.css.
Paso 8 — Validación obligatoria de campos
Al terminar, auditar campo por campo. Para cada campo reportar:

OK: existe en JSX y está conectado a estado, handler o prop real
VISUAL ONLY: existe en el diseño pero es texto estático sin conexión real
AUSENTE: no aparece en el JSX resultante

Corregir todos los VISUAL ONLY y AUSENTE antes del commit.
Si no es posible por falta de contexto, documentar en ERROR_LOG.md con TODO.
Formato del reporte:
Validación de campos — [NombreVista]
Campo / Estado / Detalle
Checklist final (siempre antes del commit)

Sin clases de Tailwind en el componente
Sin colores hex hardcodeados
Dark mode funciona
Lógica existente no fue eliminada
URLs lh3.googleusercontent.com reemplazadas por asset real en src/assets/
Todos los campos validados — todos OK
Commit: feat(design): aplicar diseño Stitch a [NombreVista]

## Al inicio de cada sesión

1. Revisar `src/ERROR_LOG.md` para no repetir errores conocidos.
2. Ejecutar `git status` para ver si quedaron cambios sin commitear.
3. Ejecutar `npm run dev` para verificar que la app compila antes de modificar.

