// Company Step 4 — Valores de cultura (chips con icono, máx 5)
// El icono viene de company_culture_values.icon (Material Symbol). Ver migración 013.
import { useState, useEffect } from 'react';
import { db } from '../../../lib/supabase';

const MAX_VALUES = 5;
const FALLBACK_VALUE_ICON = 'star';

export default function Step4_Cultura({ data, onNext, saving }) {
    const [selected, setSelected] = useState(data.culture_values || []);
    const [values, setValues] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        db.reference.getCompanyCultureValues().then(({ data: v }) => setValues(v || []));
    }, []);

    const toggleValue = (name) => {
        setError('');
        setSelected((prev) => {
            if (prev.includes(name)) return prev.filter((v) => v !== name);
            if (prev.length >= MAX_VALUES) return prev;
            return [...prev, name];
        });
    };

    const handleNext = () => {
        if (selected.length === 0) { setError('Selecciona al menos un valor de cultura'); return; }
        onNext({ culture_values: selected });
    };

    const atMax = selected.length >= MAX_VALUES;

    return (
        <>
            <h2 className="ob-title">¿Qué valores definen a tu empresa?</h2>
            <p className="ob-subtitle">Ayúdanos a conectar tu empresa con el talento que comparte tus valores y visión.</p>

            <div className="ob-content">
                <div className="ob-field">
                    {/* Header con contador y límite */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                            Valores principales{' '}
                            <span style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: 13 }}>
                                (Seleccionados: {selected.length})
                            </span>
                        </span>
                        <span style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: atMax ? 'var(--danger)' : 'var(--primary)',
                            background: atMax ? 'rgba(var(--danger-rgb), 0.1)' : 'rgba(var(--primary-rgb), 0.08)',
                            padding: '4px 10px',
                            borderRadius: 8,
                        }}>
                            {atMax ? 'Máximo alcanzado' : `Hasta ${MAX_VALUES}`}
                        </span>
                    </div>

                    {/* Chips */}
                    <div className="ob-chips">
                        {values.map((v) => {
                            const isSelected = selected.includes(v.name);
                            const isDisabled = !isSelected && atMax;
                            const icon = v.icon || FALLBACK_VALUE_ICON;
                            return (
                                <button
                                    key={v.id}
                                    className={`ob-chip ob-chip--area ${isSelected ? 'ob-chip--selected' : ''}`}
                                    onClick={() => toggleValue(v.name)}
                                    disabled={isDisabled}
                                    style={isDisabled ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
                                >
                                    <span className="material-symbols-rounded" style={{ fontSize: 16 }}>{icon}</span>
                                    {v.name}
                                </button>
                            );
                        })}
                    </div>

                    {values.length === 0 && (
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Cargando valores…</p>
                    )}
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
