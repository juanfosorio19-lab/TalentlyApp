// src/views/candidate/FiltersView.jsx
// Filtros de swipe para candidato — diseño Stitch
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

    const stages = referenceData.company_stages?.length > 0
        ? referenceData.company_stages.map((s) => s.name || s)
        : COMPANY_STAGES_FALLBACK;

    const [local, setLocal] = useState({ ...candidateFilters });

    const handleApply = () => {
        dispatch({ type: Actions.SET_CANDIDATE_FILTERS, payload: local });
        navigate(-1);
    };

    const handleClear = () => setLocal({ ...EMPTY_FILTERS });

    const setSalary = (key, val) => {
        const parsed = val === '' ? null : parseInt(val, 10);
        setLocal((prev) => ({ ...prev, salary: { ...prev.salary, [key]: isNaN(parsed) ? null : parsed } }));
    };

    const activeCount = [
        local.modality.length,
        local.areas.length,
        local.country ? 1 : 0,
        (local.salary.min || local.salary.max) ? 1 : 0,
        local.stage.length,
    ].reduce((a, b) => a + b, 0);

    return (
        <div className="fv">
            {/* Drag handle */}
            <div className="fv__drag-handle" />

            {/* ── Header ── */}
            <div className="fv__header">
                <button className="fv__close" onClick={() => navigate(-1)} aria-label="Cerrar">
                    <span className="material-symbols-rounded">close</span>
                </button>
                <h2 className="fv__title">
                    Filtros{activeCount > 0 && <span className="fv__title-badge">{activeCount}</span>}
                </h2>
                <button className="fv__reset" onClick={handleClear}>Restablecer</button>
            </div>

            {/* ── Scroll ── */}
            <div className="fv__scroll">

                {/* ── Modalidad ── */}
                <div className="fv__section">
                    <p className="fv__section-label">Modalidad de trabajo</p>
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

                {/* ── País ── */}
                {referenceData.countries?.length > 0 && (
                    <div className="fv__section">
                        <p className="fv__section-label">País</p>
                        <div className="fv__select-wrap">
                            <span className="material-symbols-rounded fv__select-icon">language</span>
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
                            <span className="material-symbols-rounded fv__select-caret">expand_more</span>
                        </div>
                    </div>
                )}

                {/* ── Rango salarial ── */}
                <div className="fv__section">
                    <p className="fv__section-label">Rango salarial (USD / mes)</p>
                    <div className="fv__salary-row">
                        <div className="fv__salary-field">
                            <label className="fv__salary-label">Mínimo</label>
                            <div className="fv__salary-input-wrap">
                                <span className="fv__salary-prefix">$</span>
                                <input
                                    type="number"
                                    className="fv__salary-input"
                                    placeholder="0"
                                    min="0"
                                    value={local.salary.min ?? ''}
                                    onChange={(e) => setSalary('min', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="fv__salary-sep">—</div>
                        <div className="fv__salary-field">
                            <label className="fv__salary-label">Máximo</label>
                            <div className="fv__salary-input-wrap">
                                <span className="fv__salary-prefix">$</span>
                                <input
                                    type="number"
                                    className="fv__salary-input"
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
                <div className="fv__section">
                    <p className="fv__section-label">Etapa de empresa</p>
                    <div className="fv__chips">
                        {stages.map((s) => (
                            <button
                                key={s}
                                className={`fv__chip ${local.stage.includes(s) ? 'fv__chip--active' : ''}`}
                                onClick={() => setLocal((prev) => ({ ...prev, stage: toggleItem(prev.stage, s) }))}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ height: 16 }} />
            </div>

            {/* ── Footer sticky ── */}
            <div className="fv__footer">
                <button className="fv__btn-clear" onClick={handleClear}>Limpiar</button>
                <button className="fv__btn-apply" onClick={handleApply}>
                    Aplicar filtros{activeCount > 0 && ` (${activeCount})`}
                </button>
            </div>
        </div>
    );
}
