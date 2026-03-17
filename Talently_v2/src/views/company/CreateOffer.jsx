// src/views/company/CreateOffer.jsx
// Wizard 4 pasos para crear ofertas — diseño Stitch
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { POPULAR_TECH_FALLBACK } from '../../lib/constants';
import './CreateOffer.css';

// ── Constantes ─────────────────────────────────────────────────────────
const STEPS = [
    { id: 'basic',      title: 'Información básica',       desc: 'Título, área y descripción del cargo' },
    { id: 'stack',      title: 'Stack tecnológico',        desc: 'Tecnologías requeridas para el puesto' },
    { id: 'conditions', title: 'Condiciones y beneficios', desc: 'Modalidad, salario y beneficios' },
    { id: 'review',     title: 'Vista previa',             desc: 'Revisa los detalles antes de publicar' },
];

const MODALITIES = [
    { value: 'remote',  label: 'Remoto' },
    { value: 'hybrid',  label: 'Híbrido' },
    { value: 'onsite',  label: 'Presencial' },
];

const TECH_ABBREV = {
    'React': 'RE', 'React Native': 'RN', 'Next.js': 'NX', 'Vue.js': 'VU',
    'Angular': 'NG', 'Svelte': 'SV', 'Node.js': 'NO', 'TypeScript': 'TS',
    'JavaScript': 'JS', 'Python': 'PY', 'Django': 'DJ', 'FastAPI': 'FA',
    'Java': 'JV', 'Spring Boot': 'SP', 'Kotlin': 'KT', 'Go': 'GO',
    'Rust': 'RS', 'Ruby': 'RB', 'Rails': 'RL', 'PHP': 'PP', 'Laravel': 'LV',
    'C#': 'C#', '.NET': 'NT', 'C++': 'C+', 'Swift': 'SW', 'Flutter': 'FL',
    'Dart': 'DT', 'AWS': 'AW', 'GCP': 'GC', 'Azure': 'AZ', 'Docker': 'DK',
    'Kubernetes': 'K8', 'Terraform': 'TF', 'PostgreSQL': 'PG', 'MongoDB': 'MG',
    'Redis': 'RD', 'MySQL': 'MY', 'GraphQL': 'GQ', 'Firebase': 'FB',
    'Supabase': 'SB',
};

const BENEFIT_ICONS = {
    'Seguro médico': 'medical_services', 'Seguro de salud': 'medical_services',
    'Dental': 'volunteer_activism', 'Stock Options': 'trending_up',
    'Opciones de compra': 'trending_up', 'Plan de pensiones': 'savings',
    'Horario flexible': 'schedule', 'Horas flexibles': 'schedule',
    'Presupuesto formación': 'school', 'Formación': 'school',
    'Comida gratis': 'restaurant', 'Almuerzo gratis': 'restaurant',
    'Pet friendly': 'pets', 'Gimnasio': 'fitness_center',
    'Seguro de vida': 'shield', 'Bonus': 'monetization_on',
    'Vacaciones extra': 'beach_access', 'Trabajo remoto': 'laptop_chromebook',
    'Teletrabajo': 'laptop_chromebook', 'Home Office': 'home_work',
};
const FALLBACK_BENEFIT_ICONS = ['star', 'check_circle', 'favorite', 'bolt', 'eco', 'handshake'];

const BENEFITS_FALLBACK = [
    'Seguro médico', 'Horario flexible', 'Home Office', 'Bonus',
    'Formación', 'Vacaciones extra', 'Gimnasio', 'Pet friendly',
];

const INITIAL_FORM = {
    title: '',
    area: '',
    description: '',
    modality: 'remote',
    location: '',
    salary_min: '',
    salary_max: '',
    tech_stack: [],
    benefits: [],
    selection_process: '',
};

function getAbbrev(name) {
    if (TECH_ABBREV[name]) return TECH_ABBREV[name];
    const clean = name.replace(/[^a-zA-Z0-9]/g, '');
    return clean.slice(0, 2).toUpperCase() || '??';
}

function fmtSalary(min, max) {
    if (!min && !max) return null;
    const fmt = (v) => `$${Number(v).toLocaleString()}`;
    if (min && max) return `${fmt(min)} – ${fmt(max)} USD`;
    if (min) return `Desde ${fmt(min)} USD`;
    return `Hasta ${fmt(max)} USD`;
}

// ── Componente ─────────────────────────────────────────────────────────
export default function CreateOffer() {
    const navigate = useNavigate();
    const { state } = useApp();

    const techOptions = state.referenceData?.tech_stack?.length > 0
        ? state.referenceData.tech_stack.map((t) => t.name)
        : POPULAR_TECH_FALLBACK;

    const benefitOptions = state.referenceData?.benefits?.length > 0
        ? state.referenceData.benefits.map((b) => b.name)
        : BENEFITS_FALLBACK;

    const [step, setStep]       = useState(0);
    const [form, setForm]       = useState(INITIAL_FORM);
    const [techSearch, setTechSearch] = useState('');
    const [saving, setSaving]   = useState(false);
    const [published, setPublished] = useState(false);

    const currentStep = STEPS[step];
    const progress = ((step + 1) / STEPS.length) * 100;

    const updateField = (field, value) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const toggleTech = (name) => {
        setForm((prev) => ({
            ...prev,
            tech_stack: prev.tech_stack.includes(name)
                ? prev.tech_stack.filter((t) => t !== name)
                : [...prev.tech_stack, name],
        }));
    };

    const toggleBenefit = (name) => {
        setForm((prev) => ({
            ...prev,
            benefits: prev.benefits.includes(name)
                ? prev.benefits.filter((b) => b !== name)
                : [...prev.benefits, name],
        }));
    };

    const canNext = () => {
        if (step === 0) return form.title.trim() !== '';
        return true;
    };

    const handleNext = () => {
        if (step < STEPS.length - 1) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const handlePublish = async () => {
        setSaving(true);
        try {
            const offerData = {
                title:              form.title,
                area:               form.area,
                description:        form.description,
                modality:           form.modality,
                location:           form.location,
                salary_min:         form.salary_min ? Number(form.salary_min) : null,
                salary_max:         form.salary_max ? Number(form.salary_max) : null,
                tech_stack:         form.tech_stack.length > 0 ? form.tech_stack : null,
                benefits:           form.benefits.length > 0 ? form.benefits : null,
                selection_process:  form.selection_process || null,
                status:             'active',
            };

            const { error } = await db.offers.create(offerData);
            if (error) {
                console.error('[CreateOffer] Error:', error);
                alert('Error al publicar la oferta');
                return;
            }

            setPublished(true);
        } catch (err) {
            console.error('[CreateOffer] Error:', err);
        } finally {
            setSaving(false);
        }
    };

    // ── Filtered tech options ──
    const filteredTech = useMemo(() => {
        const q = techSearch.trim().toLowerCase();
        if (!q) return techOptions;
        return techOptions.filter((t) => t.toLowerCase().includes(q));
    }, [techSearch, techOptions]);

    // ── Step renders ────────────────────────────────────────────────────
    const renderBasic = () => (
        <>
            <div className="co__field">
                <label className="co__label" htmlFor="co-title">Título del cargo</label>
                <input
                    id="co-title"
                    name="title"
                    className="co__input"
                    type="text"
                    placeholder="Ej: Senior Fullstack Developer"
                    value={form.title}
                    onChange={(e) => updateField('title', e.target.value)}
                />
            </div>

            <div className="co__field">
                <label className="co__label" htmlFor="co-area">Área profesional</label>
                <input
                    id="co-area"
                    name="area"
                    className="co__input"
                    type="text"
                    placeholder="Ej: Desarrollo de Software"
                    value={form.area}
                    onChange={(e) => updateField('area', e.target.value)}
                />
            </div>

            <div className="co__field">
                <label className="co__label" htmlFor="co-description">Descripción</label>
                <textarea
                    id="co-description"
                    name="description"
                    className="co__textarea"
                    placeholder="Describe las responsabilidades, requisitos y beneficios del cargo..."
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                />
            </div>

            <div className="co__field">
                <label className="co__label">Modalidad</label>
                <div className="co__chips">
                    {MODALITIES.map((m) => (
                        <button
                            key={m.value}
                            className={`co__chip ${form.modality === m.value ? 'co__chip--selected' : ''}`}
                            onClick={() => updateField('modality', m.value)}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="co__field">
                <label className="co__label">Rango salarial mensual en USD <span className="co__optional">(opcional)</span></label>
                <div className="co__salary-row">
                    <div className="co__salary-wrap">
                        <span className="co__salary-sym">$</span>
                        <input
                            id="co-salary-min"
                            name="salary_min"
                            className="co__input co__input--salary"
                            type="number"
                            placeholder="Mínimo"
                            value={form.salary_min}
                            onChange={(e) => updateField('salary_min', e.target.value)}
                        />
                    </div>
                    <div className="co__salary-wrap">
                        <span className="co__salary-sym">$</span>
                        <input
                            id="co-salary-max"
                            name="salary_max"
                            className="co__input co__input--salary"
                            type="number"
                            placeholder="Máximo"
                            value={form.salary_max}
                            onChange={(e) => updateField('salary_max', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </>
    );

    const renderStack = () => (
        <>
            {/* Search */}
            <div className="co__search-wrap">
                <span className="material-symbols-rounded co__search-icon">search</span>
                <input
                    id="co-tech-search"
                    name="tech_search"
                    className="co__search-input"
                    type="text"
                    placeholder="Buscar tecnologías (ej. React, Python...)"
                    autoComplete="off"
                    value={techSearch}
                    onChange={(e) => setTechSearch(e.target.value)}
                />
                {techSearch && (
                    <button
                        className="co__search-clear"
                        onClick={() => setTechSearch('')}
                    >
                        <span className="material-symbols-rounded">close</span>
                    </button>
                )}
            </div>

            {/* Selected chips */}
            {form.tech_stack.length > 0 && (
                <div className="co__field">
                    <p className="co__section-label">Tecnologías añadidas</p>
                    <div className="co__chips co__chips--wrap">
                        {form.tech_stack.map((t) => (
                            <button
                                key={t}
                                className="co__chip co__chip--selected co__chip--removable"
                                onClick={() => toggleTech(t)}
                            >
                                {t}
                                <span className="material-symbols-rounded co__chip-x">close</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Grid of suggestions */}
            <div className="co__field">
                <p className="co__section-label">
                    {techSearch ? 'Resultados' : 'Sugerencias populares'}
                </p>
                <div className="co__tech-grid">
                    {filteredTech.slice(0, 24).map((name) => {
                        const isSelected = form.tech_stack.includes(name);
                        return (
                            <button
                                key={name}
                                className={`co__tech-card ${isSelected ? 'co__tech-card--selected' : ''}`}
                                onClick={() => toggleTech(name)}
                            >
                                <span className="co__tech-abbrev">{getAbbrev(name)}</span>
                                <span className="co__tech-name">{name}</span>
                                <span className="material-symbols-rounded co__tech-icon">
                                    {isSelected ? 'check_circle' : 'add_circle'}
                                </span>
                            </button>
                        );
                    })}
                    {filteredTech.length === 0 && (
                        <p className="co__empty-search">No se encontraron resultados para "{techSearch}"</p>
                    )}
                </div>
            </div>

            {form.tech_stack.length > 0 && (
                <p className="co__tech-count">
                    <strong>{form.tech_stack.length}</strong> tecnología{form.tech_stack.length !== 1 ? 's' : ''} seleccionada{form.tech_stack.length !== 1 ? 's' : ''}
                </p>
            )}
        </>
    );

    const renderConditions = () => (
        <>
            {/* Ubicación */}
            <div className="co__field">
                <label className="co__label" htmlFor="co-location">Ubicación <span className="co__optional">(opcional)</span></label>
                <input
                    id="co-location"
                    name="location"
                    className="co__input"
                    type="text"
                    placeholder="Ej: Santiago, Chile / Latam / Global"
                    value={form.location}
                    onChange={(e) => updateField('location', e.target.value)}
                />
            </div>

            {/* Beneficios */}
            <div className="co__field">
                <label className="co__label">Beneficios</label>
                <div className="co__chips co__chips--wrap">
                    {benefitOptions.map((name, i) => {
                        const icon = BENEFIT_ICONS[name] || FALLBACK_BENEFIT_ICONS[i % FALLBACK_BENEFIT_ICONS.length];
                        const isSelected = form.benefits.includes(name);
                        return (
                            <button
                                key={name}
                                className={`co__chip co__chip--icon ${isSelected ? 'co__chip--selected' : ''}`}
                                onClick={() => toggleBenefit(name)}
                            >
                                <span className="material-symbols-rounded co__chip-ico">{icon}</span>
                                {name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Proceso de selección */}
            <div className="co__field">
                <label className="co__label" htmlFor="co-selection-process">
                    Proceso de selección <span className="co__optional">(opcional)</span>
                </label>
                <textarea
                    id="co-selection-process"
                    name="selection_process"
                    className="co__textarea"
                    placeholder="Describe las etapas del proceso, entrevistas, pruebas técnicas y tiempos estimados..."
                    value={form.selection_process}
                    onChange={(e) => updateField('selection_process', e.target.value)}
                />
                <div className="co__hint-box">
                    <span className="material-symbols-rounded co__hint-icon">lightbulb</span>
                    <p className="co__hint-text">
                        Un proceso claro aumenta la tasa de finalización de aplicaciones por parte de los candidatos.
                    </p>
                </div>
            </div>
        </>
    );

    const renderReview = () => (
        <>
            {/* Card básico */}
            <div className="co__review-section">
                <div className="co__review-section-header">
                    <span className="material-symbols-rounded co__review-section-icon">info</span>
                    <h3 className="co__review-section-title">Información básica</h3>
                    <button className="co__review-edit" onClick={() => setStep(0)} aria-label="Editar">
                        <span className="material-symbols-rounded">edit</span>
                    </button>
                </div>
                <div className="co__review-rows">
                    <div className="co__review-row">
                        <span className="co__review-row-label">Título del puesto</span>
                        <span className="co__review-row-value">{form.title}</span>
                    </div>
                    {form.area && (
                        <div className="co__review-row">
                            <span className="co__review-row-label">Área</span>
                            <span className="co__review-row-value">{form.area}</span>
                        </div>
                    )}
                    <div className="co__review-row">
                        <span className="co__review-row-label">Modalidad</span>
                        <span className="co__review-row-value">
                            {MODALITIES.find((m) => m.value === form.modality)?.label || form.modality}
                            {form.location ? ` — ${form.location}` : ''}
                        </span>
                    </div>
                    {fmtSalary(form.salary_min, form.salary_max) && (
                        <div className="co__review-row">
                            <span className="co__review-row-label">Salario</span>
                            <span className="co__review-row-value co__review-row-value--salary">
                                {fmtSalary(form.salary_min, form.salary_max)}
                            </span>
                        </div>
                    )}
                    {form.description && (
                        <div className="co__review-row co__review-row--block">
                            <span className="co__review-row-label">Descripción</span>
                            <p className="co__review-desc">
                                {form.description.length > 180
                                    ? form.description.slice(0, 180) + '…'
                                    : form.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Stack */}
            {form.tech_stack.length > 0 && (
                <div className="co__review-section">
                    <div className="co__review-section-header">
                        <span className="material-symbols-rounded co__review-section-icon">code</span>
                        <h3 className="co__review-section-title">Stack tecnológico</h3>
                        <button className="co__review-edit" onClick={() => setStep(1)} aria-label="Editar">
                            <span className="material-symbols-rounded">edit</span>
                        </button>
                    </div>
                    <div className="co__chips co__chips--wrap co__chips--sm">
                        {form.tech_stack.map((t) => (
                            <span key={t} className="co__chip co__chip--muted">{t}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Beneficios */}
            {form.benefits.length > 0 && (
                <div className="co__review-section">
                    <div className="co__review-section-header">
                        <span className="material-symbols-rounded co__review-section-icon">star</span>
                        <h3 className="co__review-section-title">Beneficios</h3>
                        <button className="co__review-edit" onClick={() => setStep(2)} aria-label="Editar">
                            <span className="material-symbols-rounded">edit</span>
                        </button>
                    </div>
                    <ul className="co__review-benefits">
                        {form.benefits.map((b) => (
                            <li key={b} className="co__review-benefit-item">
                                <span className="material-symbols-rounded co__check-icon">check_circle</span>
                                {b}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );

    const renderStepContent = () => {
        switch (currentStep.id) {
            case 'basic':      return renderBasic();
            case 'stack':      return renderStack();
            case 'conditions': return renderConditions();
            case 'review':     return renderReview();
            default:           return null;
        }
    };

    // ── Success modal ────────────────────────────────────────────────────
    if (published) {
        return (
            <div className="co co__success-overlay">
                <div className="co__success-modal">
                    <div className="co__success-icon-wrap">
                        <div className="co__success-ping" />
                        <span className="material-symbols-rounded co__success-check">check</span>
                    </div>
                    <h2 className="co__success-title">¡Oferta Publicada!</h2>
                    <p className="co__success-text">
                        Tu oferta ya es visible para los mejores talentos en Talently.
                    </p>
                    <div className="co__success-actions">
                        <button
                            className="co__btn co__btn--primary"
                            onClick={() => navigate('/company/dashboard')}
                        >
                            <span className="material-symbols-rounded">dashboard</span>
                            Ir al Dashboard
                        </button>
                        <button
                            className="co__btn co__btn--secondary"
                            onClick={() => {
                                setForm(INITIAL_FORM);
                                setStep(0);
                                setPublished(false);
                            }}
                        >
                            Crear otra oferta
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main wizard ──────────────────────────────────────────────────────
    return (
        <div className="co">
            {/* Header */}
            <header className="co__header">
                <button
                    className="co__back"
                    onClick={() => step > 0 ? handleBack() : navigate(-1)}
                    aria-label="Volver"
                >
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <span className="co__header-title">Nueva oferta</span>
                <div className="co__header-spacer" />
            </header>

            {/* Progress */}
            <div className="co__progress-wrap">
                <div className="co__progress-top">
                    <p className="co__progress-label">{currentStep.title}</p>
                    <p className="co__progress-step">Paso {step + 1} de {STEPS.length}</p>
                </div>
                <div className="co__progress-track">
                    <div className="co__progress-fill" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Content */}
            <div className="co__content">
                <h2 className="co__step-title">{currentStep.title}</h2>
                <p className="co__step-desc">{currentStep.desc}</p>
                {renderStepContent()}
            </div>

            {/* Footer */}
            <footer className="co__footer">
                {step > 0 && (
                    <button
                        className="co__btn co__btn--secondary"
                        onClick={handleBack}
                    >
                        Anterior
                    </button>
                )}
                {step < STEPS.length - 1 ? (
                    <button
                        className="co__btn co__btn--primary"
                        onClick={handleNext}
                        disabled={!canNext()}
                    >
                        Continuar
                    </button>
                ) : (
                    <button
                        className="co__btn co__btn--primary"
                        onClick={handlePublish}
                        disabled={saving}
                    >
                        {saving ? 'Publicando…' : 'Publicar oferta'}
                        {!saving && <span className="material-symbols-rounded">send</span>}
                    </button>
                )}
            </footer>
        </div>
    );
}
