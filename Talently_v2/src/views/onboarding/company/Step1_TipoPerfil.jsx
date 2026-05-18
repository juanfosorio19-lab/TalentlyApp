// Company Step 1 — Tipo de perfil (Candidato / Empresa)
// Reutiliza el mismo patrón que el step 1 de candidato
import { useState } from 'react';

export default function Step1_TipoPerfil({ data, onNext, saving }) {
    const [selected, setSelected] = useState(data.user_type || 'company');

    const handleNext = () => {
        if (!selected) return;
        onNext({ user_type: selected });
    };

    return (
        <>
            <h2 className="ob-title">¿Cómo quieres usar Talently?</h2>
            <p className="ob-subtitle">Elige tu tipo de perfil para personalizar tu experiencia.</p>

            <div className="ob-content">
                <div className="ob-cards">
                    <button
                        className={`ob-card ${selected === 'candidate' ? 'ob-card--selected' : ''}`}
                        onClick={() => setSelected('candidate')}
                    >
                        <div className="ob-card-icon ob-card-icon--primary">
                            <span className="material-symbols-rounded">person</span>
                        </div>
                        <span className="ob-card-label">Soy Candidato</span>
                        <span className="ob-card-desc">Busco oportunidades laborales</span>
                    </button>

                    <button
                        className={`ob-card ${selected === 'company' ? 'ob-card--selected' : ''}`}
                        onClick={() => setSelected('company')}
                    >
                        <div className="ob-card-icon ob-card-icon--success">
                            <span className="material-symbols-rounded">business</span>
                        </div>
                        <span className="ob-card-label">Soy Empresa</span>
                        <span className="ob-card-desc">Busco talento para mi equipo</span>
                    </button>
                </div>
            </div>

            <div className="ob-nav">
                <button className="ob-nav-btn ob-nav-btn--primary" onClick={handleNext} disabled={!selected || saving}>
                    {saving ? 'Guardando…' : 'Siguiente'}
                </button>
            </div>
        </>
    );
}
