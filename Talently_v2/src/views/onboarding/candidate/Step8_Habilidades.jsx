// Step 8 — Habilidades técnicas y blandas
import { useState, useEffect } from 'react';
import { db } from '../../../lib/supabase';

export default function Step8_Habilidades({ data, onNext, saving }) {
    const [selected, setSelected] = useState(data.skills || []);
    const [groups, setGroups] = useState([]); // [{ areaName, skills: [{id, name}] }]
    const [search, setSearch] = useState('');

    // Load skills for every selected professional area
    useEffect(() => {
        const areas = data.professional_areas || [];
        if (areas.length === 0) return;
        let isMounted = true;
        const load = async () => {
            try {
                const { data: allAreas } = await db.reference.getAreas();
                if (!allAreas || !isMounted) return;

                const matchedAreas = allAreas.filter((a) => areas.includes(a.name));
                if (matchedAreas.length === 0) return;

                const results = await Promise.all(
                    matchedAreas.map(async (area) => {
                        const { data: skills } = await db.reference.getSkills(area.slug);
                        return { areaName: area.name, skills: skills || [] };
                    })
                );
                if (!isMounted) return;
                setGroups(results.filter((g) => g.skills.length > 0));
            } catch {
                // silencioso
            }
        };
        load();
        return () => { isMounted = false; };
    }, [data.professional_areas]);

    const toggleSkill = (skillName) => {
        setSelected((prev) =>
            prev.includes(skillName)
                ? prev.filter((s) => s !== skillName)
                : [...prev, skillName]
        );
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmed = search.trim();
            if (!trimmed) return;
            if (!selected.includes(trimmed)) {
                setSelected((prev) => [...prev, trimmed]);
            }
            setSearch('');
        }
    };

    const addCustom = () => {
        const trimmed = search.trim();
        if (!trimmed || selected.includes(trimmed)) return;
        setSelected((prev) => [...prev, trimmed]);
        setSearch('');
    };

    const handleNext = () => {
        onNext({ skills: selected });
    };

    // Flatten all suggested skills (not already selected), filter by search
    const allSuggested = groups.flatMap((g) =>
        g.skills.map((s) => ({ ...s, areaName: g.areaName }))
    );
    const searchLower = search.toLowerCase().trim();
    const filteredGroups = searchLower
        ? (() => {
              const matched = allSuggested.filter((s) =>
                  s.name.toLowerCase().includes(searchLower) && !selected.includes(s.name)
              );
              if (matched.length === 0) return [];
              // Re-group matched results
              const map = {};
              matched.forEach((s) => {
                  if (!map[s.areaName]) map[s.areaName] = [];
                  map[s.areaName].push(s);
              });
              return Object.entries(map).map(([areaName, skills]) => ({ areaName, skills }));
          })()
        : groups.map((g) => ({
              ...g,
              skills: g.skills.filter((s) => !selected.includes(s.name)),
          })).filter((g) => g.skills.length > 0);

    // Determina si el texto del input no coincide con ninguna sugerencia (para ofrecer agregar)
    const showAddCustom =
        searchLower &&
        !selected.includes(search.trim()) &&
        !allSuggested.some((s) => s.name.toLowerCase() === searchLower);

    const hasSelected = selected.length > 0;

    return (
        <>
            {/* Título */}
            <div className="ob-step-heading">
                <h1 className="ob-step-title">
                    ¿Cuáles son tus <span className="ob-step-title-accent">habilidades?</span>
                </h1>
                <p className="ob-step-subtitle">
                    Selecciona al menos una habilidad o agrega las tuyas.
                </p>
            </div>

            {/* Buscador + agregar custom */}
            <div className="ob-field ob-field--search">
                <div className="ob-input-wrapper">
                    <span className="material-symbols-rounded ob-input-icon">search</span>
                    <input
                        className="ob-input"
                        type="text"
                        placeholder="Buscar o agregar habilidad… (Enter para añadir)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {search && (
                        <button
                            type="button"
                            className="ob-search-clear"
                            onClick={() => setSearch('')}
                            aria-label="Limpiar"
                        >
                            <span className="material-symbols-rounded">close</span>
                        </button>
                    )}
                </div>
                {showAddCustom && (
                    <button
                        type="button"
                        className="ob-skill-add-custom"
                        onClick={addCustom}
                    >
                        <span className="material-symbols-rounded">add_circle</span>
                        Agregar &ldquo;{search.trim()}&rdquo;
                    </button>
                )}
            </div>

            <div className="ob-content">

                {/* Seleccionadas */}
                {hasSelected && (
                    <div className="ob-skills-selected-section">
                        <div className="ob-skills-section-header">
                            <span className="ob-skills-section-title">Tu selección</span>
                            <span className="ob-skills-count">{selected.length}</span>
                        </div>
                        <div className="ob-chips">
                            {selected.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    className="ob-chip ob-chip--skill-selected"
                                    onClick={() => toggleSkill(s)}
                                >
                                    {s}
                                    <span className="material-symbols-rounded ob-chip-close">close</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Divisor */}
                {hasSelected && filteredGroups.length > 0 && (
                    <div className="ob-skills-divider" />
                )}

                {/* Sugerencias agrupadas por área */}
                {filteredGroups.map((group) => (
                    <div key={group.areaName} className="ob-skills-group">
                        <h4 className="ob-skills-group-title">
                            <span className="material-symbols-rounded">auto_awesome</span>
                            {group.areaName}
                        </h4>
                        <div className="ob-chips">
                            {group.skills.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    className="ob-chip ob-chip--skill-suggest"
                                    onClick={() => toggleSkill(s.name)}
                                >
                                    <span className="material-symbols-rounded ob-chip-add">add</span>
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Sin resultados de búsqueda */}
                {searchLower && filteredGroups.length === 0 && !showAddCustom && (
                    <p className="ob-areas-empty">
                        Sin resultados para &ldquo;{search}&rdquo;
                    </p>
                )}

                {/* Sin áreas seleccionadas / sin sugerencias */}
                {!searchLower && groups.length === 0 && (
                    <p className="ob-areas-empty">
                        Cargando sugerencias…
                    </p>
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
                    {saving ? 'Guardando…' : hasSelected ? 'Continuar' : 'Omitir'}
                    {!saving && hasSelected && (
                        <span className="material-symbols-rounded ob-nav-btn-icon">arrow_forward</span>
                    )}
                </button>
            </div>
        </>
    );
}
