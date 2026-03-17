// src/views/company/CompanyDashboard.jsx
// Dashboard principal de empresa — diseño Stitch
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/supabase';
import CompanyStats from './CompanyStats';
import MessagesList from '../candidate/MessagesList';
import { EmptyState } from '../../components/ui';
import './CompanyDashboard.css';

const TABS = [
    { id: 'home',     label: 'Inicio',    icon: 'home' },
    { id: 'offers',   label: 'Ofertas',   icon: 'work' },
    { id: 'swipe',    label: 'Explorar',  icon: 'style' },
    { id: 'messages', label: 'Mensajes',  icon: 'chat_bubble' },
    { id: 'profile',  label: 'Perfil',    icon: 'business' },
];

const MODALITY_LABEL = { remote: 'Remoto', hybrid: 'Híbrido', onsite: 'Presencial' };

function badgeLabel(n) {
    if (n <= 0) return null;
    return n > 9 ? '9+' : String(n);
}

export default function CompanyDashboard() {
    const [activeTab, setActiveTab] = useState('home');
    const navigate = useNavigate();
    const { user, profile } = useAuth();

    const [metrics, setMetrics] = useState({
        activeOffers: 0,
        totalMatches: 0,
        totalViews: 0,
        unreadMessages: 0,
    });
    const [offers, setOffers] = useState([]);
    const [togglingId, setTogglingId] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    // ── Cargar notificaciones no leídas ──
    useEffect(() => {
        if (!user) return;
        let isMounted = true;
        db.notifications.getByUser(user.id).then(({ data }) => {
            if (isMounted) setUnreadCount((data || []).filter((n) => !n.read).length);
        });
        return () => { isMounted = false; };
    }, [user]);

    // ── Cargar métricas + ofertas ──
    useEffect(() => {
        if (!user) return;
        let isMounted = true;

        const load = async () => {
            try {
                const [offersRes, matchesRes, statsRes] = await Promise.all([
                    db.offers.getByCompany(user.id),
                    db.matches.get(),
                    db.statistics.get(),
                ]);

                if (!isMounted) return;

                const allOffers = offersRes.data || [];
                setOffers(allOffers);

                setMetrics({
                    activeOffers: allOffers.filter((o) => o.status === 'active').length,
                    totalMatches: (matchesRes.data || []).length,
                    totalViews:   statsRes.data?.profile_views || 0,
                    unreadMessages: 0,
                });
            } catch (err) {
                if (!isMounted) return;
                console.error('[CompanyDashboard] Error loading metrics:', err);
            }
        };

        load();
        return () => { isMounted = false; };
    }, [user]);

    // ── Toggle activa / inactiva ──
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

    const logo        = profile?.company_logo || profile?.company_logo_url;
    const companyName = profile?.company_name || 'Tu empresa';
    const activeOffers = offers.filter((o) => o.status === 'active');

    const renderHome = () => (
        <div className="cd__home">
            {/* Greeting */}
            <div className="cd__greeting">
                <h2 className="cd__greeting-title">¡Hola, {companyName}!</h2>
                <p className="cd__greeting-sub">Aquí tienes el resumen de hoy</p>
            </div>

            {/* Metrics grid */}
            <div className="cd__metrics">
                <div className="cd__metric cd__metric--half">
                    <div className="cd__metric-icon cd__metric-icon--blue">
                        <span className="material-symbols-rounded">work</span>
                    </div>
                    <div className="cd__metric-value">{metrics.activeOffers}</div>
                    <div className="cd__metric-label">Ofertas activas</div>
                </div>

                <div className="cd__metric cd__metric--half">
                    <div className="cd__metric-icon cd__metric-icon--green">
                        <span className="material-symbols-rounded">favorite</span>
                    </div>
                    <div className="cd__metric-value">{metrics.totalMatches}</div>
                    <div className="cd__metric-label">Matches totales</div>
                </div>

                <div className="cd__metric cd__metric--full">
                    <div className="cd__metric-row">
                        <div className="cd__metric-icon cd__metric-icon--purple">
                            <span className="material-symbols-rounded">visibility</span>
                        </div>
                        <div className="cd__metric-text">
                            <div className="cd__metric-value">{metrics.totalViews}</div>
                            <div className="cd__metric-label">Vistas de perfil</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA crear oferta */}
            <button
                className="cd__cta-btn"
                onClick={() => navigate('/company/create-offer')}
            >
                <span className="material-symbols-rounded">add</span>
                Crear nueva oferta
            </button>

            {/* Preview ofertas activas */}
            {activeOffers.length > 0 && (
                <div className="cd__offers-preview">
                    <div className="cd__section-header">
                        <h3 className="cd__section-title">Mis Ofertas Activas</h3>
                        <button
                            className="cd__section-link"
                            onClick={() => setActiveTab('offers')}
                        >
                            Ver todas
                        </button>
                    </div>

                    <div className="cd__offers-list">
                        {activeOffers.slice(0, 3).map((offer) => (
                            <div key={offer.id} className="cd__offer-card">
                                <div className="cd__offer-card__left">
                                    <p className="cd__offer-card__title">{offer.title || 'Sin título'}</p>
                                    {offer.area && (
                                        <p className="cd__offer-card__area">{offer.area}</p>
                                    )}
                                    <div className="cd__offer-card__meta">
                                        {offer.modality && (
                                            <span className="cd__offer-card__chip">
                                                {MODALITY_LABEL[offer.modality] || offer.modality}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    className="cd__offer-card__toggle"
                                    onClick={() => toggleOfferStatus(offer)}
                                    disabled={togglingId === offer.id}
                                    aria-label="Desactivar oferta"
                                >
                                    <span className="material-symbols-rounded">
                                        {togglingId === offer.id ? 'sync' : 'toggle_on'}
                                    </span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ height: 16 }} />
        </div>
    );

    const renderOffers = () => (
        <div className="cd__tab-scroll">
            <div className="cd__tab-header">
                <h2 className="cd__tab-title">Ofertas publicadas</h2>
                <button
                    className="cd__new-btn"
                    onClick={() => navigate('/company/create-offer')}
                >
                    <span className="material-symbols-rounded">add</span>
                    Nueva
                </button>
            </div>

            {offers.length === 0 ? (
                <EmptyState
                    icon="work_off"
                    title="Sin ofertas todavía"
                    description="Publica tu primera vacante y empieza a recibir candidatos."
                    buttonLabel="Crea tu primera oferta"
                    onButtonClick={() => navigate('/company/create-offer')}
                />
            ) : (
                <div className="cd__offers-full-list">
                    {offers.map((offer) => {
                        const isActive = offer.status === 'active';
                        const toggling = togglingId === offer.id;
                        const createdAt = offer.created_at
                            ? new Date(offer.created_at).toLocaleDateString('es', {
                                  day: 'numeric', month: 'short', year: 'numeric',
                              })
                            : '—';

                        return (
                            <div key={offer.id} className="cd__offer-item">
                                <div className="cd__offer-item__top">
                                    <span className={`cd__badge ${isActive ? 'cd__badge--active' : 'cd__badge--inactive'}`}>
                                        {isActive ? 'Activa' : 'Inactiva'}
                                    </span>
                                    <button
                                        className={`cd__toggle-btn ${toggling ? 'cd__toggle-btn--spinning' : ''}`}
                                        onClick={() => toggleOfferStatus(offer)}
                                        disabled={toggling}
                                        aria-label={isActive ? 'Desactivar oferta' : 'Activar oferta'}
                                    >
                                        <span className="material-symbols-rounded">
                                            {toggling ? 'sync' : isActive ? 'toggle_on' : 'toggle_off'}
                                        </span>
                                    </button>
                                </div>
                                <h3 className="cd__offer-item__title">{offer.title || 'Sin título'}</h3>
                                {offer.area && (
                                    <p className="cd__offer-item__area">{offer.area}</p>
                                )}
                                <div className="cd__offer-item__meta">
                                    <span className="cd__meta-pill">
                                        <span className="material-symbols-rounded">calendar_today</span>
                                        {createdAt}
                                    </span>
                                    {offer.modality && (
                                        <span className="cd__meta-pill">
                                            <span className="material-symbols-rounded">work</span>
                                            {MODALITY_LABEL[offer.modality] || offer.modality}
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

    const renderProfile = () => (
        <div className="cd__tab-scroll">
            {/* Hero */}
            <div className="cd__profile-hero">
                {logo ? (
                    <img
                        className="cd__profile-logo"
                        src={logo}
                        alt={companyName}
                    />
                ) : (
                    <div className="cd__profile-logo-placeholder">
                        <span className="material-symbols-rounded">business</span>
                    </div>
                )}
                <div className="cd__profile-hero-info">
                    <h2 className="cd__profile-name">{companyName}</h2>
                    {profile?.company_sector && (
                        <p className="cd__profile-sector">{profile.company_sector}</p>
                    )}
                </div>
            </div>

            {/* Fields */}
            <div className="cd__profile-fields">
                {profile?.country && (
                    <div className="cd__profile-field">
                        <div className="cd__profile-field-icon cd__profile-field-icon--blue">
                            <span className="material-symbols-rounded">public</span>
                        </div>
                        <div>
                            <p className="cd__profile-field-label">Ubicación</p>
                            <p className="cd__profile-field-value">
                                {[profile.city, profile.country].filter(Boolean).join(', ')}
                            </p>
                        </div>
                    </div>
                )}
                {profile?.website && (
                    <div className="cd__profile-field">
                        <div className="cd__profile-field-icon cd__profile-field-icon--green">
                            <span className="material-symbols-rounded">language</span>
                        </div>
                        <div>
                            <p className="cd__profile-field-label">Sitio web</p>
                            <p className="cd__profile-field-value">{profile.website}</p>
                        </div>
                    </div>
                )}
                {profile?.company_stage && (
                    <div className="cd__profile-field">
                        <div className="cd__profile-field-icon cd__profile-field-icon--purple">
                            <span className="material-symbols-rounded">rocket_launch</span>
                        </div>
                        <div>
                            <p className="cd__profile-field-label">Etapa</p>
                            <p className="cd__profile-field-value">{profile.company_stage}</p>
                        </div>
                    </div>
                )}
                {profile?.company_size && (
                    <div className="cd__profile-field">
                        <div className="cd__profile-field-icon cd__profile-field-icon--amber">
                            <span className="material-symbols-rounded">group</span>
                        </div>
                        <div>
                            <p className="cd__profile-field-label">Tamaño del equipo</p>
                            <p className="cd__profile-field-value">{profile.company_size}</p>
                        </div>
                    </div>
                )}
                {profile?.company_description && (
                    <div className="cd__profile-field cd__profile-field--block">
                        <div className="cd__profile-field-icon cd__profile-field-icon--muted">
                            <span className="material-symbols-rounded">description</span>
                        </div>
                        <div>
                            <p className="cd__profile-field-label">Descripción</p>
                            <p className="cd__profile-field-value">{profile.company_description}</p>
                        </div>
                    </div>
                )}
            </div>

            <button
                className="cd__profile-edit-btn"
                onClick={() => navigate('/onboarding/company')}
            >
                <span className="material-symbols-rounded">edit</span>
                Editar Perfil
            </button>

            <div style={{ height: 16 }} />
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'home':     return renderHome();
            case 'offers':   return renderOffers();
            case 'messages': return <MessagesList basePath="/company/chat" />;
            case 'profile':  return renderProfile();
            default:         return null;
        }
    };

    return (
        <div className="cd">
            {/* ── Header ── */}
            <header className="cd__header">
                <div className="cd__header-brand">
                    {logo ? (
                        <img className="cd__header-logo" src={logo} alt={companyName} />
                    ) : (
                        <div className="cd__header-logo-placeholder">
                            <span className="material-symbols-rounded">business</span>
                        </div>
                    )}
                    <span className="cd__header-name">{companyName}</span>
                </div>

                <div className="cd__header-actions">
                    <button
                        className="cd__header-btn"
                        onClick={() => navigate('/company/notifications')}
                        aria-label="Notificaciones"
                        style={{ position: 'relative' }}
                    >
                        <span className="material-symbols-rounded">notifications</span>
                        {badgeLabel(unreadCount) && (
                            <span className="cd__notif-badge">{badgeLabel(unreadCount)}</span>
                        )}
                    </button>
                    <button
                        className="cd__header-btn"
                        onClick={() => navigate('/company/settings')}
                        aria-label="Configuración"
                    >
                        <span className="material-symbols-rounded">settings</span>
                    </button>
                </div>
            </header>

            {/* ── Content ── */}
            <main className="cd__content">
                {renderContent()}
            </main>

            {/* ── Tab Bar ── */}
            <nav className="cd__tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        className={`cd__tab ${activeTab === tab.id ? 'cd__tab--active' : ''}`}
                        onClick={() => tab.id === 'swipe' ? navigate('/company/swipe') : setActiveTab(tab.id)}
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
