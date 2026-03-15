// src/views/candidate/NotificationsView.jsx
// Notificaciones — diseño Stitch
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import './NotificationsView.css';

// ── Icon + color per type ──────────────────────────────────
const TYPE_META = {
    match:   { icon: 'favorite',      color: 'blue'   },
    message: { icon: 'chat_bubble',   color: 'purple' },
    offer:   { icon: 'work',          color: 'green'  },
    system:  { icon: 'settings',      color: 'muted'  },
};
const DEFAULT_META = { icon: 'notifications', color: 'blue' };

// ── Date formatting ────────────────────────────────────────
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffH = Math.floor((now - date) / 3600000);
    if (diffH < 1) return 'Hace unos minutos';
    if (diffH < 24) return `Hace ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return 'Ayer';
    if (diffD < 7) return `Hace ${diffD} días`;
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

// ── Group notifications by date bucket ────────────────────
function groupNotifications(list) {
    const startOf = (d) => { const c = new Date(d); c.setHours(0, 0, 0, 0); return c; };
    const todayStart     = startOf(new Date());
    const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(todayStart.getDate() - 1);
    const weekStart      = new Date(todayStart); weekStart.setDate(todayStart.getDate() - 7);

    const groups = [
        { key: 'today',     label: 'Hoy',          items: [] },
        { key: 'yesterday', label: 'Ayer',          items: [] },
        { key: 'week',      label: 'Esta semana',   items: [] },
        { key: 'older',     label: 'Antes',         items: [] },
    ];

    for (const n of list) {
        const d = startOf(new Date(n.created_at));
        if (d >= todayStart)     groups[0].items.push(n);
        else if (d >= yesterdayStart) groups[1].items.push(n);
        else if (d >= weekStart) groups[2].items.push(n);
        else                     groups[3].items.push(n);
    }

    return groups.filter((g) => g.items.length > 0);
}

export default function NotificationsView() {
    const navigate = useNavigate();
    const { state } = useApp();
    const userId = state.currentUser?.id;

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        const { data } = await db.notifications.getByUser(userId);
        setNotifications(data || []);
        setLoading(false);
    }, [userId]);

    useEffect(() => { load(); }, [load]);

    const handleRead = async (notif) => {
        if (!notif.read) {
            await db.notifications.markAsRead(notif.id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
            );
        }
        if (notif.type === 'match'   && notif.related_id) navigate(`/app/messages/${notif.related_id}`);
        if (notif.type === 'message' && notif.related_id) navigate(`/app/messages/${notif.related_id}`);
        if (notif.type === 'offer'   && notif.related_id) navigate(`/app/offers/${notif.related_id}`);
    };

    const handleMarkAllRead = async () => {
        await db.notifications.markAllAsRead(userId);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter((n) => !n.read).length;
    const groups      = useMemo(() => groupNotifications(notifications), [notifications]);

    // ── Loading ──
    if (loading) {
        return (
            <div className="nv">
                <div className="nv__drag-handle" />
                <header className="nv__header">
                    <button className="nv__back" onClick={() => navigate(-1)} aria-label="Volver">
                        <span className="material-symbols-rounded">arrow_back</span>
                    </button>
                    <h1 className="nv__title">Notificaciones</h1>
                    <div className="nv__header-spacer" />
                </header>
                <div className="nv__loading"><div className="nv__spinner" /></div>
            </div>
        );
    }

    // ── Empty ──
    if (notifications.length === 0) {
        return (
            <div className="nv">
                <div className="nv__drag-handle" />
                <header className="nv__header">
                    <button className="nv__back" onClick={() => navigate(-1)} aria-label="Volver">
                        <span className="material-symbols-rounded">arrow_back</span>
                    </button>
                    <h1 className="nv__title">Notificaciones</h1>
                    <div className="nv__header-spacer" />
                </header>
                <div className="nv__empty">
                    <span className="material-symbols-rounded nv__empty-icon">notifications</span>
                    <h3 className="nv__empty-title">Sin notificaciones</h3>
                    <p className="nv__empty-text">No tienes notificaciones por ahora.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="nv">
            {/* Drag handle */}
            <div className="nv__drag-handle" />

            {/* ── Header ── */}
            <header className="nv__header">
                <button className="nv__back" onClick={() => navigate(-1)} aria-label="Volver">
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <h1 className="nv__title">Notificaciones</h1>
                {unreadCount > 1 ? (
                    <button className="nv__read-all" onClick={handleMarkAllRead}>
                        Leer todas
                    </button>
                ) : (
                    <div className="nv__header-spacer" />
                )}
            </header>

            {/* ── Scroll ── */}
            <div className="nv__scroll">
                {groups.map((group) => (
                    <div key={group.key}>
                        {/* Section label */}
                        <div className="nv__section-label-wrap">
                            <h2 className="nv__section-label">{group.label}</h2>
                        </div>

                        {/* Items */}
                        <div className="nv__list">
                            {group.items.map((notif) => {
                                const meta = TYPE_META[notif.type] || DEFAULT_META;
                                return (
                                    <button
                                        key={notif.id}
                                        className={`nv__item ${notif.read ? '' : 'nv__item--unread'}`}
                                        onClick={() => handleRead(notif)}
                                    >
                                        {/* Icon */}
                                        <div className={`nv__item-icon nv__item-icon--${meta.color}`}>
                                            <span className="material-symbols-rounded">{meta.icon}</span>
                                        </div>

                                        {/* Content */}
                                        <div className="nv__item-body">
                                            <div className="nv__item-top">
                                                <p className="nv__item-title">{notif.title}</p>
                                                {!notif.read && <span className="nv__item-dot" />}
                                            </div>
                                            {notif.message && (
                                                <p className="nv__item-message">{notif.message}</p>
                                            )}
                                            <p className="nv__item-date">{formatDate(notif.created_at)}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div style={{ height: 32 }} />
            </div>
        </div>
    );
}
