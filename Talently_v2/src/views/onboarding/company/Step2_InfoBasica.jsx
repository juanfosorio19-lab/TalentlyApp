// Company Step 2 — Información básica: nombre, sector, país, ciudad, links
import { useState, useEffect } from 'react';
import { db } from '../../../lib/supabase';

export default function Step2_InfoBasica({ data, onNext, saving }) {
    const [companyName, setCompanyName] = useState(data.company_name || '');
    const [sector, setSector] = useState(data.company_sector || '');
    const [country, setCountry] = useState(data.country || '');
    const [city, setCity] = useState(data.city || '');
    const [website, setWebsite] = useState(data.website || '');
    // LinkedIn vive aquí junto al sitio web (antes estaba en otro paso y
    // parecía que se pedían links dos veces)
    const [linkedinUrl, setLinkedinUrl] = useState(data.linkedin_url || '');
    const [error, setError] = useState('');

    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [sectors, setSectors] = useState([]);

    useEffect(() => {
        db.reference.getCountries().then(({ data: c }) => setCountries(c || []));
        db.reference.getCompanySectors().then(({ data: s }) => setSectors(s || []));
    }, []);

    // Ciudades dependientes del país (mismo patrón que el wizard de candidato)
    useEffect(() => {
        if (!country) return;
        const countryObj = countries.find((c) => c.name === country);
        if (!countryObj) return;
        let cancelled = false;
        db.reference.getCities(countryObj.id).then(({ data: c }) => {
            if (!cancelled) setCities(c || []);
        });
        return () => { cancelled = true; };
    }, [country, countries]);

    const validateUrl = (url) => /^https?:\/\/.+\..+/.test(url);

    const handleNext = () => {
        if (!companyName.trim()) { setError('Ingresa el nombre de tu empresa'); return; }
        if (!sector) { setError('Selecciona el sector de tu empresa'); return; }
        if (!country) { setError('Selecciona el país de tu empresa'); return; }
        if (!city.trim()) { setError('Selecciona la ciudad de tu empresa'); return; }
        if (website && !validateUrl(website)) { setError('El sitio web debe tener el formato https://...'); return; }
        if (linkedinUrl && !validateUrl(linkedinUrl)) { setError('El LinkedIn debe tener el formato https://...'); return; }
        setError('');
        onNext({
            company_name: companyName.trim(),
            company_sector: sector,
            country,
            city: city.trim(),
            website: website.trim(),
            linkedin_url: linkedinUrl.trim(),
        });
    };

    return (
        <>
            <h2 className="ob-title">Cuéntanos sobre tu empresa</h2>
            <p className="ob-subtitle">Comencemos con lo esencial para que los candidatos sepan quién eres.</p>

            <div className="ob-content">
                <div className="ob-field">
                    <label className="ob-label" htmlFor="ob-company-name">
                        Nombre de la empresa{' '}
                        <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div className="ob-input-wrapper">
                        <span className="material-symbols-rounded ob-input-icon">business</span>
                        <input
                            id="ob-company-name"
                            name="company_name"
                            className="ob-input"
                            placeholder="Ej. Acme Corp"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="ob-field">
                    <label className="ob-label">
                        Sector / Industria{' '}
                        <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div className="ob-input-wrapper">
                        <span className="material-symbols-rounded ob-input-icon">category</span>
                        <select
                            className="ob-select"
                            value={sector}
                            onChange={(e) => setSector(e.target.value)}
                        >
                            <option value="">Seleccionar sector...</option>
                            {sectors.map((s) => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                        <span
                            className="material-symbols-rounded"
                            style={{ fontSize: 20, color: 'var(--text-muted)', flexShrink: 0, pointerEvents: 'none' }}
                        >
                            expand_more
                        </span>
                    </div>
                </div>

                <div className="ob-field">
                    <label className="ob-label">
                        País{' '}
                        <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div className="ob-input-wrapper">
                        <span className="material-symbols-rounded ob-input-icon">public</span>
                        <select
                            className="ob-select"
                            value={country}
                            onChange={(e) => { setCountry(e.target.value); setCity(''); }}
                        >
                            <option value="">Seleccionar país...</option>
                            {countries.map((c) => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                        <span
                            className="material-symbols-rounded"
                            style={{ fontSize: 20, color: 'var(--text-muted)', flexShrink: 0, pointerEvents: 'none' }}
                        >
                            expand_more
                        </span>
                    </div>
                </div>

                <div className="ob-field">
                    <label className="ob-label" htmlFor="ob-city">
                        Ciudad{' '}
                        <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div className="ob-input-wrapper">
                        <span className="material-symbols-rounded ob-input-icon">location_on</span>
                        <select
                            id="ob-city"
                            name="city"
                            className="ob-select"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            disabled={!country}
                        >
                            <option value="">{country ? 'Seleccionar ciudad...' : 'Primero elige un país'}</option>
                            {cities.map((c) => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                        <span
                            className="material-symbols-rounded"
                            style={{ fontSize: 20, color: 'var(--text-muted)', flexShrink: 0, pointerEvents: 'none' }}
                        >
                            expand_more
                        </span>
                    </div>
                </div>

                <div className="ob-field">
                    <label className="ob-label" htmlFor="ob-website">
                        Sitio web{' '}
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                            (Opcional)
                        </span>
                    </label>
                    <div className="ob-input-wrapper">
                        <span className="material-symbols-rounded ob-input-icon">language</span>
                        <input
                            id="ob-website"
                            name="website"
                            className="ob-input"
                            type="url"
                            placeholder="https://tuempresa.com"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                        />
                    </div>
                </div>

                <div className="ob-field">
                    <label className="ob-label" htmlFor="ob-linkedin">
                        LinkedIn de la empresa{' '}
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                            (Opcional)
                        </span>
                    </label>
                    <div className="ob-input-wrapper">
                        <span className="material-symbols-rounded ob-input-icon">link</span>
                        <input
                            id="ob-linkedin"
                            name="linkedin_url"
                            className="ob-input"
                            type="url"
                            placeholder="https://linkedin.com/company/..."
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="ob-error">
                        <span className="material-symbols-rounded">error</span>
                        {error}
                    </div>
                )}
            </div>

            <div className="ob-nav">
                <button className="ob-nav-btn ob-nav-btn--primary ob-nav-btn--flex" onClick={handleNext} disabled={saving}>
                    {saving ? 'Guardando…' : 'Continuar'}
                    <span className="material-symbols-rounded ob-nav-btn-icon">arrow_forward</span>
                </button>
            </div>
        </>
    );
}
