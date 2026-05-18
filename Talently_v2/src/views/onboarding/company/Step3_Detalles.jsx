// Company Step 3 — Detalles complementarios: descripción, tamaño, tipo, LinkedIn
import { useState } from 'react';

const EMPLOYEE_SIZES = ['1-10', '11-50', '51-200', '200+'];
const COMPANY_TYPES = ['B2B', 'B2C', 'B2B2C', 'Sin fines de lucro'];

export default function Step3_Detalles({ data, onNext, saving }) {
    const [companyDescription, setCompanyDescription] = useState(data.company_description || '');
    const [companySize, setCompanySize] = useState(data.company_size || '');
    const [companyType, setCompanyType] = useState(data.company_type || '');
    const [linkedinUrl, setLinkedinUrl] = useState(data.linkedin_url || '');
    const [error, setError] = useState('');

    const handleNext = () => {
        if (!companyDescription.trim()) { setError('Ingresa una descripción de tu empresa'); return; }
        setError('');
        onNext({
            company_description: companyDescription.trim(),
            company_size: companySize,
            company_type: companyType,
            linkedin_url: linkedinUrl.trim(),
        });
    };

    return (
        <>
            <h2 className="ob-title">Detalles de tu empresa</h2>
            <p className="ob-subtitle">Ayuda a los candidatos a conocer mejor tu organización.</p>

            <div className="ob-content">
                {/* Descripción */}
                <div className="ob-field">
                    <label className="ob-label">
                        Descripción de la empresa{' '}
                        <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div className="ob-input-wrapper" style={{ alignItems: 'flex-start' }}>
                        <span className="material-symbols-rounded ob-input-icon" style={{ marginTop: 14 }}>description</span>
                        <textarea
                            className="ob-input"
                            placeholder="Cuéntanos la misión y visión de tu empresa..."
                            value={companyDescription}
                            onChange={(e) => setCompanyDescription(e.target.value)}
                            rows={5}
                            style={{ resize: 'none', lineHeight: 1.6 }}
                        />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
                        {companyDescription.length} / 500
                    </span>
                </div>

                {/* Número de empleados */}
                <div className="ob-field">
                    <label className="ob-label">Número de empleados</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {EMPLOYEE_SIZES.map((size) => (
                            <button
                                key={size}
                                className={`ob-chip ${companySize === size ? 'ob-chip--selected' : ''}`}
                                onClick={() => setCompanySize(companySize === size ? '' : size)}
                                style={{ borderRadius: 12, padding: '12px 8px', textAlign: 'center', justifyContent: 'center' }}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tipo de empresa */}
                <div className="ob-field">
                    <label className="ob-label">Tipo de empresa</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {COMPANY_TYPES.map((type) => (
                            <button
                                key={type}
                                className={`ob-chip ${companyType === type ? 'ob-chip--selected' : ''}`}
                                onClick={() => setCompanyType(companyType === type ? '' : type)}
                                style={{ borderRadius: 12, padding: '12px 8px', textAlign: 'center', justifyContent: 'center' }}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* LinkedIn */}
                <div className="ob-field">
                    <label className="ob-label">
                        LinkedIn de la empresa{' '}
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                            (Opcional)
                        </span>
                    </label>
                    <div className="ob-input-wrapper">
                        <span className="material-symbols-rounded ob-input-icon">link</span>
                        <input
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
