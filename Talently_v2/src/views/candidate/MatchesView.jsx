// src/views/candidate/MatchesView.jsx
// Lista de matches — diseño Stitch
// isTab=true → sin header propio, height:100% (para embeber en MainApp)
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/supabase';
import { Spinner, EmptyState } from '../../components/ui';
import './MatchesView.css';

const NEW_DAYS = 3; // matches en los últimos N días se consideran "nuevos"

function formatMatchDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return 'hace ' + diffDays + ' días';
    if (diffDays < 30) return 'hace 1 sem.';
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

function isNew(dateStr) {
    if (!dateStr) return false;
    return (Date.now() - new Date(dateStr)) < NEW_DAYS * 86400000;
}

export default function MatchesView({ isTab = false }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (!user) return;
        let isMounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const { data, error } = await db.matches.getWithProfiles(user.id);
                if (!isMounted) return;
                if (error) { console.error('[MatchesView]', error); return; }

                setMatches(
                    (data || []).map((m) => ({
                        matchId:      m.id,
                        createdAt:    m.created_at,
                        otherProfile: m.otherProfile,
                    }))
                );
            } catch (err) {
                if (!isMounted) return;
                console.error('[MatchesView]', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, [user]);

    const filtered = useMemo(() => {
        if (!query.trim()) return matches;
        const q = query.toLowerCase();
        return matches.filter(({ otherProfile }) => {
            const name = (otherProfile.company_name || otherProfile.full_name || '').toLowerCase();
            const sub  = (otherProfile.company_sector || otherProfile.headline || '').toLowerCase();
            return name.includes(q) || sub.includes(q);
        });
    }, [matches, query]);

    const newMatches = matches.filter((m) => isNew(m.createdAt));

    // ── Loading ──
    if (loading) {
        return (
            <div className={`mv ${isTab ? 'mv--tab' : ''}`}>
                <div className="mv__header">
                    <h2 className="mv__title">Mis Matches</h2>
                </div>
                <div className="mv__loading"><Spinner /></div>
            </div>
        );
    }

    // ── Empty ──
    if (matches.length === 0) {
        return (
            <div className={`mv ${isTab ? 'mv--tab' : ''}`}>
                <div className="mv__header">
                    <h2 className="mv__title">Mis Matches</h2>
                </div>
                <EmptyState
                    icon="favorite_border"
                    title="Sin matches todavía"
                    description="¡Sigue explorando! Cuando hagas match con alguien aparecerá aquí."
                    buttonLabel="Explorar"
                    onButtonClick={() => navigate('/app')}
                />
            </div>
        );
    }

    return (
        <div className={`mv ${isTab ? 'mv--tab' : ''}`}>
            {/* ── Header ── */}
            <div className="mv__header">
                <h2 className="mv__title">Mis Matches</h2>
            </div>

            <div className="mv__scroll">
                {/* ── Nuevos matches (story circles) ── */}
                {newMatches.length > 0 && (
                    <div className="mv__new-section">
                        <div className="mv__section-row">
                            <span className="mv__section-label">Nuevos Matches</span>
                            <span className="mv__new-badge">{newMatches.length} Nuevos</span>
                        </div>
                        <div className="mv__stories">
                            {matches.map(({ matchId, createdAt, otherProfile }) => {
                                const avatarSrc = otherProfile.company_logo || otherProfile.avatar_url;
                                const name = otherProfile.company_name || otherProfile.full_name || 'Usuario';
                                const initial = name[0].toUpperCase();
                                const fresh = isNew(createdAt);
                                return (
                                    <button
                                        key={matchId}
                                        className="mv__story"
                                        onClick={() => navigate(`/app/messages/${matchId}`)}
                                        aria-label={name}
                                    >
                                        <div className={`mv__story-ring ${fresh ? 'mv__story-ring--new' : 'mv__story-ring--old'}`}>
                                            <div className="mv__story-inner">
                                                {avatarSrc ? (
                                                    <img src={avatarSrc} alt={name} className="mv__story-img" />
                                                ) : (
                                                    <div className="mv__story-fallback">{initial}</div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="mv__story-name">{name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Buscador ── */}
                <div className="mv__search-wrap">
                    <div className="mv__search-inner">
                        <span className="material-symbols-rounded mv__search-icon">search</span>
                        <input
                            id="mv-search"
                            name="search"
                            className="mv__search"
                            type="text"
                            placeholder="Buscar empresa o puesto..."
                            autoComplete="off"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* ── Lista de todos los matches ── */}
                <div className="mv__list-section">
                    <span className="mv__section-label mv__section-label--list">
                        Todos mis matches
                    </span>

                    <div className="mv__list">
                        {filtered.length === 0 ? (
                            <div className="mv__no-results">
                                <span className="material-symbols-rounded">search_off</span>
                                <p>Sin resultados para "{query}"</p>
                            </div>
                        ) : (
                            filtered.map(({ matchId, createdAt, otherProfile }, idx) => {
                                const avatarSrc    = otherProfile.company_logo || otherProfile.avatar_url;
                                const displayName  = otherProfile.company_name || otherProfile.full_name || 'Usuario';
                                const displaySub   = otherProfile.company_sector || otherProfile.headline || null;
                                const displayCity  = otherProfile.city || null;
                                const initial      = displayName[0].toUpperCase();
                                const fresh        = isNew(createdAt);

                                return (
                                    <div key={matchId}>
                                        {idx > 0 && <div className="mv__list-divider" />}
                                        <div
                                            className={`mv__item ${fresh ? 'mv__item--new' : ''}`}
                                            onClick={() => navigate(`/app/messages/${matchId}`)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => e.key === 'Enter' && navigate(`/app/messages/${matchId}`)}
                                        >
                                            {/* Avatar */}
                                            <div className="mv__item-avatar-wrap">
                                                {avatarSrc ? (
                                                    <img
                                                        src={avatarSrc}
                                                        alt={displayName}
                                                        className="mv__item-avatar"
                                                    />
                                                ) : (
                                                    <div className="mv__item-avatar mv__item-avatar--fallback">
                                                        {initial}
                                                    </div>
                                                )}
                                                {/* Handshake badge */}
                                                <div className="mv__item-badge">
                                                    <span className="material-symbols-rounded">handshake</span>
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="mv__item-info">
                                                <div className="mv__item-row">
                                                    <span className="mv__item-name">{displayName}</span>
                                                    <span className={`mv__item-date ${fresh ? 'mv__item-date--new' : ''}`}>
                                                        {formatMatchDate(createdAt)}
                                                    </span>
                                                </div>
                                                {displaySub && (
                                                    <div className="mv__item-meta">
                                                        <span className="mv__item-sub">{displaySub}</span>
                                                        {displayCity && (
                                                            <>
                                                                <span className="mv__item-dot" />
                                                                <span className="mv__item-city">{displayCity}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Chevron / pulse dot */}
                                            {fresh ? (
                                                <div className="mv__item-pulse" />
                                            ) : (
                                                <span className="material-symbols-rounded mv__item-chevron">
                                                    chevron_right
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div style={{ height: 32 }} />
            </div>
        </div>
    );
}
