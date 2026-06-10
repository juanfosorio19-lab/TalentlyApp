// Step 2 — Datos personales: nombre, cargo, país, ciudad, pretensión salarial
import { useState, useEffect } from 'react';
import { db } from '../../../lib/supabase';

export default function Step2_DatosPersonales({ data, onNext, saving }) {
    const [fullName, setFullName] = useState(data.full_name || '');
    const [headline, setHeadline] = useState(data.headline || '');
    const [country, setCountry] = useState(data.country || '');
    const [city, setCity] = useState(data.city || '');
    // salary guarda SOLO dígitos; en el input se muestra con separador de miles.
    const [salary, setSalary] = useState(String(data.salary_expectation || ''));
    const formatMiles = (digits) => (digits ? Number(digits).toLocaleString('es-CL') : '');

    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        db.reference.getCountries().then(({ data: c }) => setCountries(c || []));
    }, []);

    useEffect(() => {
        if (country) {
            const countryObj = countries.find((c) => c.name === country);
            if (countryObj) {
                db.reference.getCities(countryObj.id).then(({ data: c }) => setCities(c || []));
            }
        } else {
            setCities([]);
        }
    }, [country, countries]);

    const handleNext = () => {
        if (!fullName.trim()) { setError('Ingresa tu nombre completo'); return; }
        setError('');
        onNext({
            full_name: fullName.trim(),
            headline: headline.trim(),
            country,
            city,
            salary_expectation: salary ? Number(salary) : null,
        });
    };

    return (
        <>
            {/* Título */}
            <div className="ob-step-heading">
                <h1 className="ob-step-title">Información personal</h1>
                <p className="ob-step-subtitle">Cuéntanos quién eres. Los reclutadores lo verán.</p>
            </div>

            <div className="ob-content">

                {/* Nombre completo */}
                <div className="ob-field">
                    <label className="ob-label" htmlFor="ob-full-name">Nombre completo *</label>
                    <div className="ob-input-wrapper">
                        <span className="material-symbols-rounded ob-input-icon">person</span>
                        <input
                            id="ob-full-name"
                            name="full_name"
                            className="ob-input"
                            type="text"
                            placeholder="Ej: María González"
                            autoComplete="name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>
                </div>

                {/* Cargo */}
                <div className="ob-field">
                    <label className="ob-label" htmlFor="ob-headline">Cargo actual / deseado</label>
                    <div className="ob-input-wrapper">
                        <span className="material-symbols-rounded ob-input-icon">work</span>
                        <input
                            id="ob-headline"
                            name="headline"
                            className="ob-input"
                            type="text"
                            placeholder="Ej: Desarrolladora Full Stack"
                            value={headline}
                            onChange={(e) => setHeadline(e.target.value)}
                        />
                    </div>
                </div>

                {/* País */}
                <div className="ob-field">
                    <label className="ob-label">País</label>
                    <div className="ob-input-wrapper">
                        <span className="material-symbols-rounded ob-input-icon">public</span>
                        <select
                            className="ob-select"
                            value={country}
                            onChange={(e) => { setCountry(e.target.value); setCity(''); }}
                        >
                            <option value="">Selecciona un país</option>
                            {countries.map((c) => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Ciudad — solo si hay ciudades para el país seleccionado */}
                {cities.length > 0 && (
                    <div className="ob-field">
                        <label className="ob-label">Ciudad</label>
                        <div className="ob-input-wrapper">
                            <span className="material-symbols-rounded ob-input-icon">location_city</span>
                            <select
                                className="ob-select"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            >
                                <option value="">Selecciona una ciudad</option>
                                {cities.map((c) => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Pretensión salarial */}
                <div className="ob-field">
                    <label className="ob-label" htmlFor="ob-salary">Pretensión salarial</label>
                    <div className="ob-input-wrapper">
                        <span className="material-symbols-rounded ob-input-icon">payments</span>
                        <input
                            id="ob-salary"
                            name="salary_expectation"
                            className="ob-input"
                            type="text"
                            inputMode="numeric"
                            placeholder="Ej: 3.000"
                            value={formatMiles(salary)}
                            onChange={(e) => setSalary(e.target.value.replace(/\D/g, ''))}
                        />
                        <span className="ob-input-suffix">USD/mes</span>
                    </div>
                    <p className="ob-field-hint">Esto nos ayuda a conectarte con roles relevantes.</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="ob-error">
                        <span className="material-symbols-rounded">error</span>
                        {error}
                    </div>
                )}

            </div>

            {/* Navegación */}
            <div className="ob-nav">
                <button
                    className="ob-nav-btn ob-nav-btn--primary ob-nav-btn--flex"
                    type="button"
                    onClick={handleNext}
                    disabled={saving}
                >
                    {saving ? 'Guardando…' : 'Continuar'}
                    {!saving && (
                        <span className="material-symbols-rounded ob-nav-btn-icon">arrow_forward</span>
                    )}
                </button>
            </div>
        </>
    );
}
