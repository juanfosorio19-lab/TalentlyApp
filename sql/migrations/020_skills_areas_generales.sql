-- =============================================
-- Talently — Migración 020: skills para las áreas generales (migración 018)
-- Aplicada en Supabase: 2026-06-10
--
-- El paso 8 del onboarding (Habilidades) muestra skills agrupadas por las
-- áreas elegidas en el paso 4. Las 22 áreas nuevas no tenían skills →
-- el paso quedaba vacío para esas áreas (solo permitía skills custom).
-- Se siembran ~10 skills representativas por área. Idempotente.
-- =============================================

INSERT INTO public.skills (name, area_id)
SELECT s.name, pa.id
FROM (VALUES
    ('ingenieria', 'AutoCAD'), ('ingenieria', 'SolidWorks'), ('ingenieria', 'MATLAB'),
    ('ingenieria', 'Gestión de proyectos'), ('ingenieria', 'Lean Manufacturing'), ('ingenieria', 'Six Sigma'),
    ('ingenieria', 'Mantenimiento industrial'), ('ingenieria', 'Control de calidad'), ('ingenieria', 'Dibujo técnico'),
    ('ingenieria', 'Normativa ISO'),

    ('administracion', 'Excel avanzado'), ('administracion', 'Gestión administrativa'), ('administracion', 'Contabilidad'),
    ('administracion', 'Facturación'), ('administracion', 'Compras y abastecimiento'), ('administracion', 'Gestión documental'),
    ('administracion', 'SAP'), ('administracion', 'Planificación'), ('administracion', 'Reportería'),
    ('administracion', 'Gestión de proveedores'),

    ('arquitectura', 'AutoCAD'), ('arquitectura', 'Revit'), ('arquitectura', 'SketchUp'),
    ('arquitectura', 'BIM'), ('arquitectura', 'Diseño arquitectónico'), ('arquitectura', 'Renderizado 3D'),
    ('arquitectura', 'Normativa de construcción'), ('arquitectura', 'Gestión de obras'), ('arquitectura', 'Urbanismo'),
    ('arquitectura', 'Paisajismo'),

    ('legal', 'Derecho laboral'), ('legal', 'Derecho corporativo'), ('legal', 'Redacción de contratos'),
    ('legal', 'Litigios'), ('legal', 'Compliance'), ('legal', 'Propiedad intelectual'),
    ('legal', 'Derecho tributario'), ('legal', 'Negociación'), ('legal', 'Due diligence'),
    ('legal', 'Protección de datos'),

    ('educacion', 'Planificación de clases'), ('educacion', 'Evaluación de aprendizajes'), ('educacion', 'Educación diferencial'),
    ('educacion', 'Manejo de aula'), ('educacion', 'E-learning'), ('educacion', 'Diseño curricular'),
    ('educacion', 'Tutoría y orientación'), ('educacion', 'Moodle'), ('educacion', 'Educación inicial'),
    ('educacion', 'Convivencia escolar'),

    ('salud', 'Atención de pacientes'), ('salud', 'Primeros auxilios'), ('salud', 'Enfermería'),
    ('salud', 'Toma de muestras'), ('salud', 'Fichas clínicas'), ('salud', 'Farmacología'),
    ('salud', 'Atención de urgencias'), ('salud', 'Kinesiología'), ('salud', 'Salud ocupacional'),
    ('salud', 'Bioseguridad'),

    ('construccion', 'Lectura de planos'), ('construccion', 'Supervisión de obras'), ('construccion', 'Presupuestos de obra'),
    ('construccion', 'Topografía'), ('construccion', 'Prevención de riesgos'), ('construccion', 'Hormigón armado'),
    ('construccion', 'Instalaciones eléctricas'), ('construccion', 'Gasfitería'), ('construccion', 'Soldadura'),
    ('construccion', 'Terminaciones'),

    ('logistica-transporte', 'Gestión de bodega'), ('logistica-transporte', 'Control de inventario'), ('logistica-transporte', 'Distribución'),
    ('logistica-transporte', 'Licencia profesional'), ('logistica-transporte', 'Comercio exterior'), ('logistica-transporte', 'WMS'),
    ('logistica-transporte', 'Planificación de rutas'), ('logistica-transporte', 'Grúa horquilla'), ('logistica-transporte', 'Cadena de suministro'),
    ('logistica-transporte', 'Despacho aduanero'),

    ('manufactura-produccion', 'Operación de maquinaria'), ('manufactura-produccion', 'Control de producción'), ('manufactura-produccion', 'BPM'),
    ('manufactura-produccion', 'HACCP'), ('manufactura-produccion', 'Mantención preventiva'), ('manufactura-produccion', 'Empaque y embalaje'),
    ('manufactura-produccion', 'Línea de producción'), ('manufactura-produccion', 'Control de calidad'), ('manufactura-produccion', 'Inocuidad alimentaria'),
    ('manufactura-produccion', 'Metodología 5S'),

    ('mineria-energia', 'Operación de equipos mineros'), ('mineria-energia', 'Geología'), ('mineria-energia', 'Prevención de riesgos'),
    ('mineria-energia', 'Perforación y tronadura'), ('mineria-energia', 'Plantas de proceso'), ('mineria-energia', 'Mantenimiento de equipos'),
    ('mineria-energia', 'Energías renovables'), ('mineria-energia', 'Electricidad industrial'), ('mineria-energia', 'Hidráulica'),
    ('mineria-energia', 'Normativa SERNAGEOMIN'),

    ('agro-medioambiente', 'Manejo de cultivos'), ('agro-medioambiente', 'Riego tecnificado'), ('agro-medioambiente', 'Control de plagas'),
    ('agro-medioambiente', 'Cosecha y postcosecha'), ('agro-medioambiente', 'Gestión ambiental'), ('agro-medioambiente', 'GlobalGAP'),
    ('agro-medioambiente', 'Maquinaria agrícola'), ('agro-medioambiente', 'Viveros'), ('agro-medioambiente', 'Evaluación de impacto ambiental'),
    ('agro-medioambiente', 'Sustentabilidad'),

    ('turismo-gastronomia', 'Atención al cliente'), ('turismo-gastronomia', 'Cocina nacional e internacional'), ('turismo-gastronomia', 'Pastelería'),
    ('turismo-gastronomia', 'Bartending'), ('turismo-gastronomia', 'Servicio de salón'), ('turismo-gastronomia', 'Gestión hotelera'),
    ('turismo-gastronomia', 'Gestión de reservas'), ('turismo-gastronomia', 'Inglés para turismo'), ('turismo-gastronomia', 'Higiene alimentaria'),
    ('turismo-gastronomia', 'Eventos y banquetería'),

    ('retail-comercio', 'Ventas en tienda'), ('retail-comercio', 'Caja y arqueo'), ('retail-comercio', 'Reposición'),
    ('retail-comercio', 'Visual merchandising'), ('retail-comercio', 'Atención al cliente'), ('retail-comercio', 'Manejo de inventario'),
    ('retail-comercio', 'Punto de venta (POS)'), ('retail-comercio', 'Prevención de pérdidas'), ('retail-comercio', 'Gestión de tienda'),
    ('retail-comercio', 'E-commerce'),

    ('comunicaciones-medios', 'Redacción periodística'), ('comunicaciones-medios', 'Edición de video'), ('comunicaciones-medios', 'Producción audiovisual'),
    ('comunicaciones-medios', 'Community management'), ('comunicaciones-medios', 'Fotografía'), ('comunicaciones-medios', 'Locución'),
    ('comunicaciones-medios', 'Relaciones públicas'), ('comunicaciones-medios', 'Diseño gráfico'), ('comunicaciones-medios', 'Storytelling'),
    ('comunicaciones-medios', 'Gestión de prensa'),

    ('ciencia-investigacion', 'Metodología de investigación'), ('ciencia-investigacion', 'Análisis estadístico'), ('ciencia-investigacion', 'Trabajo de laboratorio'),
    ('ciencia-investigacion', 'Redacción científica'), ('ciencia-investigacion', 'R'), ('ciencia-investigacion', 'Python'),
    ('ciencia-investigacion', 'Revisión bibliográfica'), ('ciencia-investigacion', 'Ensayos clínicos'), ('ciencia-investigacion', 'Biotecnología'),
    ('ciencia-investigacion', 'Publicaciones académicas'),

    ('atencion-cliente', 'Servicio al cliente'), ('atencion-cliente', 'Call center'), ('atencion-cliente', 'Resolución de conflictos'),
    ('atencion-cliente', 'CRM'), ('atencion-cliente', 'Gestión de reclamos'), ('atencion-cliente', 'Comunicación efectiva'),
    ('atencion-cliente', 'Ventas telefónicas'), ('atencion-cliente', 'Soporte técnico'), ('atencion-cliente', 'Atención por chat'),
    ('atencion-cliente', 'Fidelización'),

    ('banca-seguros', 'Análisis de crédito'), ('banca-seguros', 'Riesgo financiero'), ('banca-seguros', 'Productos financieros'),
    ('banca-seguros', 'Normativa CMF'), ('banca-seguros', 'Seguros generales'), ('banca-seguros', 'Seguros de vida'),
    ('banca-seguros', 'Inversiones'), ('banca-seguros', 'Cobranza'), ('banca-seguros', 'Banca digital'),
    ('banca-seguros', 'Prevención de lavado de activos'),

    ('gobierno-ong', 'Gestión pública'), ('gobierno-ong', 'Formulación de proyectos sociales'), ('gobierno-ong', 'Postulación a fondos'),
    ('gobierno-ong', 'Políticas públicas'), ('gobierno-ong', 'Trabajo comunitario'), ('gobierno-ong', 'Compras públicas'),
    ('gobierno-ong', 'Transparencia'), ('gobierno-ong', 'Cooperación internacional'), ('gobierno-ong', 'Gestión de voluntariado'),
    ('gobierno-ong', 'Evaluación de programas'),

    ('arte-entretenimiento', 'Producción de eventos'), ('arte-entretenimiento', 'Actuación'), ('arte-entretenimiento', 'Música'),
    ('arte-entretenimiento', 'Ilustración'), ('arte-entretenimiento', 'Animación'), ('arte-entretenimiento', 'Escenografía'),
    ('arte-entretenimiento', 'Gestión cultural'), ('arte-entretenimiento', 'Danza'), ('arte-entretenimiento', 'Curatoría'),
    ('arte-entretenimiento', 'Sonido en vivo'),

    ('deporte-bienestar', 'Entrenamiento personal'), ('deporte-bienestar', 'Preparación física'), ('deporte-bienestar', 'Nutrición deportiva'),
    ('deporte-bienestar', 'Yoga'), ('deporte-bienestar', 'Masoterapia'), ('deporte-bienestar', 'Planificación deportiva'),
    ('deporte-bienestar', 'Primeros auxilios'), ('deporte-bienestar', 'Recreación'), ('deporte-bienestar', 'Coaching'),
    ('deporte-bienestar', 'Actividad física adulto mayor'),

    ('seguridad-prevencion', 'Prevención de riesgos'), ('seguridad-prevencion', 'Normativa de seguridad laboral'), ('seguridad-prevencion', 'Investigación de accidentes'),
    ('seguridad-prevencion', 'Planes de emergencia'), ('seguridad-prevencion', 'Seguridad privada'), ('seguridad-prevencion', 'Monitoreo CCTV'),
    ('seguridad-prevencion', 'Control de acceso'), ('seguridad-prevencion', 'Uso de extintores'), ('seguridad-prevencion', 'ISO 45001'),
    ('seguridad-prevencion', 'Capacitación en seguridad'),

    ('inmobiliaria', 'Corretaje de propiedades'), ('inmobiliaria', 'Tasación'), ('inmobiliaria', 'Gestión de arriendos'),
    ('inmobiliaria', 'Venta inmobiliaria'), ('inmobiliaria', 'Marketing inmobiliario'), ('inmobiliaria', 'Contratos de compraventa'),
    ('inmobiliaria', 'Administración de edificios'), ('inmobiliaria', 'Evaluación de proyectos'), ('inmobiliaria', 'Postventa inmobiliaria'),
    ('inmobiliaria', 'Atención de clientes')
) AS s(slug, name)
JOIN public.professional_areas pa ON pa.slug = s.slug
WHERE NOT EXISTS (
    SELECT 1 FROM public.skills k WHERE k.area_id = pa.id AND k.name = s.name
);
