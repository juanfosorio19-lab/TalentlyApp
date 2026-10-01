# Anexo A5 · Investigación de dominio en Chile

Requisitos y particularidades por oficio, plataformas comparables, medios de pago y riesgos de confianza y seguridad. Lo incierto está marcado en el texto.

---

# Talently: investigación de dominio para la expansión a oficios, servicios y clases (Chile)

Fecha de corte: 1 de octubre de 2026. La verifiqué con WebSearch. WebFetch estaba bloqueado por el proxy, así que trabajé solo con los resúmenes del buscador.

Cada dato lleva un nivel de **certeza**:
- **Alta:** confirmado en una fuente oficial o en varias fuentes de 2025-2026.
- **Media:** viene de una sola fuente secundaria.
- **Baja:** sale de mi conocimiento previo y no lo pude verificar. Hay que confirmarlo antes de usarlo en el texto legal o en la interfaz.

---

## 0. Las 12 implicancias que más afectan al producto

| # | Hallazgo | Qué cambia en Talently |
|---|---|---|
| 1 | Hay **4 formas distintas de relación**: empleo, turno, servicio y clase. Cada una tiene su propio contrato, forma de pago y riesgo. | El modelo de datos debe tener un campo `tipo_publicacion` (`empleo`, `turno`, `servicio`, `clase`), con su propio flujo: match o postulación, aceptación del turno, solicitud o cotización, y reserva de horario. |
| 2 | Quien contrata no siempre es una empresa. Puede ser un **hogar** (asesora del hogar, gasfíter, niñera), un **apoderado** (clases para su hijo) o una **pyme o emprendedor**. | Hacen falta perfiles de demanda separados: Empresa (RUT de empresa), Pyme o persona con giro, Hogar o particular, y Apoderado o alumno. |
| 3 | Algunos oficios **exigen una habilitación legal verificable**: guardia (credencial SPD), electricista o instalador de gas (SEC), conductor profesional (licencias A1 a A5), operador de maquinaria (clase D), salud (registro de la Superintendencia de Salud) y trabajo con menores (Registro de Inhabilidades). | Hay que modelar las **credenciales**: tipo, número, emisor, vencimiento, estado de verificación y archivo. También insignias por nivel, avisos de vencimiento y bloqueo de publicación si falta una credencial obligatoria. |
| 4 | **Ley 21.659 de seguridad privada** (vigente desde el 28-nov-2025). La autorización y la credencial de guardia ya las emite la Subsecretaría de Prevención del Delito, no Carabineros con el OS-10. | Usar "Credencial de guardia (SPD / ex OS-10)" con su vencimiento. El guardia se publica como **empleo o turno con una empresa**, no como servicio independiente para particulares. |
| 5 | **Asesora del hogar = relación laboral** (Ley 20.786). El contrato debe registrarse en la Dirección del Trabajo dentro de 15 días y hay reglas de jornada para puertas adentro y puertas afuera. | El flujo hogar-asesora termina en una **contratación**, no en un "servicio por boleta". La app debe recordar el registro del contrato y ofrecer el enlace a la Dirección del Trabajo. Las asesoras por horas o por días también son relación laboral, así que hay que tener cuidado con el lenguaje. |
| 6 | **Menores de edad** (niñeras, profesores, clases a menores, animación infantil). La consulta al Registro de Inhabilidades corresponde a quien va a contratar, y su mal uso tiene multa de 2 a 10 UTM. | En esas categorías, el certificado de inhabilidades se exige antes de publicar. Los alumnos menores de edad no tienen cuenta propia: los gestiona un apoderado. |
| 7 | **Ley 21.719 de datos personales**: entra en vigencia el **1-dic-2026**. | Los antecedentes penales, la biometría, la salud y los datos de menores se tratan como datos sensibles. Esto implica consentimiento explícito, guardar el resultado de la verificación y no el documento, y una pantalla de derechos de acceso, rectificación, supresión y portabilidad en Configuración > Privacidad. Debe estar en los mockups desde ya. |
| 8 | **Art. 2 del Código del Trabajo**: las ofertas no pueden condicionar por edad, sexo, nacionalidad, estado civil o "buena presencia", salvo que sea un requisito justificado del cargo. | El formulario de oferta debe ser estructurado y **sin campos de edad, sexo ni apariencia**. Además, hay que moderar el texto libre para frases como "señorita menor de 35" o "buena presencia". |
| 9 | Turnos part time: si Talently **contrata y "pone" a los trabajadores** en la empresa, se convierte en **empresa de servicios transitorios (EST)** según la Ley 20.123: con inscripción, garantía y otras obligaciones. | En el MVP, Talently solo intermedia: la empresa usuaria contrata directamente. La app solo registra la entrada y salida del turno y las evaluaciones. |
| 10 | **Ley 21.431** (plataformas digitales de servicios) regula a las plataformas que coordinan servicios a pedido. El alcance para servicios a domicilio no está claro. | **Revisar con un abogado laboral** antes de lanzar los "servicios a pedido". Los términos y condiciones deben decir que el prestador fija su precio y su agenda y que Talently solo pone en contacto. |
| 11 | Pagos: la única opción práctica de **marketplace con personas naturales** es **Split Payments 1:1 de Mercado Pago**, donde Talently cobra una comisión sin guardar el dinero. | Fase 1: cobrar por contacto, suscripción o publicaciones destacadas. Fase 2: reservas de clases y servicios pagadas con el split de Mercado Pago. |
| 12 | Confianza: todas las plataformas comparables usan **identidad verificada, reseñas solo después de una transacción real y chat dentro de la app**. | Definir niveles de verificación con insignias visibles (sección 5.2) y permitir reseñas solo después de un match, turno, servicio o clase cerrado. |

---

## 1. Requisitos y particularidades por categoría en Chile

### 1.1 Tabla principal

| Categoría | Requisito legal o habilitante | Quién lo emite | Vigencia | Cómo puede verificarlo la app | Verificación sugerida | Certeza |
|---|---|---|---|---|---|---|
| **Guardia de seguridad** | Autorización por resolución y **credencial personal e intransferible** (Ley 21.659, art. 46 y siguientes; DS 209). Requiere: **curso de capacitación aprobado**, **enseñanza media completa** o examen de equivalencia, y otros requisitos del art. 46 (sin antecedentes, salud, etc.). | **Subsecretaría de Prevención del Delito (SPD)**. Antes de la Ley 21.659 la emitía Carabineros con el OS-10 y el curso de 90 h. | **4 años**, renovable. Las credenciales OS-10 antiguas duraban 3 años. | Foto de la credencial con número y fecha de vencimiento, más revisión manual. No hay API pública conocida. | **Obligatoria** para publicar como guardia. | Alta (organismo, vigencia, requisitos); Media (régimen transitorio). Hay un proyecto de mayo de 2026 para **prorrogar los plazos de regularización**: confirmar en qué quedó. |
| Vigilante privado (armado) | Solo para entidades obligadas (bancos, transporte de valores). Requiere autorización especial. | SPD | Igual que guardia | Manual | **Obligatoria**. Conviene excluirlo del MVP. | Media |
| Conserje o mayordomo | Según una fuente secundaria, la Ley 21.659 **eliminó la obligación del curso** para conserjes de condominio. | No aplica | No aplica | No aplica | Identidad y antecedentes **recomendados** | Media. Verificar. |
| **Asesora del hogar** (trabajadora de casa particular) | **Ley 20.786**: contrato escrito y **registrado en la Dirección del Trabajo dentro de 15 días** desde que empieza (en línea o en la Inspección). **Puertas afuera**: jornada ordinaria general (Ley 21.561: 44 h desde el 26-abr-2024, **42 h desde el 26-abr-2026**, 40 h desde el 26-abr-2028) y hasta 15 h extra semanales pactadas con recargo mínimo de 50%. **Puertas adentro**: descanso mínimo de **12 h diarias**, más sábados, domingos y festivos (el descanso del sábado se puede acumular, fraccionar o cambiar de común acuerdo). Está **prohibido exigir uniforme en lugares públicos**. Multas de 1 a 10 UTM. | Dirección del Trabajo | Indefinida | El empleador hace el registro. La app solo recuerda el trámite y enlaza. A la trabajadora se le pide identidad, antecedentes y referencias. | Identidad y antecedentes **obligatorios**. Inhabilidades **obligatorio** si cuidará niños. | Alta |
| Asesora del hogar: remuneración y cotizaciones | Rige el **ingreso mínimo mensual**: **$553.553 desde el 1-may-2026** (Ley 21.830); era $539.000 en enero de 2026. El empleador cotiza además la **indemnización a todo evento (4,11%)**. | No aplica | El ingreso mínimo se reajusta en enero de 2027 según IPC | Mostrarlo como referencia en el formulario de oferta del hogar | No aplica | Alta (ingreso mínimo); Baja (4,11%, de memoria) |
| Asesora puertas adentro: detalle de descanso | Además de las 12 h, el descanso entre jornadas es por regla general de **al menos 9 h seguidas**. Con la Ley 40 horas se mencionan **2 días de descanso adicionales al mes**. | No aplica | No aplica | Texto de ayuda | No aplica | Baja. Verificar en la Dirección del Trabajo. |
| **Profesor de colegio** (aula) | Título profesional de educación. Si no hay titulados disponibles, el sostenedor puede pedir una **autorización para el ejercicio docente** al Mineduc. Existe además el **"Rol del Postulante"** del Mineduc, una lista de docentes disponibles. **Certificado de inhabilidades** obligatorio para trabajar con menores. | Universidad (título), Mineduc (autorización), Registro Civil (inhabilidades) | Título indefinido. La autorización docente es anual o por un período. | Foto del título más revisión manual, y certificado de inhabilidades con código de verificación. | Título **obligatorio** para el empleo de "Profesor de aula"; inhabilidades **obligatorio**. | Alta |
| **Clases particulares** | **No hay requisito legal** de título. Si el alumno es menor de edad, se debe aplicar el **control de inhabilidades**. Las clases de educación diferencial o psicopedagogía deberían declarar el título. | No aplica | No aplica | Título o estudios opcionales (insignia "Titulado"). Inhabilidades si atiende a menores. | Inhabilidades **obligatorio** si enseña a menores; título **recomendado** | Alta (sin requisito); Media (aplicación a clases particulares) |
| Educadora o técnico en párvulos | Título técnico o profesional. Inhabilidades obligatorio. | CFT, IP o universidad | Indefinido | Manual | **Obligatoria** | Alta |
| **Electricista** | **Licencia de instalador eléctrico SEC**: **Clase A** (ingeniero electricista), **B y C** (técnicos electricistas), **D** (título en la especialidad o **certificación ChileValora**). La necesita quien firma o declara instalaciones (TE1). | SEC (trámite en línea, unos 15 días) | **Indefinida**, salvo las obtenidas por competencias laborales, que se **renuevan cada 5 años** | Número de licencia más revisión en el buscador de instaladores SEC | **Obligatoria** para ofrecer "Electricista certificado SEC". Para "Ayudante eléctrico", ninguna. | Alta (clases, vigencia); Media (buscador público) |
| **Instalador de gas** | **Licencia SEC clase 1, 2 o 3** (Reglamento de Instaladores de Gas). Se obtiene con estudios afines o con un examen de competencias. | SEC | Indefinida (igual que la eléctrica, salvo competencias) | Igual que la eléctrica | **Obligatoria** | Alta |
| Instalador fotovoltaico | Instalador eléctrico SEC autorizado para declarar el sistema (TE4). | SEC | No aplica | Igual | **Obligatoria** | Baja |
| **Conductor profesional** | **Clase A1** (taxis), **A2** (taxis, ambulancias, vehículos de 10 a 17 pasajeros), **A3** (buses sin límite), **A4** (carga simple sobre 3.500 kg), **A5** (camiones articulados). Requiere **clase B vigente al menos 2 años** y escuela de conductores profesionales. | Municipalidad (Dirección de Tránsito) | Según la clase y la edad (control periódico) | Foto de la licencia más **certificado de hoja de vida del conductor** (Registro Civil, en línea) | **Obligatoria** | Alta (clases); Baja (hoja de vida en línea) |
| **Operador de maquinaria o grúa horquilla** | **Licencia clase D**: tractores, retroexcavadoras, grúas horquilla, bulldozers y otros. Requiere 18 años o más, examen teórico (12 preguntas, mínimo 9 correctas) y examen práctico en la máquina específica. En minería e industria se suman inducciones y licencias internas de cada faena. | Municipalidad | Según la clase | Foto de la licencia más revisión manual | **Obligatoria** | Alta |
| Repartidor en moto | Licencia **clase C** | Municipalidad | No aplica | Foto | **Obligatoria** | Alta |
| **Mecánico** (automotriz, diésel, motos) | **No hay habilitación legal obligatoria**. Pesan el título técnico (liceo técnico, CFT o instituto profesional) y la **certificación ChileValora**. Las conversiones a gas (GLP o GNC) las hacen talleres autorizados. | Liceo técnico, CFT, ChileValora | No aplica | Fotos de certificados, portafolio y reseñas | Identidad **obligatoria**; certificados **recomendados** | Alta (sin habilitación); Baja (conversiones a gas) |
| **Técnicos y operarios** (producción, bodega, mantención) | Sin habilitación general. Según el puesto: curso de trabajo en altura, soldadura certificada, examen preocupacional o de altura geográfica en minería. | OTEC, mutualidades, empleador | Variable | Carga de certificados | **Recomendada** | Media |
| Prevencionista de riesgos | Debe estar **inscrito como experto en prevención en la SEREMI de Salud** (DS 40). | SEREMI de Salud | No aplica | Número de registro más revisión manual | **Obligatoria** | Baja |
| **Turnos part time** (banqueteros, garzones, bartenders, promotoras, anfitrionas, montaje de eventos) | Sin habilitación. **Formas de contratación**: contrato a plazo fijo, por obra o faena; **jornada parcial** (hasta 2/3 de la jornada ordinaria, art. 40 bis del Código del Trabajo); **jornada parcial alternativa para estudiantes** (Ley 21.165, jóvenes estudiantes de unos 18 a 24 años); **boleta de honorarios** solo si no hay subordinación. Si una empresa contrata y pone personal en otra, debe ser **EST** (Ley 20.123). Pago típico informado: **$25.000 por turno entre semana y $35.000 en fin de semana** (garzón de eventos, Santiago). | Dirección del Trabajo (registro de EST) | No aplica | Identidad, reseñas por turno y asistencia (entrada y salida) | Identidad **obligatoria**. Curso de manipulación de alimentos **recomendado**. | Alta (EST, jornada parcial); Media (tarifas); Baja (edades de la Ley 21.165) |
| **Cuidado de menores** (niñera, babysitter, animador infantil) | Sin título obligatorio. **Control de inhabilidades** (Ley 20.594). El certificado para trabajar con menores es gratuito en registrocivil.cl con ClaveÚnica y se suele pedir cada vez que se cambia de empleador. | Registro Civil | Lo define quien contrata (en la práctica, 30 a 60 días) | Subir el PDF y validar el **código de verificación** en el sitio del Registro Civil | **Obligatoria** (identidad, antecedentes e inhabilidades) | Alta |
| **Cuidado de adultos mayores** | Cuidadora sin título: sin habilitación legal. **TENS, enfermería y kinesiología**: inscripción en el **Registro Nacional de Prestadores Individuales de Salud** de la Superintendencia de Salud (público, gratuito y consultable). | Superintendencia de Salud | Indefinido | RUT más consulta en el registro (manual o *scraping* autorizado) | Identidad y antecedentes **obligatorios**. Registro de prestadores **obligatorio** si se ofrece como TENS o profesional de salud. | Alta |
| **Certificado de antecedentes** (general) | Tipos: **para fines particulares** (el que se usa para trabajos comunes), **para fines especiales** (más completo y restringido) y **para trabajar con menores** (incluye el Registro de Inhabilidades). Es gratis en línea con ClaveÚnica y trae un **código o folio de verificación**. | Registro Civil | Sin vencimiento legal: lo define quien contrata | Validar el folio en el sitio del Registro Civil y guardar solo "verificado + fecha" | Ver la escala de niveles en 5.2 | Alta (existencia y tipos); Media (validación por folio) |
| **Independientes: boleta de honorarios** | Boleta electrónica en sii.cl, previo inicio de actividades. **Retención: 15,25% en 2026**, 16% en 2027 y **17% en 2028** (Ley 21.133). Si paga una empresa, la empresa retiene. Si paga una persona natural (hogar o apoderado), en general no retiene y el prestador hace sus pagos provisionales. Para personas sin inicio de actividades, la empresa puede emitir una **boleta de prestación de servicios de terceros**, útil para eventos esporádicos. Las clases particulares que da una persona natural son honorarios **exentos de IVA**. La **comisión de Talently sí lleva IVA (19%)**. | SII | Anual (calendario de retención) | Mostrar en la interfaz el **monto bruto y el líquido** cuando paga una empresa | No aplica | Alta (tasas); Media (no retención entre particulares, boleta de terceros) |
| **Empresas** (verificar quien publica) | RUT con inicio de actividades y giro. **Consulta de situación tributaria de terceros** en sii.cl, pública por RUT: razón social, actividades y fecha de inicio. | SII | No aplica | RUT, consulta en el SII, dominio del correo y revisión manual | **Obligatoria** para publicar empleos o turnos | Media |
| **Extranjeros** | Necesitan un permiso migratorio con autorización para trabajar (Ley 21.325). No se puede discriminar por nacionalidad. | Servicio Nacional de Migraciones | Según la visa | Campo opcional "Cuento con permiso de trabajo", sin filtro discriminatorio | Declaración propia | Media |
| **Menores como trabajadores** | Entre 15 y 18 años solo pueden hacer trabajos ligeros con autorización. En la práctica, **18 años o más** para ofrecer trabajo o servicios en la app. | No aplica | No aplica | Fecha de nacimiento más verificación de identidad | **Obligatoria** (edad mínima 18) | Alta |

### 1.2 Normas transversales que afectan el diseño

| Norma | Qué exige | Impacto en el diseño | Certeza |
|---|---|---|---|
| **Ley 21.719** (protección de datos; vigente desde el **1-dic-2026**) | Bases de licitud, consentimiento, derechos del titular (acceso, rectificación, supresión, oposición, portabilidad) y crea una **Agencia de Protección de Datos**. Aplica a toda organización, sin importar su tamaño. | Pantallas de **consentimiento específico** al subir antecedentes, biometría o datos de salud; sección "Privacidad y mis datos" con descarga y eliminación; política de retención. | Alta |
| **Ley 20.594** (Registro de Inhabilidades) | Consulta para quien contrata a personas que tendrán trato directo y habitual con menores. Mal uso: multa de 2 a 10 UTM. | La consulta la hace o la exige quien contrata, con un propósito claro. Guardar solo el resultado. | Alta |
| **Art. 2 del Código del Trabajo** (no discriminación en ofertas) | Prohíbe ofertas que condicionen por edad, sexo, raza, estado civil, nacionalidad y otros, salvo requisitos justificados. | Formulario sin esos campos y moderación del texto libre. | Alta |
| **Ley 21.431** (plataformas digitales de servicios) | Regula a los trabajadores, dependientes o independientes, de "empresas de plataforma digital de servicios" (reparto, transporte menor de pasajeros "u otros"). | **Riesgo legal** para servicios a pedido y turnos. Revisar con un abogado y diseñar con autonomía real del prestador (precio y agenda propios). | Alta (existencia); Baja (si aplica a Talently) |
| **Ley 20.123** (EST y subcontratación) | Poner trabajadores a disposición de terceros exige ser EST inscrita, con garantía. | Talently no debe ser el empleador en los turnos del MVP. | Alta |
| **Ley 21.015** (inclusión laboral) | Las empresas con 100 o más trabajadores deben contratar al menos 1% de personas con discapacidad. | Oportunidad: campo voluntario de "Credencial de discapacidad / pensión de invalidez" y filtro de "oferta inclusiva". | Baja |
| **Ley 21.643** (Ley Karin) | Prevención del acoso laboral y sexual en el empleador. | Reporte y bloqueo en el chat; protocolo de moderación. | Media |

---

## 2. Cómo funcionan las plataformas comparables

| Plataforma | Qué conecta | Cómo se publica | Match, postulación o reserva | Cómo cobra | Cómo genera confianza | Qué copiar en Talently |
|---|---|---|---|---|---|---|
| **Laborum / Bumeran** (mismo grupo; Bumeran compró Laborum en 2014) | Empresas con candidatos de empleo formal | La empresa publica un aviso | El candidato postula con su CV | **Aviso básico gratis**. Paquetes pagados para destacar, acceder a CV y promocionar. | Marca, empresas conocidas | Modelo *freemium* para empresas: publicar gratis y pagar por destacar y por acceso a perfiles. |
| **Computrabajo** | Empleo masivo (retail, logística, producción, atención al cliente) | "Publica ofertas gratis" | Postulación y seguimiento del estado | Gratis más planes | Volumen | El **estado de la postulación** visible para el candidato (resuelve el "nunca me respondieron"). |
| **Chiletrabajos** (desde 2011) | Empleo general y oficios, mucho part time y eventos | Publicación **gratuita** | Postulación | Publicaciones destacadas | Volumen local | Fuerte en garzones de eventos y oficios: valida la demanda de esas categorías. |
| **Superprof** | Alumnos con profesores particulares (más de 2.000 materias) | El profesor publica un anuncio **gratis** | El alumno contacta, el profesor acepta y **el pago se acuerda directamente** | **0% de comisión al profesor**. El alumno paga una suscripción mensual (**Pase Estudiante**) que se cobra solo cuando un profesor acepta. Anuncio Premium para el profesor (unos 99 € al año en España). | "Primera clase gratis", reseñas, perfil detallado | La clase de prueba como incentivo; perfil del profesor con materias, nivel, modalidad y precio por hora. |
| **TusClases** (España, desde 2007; presente en Chile) | Alumnos con profesores | Directorio de profesores | Contacto | Suscripciones y verificaciones pagadas para profesores (muy criticado) | Verificación pagada | **Qué evitar**: cobrar al profesor por verificarse genera desconfianza. |
| **TaskRabbit** | Clientes con prestadores de tareas (armado, mudanza, reparaciones) | El cliente describe la tarea | **Reserva directa** de un prestador por hora | Cliente: **15% de servicio más cerca de 7,5% de cargo de confianza y soporte** (≈22,5%). El prestador recibe el 100% más propinas. Registro de 25 USD en algunas ciudades. | Verificación, garantía, reseñas | Reserva por hora con agenda y cargo de "confianza y soporte" visible para el cliente. |
| **Fiverr** | Servicios digitales en paquetes | El vendedor publica paquetes con precio fijo | Compra directa | Vendedor: **20%**. Comprador: **5,5% más 2,5 USD** en pedidos bajo 50 USD. | Niveles de vendedor, reseñas, depósito en garantía | Formato de **paquetes** (Básico, Estándar, Premium) para servicios. |
| **Workana** (Latinoamérica) | Proyectos *freelance* | El cliente publica un proyecto | Propuestas del *freelancer* y selección | Freelancer: 20% que baja a 10% y 5% según lo facturado con cada cliente. Cliente: cerca de 4,5% (mínimo 2 USD). | Depósito en garantía por hito, reseñas | **Propuestas o cotizaciones** para servicios complejos (remodelación). |
| **Care.com** | Familias con cuidadores (niños, adultos mayores, mascotas, hogar) | La familia publica una necesidad; el cuidador publica su perfil | Búsqueda y mensajes | **Suscripción de la familia** (unos 39 USD al mes) para mensajes y antecedentes completos | Revisión de antecedentes base para todos, revisiones extra pagadas, **monitoreo continuo** (desde jun-2025), reseñas, verificación de teléfono y correo | Panel de **"Seguridad y verificación"** en el perfil, con el detalle de qué se verificó. |
| **Instawork** (y Shiftsmart, similar) | Empresas con trabajadores por hora (eventos, bodega, restaurantes) | La empresa publica un turno: cargo, horario, requisitos y vestimenta | Calce con trabajadores ya revisados; el trabajador **acepta el turno** | La empresa paga una **tarifa por hora todo incluido** (pago, revisión, seguro e impuestos): se retiene en la tarjeta al aceptar y se cobra después del turno. **Gratis para el trabajador**. | Revisión de antecedentes, entrevistas para puestos calificados, quizzes, **evaluaciones de cada empresa** (promedio 4,8 de 5) | Flujo de **turno**: publicar, aceptar, recordatorio, entrada y salida, evaluación mutua y lista de "favoritos" para volver a llamar. |

**Conclusión del modelo de cobro para Talently** (propuesta):
1. **Empleo**: gratis para el candidato. La empresa publica gratis y paga por destacar, por cupos de match o con un plan mensual, como Laborum o Computrabajo.
2. **Turnos**: la empresa paga por turno cubierto (tarifa fija o porcentaje), o tiene un plan. El trabajador nunca paga.
3. **Servicios**: al inicio, contacto gratis y suscripción "Pro" para el prestador (más visibilidad y agenda). Después, porcentaje por reserva pagada en la app.
4. **Clases**: reserva pagada en la app con comisión (entre 10% y 15%, propuesta) vía el split de Mercado Pago. Clase de prueba con descuento.

---

## 3. Pagos en Chile para reservas de clases y servicios

### 3.1 Comparativa de pasarelas

> Las comisiones son **referenciales de 2026**: las fuentes secundarias no coinciden entre sí. Antes de decidir, hay que pedir una cotización a cada una. Todas se cobran más IVA salvo que se indique otra cosa.

| Pasarela | Medios | Comisión referencial | Abono | ¿Marketplace o split? | Encaje con Talently | Certeza |
|---|---|---|---|---|---|---|
| **Webpay Plus (Transbank)** | Crédito, débito, prepago | Entre ~1,5% y 3% según la tarjeta y el rubro. Una fuente indica para comercios nuevos 2,35% en crédito y 1,75% en débito; otra, entre 2,95% y 3,5% en crédito. | 24 a 48 h hábiles | **Webpay Plus Mall**: una transacción se reparte entre varias "tiendas", pero **cada tienda necesita su propio código de comercio afiliado a Transbank**. | Bueno para cobrar **planes a empresas**. **No sirve** para dividir pagos con profesores o prestadores que son personas naturales. | Media |
| **Mercado Pago** | Crédito, débito, saldo MP, cuotas | ~3,2% a 3,5% más IVA en ventas en línea con tarjeta (varía según el plazo de liberación) | Inmediato en la cuenta MP, o según el plazo elegido | **Sí: Split Payments 1:1**. El vendedor **vincula su cuenta MP con Talently (OAuth)**. MP descuenta su comisión al vendedor y Talently cobra su `marketplace_fee` sobre el resto. Funciona con Checkout Pro y Checkout API o Bricks. La documentación está publicada para Chile (mercadopago.cl). | **Opción recomendada para clases y servicios**: el dinero no pasa por las cuentas de Talently, casi todos los prestadores pueden abrir una cuenta MP y cobra la comisión automáticamente. | Alta (existencia y mecánica del split); Media (tarifas) |
| **Flow** | Webpay, Mach, Onepay, transferencias, cuotas con débito | Crédito ~2,89% a 2,95% más IVA; débito ~1,29%; transferencia ~0,99% | 1 a 3 días hábiles según el plan | No confirmé un split nativo para marketplace | Bueno para **suscripciones** (planes de empresa o Pro) y cobros recurrentes. | Media (tarifas); Baja (split) |
| **Khipu** | Transferencia bancaria simplificada (sin tarjeta) | ~0,7% a 1,5% por transacción | Rápido | Existe un modelo de "integrador" para plataformas: **verificar** | Alternativa barata para pagos altos (paquetes de clases, servicios caros) y para quienes no usan tarjeta. | Baja |
| (Extra) **Fintoc** | Pagos de cuenta a cuenta y datos bancarios | A cotizar | Rápido | A verificar | Alternativa a Khipu. | Baja |

### 3.2 Recomendación y riesgos de pagos

| Tema | Recomendación |
|---|---|
| Fase 1 (MVP de rediseño) | **No procesar pagos entre usuarios.** Cobrar solo a empresas y prestadores Pro: planes, publicaciones destacadas y créditos, con Flow o Webpay Plus. |
| Fase 2 (clases y servicios) | **Split 1:1 de Mercado Pago**: el alumno o cliente paga en la app, el prestador recibe en su cuenta MP y Talently recibe su comisión. Se puede autorizar el cobro al reservar y capturarlo al confirmar, o cobrar por adelantado con política de cancelación. |
| Custodia de fondos | **Evitar** recibir el dinero de terceros en la cuenta de Talently para después repartirlo. Eso acerca a Talently a la figura de facilitador u operador de pagos, que la CMF regula (Ley Fintec 21.521 y normas sobre operadores de pago). **Consultar con un abogado** (certeza Baja sobre el alcance exacto). |
| Tributario | Talently emite boleta o factura con IVA (19%) **solo por su comisión**. El prestador emite su boleta de honorarios al cliente o a la empresa. En pagos de empresa a persona, mostrar el bruto, la retención (15,25%) y el líquido. |
| Cancelaciones y disputas | Definir una política por modo, por ejemplo en clases: reembolso completo hasta 24 h antes, 50% hasta 12 h antes y 0% después. Pantalla de "Reportar un problema" vinculada a la reserva. |
| Turnos | El MVP no paga sueldos por la app. La empresa paga directamente al trabajador. Talently registra el turno cumplido, que sirve de respaldo. |

---

## 4. Taxonomía propuesta: categorías y oficios

**Cómo leer la tabla:**
- **Modo** indica cómo se suele contratar cada oficio: **E** = empleo, **T** = turno o part time, **S** = servicio independiente, **C** = clase.
- **Verificación**: **Obl.** = obligatoria antes de publicar; **Rec.** = recomendada (da insignia); **No** = basta con la identidad.

**Encaje en la base de datos:** hoy existe `professional_areas` con 32 áreas (10 de TI y 22 generales, migración 018). Propongo agregarle `parent_id` para tener dos niveles (categoría y oficio), más los campos `modos_permitidos[]`, `credenciales_requeridas[]` y `involucra_menores`.

### 4.1 Empleo, turnos y servicios

| # | Categoría (nivel 1) | Oficios o profesiones (nivel 2) | Modo | Verificación especial |
|---|---|---|---|---|
| 1 | **Tecnología y digital** | Desarrollo de software, datos y BI, diseño UX/UI, QA, soporte TI y mesa de ayuda, ciberseguridad, *cloud* y DevOps, marketing digital, *community manager* | E, S | No |
| 2 | **Administración, oficina y finanzas** | Administrativo/a, secretario/a, recepcionista, asistente contable, contador/a, analista de RR.HH., cajero/a, asistente de remuneraciones, digitador/a | E, T | Rec. (título de contador) |
| 3 | **Comercio, retail y atención al cliente** | Vendedor/a, cajero/a, reponedor/a, **promotor/a**, ejecutivo/a de *call center*, jefe/a de tienda, vendedor/a en terreno | E, T | No |
| 4 | **Gastronomía, eventos y hotelería** | **Garzón o garzona**, **banquetero/a**, bartender, cocinero/a, ayudante de cocina, maestro/a de cocina, pastelero/a, copero/a, barista, **anfitrión o anfitriona**, montaje de eventos, mucama de hotel, recepcionista de hotel | T, E, S | Rec. (curso de manipulación de alimentos) |
| 5 | **Hogar y cuidados** | **Asesora del hogar puertas adentro**, **asesora del hogar puertas afuera**, asesora por días u horas, **niñera o babysitter**, **cuidador/a de adultos mayores**, cuidador/a de personas con discapacidad, TENS a domicilio, cocinero/a particular, jardinero/a, paseador/a o cuidador/a de mascotas, chofer particular | E, S | **Obl.** (identidad y antecedentes). **Obl.** inhabilidades si hay menores. **Obl.** registro de la Superintendencia de Salud si es TENS. **Obl.** licencia y hoja de vida si es chofer. |
| 6 | **Seguridad** | **Guardia de seguridad**, guardia de eventos, supervisor/a de seguridad, operador/a de CCTV o central de monitoreo, rondín, conserje o mayordomo, vigilante privado | E, T | **Obl.** credencial SPD (ex OS-10) para guardia y supervisor. Vigilante: Obl. y fuera del MVP. Conserje: Rec. (antecedentes). |
| 7 | **Construcción, mantención y reparaciones** | Maestro/a albañil, carpintero/a, **gasfíter**, **electricista**, **instalador/a de gas**, pintor/a, ceramista, yesero/a, soldador/a, techador/a, instalador/a de climatización y refrigeración, cerrajero/a, maestro/a multiservicio ("chasquilla"), jornal o peón, jefe/a de obra, **prevencionista de riesgos**, instalador/a de paneles solares | S, E, T | **Obl.** licencia SEC para electricista, gas y solar (si declara la instalación). **Obl.** registro en la SEREMI para prevencionista. Rec. para soldador (certificación) y altura (curso). |
| 8 | **Industria, producción y operarios** | **Operario/a de producción**, operario/a de bodega, **operador/a de grúa horquilla**, operador/a de maquinaria pesada, empaque, control de calidad, **técnico/a de mantenimiento industrial**, técnico/a electromecánico/a, mecánico/a industrial | E, T | **Obl.** licencia clase D para operadores. Rec. para técnicos (título o ChileValora). |
| 9 | **Transporte y logística** | Conductor/a de bus (A3), camionero/a (A4 o A5), conductor/a de furgón o van (A2), repartidor/a en moto (C) o en auto (B), peoneta, despachador/a, coordinador/a logístico/a | E, T, S | **Obl.** licencia más hoja de vida del conductor |
| 10 | **Automotriz** | **Mecánico/a automotriz**, mecánico/a diésel o de maquinaria pesada, electromecánico/a automotriz, desabollador/a y pintor/a, vulcanizador/a, mecánico/a de motos, lavador/a de autos, técnico/a en electromovilidad | S, E | Rec. (título técnico o ChileValora) |
| 11 | **Educación** (empleo) | **Profesor/a de aula** (básica o media), **educadora de párvulos**, técnico/a en párvulos, educador/a diferencial, psicopedagogo/a, asistente de la educación, inspector/a, monitor/a deportivo/a, relator/a de OTEC | E | **Obl.** título (aula, párvulos, diferencial) e **inhabilidades** |
| 12 | **Salud y bienestar** | Enfermero/a, **TENS**, kinesiólogo/a, matrona, auxiliar de farmacia, masoterapeuta, peluquero/a o barbero/a, manicurista, cosmetólogo/a, *personal trainer* | E, S | **Obl.** registro de la Superintendencia de Salud para las profesiones de salud reguladas. Resto: Rec. |
| 13 | **Limpieza y aseo** | Auxiliar de aseo, aseo industrial, limpieza post obra, limpieza de vidrios en altura, limpieza de tapices y alfombras | E, T, S | Rec. (curso de altura para vidrios). Si entra a hogares: Obl. antecedentes. |
| 14 | **Agro, minería y energía** | **Temporero/a** o *packing*, tractorista, operador/a de riego, operador/a minero/a, mantenedor/a minero/a, técnico/a en energías renovables | E, T | **Obl.** licencia D para tractorista y operadores. Rec. para el resto. |
| 15 | **Profesionales** | Ingeniería, legal, arquitectura, psicología, periodismo, diseño, ciencias y las demás áreas que ya están en `professional_areas` | E, S | Rec. (título) |
| 16 | **Creativos, medios y entretención** | Fotógrafo/a, videógrafo/a, diseñador/a gráfico/a, músico para eventos, DJ, **animador/a infantil**, maquillador/a, decorador/a de eventos | S, T | Animador/a infantil: **Obl.** inhabilidades. Resto: No. |

### 4.2 Clases particulares (modo C)

| Categoría de clase | Temas | Formato | Verificación especial |
|---|---|---|---|
| **Escolar** (básica y media) | Matemática, Lenguaje, Ciencias (Física, Química, Biología), Historia, apoyo en tareas, hábitos de estudio | Presencial (domicilio del profesor o del alumno, lugar público) u en línea | **Obl.** inhabilidades si el alumno es menor de edad |
| **PAES y exámenes** | PAES Matemática M1 y M2, Competencia Lectora, Ciencias, Historia; exámenes libres; validación de estudios | Individual o grupal | Ídem |
| **Universitaria y técnica** | Cálculo, Álgebra, Estadística, Física, Química, Contabilidad, Economía, Programación, Derecho | En línea o presencial | No |
| **Idiomas** | Inglés, portugués, francés, alemán, italiano, chino mandarín, español para extranjeros, **lengua de señas chilena** | En línea o presencial | Rec. (certificaciones como IELTS o DELF) |
| **Música** | Guitarra, piano, canto, batería, violín, ukelele, producción musical | Presencial o en línea | Inhabilidades si enseña a menores |
| **Arte y manualidades** | Dibujo, pintura, cerámica, costura, tejido, fotografía | Presencial o en línea | Ídem |
| **Deporte y bienestar** | Natación, tenis, fútbol, yoga, pilates, *personal training*, artes marciales, baile | Presencial | Ídem. Rec. (título de profesor de educación física o certificación) |
| **Tecnología** | Excel, programación para niños, robótica, edición de video, uso de IA, computación para adultos mayores | En línea o presencial | Ídem |
| **Oficios y hogar** | Cocina, repostería, barbería, maquillaje, jardinería, gasfitería básica, electricidad domiciliaria básica (sin habilitar para instalar) | Presencial o grupal | No |
| **Apoyo especializado** | Psicopedagogía, educación diferencial, apoyo a estudiantes con TEA o TDAH | Presencial o en línea | **Obl.** título e inhabilidades |
| **Clases de manejo** | No aplica | No aplica | **Fuera del MVP**: en Chile la enseñanza de manejo remunerada es materia de las escuelas de conductores (certeza Baja; verificar si un instructor particular puede cobrar). |

### 4.3 Los 4 modos de interacción

| Modo | Quién publica | Quién busca | Mecánica | Relación legal | Pago | Reseña |
|---|---|---|---|---|---|---|
| **Empleo** | Empresa u hogar (oferta) y candidato (perfil) | Ambos | Deslizar y hacer match (lo actual), o postular y avanzar por estados | Contrato de trabajo | Fuera de la app | Opcional, a la empresa sobre el proceso |
| **Turno** | Empresa (turno: fecha, horario, cupos, tarifa, vestimenta) | Trabajador de turnos | El trabajador acepta o la empresa elige; recordatorio; entrada y salida | Contrato a plazo, jornada parcial o boleta de terceros; **Talently no es el empleador** | Fuera de la app (MVP) | **Mutua**, obligatoria al cerrar el turno |
| **Servicio** | Prestador (perfil con servicios y paquetes) y cliente (solicitud) | Cliente u hogar | Reserva directa con agenda o solicitud de cotización | Honorarios (prestador independiente) | MVP fuera de la app; fase 2 con split de MP | Mutua, después del servicio confirmado |
| **Clase** | Profesor (materias, nivel, precio por hora, disponibilidad) | Alumno o apoderado | Reserva de un horario en la agenda; clase de prueba; paquetes | Honorarios exentos de IVA | Fase 2 con split de MP | Alumno o apoderado evalúa al profesor |

---

## 5. Riesgos de confianza y seguridad, y cómo mitigarlos

### 5.1 Matriz de riesgos

| # | Riesgo | Escenario concreto | Mitigación en el producto | Prioridad |
|---|---|---|---|---|
| 1 | **Abuso de menores** | Un profesor particular o una niñera con condena por delitos sexuales contra menores | Inhabilidades obligatorio en las categorías marcadas `involucra_menores` y renovación cada 6 o 12 meses (propuesta). Los menores no tienen cuenta propia: **reserva el apoderado**. Sugerir que la primera clase sea **en línea o en un lugar público**. Chat solo dentro de la app (sin teléfono hasta confirmar la reserva). Botón "Reportar" visible. | Crítica |
| 2 | **Ingreso a hogares** (robo, agresión) | Una asesora, un gasfíter o una cuidadora entra a una casa; o un prestador va a un domicilio con riesgo | Verificación de **identidad con cédula, selfie y prueba de vida**, más antecedentes, para **ambas partes** (el hogar también se verifica). Insignias visibles. **"Compartir mi servicio"** con un contacto de confianza (hora, dirección, prestador). Reseñas solo de servicios realizados. Confirmar la llegada y el término. | Crítica |
| 3 | **Estafas a postulantes** | Ofertas falsas que cobran por un "curso OS-10", el uniforme o una "inscripción"; trabajos desde casa tipo pirámide que derivan a WhatsApp o Telegram (patrón documentado por la PDI) | Empresa verificada por RUT (consulta en el SII), dominio de correo y revisión manual antes de la primera oferta. **Regla: ninguna oferta puede pedir pagos** (detección de palabras clave como "depósito", "pagar curso" o "Telegram"). Advertencia cuando se comparte un enlace o teléfono externo en el chat. Límite de mensajes masivos para cuentas nuevas. | Alta |
| 4 | **Estafas a clientes** | El prestador cobra un adelanto y desaparece | Pago en la app con split de Mercado Pago (fase 2), política de cancelación y reembolso, reseñas, suspensión con varios reportes. | Alta |
| 5 | **Documentos falsos** | Credencial OS-10 o SPD adulterada, licencia SEC inventada, título falso | Validar el **folio o código** en la fuente (Registro Civil), números en registros públicos (SEC, Superintendencia de Salud, ChileValora) y revisión manual. Guardar quién verificó y cuándo. Alertas de vencimiento. | Alta |
| 6 | **Suplantación de identidad** | Cuenta con la cédula de otra persona | Biometría facial contra la cédula (proveedores con foco en Chile: Truora, Didit, y Autentia con huella). La vigencia del documento se puede consultar en el Registro Civil. | Alta |
| 7 | **Discriminación en ofertas** | "Nana mujer menor de 35, chilena, buena presencia" | Formulario estructurado sin edad, sexo, nacionalidad ni apariencia; moderación del texto libre; mensaje de ayuda con el art. 2 del Código del Trabajo. | Alta |
| 8 | **Datos sensibles** (Ley 21.719) | Fuga de certificados de antecedentes, selfies o datos de salud y de menores | **Minimizar**: guardar "verificado, fecha y emisor", no el documento (o borrarlo después de N días). Cifrado y RLS estricta en el Storage de Supabase. Consentimiento explícito por tipo de dato. Pantalla de derechos ARCO y portabilidad. Registro de accesos. | Alta (vigencia el 1-dic-2026) |
| 9 | **Relación laboral encubierta o calificación como plataforma** (Ley 21.431, Ley 20.123) | Un hogar contrata a la asesora "por boleta" o Talently dirige a los trabajadores de turnos | Lenguaje y flujo correctos por modo (asesora = contrato de trabajo). Términos y condiciones donde el prestador fija su precio y su agenda. Revisión de un abogado laboral antes de lanzar los turnos. | Alta |
| 10 | **Trabajo de menores de edad** | Una persona de 16 años se ofrece como garzón | Edad mínima de 18 para ofrecer, con verificación de identidad. | Media |
| 11 | **Acoso en el chat o en el trabajo** | Mensajes inapropiados entre usuarios | Bloquear y reportar en todo chat, moderación, suspensión. Para empresas, recordar sus obligaciones de la Ley Karin. | Media |
| 12 | **Desintermediación** | Las partes se van por fuera de la app después del match | Dar valor dentro de la app: reseñas, historial, pagos protegidos, agenda y recordatorios. No bloquear el contacto en el modo empleo. | Media (negocio) |
| 13 | **Fraude de pagos y contracargos** | Tarjeta robada para reservar clases | Antifraude de Mercado Pago, límites para cuentas nuevas, captura diferida. | Media |

### 5.2 Escala de verificación propuesta (insignias)

| Nivel | Nombre en la interfaz | Qué se verifica | Cómo | Requerido para |
|---|---|---|---|---|
| 0 | Cuenta básica | Correo y teléfono | Código por SMS o WhatsApp y correo | Todo usuario |
| 1 | **Identidad verificada** | Cédula vigente, selfie con prueba de vida y edad de 18 o más | Proveedor de verificación de identidad | Ofrecer servicios, turnos o clases; publicar como hogar |
| 2 | **Antecedentes verificados** | Certificado de antecedentes (fines particulares) | PDF con folio validado en el Registro Civil; se guarda solo el resultado | Hogar y cuidados, seguridad, servicios a domicilio |
| 2+ | **Apto para trabajar con menores** | Certificado de inhabilidades | Ídem | Niñeras, profesores, clases a menores, animación infantil |
| 3 | **Habilitación profesional** | Credencial SPD, licencia SEC, licencia de conducir y hoja de vida, título, registro de la Superintendencia de Salud, ChileValora, registro de prevencionista en la SEREMI | Número más documento y revisión manual o consulta en el registro público | Categorías marcadas "Obl." |
| 4 | **Empresa verificada** | RUT, giro e inicio de actividades | Consulta de situación tributaria en el SII y dominio del correo | Publicar empleos y turnos |
| — | Reseñas verificadas | Solo después de un match, turno, servicio o clase cerrado | Sistema propio | Todas |

---

## 6. Perfiles que se desprenden de la investigación (insumo para el onboarding)

| Lado | Perfil | Necesidad típica | Datos clave del onboarding |
|---|---|---|---|
| Demanda | **Empresa** | Empleo y turnos | RUT de empresa, rubro, tamaño, región y comuna. Stack tecnológico **solo si el rubro es TI**. |
| Demanda | **Pyme o emprendedor** | Turnos, servicios, empleos simples | RUT (persona o empresa), rubro |
| Demanda | **Hogar o particular** | Asesora del hogar, niñera, cuidadora, gasfíter, electricista | Comuna, tipo de necesidad (puntual o permanente) y verificación de identidad (por la seguridad del prestador) |
| Demanda | **Apoderado o alumno** | Clases | Materia, nivel, modalidad, comuna; si el alumno es menor, lo gestiona el apoderado |
| Oferta | **Busco empleo** (candidato) | Empleo formal | Área, oficio, experiencia, credenciales según el oficio y disponibilidad |
| Oferta | **Trabajo por turnos** | Part time y eventos | Oficios de turno, disponibilidad por día y franja, comuna, tarifa mínima, vestimenta propia |
| Oferta | **Ofrezco servicios** (independiente) | Clientes | Oficio, zona de cobertura, precio o paquetes, agenda, boleta de honorarios (sí o no) |
| Oferta | **Doy clases** (profesor o tutor) | Alumnos | Materias, niveles, modalidad, precio por hora, clase de prueba, agenda, inhabilidades si enseña a menores |

Recomiendo que **una misma cuenta pueda tener varios roles** (por ejemplo, un candidato que también da clases), con un selector de rol activo. El onboarding pide solo los datos del rol que se está creando, lo que evita los pasos duplicados de los que se quejó el dueño.

---

## 7. Puntos abiertos (verificar con un abogado o en la fuente oficial)

1. Si se aprobó la **prórroga de los plazos de regularización** de la Ley 21.659 (proyecto de mayo de 2026) y hasta cuándo valen las credenciales OS-10 antiguas.
2. Si la **Ley 21.431** aplica a los servicios a pedido de Talently (hogar y oficios).
3. Si cobrar con split de Mercado Pago evita que Talently quede como **operador de pagos ante la CMF**.
4. Las tarifas exactas de Transbank, Mercado Pago, Flow y Khipu para el rubro de Talently, y si Flow o Khipu ofrecen split para marketplace.
5. Si existe una consulta pública o por convenio de la **credencial SPD** y del **registro de instaladores SEC**, para automatizar la verificación.
6. Las edades de la Ley 21.165, el 4,11% de indemnización a todo evento y el detalle del descanso puertas adentro con la Ley 40 horas.

---

## Fuentes

- Seguridad privada: [DOE – Ley 21.659](https://actualidadjuridica.doe.cl/ley-n-21-659-conoce-mas-sobre-la-ley-de-seguridad-privada/) · [BCN – Res. 2292 Exenta SPD (28-nov-2025)](https://www.bcn.cl/leychile/navegar?idNorma=1218913) · [Diario Oficial – DS 209 (27-may-2025)](https://www.diariooficial.interior.gob.cl/publicaciones/2025/05/27/44158/01/2649270.pdf) · [IAPP – Reglamento Ley 21.659](https://iapp.org/news/a/el-reglamento-de-seguridad-privada-de-la-ley-n-21-659-y-la-protecci-n-de-datos-personales-en-chile) · [Escuela de Seguridad – Credencial guardia](https://escueladeseguridad.cl/2026/02/11/como-sacar-la-credencial-para-guardia-de-seguridad-os10/) · [ZKV – Conserjes y Ley 21.659](https://zkv.cl/nueva-ley-21-659-de-seguridad-privada-el-fin-de-la-obligacion-del-curso-de-seguridad-para-conserjes-en-condominios/) · [Gard – Guardia vs. vigilante](https://www.gard.cl/blog/guardia-o-vigilante-privado-que-necesita-tu-empresa) · [Diario Constitucional – Prórroga de plazos](https://www.diarioconstitucional.cl/2026/05/13/iniciativa-prorroga-plazos-de-regularizacion-en-seguridad-privada-para-evitar-crisis-operativa-en-el-sector/)
- Trabajadoras de casa particular y jornada: [Dirección del Trabajo – Ley 20.786](https://dt.gob.cl/portal/1627/w3-article-107836.html) · [Mintrab – Ley 40 horas](https://www.mintrab.gob.cl/40horas/) · [Mintrab – Medidas 26 de abril](https://www.mintrab.gob.cl/ley-40-horas-conoce-las-principales-medidas-que-comienzan-a-regir-el-26-de-abril/)
- Ingreso mínimo: [El Dínamo – Nuevo sueldo mínimo 2026](https://www.eldinamo.cl/economia/2026/06/16/nuevo-sueldo-minimo-en-chile-cuanto-aumentara-y-que-cambios-contempla-la-ley/) · [Mintrab – Reajuste](https://www.mintrab.gob.cl/reajuste-al-ingreso-minimo-mensual/)
- Profesores: [ChileAtiende – Autorización para el ejercicio docente](https://www.chileatiende.gob.cl/fichas/2257-autorizacion-para-el-ejercicio-docente) · [Ayuda Mineduc – Rol del postulante](https://www.ayudamineduc.cl/ficha/rol-del-postulante)
- Menores e inhabilidades: [24horas – Registro de inhabilitados](https://www.24horas.cl/te-sirve/registro-civil/registro-civil-consulta-lista-inhabilitados-trabajar-menores-edad) · [Atención Chilena – Certificado para trabajar con menores](https://atencionchilena.cl/tramites/certificado-antecedentes-trabajar-menores/)
- SEC: [ChileAtiende – Licencia de instalador eléctrico](https://www.chileatiende.gob.cl/fichas/2662-licencia-de-instalador-electrico)
- Licencias de conducir: [PracticaTest – Tipos de licencia](https://practicatest.cl/blog/licencias-de-conducir/tipos-licencia-conducir-chile) · [PracticaTest – Licencia clase D](https://practicatest.cl/blog/licencias-de-conducir/licencia-clase-d-chile)
- Salud y competencias laborales: [Superintendencia de Salud – Registro de prestadores](https://www.superdesalud.gob.cl/app/uploads/2025/06/charla-registro-prestadores-pptx.pdf) · [ChileAtiende – ChileValora](https://www.chileatiende.gob.cl/fichas/43958)
- Honorarios: [SII – Boletas de honorarios](https://www.sii.cl/destacados/boletas_honorarios/index.html) · [Buk – Retención 2026](https://www.buk.cl/novedades/finanzas/retencion-boleta-honorarios-2026)
- Plataformas y EST: [DT – Ley 21.431](https://dt.gob.cl/portal/1627/w3-article-122872.html) · [Carey – Ley 21.431](https://www.carey.cl/api/archivo/entra-en-vigencia-ley-que-regula-el-contrato-de-trabajadores-plataformas-digitales-de-servicios?lang=es) · [DT – EST](https://dt.gob.cl/legislacion/1624/w3-article-94939.html)
- Datos personales: [Academia Judicial – Ley 21.719](https://academiajudicial.cl/recursos/actualizaciones-normativas/ley-21-719-que-regula-la-proteccion-y-el-tratamiento-de-los-datos-personales-y-crea-la-agencia-de-proteccion-de-datos-personales/) · [Diario Constitucional – Vigencia 1-dic](https://www.diarioconstitucional.cl/2026/06/12/la-ley-21-719-entra-en-vigor-el-1-de-diciembre-y-expone-vacios-en-regulacion-de-pequenas-empresas/)
- Pagos: [Mercado Pago – Split Payments 1:1 (Chile)](https://www.mercadopago.cl/developers/es/docs/split-payments/split-1-1/overview) · [Mercado Pago – Integrar marketplace](https://www.mercadopago.cl/developers/es/docs/split-payments/split-1-1/integration-configuration/integrate-marketplace) · [Digitalízame – Comisiones 2026](https://digitalizame.cl/comisiones-pasarelas-de-pago-chile/) · [Riqra – Medios de pago Chile 2026](https://blog.riqra.com/posts/medios-de-pago-chile) · [BestSolution – Comparativa](https://bestsolution.cl/mejor-pasarela-pago-chile/) · [Flow – Preguntas frecuentes](https://web.flow.cl/en-pe/preguntas-frecuentes/tarjetas/) · [Packagist – Webpay Plus Mall](https://root.packagist.org/packages/propultech/magento2-webpay-plus-mall-rest)
- Plataformas comparables: [Superprof MX – Blog](https://www.superprof.mx/blog/profesores-particulares-superprof/) · [TaskRabbit – Cargo de confianza y soporte](https://support.taskrabbit.com/hc/articles/204940570) · [Fiverr – Tarifas 2026](https://vaultleap.com/blog/fiverr-fees-explained-2026) · [Instawork – Cómo funciona](https://www.instawork.com/how-it-works) · [Care.com – Revisión de antecedentes](https://www.care.com/about/safety/background-checks/) · [Chiletrabajos – Empleadores](https://www.chiletrabajos.cl/empleadores/) · [Chilevisión – Plataformas de empleo](https://www.chilevision.cl/noticias/te-ayuda/estas-cesante-estas-son-las-7-plataformas-que-debes-conocer-para-encontrar-trabajo-en-chile/) · [Cazvid – Garzones en Santiago](https://cazvid.com/es/blog/como-contratar-meseros-en-santiago)
- Estafas e identidad: [24horas – Estafas por WhatsApp](https://www.24horas.cl/actualidad/nacional/hola-tienes-tiempo-alertan-de-millonarias-estafas-por-whatsapp-oferta-trabajo) · [BioBio – Señales de oferta falsa](https://www.biobiochile.cl/noticias/servicios/toma-nota/2025/01/07/las-cuatro-senales-que-delatan-una-oferta-laboral-falsa-y-una-posible-estafa-lo-que-no-debes-hacer.shtml) · [Truora – Validación de cédula en Chile](https://blog.truora.com/es/identity-card-validation-in-chile-methods-and-best-practices) · [Didit – Verificación vía Registro Civil](https://didit.me/blog/non-doc-verification-chile-registro-civil/)
- Código del proyecto: `/home/user/TalentlyApp/sql/migrations/018_modalidades_duplicadas_y_catalogo_areas.sql` (catálogo actual de `professional_areas`, base de la taxonomía de dos niveles).

