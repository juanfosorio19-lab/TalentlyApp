// Step 9 — Idiomas + nivel
import { useState } from 'react';
import { LANGUAGES_LIST, LANGUAGE_LEVELS } from '../../../lib/constants';

export default function Step9_Idiomas({ data, onNext, saving }) {
    const [entries, setEntries] = useState(data.languages || []);
    const [formState, setFormState] = useState({ name: '', level: '' });

    const addEntry = () => {
        if (!formState.name || !formState.level) return;
        if (entries.some((e) => e.name === formState.name)) return;
        setEntries([...entries, { ...formState }]);
        setFormState({ name: '', level: '' });
    };

    const removeEntry = (index) => {
        setEntries(entries.filter((_, i) => i !== index));
    };

    const handleNext = () => {
        onNext({ languages: entries });
    };

    const hasEntries = entries.length > 0;

    return (
        <>
            {/* Título */}
            <div className="ob-step-heading">
                <h1 className="ob-step-title">
                    ¿Qué idiomas <span className="ob-step-title-accent">manejas?</span>
                </h1>
                <p className="ob-step-subtitle">
                    Agrega los idiomas que dominas y tu nivel en cada uno.
                </p>
            </div>

            <div className="ob-content">

                {/* Formulario siempre visible */}
                <div className="ob-lang-form">
                    <div className="ob-field">
                        <label className="ob-label">Idioma</label>
                        <div className="ob-input-wrapper">
                            <span className="material-symbols-rounded ob-input-icon">language</span>
                            <select
                                className="ob-select"
                                value={formState.name}
                                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                            >
                                <option value="">Selecciona un idioma</option>
                                {LANGUAGES_LIST
                                    .filter((l) => !entries.some((e) => e.name === l))
                                    .map((l) => (
                                        <option key={l} value={l}>{l}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>

                    <div className="ob-field">
                        <label className="ob-label">Nivel</label>
                        <div className="ob-input-wrapper">
                            <span className="material-symbols-rounded ob-input-icon">signal_cellular_alt</span>
                            <select
                                className="ob-select"
                                value={formState.level}
                                onChange={(e) => setFormState({ ...formState, level: e.target.value })}
                            >
                                <option value="">Selecciona un nivel</option>
                                {LANGUAGE_LEVELS.map((lvl) => (
                                    <option key={lvl} value={lvl}>{lvl}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="ob-add-btn ob-add-btn--outlined"
                        onClick={addEntry}
                        disabled={!formState.name || !formState.level}
                    >
                        <span className="material-symbols-rounded">add</span>
                        Agregar idioma
                    </button>
                </div>

                {/* Lista de idiomas agregados */}
                {hasEntries && (
                    <div className="ob-lang-list">
                        <p className="ob-lang-list-title">Idiomas agregados</p>
                        {/* name es único (addEntry deduplica) → key estable */}
                        {entries.map((entry, i) => (
                            <div key={entry.name} className="ob-lang-item">
                                <div className="ob-lang-item-body">
                                    <span className="ob-lang-item-name">{entry.name}</span>
                                    <span className="ob-lang-item-level">{entry.level}</span>
                                </div>
                                <button
                                    type="button"
                                    className="ob-lang-item-remove"
                                    onClick={() => removeEntry(i)}
                                    aria-label="Eliminar"
                                >
                                    <span className="material-symbols-rounded">delete</span>
                                </button>
                            </div>
                        ))}
                    </div>
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
                    {saving ? 'Guardando…' : hasEntries ? 'Continuar' : 'Omitir'}
                    {!saving && hasEntries && (
                        <span className="material-symbols-rounded ob-nav-btn-icon">arrow_forward</span>
                    )}
                </button>
            </div>
        </>
    );
}
