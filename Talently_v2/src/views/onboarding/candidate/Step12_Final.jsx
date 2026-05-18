// Step 12 — Pantalla final (completeOnboarding)
import { useApp } from '../../../context/AppContext';

export default function Step12_Final({ data, onNext, saving }) {
    const { state } = useApp();

    // Datos del perfil: prefiere state (actualizado en saveStep), cae a data (formData)
    const profile = state.userProfile;
    const name = profile?.full_name || data?.full_name || '';
    const avatarUrl = profile?.avatar_url || data?.avatar_url || '';
    const displayName = name.split(' ')[0] || 'Tú';

    return (
        <div className="ob-final-screen">
            {/* Blob de fondo */}
            <div className="ob-final-bg-blob" />

            {/* Hero — checkmark animado */}
            <div className="ob-final-hero">
                {/* Partículas flotantes */}
                <div className="ob-final-particle ob-final-particle--1" />
                <div className="ob-final-particle ob-final-particle--2" />
                <div className="ob-final-particle ob-final-particle--3" />
                <div className="ob-final-particle ob-final-particle--4" />

                {/* Círculo de check */}
                <div className="ob-final-check-wrap">
                    <div className="ob-final-check-ring ob-final-check-ring--outer" />
                    <div className="ob-final-check-ring ob-final-check-ring--inner" />
                    <div className="ob-final-check-circle">
                        <span className="material-symbols-rounded ob-final-check-icon">check</span>
                    </div>
                </div>
            </div>

            {/* Badge de usuario */}
            <div className="ob-final-user-badge">
                <div className="ob-final-user-avatar">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="ob-final-avatar-img" />
                    ) : (
                        <span className="material-symbols-rounded ob-final-avatar-placeholder">person</span>
                    )}
                </div>
                <div className="ob-final-user-meta">
                    {displayName && (
                        <span className="ob-final-user-name">{displayName}</span>
                    )}
                    <div className="ob-final-user-status">
                        <span className="ob-final-status-dot" />
                        <span className="ob-final-status-label">Perfil al 100%</span>
                    </div>
                </div>
            </div>

            {/* Texto */}
            <div className="ob-final-text">
                <h1 className="ob-final-title-stitch">¡Tu perfil está listo!</h1>
                <p className="ob-final-desc-stitch">
                    ¡Excelente trabajo! Ya tienes todo lo necesario para conectar con
                    las mejores oportunidades tecnológicas.
                </p>
            </div>

            {/* CTA */}
            <div className="ob-final-cta">
                <button
                    className="ob-nav-btn ob-nav-btn--primary ob-nav-btn--flex"
                    type="button"
                    onClick={() => onNext({})}
                    disabled={saving}
                >
                    {saving ? 'Finalizando…' : 'Empezar a explorar'}
                    {!saving && (
                        <span className="material-symbols-rounded ob-nav-btn-icon">arrow_forward</span>
                    )}
                </button>
                <p className="ob-final-legal">
                    Al continuar aceptas nuestros Términos y Condiciones
                </p>
            </div>
        </div>
    );
}
