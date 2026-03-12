// src/views/public/WelcomeView.jsx
// Pantalla de bienvenida — diseño Stitch convertido a CSS variables del proyecto.
// Imagen de fondo: configurar --welcome-bg-url en variables.css o usar gradiente por defecto.
import { useNavigate } from 'react-router-dom';
import './WelcomeView.css';

export default function WelcomeView() {
    const navigate = useNavigate();

    const handleTerms = () => alert('Próximamente');
    const handlePrivacy = () => alert('Próximamente');

    return (
        <div className="welcome-screen">
            {/* ── Capa de fondo ── */}
            <div className="welcome-bg" aria-hidden="true">
                <div className="welcome-bg__overlay" />
            </div>

            {/* ── Contenido ── */}
            <div className="welcome-content">
                {/* Logo + nombre */}
                <div className="welcome-logo-area">
                    <div className="welcome-logo-icon">
                        <span className="material-symbols-rounded">work_outline</span>
                    </div>
                    <h1 className="welcome-brand">Talently</h1>
                </div>

                {/* Titular + tagline + CTAs */}
                <div className="welcome-bottom">
                    <div className="welcome-headline">
                        <h2 className="welcome-title">
                            Encuentra tu <br />
                            <span className="welcome-title__accent">match profesional</span>
                        </h2>
                        <p className="welcome-tagline">
                            Conectamos el mejor talento con empresas increíbles.
                            Desliza hacia tu futuro.
                        </p>
                    </div>

                    <div className="welcome-actions">
                        <button
                            className="welcome-btn welcome-btn--primary"
                            onClick={() => navigate('/register')}
                        >
                            Regístrate
                            <span className="material-symbols-rounded welcome-btn__icon">
                                arrow_forward
                            </span>
                        </button>

                        <button
                            className="welcome-btn welcome-btn--secondary"
                            onClick={() => navigate('/login')}
                        >
                            Inicia sesión
                        </button>

                        <p className="welcome-legal">
                            Al continuar, aceptas nuestros{' '}
                            <button className="welcome-legal-link" onClick={handleTerms}>
                                Términos de Servicio
                            </button>
                            {' '}y{' '}
                            <button className="welcome-legal-link" onClick={handlePrivacy}>
                                Política de Privacidad
                            </button>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
