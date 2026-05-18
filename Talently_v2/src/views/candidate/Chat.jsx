// src/views/candidate/Chat.jsx
// Vista de conversación individual — diseño Stitch
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import useMessages from '../../hooks/useMessages';
import { Spinner } from '../../components/ui';
import './Chat.css';

function formatMsgTime(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('es', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatDateSep(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    return d.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Chat({ backPath = '/app' }) {
    const { matchId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { messages, loading, sendMessage, myUserId } = useMessages(matchId);

    const [inputText, setInputText] = useState('');
    const [otherProfile, setOtherProfile] = useState(null);
    const messagesEndRef = useRef(null);

    // ── Cargar perfil del otro usuario ──
    useEffect(() => {
        if (!matchId || !user) return;
        const load = async () => {
            const { data: matches, error: matchesError } = await db.matches.get();
            if (matchesError) {
                console.error('[Chat] Error cargando matches:', matchesError);
                setOtherProfile({ full_name: 'Usuario' });
                return;
            }
            const match = (matches || []).find((m) => m.id === matchId);
            if (!match) {
                setOtherProfile({ full_name: 'Usuario' });
                return;
            }
            const otherId = match.user_id_1 === user.id ? match.user_id_2 : match.user_id_1;
            const { data: profile, error: profileError } = await db.profiles.getById(otherId);
            if (profileError) console.error('[Chat] Error cargando perfil:', profileError);
            setOtherProfile(profile || { full_name: 'Usuario' });
        };
        load();
    }, [matchId, user]);

    // ── Auto-scroll al último mensaje ──
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ── Enviar mensaje ──
    const handleSend = async () => {
        if (!inputText.trim()) return;
        const text = inputText;
        setInputText('');
        await sendMessage(text);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ── Renderizar mensajes con separadores de fecha ──
    const renderMessages = () => {
        let lastDate = null;
        const elements = [];
        const otherAvatar = otherProfile?.avatar_url || otherProfile?.company_logo;

        messages.forEach((msg, i) => {
            const msgDate = new Date(msg.created_at).toDateString();
            if (msgDate !== lastDate) {
                lastDate = msgDate;
                elements.push(
                    <div key={`date-${i}`} className="chat-view__date-sep">
                        <span>{formatDateSep(msg.created_at)}</span>
                    </div>
                );
            }

            const isMine = msg.sender_id === myUserId;

            if (isMine) {
                elements.push(
                    <div key={msg.id} className="chat-msg chat-msg--mine">
                        <div className="chat-msg__body chat-msg__body--mine">
                            <div className="chat-bubble chat-bubble--mine">
                                <p>{msg.content}</p>
                            </div>
                            <div className="chat-bubble__meta">
                                <span className="chat-bubble__time">{formatMsgTime(msg.created_at)}</span>
                                <span className="material-symbols-rounded chat-bubble__tick">done</span>
                            </div>
                        </div>
                    </div>
                );
            } else {
                elements.push(
                    <div key={msg.id} className="chat-msg chat-msg--theirs">
                        {/* Mini avatar */}
                        <div className="chat-msg__avatar-wrap">
                            {otherAvatar ? (
                                <img
                                    src={otherAvatar}
                                    alt={otherProfile?.full_name}
                                    className="chat-msg__small-avatar"
                                />
                            ) : (
                                <div className="chat-msg__small-avatar chat-msg__small-avatar--placeholder">
                                    <span className="material-symbols-rounded">person</span>
                                </div>
                            )}
                        </div>
                        <div className="chat-msg__body">
                            <div className="chat-bubble chat-bubble--theirs">
                                <p>{msg.content}</p>
                            </div>
                            <span className="chat-bubble__time chat-bubble__time--theirs">
                                {formatMsgTime(msg.created_at)}
                            </span>
                        </div>
                    </div>
                );
            }
        });

        return elements;
    };

    const otherName    = otherProfile?.full_name || otherProfile?.company_name || 'Cargando...';
    const otherAvatar  = otherProfile?.avatar_url || otherProfile?.company_logo;

    return (
        <div className="chat-view">
            {/* ── Header ── */}
            <header className="chat-view__header">
                <button
                    className="chat-view__back"
                    onClick={() => navigate(backPath)}
                    aria-label="Volver"
                >
                    <span className="material-symbols-rounded">chevron_left</span>
                </button>

                {/* Avatar con punto online */}
                <div className="chat-view__header-avatar-wrap">
                    {otherAvatar ? (
                        <img
                            className="chat-view__header-avatar"
                            src={otherAvatar}
                            alt={otherName}
                        />
                    ) : (
                        <div className="chat-view__header-avatar chat-view__header-avatar--placeholder">
                            <span className="material-symbols-rounded">person</span>
                        </div>
                    )}
                    <span className="chat-view__online-dot" />
                </div>

                {/* Nombre + estado */}
                <div className="chat-view__header-info">
                    <p className="chat-view__header-name">{otherName}</p>
                    <p className="chat-view__header-status">Match</p>
                </div>

                {/* Ver perfil */}
                <button
                    className="chat-view__profile-btn"
                    onClick={() => navigate(`/app/profile/${otherProfile?.id || ''}`)}
                    aria-label="Ver perfil"
                >
                    Ver Perfil
                </button>
            </header>

            {/* ── Mensajes ── */}
            <div className="chat-view__messages">
                {loading ? (
                    <div className="chat-view__loading"><Spinner /></div>
                ) : (
                    <>
                        {messages.length === 0 && (
                            <div className="chat-view__empty">
                                <span className="material-symbols-rounded">waving_hand</span>
                                <p>¡Envía el primer mensaje!</p>
                            </div>
                        )}
                        {renderMessages()}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* ── Input bar ── */}
            <footer className="chat-view__input-bar">
                <div className="chat-view__input-wrap">
                    <input
                        id="chat-message-input"
                        name="message"
                        className="chat-view__input"
                        placeholder="Escribe un mensaje..."
                        autoComplete="off"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <button
                    className="chat-view__send"
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    aria-label="Enviar"
                >
                    <span className="material-symbols-rounded">arrow_upward</span>
                </button>
            </footer>
        </div>
    );
}
