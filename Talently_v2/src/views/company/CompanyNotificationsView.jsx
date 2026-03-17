// src/views/company/CompanyNotificationsView.jsx
// Reutiliza la logica de NotificationsView — misma tabla, mismo contexto.
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { Spinner, EmptyState } from '../../components/ui';
import '../candidate/NotificationsView.css';

const TYPE_ICONS = {
    match: 'favorite',
    message: 'chat_bubble',
    offer: 'work',
    system: 'notifications',
};

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
        if (notif.type === 'match' && notif.related_id) navigate(`/company/chat/${notif.related_id}`);
    };

    const handleMarkAllRead = async () => {
        await db.notifications.markAllAsRead(userId);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="notif-view">
            <header className="notif-view__header">
                <button
                    className="notif-view__back"
                    onClick={() => navigate(-1)}
                    aria-label="Volver"
                >
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <h2 className="notif-view__title">Notificaciones</h2>
                {unreadCount > 1 && (
                    <button className="notif-view__read-all" onClick={handleMarkAllRead}>
                        Leer todas
                    </button>
                )}
            </header>

            {loading ? (
                <div className="notif-view__loading"><Spinner /></div>
            ) : notifications.length === 0 ? (
                <EmptyState
                    icon="notifications"
                    title="Sin notificaciones"
                    description="No tienes notificaciones por ahora."
                />
            ) : (
                <div className="notif-view__list">
                    {notifications.map((notif) => (
                        <button
                            key={notif.id}
                            className={`notif-item ${notif.read ? '' : 'notif-item--unread'}`}
                            onClick={() => handleRead(notif)}
                        >
                            <div className={`notif-item__icon notif-item__icon--${notif.type}`}>
                                <span className="material-symbols-rounded">
                                    {TYPE_ICONS[notif.type] || 'notifications'}
                                </span>
                            </div>
                            <div className="notif-item__body">
                                <p className="notif-item__title">{notif.title}</p>
                                <p className="notif-item__message">{notif.message}</p>
                                <p className="notif-item__date">{formatDate(notif.created_at)}</p>
                            </div>
                            {!notif.read && <span className="notif-item__dot" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
