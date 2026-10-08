# Rediseño Talently 3.0

Plano para rediseñar Talently antes de construirla: de un «Tinder» entre candidatos TI y empresas a una app chilena donde, con una sola cuenta, una persona puede conseguir trabajo (empleo o turnos), ofrecer servicios de oficio, dar o tomar clases particulares y contratar para su empresa o su hogar.

Fecha: 1 de octubre de 2026. Rama: `claude/pending-items-review-akh8cv`.

## Documentos

| # | Documento | Para qué sirve |
|---|---|---|
| 01 | [Super prompt para Claude Design](01-super-prompt-claude-design.md) | Prompt maestro + 12 prompts por módulo + checklist de consistencia. Se pega tal cual en Claude Design. |
| 02 | [Arquitectura](02-arquitectura.md) | Diagramas de contexto, contenedores y secuencias; estructura de carpetas; 17 decisiones técnicas (ADR); plan de migración por fases. |
| 03 | [Base de datos](03-base-de-datos.md) | Diagramas ER por dominio, máquinas de estado, enums, diccionario de datos, RLS, funciones y triggers, Storage, migración desde el esquema actual y semillas. |
| 04 | [Perfiles y onboarding](04-perfiles-y-onboarding.md) | Fichas de los 6 perfiles, taxonomía de oficios con atributos y credenciales, flujos de onboarding pantalla por pantalla, reglas de progreso y criterios de QA. |
| — | [Diseño de Claude Design](diseno/REVISION.md) | Prototipos F1 y F2 aprobados (97 pantallas), sistema de diseño en tokens, capturas y revisión. [Brechas](diseno/BRECHAS.md) encontradas al construirlo, para pedir a Claude Design. |
| 05 | [Spec maestro](05-spec-maestro.md) | Fuente única de verdad que usan los otros cuatro documentos (nombres canónicos de perfiles, tablas, pantallas e íconos). |

## Construcción (desde el 8 de octubre de 2026)

El rediseño se construye en `Talently_v2`, aislado de la app actual (ADR-16 y ADR-17):

- Entrada `v3.html` → `src/app/main.tsx` (TypeScript estricto). La app actual (`index.html`) y su OTA no cambian.
- `src/ui`: la librería de componentes del sistema de diseño, con su catálogo vivo. Ver [src/ui/README.md](../../Talently_v2/src/ui/README.md).
- `src/app`: rutas en español, navegación de 5 pestañas, botón atrás de Android y tema.
- `src/features`: pantallas por módulo; mientras Supabase está pausado usan los datos de demostración de `src/features/demo` (tomados de los prototipos).

Para verlo: `cd Talently_v2 && npm run dev` y abrir:

| Qué | Dirección |
|---|---|
| La app como Matías (turnos) | `http://localhost:5173/v3.html?demo=matias#/inicio` |
| Otros actores | `?demo=jorge`, `pedro`, `carolina`, `rosa` o `banqueteria` |
| Catálogo de componentes (claro y oscuro) | `http://localhost:5173/v3.html#/dev/ui` |

Comandos: `npm run typecheck`, `npm test`, `npm run lint`, `npm run ds:sync` (incorpora una entrega nueva de Claude Design).

### Anexos: estado actual

| Anexo | Contenido |
|---|---|
| [A1 · Auditoría de UI](anexos/A1-auditoria-ui.md) | Inconsistencias encontradas en las 64 vistas actuales (botones, headers, tipografía, íconos, navegación), con archivo y línea. |
| [A2 · Sistema de diseño actual y propuesto](anexos/A2-sistema-de-diseno.md) | Inventario de tokens, desvíos medidos y propuesta alineada a la marca morada. |
| [A3 · Flujos y navegación actuales](anexos/A3-flujos-actuales.md) | Rutas, guards, tab bars, onboarding actual campo por campo y problemas de navegación. |
| [A4 · Modelo de datos actual](anexos/A4-modelo-de-datos-actual.md) | Esquema reconstruido desde `sql/migrations` (la BD estaba pausada), con diagrama ER y deuda técnica. |
| [A5 · Investigación de dominio en Chile](anexos/A5-dominio-chile.md) | Requisitos por oficio (SPD/OS-10, Ley 20.786, SEC, inhabilidades), plataformas comparables y pagos. |

## Cómo se hizo

1. **Relevamiento** con 7 auditorías en paralelo: UI por zonas (público y onboarding, candidato, empresa), sistema de diseño, flujos y navegación, modelo de datos y dominio chileno.
2. **Tres propuestas** de arquitectura de producto con enfoques distintos: plataforma unificada por capacidades, módulos verticales y evolución incremental.
3. **Jurado** de tres lentes (producto y UX, ingeniería y datos, negocio en Chile). Ganó la plataforma unificada (126 puntos contra 114,5 y 112,5), con ideas injertadas de las otras dos.
4. Verificación de identidad (nivel 2) para turnos: ¿se exige a todos? Decidido (2-10-2026): no en el MVP, se sigue la recomendación. Para ser confirmado en un turno basta nivel 1 (teléfono) más las credenciales obligatorias del oficio; cada organización puede exigir nivel 2 en su publicación. Se reevalúa cuando el KYC automático esté activo (Fase 2).
5. Nombre de la pestaña 3: 'Actividad' frente a 'Agenda' o 'Mis cosas'. Decidido (2-10-2026): se sigue la recomendación: la pestaña se llama «Actividad», con los segmentos Agenda, Postulaciones y Publicaciones. Se valida igual en la prueba con 5 usuarios de la Fase 0.
6. Check-in y check-out con ubicación en turnos: ¿se incluyen? Decidido (2-10-2026): no se incluye. Talently solo intermedia la búsqueda; una vez contratada la persona, el control de asistencia es responsabilidad del empleador. Se quitó del roadmap.
7. Formas de contratación en turnos: ¿se permite 'boleta de prestación de servicios de terceros' u honorarios para eventos esporádicos? Decidido (2-10-2026): se permite, en contra de la recomendación inicial. En turnos de eventos esporádicos la publicación puede ofrecer boleta de honorarios o boleta de terceros, además de plazo fijo, por obra o part time. Al elegirlas se muestra el aviso de que no puede haber subordinación ni dependencia. Conviene que el abogado revise el texto del aviso.
8. Pagos: ¿Mercado Pago Split 1:1 está disponible en Chile con las condiciones que se necesitan? Recomendación: validarlo en la Fase 1 con una cuenta sandbox chilena y una reunión comercial antes de comprometer comisiones de 10 a 12 %. Plan B: Pro y destacados con Flow, y pago de reservas fuera de la app. **En validación (2-10-2026):** plan paso a paso en [validacion-pagos.md](validacion-pagos.md).
9. Monetización de turnos: ¿por plan o por turno cubierto? Decidido (2-10-2026): reemplazada por el nuevo modelo de negocio. En empleo y turnos no hay comisión ni cobro por turno cubierto: Talently cobra por visibilidad, con publicación Clásica (gratis) o Premium (pagada) para quien contrata, al estilo de Mercado Libre, y «Impulsa tu perfil» opcional para el trabajador, que muestra su perfil a más empresas. La comisión queda solo para servicios y clases. Detalle en el spec maestro §10.3.
10. Comunas de lanzamiento. Decidido (2-10-2026): todas las comunas de la Región Metropolitana (52) desde el lanzamiento, en vez de 8 a 12. Como la oferta inicial se repartirá en más territorio, conviene sembrar oferta (socios de banquetería, seguridad y bodega) y mostrar resultados de comunas vecinas cuando una comuna tenga poca actividad.
11. Pretensión de sueldo del trabajador: ¿la ve el empleador? Decidido (2-10-2026): sí, el empleador ve el monto de la pretensión, en contra de la recomendación inicial. Solo la ven organizaciones y hogares con una publicación activa, nunca el público general, y el trabajador puede elegir «Prefiero no decir» (se muestra «A convenir»).
12. Hogar que publica un turno para un evento en casa (banquetero o garzón): ¿se permite en la Fase 1? Decidido (2-10-2026): se permite, como recomendaba el plan: el hogar puede publicar un turno para un evento en casa con identidad verificada del dueño del hogar y revisión de la primera publicación. Puede contratar directo o pagar con boleta (decisión 7).
13. TypeScript en el código nuevo. Decidido (2-10-2026): se sigue la recomendación: TypeScript en todo el código nuevo, con los tipos que genera Supabase; el código existente se migra cuando se toca.
14. Proveedor de identidad: Truora o Didit. Recomendación: cotizar ambos en la Fase 1 (precio por chequeo, cobertura de cédula chilena, prueba de vida) y decidir antes de la Fase 2. En el MVP, revisión manual con SLA de 24 h.
15. Datos legales y de marca para Términos y Privacidad: razón social, domicilio en Chile, dominio único (recomendado `talently.app`) y correo de contacto único. Los debe entregar el dueño para reescribir los textos antes del 1 de diciembre de 2026. **En curso (2-10-2026):** el dueño constituirá la empresa y enviará razón social, domicilio y correo para reescribir Términos y Privacidad.
16. Nivel de verificación mínimo para que una organización publique su primer empleo: ¿visible al instante o en revisión? Decidido (2-10-2026): se sigue la recomendación: la primera publicación de una organización queda en revisión (24 h hábiles) y eso verifica a la organización; hasta entonces puede tener solo 1 publicación activa, y los turnos solo se publican con la organización verificada.
17. Clases de manejo y vigilantes armados. Decidido (2-10-2026): se sigue la recomendación: clases de manejo y vigilantes armados quedan fuera del alcance hasta tener una revisión legal específica.
18. iOS. Decidido (2-10-2026): se sigue la recomendación: iOS en la Fase 4. La prioridad es Android en la Región Metropolitana.

## Aviso: base de datos pausada

Supabase pausó el proyecto Talently por inactividad el 1 de octubre de 2026 y el plan gratuito ya tiene 2 proyectos activos (FamilyOsAe y joaquinapp-dev), así que no se pudo reactivar sin pausar alguno de ellos. Un proyecto gratuito pausado por más de 90 días ya no se puede restaurar desde el dashboard: conviene reactivarlo antes de esa fecha (ver decisión 2).
