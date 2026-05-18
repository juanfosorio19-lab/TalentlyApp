// Company Step 5 — Etapa y tamaño de empresa
import { useState, useEffect } from 'react';
import { db } from '../../../lib/supabase';

// Icono y descripción por etapa conocida; fallback para etapas nuevas en DB
const STAGE_CONFIG = {
    'Startup':     { icon: 'rocket_launch', description: 'Etapa temprana, buscando product-market fit.' },
    'Scale-up':    { icon: 'trending_up',   description: 'Fase de crecimiento y expansión acelerada.' },
    'Scaleup':     { icon: 'trending_up',   description: 'Fase de crecimiento y expansión acelerada.' },
    'Pyme':        { icon: 'storefront',    description: 'Empresa pequeña o mediana consolidada.' },
    'SME':         { icon: 'storefront',    description: 'Empresa pequeña o mediana consolidada.' },
    'Enterprise':  { icon: 'domain',        description: 'Gran organización con 250+ empleados.' },
    'Corporación': { icon: 'domain',        description: 'Gran organización con estructura corporativa.' },
};
const FALLBACK_STAGE_ICONS = ['rocket_launch', 'trending_up', 'storefront', 'domain', 'business'];

// Fallback estático si Supabase no devuelve rangos de tamaño
const FALLBACK_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

export default function Step5_EtapaTamano({ data, onNext, saving }) {
    const [stage, setStage] = useState(data.company_stage || '');
    const [size, setSize] = useState(data.company_size || '');
    const [stages, setStages] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        db.reference.getCompanyStages().then(({ data: s }) => setStages(s || []));
        db.reference.getCompanySizes().then(({ data: s }) =>
            setSizes(s?.length ? s : FALLBACK_SIZES.map((name, i) => ({ id: i + 1, name })))
        );
    }, []);

    const handleNext = () => {
        if (!stage) { setError('Selecciona la etapa de tu empresa'); return; }
        if (!size)  { setError('Selecciona el tamaño de tu empresa');  return; }
        setError('');
        onNext({ company_stage: stage, company_size: size });
    };

    return (
        <>
            <h2 className="ob-title">Etapa y tamaño</h2>
            <p className="ob-subtitle">¿En qué etapa está tu empresa y cuántas personas la conforman?</p>

            <div className="ob-content">
                {/* ── Etapa ── */}
                <div className="ob-field">
                    <label className="ob-label">
                        Etapa de la empresa{' '}
                        <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>

                    <div className="ob-cards--grid">
                        {stages.map((s, i) => {
                            const cfg = STAGE_CONFIG[s.name] || {
                                icon: FALLBACK_STAGE_ICONS[i % FALLBACK_STAGE_ICONS.length],
                                description: '',
                            };
                            const isSelected = stage === s.name;
                            return (
                                <button
                                    key={s.id}
                                    className={`ob-card ${isSelected ? 'ob-card--selected' : ''}`}
                                    onClick={() => { setStage(s.name); setError(''); }}
                                    style={{ alignItems: 'flex-start', position: 'relative', padding: 16, gap: 0 }}
                                >
                                    {isSelected && (
                                        <span
                                            className="material-symbols-rounded"
                                            style={{
                                                position: 'absolute', top: 10, right: 10,
                                                fontSize: 18, color: 'var(--primary)',
                                            }}
                                        >
                                            check_circle
                                        </span>
                                    )}
                                    {/* Icon box */}
                                    <div style={{
                                        width: 44, height: 44,
                                        borderRadius: 12,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: 10,
                                        background: isSelected
                                            ? 'var(--primary)'
                                            : 'rgba(var(--primary-rgb), 0.08)',
                                        transition: 'background 0.2s ease',
                                    }}>
                                        <span
                                            className="material-symbols-rounded"
                                            style={{
                                                fontSize: 22,
                                                color: isSelected ? 'var(--text-inverse)' : 'var(--primary)',
                                            }}
                                        >
                                            {cfg.icon}
                                        </span>
                                    </div>

                                    <span className="ob-card-label" style={{ textAlign: 'left', marginBottom: 4 }}>
                                        {s.name}
                                    </span>
                                    {cfg.description && (
                                        <span className="ob-card-desc" style={{ textAlign: 'left', lineHeight: 1.4 }}>
                                            {cfg.description}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {stages.length === 0 && (
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Cargando etapas…</p>
                    )}
                </div>

                {/* ── Tamaño ── */}
                <div className="ob-field">
                    <label className="ob-label">
                        Tamaño del equipo{' '}
                        <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <div className="ob-chips">
                        {sizes.map((s) => (
                            <button
                                key={s.id}
                                className={`ob-chip ${size === s.name ? 'ob-chip--selected' : ''}`}
                                onClick={() => { setSize(s.name); setError(''); }}
                            >
                                {s.name}
                            </button>
                        ))}
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
