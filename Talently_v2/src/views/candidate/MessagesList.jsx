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
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (!user) return;

        const load = async () => {
            setLoading(true);
            try {
                const { data: matches, error } = await db.matches.get();
                if (error) { console.error('[MessagesList]', error); return; }

                const enriched = await Promise.all(
                    (matches || []).map(async (match) => {
                        const otherUserId =
                            match.user_id_1 === user.id ? match.user_id_2 : match.user_id_1;

                        const { data: otherProfile } = await db.profiles.getById(otherUserId);
                        const { data: msgs } = await db.matches.getMessages(match.id);
                        const lastMsg = msgs?.length ? msgs[msgs.length - 1] : null;

                        return {
                            matchId: match.id,
                            otherProfile: otherProfile || { full_name: 'Usuario' },
                            lastMessage: lastMsg?.content || null,
                            lastMessageTime: lastMsg?.created_at || match.created_at,
                            isRecent: lastMsg
                                ? (Date.now() - new Date(lastMsg.created_at)) < 3600000
                                : false,
                        };
                    })
                );

                enriched.sort((a, b) =>
                    new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
                );

                setConversations(enriched);
            } catch (err) {
                console.error('[MessagesList]', err);
            } finally {
                setLoading(false);
            }
        };

        load();
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
                        <input className="msg-list__search" placeholder="Buscar…" disabled />
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
                        className="msg-list__search"
                        placeholder="Buscar candidatos o roles..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* ── Lista ── */}
            <div className="msg-list__items">
                {filtered.length === 0 ? (
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
