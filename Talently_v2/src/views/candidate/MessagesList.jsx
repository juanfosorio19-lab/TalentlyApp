// src/views/candidate/MessagesList.jsx
// Lista de conversaciones — diseño Stitch
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/supabase';
import { Spinner, EmptyState } from '../../components/ui';
import './MessagesList.css';

const PREVIEW_MAX = 50;

function formatTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / 3600000;
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return 'hace ' + Math.max(1, Math.floor(diffMs / 60000)) + 'm';
    if (diffDays === 0) return 'hace ' + Math.floor(diffHours) + 'h';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return date.toLocaleDateString('es', { weekday: 'short' });
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

function truncate(str, max) {
    if (!str) return '';
    return str.length <= max ? str : str.slice(0, max) + '…';
}

export default function MessagesList({ basePath = '/app/messages' }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (!user) return;
        let isMounted = true;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data, error: fetchError } = await db.matches.getWithProfiles(user.id);
                if (!isMounted) return;
                if (fetchError) {
                    console.error('[MessagesList]', fetchError);
                    setError('No se pudieron cargar las conversaciones. Intenta de nuevo.');
                    return;
                }

                const enriched = (data || []).map((m) => ({
                    matchId:         m.id,
                    otherProfile:    m.otherProfile,
                    lastMessage:     m.lastMsg?.content || null,
                    lastMessageTime: m.lastMsg?.created_at || m.created_at,
                    isRecent:        m.lastMsg
                        ? (Date.now() - new Date(m.lastMsg.created_at)) < 3600000
                        : false,
                }));

                enriched.sort((a, b) =>
                    new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
                );

                setConversations(enriched);
            } catch (err) {
                if (!isMounted) return;
                console.error('[MessagesList]', err);
                setError('No se pudieron cargar las conversaciones. Intenta de nuevo.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        load();
        return () => { isMounted = false; };
    }, [user]);

    const filtered = useMemo(() => {
        if (!query.trim()) return conversations;
        const q = query.toLowerCase();
        return conversations.filter((c) => {
            const name = (c.otherProfile.full_name || c.otherProfile.company_name || '').toLowerCase();
            const msg  = (c.lastMessage || '').toLowerCase();
            return name.includes(q) || msg.includes(q);
        });
    }, [conversations, query]);

    // ── Loading ──
    if (loading) {
        return (
            <div className="msg-list">
                <div className="msg-list__header">
                    <div className="msg-list__title-row">
                        <h2 className="msg-list__title">Mensajes</h2>
                    </div>
                    <div className="msg-list__search-wrap">
                        <span className="material-symbols-rounded msg-list__search-icon">search</span>
                        <input
                            className="msg-list__search"
                            placeholder="Buscar…"
                            value=""
                            onChange={() => {}}
                            disabled
                        />
                    </div>
                </div>
                <div className="msg-list__loading"><Spinner /></div>
            </div>
        );
    }

    return (
        <div className="msg-list">
            {/* ── Header ── */}
            <div className="msg-list__header">
                <div className="msg-list__title-row">
                    <h2 className="msg-list__title">
                        Mensajes
                        {conversations.length > 0 && (
                            <span className="msg-list__count">{conversations.length}</span>
                        )}
                    </h2>
                </div>
                <div className="msg-list__search-wrap">
                    <span className="material-symbols-rounded msg-list__search-icon">search</span>
                    <input
                        id="msg-search"
                        name="search"
                        className="msg-list__search"
                        placeholder="Buscar candidatos o roles..."
                        autoComplete="off"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* ── Lista ── */}
            <div className="msg-list__items">
                {error ? (
                    <EmptyState
                        icon="error_outline"
                        title="Error al cargar"
                        description={error}
                    />
                ) : filtered.length === 0 ? (
                    <EmptyState
                        icon="chat_bubble"
                        title={query ? 'Sin resultados' : 'Aún no tienes mensajes'}
                        description={query
                            ? 'Intenta con otro nombre o mensaje.'
                            : 'Cuando hagas un match o te contacten, aparecerán aquí.'}
                    />
                ) : (
                    filtered.map((conv) => {
                        const name   = conv.otherProfile.full_name
                            || conv.otherProfile.company_name
                            || 'Usuario';
                        const avatar = conv.otherProfile.avatar_url
                            || conv.otherProfile.company_logo;
                        const preview = conv.lastMessage
                            ? truncate(conv.lastMessage, PREVIEW_MAX)
                            : 'Envía el primer mensaje';
                        const hasMsg = !!conv.lastMessage;

                        return (
                            <div
                                key={conv.matchId}
                                className="msg-list__item"
                                onClick={() => navigate(`${basePath}/${conv.matchId}`)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && navigate(`${basePath}/${conv.matchId}`)}
                            >
                                {/* Avatar + indicador online */}
                                <div className="msg-list__avatar-wrap">
                                    {avatar ? (
                                        <img
                                            src={avatar}
                                            alt={name}
                                            loading="lazy"
                                            className="msg-list__avatar"
                                        />
                                    ) : (
                                        <div className="msg-list__avatar-placeholder">
                                            <span className="material-symbols-rounded">person</span>
                                        </div>
                                    )}
                                    {conv.isRecent && (
                                        <span className="msg-list__online-dot" />
                                    )}
                                </div>

                                {/* Texto */}
                                <div className="msg-list__info">
                                    <span className="msg-list__name">{name}</span>
                                    <span className={`msg-list__preview ${!hasMsg ? 'msg-list__preview--muted' : ''}`}>
                                        {preview}
                                    </span>
                                </div>

                                {/* Timestamp */}
                                <span className={`msg-list__time ${conv.isRecent ? 'msg-list__time--unread' : ''}`}>
                                    {formatTime(conv.lastMessageTime)}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
