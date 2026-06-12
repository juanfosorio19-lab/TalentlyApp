// src/views/company/CreateOffer.jsx
// Wizard para crear ofertas — diseño Stitch.
// El paso de stack tecnológico SOLO aparece si el área de la oferta es TI
// (una constructora buscando arquitectos no debe responder tecnologías).
// Beneficios y proceso de selección NO se piden aquí: viven en el perfil
// de la empresa (onboarding). Decisiones del 2026-06-11.
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { POPULAR_TECH_FALLBACK, WORK_MODALITIES } from '../../lib/constants';
import { getTechAbbrev } from '../../lib/techAbbrev';
import { logError } from '../../lib/errorLogger';
import './CreateOffer.css';

// ── Constantes ─────────────────────────────────────────────────────────
const STEPS = [
    { id: 'basic',  title: 'Información básica', desc: 'Título, área, condiciones y descripción del cargo' },
    { id: 'stack',  title: 'Stack tecnológico',  desc: 'Tecnologías requeridas para el puesto' },
    { id: 'review', title: 'Vista previa',       desc: 'Revisa los detalles antes de publicar' },
];

// Áreas (por nombre en professional_areas) donde aplica pedir stack
const TECH_AREAS = ['Desarrollo', 'Data', 'Diseño UX/UI'];

// Reusa WORK_MODALITIES de constants.js — el formato canónico en BD es
// 'Remoto'/'Híbrido'/'Presencial' (sin i18n por ahora). Migración 014
// normaliza valores legacy ('remote', 'presencial', etc.) si quedaban.
const MODALITIES = WORK_MODALITIES;

const CURRENCIES = ['CLP', 'USD'];

const INITIAL_FORM = {
    title: '',
    area: '',
    description: '',
    modality: 'Remoto',
    location: '',
    currency: 'CLP',
    salary_min: '',
    salary_max: '',
    tech_stack: [],
};

const fmtMiles = (digits) => (digits ? Number(digits).toLocaleString('es-CL') : '');

function fmtSalary(min, max, currency = 'CLP') {
    if (!min && !max) return null;
    const fmt = (v) => `$${Number(v).toLocaleString('es-CL')}`;
    if (min && max) return `${fmt(min)} – ${fmt(max)} ${currency}`;
    if (min) return `Desde ${fmt(min)} ${currency}`;
    return `Hasta ${fmt(max)} ${currency}`;
}

// ── Componente ─────────────────────────────────────────────────────────
export default function CreateOffer() {
    const navigate = useNavigate();
    const { state } = useApp();

    const techList = state.referenceData?.tech_stack || [];
    const techOptions = techList.length > 0
        ? techList.map((t) => t.name)
        : POPULAR_TECH_FALLBACK;
    // Map name → abbreviation derivado del referenceData
    const techAbbrevMap = useMemo(() => {
        const m = {};
        techList.forEach((t) => { if (t.abbreviation) m[t.name] = t.abbreviation; });
        return m;
    }, [techList]);
    const getAbbrev = (name) => getTechAbbrev(name, techAbbrevMap);

    const [step, setStep]       = useState(0);
    const [form, setForm]       = useState(INITIAL_FORM);
    const [techSearch, setTechSearch] = useState('');
    const [saving, setSaving]   = useState(false);
    const [published, setPublished] = useState(false);
    const [publishError, setPublishError] = useState('');

    // Áreas profesionales — las MISMAS que eligen los candidatos, para que
    // las ofertas se puedan cruzar/filtrar por área después
    const [areas, setAreas] = useState([]);
    useEffect(() => {
        let cancelled = false;
        db.reference.getAreas().then(({ data }) => {
            if (!cancelled) setAreas(data || []);
        });
        return () => { cancelled = true; };
    }, []);

    // El paso de stack solo existe para áreas TI
    const isTechArea = TECH_AREAS.includes(form.area);
    const visibleSteps = useMemo(
        () => STEPS.filter((s) => s.id !== 'stack' || isTechArea),
        [isTechArea]
    );
    // Clamp: si el usuario cambia el área a una no-TI estando más adelante,
    // el índice no puede apuntar fuera de los pasos visibles
    const stepIndex = Math.min(step, visibleSteps.length - 1);
    const currentStep = visibleSteps[stepIndex];
    const progress = ((stepIndex + 1) / visibleSteps.length) * 100;
    const goToStepId = (id) => {
        const i = visibleSteps.findIndex((s) => s.id === id);
        setStep(i >= 0 ? i : 0);
    };

    const updateField = (field, value) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    // Salario: solo dígitos en el estado; el input muestra separador de miles
    const updateSalary = (field, raw) =>
        updateField(field, raw.replace(/\D/g, '').slice(0, 9));

    const salaryError = form.salary_min && form.salary_max
        && Number(form.salary_min) > Number(form.salary_max)
        ? 'El salario máximo debe ser mayor o igual al mínimo'
        : '';

    const toggleTech = (name) => {
        setForm((prev) => ({
            ...prev,
            tech_stack: prev.tech_stack.includes(name)
                ? prev.tech_stack.filter((t) => t !== name)
                : [...prev.tech_stack, name],
        }));
    };

    const canNext = () => {
        if (currentStep.id === 'basic') {
            return form.title.trim() !== '' && form.area !== '' && !salaryError;
        }
        return true;
    };

    const handleNext = () => {
        if (stepIndex < visibleSteps.length - 1) setStep(stepIndex + 1);
    };

    const handleBack = () => {
        if (stepIndex > 0) setStep(stepIndex - 1);
    };

    const handlePublish = async () => {
        setSaving(true);
        setPublishError('');
        try {
            // ⚠️ Solo columnas REALES de offers (ERROR_LOG #20: area/location/
            // selection_process no existen → 42703 y la oferta nunca se creaba)
            const offerData = {
                title:              form.title,
                professional_area:  form.area || null,
                description:        form.description,
                modality:           form.modality,
                city:               form.location || null,
                currency:           form.currency,
                salary_min:         form.salary_min ? Number(form.salary_min) : null,
                salary_max:         form.salary_max ? Number(form.salary_max) : null,
                tech_stack:         form.tech_stack.length > 0 ? form.tech_stack : null,
                status:             'active',
            };

            const { error } = await db.offers.create(offerData);
            if (error) {
                logError('OFFER', `publish:error ${error.message || error}`,
                    { code: error.code }, { overlay: false });
                setPublishError('No se pudo publicar la oferta. Intenta de nuevo.');
                return;
            }

            setPublished(true);
        } catch (err) {
            logError('OFFER', `publish:throw ${err?.message || err}`, null, { overlay: false });
            setPublishError('No se pudo publicar la oferta. Intenta de nuevo.');
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
                {/* Mismas áreas que eligen los candidatos → permite cruzar/filtrar.
                    Si el área es TI, el wizard agrega el paso de stack tecnológico. */}
                <select
                    id="co-area"
                    name="area"
                    className="co__input"
                    value={form.area}
                    onChange={(e) => updateField('area', e.target.value)}
                >
                    <option value="">Seleccionar área...</option>
                    {areas.map((a) => (
                        <option key={a.id} value={a.name}>{a.name}</option>
                    ))}
                </select>
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
                <label className="co__label">Rango salarial mensual <span className="co__optional">(opcional)</span></label>
                {/* Moneda */}
                <div className="co__chips" style={{ marginBottom: 10 }}>
                    {CURRENCIES.map((c) => (
                        <button
                            key={c}
                            className={`co__chip ${form.currency === c ? 'co__chip--selected' : ''}`}
                            onClick={() => updateField('currency', c)}
                        >
                            {c}
                        </button>
                    ))}
                </div>
                <div className="co__salary-row">
                    <div className="co__salary-wrap">
                        <span className="co__salary-sym">$</span>
                        <input
                            id="co-salary-min"
                            name="salary_min"
                            className="co__input co__input--salary"
                            type="text"
                            inputMode="numeric"
                            placeholder="Mínimo"
                            value={fmtMiles(form.salary_min)}
                            onChange={(e) => updateSalary('salary_min', e.target.value)}
                        />
                    </div>
                    <div className="co__salary-wrap">
                        <span className="co__salary-sym">$</span>
                        <input
                            id="co-salary-max"
                            name="salary_max"
                            className="co__input co__input--salary"
                            type="text"
                            inputMode="numeric"
                            placeholder="Máximo"
                            value={fmtMiles(form.salary_max)}
                            onChange={(e) => updateSalary('salary_max', e.target.value)}
                        />
                    </div>
                </div>
                {salaryError && <p className="co__salary-error">{salaryError}</p>}
            </div>

            {/* Ubicación (antes vivía en el paso de condiciones) */}
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
                    {fmtSalary(form.salary_min, form.salary_max, form.currency) && (
                        <div className="co__review-row">
                            <span className="co__review-row-label">Salario</span>
                            <span className="co__review-row-value co__review-row-value--salary">
                                {fmtSalary(form.salary_min, form.salary_max, form.currency)}
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
                        <button className="co__review-edit" onClick={() => goToStepId('stack')} aria-label="Editar">
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

        </>
    );

    const renderStepContent = () => {
        switch (currentStep.id) {
            case 'basic':  return renderBasic();
            case 'stack':  return renderStack();
            case 'review': return renderReview();
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
                    onClick={() => stepIndex > 0 ? handleBack() : navigate(-1)}
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
                    <p className="co__progress-step">Paso {stepIndex + 1} de {visibleSteps.length}</p>
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

            {/* Error de publicación (la oferta NO se creó) */}
            {publishError && (
                <p className="co__publish-error" role="alert">{publishError}</p>
            )}

            {/* Footer */}
            <footer className="co__footer">
                {stepIndex > 0 && (
                    <button
                        className="co__btn co__btn--secondary"
                        onClick={handleBack}
                    >
                        Anterior
                    </button>
                )}
                {stepIndex < visibleSteps.length - 1 ? (
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
