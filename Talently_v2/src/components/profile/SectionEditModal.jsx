// src/components/profile/SectionEditModal.jsx
// Editor reutilizable para las secciones de lista del perfil candidato:
// habilidades/intereses (tags de string) y educación/experiencia/idiomas
// (listas de objetos con campos definidos).
import { useState } from 'react';
import { LANGUAGES_LIST, LANGUAGE_LEVELS } from '../../lib/constants';
import './SectionEditModal.css';

// Configuración por sección. `kind`: 'tags' (strings) | 'objects' (registros).
const SECTION_CONFIG = {
    skills: {
        title: 'Habilidades',
        kind: 'tags',
        placeholder: 'Ej: React, Python, Liderazgo…',
    },
    interests: {
        title: 'Intereses',
        kind: 'tags',
        placeholder: 'Ej: Fotografía, Running…',
    },
    languages: {
        title: 'Idiomas',
        kind: 'objects',
        addLabel: 'Agregar idioma',
        empty: { name: '', level: '' },
        summary: (it) => [it.name, it.level].filter(Boolean).join(' · '),
        fields: [
            { key: 'name',  label: 'Idioma', type: 'select', options: LANGUAGES_LIST },
            { key: 'level', label: 'Nivel',  type: 'select', options: LANGUAGE_LEVELS },
        ],
    },
    education: {
        title: 'Educación',
        kind: 'objects',
        addLabel: 'Agregar formación',
        empty: { degree: '', institution: '', year: '' },
        summary: (it) => it.degree || 'Nueva formación',
        fields: [
            { key: 'degree',      label: 'Título / Carrera', type: 'text', placeholder: 'Ej: Ingeniería Civil' },
            { key: 'institution', label: 'Institución',      type: 'text', placeholder: 'Ej: Universidad de Chile' },
            { key: 'year',        label: 'Año',              type: 'text', placeholder: 'Ej: 2020' },
        ],
    },
    experience: {
        title: 'Experiencia',
        kind: 'objects',
        addLabel: 'Agregar experiencia',
        empty: { position: '', company: '', start: '', end: '', description: '' },
        summary: (it) => it.position || 'Nueva experiencia',
        fields: [
            { key: 'position',    label: 'Cargo',       type: 'text',     placeholder: 'Ej: Frontend Developer' },
            { key: 'company',     label: 'Empresa',     type: 'text',     placeholder: 'Ej: Talently' },
            { key: 'start',       label: 'Desde',       type: 'text',     placeholder: 'Ej: Ene 2022' },
            { key: 'end',         label: 'Hasta',       type: 'text',     placeholder: 'Ej: Presente' },
            { key: 'description', label: 'Descripción', type: 'textarea', placeholder: 'Qué hiciste en el rol…' },
        ],
    },

    // ── Secciones de EMPRESA (todas listas de strings) ──
    culture_values: {
        title: 'Valores de Cultura',
        kind: 'tags',
        placeholder: 'Ej: Innovación, Trabajo en equipo…',
    },
    company_benefits: {
        title: 'Beneficios',
        kind: 'tags',
        placeholder: 'Ej: Seguro médico, Home office…',
    },
    company_tech_stack: {
        title: 'Tech Stack',
        kind: 'tags',
        placeholder: 'Ej: React, Node.js, AWS…',
    },
    company_positions: {
        title: 'Posiciones que buscas',
        kind: 'tags',
        placeholder: 'Ej: Desarrollo, Diseño UX/UI…',
    },
    seniority_levels: {
        title: 'Niveles de Seniority',
        kind: 'tags',
        placeholder: 'Ej: Senior, Semi-Senior…',
    },
    company_tags: {
        title: 'Tags',
        kind: 'tags',
        placeholder: 'Ej: Remote-first, Startup…',
    },
};

// Normaliza items entrantes a la forma que el editor espera.
function normalizeInitial(type, raw) {
    const cfg = SECTION_CONFIG[type];
    const arr = Array.isArray(raw) ? raw : [];
    if (cfg.kind === 'tags') {
        return arr.map((s) => (typeof s === 'string' ? s : s?.name || String(s))).filter(Boolean);
    }
    return arr.map((o) => ({ ...cfg.empty, ...(o || {}) }));
}

export default function SectionEditModal({ type, initialItems, onSave, onClose, saving }) {
    const cfg = SECTION_CONFIG[type];
    const [items, setItems] = useState(() => normalizeInitial(type, initialItems));
    const [tagInput, setTagInput] = useState('');

    if (!cfg) return null;

    // ── Tags (strings) ──
    const addTag = () => {
        const v = tagInput.trim();
        if (v && !items.includes(v)) setItems([...items, v]);
        setTagInput('');
    };
    const removeTag = (i) => setItems(items.filter((_, idx) => idx !== i));

    // ── Objects ──
    const addObject = () => setItems([...items, { ...cfg.empty }]);
    const removeObject = (i) => setItems(items.filter((_, idx) => idx !== i));
    const updateObject = (i, key, val) =>
        setItems(items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));

    const handleSave = () => {
        let clean;
        if (cfg.kind === 'tags') {
            clean = items.map((s) => s.trim()).filter(Boolean);
        } else {
            // descartar registros totalmente vacíos
            clean = items.filter((it) => Object.values(it).some((v) => String(v || '').trim()));
        }
        onSave(clean);
    };

    return (
        <div className="sem-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="sem-modal">
                <div className="sem-modal__header">
                    <h3 className="sem-modal__title">Editar {cfg.title}</h3>
                    <button className="sem-modal__close" onClick={onClose} aria-label="Cerrar">
                        <span className="material-symbols-rounded">close</span>
                    </button>
                </div>

                <div className="sem-modal__body">
                    {cfg.kind === 'tags' ? (
                        <>
                            <div className="sem-tags">
                                {items.length === 0 && (
                                    <p className="sem-empty">Aún no agregaste {cfg.title.toLowerCase()}.</p>
                                )}
                                {items.map((tag, i) => (
                                    <span key={`${tag}-${i}`} className="sem-tag">
                                        {tag}
                                        <button className="sem-tag__x" onClick={() => removeTag(i)} aria-label={`Quitar ${tag}`}>
                                            <span className="material-symbols-rounded">close</span>
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="sem-tag-add">
                                <input
                                    className="sem-input"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                    placeholder={cfg.placeholder}
                                />
                                <button className="sem-add-inline" onClick={addTag} disabled={!tagInput.trim()}>
                                    <span className="material-symbols-rounded">add</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {items.map((it, i) => (
                                <div key={i} className="sem-card">
                                    <div className="sem-card__head">
                                        <span className="sem-card__summary">{cfg.summary(it)}</span>
                                        <button className="sem-card__remove" onClick={() => removeObject(i)} aria-label="Quitar">
                                            <span className="material-symbols-rounded">delete</span>
                                        </button>
                                    </div>
                                    {cfg.fields.map((f) => (
                                        <div key={f.key} className="sem-field">
                                            <label className="sem-label">{f.label}</label>
                                            {f.type === 'select' ? (
                                                <select
                                                    className="sem-input"
                                                    value={it[f.key] || ''}
                                                    onChange={(e) => updateObject(i, f.key, e.target.value)}
                                                >
                                                    <option value="">Selecciona…</option>
                                                    {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            ) : f.type === 'textarea' ? (
                                                <textarea
                                                    className="sem-input"
                                                    rows={2}
                                                    value={it[f.key] || ''}
                                                    onChange={(e) => updateObject(i, f.key, e.target.value)}
                                                    placeholder={f.placeholder}
                                                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                                                />
                                            ) : (
                                                <input
                                                    className="sem-input"
                                                    type="text"
                                                    value={it[f.key] || ''}
                                                    onChange={(e) => updateObject(i, f.key, e.target.value)}
                                                    placeholder={f.placeholder}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                            <button className="sem-add" onClick={addObject}>
                                <span className="material-symbols-rounded">add_circle_outline</span>
                                {cfg.addLabel}
                            </button>
                        </>
                    )}
                </div>

                <div className="sem-modal__footer">
                    <button className="sem-cancel" onClick={onClose} disabled={saving}>Cancelar</button>
                    <button className="sem-save" onClick={handleSave} disabled={saving}>
                        {saving ? 'Guardando…' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
