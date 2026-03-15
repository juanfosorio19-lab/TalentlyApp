// src/views/candidate/CvView.jsx
// Visualizador / uploader de CV del candidato — diseño Stitch
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

// Extrae fecha de subida desde el timestamp en el path del Storage
function extractUploadDate(url) {
    if (!url) return null;
    const segment = decodeURIComponent(url.split('/').pop() || '');
    const ts = parseInt(segment.split('_')[0], 10);
    if (!ts || isNaN(ts) || ts < 1_000_000_000_000) return null;
    return new Date(ts).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Extrae nombre legible desde la URL
function extractFileName(url) {
    if (!url) return 'Mi CV';
    const segment = decodeURIComponent(url.split('/').pop() || '');
    // Formato: {timestamp}_{originalName}  →  quitar el prefijo
    const parts = segment.split('_');
    return parts.length > 1 ? parts.slice(1).join('_') : segment;
}

export default function CvView() {
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const cvUrl   = state.userProfile?.cv_url;
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

        // Validar tamaño
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setUploadError(`El archivo supera el límite de ${MAX_SIZE_MB} MB.`);
            e.target.value = '';
            return;
        }

        setUploading(true);
        setUploadError('');

        try {
            const publicUrl = await db.storage.uploadDocument(file, 'documents');
            if (!publicUrl) throw new Error('Upload falló');

            const { data: { user } } = await supabase.auth.getUser();
            const { data: updated } = await supabase
                .from('profiles')
                .update({ cv_url: publicUrl })
                .eq('id', user.id)
                .select()
                .single();

            if (updated) dispatch({ type: Actions.SET_PROFILE, payload: updated });
            setUploadSuccess(true);
        } catch (err) {
            console.error('[CvView]', err);
            setUploadError('No se pudo subir el archivo. Intenta de nuevo.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const isPdf      = cvUrl?.toLowerCase().includes('.pdf');
    const fileName   = extractFileName(cvUrl);
    const uploadDate = extractUploadDate(cvUrl);

    return (
        <div className="cvv">
            {/* Input oculto — sin <form> */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {/* ── Header ── */}
            <header className="cvv__header">
                <button className="cvv__back" onClick={() => navigate(-1)} aria-label="Volver">
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <h1 className="cvv__title">Mi CV</h1>
                {cvUrl && (
                    <a
                        className="cvv__download"
                        href={cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Descargar"
                    >
                        <span className="material-symbols-rounded">download</span>
                    </a>
                )}
            </header>

            {/* ── Scroll ── */}
            <div className="cvv__scroll">

                {/* ── Feedback banner ── */}
                {(uploadSuccess || uploadError) && (
                    <div className={`cvv__banner ${uploadSuccess ? 'cvv__banner--success' : 'cvv__banner--error'}`}>
                        <span className="material-symbols-rounded">
                            {uploadSuccess ? 'check_circle' : 'error'}
                        </span>
                        <p>{uploadSuccess ? '¡Tu CV se ha subido con éxito!' : uploadError}</p>
                    </div>
                )}

                {cvUrl ? (
                    /* ── Estado: CON CV ── */
                    <div className="cvv__card">
                        {/* File info row */}
                        <div className="cvv__file-row">
                            <div className={`cvv__file-icon-wrap ${isPdf ? 'cvv__file-icon-wrap--pdf' : 'cvv__file-icon-wrap--doc'}`}>
                                <span className="material-symbols-rounded">
                                    {isPdf ? 'picture_as_pdf' : 'description'}
                                </span>
                            </div>
                            <div className="cvv__file-info">
                                <p className="cvv__file-name">{fileName}</p>
                                <p className="cvv__file-meta">
                                    {uploadDate ? `Subido el ${uploadDate}` : 'CV subido'}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="cvv__actions">
                            <button
                                className="cvv__btn cvv__btn--view"
                                onClick={() => window.open(cvUrl, '_blank', 'noopener,noreferrer')}
                            >
                                <span className="material-symbols-rounded">visibility</span>
                                Ver CV
                            </button>
                            <button
                                className="cvv__btn cvv__btn--replace"
                                onClick={triggerUpload}
                                disabled={uploading}
                            >
                                <span className="material-symbols-rounded">
                                    {uploading ? 'sync' : 'autorenew'}
                                </span>
                                {uploading ? 'Subiendo…' : 'Reemplazar CV'}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ── Estado: SIN CV ── */
                    <div className="cvv__card cvv__card--empty">
                        <div className="cvv__empty-icon-wrap">
                            <span className="material-symbols-rounded cvv__empty-icon">description</span>
                            <div className="cvv__empty-icon-badge">
                                <span className="material-symbols-rounded">add</span>
                            </div>
                        </div>
                        <h2 className="cvv__empty-title">No has subido tu CV todavía</h2>
                        <p className="cvv__empty-text">
                            Sube tu currículum para que los reclutadores puedan conocer tu perfil profesional.
                        </p>
                        <button
                            className="cvv__btn cvv__btn--upload"
                            onClick={triggerUpload}
                            disabled={uploading}
                        >
                            <span className="material-symbols-rounded">
                                {uploading ? 'sync' : 'upload_file'}
                            </span>
                            {uploading ? 'Subiendo…' : 'Subir CV'}
                        </button>
                        <p className="cvv__format-hint">
                            Formatos aceptados:&nbsp;
                            <strong>PDF, DOCX</strong> — máx {MAX_SIZE_MB} MB
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
