// Step 7 — Disponibilidad (inmediato, 15 días, 1 mes, etc.)
import { useState } from 'react';
import { AVAILABILITY_OPTIONS } from '../../../lib/constants';

export default function Step7_Disponibilidad({ data, onNext, saving }) {
    const [selected, setSelected] = useState(data.availability || '');

    const handleNext = () => {
        if (!selected) return;
        onNext({ availability: selected });
    };

    return (
        <>
            {/* Título */}
            <div className="ob-step-heading">
                <h1 className="ob-step-title">
                    ¿Cuándo puedes <span className="ob-step-title-accent">empezar?</span>
                </h1>
                <p className="ob-step-subtitle">
                    Selecciona tu disponibilidad para incorporarte al nuevo puesto de trabajo.
                </p>
            </div>

            {/* Opciones radio */}
            <div className="ob-content">
                <div className="ob-radio-list">
                    {AVAILABILITY_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`ob-radio-card${selected === opt.value ? ' ob-radio-card--selected' : ''}`}
                            onClick={() => setSelected(opt.value)}
                        >
                            <span className="ob-radio-card-label">{opt.label}</span>
                            <div className="ob-radio-indicator">
                                {selected === opt.value
                                    ? <span className="material-symbols-rounded">check</span>
                                    : null
                                }
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
