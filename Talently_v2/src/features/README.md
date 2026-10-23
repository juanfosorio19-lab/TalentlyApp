# src/features — pantallas del rediseño por módulo

Cada carpeta es un módulo (spec §4.3): `routes.tsx` exporta `tabRoutes`
(raíz de pestaña, dentro del AppShell con TabBar) y `stackRoutes`
(pantallas apiladas, sin TabBar). `src/app/router.tsx` los compone.

Las pantallas **solo componen `src/ui`** (ver `src/ui/README.md`) y leen
datos de demostración de `src/features/demo` mientras Supabase está pausado.

## Piezas compartidas (usar siempre estas, no copias locales)

| Qué | Dónde | Para qué |
|---|---|---|
| Actor de la demo | `demo/session.tsx` → `useDemoSession()` | `actor`, `setActor`, `switchable` (SHT-ACTOR), `recienRegistrado` (INI-01-jorge-nuevo), `startAsNewUser(resultado)` (fin del onboarding: lo recibe de `onboarding/model.resultadoOnboarding`) y `onboarding` (lo que dejó el registro: nombre, comuna, oficios, credencial, foto; Inicio, Perfil y VER-01 muestran solo eso). Marta (`?demo=marta`, flujo 10) también es actor |
| Estado de la sesión | `demo/sessionStore.ts` | **Un solo lugar** para lo que cambia durante la sesión y que otras pestañas deben ver: `useInbox(actorId, recienRegistrado)` (todas las campanas y NOT-01; oculta lo de una postulación que la sesión todavía no tiene), `useApplications` (ACT-02, Agenda, Inicio; con «Postulación retirada» y «Cancelaste»), `applyTo`, `cancelShift`, `withdrawApplication`/`useWithdrawn` (PRC-01), `sendReview`/`useReview`/`useReviewed` (REV-01 escribe; TUR-01 deja de pedirla), `verifyPhone`/`usePhoneVerified`, `submitIdentity`/`useIdentityStatus` (VER-01, VER-02, PUBL-04, PUBL-07, Perfil), `scheduleMatch`/`markMatchSeen`, `decide`/`undoDecision`/`useDecided(actorId, recienRegistrado)` (deck y «No me interesa»), `decidePerson`/`undoPersonDecision` (EXP-05), `startsWithoutApplication` |
| Gestión de publicaciones | `demo/manageState.ts` + `demo/manageSelectors.ts` + `demo/manageHooks.ts` | Lo que hace quien publica (pausar, cerrar, renovar, confirmar cupos, «salto de tiempo», avanzar o no seleccionar, asistencia, evaluar) y los selectores puros que derivan TODAS las cifras: `publicationView`, `rosterView`, `applicantsOf`, `countNew`, `metricsOf`, `membersOf` (EXP-05), `managedSessionOf` (ACT-01, ACT-03), `orgDashboardView` (INI-02: KPIs y «Requiere tu atención»), `avisoBlockView` («Tu aviso · N postulantes nuevos»), `isPublicationActive` (Explorar y la búsqueda), `publicationWithSession` (DET-01, EXP-02, EXP-07 e Inicio: estado y «Quedan N de 8 cupos» de la sesión). Hooks: `useManageState`, `useManagedSessionOf`, `useOrgDashboard`, `useLivePublication` |
| Conversaciones | `demo/conversationState.ts` | Mensajes enviados, leídos, borrador, certificado, bloqueo; `useConversations` (las que existen en la sesión), `useUnreadMessages` (badge de Mensajes, mismo número que MSG-01) y `useUnansweredConversations` (KPI de INI-02) |
| Perfil de la sesión | `demo/profileState.ts` | Secciones editadas (`saveProfileTabs`/`useProfileTabs`), `saveCv`/`useCv` (PRF-01 sube; Inicio deja de pedirlo y DET-02 lo ofrece «Del perfil») y `useBoostNotify` (PRF-12) |
| Verificaciones | `demo/verifications.ts` | `QUE_SE_VERIFICO` y `verificationDetail(v)` (la hoja «Verificación de …» de todos los features, con la fecha única de `DemoVerification.fecha`), `identityPendingAtStart`, `identityStatusOf`, `identityInData`, `phoneInData`, `accountSince` |
| Diccionarios | `demo/catalog.ts` | `COMUNAS_RM` (SHT-COMUNA, ONB-03, PRF-03) mientras no exista la tabla `comunas` |
| Hora de la demo | `demo/data.ts` | `DEMO_TODAY`, `DEMO_TODAY_ISO`, `DEMO_NOW_TIME` (13:00); `getManagedPublications(ownerId)`, `getPublications()`, `defaultOnboardingResult()` |
| Destinos de los datos | `demo/targets.ts` → `targetPath(target, actorId)` | DemoTarget → ruta de `paths.ts` (no repetir el `switch` en cada feature) |
| Rutas | `src/app/paths.ts` | Toda ruta sale de aquí (también `verificarIdentidad(volver)`, `subirCredencial`, `publicado`, `favoritos`, `editarPublicacion`). Si falta una, se agrega aquí |
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
- Una cifra o un estado que se ve en más de una pantalla (postulantes nuevos,
  confirmados, pausada, CV subido, identidad en revisión, no leídos) sale de
  un selector de `demo/`, nunca del texto fijo de los datos ni de un store
  del feature.
- Al volver a la base de datos, `demo/` se reemplaza por las consultas de
  cada feature (`api.ts`, `queries.ts`, 02-arquitectura §4.3) sin cambiar
  las pantallas.
