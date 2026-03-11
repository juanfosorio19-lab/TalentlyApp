// Step 9 — Idiomas + nivel
import { useState } from 'react';
import { LANGUAGES_LIST, LANGUAGE_LEVELS } from '../../../lib/constants';

const LEVELS = LANGUAGE_LEVELS;

export default function Step9_Idiomas({ data, onNext, saving }) {
    const [entries, setEntries] = useState(data.languages || []);
    const [showForm, setShowForm] = useState(false);
    const [formState, setFormState] = useState({ name: '', level: '' });

    const addEntry = () => {
        if (!formState.name || !formState.level) return;
        // Avoid duplicates
        if (entries.some((e) => e.name === formState.name)) return;
        setEntries([...entries, { ...formState }]);
        setFormState({ name: '', level: '' });
        setShowForm(false);
    };

    const removeEntry = (index) => {
        setEntries(entries.filter((_, i) => i !== index));
    };

    const handleNext = () => {
        onNext({ languages: entries });
    };

    return (
        <>
            <h2 className="ob-title">Idiomas</h2>
            <p className="ob-subtitle">¿Qué idiomas manejas?</p>

            <div className="ob-content">
                <div className="ob-timeline">
                    {entries.map((entry, i) => (
                        <div key={i} className="ob-timeline-item">
                            <div className="ob-timeline-dot" />
                            <div className="ob-timeline-content">
                                <span className="ob-timeline-title">{entry.name}</span>
                                <span className="ob-timeline-subtitle">{entry.level}</span>
                            </div>
                            <button className="ob-timeline-remove" onClick={() => removeEntry(i)} aria-label="Eliminar">
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>
                    ))}
                </div>

                {showForm ? (
                    <div className="ob-inline-form">
                        <div className="ob-field">
                            <label className="ob-label">Idioma</label>
                            <div className="ob-input-wrapper">
                                <select className="ob-select" value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })}>
                                    <option value="">Selecciona un idioma</option>
                                    {LANGUAGES_LIST.filter((l) => !entries.some((e) => e.name === l)).map((l) => (
                                        <option key={l} value={l}>{l}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="ob-field">
                            <label className="ob-label">Nivel</label>
                            <div className="ob-chips">
                                {LEVELS.map((lvl) => (
                                    <button
                                        key={lvl}
                                        className={`ob-chip ${formState.level === lvl ? 'ob-chip--selected' : ''}`}
                                        onClick={() => setFormState({ ...formState, level: lvl })}
                                    >
                                        {lvl}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="ob-inline-actions">
                            <button className="ob-inline-cancel" onClick={() => setShowForm(false)}>Cancelar</button>
                            <button className="ob-inline-save" onClick={addEntry}>Agregar</button>
                        </div>
                    </div>
                ) : (
                    <button className="ob-add-btn" onClick={() => setShowForm(true)}>
                        <span className="material-symbols-rounded">add</span>
                        Agregar idioma
                    </button>
                )}
            </div>

            <div className="ob-nav">
                <button className="ob-nav-btn ob-nav-btn--primary" onClick={handleNext} disabled={saving}>
                    {saving ? 'Guardando…' : entries.length > 0 ? 'Siguiente' : 'Omitir'}
                </button>
            </div>
        </>
    );
}
