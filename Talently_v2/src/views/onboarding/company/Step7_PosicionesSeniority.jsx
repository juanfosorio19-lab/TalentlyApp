// Company Step 7 — Posiciones / Departamentos + Seniority
import { useState, useEffect } from 'react';
import { db } from '../../../lib/supabase';

// Icono por departamento conocido
const POSITION_ICONS = {
    'Ingeniería':        'engineering',
    'Engineering':       'engineering',
    'Tecnología':        'computer',
    'Tech':              'computer',
    'Diseño':            'design_services',
    'Diseño de Producto':'design_services',
    'Product Design':    'design_services',
    'Producto':          'inventory',
    'Product':           'inventory',
    'Marketing':         'campaign',
    'Ventas':            'payments',
    'Sales':             'payments',
    'RRHH':              'hr_resting',
    'Recursos Humanos':  'hr_resting',
    'HR':                'hr_resting',
    'Personas':          'group',
    'Finanzas':          'finance_chip',
    'Finance':           'finance_chip',
    'Operaciones':       'settings',
    'Operations':        'settings',
    'Legal':             'gavel',
    'Datos':             'database',
    'Data':              'database',
    'Customer Success':  'support_agent',
    'Soporte':           'support_agent',
    'Comunicación':      'chat',
    'Contenido':         'edit_note',
};
const FALLBACK_POSITION_ICONS = ['engineering', 'design_services', 'campaign', 'payments', 'group', 'computer', 'settings', 'gavel'];

// Años de experiencia por nivel conocido
const SENIORITY_YEARS = {
    'Practicante':  '0-1 años',
    'Intern':       '0-1 años',
    'Junior':       '1-3 años',
    'Semi-Senior':  '3-5 años',
    'Mid-Level':    '3-5 años',
    'Senior':       '5-8 años',
    'Lead':         '8+ años',
    'Manager':      '8+ años',
    'Staff':        '8+ años',
    'Principal':    '10+ años',
    'Director':     'Estratégico',
    'Exec':         'Estratégico',
    'C-Level':      'Estratégico',
    'VP':           'Estratégico',
};

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
                        {positionOptions.map((p, i) => {
                            const icon = POSITION_ICONS[p.name] || FALLBACK_POSITION_ICONS[i % FALLBACK_POSITION_ICONS.length];
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
                            const years = SENIORITY_YEARS[s.name] || '';
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
