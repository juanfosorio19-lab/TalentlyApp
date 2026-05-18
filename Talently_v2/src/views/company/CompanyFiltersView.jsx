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
        <div className="fv">
            <div className="fv__drag-handle" />
            <header className="fv__header">
                <button
                    className="fv__close"
                    onClick={() => navigate(-1)}
                    aria-label="Volver"
                >
                    <span className="material-symbols-rounded">arrow_back</span>
                </button>
                <h2 className="fv__title">Filtros</h2>
                <button className="fv__reset" onClick={handleClear}>
                    Limpiar
                </button>
            </header>

            <div className="fv__scroll">
                {/* ── Modalidad ── */}
                <div className="fv__section">
                    <p className="fv__section-label">Modalidad</p>
                    <div className="fv__chips">
                        {MODALITIES.map((m) => (
                            <button
                                key={m}
                                className={`fv__chip ${local.modality.includes(m) ? 'fv__chip--active' : ''}`}
                                onClick={() => setLocal((prev) => ({ ...prev, modality: toggleItem(prev.modality, m) }))}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Área profesional ── */}
                {referenceData.areas?.length > 0 && (
                    <div className="fv__section">
                        <p className="fv__section-label">Área profesional</p>
                        <div className="fv__chips">
                            {referenceData.areas.map((a) => {
                                const name = a.name || a;
                                return (
                                    <button
                                        key={name}
                                        className={`fv__chip ${local.areas.includes(name) ? 'fv__chip--active' : ''}`}
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
                <div className="fv__section">
                    <p className="fv__section-label">Disponibilidad</p>
                    <div className="fv__chips">
                        {AVAILABILITY.map((a) => (
                            <button
                                key={a}
                                className={`fv__chip ${local.availability.includes(a) ? 'fv__chip--active' : ''}`}
                                onClick={() => setLocal((prev) => ({ ...prev, availability: toggleItem(prev.availability, a) }))}
                            >
                                {a}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Seniority ── */}
                <div className="fv__section">
                    <p className="fv__section-label">Nivel de seniority</p>
                    <div className="fv__chips">
                        {seniorityList.map((s) => (
                            <button
                                key={s}
                                className={`fv__chip ${local.seniority.includes(s) ? 'fv__chip--active' : ''}`}
                                onClick={() => setLocal((prev) => ({ ...prev, seniority: toggleItem(prev.seniority, s) }))}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── País ── */}
                {referenceData.countries?.length > 0 && (
                    <div className="fv__section">
                        <p className="fv__section-label">País</p>
                        <select
                            className="fv__select"
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

            <div className="fv__footer">
                <button className="fv__btn-clear" onClick={handleClear}>Limpiar</button>
                <button className="fv__btn-apply" onClick={handleApply}>
                    Aplicar filtros
                </button>
            </div>
        </div>
    );
}
