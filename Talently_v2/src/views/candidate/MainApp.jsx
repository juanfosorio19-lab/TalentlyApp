// src/views/candidate/MainApp.jsx
// Vista principal del candidato con navegación por tabs inferior
// Tabs: Explorar (swipe), Matches, Mensajes, Perfil
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SwipeStack from '../../components/swipe/SwipeStack';
import MessagesList from './MessagesList';
import MatchesView from './MatchesView';
import ProfileView from './ProfileView';
import { useApp } from '../../context/AppContext';
import { db } from '../../lib/supabase';
import './MainApp.css';
import './FiltersView.css';

const TABS = [
    { id: 'swipe', label: 'Explorar', icon: 'swap_horiz' },
    { id: 'matches', label: 'Matches', icon: 'favorite' },
    { id: 'messages', label: 'Mensajes', icon: 'chat_bubble' },
    { id: 'profile', label: 'Perfil', icon: 'person' },
];

function hasActiveFilters(f) {
    return (
        f.modality?.length > 0 ||
        f.areas?.length > 0 ||
        f.country != null ||
        f.salary?.min != null ||
        f.salary?.max != null ||
        f.stage?.length > 0
    );
}

function badgeLabel(n) {
    if (n <= 0) return null;
    return n > 9 ? '9+' : String(n);
}

export default function MainApp() {
    const [activeTab, setActiveTab] = useState('swipe');
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const { state } = useApp();
    const filtersActive = hasActiveFilters(state.candidateFilters);
    const userId = state.currentUser?.id;

    // Cargar contador de notificaciones no leídas
    useEffect(() => {
        if (!userId) return;
        db.notifications.getByUser(userId).then(({ data }) => {
            setUnreadCount((data || []).filter((n) => !n.read).length);
        });
    }, [userId]);

    const handleNotifClick = () => {
        navigate('/app/notifications');
        // Refrescar conteo al volver
        if (userId) {
            db.notifications.getByUser(userId).then(({ data }) => {
                setUnreadCount((data || []).filter((n) => !n.read).length);
            });
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'swipe':
                return <SwipeStack />;
            case 'matches':
                return <MatchesView isTab />;
            case 'messages':
                return <MessagesList basePath="/app/messages" />;
            case 'profile':
                return <ProfileView isTab />;
            default:
                return <SwipeStack />;
        }
    };

    const badge = badgeLabel(unreadCount);

    return (
        <div className="main-app">
            {/* Header */}
            <header className="main-app__header">
                <span className="main-app__logo">Talently</span>
                <div className="main-app__header-actions">
                    <button
                        className="main-app__header-btn"
                        onClick={handleNotifClick}
                        aria-label="Notificaciones"
                        style={{ position: 'relative' }}
                    >
                        <span className="material-symbols-rounded">notifications</span>
                        {badge && <span className="notif-count-badge">{badge}</span>}
                    </button>
                    <button
                        className="main-app__header-btn"
                        onClick={() => navigate('/app/filters')}
                        aria-label="Filtros"
                        style={{ position: 'relative' }}
                    >
                        <span className="material-symbols-rounded">tune</span>
                        {filtersActive && <span className="filters-badge" />}
                    </button>
                </div>
            </header>

            {/* Contenido principal */}
            <main className="main-app__content">
                {renderContent()}
            </main>

            {/* Tab bar inferior */}
            <nav className="main-app__tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        className={`main-app__tab ${activeTab === tab.id ? 'is-active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        aria-label={tab.label}
                    >
                        <span className="material-symbols-rounded">{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}
