// src/views/candidate/FiltersView.jsx
// Filtros de swipe para candidato: modalidad, área, país, salario, etapa empresa
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, Actions } from '../../context/AppContext';
import { WORK_MODALITIES, COMPANY_STAGES_FALLBACK } from '../../lib/constants';
import './FiltersView.css';

const MODALITIES = WORK_MODALITIES.map((m) => m.value);

const EMPTY_FILTERS = {
    modality: [],
    areas: [],
    country: null,
    salary: { min: null, max: null },
    stage: [],
};

function toggleItem(arr, item) {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export default function FiltersView() {
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const { referenceData, candidateFilters } = state;

    // Usar etapas de Supabase si están disponibles, sino constantes
    const stages = referenceData.company_stages?.length > 0
        ? referenceData.company_stages.map((s) => s.name || s)
        : COMPANY_STAGES_FALLBACK;

    const [local, setLocal] = useState({ ...candidateFilters });

    const handleApply = () => {
        dispatch({ type: Actions.SET_CANDIDATE_FILTERS, payload: local });
        navigate(-1);
    };

    const handleClear = () => {
        setLocal({ ...EMPTY_FILTERS });
    };

    const setSalary = (key, val) => {
        const parsed = val === '' ? null : parseInt(val, 10);
        setLocal((prev) => ({ ...prev, salary: { ...prev.salary, [key]: isNaN(parsed) ? null : parsed } }));
    };

    return (
        <div className="filters-view">
            <header className="filters-view__header">
                <button
                    className="filters-view__back"
                    onClick={() => navigate(-1)}
                    aria-label="Volver"
                >
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <h2 className="filters-view__title">Filtros</h2>
                <button className="filters-view__clear" onClick={handleClear}>
                    Limpiar
                </button>
            </header>

            <div className="filters-view__scroll">
                {/* ── Modalidad ── */}
                <div>
                    <p className="filters-section__label">Modalidad</p>
                    <div className="filters-chips">
                        {MODALITIES.map((m) => (
                            <button
                                key={m}
                                className={`filters-chip ${local.modality.includes(m) ? 'filters-chip--active' : ''}`}
                                onClick={() => setLocal((prev) => ({ ...prev, modality: toggleItem(prev.modality, m) }))}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Área profesional ── */}
                {referenceData.areas?.length > 0 && (
                    <div>
                        <p className="filters-section__label">Área profesional</p>
                        <div className="filters-chips">
                            {referenceData.areas.map((a) => {
                                const name = a.name || a;
                                return (
                                    <button
                                        key={name}
                                        className={`filters-chip ${local.areas.includes(name) ? 'filters-chip--active' : ''}`}
                                        onClick={() => setLocal((prev) => ({ ...prev, areas: toggleItem(prev.areas, name) }))}
                                    >
                                        {name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── País ── */}
                {referenceData.countries?.length > 0 && (
                    <div>
                        <p className="filters-section__label">País</p>
                        <select
                            className="filters-select"
                            value={local.country || ''}
                            onChange={(e) => setLocal((prev) => ({ ...prev, country: e.target.value || null }))}
                        >
                            <option value="">Todos los países</option>
                            {referenceData.countries.map((c) => {
                                const name = c.name || c;
                                return <option key={name} value={name}>{name}</option>;
                            })}
                        </select>
                    </div>
                )}

                {/* ── Rango salarial ── */}
                <div>
                    <p className="filters-section__label">Rango salarial (USD / mes)</p>
                    <div className="filters-salary-row">
                        <div className="filters-salary-field">
                            <label>Desde</label>
                            <div className="filters-salary-input-wrap">
                                <span>$</span>
                                <input
                                    type="number"
                                    className="filters-salary-input"
                                    placeholder="0"
                                    min="0"
                                    value={local.salary.min ?? ''}
                                    onChange={(e) => setSalary('min', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="filters-salary-field">
                            <label>Hasta</label>
                            <div className="filters-salary-input-wrap">
                                <span>$</span>
                                <input
                                    type="number"
                                    className="filters-salary-input"
                                    placeholder="∞"
                                    min="0"
                                    value={local.salary.max ?? ''}
                                    onChange={(e) => setSalary('max', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Etapa de empresa ── */}
                <div>
                    <p className="filters-section__label">Etapa de empresa</p>
                    <div className="filters-chips">
                        {stages.map((s) => (
                            <button
                                key={s}
                                className={`filters-chip ${local.stage.includes(s) ? 'filters-chip--active' : ''}`}
                                onClick={() => setLocal((prev) => ({ ...prev, stage: toggleItem(prev.stage, s) }))}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="filters-view__footer">
                <button className="filters-view__apply" onClick={handleApply}>
                    Aplicar filtros
                </button>
            </div>
        </div>
    );
}
