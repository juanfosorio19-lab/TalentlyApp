// Company Step 7 — Posiciones / Departamentos + Seniority
// Los iconos y years_range vienen de Supabase (migracion 012):
//   company_positions.icon   → Material Symbol Rounded
//   seniority_levels.years_range → string display ("3-5 años", "Estratégico", ...)
import { useState, useEffect } from 'react';
import { db } from '../../../lib/supabase';

const FALLBACK_POSITION_ICON = 'work';

export default function Step7_PosicionesSeniority({ data, onNext, saving }) {
    const [positions, setPositions] = useState(data.company_positions || []);
    const [seniority, setSeniority] = useState(data.seniority_levels || []);

    const [positionOptions, setPositionOptions] = useState([]);
    const [seniorityOptions, setSeniorityOptions] = useState([]);

    useEffect(() => {
        db.reference.getCompanyPositions().then(({ data: p }) => setPositionOptions(p || []));
        db.reference.getSeniorityLevels().then(({ data: s }) => setSeniorityOptions(s || []));
    }, []);

    const togglePosition = (name) => {
        setPositions((prev) =>
            prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
        );
    };

    const toggleSeniority = (name) => {
        setSeniority((prev) =>
            prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
        );
    };

    const selectAllPositions = () => {
        const allNames = positionOptions.map((p) => p.name);
        const allSelected = allNames.every((n) => positions.includes(n));
        setPositions(allSelected ? [] : allNames);
    };

    const handleNext = () => {
        onNext({ company_positions: positions, seniority_levels: seniority });
    };

    return (
        <>
            <h2 className="ob-title">Necesidades de contratación</h2>
            <p className="ob-subtitle">¿Qué roles y niveles de experiencia priorizas ahora mismo?</p>

            <div className="ob-content">
                {/* ── Departamentos ── */}
                <div className="ob-field">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <label className="ob-label" style={{ marginBottom: 0 }}>Departamentos</label>
                        <button
                            onClick={selectAllPositions}
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: 'var(--primary)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                padding: '2px 6px',
                            }}
                        >
                            {positionOptions.length > 0 && positionOptions.every((p) => positions.includes(p.name))
                                ? 'Deseleccionar todo'
                                : 'Seleccionar todo'}
                        </button>
                    </div>

                    <div className="ob-chips">
                        {positionOptions.map((p) => {
                            const icon = p.icon || FALLBACK_POSITION_ICON;
                            const isSelected = positions.includes(p.name);
                            return (
                                <button
                                    key={p.id}
                                    className={`ob-chip ob-chip--area ${isSelected ? 'ob-chip--selected' : ''}`}
                                    onClick={() => togglePosition(p.name)}
                                >
                                    <span className="material-symbols-rounded" style={{ fontSize: 18 }}>{icon}</span>
                                    {p.name}
                                </button>
                            );
                        })}
                        {positionOptions.length === 0 && (
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Cargando departamentos…</p>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'var(--divider)', margin: '4px 0' }} />

                {/* ── Seniority ── */}
                <div className="ob-field">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <label className="ob-label" style={{ marginBottom: 0 }}>Nivel de seniority</label>
                        <span style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                            background: 'var(--bg)',
                            padding: '3px 8px',
                            borderRadius: 6,
                        }}>
                            Múltiples posibles
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {seniorityOptions.map((s) => {
                            const isSelected = seniority.includes(s.name);
                            const years = s.years_range || '';
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => toggleSeniority(s.name)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: 14,
                                        borderRadius: 14,
                                        background: isSelected ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--surface)',
                                        border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                                        cursor: 'pointer',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        textAlign: 'left',
                                        transition: 'all 0.2s ease',
                                        boxShadow: 'var(--shadow-sm)',
                                    }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <span style={{
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                                        }}>
                                            {s.name}
                                        </span>
                                        {years && (
                                            <span style={{
                                                fontSize: 11,
                                                color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                                                fontWeight: 500,
                                                opacity: 0.8,
                                            }}>
                                                {years}
                                            </span>
                                        )}
                                    </div>

                                    {/* Check indicator */}
                                    <div style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: isSelected ? 'var(--primary)' : 'var(--bg)',
                                        border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                                        transition: 'all 0.2s ease',
                                    }}>
                                        {isSelected && (
                                            <span className="material-symbols-rounded" style={{ fontSize: 13, color: 'white' }}>
                                                check
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                        {seniorityOptions.length === 0 && (
                            <p style={{ color: 'var(--text-muted)', fontSize: 14, gridColumn: '1 / -1' }}>
                                Cargando niveles…
                            </p>
                        )}
                    </div>
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
