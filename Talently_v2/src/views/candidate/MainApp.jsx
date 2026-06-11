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

// Mensajes se accede desde Matches (cada match abre su chat), por eso no es tab.
const TABS = [
    { id: 'swipe',    label: 'Explorar',  icon: 'style' },
    { id: 'matches',  label: 'Matches',   icon: 'grid_view' },
    { id: 'profile',  label: 'Perfil',    icon: 'person_outline' },
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

    // Contador de notificaciones no leídas (campana del header)
    useEffect(() => {
        if (!userId) return;
        let isMounted = true;
        db.notifications.getByUser(userId).then(({ data }) => {
            if (isMounted) setUnreadCount((data || []).filter((n) => !n.read).length);
        });
        return () => { isMounted = false; };
    }, [userId]);

    const handleNotifClick = () => {
        navigate('/app/notifications');
        if (userId) {
            db.notifications.getByUser(userId).then(({ data }) => {
                setUnreadCount((data || []).filter((n) => !n.read).length);
            });
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'swipe':    return <SwipeStack onCardTap={(profile) => navigate(`/app/company/${profile.id}`)} />;
            case 'matches':  return <MatchesView isTab onExplore={() => setActiveTab('swipe')} />;
            case 'messages': return <MessagesList basePath="/app/messages" />;
            case 'profile':  return <ProfileView isTab />;
            default:         return <SwipeStack onCardTap={(profile) => navigate(`/app/company/${profile.id}`)} />;
        }
    };

    const notifBadge = badgeLabel(unreadCount);

    return (
        <div className="main-app">
            {/* ── Header ── */}
            <header className="main-app__header">
                {/* Logo: icono T + texto */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        width: 32, height: 32,
                        background: 'var(--gradient-primary)',
                        borderRadius: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 8px rgba(var(--primary-rgb), 0.25)',
                        flexShrink: 0,
                    }}>
                        <span style={{ color: 'white', fontWeight: 800, fontSize: 18, lineHeight: 1 }}>T</span>
                    </div>
                    <span className="main-app__logo">Talently</span>
                </div>

                {/* Acciones: filtros + notificaciones */}
                <div className="main-app__header-actions">
                    <button
                        className="main-app__header-btn"
                        onClick={() => navigate('/app/filters')}
                        aria-label="Filtros"
                        style={{ position: 'relative' }}
                    >
                        <span className="material-symbols-rounded">tune</span>
                        {filtersActive && <span className="filters-badge" />}
                    </button>
                    <button
                        className="main-app__header-btn"
                        onClick={handleNotifClick}
                        aria-label="Notificaciones"
                        style={{ position: 'relative' }}
                    >
                        <span className="material-symbols-rounded">notifications</span>
                        {notifBadge && <span className="notif-count-badge">{notifBadge}</span>}
                    </button>
                </div>
            </header>

            {/* ── Contenido principal ── */}
            <main className="main-app__content">
                {renderContent()}
            </main>

            {/* ── Tab bar inferior ── */}
            <nav className="main-app__tabs">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const badge = null;
                    return (
                        <button
                            key={tab.id}
                            className={`main-app__tab ${isActive ? 'is-active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            aria-label={tab.label}
                        >
                            {/* Icono con pill activo */}
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    padding: 6,
                                    borderRadius: 12,
                                    background: isActive
                                        ? 'rgba(var(--primary-rgb), 0.10)'
                                        : 'transparent',
                                    transition: 'background 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <span className="material-symbols-rounded">{tab.icon}</span>
                                </div>
                                {badge && (
                                    <span className="main-app__tab-badge">{badge}</span>
                                )}
                            </div>
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
