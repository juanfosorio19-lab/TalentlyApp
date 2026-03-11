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
            <h2 className="ob-title">Disponibilidad</h2>
            <p className="ob-subtitle">¿Cuándo podrías comenzar un nuevo trabajo?</p>

            <div className="ob-content">
                <div className="ob-cards">
                    {AVAILABILITY_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            className={`ob-card ${selected === opt.value ? 'ob-card--selected' : ''}`}
                            onClick={() => setSelected(opt.value)}
                            style={{ flexDirection: 'row', gap: 14, padding: '16px 20px', alignItems: 'center' }}
                        >
                            <div className="ob-card-icon ob-card-icon--primary" style={{ width: 40, height: 40, borderRadius: 10 }}>
                                <span className="material-symbols-rounded" style={{ fontSize: 20 }}>{opt.icon}</span>
                            </div>
                            <span className="ob-card-label">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="ob-nav">
                <button className="ob-nav-btn ob-nav-btn--primary" onClick={handleNext} disabled={!selected || saving}>
                    {saving ? 'Guardando…' : 'Siguiente'}
                </button>
            </div>
        </>
    );
}
