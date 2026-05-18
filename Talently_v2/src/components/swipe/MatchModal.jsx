// src/components/swipe/MatchModal.jsx
// Modal animado "¡Es un Match!" — diseño Stitch
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './MatchModal.css';

export default function MatchModal({ matchedProfile, matchId, onClose }) {
    const navigate = useNavigate();
    const { state } = useApp();
    const myProfile = state.userProfile;

    const myAvatar      = myProfile?.avatar_url;
    const matchAvatar   = matchedProfile?.avatar_url || matchedProfile?.company_logo;
    const matchName     = matchedProfile?.company_name || matchedProfile?.full_name || 'este perfil';

    const handleSendMessage = () => {
        onClose();
        if (matchId) navigate(`/app/messages/${matchId}`);
    };

    return (
        <div className="match-modal" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div className="match-modal__backdrop" onClick={onClose} />

            {/* Panel principal */}
            <div className="match-modal__content">
                {/* Botón cerrar */}
                <button
                    className="match-modal__close"
                    onClick={onClose}
                    aria-label="Cerrar"
                >
                    <span className="material-symbols-rounded">close</span>
                </button>

                {/* Título */}
                <div className="match-modal__heading">
                    <h1 className="match-modal__title">¡Es un Match!</h1>
                    <p className="match-modal__subtitle">
                        Tú y{' '}
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                            {matchName}
                        </span>{' '}
                        se gustan.
                    </p>
                </div>

                {/* Avatares con anillos de pulso */}
                <div className="match-modal__avatars-wrap">
                    {/* Anillos animados */}
                    <div className="match-modal__ring match-modal__ring--1" />
                    <div className="match-modal__ring match-modal__ring--2" />

                    {/* Avatar usuario (izquierda) */}
                    <div className="match-modal__avatar-card match-modal__avatar-card--left">
                        {myAvatar ? (
                            <img src={myAvatar} alt="Tú" className="match-modal__avatar-img" draggable={false} />
                        ) : (
                            <div className="match-modal__avatar-placeholder">
                                <span className="material-symbols-rounded">person</span>
                            </div>
                        )}
                        <div className="match-modal__avatar-badge">
                            <span className="material-symbols-rounded">person</span>
                        </div>
                    </div>

                    {/* Corazón central */}
                    <div className="match-modal__heart">
                        <span className="material-symbols-rounded">favorite</span>
                    </div>

                    {/* Avatar match (derecha) */}
                    <div className="match-modal__avatar-card match-modal__avatar-card--right">
                        {matchAvatar ? (
                            <img src={matchAvatar} alt={matchName} className="match-modal__avatar-img" draggable={false} />
                        ) : (
                            <div className="match-modal__avatar-placeholder">
                                <span className="material-symbols-rounded">business</span>
                            </div>
                        )}
                        <div className="match-modal__avatar-badge match-modal__avatar-badge--company">
                            <span className="material-symbols-rounded">business</span>
                        </div>
                    </div>
                </div>

                {/* Tip */}
                <p className="match-modal__tip">
                    Ahora pueden chatear directamente y agendar una entrevista.
                </p>

                {/* Acciones */}
                <div className="match-modal__actions">
                    <button
                        className="match-modal__btn match-modal__btn--primary"
                        onClick={handleSendMessage}
                    >
                        <span className="material-symbols-rounded">chat</span>
                        Enviar mensaje
                    </button>
                    <button
                        className="match-modal__btn match-modal__btn--secondary"
                        onClick={onClose}
                    >
                        Seguir explorando
                    </button>
                </div>
            </div>
        </div>
    );
}
