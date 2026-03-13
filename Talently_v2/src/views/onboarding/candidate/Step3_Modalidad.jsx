// Step 3 — Modalidad de trabajo
import { useState, useEffect } from 'react';
import { db } from '../../../lib/supabase';

const FALLBACK_MODALITIES = [
    { id: 1, name: 'Remoto',     icon: 'public',     subtitle: '100% desde casa' },
    { id: 2, name: 'Híbrido',    icon: 'domain_add', subtitle: 'Oficina y casa' },
    { id: 3, name: 'Presencial', icon: 'apartment',  subtitle: 'Ir a la oficina' },
];

export default function Step3_Modalidad({ data, onNext, saving }) {
    const [selected, setSelected] = useState(data.work_modality || '');
    const [modalities, setModalities] = useState(FALLBACK_MODALITIES);

    useEffect(() => {
        db.reference.getWorkModalities().then(({ data: m }) => {
            if (m && m.length > 0) setModalities(m);
        });
    }, []);

    const getIcon = (name) => {
        const lower = (name || '').toLowerCase();
        if (lower.includes('remot')) return 'public';
        if (lower.includes('híbrid') || lower.includes('hibrid')) return 'domain_add';
        return 'apartment';
    };

    const getSubtitle = (name) => {
        const lower = (name || '').toLowerCase();
        if (lower.includes('remot')) return '100% desde casa';
        if (lower.includes('híbrid') || lower.includes('hibrid')) return 'Oficina y casa';
        return 'Ir a la oficina';
    };

    const handleNext = () => {
        if (!selected) return;
        onNext({ work_modality: selected });
    };

    return (
        <>
            {/* Título */}
            <div className="ob-step-heading">
                <h1 className="ob-step-title">¿Cómo prefieres trabajar?</h1>
                <p className="ob-step-subtitle">
                    Selecciona la modalidad que mejor se adapta a tu estilo de vida.
                </p>
            </div>

            {/* Tarjetas de modalidad */}
            <div className="ob-content">
                <div className="ob-cards">
                    {modalities.map((m) => (
                        <button
                            key={m.id || m.name}
                            className={`ob-card ob-card--rich ob-card--modality${selected === m.name ? ' ob-card--selected' : ''}`}
                            type="button"
                            onClick={() => setSelected(m.name)}
                        >
                            <div className="ob-card-icon-wrap">
                                <span className="material-symbols-rounded">
                                    {m.icon || getIcon(m.name)}
                                </span>
                            </div>
                            <div className="ob-card-body">
                                <h3 className="ob-card-body-title">{m.name}</h3>
                                <p className="ob-card-body-desc">
                                    {m.subtitle || getSubtitle(m.name)}
                                </p>
                            </div>
                            <div className="ob-modality-check">
                                <span className="material-symbols-rounded">check</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Navegación */}
            <div className="ob-nav">
                <button
                    className="ob-nav-btn ob-nav-btn--primary ob-nav-btn--flex"
                    type="button"
                    onClick={handleNext}
                    disabled={!selected || saving}
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
