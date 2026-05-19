// Company Step 8 — Stack tecnológico (máx. 20 tecnologías)
// Las abreviaturas vienen de tech_stack.abbreviation (ver migración 013).
import { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { POPULAR_TECH_FALLBACK } from '../../../lib/constants';
import { getTechAbbrev } from '../../../lib/techAbbrev';

const MAX_TECH = 20;

export default function Step8_Stack({ data, onNext, saving }) {
    const { state } = useApp();
    const techList = state.referenceData.tech_stack || [];
    const popularTech = techList.length > 0
        ? techList.map((t) => t.name)
        : POPULAR_TECH_FALLBACK;
    // Map name → abbreviation desde referenceData (para custom techs cae al fallback)
    const abbrevMap = useMemo(() => {
        const m = {};
        techList.forEach((t) => { if (t.abbreviation) m[t.name] = t.abbreviation; });
        return m;
    }, [techList]);
    const getAbbrev = (name) => getTechAbbrev(name, abbrevMap);

    const [selected, setSelected] = useState(data.company_tech_stack || []);
    const [customTech, setCustomTech] = useState('');

    // Items custom = seleccionados que no están en la lista popular
    const customItems = selected.filter((t) => !popularTech.includes(t));
    const atMax = selected.length >= MAX_TECH;
    const progress = Math.min((selected.length / MAX_TECH) * 100, 100);

    const toggleTech = (name) => {
        setSelected((prev) => {
            if (prev.includes(name)) return prev.filter((t) => t !== name);
            if (prev.length >= MAX_TECH) return prev;
            return [...prev, name];
        });
    };

    const addCustom = () => {
        const trimmed = customTech.trim();
        if (trimmed && !selected.includes(trimmed) && selected.length < MAX_TECH) {
            setSelected((prev) => [...prev, trimmed]);
        }
        setCustomTech('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addCustom(); }
    };

    const handleNext = () => {
        onNext({ company_tech_stack: selected });
    };

    return (
        <>
            <h2 className="ob-title">¿Qué tecnologías usa tu empresa?</h2>
            <p className="ob-subtitle">
                Selecciona las herramientas y lenguajes de tu stack principal (máx. {MAX_TECH}).
            </p>

            <div className="ob-content">
                {/* ── Grid de tecnologías ── */}
                <div className="ob-field">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <label className="ob-label" style={{ marginBottom: 0 }}>Tecnologías populares</label>
                        {atMax && (
                            <span style={{
                                fontSize: 11, fontWeight: 600,
                                color: 'var(--danger)',
                                background: 'rgba(var(--danger-rgb), 0.1)',
                                padding: '3px 8px', borderRadius: 6,
                            }}>
                                Máximo alcanzado
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {popularTech.map((name) => {
                            const isSelected = selected.includes(name);
                            const canSelect = isSelected || !atMax;
                            return (
                                <button
                                    key={name}
                                    onClick={() => toggleTech(name)}
                                    disabled={!canSelect}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: 12,
                                        borderRadius: 12,
                                        background: isSelected ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--surface)',
                                        border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                                        cursor: canSelect ? 'pointer' : 'not-allowed',
                                        opacity: !canSelect ? 0.4 : 1,
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        textAlign: 'left',
                                        transition: 'all 0.2s ease',
                                        boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                                    }}
                                >
                                    {/* Badge abreviatura */}
                                    <div style={{
                                        width: 32, height: 32,
                                        borderRadius: 8,
                                        background: isSelected ? 'var(--surface)' : 'var(--bg)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, fontSize: 11,
                                        color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                                        flexShrink: 0,
                                        boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                                        letterSpacing: 0.5,
                                    }}>
                                        {getAbbrev(name)}
                                    </div>

                                    <span style={{
                                        fontSize: 13,
                                        fontWeight: isSelected ? 700 : 500,
                                        color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                                        flex: 1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {name}
                                    </span>

                                    {isSelected && (
                                        <span
                                            className="material-symbols-rounded"
                                            style={{ fontSize: 16, color: 'var(--primary)', flexShrink: 0 }}
                                        >
                                            check_circle
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Chips custom (tecnologías añadidas manualmente) ── */}
                {customItems.length > 0 && (
                    <div className="ob-chips">
                        {customItems.map((t) => (
                            <button
                                key={t}
                                className="ob-chip ob-chip--area ob-chip--selected"
                                onClick={() => toggleTech(t)}
                            >
                                {t}
                                <span className="material-symbols-rounded" style={{ fontSize: 14 }}>close</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Input custom ── */}
                <div className="ob-field">
                    <label className="ob-label">¿No encuentras una?</label>
                    <div className="ob-input-wrapper" style={{ paddingRight: 6 }}>
                        <span className="material-symbols-rounded ob-input-icon">search</span>
                        <input
                            className="ob-input"
                            placeholder="Agregar tecnología personalizada"
                            value={customTech}
                            onChange={(e) => setCustomTech(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={atMax}
                        />
                        {customTech.trim() && (
                            <button
                                onClick={addCustom}
                                disabled={atMax}
                                style={{
                                    width: 32, height: 32, flexShrink: 0,
                                    borderRadius: 8,
                                    background: atMax ? 'var(--border)' : 'var(--primary)',
                                    color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: 'none', cursor: atMax ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.2s ease',
                                }}
                            >
                                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>add</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Contador + barra de progreso ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                        <span style={{ color: atMax ? 'var(--danger)' : 'var(--primary)', fontWeight: 700 }}>
                            {selected.length}
                        </span>
                        {' / '}{MAX_TECH} seleccionadas
                    </p>
                    <div style={{
                        width: 120, height: 6, borderRadius: 3,
                        background: 'var(--border)', overflow: 'hidden', flexShrink: 0,
                    }}>
                        <div style={{
                            width: `${progress}%`, height: '100%',
                            background: atMax ? 'var(--danger)' : 'var(--gradient-primary)',
                            borderRadius: 3,
                            transition: 'width 0.3s ease',
                        }} />
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
