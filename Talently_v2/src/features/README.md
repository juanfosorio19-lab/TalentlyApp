# src/features — pantallas del rediseño por módulo

Cada carpeta es un módulo (spec §4.3): `routes.tsx` exporta `tabRoutes`
(raíz de pestaña, dentro del AppShell con TabBar) y `stackRoutes`
(pantallas apiladas, sin TabBar). `src/app/router.tsx` los compone.

Las pantallas **solo componen `src/ui`** (ver `src/ui/README.md`) y leen
datos de demostración de `src/features/demo` mientras Supabase está pausado.

## Piezas compartidas (usar siempre estas, no copias locales)

| Qué | Dónde | Para qué |
|---|---|---|
| Actor de la demo | `demo/session.tsx` → `useDemoSession()` | `actor`, `setActor`, `switchable` (SHT-ACTOR), `recienRegistrado` (INI-01-jorge-nuevo: todo vacío), `startAsNewUser()` (fin del onboarding) |
| Estado de la sesión | `demo/sessionStore.ts` | **Un solo lugar** para lo que cambia durante la sesión y que otras pestañas deben ver: `useInbox(actorId, recienRegistrado)` (todas las campanas y NOT-01), `useApplications(actorId, recienRegistrado)` (ACT-02, Agenda, Inicio), `applyTo`, `cancelShift`, `verifyPhone`/`isPhoneVerified`, `scheduleMatch`/`markMatchSeen` (DET-03 en cualquier pantalla), `decide`/`undoDecision`/`useDecided` (deck y «No me interesa»), `startsWithoutApplication` (inicio de los flujos 2 y 3) |
| Destinos de los datos | `demo/targets.ts` → `targetPath(target, actorId)` | DemoTarget → ruta de `paths.ts` (no repetir el `switch` en cada feature) |
| Rutas | `src/app/paths.ts` | Toda ruta sale de aquí. Si falta una, se agrega aquí |
| Navegar | `src/app/navigation/useOpenPath.ts` → `useOpenPath()` | `open(path)`, `linkProps(path)` (href + onClick para `a`, ListItem, Card) y `canOpen(path)`: si la pantalla no existe en el router, muestra «Disponible pronto» en vez de llevar a SYS-404 |
| Volver | `src/app/BackButtonManager.tsx` → `useGoBack()` | BackButton del AppBar standard (mismo orden que el atrás de Android) |
| Cambios sin guardar / pasos | `src/app/navigation/backHandlers.ts` | `useDirtyGuard(dirty)` y `useWizardBack(back)` |
| Hojas en la URL | `src/app/sheets.ts` → `useSheet('postular')` | `?sheet=<nombre>` (spec §5.3 regla 3): `open`, `show(params)`, `hide()`; pasar `hide` como `onClose` de BottomSheet/SheetPicker |
| Calendario | `src/domain/calendario.ts` → `buildIcs(event)` | «Agregar al calendario» (.ics válido con DTSTAMP) |
| Tema | `src/app/providers/ThemeProvider.tsx` → `useTheme()` | Apariencia Sistema · Claro · Oscuro |

## Reglas

- Ningún feature importa archivos internos de otro feature. Lo que dos
  features comparten va a `demo/`, `src/app` o `src/domain`.
- Cero botones fantasma: todo lo tocable navega (`useOpenPath`), abre una
  hoja, cambia estado o muestra un Snackbar honesto.
- Al volver a la base de datos, `demo/` se reemplaza por las consultas de
  cada feature (`api.ts`, `queries.ts`, 02-arquitectura §4.3) sin cambiar
  las pantallas.
