// src/views/candidate/MainApp.jsx
// Vista principal del candidato con navegación por tabs inferior
// Tabs: Explorar (swipe), Matches, Mensajes, Perfil
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SwipeStack from '../../components/swipe/SwipeStack';
import MessagesList from './MessagesList';
import MatchesView from './MatchesView';
import ProfileView from './ProfileView';
import './MainApp.css';

const TABS = [
    { id: 'swipe', label: 'Explorar', icon: 'swap_horiz' },
    { id: 'matches', label: 'Matches', icon: 'favorite' },
    { id: 'messages', label: 'Mensajes', icon: 'chat_bubble' },
    { id: 'profile', label: 'Perfil', icon: 'person' },
];

export default function MainApp() {
    const [activeTab, setActiveTab] = useState('swipe');
    const navigate = useNavigate();

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

    return (
        <div className="main-app">
            {/* Header */}
            <header className="main-app__header">
                <span className="main-app__logo">Talently</span>
                <div className="main-app__header-actions">
                    <button
                        className="main-app__header-btn"
                        onClick={() => navigate('/app/notifications')}
                        aria-label="Notificaciones"
                    >
                        <span className="material-symbols-rounded">notifications</span>
                    </button>
                    <button
                        className="main-app__header-btn"
                        onClick={() => navigate('/app/filters')}
                        aria-label="Filtros"
                    >
                        <span className="material-symbols-rounded">tune</span>
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
