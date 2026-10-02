# Rediseño Talently 3.0

Plano para rediseñar Talently antes de construirla: de un «Tinder» entre candidatos TI y empresas a una app chilena donde, con una sola cuenta, una persona puede conseguir trabajo (empleo o turnos), ofrecer servicios de oficio, dar o tomar clases particulares y contratar para su empresa o su hogar.

Fecha: 1 de octubre de 2026. Rama: `claude/pending-items-review-akh8cv`.

## Documentos

| # | Documento | Para qué sirve |
|---|---|---|
| 01 | [Super prompt para Claude Design](01-super-prompt-claude-design.md) | Prompt maestro + 12 prompts por módulo + checklist de consistencia. Se pega tal cual en Claude Design. |
| 02 | [Arquitectura](02-arquitectura.md) | Diagramas de contexto, contenedores y secuencias; estructura de carpetas; 15 decisiones técnicas (ADR); plan de migración por fases. |
| 03 | [Base de datos](03-base-de-datos.md) | Diagramas ER por dominio, máquinas de estado, enums, diccionario de datos, RLS, funciones y triggers, Storage, migración desde el esquema actual y semillas. |
| 04 | [Perfiles y onboarding](04-perfiles-y-onboarding.md) | Fichas de los 6 perfiles, taxonomía de oficios con atributos y credenciales, flujos de onboarding pantalla por pantalla, reglas de progreso y criterios de QA. |
| 05 | [Spec maestro](05-spec-maestro.md) | Fuente única de verdad que usan los otros cuatro documentos (nombres canónicos de perfiles, tablas, pantallas e íconos). |

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
6. Los diagramas se validaron con el parser de Mermaid v11.

## Cómo usar el super prompt

1. Abre una sesión en Claude Design, pega el **prompt maestro** y después el **Módulo 1** (sistema de diseño). Aprueba el sistema de diseño antes de seguir.
2. Avanza módulo por módulo, por lotes de 6 a 8 pantallas.
3. Revisa cada entrega con el checklist del final del documento 01.

## Decisiones abiertas

Dependen del dueño, de un abogado o de una validación comercial. Cada una trae una recomendación.

1. Modo de migración: ¿hay usuarios reales en la BD o son casi todos de QA? Decidido (2-10-2026): todos los usuarios son de QA, así que se hace un corte limpio. No se migran datos de usuarios ni publicaciones: se parte con el esquema nuevo vacío, se cargan solo los catálogos semilla (categorías, oficios, comunas, credenciales) y las cuentas de QA se recrean con el seed. Esto elimina la convivencia de versiones, las vistas de compatibilidad y el paso de backfill del plan de migración.

2. Proyecto Supabase: ¿restaurar el actual o crear uno nuevo (por ejemplo en São Paulo, por latencia)? Recomendación: restaurar y hacer el baseline esta misma semana (riesgo de que no se pueda restaurar si lleva más de 90 días pausado) y pasar a plan Pro. Crear un proyecto nuevo solo si la restauración falla, eligiendo la región después de evaluar la transferencia internacional de datos (Ley 21.719). **En espera (2-10-2026):** el dueño contratará el plan Pro de Supabase en breve; con eso se reactiva el proyecto actual sin pausar otros. Hacerlo antes de fines de diciembre de 2026.
3. Certificado de antecedentes en Hogar y servicios a domicilio: ¿obligatorio o recomendado? Decidido (2-10-2026): recomendado. Después del match, el trabajador puede compartirlo voluntariamente en el chat con un enlace privado que vence a los 7 días y que puede revocar; el empleador no puede exigirlo desde la app. Detalle en el spec maestro §10.1.1 y en el super prompt (MSG-02b). Inhabilidades (menores) y SPD (guardias) siguen obligatorias por ley.
4. Verificación de identidad (nivel 2) para turnos: ¿se exige a todos? Recomendación: no en el MVP. Exigir nivel 1 (teléfono) más las credenciales del oficio para ser confirmado, y permitir que cada organización exija nivel 2 en su publicación. Revaluar cuando el KYC automático esté activo (Fase 2).
5. Nombre de la pestaña 3: 'Actividad' frente a 'Agenda' o 'Mis cosas'. Recomendación: 'Actividad', con los segmentos Agenda, Postulaciones y Publicaciones. Validarlo en la prueba con 5 usuarios de la Fase 0 y cambiarlo si genera confusión.
6. Check-in y check-out con ubicación en turnos: ¿se incluyen? Recomendación: dejarlo para la Fase 2, como opción y solo con visto bueno del abogado. El control de asistencia con GPS es un indicio de subordinación frente a las Leyes 21.431 y 20.123.
7. Formas de contratación en turnos: ¿se permite 'boleta de prestación de servicios de terceros' u honorarios para eventos esporádicos? Recomendación: no ofrecerlas en el MVP (solo plazo fijo, por obra, jornada parcial o part time estudiante). Revisarlo con el abogado.
8. Pagos: ¿Mercado Pago Split 1:1 está disponible en Chile con las condiciones que se necesitan? Recomendación: validarlo en la Fase 1 con una cuenta sandbox chilena y una reunión comercial antes de comprometer comisiones de 10 a 12 %. Plan B: Pro y destacados con Flow, y pago de reservas fuera de la app.
9. Monetización de turnos: ¿por plan o por turno cubierto? Recomendación: medir en las Fases 1 y 2. Ofrecer por uso (~$1.990 por trabajador que asistió) por sobre un cupo gratuito, porque las productoras de eventos prefieren pagar por uso.
10. Comunas de lanzamiento. Recomendación: entre 8 y 12 comunas de la RM con demanda de eventos, seguridad y bodega (Santiago, Providencia, Ñuñoa, Las Condes, Vitacura, Maipú, La Florida, Puente Alto, San Miguel, Estación Central, Quilicura, Pudahuel), confirmadas con los socios que siembren la oferta.
11. Pretensión de sueldo del trabajador: ¿la ve el empleador? Recomendación: no mostrar el monto. Mostrar solo 'Calza con el rango' o 'Sobre el rango', y permitir 'Prefiero no decir'.
12. Hogar que publica un turno para un evento en casa (banquetero o garzón): ¿se permite en la Fase 1? Recomendación: sí, con nivel 2 del dueño del hogar y revisión de la primera publicación.
13. TypeScript en el código nuevo. Recomendación: sí, con los tipos que genera Supabase. Lo existente se migra cuando se toca.
14. Proveedor de identidad: Truora o Didit. Recomendación: cotizar ambos en la Fase 1 (precio por chequeo, cobertura de cédula chilena, prueba de vida) y decidir antes de la Fase 2. En el MVP, revisión manual con SLA de 24 h.
15. Datos legales y de marca para Términos y Privacidad: razón social, domicilio en Chile, dominio único (recomendado `talently.app`) y correo de contacto único. Los debe entregar el dueño para reescribir los textos antes del 1 de diciembre de 2026.
16. Nivel de verificación mínimo para que una organización publique su primer empleo: ¿visible al instante o en revisión? Recomendación: la primera publicación queda en revisión (24 h hábiles), lo que verifica a la organización, y hasta entonces tiene máximo 1 publicación activa. Los turnos solo se publican con la organización verificada.
17. Clases de manejo y vigilantes armados. Recomendación: dejarlos fuera de alcance hasta tener una revisión legal específica.
18. iOS. Recomendación: Fase 4. El código Capacitor ya lo permite, pero la prioridad es la liquidez en Android en la RM.

## Aviso: base de datos pausada

Supabase pausó el proyecto Talently por inactividad el 1 de octubre de 2026 y el plan gratuito ya tiene 2 proyectos activos (FamilyOsAe y joaquinapp-dev), así que no se pudo reactivar sin pausar alguno de ellos. Un proyecto gratuito pausado por más de 90 días ya no se puede restaurar desde el dashboard: conviene reactivarlo antes de esa fecha (ver decisión 2).
