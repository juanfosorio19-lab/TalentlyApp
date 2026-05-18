// Company Step 6 — Modalidades de trabajo + Beneficios
import { useState, useEffect } from 'react';
import { db } from '../../../lib/supabase';

// Icono y descripción por modalidad conocida
const MODALITY_CONFIG = {
    'Remoto':       { icon: 'public',     description: 'Trabaja 100% desde cualquier lugar' },
    'Remote':       { icon: 'public',     description: 'Work from anywhere, full flexibility' },
    'Híbrido':      { icon: 'home_work',  description: 'Combinación de oficina y remoto' },
    'Hybrid':       { icon: 'home_work',  description: 'Mix of office and home days' },
    'Presencial':   { icon: 'apartment',  description: 'Colabora en persona, en la oficina' },
    'On-site':      { icon: 'apartment',  description: 'Collaborate in person daily' },
    'Flexible':     { icon: 'schedule',   description: 'Horarios y lugar a tu medida' },
};
const FALLBACK_MODALITY_ICONS = ['public', 'home_work', 'apartment', 'schedule', 'work'];

// Icono por beneficio conocido
const BENEFIT_ICONS = {
    'Seguro médico':            'medical_services',
    'Seguro de salud':          'medical_services',
    'Health Insurance':         'medical_services',
    'Dental':                   'volunteer_activism',
    'Stock Options':            'trending_up',
    'Opciones de compra':       'trending_up',
    'Plan de pensiones':        'savings',
    '401k':                     'savings',
    'Horario flexible':         'schedule',
    'Horas flexibles':          'schedule',
    'Flexible Hours':           'schedule',
    'Presupuesto formación':    'school',
    'Learning Budget':          'school',
    'Formación':                'school',
    'Comida gratis':            'restaurant',
    'Almuerzo gratis':          'restaurant',
    'Free Lunch':               'restaurant',
    'Pet friendly':             'pets',
    'Mascotas':                 'pets',
    'Gimnasio':                 'fitness_center',
    'Seguro de vida':           'shield',
    'Bonus':                    'monetization_on',
    'Vacaciones extra':         'beach_access',
    'Trabajo remoto':           'laptop_chromebook',
    'Teletrabajo':              'laptop_chromebook',
};
const FALLBACK_BENEFIT_ICONS = ['star', 'check_circle', 'favorite', 'bolt', 'eco', 'handshake'];

export default function Step6_ModalidadesBeneficios({ data, onNext, saving }) {
    const [modalities, setModalities] = useState(data.work_modalities || []);
    const [benefits, setBenefits] = useState(data.company_benefits || []);

    const [modalityOptions, setModalityOptions] = useState([]);
    const [benefitOptions, setBenefitOptions] = useState([]);

    useEffect(() => {
        db.reference.getWorkModalities().then(({ data: m }) => setModalityOptions(m || []));
        db.reference.getCompanyBenefits().then(({ data: b }) => setBenefitOptions(b || []));
    }, []);

    const toggleModality = (name) => {
        setModalities((prev) =>
            prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
        );
    };

    const toggleBenefit = (name) => {
        setBenefits((prev) =>
            prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]
        );
    };

    const handleNext = () => {
        onNext({ work_modalities: modalities, company_benefits: benefits });
    };

    return (
        <>
            <h2 className="ob-title">Modalidad y beneficios</h2>
            <p className="ob-subtitle">¿Qué ofrece tu empresa a sus colaboradores?</p>

            <div className="ob-content">
                {/* ── Sección: Modalidad de trabajo ── */}
                <div className="ob-field">
                    <label className="ob-label">Modalidad de trabajo</label>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {modalityOptions.map((m, i) => {
                            const cfg = MODALITY_CONFIG[m.name] || {
                                icon: FALLBACK_MODALITY_ICONS[i % FALLBACK_MODALITY_ICONS.length],
                                description: '',
                            };
                            const isSelected = modalities.includes(m.name);
                            return (
                                <button
                                    key={m.id || m.name}
                                    onClick={() => toggleModality(m.name)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: 16,
                                        borderRadius: 14,
                                        background: 'var(--surface)',
                                        border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                                        boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        fontFamily: 'inherit',
                                        width: '100%',
                                        textAlign: 'left',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    {/* Icon box */}
                                    <div style={{
                                        width: 44, height: 44,
                                        borderRadius: 12,
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: isSelected
                                            ? 'rgba(var(--primary-rgb), 0.12)'
                                            : 'var(--bg)',
                                        transition: 'background 0.2s ease',
                                    }}>
                                        <span
                                            className="material-symbols-rounded"
                                            style={{ fontSize: 22, color: 'var(--primary)' }}
                                        >
                                            {cfg.icon}
                                        </span>
                                    </div>

                                    {/* Text */}
                                    <div style={{ flex: 1 }}>
                                        <span style={{
                                            display: 'block',
                                            fontWeight: 700,
                                            fontSize: 15,
                                            color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                                        }}>
                                            {m.name}
                                        </span>
                                        {cfg.description && (
                                            <span style={{
                                                display: 'block',
                                                fontSize: 12,
                                                color: 'var(--text-secondary)',
                                                marginTop: 2,
                                            }}>
                                                {cfg.description}
                                            </span>
                                        )}
                                    </div>

                                    {/* Radio indicator */}
                                    <div style={{
                                        width: 22,
                                        height: 22,
                                        borderRadius: '50%',
                                        flexShrink: 0,
                                        border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                                        background: isSelected ? 'var(--primary)' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                    }}>
                                        {isSelected && (
                                            <div style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                background: 'var(--text-inverse)',
                                            }} />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                        {modalityOptions.length === 0 && (
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Cargando modalidades…</p>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: 'var(--divider)', margin: '4px 0' }} />

                {/* ── Sección: Beneficios ── */}
                <div className="ob-field">
                    <label className="ob-label">Beneficios para el equipo</label>

                    <div className="ob-chips">
                        {benefitOptions.map((b, i) => {
                            const icon = BENEFIT_ICONS[b.name] || FALLBACK_BENEFIT_ICONS[i % FALLBACK_BENEFIT_ICONS.length];
                            const isSelected = benefits.includes(b.name);
                            return (
                                <button
                                    key={b.id}
                                    className={`ob-chip ob-chip--area ${isSelected ? 'ob-chip--selected' : ''}`}
                                    onClick={() => toggleBenefit(b.name)}
                                >
                                    <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
                                        {icon}
                                    </span>
                                    {b.name}
                                </button>
                            );
                        })}
                        {benefitOptions.length === 0 && (
                            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Cargando beneficios…</p>
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
