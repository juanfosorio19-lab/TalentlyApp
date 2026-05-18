// Company Step 10 — Qué hace única a tu empresa (texto libre, opcional)
import { useState } from 'react';

const MAX_CHARS = 500;

export default function Step10_Unicidad({ data, onNext, saving }) {
    const [uniqueness, setUniqueness] = useState(data.company_uniqueness || '');

    const handleChange = (e) => {
        if (e.target.value.length <= MAX_CHARS) setUniqueness(e.target.value);
    };

    const handleNext = () => {
        onNext({ company_uniqueness: uniqueness.trim() });
    };

    return (
        <>
            <h2 className="ob-title">¿Qué hace única a tu empresa?</h2>
            <p className="ob-subtitle">Cuéntale a los candidatos por qué elegirte.</p>

            <div className="ob-content">
                <div className="ob-field">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <label className="ob-label" style={{ marginBottom: 0 }}>Tu propuesta de valor</label>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Campo opcional
                        </span>
                    </div>

                    <div className="ob-input-wrapper" style={{ alignItems: 'flex-start' }}>
                        <span className="material-symbols-rounded ob-input-icon" style={{ marginTop: 14 }}>
                            stars
                        </span>
                        <textarea
                            className="ob-input"
                            placeholder="Ej: Somos un equipo de 20 personas con cultura de ownership y aprendizaje constante..."
                            value={uniqueness}
                            onChange={handleChange}
                            rows={7}
                            style={{ resize: 'none', lineHeight: 1.6 }}
                        />
                    </div>

                    {/* Contador de caracteres */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                        <span style={{
                            fontSize: 12,
                            color: uniqueness.length >= MAX_CHARS ? 'var(--danger)' : 'var(--text-muted)',
                            fontWeight: 500,
                            background: 'var(--bg)',
                            padding: '2px 8px',
                            borderRadius: 6,
                        }}>
                            {uniqueness.length} / {MAX_CHARS}
                        </span>
                    </div>
                </div>

                {/* Tip card */}
                <div style={{
                    display: 'flex',
                    gap: 12,
                    padding: 16,
                    borderRadius: 14,
                    background: 'rgba(var(--primary-rgb), 0.06)',
                    border: '1px solid rgba(var(--primary-rgb), 0.15)',
                }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 22, color: 'var(--primary)', flexShrink: 0 }}>
                        lightbulb
                    </span>
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                        Las empresas que destacan su cultura y propuesta de valor reciben <strong>2x más</strong> solicitudes de candidatos de calidad.
                    </p>
                </div>
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
