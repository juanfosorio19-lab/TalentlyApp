// src/views/company/CompanyProfileCreatedView.jsx
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './CompanyProfileCreatedView.css';

export default function CompanyProfileCreatedView() {
    const navigate = useNavigate();
    const { state } = useApp();
    const profile = state.userProfile || {};

    const companyName = profile.company_name || 'Tu empresa';
    const sector = profile.company_sector || '';
    const logoUrl = profile.company_logo_url || profile.company_logo || '';
    const city = profile.city || '';

    // Iniciales de fallback
    const initials = companyName
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || '')
        .join('');

    return (
        <div className="cpv-wrapper">
            <header className="cpv-header">
                <div className="cpv-header-spacer" />
                <div className="cpv-logo-row">
                    <span className="material-symbols-rounded cpv-bolt">bolt</span>
                    <span className="cpv-brand">Talently</span>
                </div>
                <div className="cpv-header-spacer" />
            </header>

            <main className="cpv-main">
                <div className="cpv-radial-bg" />

                {/* Icono animado */}
                <div className="cpv-icon-wrapper cpv-float">
                    <div className="cpv-icon-circle">
                        <div className="cpv-icon-ring cpv-icon-ring--1" />
                        <div className="cpv-icon-ring cpv-icon-ring--2" />
                        <div className="cpv-icon-card">
                            <span className="material-symbols-rounded cpv-verified-icon">verified</span>
                        </div>
                        <div className="cpv-dot cpv-dot--yellow" />
                        <div className="cpv-dot cpv-dot--green" />
                        <div className="cpv-star">
                            <span className="material-symbols-rounded">star</span>
                        </div>
                        <div className="cpv-circle-sm">
                            <span className="material-symbols-rounded">circle</span>
                        </div>
                    </div>
                </div>

                {/* Texto principal */}
                <div className="cpv-text-block">
                    <div className="cpv-badge">
                        <span className="cpv-badge-dot" />
                        <span className="cpv-badge-label">Cuenta verificada</span>
                    </div>
                    <h1 className="cpv-title">
                        ¡Bienvenido a Talently,{' '}
                        <span className="cpv-company-name">{companyName}!</span>
                    </h1>
                    <p className="cpv-subtitle">
                        Estamos listos para ayudarte a encontrar el talento perfecto para tu equipo.
                    </p>
                </div>

                {/* Card de empresa */}
                <div className="cpv-company-card">
                    <div className="cpv-company-logo">
                        {logoUrl ? (
                            <img src={logoUrl} alt={companyName} className="cpv-company-logo-img" />
                        ) : (
                            <span className="cpv-company-initials">{initials}</span>
                        )}
                    </div>
                    <div className="cpv-company-info">
                        <span className="cpv-company-name-card">{companyName}</span>
                        <span className="cpv-company-location">
                            {[sector, city].filter(Boolean).join(' · ') || 'Empresa'}
                        </span>
                    </div>
                    <div className="cpv-check-badge">
                        <span className="material-symbols-rounded cpv-check-icon">check</span>
                    </div>
                </div>
            </main>

            <footer className="cpv-footer">
                <button
                    className="cpv-btn-primary"
                    onClick={() => navigate('/company/create-offer')}
                >
                    <span className="material-symbols-rounded">add_circle</span>
                    <span>Crear mi primera oferta</span>
                </button>
                <button
                    className="cpv-btn-secondary"
                    onClick={() => navigate('/company/dashboard')}
                >
                    Ir a mi panel de control
                </button>
            </footer>
        </div>
    );
}
