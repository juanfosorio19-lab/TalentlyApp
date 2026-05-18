// Step 11 — Intereses (tags dinámicos + sugerencias desde Supabase)
import { useState, useEffect, useRef } from 'react';
import { db } from '../../../lib/supabase';

export default function Step11_Intereses({ data, onNext, saving }) {
    const [selected, setSelected] = useState(data.interests || []);
    const [suggestions, setSuggestions] = useState([]);
    const [customInterest, setCustomInterest] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        db.reference.getInterests().then(({ data: list }) => setSuggestions(list || []));
    }, []);

    const toggleInterest = (name) => {
        setSelected((prev) =>
            prev.includes(name)
                ? prev.filter((i) => i !== name)
                : [...prev, name]
        );
    };

    const addCustom = () => {
        const trimmed = customInterest.trim();
        if (!trimmed || selected.includes(trimmed)) {
            setCustomInterest('');
            return;
        }
        setSelected((prev) => [...prev, trimmed]);
        setCustomInterest('');
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addCustom(); }
    };

    const handleNext = () => {
        onNext({ interests: selected });
    };

    const hasSelected = selected.length > 0;

    // Sugerencias que aún no están seleccionadas
    const unselectedSuggestions = suggestions
        .filter((i) => !selected.includes(i.name))
        .slice(0, 24);

    return (
        <>
            {/* Título */}
            <div className="ob-step-heading">
                <h1 className="ob-step-title">
                    ¿Qué te apasiona{' '}
                    <span className="ob-step-title-accent">fuera del trabajo?</span>
                </h1>
                <span className="ob-optional-badge">Campo opcional</span>
                <p className="ob-step-subtitle">
                    Cuéntanos tus hobbies e intereses para conocerte mejor.
                </p>
            </div>

            {/* Custom input + botón Agregar */}
            <div className="ob-interest-input-row">
                <input
                    ref={inputRef}
                    className="ob-interest-input"
                    type="text"
                    placeholder="Agregar interés personalizado"
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    type="button"
                    className="ob-interest-add-btn"
                    onClick={addCustom}
                    aria-label="Agregar"
                >
                    <span className="material-symbols-rounded">add</span>
                </button>
            </div>

            <div className="ob-content">

                {/* Intereses seleccionados */}
                {hasSelected && (
                    <div className="ob-skills-selected-section">
                        <div className="ob-skills-section-header">
                            <span className="ob-skills-section-title">Intereses seleccionados</span>
                            <span className="ob-skills-count">{selected.length}</span>
                        </div>
                        <div className="ob-chips">
                            {selected.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    className="ob-chip ob-chip--skill-selected"
                                    onClick={() => toggleInterest(s)}
                                >
                                    {s}
                                    <span className="material-symbols-rounded ob-chip-close">close</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sugerencias populares (desde Supabase) */}
                {unselectedSuggestions.length > 0 && (
                    <div className="ob-skills-selected-section">
                        <div className="ob-skills-section-header">
                            <span className="ob-skills-section-title">Sugerencias populares</span>
                        </div>
                        <div className="ob-chips">
                            {unselectedSuggestions.map((i) => (
                                <button
                                    key={i.id}
                                    type="button"
                                    className="ob-chip"
                                    onClick={() => toggleInterest(i.name)}
                                >
                                    {i.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cargando sugerencias */}
                {suggestions.length === 0 && (
                    <p className="ob-areas-empty">Cargando sugerencias…</p>
                )}

            </div>

            {/* Navegación */}
            <div className="ob-nav">
                <button
                    className="ob-nav-btn ob-nav-btn--primary ob-nav-btn--flex"
                    type="button"
                    onClick={handleNext}
                    disabled={saving}
                >
                    {saving ? 'Guardando…' : hasSelected ? 'Siguiente paso' : 'Omitir'}
                    {!saving && (
                        <span className="material-symbols-rounded ob-nav-btn-icon">arrow_forward</span>
                    )}
                </button>
            </div>
        </>
    );
}
