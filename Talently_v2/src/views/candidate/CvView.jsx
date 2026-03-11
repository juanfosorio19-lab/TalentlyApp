// src/views/candidate/CvView.jsx
// Muestra el CV subido por el candidato o invita a subirlo.
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './CvView.css';

export default function CvView() {
    const navigate = useNavigate();
    const { state } = useApp();
    const cvUrl = state.userProfile?.cv_url;

    return (
        <div className="cv-view">
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

            {cvUrl ? (
                <div className="cv-view__body">
                    {/* Si es PDF, intentar mostrarlo en un iframe */}
                    {cvUrl.toLowerCase().endsWith('.pdf') ? (
                        <iframe
                            className="cv-view__iframe"
                            src={cvUrl}
                            title="Mi CV"
                        />
                    ) : (
                        /* Para DOCX u otros formatos, solo ofrecer descarga */
                        <div className="cv-view__file-card">
                            <span className="material-symbols-rounded cv-view__file-icon">
                                description
                            </span>
                            <p className="cv-view__file-name">
                                {cvUrl.split('/').pop()?.split('_').slice(2).join('_') || 'Mi CV'}
                            </p>
                            <p className="cv-view__file-hint">
                                Este formato no se puede previsualizar.<br />Descárgalo para verlo.
                            </p>
                            <a
                                className="cv-view__open-btn"
                                href={cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className="material-symbols-rounded">open_in_new</span>
                                Abrir / Descargar
                            </a>
                        </div>
                    )}
                </div>
            ) : (
                <div className="cv-view__empty">
                    <span className="material-symbols-rounded cv-view__empty-icon">
                        upload_file
                    </span>
                    <h3 className="cv-view__empty-title">Sin CV todavía</h3>
                    <p className="cv-view__empty-text">
                        Sube tu CV para que las empresas puedan conocer tu experiencia completa.
                    </p>
                    <button
                        className="cv-view__upload-btn"
                        onClick={() => navigate('/onboarding/candidate')}
                    >
                        <span className="material-symbols-rounded">upload</span>
                        Subir mi CV
                    </button>
                </div>
            )}
        </div>
    );
}
