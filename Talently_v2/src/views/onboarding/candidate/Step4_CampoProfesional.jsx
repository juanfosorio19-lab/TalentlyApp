// Step 4 — Campo profesional (selección múltiple de áreas/roles)
import { useState, useEffect } from 'react';
import { db } from '../../../lib/supabase';

export default function Step4_CampoProfesional({ data, onNext, saving }) {
    const [selected, setSelected] = useState(data.professional_areas || []);
    const [areas, setAreas] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        db.reference.getAreas().then(({ data: a }) => setAreas(a || []));
    }, []);

    const toggleArea = (areaName) => {
        setSelected((prev) =>
            prev.includes(areaName)
                ? prev.filter((a) => a !== areaName)
                : [...prev, areaName]
        );
    };

    const handleNext = () => {
        if (selected.length === 0) return;
        onNext({ professional_areas: selected });
    };

    // Filtrar por búsqueda
    const filtered = search.trim()
        ? areas.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
        : areas;

    // Agrupar por categoría si está disponible en el objeto
    const groups = filtered.reduce((acc, area) => {
        const cat = area.category || 'Áreas';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(area);
        return acc;
    }, {});

    const groupKeys = Object.keys(groups);
    const showGroupTitles = groupKeys.length > 1;

    return (
        <>
            {/* Título */}
            <div className="ob-step-heading">
                <h1 className="ob-step-title">Encuentra tu área.</h1>
                <p className="ob-step-subtitle">
                    Selecciona los campos que te interesan. Puedes elegir varios.
                </p>
            </div>

            {/* Buscador */}
            <div className="ob-field ob-field--search">
                <div className="ob-input-wrapper">
                    <span className="material-symbols-rounded ob-input-icon">search</span>
                    <input
                        className="ob-input"
                        type="text"
                        placeholder="Buscar áreas (ej: Product Manager)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button
                            type="button"
                            className="ob-search-clear"
                            onClick={() => setSearch('')}
                            aria-label="Limpiar búsqueda"
                        >
                            <span className="material-symbols-rounded">close</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Chips agrupadas */}
            <div className="ob-content">
                {areas.length === 0 && (
                    <p className="ob-areas-empty">Cargando áreas…</p>
                )}

                {areas.length > 0 && filtered.length === 0 && (
                    <p className="ob-areas-empty">Sin resultados para &ldquo;{search}&rdquo;</p>
                )}

                {groupKeys.map((cat) => (
                    <div key={cat} className="ob-areas-group">
                        {showGroupTitles && (
                            <h3 className="ob-areas-group-title">{cat}</h3>
                        )}
                        <div className="ob-chips">
                            {groups[cat].map((area) => (
                                <button
                                    key={area.id}
                                    className={`ob-chip ob-chip--area${selected.includes(area.name) ? ' ob-chip--selected' : ''}`}
                                    type="button"
                                    onClick={() => toggleArea(area.name)}
                                >
                                    {area.name}
                                    {selected.includes(area.name) && (
                                        <span className="material-symbols-rounded ob-chip-check">check_circle</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Navegación */}
            <div className="ob-nav">
                <button
                    className="ob-nav-btn ob-nav-btn--primary ob-nav-btn--flex"
                    type="button"
                    onClick={handleNext}
                    disabled={selected.length === 0 || saving}
                >
                    {saving ? 'Guardando…' : 'Continuar'}
                    {!saving && (
                        <span className="material-symbols-rounded ob-nav-btn-icon">arrow_forward</span>
                    )}
                </button>
            </div>
        </>
    );
}
