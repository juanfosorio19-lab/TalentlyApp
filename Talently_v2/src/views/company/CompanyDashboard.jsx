// src/views/company/CompanyDashboard.jsx
// Dashboard principal de empresa con navegación por tabs
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/supabase';
import CompanyStats from './CompanyStats';
import MessagesList from '../candidate/MessagesList';
import './CompanyDashboard.css';

const TABS = [
    { id: 'home', label: 'Inicio', icon: 'dashboard' },
    { id: 'offers', label: 'Ofertas', icon: 'work' },
    { id: 'messages', label: 'Mensajes', icon: 'chat_bubble' },
    { id: 'stats', label: 'Estadísticas', icon: 'analytics' },
    { id: 'profile', label: 'Perfil', icon: 'business' },
];

function badgeLabel(n) {
    if (n <= 0) return null;
    return n > 9 ? '9+' : String(n);
}

export default function CompanyDashboard() {
    const [activeTab, setActiveTab] = useState('home');
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [metrics, setMetrics] = useState({
        activeOffers: 0,
        totalMatches: 0,
        totalSwipes: 0,
        totalViews: 0,
    });
    const [offers, setOffers] = useState([]);
    const [offersLoading, setOffersLoading] = useState(false);
    const [togglingId, setTogglingId] = useState(null); // offer id siendo toggled

    // ── Cargar notificaciones no leídas ──
    useEffect(() => {
        if (!user) return;
        db.notifications.getByUser(user.id).then(({ data }) => {
            setUnreadCount((data || []).filter((n) => !n.read).length);
        });
    }, [user]);

    // ── Cargar métricas + ofertas en un solo request ──
    useEffect(() => {
        if (!user) return;

        const loadMetrics = async () => {
            try {
                const [offersRes, matchesRes, statsRes] = await Promise.all([
                    db.offers.getByCompany(user.id),
                    db.matches.get(),
                    db.statistics.get(),
                ]);

                const allOffers = offersRes.data || [];
                setOffers(allOffers);

                const activeOffers = allOffers.filter((o) => o.status === 'active').length;

                setMetrics({
                    activeOffers,
                    totalMatches: (matchesRes.data || []).length,
                    totalSwipes: statsRes.data?.swipes_given || 0,
                    totalViews: statsRes.data?.profile_views || 0,
                });
            } catch (err) {
                console.error('[CompanyDashboard] Error loading metrics:', err);
            }
        };

        loadMetrics();
    }, [user]);

    // ── Toggle activa/inactiva ──
    const toggleOfferStatus = useCallback(async (offer) => {
        const newStatus = offer.status === 'active' ? 'inactive' : 'active';
        setTogglingId(offer.id);

        // Optimistic update
        setOffers((prev) =>
            prev.map((o) => (o.id === offer.id ? { ...o, status: newStatus } : o))
        );

        try {
            const { error } = await db.offers.update(offer.id, { status: newStatus });
            if (error) {
                // Revertir si falla
                setOffers((prev) =>
                    prev.map((o) => (o.id === offer.id ? { ...o, status: offer.status } : o))
                );
                console.error('[CompanyDashboard] Error toggling offer:', error);
            } else {
                // Actualizar contador de métricas
                setMetrics((prev) => ({
                    ...prev,
                    activeOffers: newStatus === 'active'
                        ? prev.activeOffers + 1
                        : Math.max(0, prev.activeOffers - 1),
                }));
            }
        } finally {
            setTogglingId(null);
        }
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <div className="company-home">
                        {/* Métricas rápidas */}
                        <div className="company-home__metrics">
                            <div className="company-home__metric">
                                <div className="company-home__metric-icon company-home__metric-icon--primary">
                                    <span className="material-symbols-rounded">work</span>
                                </div>
                                <div className="company-home__metric-value">{metrics.activeOffers}</div>
                                <div className="company-home__metric-label">Ofertas activas</div>
                            </div>
                            <div className="company-home__metric">
                                <div className="company-home__metric-icon company-home__metric-icon--success">
                                    <span className="material-symbols-rounded">favorite</span>
                                </div>
                                <div className="company-home__metric-value">{metrics.totalMatches}</div>
                                <div className="company-home__metric-label">Matches totales</div>
                            </div>
                            <div className="company-home__metric">
                                <div className="company-home__metric-icon company-home__metric-icon--warning">
                                    <span className="material-symbols-rounded">swap_horiz</span>
                                </div>
                                <div className="company-home__metric-value">{metrics.totalSwipes}</div>
                                <div className="company-home__metric-label">Swipes dados</div>
                            </div>
                            <div className="company-home__metric">
                                <div className="company-home__metric-icon company-home__metric-icon--danger">
                                    <span className="material-symbols-rounded">visibility</span>
                                </div>
                                <div className="company-home__metric-value">{metrics.totalViews}</div>
                                <div className="company-home__metric-label">Vistas de perfil</div>
                            </div>
                        </div>

                        {/* Acciones rápidas */}
                        <button
                            className="company-home__action"
                            onClick={() => navigate('/company/create-offer')}
                        >
                            <div className="company-home__action-icon">
                                <span className="material-symbols-rounded">add</span>
                            </div>
                            <div className="company-home__action-text">
                                <h4>Crear nueva oferta</h4>
                                <p>Publica una vacante y empieza a recibir candidatos</p>
                            </div>
                        </button>

                        <button
                            className="company-home__action"
                            onClick={() => navigate('/company/swipe')}
                        >
                            <div className="company-home__action-icon">
                                <span className="material-symbols-rounded">person_search</span>
                            </div>
                            <div className="company-home__action-text">
                                <h4>Explorar candidatos</h4>
                                <p>Revisa y selecciona candidatos para tus ofertas</p>
                            </div>
                        </button>
                    </div>
                );
            case 'offers':
                return (
                    <div className="company-offers">
                        <div className="company-offers__header">
                            <h2 className="company-offers__title">Ofertas publicadas</h2>
                            <button
                                className="company-offers__new-btn"
                                onClick={() => navigate('/company/create-offer')}
                            >
                                <span className="material-symbols-rounded">add</span>
                                Nueva
                            </button>
                        </div>

                        {offers.length === 0 ? (
                            <div className="company-offers__empty">
                                <span className="material-symbols-rounded company-offers__empty-icon">
                                    work_off
                                </span>
                                <h3 className="company-offers__empty-title">Sin ofertas todavía</h3>
                                <p className="company-offers__empty-text">
                                    Publica tu primera vacante y empieza a recibir candidatos.
                                </p>
                                <button
                                    className="company-offers__empty-btn"
                                    onClick={() => navigate('/company/create-offer')}
                                >
                                    Crea tu primera oferta
                                </button>
                            </div>
                        ) : (
                            <div className="company-offers__list">
                                {offers.map((offer) => {
                                    const isActive = offer.status === 'active';
                                    const toggling = togglingId === offer.id;
                                    const createdAt = offer.created_at
                                        ? new Date(offer.created_at).toLocaleDateString('es', {
                                              day: 'numeric', month: 'short', year: 'numeric',
                                          })
                                        : '—';

                                    return (
                                        <div key={offer.id} className="company-offer">
                                            <div className="company-offer__top">
                                                <span className={`company-offer__badge ${isActive ? 'company-offer__badge--active' : 'company-offer__badge--inactive'}`}>
                                                    {isActive ? 'Activa' : 'Inactiva'}
                                                </span>
                                                <button
                                                    className={`company-offer__toggle ${toggling ? 'company-offer__toggle--loading' : ''}`}
                                                    onClick={() => toggleOfferStatus(offer)}
                                                    disabled={toggling}
                                                    aria-label={isActive ? 'Desactivar oferta' : 'Activar oferta'}
                                                >
                                                    <span className="material-symbols-rounded">
                                                        {toggling ? 'sync' : isActive ? 'toggle_on' : 'toggle_off'}
                                                    </span>
                                                </button>
                                            </div>
                                            <h3 className="company-offer__title">{offer.title || 'Sin título'}</h3>
                                            {offer.area && (
                                                <p className="company-offer__area">{offer.area}</p>
                                            )}
                                            <div className="company-offer__meta">
                                                <span className="company-offer__meta-item">
                                                    <span className="material-symbols-rounded">calendar_today</span>
                                                    {createdAt}
                                                </span>
                                                {offer.modality && (
                                                    <span className="company-offer__meta-item">
                                                        <span className="material-symbols-rounded">work</span>
                                                        {offer.modality === 'remote' ? 'Remoto'
                                                            : offer.modality === 'hybrid' ? 'Híbrido'
                                                            : 'Presencial'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            case 'messages':
                return <MessagesList basePath="/company/chat" />;
            case 'stats':
                return <CompanyStats />;
            case 'profile': {
                const logo = profile?.company_logo || profile?.company_logo_url;
                return (
                    <div className="company-profile">
                        {/* Logo + nombre */}
                        <div className="company-profile__hero">
                            {logo ? (
                                <img
                                    className="company-profile__logo"
                                    src={logo}
                                    alt={profile?.company_name || 'Logo'}
                                />
                            ) : (
                                <div className="company-profile__logo-placeholder">
                                    <span className="material-symbols-rounded">business</span>
                                </div>
                            )}
                            <div className="company-profile__hero-info">
                                <h2 className="company-profile__name">
                                    {profile?.company_name || 'Tu empresa'}
                                </h2>
                                {profile?.company_sector && (
                                    <p className="company-profile__sector">{profile.company_sector}</p>
                                )}
                            </div>
                        </div>

                        {/* Campos */}
                        <div className="company-profile__fields">
                            {profile?.country && (
                                <div className="company-profile__field">
                                    <span className="material-symbols-rounded company-profile__field-icon">public</span>
                                    <div>
                                        <p className="company-profile__field-label">Ubicación</p>
                                        <p className="company-profile__field-value">
                                            {[profile.city, profile.country].filter(Boolean).join(', ')}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {profile?.website && (
                                <div className="company-profile__field">
                                    <span className="material-symbols-rounded company-profile__field-icon">language</span>
                                    <div>
                                        <p className="company-profile__field-label">Sitio web</p>
                                        <p className="company-profile__field-value">{profile.website}</p>
                                    </div>
                                </div>
                            )}
                            {profile?.company_stage && (
                                <div className="company-profile__field">
                                    <span className="material-symbols-rounded company-profile__field-icon">rocket_launch</span>
                                    <div>
                                        <p className="company-profile__field-label">Etapa</p>
                                        <p className="company-profile__field-value">{profile.company_stage}</p>
                                    </div>
                                </div>
                            )}
                            {profile?.company_size && (
                                <div className="company-profile__field">
                                    <span className="material-symbols-rounded company-profile__field-icon">group</span>
                                    <div>
                                        <p className="company-profile__field-label">Tamaño del equipo</p>
                                        <p className="company-profile__field-value">{profile.company_size}</p>
                                    </div>
                                </div>
                            )}
                            {profile?.company_description && (
                                <div className="company-profile__field company-profile__field--block">
                                    <span className="material-symbols-rounded company-profile__field-icon">description</span>
                                    <div>
                                        <p className="company-profile__field-label">Descripción</p>
                                        <p className="company-profile__field-value">{profile.company_description}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Botón editar → retoma onboarding */}
                        <button
                            className="company-profile__edit-btn"
                            onClick={() => navigate('/onboarding/company')}
                        >
                            <span className="material-symbols-rounded">edit</span>
                            Editar perfil
                        </button>
                    </div>
                );
            }
            default:
                return null;
        }
    };

    return (
        <div className="company-dashboard">
            {/* Header */}
            <header className="company-dashboard__header">
                <span className="company-dashboard__logo">Talently</span>
                <div className="company-dashboard__header-actions">
                    <button
                        className="company-dashboard__header-btn"
                        onClick={() => {
                            navigate('/company/notifications');
                            if (user) db.notifications.getByUser(user.id).then(({ data }) => {
                                setUnreadCount((data || []).filter((n) => !n.read).length);
                            });
                        }}
                        aria-label="Notificaciones"
                        style={{ position: 'relative' }}
                    >
                        <span className="material-symbols-rounded">notifications</span>
                        {badgeLabel(unreadCount) && (
                            <span className="notif-count-badge">{badgeLabel(unreadCount)}</span>
                        )}
                    </button>
                    <button
                        className="company-dashboard__header-btn"
                        onClick={() => navigate('/company/settings')}
                        aria-label="Configuración"
                    >
                        <span className="material-symbols-rounded">settings</span>
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="company-dashboard__content">
                {renderContent()}
            </main>

            {/* Tab Bar */}
            <nav className="company-dashboard__tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        className={`company-dashboard__tab ${activeTab === tab.id ? 'is-active' : ''}`}
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
