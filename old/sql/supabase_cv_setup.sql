-- -----------------------------------------------------------------------------
-- Configuración de Currículum para Perfil de Candidato
-- Ejecutar este código en el SQL Editor de Supabase
-- -----------------------------------------------------------------------------

-- 1. Asegurarnos que existe el Bucket "documents" público
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true) 
ON CONFLICT (id) DO NOTHING;

-- 2. Habilitar Políticas de Acceso para los documentos
-- Lectura pública (cualquier persona puede ver o descargar los CVs)
CREATE POLICY "Lectura Publica" ON storage.objects FOR SELECT USING (bucket_id = 'documents');

-- Subida autenticada (solo usuarios logueados pueden subir PDFs)
CREATE POLICY "Subida Permitida" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Actualización autenticada
CREATE POLICY "Actualizacion Permitida" ON storage.objects FOR UPDATE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Borrado autenticado
CREATE POLICY "Borrado Permitido" ON storage.objects FOR DELETE USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- 3. Añadir la columna de url del CV a la tabla de perfiles (si no existe)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cv_url TEXT;
