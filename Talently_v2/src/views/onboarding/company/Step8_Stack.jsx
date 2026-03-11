// Company Step 8 — Stack tecnológico (máx. 20 tecnologías)
import { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { POPULAR_TECH_FALLBACK } from '../../../lib/constants';

const MAX_TECH = 20;

export default function Step8_Stack({ data, onNext, saving }) {
    const { state } = useApp();
    const popularTech = state.referenceData.tech_stack?.length > 0
        ? state.referenceData.tech_stack.map((t) => t.name)
        : POPULAR_TECH_FALLBACK;

    const [selected, setSelected] = useState(data.company_tech_stack || []);
    const [customTech, setCustomTech] = useState('');

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
            setSelected([...selected, trimmed]);
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
            <h2 className="ob-title">Stack tecnológico</h2>
            <p className="ob-subtitle">
                Selecciona las tecnologías que usa tu equipo (máx. {MAX_TECH}).
            </p>

            <div className="ob-content">
                {/* Selected */}
                {selected.length > 0 && (
                    <div className="ob-chips">
                        {selected.map((t) => (
                            <button key={t} className="ob-chip ob-chip--selected" onClick={() => toggleTech(t)}>
                                {t} ✕
                            </button>
                        ))}
                    </div>
                )}

                <span style={{ fontSize: 12, color: selected.length >= MAX_TECH ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {selected.length} / {MAX_TECH}
                </span>

                {/* Custom input */}
                <div className="ob-field">
                    <div className="ob-input-wrapper">
                        <span className="material-symbols-rounded ob-input-icon">add</span>
                        <input
                            className="ob-input"
                            placeholder="Escribe una tecnología y presiona Enter"
                            value={customTech}
                            onChange={(e) => setCustomTech(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={selected.length >= MAX_TECH}
                        />
                    </div>
                </div>

                {/* Popular */}
                <p className="ob-label" style={{ textTransform: 'none', fontSize: 14 }}>Populares:</p>
                <div className="ob-chips">
                    {popularTech.filter((t) => !selected.includes(t)).map((t) => (
                        <button
                            key={t}
                            className="ob-chip"
                            onClick={() => toggleTech(t)}
                            disabled={selected.length >= MAX_TECH}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="ob-nav">
                <button className="ob-nav-btn ob-nav-btn--primary" onClick={handleNext} disabled={saving}>
                    {saving ? 'Guardando…' : selected.length > 0 ? 'Siguiente' : 'Omitir'}
                </button>
            </div>
        </>
    );
}
