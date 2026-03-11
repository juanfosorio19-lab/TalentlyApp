// src/views/candidate/MatchesView.jsx
// Lista de matches del candidato con acceso directo al chat.
// Accesible como vista standalone en /app/matches.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/supabase';
import './MatchesView.css';

function formatMatchDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return date.toLocaleDateString('es', { weekday: 'long' });
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

// isTab=true → sin header propio, height:100% (para embeber en MainApp)
export default function MatchesView({ isTab = false }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const loadMatches = async () => {
            setLoading(true);
            try {
                const { data: rawMatches, error } = await db.matches.get();
                if (error) {
                    console.error('[MatchesView] Error cargando matches:', error);
                    return;
                }

                // Enriquecer con perfil del otro usuario
                const enriched = await Promise.all(
                    (rawMatches || []).map(async (match) => {
                        const otherId =
                            match.user_id_1 === user.id ? match.user_id_2 : match.user_id_1;
                        const { data: otherProfile } = await db.profiles.getById(otherId);

                        return {
                            matchId: match.id,
                            createdAt: match.created_at,
                            otherProfile: otherProfile || { full_name: 'Usuario' },
                        };
                    })
                );

                // Ordenar por más reciente primero
                enriched.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );

                setMatches(enriched);
            } catch (err) {
                console.error('[MatchesView] Error:', err);
            } finally {
                setLoading(false);
            }
        };

        loadMatches();
    }, [user]);

    // ── Header (solo en modo standalone) ──
    const header = !isTab ? (
        <div className="matches-view__header">
            <button
                className="matches-view__back"
                onClick={() => navigate('/app')}
                aria-label="Volver"
            >
                <span className="material-symbols-rounded">arrow_back</span>
            </button>
            <h2 className="matches-view__title">Matches</h2>
        </div>
    ) : null;

    // ── Loading ──
    if (loading) {
        return (
            <div className={`matches-view ${isTab ? 'matches-view--tab' : ''}`}>
                {header}
                <div className="matches-view__loading">
                    <div className="matches-view__spinner" />
                </div>
            </div>
        );
    }

    // ── Sin matches ──
    if (matches.length === 0) {
        return (
            <div className={`matches-view ${isTab ? 'matches-view--tab' : ''}`}>
                {header}
                <div className="matches-view__empty">
                    <span className="material-symbols-rounded matches-view__empty-icon">
                        favorite_border
                    </span>
                    <h3 className="matches-view__empty-title">Sin matches todavía</h3>
                    <p className="matches-view__empty-text">
                        ¡Sigue explorando! Cuando hagas match con alguien aparecerá aquí.
                    </p>
                    <button
                        className="matches-view__explore-btn"
                        onClick={() => navigate('/app')}
                    >
                        <span className="material-symbols-rounded">swap_horiz</span>
                        Explorar
                    </button>
                </div>
            </div>
        );
    }

    // ── Lista de matches ──
    return (
        <div className={`matches-view ${isTab ? 'matches-view--tab' : ''}`}>
            {header}
            <p className="matches-view__count">
                {matches.length} match{matches.length !== 1 ? 'es' : ''}
            </p>
            <div className="matches-view__list">
                {matches.map(({ matchId, createdAt, otherProfile }) => {
                    const initial = (otherProfile.full_name || '?')[0].toUpperCase();
                    const isCompany = otherProfile.user_type === 'company';
                    const displayName =
                        otherProfile.company_name || otherProfile.full_name || 'Usuario';
                    const displaySub =
                        otherProfile.company_sector || otherProfile.headline || null;
                    const avatarSrc =
                        otherProfile.company_logo || otherProfile.avatar_url || null;

                    return (
                        <div
                            key={matchId}
                            className="matches-view__item"
                            onClick={() => navigate(`/app/messages/${matchId}`)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') navigate(`/app/messages/${matchId}`);
                            }}
                        >
                            {/* Avatar */}
                            {avatarSrc ? (
                                <img
                                    className="matches-view__avatar"
                                    src={avatarSrc}
                                    alt={displayName}
                                />
                            ) : (
                                <div className={`matches-view__avatar-fallback ${isCompany ? 'matches-view__avatar-fallback--company' : ''}`}>
                                    {isCompany
                                        ? <span className="material-symbols-rounded">business</span>
                                        : initial
                                    }
                                </div>
                            )}

                            {/* Info */}
                            <div className="matches-view__info">
                                <p className="matches-view__name">{displayName}</p>
                                {displaySub && (
                                    <p className="matches-view__sub">{displaySub}</p>
                                )}
                            </div>

                            {/* Meta */}
                            <div className="matches-view__meta">
                                <span className="matches-view__date">{formatMatchDate(createdAt)}</span>
                                <span className="material-symbols-rounded matches-view__arrow">
                                    chevron_right
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
