// src/views/company/CompanyFiltersView.jsx
// Filtros de swipe para empresa: modalidad, área, disponibilidad, seniority, país
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, Actions } from '../../context/AppContext';
import { WORK_MODALITIES, AVAILABILITY_OPTIONS, SENIORITY_FALLBACK } from '../../lib/constants';
import '../candidate/FiltersView.css';

const MODALITIES = WORK_MODALITIES.map((m) => m.value);
const AVAILABILITY = AVAILABILITY_OPTIONS.map((a) => a.label);

const EMPTY_FILTERS = {
    modality: [],
    areas: [],
    availability: [],
    seniority: [],
    country: null,
};

function toggleItem(arr, item) {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export default function CompanyFiltersView() {
    const navigate = useNavigate();
    const { state, dispatch } = useApp();
    const { referenceData, companyFilters } = state;

    const [local, setLocal] = useState({ ...companyFilters });

    const seniorityList = referenceData.seniority_levels?.length > 0
        ? referenceData.seniority_levels.map((s) => s.name || s)
        : SENIORITY_FALLBACK;

    const handleApply = () => {
        dispatch({ type: Actions.SET_COMPANY_FILTERS, payload: local });
        navigate(-1);
    };

    const handleClear = () => {
        setLocal({ ...EMPTY_FILTERS });
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

                {/* ── Disponibilidad ── */}
                <div>
                    <p className="filters-section__label">Disponibilidad</p>
                    <div className="filters-chips">
                        {AVAILABILITY.map((a) => (
                            <button
                                key={a}
                                className={`filters-chip ${local.availability.includes(a) ? 'filters-chip--active' : ''}`}
                                onClick={() => setLocal((prev) => ({ ...prev, availability: toggleItem(prev.availability, a) }))}
                            >
                                {a}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Seniority ── */}
                <div>
                    <p className="filters-section__label">Nivel de seniority</p>
                    <div className="filters-chips">
                        {seniorityList.map((s) => (
                            <button
                                key={s}
                                className={`filters-chip ${local.seniority.includes(s) ? 'filters-chip--active' : ''}`}
                                onClick={() => setLocal((prev) => ({ ...prev, seniority: toggleItem(prev.seniority, s) }))}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

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
            </div>

            <div className="filters-view__footer">
                <button className="filters-view__apply" onClick={handleApply}>
                    Aplicar filtros
                </button>
            </div>
        </div>
    );
}
