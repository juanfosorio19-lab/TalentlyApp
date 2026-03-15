// src/views/candidate/OfferDetailsView.jsx
// Detalle de una oferta laboral — diseño Stitch
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { MODALITY_LABELS } from '../../lib/constants';
import './OfferDetailsView.css';

const MODALITY_ICONS = {
    remote:  'public',
    hybrid:  'sync_alt',
    onsite:  'apartment',
    Remoto:  'public',
    Híbrido: 'sync_alt',
    Presencial: 'apartment',
};

function fmtSalary(min, max) {
    if (!min && !max) return null;
    const fmt = (n) => `$${Number(n).toLocaleString()}`;
    if (min && max) return `${fmt(min)} - ${fmt(max)} USD`;
    if (min) return `Desde ${fmt(min)} USD`;
    return `Hasta ${fmt(max)} USD`;
}

export default function OfferDetailsView() {
    const { offerId } = useParams();
    const navigate    = useNavigate();

    const [offer,   setOffer]   = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(false);
    const [applied, setApplied] = useState(false);
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        if (!offerId) return;
        const load = async () => {
            setLoading(true);
            setError(false);
            try {
                const { data: offerData, error: offerErr } = await db.offers.getById(offerId);
                if (offerErr || !offerData) { setError(true); return; }
                const { companies, ...rest } = offerData;
                setOffer(rest);
                if (companies) setCompany(companies);
            } catch (err) {
                console.error('[OfferDetailsView]', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [offerId]);

    const handleApply = async () => {
        if (!offer?.user_id || applied) return;
        setApplying(true);
        try {
            await db.swipes.create(offer.user_id, 'right', offer.id);
            setApplied(true);
        } catch (err) {
            console.error('[OfferDetailsView] apply error:', err);
        } finally {
            setApplying(false);
        }
    };

    // ── Header ──
    const header = (
        <header className="od__header">
            <button className="od__back" onClick={() => navigate(-1)} aria-label="Volver">
                <span className="material-symbols-rounded">arrow_back</span>
            </button>
            <h2 className="od__header-title">
                {company?.name || 'Oferta'}
            </h2>
            <div className="od__header-spacer" />
        </header>
    );

    // ── Loading ──
    if (loading) return (
        <div className="od">
            {header}
            <div className="od__loading">
                <div className="od__spinner" />
                <p className="od__loading-text">Cargando oferta…</p>
            </div>
        </div>
    );

    // ── Error ──
    if (error || !offer) return (
        <div className="od">
            {header}
            <div className="od__error">
                <span className="material-symbols-rounded od__error-icon">error</span>
                <h3 className="od__error-title">Oferta no encontrada</h3>
                <p className="od__error-text">
                    Lo sentimos, la oferta que buscas ya no está disponible o el enlace es incorrecto.
                </p>
                <button className="od__error-btn" onClick={() => navigate(-1)}>
                    Volver al listado
                </button>
            </div>
        </div>
    );

    const salaryStr   = fmtSalary(offer.salary_min, offer.salary_max);
    const modalityLabel = MODALITY_LABELS[offer.modality] || offer.modality;
    const modalityIcon  = MODALITY_ICONS[offer.modality] || 'work';

    // Arrays from offer (conditionally rendered)
    const techStack  = Array.isArray(offer.tech_stack)        ? offer.tech_stack       : [];
    const benefits   = Array.isArray(offer.benefits)          ? offer.benefits         : [];
    const process    = Array.isArray(offer.selection_process) ? offer.selection_process : [];
    const companyDesc = company?.description || offer.company_description || null;
    const initial     = (company?.name || offer.title || '?')[0].toUpperCase();

    return (
        <div className="od">
            {header}

            {/* ── Scroll ── */}
            <div className="od__scroll">

                {/* ── Hero ── */}
                <section className="od__hero">
                    <div className="od__logo-ring">
                        {company?.logo_url ? (
                            <img
                                src={company.logo_url}
                                alt={company.name}
                                className="od__logo"
                            />
                        ) : (
                            <div className="od__logo-fallback">{initial}</div>
                        )}
                    </div>

                    <div className="od__hero-text">
                        <h1 className="od__title">{offer.title}</h1>
                        {company?.name && (
                            <p className="od__company">{company.name}</p>
                        )}
                    </div>

                    {/* Chips row */}
                    <div className="od__chips">
                        {modalityLabel && (
                            <span className="od__chip od__chip--primary">
                                <span className="material-symbols-rounded">{modalityIcon}</span>
                                {modalityLabel}
                            </span>
                        )}
                        {offer.area && (
                            <span className="od__chip od__chip--neutral">
                                <span className="material-symbols-rounded">work_outline</span>
                                {offer.area}
                            </span>
                        )}
                        {offer.seniority && (
                            <span className="od__chip od__chip--neutral">
                                <span className="material-symbols-rounded">workspace_premium</span>
                                {offer.seniority}
                            </span>
                        )}
                        {offer.location && (
                            <span className="od__chip od__chip--neutral">
                                <span className="material-symbols-rounded">location_on</span>
                                {offer.location}
                            </span>
                        )}
                    </div>

                    {/* Salary card */}
                    {salaryStr && (
                        <div className="od__salary-card">
                            <p className="od__salary-label">Rango Salarial</p>
                            <p className="od__salary-value">{salaryStr}</p>
                            <p className="od__salary-period">por mes</p>
                        </div>
                    )}
                </section>

                {/* ── Stack tecnológico ── */}
                {techStack.length > 0 && (
                    <section className="od__section">
                        <h3 className="od__section-title">Stack tecnológico</h3>
                        <div className="od__tag-row">
                            {techStack.map((t, i) => (
                                <span key={i} className="od__tag">
                                    {typeof t === 'string' ? t : t.name || t}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Descripción ── */}
                {offer.description && (
                    <section className="od__section">
                        <h3 className="od__section-title">Descripción</h3>
                        <p className="od__text">{offer.description}</p>
                    </section>
                )}

                {/* ── Requisitos ── */}
                {offer.requirements && (
                    <section className="od__section">
                        <h3 className="od__section-title">Requisitos</h3>
                        <p className="od__text">{offer.requirements}</p>
                    </section>
                )}

                {/* ── Beneficios ── */}
                {benefits.length > 0 && (
                    <section className="od__section">
                        <h3 className="od__section-title">Beneficios</h3>
                        <div className="od__tag-row">
                            {benefits.map((b, i) => (
                                <span key={i} className="od__benefit-tag">
                                    <span className="material-symbols-rounded">check_circle</span>
                                    {typeof b === 'string' ? b : b.name || b}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Proceso de selección ── */}
                {process.length > 0 && (
                    <section className="od__section">
                        <h3 className="od__section-title">Proceso de selección</h3>
                        <div className="od__process">
                            {process.map((step, i) => (
                                <div key={i} className="od__process-step">
                                    <div className="od__process-num">{i + 1}</div>
                                    <p className="od__process-text">
                                        {typeof step === 'string' ? step : step.description || step.name || step}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Sobre la empresa ── */}
                {(companyDesc || company?.sector || company?.city || company?.website) && (
                    <section className="od__section od__section--last">
                        <h3 className="od__section-title">Sobre la empresa</h3>
                        {companyDesc && <p className="od__text od__text--company">{companyDesc}</p>}
                        <div className="od__company-meta">
                            {company?.sector && (
                                <div className="od__meta-row">
                                    <span className="material-symbols-rounded">category</span>
                                    <span>{company.sector}</span>
                                </div>
                            )}
                            {(company?.city || company?.country) && (
                                <div className="od__meta-row">
                                    <span className="material-symbols-rounded">location_on</span>
                                    <span>{[company.city, company.country].filter(Boolean).join(', ')}</span>
                                </div>
                            )}
                            {company?.website && (
                                <a
                                    className="od__meta-row od__meta-row--link"
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span className="material-symbols-rounded">language</span>
                                    <span>{company.website}</span>
                                </a>
                            )}
                        </div>
                    </section>
                )}

                {/* Spacer so content doesn't hide behind CTA */}
                <div style={{ height: 96 }} />
            </div>

            {/* ── CTA bar ── */}
            <div className="od__cta-bar">
                <button
                    className={`od__cta-btn ${applied ? 'od__cta-btn--applied' : ''}`}
                    onClick={handleApply}
                    disabled={applied || applying}
                >
                    <span className="material-symbols-rounded">
                        {applied ? 'check_circle' : 'send'}
                    </span>
                    {applying ? 'Enviando…' : applied ? '¡Aplicado!' : 'Postularme ahora'}
                </button>
            </div>
        </div>
    );
}
