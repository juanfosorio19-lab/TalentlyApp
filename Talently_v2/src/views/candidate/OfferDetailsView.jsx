// src/views/candidate/OfferDetailsView.jsx
// Detalle de una oferta laboral — carga por ID desde Supabase.
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import './OfferDetailsView.css';

const MODALITY_LABELS = {
    remote: 'Remoto',
    hybrid: 'Híbrido',
    onsite: 'Presencial',
};

export default function OfferDetailsView() {
    const { offerId } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!offerId) return;

        const loadOffer = async () => {
            setLoading(true);
            setError(false);
            try {
                // Cargar oferta
                const { data: offerData, error: offerErr } = await supabase
                    .from('offers')
                    .select('*')
                    .eq('id', offerId)
                    .single();

                if (offerErr || !offerData) {
                    setError(true);
                    return;
                }

                setOffer(offerData);

                // Cargar datos de la empresa (si hay user_id en la oferta)
                if (offerData.user_id) {
                    const { data: companyData } = await supabase
                        .from('companies')
                        .select('name, logo_url, sector, city, country, website')
                        .eq('user_id', offerData.user_id)
                        .maybeSingle();

                    if (companyData) setCompany(companyData);
                }
            } catch (err) {
                console.error('[OfferDetailsView] Error:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        loadOffer();
    }, [offerId]);

    const header = (
        <header className="offer-detail__header">
            <button
                className="offer-detail__back"
                onClick={() => navigate(-1)}
                aria-label="Volver"
            >
                <span className="material-symbols-rounded">arrow_back</span>
            </button>
            <h2 className="offer-detail__header-title">Oferta</h2>
        </header>
    );

    if (loading) {
        return (
            <div className="offer-detail">
                {header}
                <div className="offer-detail__loading">
                    <div className="offer-detail__spinner" />
                </div>
            </div>
        );
    }

    if (error || !offer) {
        return (
            <div className="offer-detail">
                {header}
                <div className="offer-detail__error">
                    <span className="material-symbols-rounded offer-detail__error-icon">
                        error_outline
                    </span>
                    <h3>Oferta no encontrada</h3>
                    <p>Esta oferta no existe o ya no está disponible.</p>
                    <button
                        className="offer-detail__back-btn"
                        onClick={() => navigate('/app')}
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    const salaryRange =
        offer.salary_min || offer.salary_max
            ? [
                  offer.salary_min ? `USD ${Number(offer.salary_min).toLocaleString()}` : null,
                  offer.salary_max ? `USD ${Number(offer.salary_max).toLocaleString()}` : null,
              ]
                  .filter(Boolean)
                  .join(' — ')
            : null;

    return (
        <div className="offer-detail">
            {header}

            <div className="offer-detail__scroll">
                {/* ── Hero ── */}
                <div className="offer-detail__hero">
                    {company?.logo_url ? (
                        <img
                            className="offer-detail__logo"
                            src={company.logo_url}
                            alt={company.name}
                        />
                    ) : (
                        <div className="offer-detail__logo-placeholder">
                            <span className="material-symbols-rounded">business</span>
                        </div>
                    )}
                    <h1 className="offer-detail__title">{offer.title}</h1>
                    {company?.name && (
                        <p className="offer-detail__company">{company.name}</p>
                    )}
                    {offer.area && (
                        <p className="offer-detail__area">{offer.area}</p>
                    )}
                </div>

                {/* ── Tags ── */}
                <div className="offer-detail__tags">
                    {offer.modality && (
                        <span className="offer-detail__tag">
                            <span className="material-symbols-rounded">work</span>
                            {MODALITY_LABELS[offer.modality] || offer.modality}
                        </span>
                    )}
                    {offer.location && (
                        <span className="offer-detail__tag">
                            <span className="material-symbols-rounded">location_on</span>
                            {offer.location}
                        </span>
                    )}
                    {salaryRange && (
                        <span className="offer-detail__tag offer-detail__tag--salary">
                            <span className="material-symbols-rounded">payments</span>
                            {salaryRange}/mes
                        </span>
                    )}
                </div>

                {/* ── Descripción ── */}
                {offer.description && (
                    <section className="offer-detail__section">
                        <h3 className="offer-detail__section-title">Descripción</h3>
                        <p className="offer-detail__text">{offer.description}</p>
                    </section>
                )}

                {/* ── Requisitos ── */}
                {offer.requirements && (
                    <section className="offer-detail__section">
                        <h3 className="offer-detail__section-title">Requisitos</h3>
                        <p className="offer-detail__text">{offer.requirements}</p>
                    </section>
                )}

                {/* ── Empresa ── */}
                {company && (
                    <section className="offer-detail__section">
                        <h3 className="offer-detail__section-title">Sobre la empresa</h3>
                        <div className="offer-detail__company-card">
                            {company.sector && (
                                <p className="offer-detail__company-sector">{company.sector}</p>
                            )}
                            {(company.city || company.country) && (
                                <p className="offer-detail__company-location">
                                    <span className="material-symbols-rounded">location_on</span>
                                    {[company.city, company.country].filter(Boolean).join(', ')}
                                </p>
                            )}
                            {company.website && (
                                <a
                                    className="offer-detail__company-web"
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span className="material-symbols-rounded">language</span>
                                    {company.website}
                                </a>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
