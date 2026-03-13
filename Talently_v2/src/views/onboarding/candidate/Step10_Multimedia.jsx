// Step 10 — Multimedia (foto de perfil + CV)
import { useState, useRef } from 'react';

const MAX_AVATAR_MB = 5;
const MAX_CV_MB = 10;

function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Step10_Multimedia({ data, onNext, saving, uploadFile }) {
    const [avatarUrl, setAvatarUrl] = useState(data.avatar_url || '');
    const [cvUrl, setCvUrl] = useState(data.cv_url || '');
    const [cvFileName, setCvFileName] = useState('');
    const [cvFileSize, setCvFileSize] = useState('');
    const [uploading, setUploading] = useState(''); // 'avatar' | 'cv' | ''
    const [error, setError] = useState('');

    const avatarRef = useRef(null);
    const cvRef = useRef(null);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Solo se permiten imágenes (JPG, PNG, WebP)');
            return;
        }
        if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
            setError(`La imagen no puede superar ${MAX_AVATAR_MB}MB`);
            return;
        }

        setError('');
        setUploading('avatar');
        try {
            const url = await uploadFile(file, 'image');
            if (url) {
                setAvatarUrl(url);
            } else {
                setError('Error al subir la imagen');
            }
        } catch {
            setError('Error al subir la imagen');
        } finally {
            setUploading('');
        }
    };

    const handleCvUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!validTypes.includes(file.type)) {
            setError('Solo se permiten archivos PDF o DOCX');
            return;
        }
        if (file.size > MAX_CV_MB * 1024 * 1024) {
            setError(`El CV no puede superar ${MAX_CV_MB}MB`);
            return;
        }

        setError('');
        setUploading('cv');
        try {
            const url = await uploadFile(file, 'document');
            if (url) {
                setCvUrl(url);
                setCvFileName(file.name);
                setCvFileSize(formatFileSize(file.size));
            } else {
                setError('Error al subir el documento');
            }
        } catch {
            setError('Error al subir el documento');
        } finally {
            setUploading('');
        }
    };

    const removeCV = () => {
        setCvUrl('');
        setCvFileName('');
        setCvFileSize('');
        if (cvRef.current) cvRef.current.value = '';
    };

    const handleNext = () => {
        onNext({ avatar_url: avatarUrl, cv_url: cvUrl });
    };

    const isUploading = uploading !== '';

    return (
        <>
            {/* Título */}
            <div className="ob-step-heading">
                <h1 className="ob-step-title">
                    Dale cara a tu <span className="ob-step-title-accent">talento</span>
                </h1>
                <p className="ob-step-subtitle">
                    Los perfiles con foto y CV reciben{' '}
                    <strong className="ob-step-subtitle-accent">5x más matches</strong>{' '}
                    por parte de los reclutadores.
                </p>
            </div>

            <div className="ob-content">

                {/* ── Avatar ── */}
                <input
                    type="file"
                    accept="image/*"
                    ref={avatarRef}
                    className="ob-input-hidden"
                    onChange={handleAvatarUpload}
                />
                <div className="ob-avatar-section">
                    <div className="ob-avatar-wrap" onClick={() => avatarRef.current?.click()}>
                        <div className="ob-avatar-circle">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Foto de perfil" className="ob-avatar-img" />
                            ) : (
                                <span className="material-symbols-rounded ob-avatar-placeholder-icon">
                                    person
                                </span>
                            )}
                            {uploading === 'avatar' && (
                                <div className="ob-avatar-uploading">
                                    <span className="ob-avatar-spinner" />
                                </div>
                            )}
                        </div>
                        <div className="ob-avatar-camera-btn" aria-label="Cambiar foto">
                            <span className="material-symbols-rounded">photo_camera</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="ob-avatar-change-btn"
                        onClick={() => avatarRef.current?.click()}
                        disabled={uploading === 'avatar'}
                    >
                        {uploading === 'avatar' ? 'Subiendo…' : avatarUrl ? 'Cambiar foto de perfil' : 'Subir foto de perfil'}
                    </button>
                </div>

                {/* ── CV ── */}
                <div className="ob-cv-section">
                    <h3 className="ob-cv-section-title">
                        <span className="material-symbols-rounded">description</span>
                        Currículum Vitae
                    </h3>

                    <input
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        ref={cvRef}
                        className="ob-input-hidden"
                        onChange={handleCvUpload}
                    />

                    {cvUrl ? (
                        /* Archivo subido */
                        <div className="ob-cv-file-info">
                            <div className="ob-cv-file-icon">
                                <span className="material-symbols-rounded">picture_as_pdf</span>
                            </div>
                            <div className="ob-cv-file-meta">
                                <span className="ob-cv-file-name">{cvFileName || 'CV subido'}</span>
                                {cvFileSize && (
                                    <span className="ob-cv-file-size">{cvFileSize} · Completado</span>
                                )}
                            </div>
                            <button
                                type="button"
                                className="ob-cv-file-remove"
                                onClick={removeCV}
                                aria-label="Eliminar CV"
                            >
                                <span className="material-symbols-rounded">delete</span>
                            </button>
                        </div>
                    ) : (
                        /* Drop zone */
                        <div
                            className={`ob-cv-drop-zone${uploading === 'cv' ? ' ob-cv-drop-zone--loading' : ''}`}
                            onClick={() => !isUploading && cvRef.current?.click()}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && cvRef.current?.click()}
                        >
                            <div className="ob-cv-drop-icon">
                                <span className="material-symbols-rounded">
                                    {uploading === 'cv' ? 'hourglass_empty' : 'cloud_upload'}
                                </span>
                            </div>
                            <p className="ob-cv-drop-text">
                                {uploading === 'cv'
                                    ? 'Subiendo…'
                                    : <><span className="ob-cv-drop-link">Haz clic para subir</span> o arrastra tu CV</>
                                }
                            </p>
                            <p className="ob-cv-drop-hint">Soportamos PDF, DOCX (Máx. {MAX_CV_MB}MB)</p>
                        </div>
                    )}
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="ob-error">
                        <span className="material-symbols-rounded">error</span>
                        {error}
                    </div>
                )}

                {/* ── Privacidad ── */}
                <div className="ob-privacy-notice">
                    <div className="ob-privacy-notice-icon">
                        <span className="material-symbols-rounded">verified_user</span>
                    </div>
                    <div>
                        <p className="ob-privacy-notice-title">Privacidad garantizada</p>
                        <p className="ob-privacy-notice-desc">
                            Tu CV solo será visible para las empresas con las que hagas match mutuamente.
                        </p>
                    </div>
                </div>

            </div>

            {/* Navegación */}
            <div className="ob-nav">
                <button
                    className="ob-nav-btn ob-nav-btn--primary ob-nav-btn--flex"
                    type="button"
                    onClick={handleNext}
                    disabled={saving || isUploading}
                >
                    {saving ? 'Guardando…' : 'Continuar'}
                    {!saving && !isUploading && (
                        <span className="material-symbols-rounded ob-nav-btn-icon">arrow_forward</span>
                    )}
                </button>
            </div>
        </>
    );
}
