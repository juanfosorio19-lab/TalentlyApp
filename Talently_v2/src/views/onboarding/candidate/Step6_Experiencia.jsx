// Step 6 — Experiencia laboral (posiciones con cards)
import { useState } from 'react';

export default function Step6_Experiencia({ data, onNext, saving }) {
    const [entries, setEntries] = useState(data.experience || []);
    const [showForm, setShowForm] = useState(false);
    const [formState, setFormState] = useState({ company: '', position: '', start: '', end: '', current: false });

    const addEntry = () => {
        if (!formState.company.trim() || !formState.position.trim()) return;
        // id estable para key de React (entradas legacy sin id usan fallback)
        setEntries([...entries, {
            ...formState,
            end: formState.current ? 'Actual' : formState.end,
            id: crypto.randomUUID?.() || String(Date.now()),
        }]);
        setFormState({ company: '', position: '', start: '', end: '', current: false });
        setShowForm(false);
    };

    const removeEntry = (index) => {
        setEntries(entries.filter((_, i) => i !== index));
    };

    const handleNext = () => {
        onNext({ experience: entries });
    };

    const hasEntries = entries.length > 0;

    const formatDateRange = (entry) => {
        if (!entry.start && !entry.end) return null;
        if (entry.start && entry.end) return `${entry.start} — ${entry.end}`;
        if (entry.start) return `Desde ${entry.start}`;
        return entry.end;
    };

    return (
        <>
            {/* Título */}
            <div className="ob-step-heading">
                <h1 className="ob-step-title">
                    ¿Cuál es tu <span className="ob-step-title-accent">experiencia?</span>
                </h1>
                <p className="ob-step-subtitle">
                    Agrega tus posiciones anteriores para destacar tu trayectoria.
                </p>
            </div>

            <div className="ob-content">

                {/* Entries list */}
                {entries.map((entry, i) => (
                    <div key={entry.id || `${entry.position}-${entry.company}-${i}`} className="ob-edu-card">
                        <div className="ob-edu-card-icon">
                            <span className="material-symbols-rounded">work</span>
                        </div>
                        <div className="ob-edu-card-body">
                            <h3 className="ob-edu-card-title">{entry.position}</h3>
                            <p className="ob-edu-card-sub">{entry.company}</p>
                            {formatDateRange(entry) && (
                                <p className="ob-edu-card-date">{formatDateRange(entry)}</p>
                            )}
                        </div>
                        <button
                            type="button"
                            className="ob-edu-card-remove"
                            onClick={() => removeEntry(i)}
                            aria-label="Eliminar"
                        >
                            <span className="material-symbols-rounded">close</span>
                        </button>
                    </div>
                ))}

                {/* Add form / Add button */}
                {showForm ? (
                    <div className="ob-inline-form">
                        <p className="ob-inline-form-label">Nueva experiencia</p>

                        <div className="ob-field">
                            <label className="ob-label" htmlFor="exp-company">Empresa *</label>
                            <div className="ob-input-wrapper">
                                <span className="material-symbols-rounded ob-input-icon">business</span>
                                <input
                                    id="exp-company"
                                    name="company"
                                    className="ob-input"
                                    type="text"
                                    placeholder="Ej: Google"
                                    value={formState.company}
                                    onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="ob-field">
                            <label className="ob-label" htmlFor="exp-position">Cargo *</label>
                            <div className="ob-input-wrapper">
                                <span className="material-symbols-rounded ob-input-icon">work</span>
                                <input
                                    id="exp-position"
                                    name="position"
                                    className="ob-input"
                                    type="text"
                                    placeholder="Ej: Frontend Developer"
                                    value={formState.position}
                                    onChange={(e) => setFormState({ ...formState, position: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="ob-inline-row">
                            <div className="ob-field">
                                <label className="ob-label" htmlFor="exp-start">Inicio</label>
                                <div className="ob-input-wrapper">
                                    <input
                                        id="exp-start"
                                        name="start"
                                        className="ob-input"
                                        type="month"
                                        value={formState.start}
                                        onChange={(e) => setFormState({ ...formState, start: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="ob-field">
                                <label className="ob-label" htmlFor="exp-end">Fin</label>
                                <div className="ob-input-wrapper">
                                    <input
                                        id="exp-end"
                                        name="end"
                                        className="ob-input"
                                        type="month"
                                        value={formState.end}
                                        disabled={formState.current}
                                        onChange={(e) => setFormState({ ...formState, end: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <label className="ob-checkbox-label" htmlFor="exp-current">
                            <input
                                id="exp-current"
                                name="current"
                                type="checkbox"
                                checked={formState.current}
                                onChange={(e) => setFormState({ ...formState, current: e.target.checked, end: '' })}
                            />
                            Trabajo actualmente aquí
                        </label>

                        <div className="ob-inline-actions">
                            <button
                                type="button"
                                className="ob-inline-cancel"
                                onClick={() => setShowForm(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="ob-inline-save"
                                onClick={addEntry}
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        className="ob-add-btn"
                        onClick={() => setShowForm(true)}
                    >
                        <span className="material-symbols-rounded">add_circle</span>
                        Agregar experiencia
                    </button>
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
