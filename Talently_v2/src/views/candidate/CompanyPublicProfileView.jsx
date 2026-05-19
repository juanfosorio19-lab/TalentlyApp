// src/views/candidate/CompanyPublicProfileView.jsx
// Perfil público de empresa visto por candidato — accesible desde swipe
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { Spinner, SectionCard } from '../../components/ui';
import './CompanyPublicProfileView.css';

// ── Helpers ──────────────────────────────────
function getInitials(name = '') {
    return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');
}

// ── Vista principal ───────────────────────────
export default function CompanyPublicProfileView() {
    // URL param: company profile user_id (from SwipeStack profile.id)
    const { companyUserId } = useParams();
    const navigate = useNavigate();
    const { state } = useApp();

    const [companyProfile, setCompanyProfile] = useState(null);
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [swipeLoading, setSwipeLoading] = useState(false);

    // ── Cargar datos ──
    useEffect(() => {
        if (!companyUserId) return;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                // Cargar perfil de empresa y ofertas en paralelo
                const [profileRes, offersRes] = await Promise.all([
                    db.profiles.getPublicById(companyUserId),
                    db.offers.getByCompany(companyUserId),
                ]);

                if (profileRes.error || !profileRes.data) {
                    setError('No se pudo cargar el perfil de la empresa.');
                    return;
                }

                setCompanyProfile(profileRes.data);
                const activeOffers = (offersRes.data || []).filter(
                    (o) => o.status === 'active' || !o.status
                );
                if (activeOffers.length > 0) setOffer(activeOffers[0]);
            } catch (e) {
                console.error('[CompanyPublicProfileView] Error:', e);
                setError('No se pudo cargar el perfil.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [companyUserId]);

    // ── Swipe desde el perfil ──
    const handleSwipe = useCallback(async (direction) => {
        if (swipeLoading || !companyUserId) return;
        setSwipeLoading(true);
        try {
            await db.swipes.create(companyUserId, direction);
            await db.statistics.increment('swipes_given');
        } catch (e) {
            console.error('[CompanyPublicProfileView] Swipe error:', e);
        } finally {
            setSwipeLoading(false);
            navigate(-1);
        }
    }, [companyUserId, swipeLoading, navigate]);

    // ── Loading ──
    if (loading) {
        return (
            <div className="cpv-center">
                <Spinner />
                <p className="cpv-center-text">Cargando empresa...</p>
            </div>
        );
    }

    // ── Error ──
    if (error || !companyProfile) {
        return (
            <div className="cpv-center">
                <span className="material-symbols-rounded cpv-center-icon">error_outline</span>
                <p className="cpv-center-text">{error || 'Empresa no encontrada.'}</p>
                <button className="cpv-back-plain" onClick={() => navigate(-1)}>Volver</button>
            </div>
        );
    }

    // ── Datos ──
    const {
        company_name,
        company_logo,
        company_logo_url,
        company_description,
        company_sector,
        city,
        country,
        website,
        company_stage,
        company_size,
        culture_values,
        company_photos,
        company_tech_stack,
        company_uniqueness,
        company_benefits,
    } = companyProfile;

    const logoUrl   = company_logo_url || company_logo || '';
    const name      = company_name || 'Empresa';
    const location  = [city, country].filter(Boolean).join(', ');
    const initials  = getInitials(name);

    // Beneficios — labels desde referenceData si existen
    const refBenefits = state.referenceData?.benefits || [];
    const benefitList = Array.isArray(company_benefits) ? company_benefits : [];
    const resolvedBenefits = benefitList.map((b) => {
        if (typeof b === 'string') {
            const ref = refBenefits.find((r) => r.id === b || r.slug === b || r.name === b);
            return ref ? { label: ref.name, icon: ref.icon || 'star' } : { label: b, icon: 'star' };
        }
        return { label: b.name || b.label || b, icon: b.icon || 'star' };
    });

    const cultureList = Array.isArray(culture_values) ? culture_values : [];
    const techStack   = Array.isArray(company_tech_stack) ? company_tech_stack : [];
    const photos      = Array.isArray(company_photos) ? company_photos : [];

    const stageLabel = company_stage || null;
    const sizeLabel  = company_size || null;

    return (
        <div className="cpv-wrapper">
            {/* ── Navbar ── */}
            <nav className="cpv-nav">
                <button
                    className="cpv-nav-back"
                    onClick={() => navigate(-1)}
                    aria-label="Volver"
                >
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <h1 className="cpv-nav-title">{name}</h1>
            </nav>

            {/* ── Scroll ── */}
            <div className="cpv-scroll">

                {/* ── Header de empresa ── */}
                <div className="cpv-hero">
                    <div className="cpv-logo-wrapper">
                        {logoUrl
                            ? <img src={logoUrl} alt={name} className="cpv-logo-img" />
                            : <span className="cpv-logo-initials">{initials}</span>
                        }
                    </div>
                    <h2 className="cpv-company-name">{name}</h2>
                    {company_sector && <p className="cpv-sector">{company_sector}</p>}

                    <div className="cpv-meta">
                        {location && (
                            <span className="cpv-meta-item">
                                <span className="material-symbols-rounded cpv-meta-icon">location_on</span>
                                {location}
                            </span>
                        )}
                        {website && (
                            <span className="cpv-meta-item">
                                <span className="material-symbols-rounded cpv-meta-icon">link</span>
                                <a
                                    href={website.startsWith('http') ? website : `https://${website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cpv-website-link"
                                >
                                    {website.replace(/^https?:\/\//, '')}
                                </a>
                            </span>
                        )}
                    </div>

                    {(stageLabel || sizeLabel) && (
                        <div className="cpv-tags">
                            {stageLabel && <span className="cpv-tag">{stageLabel}</span>}
                            {sizeLabel && <span className="cpv-tag">{sizeLabel}</span>}
                        </div>
                    )}
                </div>

                {/* ── Secciones ── */}
                <div className="cpv-body">

                    {/* Sobre nosotros */}
                    {company_description && (
                        <SectionCard icon="person" title="Sobre nosotros">
                            <p className="cpv-text">{company_description}</p>
                        </SectionCard>
                    )}

                    {/* Cultura */}
                    {cultureList.length > 0 && (
                        <SectionCard icon="psychology" title="Cultura">
                            <div className="cpv-tags-row">
                                {cultureList.map((v, i) => (
                                    <span key={i} className="cpv-culture-tag">
                                        {typeof v === 'string' ? v : v?.name || v}
                                    </span>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* Beneficios */}
                    {resolvedBenefits.length > 0 && (
                        <SectionCard icon="featured_seasonal" title="Beneficios">
                            <div className="cpv-benefits">
                                {resolvedBenefits.map((b, i) => (
                                    <div key={i} className="cpv-benefit-item">
                                        <span className="material-symbols-rounded cpv-benefit-icon">{b.icon}</span>
                                        <span className="cpv-benefit-label">{b.label}</span>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* Stack tecnológico */}
                    {techStack.length > 0 && (
                        <SectionCard icon="code" title="Stack Tecnológico">
                            <div className="cpv-tags-row">
                                {techStack.map((t, i) => (
                                    <span key={i} className="cpv-tech-tag">
                                        {typeof t === 'string' ? t : t?.name || t}
                                    </span>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* Oferta activa */}
                    {offer && (
                        <SectionCard icon="campaign" title="Oferta Activa" className="cpv-section--offer">
                            <div className="cpv-offer">
                                <h3 className="cpv-offer-title">{offer.title || offer.position || 'Oferta'}</h3>
                                <div className="cpv-offer-meta">
                                    {offer.work_modality && <span>{offer.work_modality}</span>}
                                    {offer.seniority_level && <span>• {offer.seniority_level}</span>}
                                    {(offer.salary_min != null || offer.salary_max != null) && (
                                        <span className="cpv-offer-salary">
                                            {offer.salary_min != null && offer.salary_max != null
                                                ? `$${offer.salary_min}k – $${offer.salary_max}k USD`
                                                : offer.salary_min != null
                                                    ? `Desde $${offer.salary_min}k USD`
                                                    : `Hasta $${offer.salary_max}k USD`}
                                        </span>
                                    )}
                                </div>
                                {offer.description && (
                                    <p className="cpv-offer-desc">{offer.description}</p>
                                )}
                                {offer.selection_process && (
                                    <div className="cpv-offer-process">
                                        <p className="cpv-offer-process-label">Proceso de Selección</p>
                                        <p className="cpv-offer-process-text">{offer.selection_process}</p>
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    )}

                    {/* Galería */}
                    {photos.length > 0 && (
                        <SectionCard icon="photo_library" title="Galería">
                            <div className="cpv-gallery">
                                {photos.map((url, i) => (
                                    <div key={i} className="cpv-gallery-item">
                                        <img src={url} alt={`Foto ${i + 1}`} className="cpv-gallery-img" />
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {/* Qué nos hace únicos */}
                    {company_uniqueness && (
                        <SectionCard icon="tune" title="Qué nos hace únicos">
                            <p className="cpv-text">{company_uniqueness}</p>
                        </SectionCard>
                    )}

                </div>
            </div>

            {/* ── Gradiente inferior ── */}
            <div className="cpv-fade-bottom" />

            {/* ── Botones de acción ── */}
            <div className="cpv-actions">
                <button
                    className="cpv-action-btn cpv-action-btn--nope"
                    onClick={() => handleSwipe('left')}
                    disabled={swipeLoading}
                    aria-label="No me interesa"
                >
                    <span className="material-symbols-rounded">close</span>
                </button>
                <button
                    className="cpv-action-btn cpv-action-btn--like"
                    onClick={() => handleSwipe('right')}
                    disabled={swipeLoading}
                    aria-label="Me interesa"
                >
                    <span className="material-symbols-rounded">favorite</span>
                </button>
            </div>
        </div>
    );
}
