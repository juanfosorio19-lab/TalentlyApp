// src/views/candidate/CvView.jsx
// Muestra el CV del candidato o permite subirlo.
// Soporta visualizacion inline (PDF) y upload con validacion.
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, db } from '../../lib/supabase';
import { useApp, Actions } from '../../context/AppContext';
import './CvView.css';

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
];
const ALLOWED_EXT = ['.pdf', '.docx', '.doc'];

export default function CvView() {
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const cvUrl = state.userProfile?.cv_url;
    const fileInputRef = useRef(null);

    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const triggerUpload = () => {
        setUploadError('');
        setUploadSuccess(false);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXT.includes(ext)) {
            setUploadError('Solo se aceptan archivos PDF o DOCX.');
            e.target.value = '';
            return;
        }

        // Validar tamano
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setUploadError('El archivo supera el limite de ' + MAX_SIZE_MB + ' MB.');
            e.target.value = '';
            return;
        }

        setUploading(true);
        setUploadError('');

        try {
            const publicUrl = await db.storage.uploadDocument(file, 'documents');
            if (!publicUrl) throw new Error('Upload fallo');

            // Actualizar cv_url en profiles
            const { data: { user } } = await supabase.auth.getUser();
            const { data: updated } = await supabase
                .from('profiles')
                .update({ cv_url: publicUrl })
                .eq('id', user.id)
                .select()
                .single();

            if (updated) {
                dispatch({ type: Actions.SET_PROFILE, payload: updated });
            }
            setUploadSuccess(true);
        } catch (err) {
            console.error('[CvView] Error al subir CV:', err);
            setUploadError('No se pudo subir el archivo. Intenta de nuevo.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    // Extraer nombre legible del URL
    const fileName = cvUrl
        ? decodeURIComponent(cvUrl.split('/').pop()?.split('_').slice(2).join('_') || 'Mi CV')
        : '';
    const isPdf = cvUrl?.toLowerCase().endsWith('.pdf');

    return (
        <div className="cv-view">
            {/* Input oculto */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            <header className="cv-view__header">
                <button
                    className="cv-view__back"
                    onClick={() => navigate('/app')}
                    aria-label="Volver"
                >
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <h2 className="cv-view__title">Mi CV</h2>
                {cvUrl && (
                    <a
                        className="cv-view__download"
                        href={cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Descargar CV"
                    >
                        <span className="material-symbols-rounded">download</span>
                    </a>
                )}
            </header>

            {/* Feedback de upload */}
            {(uploadError || uploadSuccess) && (
                <div className={`cv-view__feedback ${uploadSuccess ? 'cv-view__feedback--success' : 'cv-view__feedback--error'}`}>
                    <span className="material-symbols-rounded">
                        {uploadSuccess ? 'check_circle' : 'error'}
                    </span>
                    {uploadSuccess ? 'CV actualizado correctamente.' : uploadError}
                </div>
            )}

            {cvUrl ? (
                <div className="cv-view__body">
                    {isPdf ? (
                        <iframe
                            className="cv-view__iframe"
                            src={cvUrl}
                            title="Mi CV"
                        />
                    ) : (
                        <div className="cv-view__file-card">
                            <span className="material-symbols-rounded cv-view__file-icon">
                                description
                            </span>
                            <p className="cv-view__file-name">{fileName}</p>
                            <p className="cv-view__file-hint">
                                Este formato no se puede previsualizar.
                            </p>
                            <a
                                className="cv-view__open-btn"
                                href={cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className="material-symbols-rounded">open_in_new</span>
                                Ver / Descargar
                            </a>
                        </div>
                    )}

                    {/* Barra para reemplazar CV */}
                    <div className="cv-view__replace-bar">
                        <button
                            className="cv-view__replace-btn"
                            onClick={triggerUpload}
                            disabled={uploading}
                        >
                            <span className="material-symbols-rounded">
                                {uploading ? 'sync' : 'upload'}
                            </span>
                            {uploading ? 'Subiendo...' : 'Reemplazar CV'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="cv-view__empty">
                    <span className="material-symbols-rounded cv-view__empty-icon">
                        upload_file
                    </span>
                    <h3 className="cv-view__empty-title">Sin CV todavia</h3>
                    <p className="cv-view__empty-text">
                        Sube tu CV para que las empresas puedan conocer tu experiencia completa.
                    </p>
                    <p className="cv-view__empty-hint">PDF o DOCX · max. {MAX_SIZE_MB} MB</p>
                    <button
                        className="cv-view__upload-btn"
                        onClick={triggerUpload}
                        disabled={uploading}
                    >
                        <span className="material-symbols-rounded">
                            {uploading ? 'sync' : 'upload'}
                        </span>
                        {uploading ? 'Subiendo...' : 'Subir CV'}
                    </button>
                </div>
            )}
        </div>
    );
}
