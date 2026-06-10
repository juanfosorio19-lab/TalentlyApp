// Step 5 — Historial educativo (instituciones, títulos, años)
import { useState } from 'react';

const YEAR_OPTIONS = Array.from(
    { length: new Date().getFullYear() - 1959 + 1 },
    (_, i) => new Date().getFullYear() + 1 - i
);

// Tipos de estudio: cubre pregrado y formación continua (postgrados, cursos…).
const STUDY_TYPES = [
    'Educación media',
    'Técnico',
    'Universitario (Pregrado)',
    'Diplomado',
    'Postítulo',
    'Magíster',
    'MBA',
    'Doctorado / PhD',
    'Curso / Certificación',
];

export default function Step5_Educacion({ data, onNext, saving }) {
    const [entries, setEntries] = useState(data.education || []);
    const [showForm, setShowForm] = useState(false);
    const [formState, setFormState] = useState({ institution: '', degree: '', year: '', level: '' });

    const addEntry = () => {
        if (!formState.institution.trim() || !formState.degree.trim()) return;
        setEntries([...entries, { ...formState }]);
        setFormState({ institution: '', degree: '', year: '', level: '' });
        setShowForm(false);
    };

    const removeEntry = (index) => {
        setEntries(entries.filter((_, i) => i !== index));
    };

    const handleNext = () => {
        onNext({ education: entries });
    };

    const hasEntries = entries.length > 0;

    return (
        <>
            {/* Título */}
            <div className="ob-step-heading">
                <h1 className="ob-step-title">
                    ¿Dónde <span className="ob-step-title-accent">estudiaste?</span>
                </h1>
                <p className="ob-step-subtitle">
                    Agrega tus títulos para que los reclutadores conozcan tu formación.
                </p>
            </div>

            <div className="ob-content">

                {/* Entries list */}
                {entries.map((entry, i) => (
                    <div key={i} className="ob-edu-card">
                        <div className="ob-edu-card-icon">
                            <span className="material-symbols-rounded">school</span>
                        </div>
                        <div className="ob-edu-card-body">
                            <h3 className="ob-edu-card-title">{entry.degree}</h3>
                            <p className="ob-edu-card-sub">
                                {[entry.level, entry.institution].filter(Boolean).join(' · ')}
                            </p>
                            {entry.year && (
                                <p className="ob-edu-card-date">Egreso {entry.year}</p>
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
                        <p className="ob-inline-form-label">Nueva entrada</p>

                        <div className="ob-field">
                            <label className="ob-label">Tipo de estudio</label>
                            <div className="ob-input-wrapper">
                                <span className="material-symbols-rounded ob-input-icon">school</span>
                                <select
                                    className="ob-select"
                                    value={formState.level}
                                    onChange={(e) => setFormState({ ...formState, level: e.target.value })}
                                >
                                    <option value="">Selecciona el tipo</option>
                                    {STUDY_TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="ob-field">
                            <label className="ob-label" htmlFor="edu-degree">Título / Carrera *</label>
                            <div className="ob-input-wrapper">
                                <input
                                    id="edu-degree"
                                    name="degree"
                                    className="ob-input"
                                    type="text"
                                    placeholder="Ej: Ingeniería Civil Informática"
                                    value={formState.degree}
                                    onChange={(e) => setFormState({ ...formState, degree: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="ob-field">
                            <label className="ob-label" htmlFor="edu-institution">Institución *</label>
                            <div className="ob-input-wrapper">
                                <span className="material-symbols-rounded ob-input-icon">account_balance</span>
                                <input
                                    id="edu-institution"
                                    name="institution"
                                    className="ob-input"
                                    type="text"
                                    placeholder="Ej: Universidad de Chile"
                                    value={formState.institution}
                                    onChange={(e) => setFormState({ ...formState, institution: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="ob-field">
                            <label className="ob-label">Año de egreso</label>
                            <div className="ob-input-wrapper">
                                <span className="material-symbols-rounded ob-input-icon">calendar_today</span>
                                <select
                                    className="ob-select"
                                    value={formState.year}
                                    onChange={(e) => setFormState({ ...formState, year: e.target.value })}
                                >
                                    <option value="">Selecciona un año</option>
                                    {YEAR_OPTIONS.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

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
                        Agregar educación
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
