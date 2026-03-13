// Step 1 — Tipo de perfil (Candidato / Empresa)
import { useState } from 'react';

export default function Step1_TipoPerfil({ data, onNext, saving }) {
    const [selected, setSelected] = useState(data.user_type || '');

    const handleNext = () => {
        if (!selected) return;
        onNext({ user_type: selected });
    };

    return (
        <>
            {/* Título */}
            <div className="ob-hero-text">
                <h1 className="ob-hero-title">¡Hola! 👋<br />¿Quién eres?</h1>
                <p className="ob-hero-subtitle">
                    Selecciona tu rol para personalizar tu experiencia en{' '}
                    <span className="ob-hero-brand">Talently</span>.
                </p>
            </div>

            {/* Tarjetas de tipo */}
            <div className="ob-content">
                <div className="ob-cards">

                    {/* Candidato */}
                    <button
                        className={`ob-card ob-card--rich${selected === 'candidate' ? ' ob-card--selected' : ''}`}
                        type="button"
                        onClick={() => setSelected('candidate')}
                    >
                        <div className="ob-card-icon-wrap ob-card-icon-wrap--blue">
                            <span className="material-symbols-rounded">person_search</span>
                        </div>
                        <div className="ob-card-body">
                            <h3 className="ob-card-body-title">Soy Candidato</h3>
                            <p className="ob-card-body-desc">
                                Busco nuevas oportunidades laborales y quiero conectar con empresas top.
                            </p>
                            <ul className="ob-card-features">
                                <li className="ob-card-feature">
                                    <span className="material-symbols-rounded ob-card-feature-check">check_circle</span>
                                    Encuentra ofertas relevantes
                                </li>
                                <li className="ob-card-feature">
                                    <span className="material-symbols-rounded ob-card-feature-check">check_circle</span>
                                    Swipe para hacer match
                                </li>
                            </ul>
                        </div>
                        <span className="material-symbols-rounded ob-card-radio">
                            {selected === 'candidate' ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </span>
                    </button>

                    {/* Empresa */}
                    <button
                        className={`ob-card ob-card--rich${selected === 'company' ? ' ob-card--selected' : ''}`}
                        type="button"
                        onClick={() => setSelected('company')}
                    >
                        <div className="ob-card-icon-wrap ob-card-icon-wrap--purple">
                            <span className="material-symbols-rounded">business</span>
                        </div>
                        <div className="ob-card-body">
                            <h3 className="ob-card-body-title">Soy Empresa</h3>
                            <p className="ob-card-body-desc">
                                Busco el mejor talento tecnológico para unirse a mi equipo.
                            </p>
                            <ul className="ob-card-features">
                                <li className="ob-card-feature">
                                    <span className="material-symbols-rounded ob-card-feature-check">check_circle</span>
                                    Publica ofertas de empleo
                                </li>
                                <li className="ob-card-feature">
                                    <span className="material-symbols-rounded ob-card-feature-check">check_circle</span>
                                    Explora perfiles verificados
                                </li>
                            </ul>
                        </div>
                        <span className="material-symbols-rounded ob-card-radio">
                            {selected === 'company' ? 'radio_button_checked' : 'radio_button_unchecked'}
                        </span>
                    </button>

                </div>
            </div>

            {/* Navegación */}
            <div className="ob-nav ob-nav--with-legal">
                <button
                    className="ob-nav-btn ob-nav-btn--primary ob-nav-btn--flex"
                    type="button"
                    onClick={handleNext}
                    disabled={!selected || saving}
                >
                    {saving ? 'Guardando…' : 'Continuar'}
                    {!saving && (
                        <span className="material-symbols-rounded ob-nav-btn-icon">arrow_forward</span>
                    )}
                </button>
                <p className="ob-legal">
                    Al continuar, aceptas nuestros{' '}
                    <span className="ob-legal-link">Términos</span>
                    {' '}y{' '}
                    <span className="ob-legal-link">Privacidad</span>.
                </p>
            </div>
        </>
    );
}
