# Talently · M12 · Prototipos navegables F1 y F2

Traspaso del diseño para el backend. Contiene las pantallas aprobadas en M1 a M11 que recorren los 11 flujos del prototipo, con su navegación cableada, y las variantes que completan cada flujo con los datos de su persona (versión 3).

Fuente de verdad del diseño (lienzos en claude.ai):

- Prototipo F1: https://claude.ai/artifact/2wvNGwsBWh5F4c5jZkTpgh
- Prototipo F2: https://claude.ai/artifact/9W4VNPLMDGKxjDxTRQn73L
- Sistema de diseño Talently (v 1791340822-3cfa): https://claude.ai/artifact/HFynWEZZGPxaarjKuVnHV1

## Contenido

```
README.md
flujos.json                 flujos, tableros y enlaces resueltos de cada pantalla (legible por máquina)
prototipo-f1/project/       99 tableros .dc.html + canvas.json + ds/talently (tokens.css, tokens.json, bundle.css, Inter)
prototipo-f2/project/       7 tableros
capturas/f1, capturas/f2    PNG de cada tablero (390 × 844; índices 1280 × 1100)
```

## Cómo leer un `.dc.html`

- Un archivo = una pantalla de 390 × 844. La plantilla está dentro de `<x-dc>`; `{{x}}` son valores que devuelve `renderVals()` en el `<script type="text/x-dc">`.
- `<sc-if value="{{x}}">` es condicional, `<sc-for list="{{xs}}">` repite y `<dc-import name="X" prop="…">` monta otro tablero. Muchos estados son envoltorios: `DET-02-exito` = `DET-01-empleo` con `estado="postulado"`.
- Navegación: `<a href="X.dc.html">`. Las rutas se calculan en `renderVals()` (claves `r…`). En estas copias, `renderVals()` envuelve al original (`_rv`), agrega las rutas del prototipo y deja sin `href` toda ruta a una pantalla que no está en el paquete.
- Estilo: clases `tl-*` de `bundle.css` y variables de `tokens.css` (tokens en `tokens.json`). Una sola fuente: Inter.
- Los archivos necesitan el runtime del tipo Design (`support.js`) para renderizarse: para verlos, abre los lienzos o usa `capturas/`.

## Flujos y su pantalla de inicio

| # | Flujo | Empieza en | Recorrido (IDs de tablero) |
|---|---|---|---|
| 1 | Onboarding de Jorge (guardia) | AUTH-01 | AUTH-01 → AUTH-02 → AUTH-03 → ONB-01 → ONB-03 → ONB-T1…T5 → ONB-99 → INI-01-jorge-nuevo |
| 2 | Matías toma un turno | Main (INI-01 de Matías) | Main → EXP-02 → EXP-02-turnos-desplazado → DET-01-turno → AUTH-08 → AUTH-08-codigo → DET-01-turno-postulado → ACT-02-matias → TUR-01 → REV-01 |
| 3 | Pedro postula y hace match | EXP-01 | EXP-01 → DET-01-empleo-pedro → DET-02-pedro → DET-02-exito-pedro → DET-03-pedro → MSG-02-pedro → PRC-01-pedro |
| 4 | Rosa publica un turno y confirma cupos | INI-02 | INI-02 → PUBL-01 → PUBL-03-paso1…4 → PUBL-08-turno → PUBL-08-turno-pronto → PUBL-07-turno → GES-01-turno → GES-04-sin-postulados → GES-04-finde-postulados → GES-04-finde |
| 5 | Carolina publica su aviso del hogar | INI-01-carolina | INI-01-carolina → PUBL-01-carolina → PUBL-04-paso1…5 → PUBL-04-identidad → VER-02 → frente → dorso → selfie → PUBL-07-aviso-hogar → GES-02-hogar → PRC-01-hogar (checklist legal) |
| 6 (F2) | Carolina reserva una clase para Tomás | EXP-03 | EXP-03 → DET-01-clase → RES-01 → RES-02 → RES-03 |
| 7 | Cambio de actor | INI-02 | INI-02 → SHT-ACTOR → INI-01-rosa → SHT-ACTOR-persona → INI-02 · INI-01-rosa → NOT-01 → INI-02-cambio |
| 8 | Perfil y configuración | PRF-01 (Jorge) | PRF-01 → CFG-01 → CFG-01-cerrar-sesion → AUTH-01 |
| 9 | Botón atrás | EXP-02-turnos-desplazado | EXP-02 con scroll → DET-01-turno → atrás → EXP-02 con scroll · MSG-01 → atrás → Main → atrás → INI-01-salir |
| 10 | Marta comparte su certificado | MSG-01-marta | MSG-01-marta → MSG-02b-pedido → MSG-02b-adjuntar → MSG-02b-compartir → MSG-02b-marta → MSG-02b-marta-no-disponible (vista de Familia: MSG-02b-no-disponible) |
| 11 | Impulsa tu perfil | PRF-01 (Jorge) | PRF-01 → PRF-01-final → PRF-12 (Avisarme) · ACT-02-jorge → ACT-02-desplazado → PRF-12-desde-act |

## Notas de consistencia

- Flujo 2: «Garzones para matrimonio» pide identidad verificada (ruta aprobada: DET-01-identidad); el prototipo usa AUTH-08 como pide el flujo. TUR-01 y REV-01 son de otros turnos de Matías (cóctel corporativo del jue 10 dic y el turno del sáb 5 dic).
- Flujo 5: el checklist legal está dentro de PRC-01-hogar («Para contratar como corresponde»); no hay pantalla aparte.
- Para Matías (Maipú, radio 20 km), los turnos en Las Condes se muestran a 18 km.
- La cadena de empleo de Jorge (DET-01-empleo … PRC-01) y GES-04 de «Garzones para matrimonio» siguen en la página Apoyo.

## Variantes de la versión 3 (misma pantalla aprobada, otros datos)

| Tablero | Base aprobada | Qué cambia |
|---|---|---|
| ACT-02-matias | ACT-02 | Postulaciones de Matías: cóctel corporativo (Confirmado), matrimonio y cena de fin de año (Postulado) |
| DET-01-empleo-pedro, DET-02-pedro, DET-02-exito-pedro, DET-03-pedro, MSG-02-pedro, PRC-01-pedro | DET-01-empleo, DET-02, DET-02-exito, DET-03, MSG-02, PRC-01 | Mecánico/a automotriz en Taller Los Aromos (Macul, $750.000, Indefinido, Presencial); entrevista lun 14 dic · 09:00 |
| GES-04-finde-postulados, GES-04-finde | GES-04-postulados, GES-04 | «Garzones fin de semana», sáb 19 dic, San Miguel: 0/8 con postulados y 2/8 tras «Confirmar a mis favoritos», con Snackbar |
| INI-01-rosa | INI-01-jorge-nuevo | Inicio de Rosa Muñoz como persona, sin perfiles, con su chip de actor |
| SHT-ACTOR-persona | SHT-ACTOR | Sobre INI-01-rosa, con Rosa Muñoz marcada y el punto de no leídos en Banquetería Rosa SpA |
| MSG-01-marta | MSG-01 | Bandeja de Marta con la conversación de Familia en Ñuñoa |
| MSG-02b-marta-no-disponible | MSG-02b-marta (estado nuevo «off») | Vista de Marta tras «Dejar de compartir»: la tarjeta «Ya no está disponible» |

## Solo del prototipo (no implementar)

- `INDICE-F1`, `INDICE-F2`: índices.
- `*--f7`, `*--f9`, `*--f11`: alias de una pantalla ya incluida, para mostrarla en la página de otro flujo.
- `DET-01-turno-postulado` y `PRF-12-desde-act`: envoltorios de estados aprobados (Snackbar «Postulaste al turno»; PRF-12 abierto desde Actividad).
- Zonas invisibles con `aria-label` «Prototipo: …»: la hora de la barra de estado avanza el tiempo, el borde derecho pasa a la posición de scroll aprobada y el borde izquierdo es el gesto atrás de Android. En `flujos.json` llevan `"tipo": "zona del prototipo (no es UI)"`.
- La TabBar recibe `quien` para llevar a las pantallas de cada persona del ejemplo.

## Estados que se ven en estas pantallas (referencia, no especificación)

- Postulación a empleo (PRC-01): Postulado → Visto → En proceso → Entrevista → Oferta → Contratado; también No seleccionado y Retirar postulación.
- Turno del trabajador (TUR-01): Postulado, Confirmado, En lista de espera, Cancelado por la organización, No seleccionado; confirmación de asistencia 24 h y 2 h antes.
- Cupos del turno (GES-04): Confirmados x/y, Postulados, Lista de espera; Confiabilidad % y nota.
- Publicación (GES-01, PUBL-07): Activa, Pausada, En revisión (organización o identidad sin verificar), Rechazada por moderación; tipo Clásica (gratis) o Premium («Pronto» en F1 y F2).
- Verificación: teléfono por SMS o WhatsApp con código de 6 dígitos (AUTH-08); identidad con cédula por delante, por detrás y selfie, «En revisión», respuesta en menos de 24 h (VER-02).
- Certificado de antecedentes compartido en el chat (MSG-02b): disponible hasta una fecha, «Visto por…», «Dejar de compartir» → «Ya no está disponible».
- Evaluación mutua (REV-01): se publica cuando ambos evalúan o a los 7 días; comentario de hasta 300 caracteres.
- Reserva de clase (RES-03, F2): Solicitada, Confirmada, Cancelada, Realizada, No asistió, Expirada (la profesora no respondió en 12 h).
- Actor: persona u organización (SHT-ACTOR); el hogar no es un actor, vive dentro del perfil de la persona; una notificación de otro actor cambia de actor sola.

## Fuera de este paquete

El resto de pantallas de M1 a M11 (otros estados, tema oscuro, anchos 360/412, M10 Servicios F3 y M11 Backoffice web) está en los lienzos de cada módulo.
