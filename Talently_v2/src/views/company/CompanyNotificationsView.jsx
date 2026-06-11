// src/views/company/CompanyNotificationsView.jsx
// Reutiliza la lógica + estilos de NotificationsView (nv__* classnames).
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Spinner, EmptyState } from '../../components/ui';
import { logError } from '../../lib/errorLogger';
import '../candidate/NotificationsView.css';

// Mismo TYPE_META que NotificationsView candidato (parity)
const TYPE_META = {
    match:   { icon: 'favorite',      color: 'blue'   },
    message: { icon: 'chat_bubble',   color: 'purple' },
    offer:   { icon: 'work',          color: 'green'  },
    system:  { icon: 'settings',      color: 'muted'  },
};
const DEFAULT_META = { icon: 'notifications', color: 'blue' };

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffH = Math.floor((now - date) / 3600000);
    if (diffH < 1) return 'Hace unos minutos';
    if (diffH < 24) return `Hace ${diffH}h`;
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return 'Ayer';
    if (diffD < 7) return `Hace ${diffD} dias`;
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

export default function CompanyNotificationsView() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userId = user?.id;

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!userId) { setLoading(false); return; }
        setLoading(true);
        const { data } = await db.notifications.getByUser(userId);
        setNotifications(data || []);
        setLoading(false);
    }, [userId]);

    useEffect(() => { load(); }, [load]);

    const handleRead = async (notif) => {
        if (!notif.read) {
            const { error } = await db.notifications.markAsRead(notif.id);
            if (error) logError('NOTIF', `markAsRead:error ${error.message || error}`, null, { overlay: false, level: 'warn' });
            setNotifications((prev) =>
                prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
            );
        }
        if (notif.type === 'match' && notif.related_id) navigate(`/company/chat/${notif.related_id}`);
    };

    const handleMarkAllRead = async () => {
        const { error } = await db.notifications.markAllAsRead(userId);
        if (error) logError('NOTIF', `markAllAsRead:error ${error.message || error}`, null, { overlay: false, level: 'warn' });
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="nv">
            <header className="nv__header">
                <button
                    className="nv__back"
                    onClick={() => navigate(-1)}
                    aria-label="Volver"
                >
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <h2 className="nv__title">Notificaciones</h2>
                {unreadCount > 1 ? (
                    <button className="nv__read-all" onClick={handleMarkAllRead}>
                        Leer todas
                    </button>
                ) : (
                    <div className="nv__header-spacer" />
                )}
            </header>

            {loading ? (
                <div className="nv__loading"><Spinner /></div>
            ) : notifications.length === 0 ? (
                <EmptyState
                    icon="notifications"
                    title="Sin notificaciones"
                    description="No tienes notificaciones por ahora."
                />
            ) : (
                <div className="nv__list">
                    {notifications.map((notif) => {
                        const meta = TYPE_META[notif.type] || DEFAULT_META;
                        return (
                            <button
                                key={notif.id}
                                className={`nv__item ${notif.read ? '' : 'nv__item--unread'}`}
                                onClick={() => handleRead(notif)}
                            >
                                <div className={`nv__item-icon nv__item-icon--${meta.color}`}>
                                    <span className="material-symbols-rounded">{meta.icon}</span>
                                </div>
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
            )}
        </div>
    );
}
